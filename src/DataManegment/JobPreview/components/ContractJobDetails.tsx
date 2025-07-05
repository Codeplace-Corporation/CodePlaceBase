import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileContract,
  faClock,
  faDollarSign,
  faCalendarAlt,
  faUser,
  faTag,
  faTools,
  faArrowLeft,
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
  faGavel,
  faTrophy,
  faMedal,
  faBullseye,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileCode,
  faFolder,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { firestore, collection, addDoc } from '../../../utils/firebase';

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
  contractStartTime?: string;
  contractEndTime?: string;
  revisionCost?: string;
  prepaidRevisions?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    description: string;
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

interface ContractJobDetailsProps {
  job: JobData;
  onBack: () => void;
}

// Define types for the sortable component
interface ProposalData {
  bidderName: string;
  avatar: string;
  proposalText: string;
  submittedAt: string;
  rating: number;
  completedProjects: number;
}

interface SortConfig {
  key: 'rating' | 'time' | null;
  direction: 'asc' | 'desc';
}

interface SortableProposalListProps {
  mockProposals: ProposalData[];
  getTimeAgo: (dateString: string) => string;
  handleSubmitProposal: () => void;
}

// Sortable Proposal List Component
const SortableProposalList: React.FC<SortableProposalListProps> = ({ 
  mockProposals, 
  getTimeAgo, 
  handleSubmitProposal 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  // Sort function
  const getSortedProposals = (): ProposalData[] => {
    if (!sortConfig.key) return mockProposals;
    
    return [...mockProposals].sort((a, b) => {
      let aValue: number, bValue: number;
      
      if (sortConfig.key === 'rating') {
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
  const handleSort = (key: 'rating' | 'time'): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get arrow icon and styling
  const getSortIcon = (key: 'rating' | 'time') => {
    if (sortConfig.key !== key) {
      return {
        icon: faChevronUp,
        className: "text-white/30 hover:text-white/60 transition-all duration-300 transform rotate-0"
      };
    }
    
    return {
      icon: faChevronUp,
      className: sortConfig.direction === 'asc' 
        ? "text-blue-400 transform scale-110 rotate-0 transition-all duration-300" 
        : "text-blue-400 transform scale-110 rotate-180 transition-all duration-300"
    };
  };

  const sortedProposals = getSortedProposals();
  const totalProposals = mockProposals.length;

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-4 pl-1 pr-2 pt-0 mt-4">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-sm lg:text-lg font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faGavel} className="text-blue-400 text-xs lg:text-sm" />
          Current Proposals
        </h3>
        <span className="text-xs text-white/80 bg-blue-500/20 px-2 py-1 rounded-full mt-3 font-semibold">
          {totalProposals} Proposals
        </span>
      </div>
      
      {/* Table Header with sortable arrows */}
      <div className="flex items-center px-2 lg:px-3 pt-2 mb-0 mt-0">
        <div className="text-xs font-semibold text-white/70 flex-1">Developer</div>
        
        {/* Sortable Score Header */}
        <div className="text-xs font-semibold text-white/70 w-12 lg:w-16 ml-1 flex items-center justify-start gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'rating' ? 'text-blue-400' : 'text-white/70'
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
        
        {/* Sortable Date Header */}
        <div className="text-xs font-semibold text-white/70 w-16 lg:w-20 flex items-center justify-start gap-1 ml-2 lg:ml-3 -mr-2 lg:-mr-4">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'time' ? 'text-blue-400' : 'text-white/70'
            }`}
          >
            Date
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

      {/* Inner container for all bidders */}
      <div className="bg-gray-800/30 rounded-lg p-1">
        <div className="space-y-1">
          {sortedProposals.map((proposal: ProposalData, index: number) => (
            <div 
              key={`${proposal.bidderName}-${index}`} 
              className="flex items-center pl-1 pr-1 hover:bg-white/5 rounded-[1rem] transition-all duration-200 bg-black/40 hover:border-blue-500/30 cursor-pointer"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: sortConfig.key ? 'fadeInSlide 0.3s ease-out forwards' : 'none'
              }}
              title={proposal.proposalText.substring(0, 100) + '...'}
            >
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <img 
                  src={proposal.avatar} 
                  alt={proposal.bidderName}
                  className="w-3 lg:w-3.5 h-3 lg:h-3.5 rounded-full bg-gray-600 border border-blue-500/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-medium text-white text-[0.6rem] lg:text-[0.65rem] truncate">{proposal.bidderName}</h4>
                </div>
              </div>
              
              <div className="w-12 lg:w-16 -mr-1 lg:-mr-2">
                <span 
                  className={`text-[0.6rem] lg:text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'rating' ? 'text-blue-300 transform scale-105' : 'text-blue-300'
                  }`}
                >
                  {proposal.rating}
                </span>
              </div>
              
              <div className="w-16 lg:w-20">
                <span 
                  className={`font-semibold text-[0.6rem] lg:text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'time' ? 'text-orange-300 transform scale-105' : 'text-gray-300'
                  } ml-1 lg:ml-2`}
                >
                  {getTimeAgo(proposal.submittedAt)}
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

  const getWindowsFileIcon = (fileName: string, type?: string) => {
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
        return { icon: faFileCode, color: 'text-cyan-400' };
      default:
        return { icon: faFile, color: 'text-gray-400' };
    }
  };

  // Organize files into folders
  const organizedFiles = {
    'Project Documentation': [
      {
        name: "project_requirements.pdf",
        type: "document",
        size: "2.4 MB",
        modified: "2025-01-28 14:30",
        url: "#"
      },
      {
        name: "technical_specifications.pdf",
        type: "document",
        size: "1.8 MB",
        modified: "2025-01-29 09:15",
        url: "#"
      }
    ],
    'Design Assets': [
      {
        name: "wireframes_and_mockups.zip",
        type: "archive",
        size: "15.7 MB",
        modified: "2025-01-30 11:45",
        url: "#"
      },
      {
        name: "brand_assets.zip",
        type: "archive",
        size: "8.2 MB",
        modified: "2025-01-30 16:20",
        url: "#"
      },
      {
        name: "logo_variations.png",
        type: "image",
        size: "3.1 MB",
        modified: "2025-01-30 10:30",
        url: "#"
      }
    ],
    'Reference Materials': [
      {
        name: "competitor_analysis.xlsx",
        type: "spreadsheet",
        size: "892 KB",
        modified: "2025-01-27 15:45",
        url: "#"
      },
      {
        name: "style_guide.pdf",
        type: "document",
        size: "4.2 MB",
        modified: "2025-01-28 13:20",
        url: "#"
      }
    ]
  };

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
      <h2 className="text-lg lg:text-2xl font-bold mb-4 lg:mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faFolder} className="text-blue-400" />
        Project Files & Resources
      </h2>
      
      {/* Windows-style file explorer */}
      <div className="bg-gray-900/50 border border-gray-600 rounded-lg overflow-hidden">
        {/* Header bar */}
        <div className="bg-gray-800/70 px-2 lg:px-4 py-2 border-b border-gray-600">
          <div className="flex items-center text-xs text-white/70">
            <div className="flex-1">Name</div>
            <div className="w-16 lg:w-20 text-center">Size</div>
            <div className="w-24 lg:w-32 text-center">Date Modified</div>
            <div className="w-12 lg:w-16 text-center">Actions</div>
          </div>
        </div>
        
        {/* File list */}
        <div className="max-h-80 lg:max-h-96 overflow-y-auto">
          {Object.entries(organizedFiles).map(([folderName, folderFiles]) => (
            <div key={folderName}>
              {/* Folder header */}
              <div 
                className="flex items-center px-2 lg:px-4 py-2 hover:bg-gray-700/30 cursor-pointer border-b border-gray-700/50"
                onClick={() => toggleFolder(folderName)}
              >
                <div className="flex items-center gap-2 flex-1">
                  <FontAwesomeIcon 
                    icon={expandedFolders.has(folderName) ? faFolderOpen : faFolder}
                    className="text-yellow-400 text-xs lg:text-sm" 
                  />
                  <span className="text-xs lg:text-sm font-medium">{folderName}</span>
                </div>
                <div className="w-16 lg:w-20 text-center text-xs text-white/50">
                  {folderFiles.length} items
                </div>
                <div className="w-24 lg:w-32 text-center text-xs text-white/50">
                  Folder
                </div>
                <div className="w-12 lg:w-16"></div>
              </div>
              
              {/* Folder contents */}
              {expandedFolders.has(folderName) && (
                <div className="bg-gray-800/20">
                  {folderFiles.map((file, index) => {
                    const fileIcon = getWindowsFileIcon(file.name, file.type);
                    return (
                      <div 
                        key={`${folderName}-${index}`}
                        className="flex items-center px-4 lg:px-8 py-2 hover:bg-blue-600/20 cursor-pointer border-b border-gray-700/30 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <FontAwesomeIcon 
                            icon={fileIcon.icon}
                            className={`${fileIcon.color} text-xs lg:text-sm`} 
                          />
                          <span className="text-xs lg:text-sm">{file.name}</span>
                        </div>
                        <div className="w-16 lg:w-20 text-center text-xs text-white/70">
                          {file.size}
                        </div>
                        <div className="w-24 lg:w-32 text-center text-xs text-white/70">
                          {file.modified}
                        </div>
                        <div className="w-12 lg:w-16 text-center">
                          <button 
                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="Download file"
                          >
                            <FontAwesomeIcon icon={faDownload} className="text-xs" />
                          </button>
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
    </div>
  );
};

const ContractJobDetails: React.FC<ContractJobDetailsProps> = ({ job, onBack }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [proposalText, setProposalText] = useState<string>('');

  const handleFavoriteClick = (): void => {
    setIsFavorite(!isFavorite);
  };

  const handleSubmitProposal = (): void => {
    console.log("Submitting proposal for contract:", job.id, {
      proposalText
    });
    // Reset form after submission
    setProposalText('');
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
    if (!job.applicationsCloseTime) return null;

    const end = new Date(job.applicationsCloseTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Applications Closed";

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

  // Mock data for current proposals
  const mockProposals: ProposalData[] = job.currentBids?.map(bid => ({
    bidderName: bid.bidderName,
    avatar: bid.avatar,
    proposalText: bid.proposalText,
    submittedAt: bid.submittedAt,
    rating: bid.rating,
    completedProjects: bid.completedProjects
  })) || [
    {
      bidderName: "TechSolutions Pro",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      proposalText: "I have 5+ years of experience in React development and can deliver this project within the specified timeline. My portfolio includes similar e-commerce platforms...",
      submittedAt: "2025-01-28T10:30:00Z",
      rating: 850,
      completedProjects: 47
    },
    {
      bidderName: "DevCraft Studio",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b74bb76d?w=40&h=40&fit=crop&crop=face",
      proposalText: "Premium quality development with modern best practices. We specialize in scalable web applications and have worked with Fortune 500 companies...",
      submittedAt: "2025-01-29T14:15:00Z",
      rating: 920,
      completedProjects: 32
    },
    {
      bidderName: "CodeMaster Inc",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      proposalText: "Full-stack development with comprehensive testing and documentation. We offer post-launch support and maintenance packages...",
      submittedAt: "2025-01-30T08:45:00Z",
      rating: 780,
      completedProjects: 28
    },
    {
      bidderName: "Digital Innovators",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      proposalText: "Cost-effective solution without compromising quality. We have a proven track record of delivering projects on time and within budget...",
      submittedAt: "2025-01-30T12:20:00Z",
      rating: 650,
      completedProjects: 19
    },
    {
      bidderName: "Elite Web Developers",
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
      proposalText: "Premium development services with cutting-edge technology stack. We provide detailed project planning and agile development methodology...",
      submittedAt: "2025-01-30T15:10:00Z",
      rating: 890,
      completedProjects: 56
    }
  ];


  const getBudgetRange = () => {
    if (job.budget) {
      return `${job.budget.min?.toLocaleString()} - ${job.budget.max?.toLocaleString()}`;
    }
    return `${formatCompensation(job.compensation)} (fixed)`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-6 md:pb-8">
        <div className="mb-4 md:mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-[#00FF00] transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Job Search
          </button>
        </div>

        {/* Contract Job Header */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-4 md:p-6 mb-4 md:mb-6 border-l-4 border-blue-500">
          <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                <FontAwesomeIcon icon={faFileContract} className="text-blue-400 text-2xl md:text-4xl" />
              </div>
              <div className="flex-1 md:flex-none">
                <h1 className="text-xl md:text-4xl font-bold mb-2">{job.projectTitle}</h1>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-white/70 text-sm lg:text-base">
                  <span className="flex items-center gap-1 bg-blue-500/20 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm">
                    <FontAwesomeIcon icon={faFileContract} className="text-xs lg:text-sm" />
                    Contract Project
                  </span>
                  <span className="hidden lg:inline">{job.projectType}</span>
                  {job.category && (
                    <>
                      <span className="hidden lg:inline">•</span>
                      <span className="hidden lg:inline">{job.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 w-full lg:w-auto justify-end">
              <button
                onClick={handleFavoriteClick}
                className="p-2 lg:p-3 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              >
                <FontAwesomeIcon
                  icon={isFavorite ? faHeartSolid : faHeartRegular}
                  className={`text-lg lg:text-xl ${isFavorite ? "text-[#00FF00]" : "text-white/70"}`}
                />
              </button>
              <button
                onClick={handleSubmitProposal}
                className="px-4 lg:px-8 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all text-sm lg:text-base"
              >
                Submit Proposal
              </button>
            </div>
          </div>

          {/* Contract-specific Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-blue-400 text-sm lg:text-base" />
                <span className="text-xs lg:text-sm text-white/70">Compensation</span>
              </div>
              <div className="text-lg lg:text-2xl font-bold text-blue-400">
                ${formatCompensation(job.compensation)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-3 lg:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-white/70 text-sm lg:text-base" />
                <span className="text-xs lg:text-sm text-white/70">Est. Length</span>
              </div>
              <div className="text-sm lg:text-lg font-semibold text-green-400">
                {formatProjectLength(job.estimatedProjectLength)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-3 lg:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-white/70 text-sm lg:text-base" />
                <span className="text-xs lg:text-sm text-white/70">Apps Close</span>
              </div>
              <div className="text-sm lg:text-lg font-semibold text-orange-400">
                {getTimeRemaining() || "No deadline"}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-3 lg:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70 text-sm lg:text-base" />
                <span className="text-xs lg:text-sm text-white/70">Proposals</span>
              </div>
              <div className="text-lg lg:text-lg font-semibold">
                {mockProposals.length}
              </div>
            </div>
          </div>
        </div>

        {/* Three boxes spanning full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-3">
          {/* Tags */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 md:p-6 pt-0">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-blue-400" />
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 md:p-6 pt-0">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTools} className="text-blue-400" />
              Required Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tools?.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>

          {/* Developer Score */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 md:p-6 pt-0">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
              Recommended Score
            </h3>
            <div className="text-2xl md:text-3xl font-bold text-green-400">800</div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-6">
          {/* Left Column - Main Details */}
          <div className="xl:col-span-2 space-y-3">

            {/* Project Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
              <h2 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileText} className="text-blue-400" />
                Project Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm lg:text-base">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
                <h2 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBullseye} className="text-green-400" />
                  Required Deliverables
                </h2>
                <ul className="space-y-2 lg:space-y-3">
                  {job.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80 text-sm lg:text-base">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Description */}
            {job.projectDescription && job.projectOverview && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
                <h2 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4">Project Description</h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm lg:text-base">
                  {job.projectDescription}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
                <h2 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4">Contract Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-white/80 text-sm lg:text-base">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Milestones */}
            {job.milestones && job.milestones.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-0">
                <h2 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-400" />
                  Project Milestones
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  {job.milestones.map((milestone, index) => (
                    <div key={index} className="bg-black/30 p-3 lg:p-4 rounded-lg border border-purple-500/30">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-base lg:text-lg">{milestone.title}</h3>
                        <span className="text-green-400 font-bold text-sm lg:text-base">${milestone.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-white/70 text-xs lg:text-sm">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3">
            {/* Current Proposals with Sorting */}
            <SortableProposalList 
              mockProposals={mockProposals} 
              getTimeAgo={getTimeAgo} 
              handleSubmitProposal={handleSubmitProposal} 
            />

            {/* Contract Terms */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 mt-4 pt-0 border border-blue-500/30">
              <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faHandshake} className="text-blue-400" />
                Contract Terms
              </h3>
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                {job.contractStartTime && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Project Start:</span>
                    <span className="font-semibold">{formatDate(job.contractStartTime)}</span>
                  </div>
                )}
                {job.contractEndTime && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Project End:</span>
                    <span className="font-semibold">{formatDate(job.contractEndTime)}</span>
                  </div>
                )}
                
                {job.revisionCost && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Revision Cost:</span>
                    <span className="font-semibold">${job.revisionCost}</span>
                  </div>
                )}
                {job.prepaidRevisions && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Included Revisions:</span>
                    <span className="font-semibold">{job.prepaidRevisions}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Payment Terms:</span>
                  <span className="font-semibold">Milestone-based</span>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
              <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">Client Information</h3>
              <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Client Rating:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">4.8</span>
                    <FontAwesomeIcon icon={faMedal} className="text-yellow-400 text-xs" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Projects Posted:</span>
                  <span>23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Avg. Budget:</span>
                  <span>$2,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Payment Method:</span>
                  <span className="text-green-400">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Response Time:</span>
                  <span>~2 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Windows-style Project Files Section */}
        <div className="mt-4">
          <WindowsFileExplorer files={[]} />
        </div>
      </div>
    </div>
  );
};

export default ContractJobDetails;