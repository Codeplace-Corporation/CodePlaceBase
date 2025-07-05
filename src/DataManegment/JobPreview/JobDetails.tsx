import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';
import ContractJobDetails from './components/ContractJobDetails';
import BountyJobDetails from './components/BountyJobDetails';
import AuctionJobDetails from './components/AuctionJobDetails';
import ChallengeJobDetails from './components/ChallengeJobDetails';

interface JobData {
  id: string;
  projectTitle: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: string;
  compensation: string | number;
  estimatedProjectLength: string;
  projectDescription: string;
  projectOverview?: string;
  auctionCloseTime?: string;
  bountyEndTime?: string;
  applicationsCloseTime?: string;
  challengeCloseTime?: string;
  createdAt?: any;
  createdBy?: string;
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
  eprojectlength?: string; // Added to match ChallengeJobDetails requirements
  [key: string]: any; // Allow for additional fields
}

const JobDetails: React.FC = () => {
  const [job, setJob] = useState<JobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get jobId from URL
  const pathSegments = window.location.pathname.split('/');
  const jobId = pathSegments[2];

  // Fetch job data from Firebase
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setError("No job ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const jobRef = doc(firestore, "activeJobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          const jobData = { id: jobSnap.id, ...jobSnap.data() } as JobData;
          setJob(jobData);
          console.log("Fetched job data:", jobData);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleBack = () => {
    window.location.href = '/JobSearch';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-xl text-red-400 mb-6">{error || "Job not found"}</p>
        <button 
          onClick={handleBack}
          className="px-6 py-3 bg-[#00FF00] text-black rounded-lg hover:bg-[#00CC00] transition-colors"
        >
          ← Back to Job Search
        </button>
      </div>
    );
  }

  // Render the appropriate component based on job type
  switch (job.selectedJobPostType) {
    case 'Contract':
      return <ContractJobDetails job={job} onBack={handleBack} />;
    case 'Bounty':
      return <BountyJobDetails job={job} onBack={handleBack} />;
    case 'Auction':
      return <AuctionJobDetails job={job} onBack={handleBack} />;
    case 'Challenge': {
      // Ensure eprojectlength is always a string
      const challengeJob = { ...job, eprojectlength: job.eprojectlength ?? "" };
      return <ChallengeJobDetails job={challengeJob} onBack={handleBack} />;
    }
    default:
      // Fallback to Contract component for unknown types
      return <ContractJobDetails job={job} onBack={handleBack} />;
  }
};

export default JobDetails;