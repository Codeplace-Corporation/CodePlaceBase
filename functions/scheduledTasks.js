const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Constants
const COLLECTIONS = {
  JOBS: "jobs",
  STAGED_JOBS: "staged_jobs",
  ACTIVE_JOBS: "activeJobs",
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  REPORTS: "reports"
};

const JOB_TYPES = {
  CONTRACT: "Contract",
  BOUNTY: "Bounty",
  AUCTION: "Auction",
  CHALLENGE: "Challenge"
};

const JOB_STATUS = {
  ACTIVE: "active",
  STAGED: "staged",
  EXPIRED: "expired",
  ENDING_SOON: "ending_soon",
  COMPLETED: "completed",
  BOUNTY_CLOSED: "bounty_closed",
  AUCTION_ENDED: "auction_ended",
  CHALLENGE_CLOSED: "challenge_closed"
};

// Utility functions
const createTimestamp = () => new Date().toISOString();
const createDateDaysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/**
 * Main scheduled function that runs every minute
 * Schedule can be modified using cron syntax:
 * - "every 1 minutes" - runs every minute
 * - "every 1 hours" - runs every hour
 * - "every 24 hours" - runs daily
 * - "0 /6 * * *" - runs every 6 hours (cron syntax)
 */
exports.scheduledTask = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    const taskId = context.eventId;
    const startTime = Date.now();
    
    console.log("[" + taskId + "] Scheduled task started at: " + createTimestamp());
    
    try {
      // Execute all scheduled tasks
      await executeScheduledTasks(taskId);
      
      const duration = Date.now() - startTime;
      console.log("[" + taskId + "] Scheduled task completed successfully in " + duration + "ms");
      
      return { success: true, duration, taskId };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("[" + taskId + "] Scheduled task failed after " + duration + "ms:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Log error to analytics for monitoring
      await logError(taskId, error, "scheduled_task");
      throw error;
    }
  });

/**
 * Execute all scheduled tasks in sequence
 */
async function executeScheduledTasks(taskId) {
  const tasks = [
    { name: "activateStagedJobs", fn: activateStagedJobs },
    { name: "cleanupExpiredJobs", fn: cleanupExpiredJobs },
    { name: "updateJobStatuses", fn: updateJobStatuses },
    { name: "sendScheduledNotifications", fn: sendScheduledNotifications }
  ];

  for (const task of tasks) {
    try {
      console.log("[" + taskId + "] Starting " + task.name + "...");
      await task.fn();
      console.log("[" + taskId + "] " + task.name + " completed");
    } catch (error) {
      console.error("[" + taskId + "] " + task.name + " failed:", error);
      await logError(taskId, error, task.name);
      // Continue with other tasks even if one fails
    }
  }
}

/**
 * Activate staged jobs based on their start date
 */
async function activateStagedJobs() {
  const now = new Date();
  console.log("Checking staged jobs at: " + now.toISOString());
  
  const stagedJobsRef = db.collection(COLLECTIONS.STAGED_JOBS);
  const activeJobsRef = db.collection(COLLECTIONS.ACTIVE_JOBS);
  
  const stagedJobs = await stagedJobsRef.get();
  
  if (stagedJobs.empty) {
    console.log("No staged jobs found");
    return;
  }
  
  console.log("Found " + stagedJobs.size + " staged jobs to check");
  
  const batch = db.batch();
  let activatedCount = 0;
  
  for (const doc of stagedJobs.docs) {
    const jobData = doc.data();
    const startDate = getJobStartDate(jobData);
    
    if (startDate && startDate <= now) {
      const activeJobRef = activeJobsRef.doc();
      const activeJobData = createActiveJobData(jobData, doc.id, now);
      
      batch.set(activeJobRef, activeJobData);
      batch.delete(doc.ref);
      
      activatedCount++;
      console.log("Queued for activation: " + doc.id + " (" + jobData.selectedJobPostType + ")");
    }
  }
  
  if (activatedCount > 0) {
    await batch.commit();
    console.log("Successfully activated " + activatedCount + " staged jobs");
  } else {
    console.log("No staged jobs ready for activation");
  }
}

/**
 * Get start date for a job based on its type
 */
function getJobStartDate(jobData) {
  const jobType = jobData.selectedJobPostType;
  
  switch (jobType) {
    case JOB_TYPES.BOUNTY:
      return createBountyStartDate(jobData);
    case JOB_TYPES.AUCTION:
      return createAuctionStartDate(jobData);
    case JOB_TYPES.CONTRACT:
      return jobData.applicationsOpenTime ? new Date(jobData.applicationsOpenTime) : null;
    case JOB_TYPES.CHALLENGE:
      return jobData.challengeStartTime ? new Date(jobData.challengeStartTime) : null;
    default:
      console.warn("Unknown job type: " + jobType);
      return null;
  }
}

/**
 * Create start date for bounty jobs
 */
function createBountyStartDate(jobData) {
  if (!jobData.bountyStartDate || !jobData.bountyStartTime) {
    return null;
  }
  
  const [hours, minutes] = jobData.bountyStartTime.split(':');
  const startDate = new Date(jobData.bountyStartDate);
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return startDate;
}

/**
 * Create start date for auction jobs
 */
function createAuctionStartDate(jobData) {
  // If auctionStartTime is already a full ISO string, use it directly
  if (jobData.auctionStartTime && jobData.auctionStartTime.includes('T')) {
    return new Date(jobData.auctionStartTime);
  }
  
  // If we have separate date and time fields, combine them
  if (jobData.auctionStartTime && jobData.StartTime) {
    const [hours, minutes] = jobData.StartTime.split(':');
    const startDate = new Date(jobData.auctionStartTime);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return startDate;
  }
  
  // If no start time is specified, start immediately
  if (!jobData.auctionStartTime) {
    return new Date(); // Start immediately
  }
  
  return null;
}

/**
 * Create active job data from staged job
 */
function createActiveJobData(jobData, originalId, activationTime) {
  return {
    ...jobData, // Copy ALL job data
    status: JOB_STATUS.ACTIVE,
    activatedAt: activationTime.toISOString(),
    jobId: originalId,
    originalStagedJobId: originalId,
    activationReason: "Automatically activated from staged job",
    lastUpdated: activationTime.toISOString()
  };
}

/**
 * Clean up expired jobs
 */
async function cleanupExpiredJobs() {
  const now = new Date();
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  
  const expiredJobs = await jobsRef
    .where("status", "==", JOB_STATUS.ACTIVE)
    .where("Deadline", "<=", now.toISOString())
    .get();
  
  if (expiredJobs.empty) {
    console.log("No expired jobs found");
    return;
  }
  
  const batch = db.batch();
  
  expiredJobs.forEach((doc) => {
    const jobData = doc.data();
    const newStatus = getExpiredJobStatus(jobData.selectedJobPostType);
    
    batch.update(doc.ref, {
      status: newStatus,
      expiredAt: now.toISOString(),
      lastUpdated: now.toISOString()
    });
  });
  
  await batch.commit();
  console.log("Cleaned up " + expiredJobs.size + " expired jobs");
}

/**
 * Get appropriate status for expired job based on type
 */
function getExpiredJobStatus(jobType) {
  switch (jobType) {
    case JOB_TYPES.BOUNTY:
      return JOB_STATUS.BOUNTY_CLOSED;
    case JOB_TYPES.AUCTION:
      return JOB_STATUS.AUCTION_ENDED;
    case JOB_TYPES.CHALLENGE:
      return JOB_STATUS.CHALLENGE_CLOSED;
    default:
      return JOB_STATUS.EXPIRED;
  }
}

/**
 * Update job statuses based on time remaining
 */
