import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faClock,
  faCalendarAlt,
  faUser,
  faTag,
  faTools,
  faArrowLeft,
  faHeart as faHeartSolid,
  faFileText,
  faTrophy,
  faBullseye,
  faDownload,
  faFile,
  faImage,
  faVideo,
  faArchive,
  faChartLine,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

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
  bountyEndTime?: string;
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
  // Bounty-specific fields
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
  [key: string]: any;
}

interface BountyJobDetailsProps {
  job: JobData;
  onBack: () => void;
}

// Define types for the sortable component
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

// Sortable Developer List Component
const SortableDeveloperList: React.FC<SortableDeveloperListProps> = ({ 
  mockAttempts, 
  getTimeAgo, 
  handleAttemptBounty 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'desc'
  });

  // Sort function
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

  // Handle sort toggle
  const handleSort = (key: 'score' | 'time'): void => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Get arrow icon and styling
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
  const activeCount = mockAttempts.length;

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 pl-1 pr-2 pt-0 mt-4">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-purple-400 text-sm" />
          Developers Attempting
        </h3>
        <span className="text-xs text-white/80 bg-purple-500/20 px-2 py-1 rounded-full mt-3 font-semibold">
          {activeCount} Active
        </span>
      </div>
      
      {/* Table Header with sortable arrows */}
      <div className="flex items-center px-3 pt-2 mb-0 mt-0">
        <div className="text-xs font-semibold text-white/70 flex-1">Developer</div>
        
        {/* Sortable Score Header */}
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
        
        {/* Sortable Time Header */}
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

      {/* Inner container for all developers */}
      <div className="bg-gray-800/30 rounded-lg p-1">
        <div className="space-y-1">
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
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const handleFavoriteClick = (): void => {
    setIsFavorite(!isFavorite);
  };

  const handleAttemptBounty = (): void => {
    console.log("Attempting bounty:", job.id);
  };

  const formatCompensation = (compensation: string | number): string => {
    if (typeof compensation === 'number') {
      return compensation.toFixed(2);
    }
    const amount = parseFloat(compensation.toString().replace(/[^0-9.-]+/g, ""));
    return isNaN(amount) ? compensation : amount.toFixed(2);
  };

  const formatProjectLength = (length: string): string => {
    const lengthMap: { [key: string]: string } = {
      "<1hour": "Less than 1 hour",
      "1-3hours": "1-3 hours",
      "3-6hours": "3-6 hours",
      "6-12hours": "6-12 hours",
      "12-24hours": "12-24 hours",
      "1-3days": "1-3 days",
      "3-7days": "3-7 days",
      "1-2weeks": "1-2 weeks",
      "2-4weeks": "2-4 weeks",
      ">1month": "More than 1 month",
    };
    return lengthMap[length] || length;
  };

  const getTimeRemaining = (): string | null => {
    if (!job.bountyEndTime) return null;

    const end = new Date(job.bountyEndTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Bounty Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
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
    return job.bountyType || "Open Bounty";
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return faImage;
      case 'video':
      case 'mp4':
      case 'avi':
      case 'mov':
        return faVideo;
      case 'archive':
      case 'zip':
      case 'rar':
        return faArchive;
      default:
        return faFile;
    }
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

  // Mock data for current attempts - moved inside component and ensured it has data
  const mockAttempts: AttemptData[] = job.currentAttempts || [
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

  // Mock data for project files
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-8">
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-[#00FF00] transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Job Search
          </button>
        </div>

        {/* Bounty Job Header */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <FontAwesomeIcon icon={faGift} className="text-purple-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{job.projectTitle}</h1>
                <div className="flex items-center gap-4 text-white/70">
                  <span className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faGift} className="text-sm" />
                    {getBountySubtype()}
                  </span>
                  <span>{job.projectType}</span>
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
                  className={`text-xl ${isFavorite ? "text-[#00FF00]" : "text-white/70"}`}
                />
              </button>
              <button
                onClick={handleAttemptBounty}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
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
                ${formatCompensation(job.compensation)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-white/70" />
                <span className="text-sm text-white/70">Estimated Length</span>
              </div>
              <div className="text-lg font-semibold">
                {formatProjectLength(job.estimatedProjectLength)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white/70" />
                <span className="text-sm text-white/70">Time Remaning</span>
              </div>
              <div className="text-lg font-semibold text-red-400">
                {getTimeRemaining() || "No deadline"}
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg pt-0 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-purple-400" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg pt-0 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTools} className="text-purple-400" />
              Tools
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
              Recommended Developer Score
            </h3>
            <div className="text-3xl font-bold text-green-400">800</div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-3">

            {/* Bounty Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBullseye} className="text-purple-400" />
                Bounty Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0">
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
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0">
                <h2 className="text-2xl font-bold mb-4">Project Description</h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {job.projectDescription}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0">
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
            {/* Current Participants with Sorting */}
            <SortableDeveloperList 
              mockAttempts={mockAttempts} 
              getTimeAgo={getTimeAgo} 
              handleAttemptBounty={handleAttemptBounty} 
            />

            {/* Bounty Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 mt-4 pt-0">
              <h3 className="text-xl font-bold mb-4">Bounty Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Posted:</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                {job.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Sponsor:</span>
                    <span>{job.createdBy}</span>
                  </div>
                )}
                {job.submissionDeadline && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Submission Deadline:</span>
                    <span className="text-red-400">{formatDate(job.submissionDeadline)}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Location:</span>
                    <span>{job.location}</span>
                  </div>
                )}
                {job.remote !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Remote Eligible:</span>
                    <span className={job.remote ? "text-green-400" : "text-red-400"}>
                      {job.remote ? "Yes" : "No"}
                    </span>
                  </div>
                )}
                {job.experienceLevel && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Experience Level:</span>
                    <span>{job.experienceLevel}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Bounty ID:</span>
                  <span className="font-mono text-xs">{job.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Files Section */}
        <div className="mt-4">
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileText} className="text-blue-400" />
              Project Files
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockProjectFiles.map((file, index) => (
                <div key={index} className="bg-black/30 p-4 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <FontAwesomeIcon 
                      icon={getFileIcon(file.type)} 
                      className="text-blue-400 text-xl" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{file.name}</div>
                      <div className="text-xs text-white/60">{file.size}</div>
                    </div>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faDownload} className="text-xs" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyJobDetails;