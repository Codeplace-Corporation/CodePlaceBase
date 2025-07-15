import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel,
  faDollarSign,
  faCalendarAlt,
  faUser,
  faTag,
  faTools,
  faHeart as faHeartSolid,
  faFileText,
  faHandshake,
  faShieldAlt,
  faDownload,
  faFile,
  faImage,
  faVideo,
  faArchive,
  faChartLine,
  faChevronUp,
  faTrophy,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileCode,
  faFolder,
  faFolderOpen,
  faCrosshairs,
  faArrowLeft,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { firestore } from '../../../utils/firebase';
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';

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
  applicationsCloseTime?: string;
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
  auctionStartTime?: string;
  auctionEndTime?: string;
  auctionEndDate?: string;
  startingBid?: string;
  revisionCost?: string;
  prepaidRevisions?: string;
  projectDeadline?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    description: string;
    dueDate?: string;
  }>;
  projectFiles?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
  }>;
  currentBids?: Array<{
    bidderName: string;
    avatar: string;
    bidAmount: number;
    proposalText: string;
    submittedAt: string;
    rating: number;
    completedProjects: number;
  }>;
  [key: string]: any;
}

interface AuctionJobDetailsProps {
  job: JobData;
  onBack: () => void;
}

// Define types for the sortable component
interface BidData {
  bidderName: string;
  avatar: string;
  bidAmount: number;
  proposalText: string;
  submittedAt: string;
  rating: number;
  completedProjects: number;
}

interface SortConfig {
  key: 'amount' | 'rating' | 'time' | null;
  direction: 'asc' | 'desc';
}

interface SortableBidderListProps {
  mockBids: BidData[];
  getTimeAgo: (dateString: string) => string;
  handleSubmitProposal: () => void;
}

