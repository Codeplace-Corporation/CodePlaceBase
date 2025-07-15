import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrosshairs,
  faClock,
  faCalendarAlt,
  faUser,
  faTag,
  faTools,
  faArrowLeft,
  faHeart as faHeartSolid,
  faFileText,
  faTrophy,
  faDownload,
  faFile,
  faImage,
  faVideo,
  faArchive,
  faChartLine,
  faChevronUp,
  faChevronDown,
  faMedal,
  faLock,
  faFolder,
  faFolderOpen,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileCode,
  faDollarSign,
  faShieldAlt,
  faBullseye,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../../utils/firebase';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal';

interface JobData {
  id: string;
  projectTitle: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: string;
  compensation: string | number;
  estimatedProjectLength: string;
  eprojectlength?: string;
  projectDescription: string;
  projectOverview?: string;
  bountyEndTime?: string;
  bountyStartDate?: string;
  bountyStartTime?: string;
  bountyExpiryTime?: string;
  bountyDeadline?: string;
  StartDate?: string;
  StartTime?: string;
  Deadline?: string;
  ExpiryTime?: string;
  Amount?: string | number;
  bountyAmount?: string | number;
  createdAt?: any;
  createdBy?: string;
  createdByEmail?: string;
  createdByDisplayName?: string;
  requirements?: string[];
  deliverables?: string[];
  skills?: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  remote?: boolean;
  experienceLevel?: string;
  applicationCount?: number;
  status?: string;
  category?: string;
  bountyType?: string;
  submissionDeadline?: string;
  judgingCriteria?: string[];
  prizes?: Array<{
    place: number;
    amount: number;
    description?: string;
  }>;
  submissionCount?: number;
  projectFiles?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  currentAttempts?: Array<{
    name: string;
    avatar: string;
    score?: number;
    status: string;
    submittedAt: string;
  }>;
  JobSubType?: string;
  [key: string]: any;
}

interface UserProfile {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  location?: string;
  bio?: string;
  photoURL?: string;
  clientRating?: number;
  projectsPosted?: number;
  totalSpent?: number;
  averageProjectValue?: number;
  verificationStatus?: string;
  responseTime?: string;
}

interface BountyJobDetailsProps {
  job: JobData;
  onBack: () => void;
}

interface AttemptData {
  name: string;
  avatar: string;
  score?: number;
  status: string;
  submittedAt: string;
}

interface SortConfig {
  key: 'score' | 'time' | null;
  direction: 'asc' | 'desc';
}

interface SortableDeveloperListProps {
  mockAttempts: AttemptData[];
  getTimeAgo: (dateString: string) => string;
  handleAttemptBounty: () => void;
}