async function updateJobStatuses() {
  const now = new Date();
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  
  const activeJobs = await jobsRef
    .where("status", "==", JOB_STATUS.ACTIVE)
    .get();
  
  if (activeJobs.empty) {
    console.log("No active jobs found for status update");
    return;
  }
  
  const batch = db.batch();
  let updatedCount = 0;
  
  activeJobs.forEach((doc) => {
    const jobData = doc.data();
    
    if (jobData.Deadline && isJobEndingSoon(jobData.Deadline, now)) {
      batch.update(doc.ref, {
        status: JOB_STATUS.ENDING_SOON,
        lastUpdated: now.toISOString()
      });
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    await batch.commit();
    console.log("Updated " + updatedCount + " jobs to ending soon status");
  } else {
    console.log("No jobs need status updates");
  }
}

/**
 * Check if job is ending soon (within 24 hours)
 */
function isJobEndingSoon(deadline, now) {
  const deadlineDate = new Date(deadline);
  const timeUntilExpiry = deadlineDate.getTime() - now.getTime();
  const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
  
  return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
}

/**
 * Send scheduled notifications
 */
async function sendScheduledNotifications() {
  const now = new Date();
  const notificationsRef = db.collection(COLLECTIONS.NOTIFICATIONS);
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  
  const endingSoonJobs = await jobsRef
    .where("status", "==", JOB_STATUS.ENDING_SOON)
    .get();
  
  if (endingSoonJobs.empty) {
    console.log("No ending soon jobs found for notifications");
    return;
  }
  
  const batch = db.batch();
  let notificationCount = 0;
  
  endingSoonJobs.forEach((doc) => {
    const jobData = doc.data();
    
    if (jobData.createdBy) {
      const notificationRef = notificationsRef.doc();
      const notificationData = createEndingSoonNotification(jobData, doc.id, now);
      
      batch.set(notificationRef, notificationData);
      notificationCount++;
    }
  });
  
  if (notificationCount > 0) {
    await batch.commit();
    console.log("Sent " + notificationCount + " ending soon notifications");
  } else {
    console.log("No notifications to send");
  }
}

/**
 * Create ending soon notification data
 */
function createEndingSoonNotification(jobData, jobId, timestamp) {
  return {
    userId: jobData.createdBy,
    type: "job_ending_soon",
    title: "Job Ending Soon",
    message: "Your " + jobData.selectedJobPostType + " job \"" + jobData.projectTitle + "\" is ending soon.",
    jobId,
    createdAt: timestamp.toISOString(),
    read: false
  };
}

/**
 * Daily analytics task (runs at midnight every day)
 */
exports.dailyAnalytics = functions.pubsub
  .schedule("0 0 * * *")
  .onRun(async (context) => {
    const taskId = context.eventId;
    const startTime = Date.now();
    
    console.log("[" + taskId + "] Daily analytics task started");
    
    try {
      await Promise.all([
        generateDailyStats(),
        cleanupOldData()
      ]);
      
      const duration = Date.now() - startTime;
      console.log("[" + taskId + "] Daily analytics completed in " + duration + "ms");
      
      return { success: true, duration, taskId };
    } catch (error) {
      console.error("[" + taskId + "] Daily analytics failed:", error);
      await logError(taskId, error, "daily_analytics");
      throw error;
    }
  });

/**
 * Generate daily statistics
 */
async function generateDailyStats() {
  const now = new Date();
  const yesterday = createDateDaysAgo(1);
  
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  const statsRef = db.collection(COLLECTIONS.ANALYTICS);
  
  const [newJobs, completedJobs, totalActiveJobs] = await Promise.all([
    jobsRef.where("createdAt", ">=", yesterday.toISOString()).get(),
    jobsRef
      .where("status", "in", [
        JOB_STATUS.COMPLETED,
        JOB_STATUS.BOUNTY_CLOSED,
        JOB_STATUS.AUCTION_ENDED,
        JOB_STATUS.CHALLENGE_CLOSED
      ])
      .where("lastUpdated", ">=", yesterday.toISOString())
      .get(),
    jobsRef.where("status", "==", JOB_STATUS.ACTIVE).get()
  ]);
  
  const statsData = {
    date: yesterday.toISOString().split('T')[0],
    newJobs: newJobs.size,
    completedJobs: completedJobs.size,
    totalActiveJobs: totalActiveJobs.size,
    createdAt: now.toISOString()
  };
  
  await statsRef.add(statsData);
  console.log("Generated daily analytics", statsData);
}

/**
 * Clean up old data
 */
async function cleanupOldData() {
  const thirtyDaysAgo = createDateDaysAgo(30);
  const notificationsRef = db.collection(COLLECTIONS.NOTIFICATIONS);
  
  const oldNotifications = await notificationsRef
    .where("createdAt", "<=", thirtyDaysAgo.toISOString())
    .where("read", "==", true)
    .get();
  
  if (oldNotifications.empty) {
    console.log("No old notifications to clean up");
    return;
  }
  
  const batch = db.batch();
  oldNotifications.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log("Cleaned up " + oldNotifications.size + " old notifications");
}

/**
 * Weekly maintenance task (runs every Sunday at 2 AM)
 */
exports.weeklyMaintenance = functions.pubsub
  .schedule("0 2 * * 0")
  .onRun(async (context) => {
    const taskId = context.eventId;
    const startTime = Date.now();
    
    console.log("[" + taskId + "] Weekly maintenance task started");
    
    try {
      await Promise.all([
        performDatabaseMaintenance(),
        generateWeeklyReport()
      ]);
      
      const duration = Date.now() - startTime;
      console.log("[" + taskId + "] Weekly maintenance completed in " + duration + "ms");
      
      return { success: true, duration, taskId };
    } catch (error) {
      console.error("[" + taskId + "] Weekly maintenance failed:", error);
      await logError(taskId, error, "weekly_maintenance");
      throw error;
    }
  });

/**
 * Perform database maintenance
 */
async function performDatabaseMaintenance() {
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  const activeJobs = await jobsRef.where("status", "==", JOB_STATUS.ACTIVE).get();
  
  if (activeJobs.empty) {
    console.log("No active jobs for maintenance");
    return;
  }
  
  const batch = db.batch();
  let updatedCount = 0;
  
  activeJobs.forEach((doc) => {
    const jobData = doc.data();
    
    if (jobData.currentAttempts && Array.isArray(jobData.currentAttempts)) {
      batch.update(doc.ref, {
        applicationCount: jobData.currentAttempts.length,
        lastUpdated: createTimestamp()
      });
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    await batch.commit();
    console.log("Updated application counts for " + updatedCount + " jobs");
  } else {
    console.log("No jobs needed application count updates");
  }
}

/**
 * Generate weekly report
 */
async function generateWeeklyReport() {
  const now = new Date();
  const weekAgo = createDateDaysAgo(7);
  
  const jobsRef = db.collection(COLLECTIONS.JOBS);
  const weeklyJobs = await jobsRef
    .where("createdAt", ">=", weekAgo.toISOString())
    .get();
  
  const report = {
    weekStart: weekAgo.toISOString(),
    weekEnd: now.toISOString(),
    totalJobsCreated: weeklyJobs.size,
    jobTypes: {
      [JOB_TYPES.CONTRACT]: 0,
      [JOB_TYPES.BOUNTY]: 0,
      [JOB_TYPES.AUCTION]: 0,
      [JOB_TYPES.CHALLENGE]: 0
    },
    createdAt: now.toISOString()
  };
  
  weeklyJobs.forEach((doc) => {
    const jobData = doc.data();
    const jobType = jobData.selectedJobPostType;
    
    if (jobType && report.jobTypes.hasOwnProperty(jobType)) {
      report.jobTypes[jobType]++;
    }
  });
  
  await db.collection(COLLECTIONS.REPORTS).add(report);
  console.log("Weekly report generated", report);
}

/**
 * Log error to analytics collection
 */
async function logError(taskId, error, functionName) {
  try {
    await db.collection("errors").add({
      taskId,
      functionName,
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      timestamp: createTimestamp()
    });
  } catch (logError) {
    console.error("Failed to log error to database:", logError);
  }
}

/**
 * Test function for manual staged job activation
 */
exports.testActivateStagedJobs = functions.https.onRequest(async (req, res) => {
  const testId = "test-" + Date.now();
  
  try {
    console.log("[" + testId + "] Manual test of staged job activation started");
    
    await activateStagedJobs();
    
    console.log("[" + testId + "] Manual test completed successfully");
    
    res.json({
      success: true,
      message: "Staged job activation test completed successfully",
      testId,
      timestamp: createTimestamp()
    });
  } catch (error) {
    console.error("[" + testId + "] Manual test failed:", error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      testId,
      timestamp: createTimestamp()
    });
  }
});

/**
 * Manual activation function - call this when a job is staged or edited
 * This provides immediate activation instead of waiting for the scheduled task
 */
exports.manualActivateStagedJobs = functions.https.onRequest(async (req, res) => {
  const taskId = "manual-" + Date.now();
  
  try {
    console.log("[" + taskId + "] Manual activation triggered");
    
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    await activateStagedJobs();
    
    console.log("[" + taskId + "] Manual activation completed successfully");
    
    res.json({
      success: true,
      message: "Manual staged job activation completed",
      taskId,
      timestamp: createTimestamp()
    });
  } catch (error) {
    console.error("[" + taskId + "] Manual activation failed:", error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      taskId,
      timestamp: createTimestamp()
    });
  }
});

/**
 * Health check endpoint
 */
exports.healthCheck = functions.https.onRequest(async (req, res) => {
  try {
    // Basic database connectivity check
    await db.collection("health").doc("check").set({
      timestamp: createTimestamp(),
      status: "healthy"
    });
    
    res.json({
      status: "healthy",
      timestamp: createTimestamp(),
      version: "2.0.0"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: createTimestamp()
    });
  }
}); 