// Sortable Bidder List Component
const SortableBidderList: React.FC<SortableBidderListProps> = ({ 
  mockBids, 
  getTimeAgo, 
  handleSubmitProposal 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  // Sort function
  const getSortedBids = (): BidData[] => {
    if (!sortConfig.key) return mockBids;
    
    return [...mockBids].sort((a, b) => {
      let aValue: number, bValue: number;
      
      if (sortConfig.key === 'amount') {
        aValue = a.bidAmount;
        bValue = b.bidAmount;
      } else if (sortConfig.key === 'rating') {
        aValue = a.rating;
        bValue = b.rating;
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
  const handleSort = (key: 'amount' | 'rating' | 'time'): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get arrow icon and styling
  const getSortIcon = (key: 'amount' | 'rating' | 'time') => {
    if (sortConfig.key !== key) {
      return {
        icon: faChevronUp,
        className: "text-white/30 hover:text-white/60 transition-all duration-300 transform rotate-0"
      };
    }
    
    return {
      icon: faChevronUp,
      className: sortConfig.direction === 'asc' 
        ? "text-orange-400 transform scale-110 rotate-0 transition-all duration-300" 
        : "text-orange-400 transform scale-110 rotate-180 transition-all duration-300"
    };
  };

  const sortedBids = getSortedBids();
  const totalBids = mockBids.length;

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 pl-1 pr-2 pt-0 mt-4">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faGavel} className="text-orange-400 text-sm" />
          Current Bids
        </h3>
        <span className="text-xs text-white/80 bg-orange-500/20 px-2 py-1 rounded-full mt-3 font-semibold">
          {totalBids} Bids
        </span>
      </div>
      
      {/* Table Header with sortable arrows */}
      <div className="flex items-center px-3 py-2 mb-0 mt-0">
        <div className="text-xs font-semibold text-white/70 flex-1">Bidder</div>
        
        {/* Sortable Score Header */}
        <div className="text-xs font-semibold text-white/70 w-16 flex items-center justify-start gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'rating' ? 'text-orange-400' : 'text-white/70'
            }`}
          >
            Score
          </span>
          <button
            onClick={() => handleSort('rating')}
            className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10"
          >
            <FontAwesomeIcon 
              icon={getSortIcon('rating').icon}
              className={`text-[0.6rem] ${getSortIcon('rating').className}`}
            />
          </button>
        </div>
        
        {/* Sortable Bid Header */}
        <div className="text-xs font-semibold text-white/70 w-20 ml-1 flex items-center justify-start -mr-4 ml-3 gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'amount' ? 'text-orange-400' : 'text-white/70'
            }`}
          >
            Bid
          </span>
          <button
            onClick={() => handleSort('amount')}
            className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10"
          >
            <FontAwesomeIcon 
              icon={getSortIcon('amount').icon}
              className={`text-[0.6rem] ${getSortIcon('amount').className}`}
            />
          </button>
        </div>
      </div>

      {/* Inner container for all bidders */}
      <div className="bg-gray-800/30 rounded-lg p-1 min-h-[140px] flex items-center justify-center">
        {sortedBids.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/60 text-base font-medium">No bids yet</span>
          </div>
        ) : (
          <div className="space-y-1 w-full">
          {sortedBids.map((bid: BidData, index: number) => (
            <div 
              key={`${bid.bidderName}-${index}`} 
              className="flex items-center pl-1 pr-1 hover:bg-white/5 rounded-[1rem] transition-all duration-200 bg-black/40 hover:border-orange-500/30 cursor-pointer"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: sortConfig.key ? 'fadeInSlide 0.3s ease-out forwards' : 'none'
              }}
              title={bid.proposalText.substring(0, 100) + '...'}
            >
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <img 
                  src={bid.avatar} 
                  alt={bid.bidderName}
                  className="w-3.5 h-3.5 rounded-full bg-gray-600 border border-orange-500/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-medium text-white text-[0.65rem] truncate">{bid.bidderName}</h4>
                </div>
              </div>
              
              <div className="w-16">
                <span 
                  className={`text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'rating' ? 'text-orange-300 transform scale-105' : 'text-orange-300'
                  }`}
                >
                  {bid.rating}
                </span>
              </div>
              
              <div className="w-20 -mr-2">
                <span 
                  className={`font-semibold text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'amount' ? 'text-green-300 transform scale-105' : 'text-green-300'
                  }`}
                >
                  ${bid.bidAmount.toLocaleString()}
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



const AuctionJobDetails: React.FC<AuctionJobDetailsProps> = ({ job, onBack }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const { currentUser } = useAuth();
  
  const [proposalText, setProposalText] = useState<string>('');

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



  const handleFavoriteClick = (): void => {
    setIsFavorite(!isFavorite);
  };

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

  const handleSubmitProposal = (): void => {
    // Reset form after submission
    setBidAmount('');
    setProposalText('');
  };

  const formatCompensation = (compensation: string | number | undefined): string => {
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
    const { auctionEndDate, auctionEndTime } = job;
    
    // Handle case where auctionEndTime is a full date-time string
    if (auctionEndTime && auctionEndTime.includes('T')) {
      const deadline = new Date(auctionEndTime);
      const now = new Date();

      if (isNaN(deadline.getTime())) {
        return null;
      }

      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) return "Auction Closed";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      let result = '';
      if (days > 0) result += `${days}d `;
      if (hours > 0 || days > 0) result += `${hours}h `;
      result += `${minutes}m remaining`;

      return result;
    }
    
    // Handle separate date and time fields
    if (!auctionEndDate || !auctionEndTime) {
      return null;
    }

    // Convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12: string) => {
      if (!time12 || time12 === '--:-- PM') {
        return '09:00';
      }
      
      const [time, modifier] = time12.split(' ');
      
      let [hours, minutes] = time.split(':');
      
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      
      const result = `${hours.padStart(2, '0')}:${minutes}`;
      return result;
    };

    // Combine into full date-time string with converted time
    const time24 = convertTo24Hour(auctionEndTime);
    const deadlineString = `${auctionEndDate}T${time24}:00`;
    
    const deadline = new Date(deadlineString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(deadline.getTime())) {
      return null;
    }

    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "Auction Closed";

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
    const finalCompensation = jobData.startingBid || jobData.compensation || 0;
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

  // Mock data for current bids
  const mockBids: BidData[] = job.currentBids || [
    {
      bidderName: "TechSolutions Pro",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      bidAmount: 2500,
      proposalText: "I have 5+ years of experience in React development and can deliver this project within the specified timeline. My portfolio includes similar e-commerce platforms...",
      submittedAt: "2025-01-28T10:30:00Z",
      rating: 850,
      completedProjects: 47
    },
    {
      bidderName: "DevCraft Studio",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b74bb76d?w=40&h=40&fit=crop&crop=face",
      bidAmount: 3200,
      proposalText: "Premium quality development with modern best practices. We specialize in scalable web applications and have worked with Fortune 500 companies...",
      submittedAt: "2025-01-29T14:15:00Z",
      rating: 920,
      completedProjects: 32
    },
    {
      bidderName: "CodeMaster Inc",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      bidAmount: 2800,
      proposalText: "Full-stack development with comprehensive testing and documentation. We offer post-launch support and maintenance packages...",
      submittedAt: "2025-01-30T08:45:00Z",
      rating: 780,
      completedProjects: 28
    },
    {
      bidderName: "Digital Innovators",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      bidAmount: 2200,
      proposalText: "Cost-effective solution without compromising quality. We have a proven track record of delivering projects on time and within budget...",
      submittedAt: "2025-01-30T12:20:00Z",
      rating: 650,
      completedProjects: 19
    },
    {
      bidderName: "Elite Web Developers",
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
      bidAmount: 3500,
      proposalText: "Premium development services with cutting-edge technology stack. We provide detailed project planning and agile development methodology...",
      submittedAt: "2025-01-30T15:10:00Z",
      rating: 890,
      completedProjects: 56
    }
  ];

  const getLowestBid = () => {
    if (mockBids.length === 0) return null;
    return Math.min(...mockBids.map(bid => bid.bidAmount));
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


        {/* Auction Job Header */}
        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 mb-6 border-l-4 border-orange-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <FontAwesomeIcon icon={faGavel} className="text-orange-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{job.projectTitle}</h1>
                <div className="flex items-center gap-4 text-white/70">
                  <span className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faGavel} className="text-sm" />
                    Auction Project
                  </span>
                  <span>{job.JobSubType || job.projectType}</span>
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
                onClick={handleSubmitProposal}
                className=" whitespace-nowrap px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Place Bid
              </button>
            </div>
          </div>

          {/* Auction-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-orange-400" />
                <span className="text-sm text-white/70">Starting Bid</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                ${formatCompensation(job.startingBid || job.compensation)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faTrophy} className="text-white/70" />
                <span className="text-sm text-white/70">Lowest Bid</span>
              </div>
              <div className="text-lg font-semibold text-green-400">
                {getLowestBid() ? `${getLowestBid()?.toLocaleString()}` : 'No bids yet'}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white/70" />
                <span className="text-sm text-white/70">Auction Ends</span>
              </div>
              <div className="text-lg font-semibold text-orange-400">
                {getTimeRemaining() || "No deadline"}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70" />
                <span className="text-sm text-white/70">Bids</span>
              </div>
              <div className="text-lg font-semibold">
                {mockBids.length}
              </div>
            </div>
          </div>
        </div>

        {/* Three boxes spanning full width */}
        <div className="grid grid-cols-3 gap-6 mb-3">
          {/* Tags */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-orange-400" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tags && job.tags.map((tag, index) => (
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
              <FontAwesomeIcon icon={faTools} className="text-orange-400" />
              Required Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tools?.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm"
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

            {/* Project Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileText} className="text-orange-400" />
                Project Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCrosshairs} className="text-green-400" />
                  Required Deliverables
                </h2>
                <ul className="space-y-3">
                  {job.deliverables && job.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Project Description */}
            {job.projectDescription && job.projectOverview && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4">Project Description</h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {job.projectDescription}
                </p>
              </div>
            )}

            {/* Auction Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-4">Auction Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements && job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      <span className="text-white/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Milestones */}
            {job.milestones && job.milestones.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-400" />
                  Project Milestones & Payment Schedule
                </h2>
                <div className="text-white/60 text-xs mb-4">
                  This project will be paid out in stages as each milestone is completed and approved. Each milestone represents a key deliverable or phase of the project.
                </div>
                <div className="space-y-1">
                  {job.milestones && job.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-stretch bg-black/40 rounded-lg border-l-4 border-orange-400 p-0 overflow-hidden min-h-[40px]">
                      {/* Left accent/icon */}
                      <div className="flex items-center px-2 py-2 bg-black/30">
                        <FontAwesomeIcon icon={faGavel} className="text-orange-400 text-base" />
                      </div>
                      {/* Main content */}
                      <div className="flex-1 flex flex-col justify-center px-2 py-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                          <div className="font-semibold text-xs sm:text-sm text-white truncate">{milestone.title ? milestone.title : <span className='text-white/40'>No title</span>}</div>
                          <div className="flex items-center gap-1 mt-0.5 sm:mt-0">
                            <span className="text-orange-400 font-bold text-sm">{milestone.amount != null ? `${milestone.amount}%` : <span className='text-white/40'>0%</span>}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-white/60">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-orange-400 text-xs" />
                          {milestone.dueDate ? milestone.dueDate : <span className='text-white/40'>No due date</span>}
                        </div>
                        <div className="mt-0.5 text-xs text-white/70 min-h-[1em]">
                          {milestone.description ? milestone.description : <span className='text-white/40'>No description</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3">
           
            {/* Current Bids with Sorting */}
            <SortableBidderList 
              mockBids={mockBids} 
              getTimeAgo={getTimeAgo} 
              handleSubmitProposal={handleSubmitProposal} 
            />
 
            {/* Auction Terms (moved from left column) */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0 border border-orange-500/30 pt-2">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faHandshake} className="text-orange-400" />
                Auction Terms
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {job.auctionStartTime && (
                  <div>
                    <span className="text-white/50">Auction Start:</span>
                    <div className="font-semibold">
                      {job.auctionStartTime.includes('T') ? formatDate(job.auctionStartTime) : job.auctionStartTime}
                    </div>
                  </div>
                )}
                {job.auctionEndDate && job.auctionEndTime && (
                  <div>
                    <span className="text-white/50">Auction End:</span>
                    <div className="font-semibold">
                      {job.auctionEndDate} at {job.auctionEndTime}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-white/50">Project Deadline:</span>
                  <div className="font-semibold text-orange-300">
                    {job.Deadline && job.ExpiryTime 
                      ? `${job.Deadline} at ${job.ExpiryTime}`
                      : job.projectDeadline || "To be determined"
                    }
                  </div>
                </div>
                <div>
                  <span className="text-white/50">Project Duration:</span>
                  <div className="font-semibold">{formatProjectLength(job.estimatedProjectLength)}</div>
                </div>
                {job.startingBid && (
                <div>
                    <span className="text-white/50">Starting Bid:</span>
                    <div className="font-semibold text-green-400">${job.startingBid}</div>
                </div>
                )}
                {job.bidIncrement && (
                  <div>
                    <span className="text-white/50">Bid Increment:</span>
                    <div className="font-semibold text-green-400">${job.bidIncrement}</div>
                  </div>
                )}

                {job.revisionCost && (
                  <div>
                    <span className="text-white/50">Additional Revision Cost:</span>
                    <div className="font-semibold">${job.revisionCost}</div>
                  </div>
                )}
                {job.prepaidRevisions && (
                  <div>
                    <span className="text-white/50">Included Prepaid Revisions:</span>
                    <div className="font-semibold">{job.prepaidRevisions}</div>
                  </div>
                )}
                <div>
                  <span className="text-white/50">Payment Terms:</span>
                  <div className="font-semibold">Milestone-based</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2 border border-orange-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-orange-400" />
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
              ...(job.auctionFiles || []),
              ...(job.files || [])
            ];
            return <WindowsFileExplorer files={allFiles} />;
          })()}
        </div>
      </div>
    </div>
  );
};

// Windows-style File System Component
const WindowsFileExplorer: React.FC<{ files: any[] }> = ({ files }) => {
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
      case 'pdf':
        return { icon: faFilePdf, color: 'text-red-400' };
      case 'doc':
      case 'docx':
        return { icon: faFileWord, color: 'text-blue-400' };
      case 'xls':
      case 'xlsx':
        return { icon: faFileExcel, color: 'text-green-400' };
      case 'zip':
      case 'rar':
      case '7z':
        return { icon: faArchive, color: 'text-yellow-400' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return { icon: faImage, color: 'text-purple-400' };
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return { icon: faVideo, color: 'text-pink-400' };
      case 'js':
      case 'ts':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'cs':
        return { icon: faFileCode, color: 'text-cyan-400' };
      default:
        return { icon: faFile, color: 'text-gray-400' };
    }
  };

  const formatFileSize = (bytes: number): string => {
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

  // Check if GitHub repository is accessible
  const isGitHubRepoAccessible = async (repoUrl: string): Promise<boolean> => {
    try {
      // Extract owner/repo from GitHub URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return false;
      
      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      
      const response = await fetch(apiUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  // GitHub Repository Component
  const GitHubRepoLink: React.FC<{ repoUrl: string; isPrivate?: boolean }> = ({ repoUrl, isPrivate }) => {
    const [isAccessible, setIsAccessible] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
      if (repoUrl && !isPrivate) {
        setIsChecking(true);
        isGitHubRepoAccessible(repoUrl).then(accessible => {
          setIsAccessible(accessible);
          setIsChecking(false);
        });
      }
    }, [repoUrl, isPrivate]);

    if (!repoUrl) return null;

    // Blur the path after .com/ for private repos
    const getBlurredRepoUrl = (url: string) => {
      const match = url.match(/(https:\/\/github\.com\/)(.+)/);
      if (!match) return url;
      return match[1] + '<span style="filter: blur(6px);">' + match[2] + '</span>';
    };

    const getRepoName = (url: string) => {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      return match ? `${match[1]}/${match[2]}` : 'Repository';
    };

    const handleRepoClick = () => {
      if (isPrivate) {
        alert('This repository is private and cannot be accessed publicly.');
        return;
      }
      if (isAccessible === false) {
        alert('This repository appears to be private or inaccessible.');
        return;
      }
      window.open(repoUrl, '_blank');
    };

    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-700/30 rounded-md border border-gray-600/50">
        <FontAwesomeIcon 
          icon={faFileCode} 
          className={`text-sm ${isPrivate ? 'text-red-400' : isAccessible === false ? 'text-orange-400' : 'text-green-400'}`} 
        />
        <button
          onClick={handleRepoClick}
          disabled={isPrivate || isAccessible === false || isChecking}
          className={`text-xs font-medium transition-colors ${
            isPrivate || isAccessible === false 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-400 hover:text-blue-300 cursor-pointer'
          }`}
          title={
            isPrivate 
              ? 'Private repository - access restricted' 
              : isAccessible === false 
                ? 'Repository is private or inaccessible'
                : 'Open GitHub repository'
          }
          dangerouslySetInnerHTML={isPrivate ? { __html: getBlurredRepoUrl(repoUrl) + ' 🔒' } : undefined}
        >
          {!isPrivate && (isChecking ? 'Checking...' : getRepoName(repoUrl))}
          {isPrivate && ''}
          {!isPrivate && isAccessible === false && ' 🔒'}
        </button>
      </div>
    );
  };

  // Organize submitted files into folders based on file type or submission data
  const organizeSubmittedFiles = (submittedFiles: any[] | undefined) => {
    if (!submittedFiles || !Array.isArray(submittedFiles) || submittedFiles.length === 0) {
      // Return empty objects if no files are provided
      return { organized: {}, folderMetadata: {} };
    }

    const organized: { [key: string]: any[] } = {};
    const folderMetadata: { [key: string]: { githubRepos: Array<{ url: string; isPrivate: boolean; name?: string }> } } = {};

    submittedFiles.forEach(file => {
      console.log('🔍 Processing file:', file);
      let category = 'Other Files';
      let githubRepo: { url: string; isPrivate: boolean; name?: string } | null = null;

      // Handle GitHub repositories stored as pseudo-files (name starts with "github:")
      if (file.name?.startsWith('github:')) {
        const repoUrl = file.name.replace('github:', '');
        console.log('🔗 Found GitHub repo:', repoUrl);
        
        githubRepo = { 
          url: repoUrl, 
          isPrivate: false, // Default to false, could be enhanced later
          name: repoUrl.split('/').slice(-2).join('/') // Extract owner/repo from URL
        };
        
        // Use the repository URL/name as the category instead of "Code Files"
        category = repoUrl;
      }
      // Handle direct GitHub repository properties
      else if (file.githubRepo || file.repositoryUrl) {
        const repoUrl = file.githubRepo || file.repositoryUrl;
        const isPrivate = file.isPrivateRepo || file.privateRepository || false;
        const repoName = file.repoName || file.repositoryName;
        
        console.log('🔗 Found GitHub repo (direct):', repoUrl);
        
        githubRepo = { url: repoUrl, isPrivate, name: repoName };
        // Use the repository URL/name as the category
        category = repoName || repoUrl;
      }
      // Regular file processing
      else if ((file.name || file.fileName) && !file.name?.startsWith('github:')) {
        // Determine category based on file properties
        if (file.category) {
          category = file.category;
        } else if (file.type || file.fileType) {
          const fileType = file.type || file.fileType;
          
          // Skip GitHub pseudo-files by type
          if (fileType === 'application/x-git-url') {
            console.log('🔗 Skipping GitHub pseudo-file by type:', file);
            return;
          }
          
          if (fileType.includes('image')) category = 'Images';
          else if (fileType.includes('video')) category = 'Videos';
          else if (fileType.includes('application/pdf')) category = 'Documents';
          else if (fileType.includes('text') || fileType.includes('code')) category = 'Code Files';
          else if (fileType.includes('zip') || fileType.includes('archive')) category = 'Archives';
        } else {
          // Categorize by file extension
          const extension = (file.name || file.fileName || '').split('.').pop()?.toLowerCase();
          switch (extension) {
            case 'pdf': case 'doc': case 'docx': category = 'Documents'; break;
            case 'jpg': case 'jpeg': case 'png': case 'gif': category = 'Images'; break;
            case 'mp4': case 'avi': case 'mov': category = 'Videos'; break;
            case 'js': case 'ts': case 'py': case 'java': case 'cpp': case 'html': case 'css': category = 'Code Files'; break;
            case 'zip': case 'rar': case '7z': category = 'Archives'; break;
            default: category = 'Other Files';
          }
        }
      }

      // Initialize category if it doesn't exist
      if (!organized[category]) {
        organized[category] = [];
        folderMetadata[category] = { githubRepos: [] };
      }

      // Add GitHub repo to folder metadata
      if (githubRepo) {
        console.log(`📁 Adding GitHub repo to ${category} folder:`, githubRepo);
        
        // Check if this repo URL is already added to this category
        const existingRepo = folderMetadata[category].githubRepos.find(repo => repo.url === githubRepo!.url);
        if (!existingRepo) {
          folderMetadata[category].githubRepos.push(githubRepo);
        }
        return; // Don't add GitHub repos as files
      }

      // Add regular files
      if ((file.name || file.fileName) && !file.name?.startsWith('github:') && file.type !== 'application/x-git-url') {
        console.log('📁 Processing file for category:', category, file);

        // Normalize file object
        const normalizedFile = {
          name: file.name || file.fileName || 'Unknown File',
          type: file.type || file.fileType || 'unknown',
          size: file.size ? formatFileSize(file.size) : (file.fileSize || 'Unknown'),
          modified: file.modified || file.lastModified || file.createdAt || file.uploadedAt || new Date().toISOString(),
          url: file.url || file.downloadUrl || file.path || '#',
          bytes: file.size || file.fileSize || 0,
          id: file.id || file._id,
          uploadedBy: file.uploadedBy || file.submittedBy,
          permissions: file.permissions // Assuming permissions are part of the file object
        };

        organized[category].push(normalizedFile);
      }
    });

    console.log('📁 Final organization result:');
    console.log('  - Folder metadata:', folderMetadata);
    console.log('  - Organized files:', organized);

    return { organized, folderMetadata };
  };

  const fileOrganization = organizeSubmittedFiles(files || []);
  const organizedFiles = fileOrganization.organized;
  const folderMetadata = fileOrganization.folderMetadata;

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faFolder} className="text-orange-400" />
        Auction Files & Resources
      </h2>
      
      {Object.keys(organizedFiles).length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <FontAwesomeIcon icon={faFolder} className="text-4xl mb-4" />
          <p>No files have been submitted yet.</p>
        </div>
      ) : (
        /* Windows-style file explorer */
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg overflow-hidden">
          {/* Header bar */}
          <div className="bg-gray-800/70 px-4 py-2 border-b border-gray-600">
            <div className="flex items-center text-xs text-white/70">
              <div className="flex-1">Name</div>
              <div className="w-20 text-center">Size</div>
              <div className="w-32 text-center">Date Modified</div>
              <div className="w-24 text-center">Actions</div>
            </div>
          </div>
          
          {/* File list */}
          <div className="max-h-96 overflow-y-auto">
            {organizedFiles && Object.entries(organizedFiles).map(([folderName, folderFiles]) => (
              <div key={folderName}>
                {/* Folder header */}
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-700/30 cursor-pointer border-b border-gray-700/50"
                  onClick={() => toggleFolder(folderName)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {/* Show code brackets for GitHub repo folders, regular folder icon for others */}
                    {folderMetadata && folderMetadata[folderName]?.githubRepos?.length > 0 ? (
                      <span className="text-yellow-400 text-sm font-mono font-bold">
                        {expandedFolders.has(folderName) ? '</>' : '</>'}
                      </span>
                    ) : (
                      <FontAwesomeIcon 
                        icon={expandedFolders.has(folderName) ? faFolderOpen : faFolder}
                        className="text-yellow-400 text-sm" 
                      />
                    )}
                    <span 
                      className={`text-sm font-medium ${
                        folderMetadata && folderMetadata[folderName]?.githubRepos?.length > 0 
                          ? 'text-blue-400 hover:text-blue-300 cursor-pointer' 
                          : ''
                      }`}
                      onClick={(e) => {
                        // If it's a GitHub repo folder, open the repo instead of toggling folder
                        if (folderMetadata && folderMetadata[folderName]?.githubRepos?.length > 0) {
                          e.stopPropagation();
                          const repo = folderMetadata[folderName].githubRepos[0];
                          if (!repo.isPrivate) {
                            window.open(repo.url, '_blank');
                          } else {
                            alert('This repository is private and cannot be accessed publicly.');
                          }
                        }
                      }}
                    >
                      {(() => {
                        // If it's a GitHub repo folder, handle private repo blurring
                        if (folderMetadata && folderMetadata[folderName]?.githubRepos?.length > 0) {
                          const repo = folderMetadata[folderName].githubRepos[0];
                          if (repo.isPrivate && folderName.includes('.com')) {
                            const [domain, ...pathParts] = folderName.split('.com');
                            const path = pathParts.join('.com');
                            return (
                              <>
                                {domain}.com
                                <span className="blur-sm select-none">{path}</span>
                                <span className="ml-1 text-red-400">🔒</span>
                              </>
                            );
                          }
                        }
                        return folderName;
                      })()}
                    </span>
                    
                    {/* Don't show GitHubRepoLink since the folder name IS the repo */}
                  </div>
                  <div className="w-20 text-center text-xs text-white/50">
                    {folderFiles.length} items
                    {folderMetadata && folderMetadata[folderName]?.githubRepos?.length > 0 && 
                      ` + ${folderMetadata[folderName].githubRepos.length} repo${folderMetadata[folderName].githubRepos.length > 1 ? 's' : ''}`
                    }
                  </div>
                  <div className="w-32 text-center text-xs text-white/50">
                    Folder
                  </div>
                  <div className="w-24"></div>
                </div>
                
                {/* Folder contents */}
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
                          key={`${folderName}-${file.id || index}`}
                          className={`flex items-center px-8 py-2 hover:bg-orange-600/20 border-b border-gray-700/30 last:border-b-0 ${
                            file.isClickable !== false ? 'cursor-pointer' : 'cursor-default'
                          }`}
                          title={`${file.name}${file.uploadedBy ? ` - Uploaded by: ${file.uploadedBy}` : ''}`}
                          onClick={() => {
                            if (file.isClickable !== false && file.url && file.url !== '#') {
                              window.open(file.url, '_blank');
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <FontAwesomeIcon 
                              icon={isGithubUrl ? faFileCode : fileIcon.icon}
                              className={isGithubUrl ? 'text-gray-400' : fileIcon.color + ' text-sm'} 
                            />
                            <span className={`text-sm ${file.isClickable === false ? 'text-gray-500' : ''}`}>
                              {file.name}
                            </span>
                            {file.uploadedBy && (
                              <span className="text-xs text-white/40 ml-2">by {file.uploadedBy}</span>
                            )}
                          </div>
                          <div className="w-20 text-center text-xs text-white/70">
                            {file.size}
                          </div>
                          <div className="w-32 text-center text-xs text-white/70">
                            {formatDate(file.modified)}
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
                              <FontAwesomeIcon icon={faShieldAlt} className="text-xs text-red-400" title="Private file" />
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

export default AuctionJobDetails;