const SortableDeveloperList: React.FC<SortableDeveloperListProps> = ({ 
  mockAttempts, 
  getTimeAgo, 
  handleAttemptBounty 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'desc'
  });

  const getSortedAttempts = (): AttemptData[] => {
    if (!sortConfig.key) return mockAttempts;
    return [...mockAttempts].sort((a, b) => {
      let aValue: number, bValue: number;
      if (sortConfig.key === 'score') {
        aValue = a.score || 0;
        bValue = b.score || 0;
      } else if (sortConfig.key === 'time') {
        aValue = new Date(a.submittedAt).getTime();
        bValue = new Date(b.submittedAt).getTime();
      } else {
        return 0;
      }
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (key: 'score' | 'time'): void => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: 'score' | 'time') => {
    if (sortConfig.key !== key) {
      return {
        icon: faChevronUp,
        className: "text-white/30 hover:text-white/60 transition-all duration-300 transform rotate-0"
      };
    }
    return {
      icon: faChevronUp,
      className: sortConfig.direction === 'desc' 
        ? "text-purple-400 transform scale-110 rotate-0 transition-all duration-300" 
        : "text-purple-400 transform scale-110 rotate-180 transition-all duration-300"
    };
  };

  const sortedAttempts = getSortedAttempts();

  return (
    <div className={`bg-[rgba(255,255,255,0.05)] rounded-lg p-4 pl-1 pr-2 pt-0 mt-4`}>
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-lg font-bold flex items-center mt-2 gap-2">
          <FontAwesomeIcon icon={faUser} className="text-purple-400 text-sm " />
          Developers Attempting
        </h3>
        <span className="text-xs text-white/80 bg-purple-500/20 px-2 py-1 rounded-full mt-3 font-semibold">
          {mockAttempts.length} Active
        </span>
      </div>
      <div className={`flex items-center px-3 pt-2 mb-0 mt-0 ${mockAttempts.length === 0 ? 'opacity-50' : ''}`}>
        <div className="text-xs font-semibold text-white/70 flex-1">Developer</div>
        <div className="text-xs font-semibold text-white/70 w-16 ml-1 flex items-center justify-start gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'score' ? 'text-purple-400' : 'text-white/70'
            }`}
          >
            Score
          </span>
          <button
            onClick={() => handleSort('score')}
            className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10"
          >
            <FontAwesomeIcon 
              icon={getSortIcon('score').icon}
              className={`text-[0.6rem] ${getSortIcon('score').className}`}
            />
          </button>
        </div>
        <div className="text-xs font-semibold text-white/70 w-20 flex items-center justify-start gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'time' ? 'text-purple-400' : 'text-white/70'
            }`}
          >
            Start Time
          </span>
          <button
            onClick={() => handleSort('time')}
            className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10"
          >
            <FontAwesomeIcon 
              icon={getSortIcon('time').icon}
              className={`text-[0.6rem] ${getSortIcon('time').className}`}
            />
          </button>
        </div>
      </div>
      <div className="bg-gray-800/30 rounded-lg p-1 min-h-[140px] flex items-center justify-center">
        {mockAttempts.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/60 text-base font-medium">No developers attempting</span>
          </div>
        ) : (
          <div className="space-y-1 w-full">
            {sortedAttempts.map((attempt: AttemptData, index: number) => (
              <div 
                key={`${attempt.name}-${index}`} 
                className="flex items-center pl-1 pr-1 hover:bg-white/5 rounded-[1rem] transition-all duration-200 bg-black/40 hover:border-purple-500/30"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: sortConfig.key ? 'fadeInSlide 0.3s ease-out forwards' : 'none'
                }}
              >
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <img 
                    src={attempt.avatar} 
                    alt={attempt.name}
                    className="w-3.5 h-3.5 rounded-full bg-gray-600 border border-purple-500/30 flex-shrink-0"
                  />
                  <h4 className="font-medium text-white text-[0.65rem] truncate">{attempt.name}</h4>
                </div>
                <div className="w-16 -mr-2">
                  <span 
                    className={`font-semibold text-[0.65rem] transition-all duration-200 ${
                      sortConfig.key === 'score' ? 'text-purple-300 transform scale-105' : 'text-purple-300'
                    }`}
                  >
                    {attempt.score}
                  </span>
                </div>
                <div className="w-20 ">
                  <span 
                    className={`text-[0.65rem] transition-all duration-200 ${
                      sortConfig.key === 'time' ? 'text-white transform scale-105' : 'text-white/80'
                    } ml-2`}
                  >
                    {getTimeAgo(attempt.submittedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const BountyJobDetails: React.FC<BountyJobDetailsProps> = ({ job, onBack }) => {
  console.log('🎯 BountyJobDetails rendered with job:', job);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const { currentUser } = useAuth();

  const handleFavoriteClick = (): void => {
    setIsFavorite(!isFavorite);
  };

  const handleAttemptBounty = async (): Promise<void> => {
    if (!currentUser?.uid) {
      alert('You must be logged in to attempt a bounty.');
      return;
    }

    try {
      // Add user to bounty attempts
      const bountyRef = doc(firestore, 'activeJobs', job.id);
      const bountyDoc = await getDoc(bountyRef);
      
      if (bountyDoc.exists()) {
        const currentAttempts = bountyDoc.data().currentAttempts || [];
        const userAlreadyAttempted = currentAttempts.some((attempt: any) => attempt.userId === currentUser.uid);
        
        if (userAlreadyAttempted) {
          alert('You have already attempted this bounty.');
          return;
        }

        const newAttempt = {
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          userAvatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          status: 'Interested',
          submittedAt: new Date().toISOString(),
          score: 0
        };

        await updateDoc(bountyRef, {
          currentAttempts: [...currentAttempts, newAttempt],
          submissionCount: (bountyDoc.data().submissionCount || 0) + 1
        });

        // Update user profile
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(userRef, {
          attemptedBounties: arrayUnion({
            bountyId: job.id,
            bountyTitle: job.projectTitle,
            status: 'Interested',
            attemptedAt: serverTimestamp()
          }),
          lastBountyAttempted: serverTimestamp()
        }, { merge: true });

        setShowJoinModal(true);
      }
    } catch (error) {
      console.error('Error attempting bounty:', error);
      alert('Error attempting bounty. Please try again.');
    }
  };

  const formatCompensation = (compensation: string | number | undefined): string => {
    console.log('🔍 formatCompensation Debug:', {
      compensation,
      type: typeof compensation,
      jobAmount: job.Amount,
      jobBountyAmount: job.bountyAmount,
      jobCompensation: job.compensation
    });
    
    // Handle undefined or null values
    if (compensation === undefined || compensation === null) {
      return '0.00';
    }
    
    if (typeof compensation === 'number') {
      return compensation.toFixed(2);
    }
    
    if (typeof compensation === 'string') {
      const amount = parseFloat(compensation.replace(/[^0-9.-]+/g, ""));
      return isNaN(amount) ? '0.00' : amount.toFixed(2);
    }
    
    return '0.00';
  };

  const formatProjectLength = (length: string): string => {
    const lengthMap: { [key: string]: string } = {
      "<1-hour": "Less than 1 hour",
      "1-3-hours": "1-3 hours",
      "3-6-hours": "3-6 hours",
      "6-12-hours": "6-12 hours",
      "1-day": "1 day",
      "2-days": "2 days",
      "3-5-days": "3-5 days",
      "1-week": "1 week",
      "2-weeks": "2 weeks",
      "1-month": "1 month",
      "1-2-months": "1-2 months",
      "3-5-months": "3-5 months",
      "6-months-plus": "6+ months",
    };
    return lengthMap[length] || length || "Not specified";
  };

  const getTimeRemaining = (): string | null => {
    const { Deadline, ExpiryTime, bountyEndTime, bountyDeadline, bountyExpiryTime } = job;
    
    console.log('🔍 getTimeRemaining Debug:', {
      Deadline,
      ExpiryTime,
      bountyEndTime,
      bountyDeadline,
      bountyExpiryTime,
      jobKeys: Object.keys(job)
    });
    
    // Handle case where bountyEndTime is a full date-time string
    if (bountyEndTime && bountyEndTime.includes('T')) {
      console.log('📅 Using combined bountyEndTime:', bountyEndTime);
      const deadline = new Date(bountyEndTime);
      const now = new Date();

      console.log('📊 Date objects:', {
        deadline: deadline.toString(),
        deadlineTime: deadline.getTime(),
        now: now.toString(),
        isValid: !isNaN(deadline.getTime())
      });

      if (isNaN(deadline.getTime())) {
        console.error('❌ Invalid date from bountyEndTime:', bountyEndTime);
        return null;
      }

      const diff = deadline.getTime() - now.getTime();
      console.log('⏱️ Time difference (ms):', diff);

      if (diff <= 0) return "Bounty Closed";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      let result = '';
      if (days > 0) result += `${days}d `;
      if (hours > 0 || days > 0) result += `${hours}h `;
      result += `${minutes}m remaining`;

      console.log('🎯 Final result:', result);
      return result;
    }
    
    // Handle separate date and time fields - try multiple field combinations
    const endDate = Deadline || bountyDeadline;
    const endTime = ExpiryTime || bountyExpiryTime;
    
    if (!endDate || !endTime) {
      console.log('❌ Missing date or time:', { endDate, endTime });
      return null;
    }

    // Convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12: string) => {
      console.log('🕐 Converting time:', time12);
      
      if (!time12 || time12 === '--:-- PM') {
        console.log('⚠️ Using default time 09:00');
        return '09:00';
      }
      
      const [time, modifier] = time12.split(' ');
      console.log('📝 Parsed time parts:', { time, modifier });
      
      let [hours, minutes] = time.split(':');
      console.log('⏰ Hours and minutes:', { hours, minutes });
      
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      const result = `${hours.padStart(2, '0')}:${minutes}`;
      console.log('✅ Converted to 24-hour:', result);
      return result;
    };

    // Combine into full date-time string with converted time
    const time24 = convertTo24Hour(endTime);
    const deadlineString = `${endDate}T${time24}:00`;
    
    console.log('📅 Final date string:', deadlineString);
    
    const deadline = new Date(deadlineString);
    const now = new Date();

    console.log('📊 Date objects:', {
      deadline: deadline.toString(),
      deadlineTime: deadline.getTime(),
      now: now.toString(),
      isValid: !isNaN(deadline.getTime())
    });

    // Check if date is valid
    if (isNaN(deadline.getTime())) {
      console.error('❌ Invalid date created from:', { 
        endDate, 
        endTime, 
        time24, 
        deadlineString,
        deadline: deadline.toString()
      });
      return null;
    }

    const diff = deadline.getTime() - now.getTime();
    console.log('⏱️ Time difference (ms):', diff);
    
    if (diff <= 0) return "Bounty Closed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m remaining`;

    console.log('🎯 Final result:', result);
    return result;
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown";
    
    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBountySubtype = (): string => {
    return job.JobSubType || job.bountyType || 'Bounty';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return faImage;
    if (fileType.includes('video')) return faVideo;
    if (fileType.includes('pdf')) return faFilePdf;
    if (fileType.includes('word')) return faFileWord;
    if (fileType.includes('excel')) return faFileExcel;
    if (fileType.includes('code') || fileType.includes('text')) return faFileCode;
    return faFile;
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (months > 0) return `${months}mo ago`;
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Fetch client profile from Firestore
  useEffect(() => {
    const fetchClientProfile = async () => {
      if (!currentUser?.uid) {
        setLoadingClient(false);
        return;
      }
      try {
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setClientProfile(userData);
        }
      } catch (error) {
        console.error("Error fetching client profile:", error);
      } finally {
        setLoadingClient(false);
      }
    };
    fetchClientProfile();
  }, [currentUser]);

  const getClientDisplayName = (): string => {
    if (clientProfile) {
      if (clientProfile.displayName) {
        return clientProfile.displayName;
      } else if (clientProfile.firstName && clientProfile.lastName) {
        return `${clientProfile.firstName} ${clientProfile.lastName}`;
      } else if (clientProfile.firstName) {
        return clientProfile.firstName;
      }
    }
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email;
    return currentUser?.uid || 'Unknown Client';
  };

  const getCreatedAtString = () => {
    if (job.createdAt) {
      return formatDate(job.createdAt);
    }
    return formatDate(new Date());
  };

  // Developer Score Calculation Function (same as ChallengeJobDetails)
  const getRecommendedDeveloperScore = (jobData: JobData): number => {
    const complexityBaseScores: { [key: string]: number } = {
      'easy': 1000,
      'simple': 1000,
      'moderate': 1400,
      'medium': 1400,
      'complex': 1800,
      'hard': 1800,
      'expert': 2200,
    };

    const getCompensationAdjustment = (compensation: string | number): number => {
      const numericCompensation = typeof compensation === 'number' 
        ? compensation 
        : parseFloat(String(compensation).replace(/[^0-9.-]+/g, "")) || 0;
      return Math.log10(numericCompensation + 1) * 100;
    };

    // Use difficulty if set, otherwise use complexityLevel, otherwise 'simple'
    const difficultyOrComplexity = (jobData.difficulty || jobData.complexityLevel || 'simple').toLowerCase();
    const finalCompensation = jobData.compensation || 0;
    const base = complexityBaseScores[difficultyOrComplexity] || complexityBaseScores['simple'];
    const adjustment = getCompensationAdjustment(finalCompensation);
    return Math.round(base + adjustment);
  };

  // Calculate the recommended score
  const recommendedScore = getRecommendedDeveloperScore(job);

  // Function to get developer score color based on value (same as ChallengeJobDetails)
  const getDeveloperScoreColor = (score: number) => {
    if (score >= 900) return 'text-green-400';
    if (score >= 700) return 'text-yellow-400';
    if (score >= 500) return 'text-orange-400';
    return 'text-red-400';
  };

  const mockAttempts: AttemptData[] = (typeof job.currentAttempts !== 'undefined')
    ? job.currentAttempts
    : [
      {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b74bb76d?w=40&h=40&fit=crop&crop=face",
        score: 850,
        status: "active",
        submittedAt: "2025-01-28T10:30:00Z"
      },
      {
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        score: 720,
        status: "active",
        submittedAt: "2025-01-29T14:15:00Z"
      },
      {
        name: "Emma Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
        score: 630,
        status: "active",
        submittedAt: "2025-01-30T08:45:00Z"
      },
      {
        name: "Marcus Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
        score: 590,
        status: "active",
        submittedAt: "2025-01-30T12:20:00Z"
      },
      {
        name: "Lisa Park",
        avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
        score: 470,
        status: "active",
        submittedAt: "2025-01-30T15:10:00Z"
      }
    ];

  const mockProjectFiles = job.projectFiles || [
    {
      name: "project_requirements.pdf",
      type: "document",
      size: "2.4 MB",
      url: "#"
    },
    {
      name: "design_mockups.zip",
      type: "archive",
      size: "15.7 MB",
      url: "#"
    },
    {
      name: "reference_images.zip",
      type: "archive",
      size: "8.2 MB",
      url: "#"
    },
    {
      name: "brand_guidelines.pdf",
      type: "document",
      size: "1.8 MB",
      url: "#"
    }
  ];



  // Organize files into folders by type/category
  const organizeSubmittedFiles = (submittedFiles: any[]) => {
    if (!submittedFiles || submittedFiles.length === 0) {
      return { organized: {}, folderMetadata: {} };
    }
    const organized: { [key: string]: any[] } = {};
    const folderMetadata: { [key: string]: {} } = {};
    submittedFiles.forEach(file => {
      let category = 'Other Files';
      // Categorize by file extension/type
      if (file.category) {
        category = file.category;
      } else if (file.type) {
        const fileType = file.type;
        if (fileType.includes('image')) category = 'Images';
        else if (fileType.includes('video')) category = 'Videos';
        else if (fileType.includes('pdf') || fileType.includes('document')) category = 'Documents';
        else if (fileType.includes('text') || fileType.includes('code')) category = 'Code Files';
        else if (fileType.includes('zip') || fileType.includes('archive')) category = 'Archives';
      } else {
        const extension = (file.name || '').split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'pdf': case 'doc': case 'docx': category = 'Documents'; break;
          case 'jpg': case 'jpeg': case 'png': case 'gif': category = 'Images'; break;
          case 'mp4': case 'avi': case 'mov': category = 'Videos'; break;
          case 'js': case 'ts': case 'py': case 'java': case 'cpp': case 'html': case 'css': category = 'Code Files'; break;
          case 'zip': case 'rar': case '7z': category = 'Archives'; break;
          default: category = 'Other Files';
        }
      }
      if (!organized[category]) organized[category] = [];
      // Normalize file object
      const normalizedFile = {
        name: file.name || 'Unknown File',
        type: file.type || 'unknown',
        size: file.size || file.fileSize || 'Unknown',
        modified: file.modified || file.lastModified || file.createdAt || file.uploadedAt || new Date().toISOString(),
        url: file.url || file.downloadUrl || file.path || '#',
        permissions: file.permissions,
      };
      organized[category].push(normalizedFile);
    });
    return { organized, folderMetadata };
  };

  const WindowsFileExplorer: React.FC<{ files: any[], githubUrl?: string }> = ({ files, githubUrl }) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const toggleFolder = (folderName: string) => {
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(folderName)) {
        newExpanded.delete(folderName);
      } else {
        newExpanded.add(folderName);
      }
      setExpandedFolders(newExpanded);
    };
    const getWindowsFileIcon = (fileName: string | undefined | null, type?: string) => {
      if (!fileName) return { icon: faFile, color: 'text-gray-400' };
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf': return { icon: faFilePdf, color: 'text-red-400' };
        case 'doc': case 'docx': return { icon: faFileWord, color: 'text-blue-400' };
        case 'xls': case 'xlsx': return { icon: faFileExcel, color: 'text-green-400' };
        case 'zip': case 'rar': case '7z': return { icon: faArchive, color: 'text-yellow-400' };
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return { icon: faImage, color: 'text-purple-400' };
        case 'mp4': case 'avi': case 'mov': case 'wmv': return { icon: faVideo, color: 'text-pink-400' };
        case 'js': case 'ts': case 'html': case 'css': case 'py': case 'java': case 'cpp': case 'c': case 'cs': return { icon: faFileCode, color: 'text-cyan-400' };
        default: return { icon: faFile, color: 'text-gray-400' };
      }
    };
    const formatFileSize = (size: any): string => {
      if (!size || isNaN(Number(size))) return size || 'Unknown';
      const bytes = Number(size);
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (dateString: string | Date): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    const fileOrganization = organizeSubmittedFiles(files);
    const organizedFiles = fileOrganization.organized;
    return (
      <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-1">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FontAwesomeIcon icon={faFolder} className="text-blue-400" />
          Project Files & Resources
        </h2>
        {/* GitHub Link Row */}
        {githubUrl && (
          <div className="flex items-center px-4 py-2 bg-gray-900/60 border-b border-gray-700/50">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-semibold text-white hover:text-blue-400 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <FontAwesomeIcon icon={faGithub} className="text-2xl" />
              View on GitHub
            </a>
          </div>
        )}
        {Object.keys(organizedFiles).length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <FontAwesomeIcon icon={faFolder} className="text-4xl mb-4" />
            <p>No files have been submitted yet.</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-gray-800/70 px-4 py-2 border-b border-gray-600">
              <div className="flex items-center text-xs text-white/70">
                <div className="flex-1">Name</div>
                <div className="w-20 text-center">Size</div>
                <div className="w-32 text-center">Date Modified</div>
                <div className="w-24 text-center">Actions</div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(organizedFiles).map(([folderName, folderFiles]) => (
                <div key={folderName}>
                  <div 
                    className="flex items-center px-4 py-2 hover:bg-gray-700/30 cursor-pointer border-b border-gray-700/50"
                    onClick={() => toggleFolder(folderName)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FontAwesomeIcon 
                        icon={expandedFolders.has(folderName) ? faFolderOpen : faFolder}
                        className="text-yellow-400 text-sm" 
                      />
                      <span className="text-sm font-medium">{folderName}</span>
                    </div>
                    <div className="w-20 text-center text-xs text-white/50">
                      {folderFiles.length} items
                    </div>
                    <div className="w-32 text-center text-xs text-white/50">
                      Folder
                    </div>
                    <div className="w-24"></div>
                  </div>
                  {expandedFolders.has(folderName) && (
                    <div className="bg-gray-800/20">
                      {folderFiles.map((file, index) => {
                        const fileIcon = getWindowsFileIcon(file.name, file.type);
                        const isPublic = file.permissions && (file.permissions.visibility === 'public' || file.permissions.viewable);
                        const isDownloadable = file.permissions && file.permissions.downloadable;
                        const isViewable = file.permissions && file.permissions.viewable;
                        const isGithubUrl = file.isGithubUrl || file.name.startsWith('github:');
                        
                        return (
                          <div 
                            key={`${folderName}-${index}`}
                            className={`flex items-center px-8 py-2 hover:bg-blue-600/20 border-b border-gray-700/30 last:border-b-0 ${
                              file.isClickable !== false ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            title={file.name}
                            onClick={() => {
                              if (file.isClickable !== false && file.url && file.url !== '#') {
                                window.open(file.url, '_blank');
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <FontAwesomeIcon 
                                icon={isGithubUrl ? faGithub : fileIcon.icon}
                                className={isGithubUrl ? 'text-gray-400' : fileIcon.color + ' text-sm'} 
                              />
                              <span className={`text-sm ${file.isClickable === false ? 'text-gray-500' : ''}`}>
                                {file.name}
                              </span>
                            </div>
                            <div className="w-20 text-center text-xs text-white/70">
                              {file.size}
                            </div>
                            <div className="w-32 text-center text-xs text-white/70">
                              {formatDate(file.modified || new Date())}
                            </div>
                            <div className="w-24 text-center flex gap-1 justify-center">
                              {isPublic ? (
                                <>
                                  {isViewable && (
                                    <button 
                                      className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                      title="View file"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (file.url && file.url !== '#') {
                                          window.open(file.url, '_blank');
                                        }
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faFile} className="text-xs" />
                                    </button>
                                  )}
                                  {isDownloadable && (
                                    <button 
                                      className="text-green-400 hover:text-green-300 transition-colors p-1"
                                      title="Download file"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (file.url && file.url !== '#') {
                                          const link = document.createElement('a');
                                          link.href = file.url;
                                          link.download = file.name;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <FontAwesomeIcon icon={faLock} className="text-xs text-gray-400" title="Private file" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-8 relative">
          {/* Back Button */}
          <div className="absolute top-8 left-8">
            <button
              onClick={onBack}
              className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2 mb-6"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              <span>Back to job search</span>
            </button>
          </div>

      {/* Purple-themed Join Bounty Modal */}
      {showJoinModal && (
        <Modal
          headerTitle="Join Bounty"
          showHeader={true}
          barrierDismissable={true}
          onClose={() => setShowJoinModal(false)}
          body={
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="mb-4">
                <FontAwesomeIcon icon={faTrophy} className="text-purple-400 text-4xl" />
              </div>
              <h2 className="text-2xl font-bold text-purple-500 mb-2">You have joined the bounty!</h2>
              <p className="text-purple-200 mb-4">Good luck! Check your dashboard for updates and submission options.</p>
              <button
                className="mt-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                onClick={() => setShowJoinModal(false)}
              >
                Close
              </button>
            </div>
          }
          showFooter={false}
        />
      )}

        {/* Bounty Job Header */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <FontAwesomeIcon icon={faCrosshairs} className="text-purple-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{job.projectTitle}</h1>
                <div className="flex items-center gap-4 text-white/70">
                  {job.JobSubType && (
                    <span className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                      <FontAwesomeIcon icon={faCrosshairs} className="text-sm" />
                      {job.JobSubType}
                    </span>
                  )}
                  <span>{job.projectType}</span>
                  {job.category && (
                    <>
                      <span>•</span>
                      <span>{job.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleFavoriteClick}
                className="p-3 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              >
                <FontAwesomeIcon
                  icon={isFavorite ? faHeartSolid : faHeartRegular}
                  className={`text-lg lg:text-xl ${isFavorite ? "text-red-500" : "text-white/70"}`}
                />
              </button>
              <button
                onClick={handleAttemptBounty}
                className="whitespace-nowrap px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Attempt Bounty
              </button>
            </div>
          </div>

          {/* Bounty-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
                <span className="text-sm text-white/70">Bounty Prize</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                ${(() => {
                  const prizeValue = job.Amount || job.bountyAmount || job.compensation;
                  console.log('🎯 Bounty Prize Debug:', {
                    Amount: job.Amount,
                    bountyAmount: job.bountyAmount,
                    compensation: job.compensation,
                    finalValue: prizeValue
                  });
                  return formatCompensation(prizeValue);
                })()}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-white/70" />
                <span className="text-sm text-white/70">Time Remaining</span>
              </div>
              <div className="text-lg font-semibold text-purple-400">
                {getTimeRemaining() || "No deadline"}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white/70" />
                <span className="text-sm text-white/70">Estimated Length</span>
              </div>
              <div className="text-lg font-semibold">
                {formatProjectLength(job.estimatedProjectLength || job.eprojectlength || '')}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70" />
                <span className="text-sm text-white/70">Participants</span>
              </div>
              <div className="text-lg font-semibold">
                {mockAttempts.length}
              </div>
            </div>
          </div>
        </div>

        {/* Three boxes spanning full width */}
        <div className="grid grid-cols-3 gap-6 mb-3">
          {/* Tags */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-purple-400" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[rgba(255,255,255,0.1)] rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTools} className="text-purple-400" />
              Required Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tools?.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>

          {/* Developer Score */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
              Recommended Developer Score
            </h3>
            <div className={'text-2xl font-bold ' + getDeveloperScoreColor(recommendedScore)}>
              {recommendedScore}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-3">

            {/* Bounty Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCrosshairs} className="text-purple-400" />
                Bounty Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullseye} className="text-green-400" />
                  Required Deliverables
                </h2>
                <ul className="space-y-3">
                  {job.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Description */}
            {job.projectDescription && job.projectOverview && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4">Project Description</h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {job.projectDescription}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4">Bounty Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="text-white/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3">
           
            {/* Current Attempts with Sorting */}
            <SortableDeveloperList 
              mockAttempts={mockAttempts} 
              getTimeAgo={getTimeAgo} 
              handleAttemptBounty={handleAttemptBounty} 
            />
 
            {/* Bounty Terms */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2 border border-purple-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-purple-400" />
                Bounty Terms
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {job.StartDate && job.StartTime && (
                  <div>
                    <span className="text-white/50">Bounty Start:</span>
                    <div className="font-semibold">
                      {job.StartDate} at {job.StartTime}
                    </div>
                  </div>
                )}
                {job.Deadline && job.ExpiryTime && (
                  <div>
                    <span className="text-white/50">Bounty End:</span>
                    <div className="font-semibold">
                      {job.Deadline} at {job.ExpiryTime}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-white/50">Project Duration:</span>
                  <div className="font-semibold">{formatProjectLength(job.estimatedProjectLength || job.eprojectlength || '')}</div>
                </div>
                <div>
                  <span className="text-white/50">Bounty Prize:</span>
                  <div className="font-semibold text-yellow-400">${(() => {
                    const prizeValue = job.Amount || job.bountyAmount || job.compensation;
                    console.log('🎯 Bounty Terms Prize Debug:', {
                      Amount: job.Amount,
                      bountyAmount: job.bountyAmount,
                      compensation: job.compensation,
                      finalValue: prizeValue
                    });
                    return formatCompensation(prizeValue);
                  })()}</div>
                </div>
                <div>
                  <span className="text-white/50">Payment Terms:</span>
                  <div className="font-semibold">Upon completion</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2 border border-purple-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-purple-400" />
                Client Information
              </h2>
              {loadingClient ? (
                <div className="text-white/60">Loading client info...</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/50">Client Name:</span>
                    <span className="font-semibold ml-2">{getClientDisplayName()}</span>
                  </div>
                  {clientProfile?.company && (
                    <div>
                      <span className="text-white/50">Company Name:</span>
                      <span className="ml-2">{clientProfile.company}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50">Jobs Posted:</span>
                    <span className="ml-2">{clientProfile?.projectsPosted ?? 'First job'}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Client Rating:</span>
                    <span className="ml-2">{clientProfile?.clientRating ? `${clientProfile.clientRating} / 5` : 'No rating yet'}</span>
                  </div>
                  {clientProfile?.location && (
                    <div>
                      <span className="text-white/50">Location:</span>
                      <span className="ml-2">{clientProfile.location}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50">Remote:</span>
                    <span className="text-green-400 ml-2">Yes</span>
                  </div>
                  <div>
                    <span className="text-white/50">Verified:</span>
                    <span className={currentUser?.emailVerified ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>{currentUser?.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-white/50">Job Created At:</span>
                    <span className="ml-2">{getCreatedAtString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Windows-style Project Files Section */}
        <div className="mt-4">
          {(() => {
            const allFiles = [
              ...(job.projectFiles || []),
              ...(job.imageFiles || []),
              ...(job.submittedFiles || []),
              ...(job.bountyFiles || []),
              ...(job.files || [])
            ];
            console.log('🎯 BountyJobDetails - All collected files:', allFiles);
            console.log('🎯 Individual arrays:');
            console.log('  - projectFiles:', job.projectFiles);
            console.log('  - imageFiles:', job.imageFiles);
            console.log('  - submittedFiles:', job.submittedFiles);
            console.log('  - bountyFiles:', job.bountyFiles);
            console.log('  - files:', job.files);
            return <WindowsFileExplorer files={allFiles} />;
          })()}
        </div>
      </div>
    </div>
  );
};

export default BountyJobDetails;