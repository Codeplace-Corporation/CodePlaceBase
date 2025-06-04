import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faClock,
  faUser,
  faTag,
  faTools,
  faArrowLeft,
  faHeart as faHeartSolid,
  faFileText,
  faRocket,
  faMedal,
  faFlag,
  faChevronUp,
  faBullseye,
  faShieldAlt,
  faChartLine,
  faDollarSign,
  faDownload,
  faFile,
  faImage,
  faVideo,
  faArchive,
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
  challengeType?: string;
  difficulty?: string;
  developerScore?: number;
  participantLimit?: number;
  currentParticipants?: number;
  challengeRules?: string[];
  leaderboard?: Array<{
    rank: number;
    name: string;
    score?: number;
    completionTime?: string;
    avatar?: string;
    status?: 'Submitted' | 'Interested';
  }>;
  challengeStartTime?: string;
  submissionFormat?: string;
  testCases?: string[];
  [key: string]: any;
}

interface ChallengeJobDetailsProps {
  job: JobData;
  onBack: () => void;
}

// Define types for the sortable component
interface LeaderboardEntry {
  rank: number;
  name: string;
  score?: number;
  completionTime?: string;
  avatar?: string;
  status?: 'Submitted' | 'Interested';
}

interface SortConfig {
  key: 'score' | 'time' | 'status' | null;
  direction: 'asc' | 'desc';
}

interface SortableLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  getTimeAgo: (dateString: string) => string;
  handleJoinChallenge: () => void;
}

// Sortable Leaderboard Component
const SortableLeaderboard: React.FC<SortableLeaderboardProps> = ({ 
  leaderboard, 
  getTimeAgo, 
  handleJoinChallenge 
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });

  // Sort function
  const getSortedEntries = (): LeaderboardEntry[] => {
    if (!sortConfig.key) return leaderboard;
    
    return [...leaderboard].sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      
      if (sortConfig.key === 'score') {
        aValue = a.score || 0;
        bValue = b.score || 0;
      } else if (sortConfig.key === 'time') {
        // Convert time strings to numbers for comparison (assuming MM:SS format)
        const parseTime = (timeStr: string) => {
          if (!timeStr) return 999999;
          const parts = timeStr.split(':');
          return parseInt(parts[0]) * 60 + parseInt(parts[1] || '0');
        };
        aValue = parseTime(a.completionTime || '');
        bValue = parseTime(b.completionTime || '');
      } else if (sortConfig.key === 'status') {
        aValue = a.status || 'Interested';
        bValue = b.status || 'Interested';
        // For string comparison
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      } else {
        return 0;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }
      
      return 0;
    });
  };

  // Handle sort toggle
  const handleSort = (key: 'score' | 'time' | 'status'): void => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get arrow icon and styling
  const getSortIcon = (key: 'score' | 'time' | 'status') => {
    if (sortConfig.key !== key) {
      return {
        icon: faChevronUp,
        className: "text-white/30 hover:text-white/60 transition-all duration-300 transform rotate-0"
      };
    }
    
    return {
      icon: faChevronUp,
      className: sortConfig.direction === 'asc' 
        ? "text-green-400 transform scale-110 rotate-0 transition-all duration-300" 
        : "text-green-400 transform scale-110 rotate-180 transition-all duration-300"
    };
  };

  const getStatusColor = (status: 'Submitted' | 'Interested' | undefined) => {
    switch (status) {
      case 'Submitted': return 'text-green-400';
      case 'Interested': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const sortedEntries = getSortedEntries();
  const totalParticipants = leaderboard.length;

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 pl-1 pr-2 pt-0 mt-4">
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faUser} className="text-green-400 text-sm" />
          Challenge Participants
        </h3>
        <span className="text-xs text-white/80 bg-green-500/20 px-2 py-1 rounded-full mt-3 font-semibold">
          {totalParticipants} Participants
        </span>
      </div>
      
      {/* Table Header with sortable arrows */}
      <div className="flex items-center px-3 py-2 mb-0 mt-0">
        <div className="text-xs font-semibold text-white/70 flex-1">Participant</div>
        
        {/* Sortable Score Header */}
        <div className="text-xs font-semibold text-white/70 w-16 flex items-center justify-start gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'score' ? 'text-green-400' : 'text-white/70'
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
        
        {/* Sortable Status Header */}
        <div className="text-xs font-semibold text-white/70 w-20 ml-1 flex items-center justify-start -mr-4 ml-3 gap-1">
          <span 
            className={`transition-all duration-200 ${
              sortConfig.key === 'status' ? 'text-green-400' : 'text-white/70'
            }`}
          >
            Status
          </span>
          <button
            onClick={() => handleSort('status')}
            className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10"
          >
            <FontAwesomeIcon 
              icon={getSortIcon('status').icon}
              className={`text-[0.6rem] ${getSortIcon('status').className}`}
            />
          </button>
        </div>
      </div>

      {/* Inner container for all participants */}
      <div className="bg-gray-800/30 rounded-lg p-1">
        <div className="space-y-1">
          {sortedEntries.map((entry: LeaderboardEntry, index: number) => (
            <div 
              key={`${entry.name}-${index}`} 
              className="flex items-center pl-1 pr-1 hover:bg-white/5 rounded-[1rem] transition-all duration-200 bg-black/40 hover:border-green-500/30 cursor-pointer"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: sortConfig.key ? 'fadeInSlide 0.3s ease-out forwards' : 'none'
              }}
              title={`${entry.name} - Status: ${entry.status || 'Interested'}${entry.score ? ` - Score: ${entry.score}` : ''}${entry.completionTime ? ` - Time: ${entry.completionTime}` : ''}`}
            >
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <img 
                  src={entry.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`} 
                  alt={entry.name}
                  className="w-3.5 h-3.5 rounded-full bg-gray-600 border border-green-500/30 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-medium text-white text-[0.65rem] truncate">{entry.name}</h4>
                </div>
              </div>
              
              <div className="w-16">
                <span 
                  className={`text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'score' ? 'text-green-300 transform scale-105' : 'text-green-300'
                  }`}
                >
                  {entry.score || 'N/A'}
                </span>
              </div>
              
              <div className="w-20 -mr-2">
                <span 
                  className={`font-semibold text-[0.65rem] transition-all duration-200 ${
                    sortConfig.key === 'status' ? 'transform scale-105' : ''
                  } ${getStatusColor(entry.status)}`}
                >
                  {entry.status || 'Interested'}
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
    'Challenge Resources': [
      {
        name: "algorithm_challenges.pdf",
        type: "document",
        size: "3.2 MB",
        modified: "2025-01-28 14:30",
        url: "#"
      },
      {
        name: "coding_guidelines.pdf",
        type: "document",
        size: "1.1 MB",
        modified: "2025-01-29 09:15",
        url: "#"
      },
      {
        name: "submission_template.docx",
        type: "document",
        size: "245 KB",
        modified: "2025-01-30 08:20",
        url: "#"
      },
      {
        name: "challenge_overview.pdf",
        type: "document",
        size: "1.8 MB",
        modified: "2025-01-27 16:45",
        url: "#"
      }
    ],
    'Test Data': [
      {
        name: "sample_inputs.zip",
        type: "archive",
        size: "2.8 MB",
        modified: "2025-01-30 11:45",
        url: "#"
      },
      {
        name: "expected_outputs.zip",
        type: "archive",
        size: "1.9 MB",
        modified: "2025-01-30 16:20",
        url: "#"
      },
      {
        name: "test_cases.json",
        type: "data",
        size: "456 KB",
        modified: "2025-01-30 10:30",
        url: "#"
      },
      {
        name: "large_dataset.zip",
        type: "archive",
        size: "15.7 MB",
        modified: "2025-01-29 14:15",
        url: "#"
      },
      {
        name: "edge_cases.txt",
        type: "text",
        size: "89 KB",
        modified: "2025-01-30 09:30",
        url: "#"
      }
    ],
    'Reference Materials': [
      {
        name: "algorithm_complexity_guide.xlsx",
        type: "spreadsheet",
        size: "892 KB",
        modified: "2025-01-27 15:45",
        url: "#"
      },
      {
        name: "best_practices.pdf",
        type: "document",
        size: "2.1 MB",
        modified: "2025-01-28 13:20",
        url: "#"
      },
      {
        name: "solution_template.py",
        type: "code",
        size: "12 KB",
        modified: "2025-01-29 16:45",
        url: "#"
      },
      {
        name: "data_structures_cheat_sheet.pdf",
        type: "document",
        size: "3.4 MB",
        modified: "2025-01-26 11:30",
        url: "#"
      },
      {
        name: "optimization_techniques.docx",
        type: "document",
        size: "1.2 MB",
        modified: "2025-01-28 10:15",
        url: "#"
      },
      {
        name: "example_solutions.zip",
        type: "archive",
        size: "5.6 MB",
        modified: "2025-01-29 13:45",
        url: "#"
      }
    ],
    'Starter Code': [
      {
        name: "python_template.py",
        type: "code",
        size: "8 KB",
        modified: "2025-01-30 12:00",
        url: "#"
      },
      {
        name: "javascript_template.js",
        type: "code",
        size: "6 KB",
        modified: "2025-01-30 12:05",
        url: "#"
      },
      {
        name: "java_template.java",
        type: "code",
        size: "10 KB",
        modified: "2025-01-30 12:10",
        url: "#"
      },
      {
        name: "cpp_template.cpp",
        type: "code",
        size: "7 KB",
        modified: "2025-01-30 12:15",
        url: "#"
      },
      {
        name: "utility_functions.py",
        type: "code",
        size: "15 KB",
        modified: "2025-01-29 17:30",
        url: "#"
      }
    ],
    'Video Tutorials': [
      {
        name: "dynamic_programming_explained.mp4",
        type: "video",
        size: "45.2 MB",
        modified: "2025-01-25 14:20",
        url: "#"
      },
      {
        name: "graph_algorithms_walkthrough.mp4",
        type: "video",
        size: "62.8 MB",
        modified: "2025-01-26 09:45",
        url: "#"
      },
      {
        name: "optimization_strategies.mp4",
        type: "video",
        size: "38.1 MB",
        modified: "2025-01-27 11:15",
        url: "#"
      }
    ]
  };

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-1">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faFolder} className="text-green-400" />
        Challenge Files & Resources
      </h2>
      
      {/* Windows-style file explorer */}
      <div className="bg-gray-900/50 border border-gray-600 rounded-lg overflow-hidden">
        {/* Header bar */}
        <div className="bg-gray-800/70 px-4 py-2 border-b border-gray-600">
          <div className="flex items-center text-xs text-white/70">
            <div className="flex-1">Name</div>
            <div className="w-20 text-center">Size</div>
            <div className="w-32 text-center">Date Modified</div>
            <div className="w-16 text-center">Actions</div>
          </div>
        </div>
        
        {/* File list */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(organizedFiles).map(([folderName, folderFiles]) => (
            <div key={folderName}>
              {/* Folder header */}
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
                <div className="w-16"></div>
              </div>
              
              {/* Folder contents */}
              {expandedFolders.has(folderName) && (
                <div className="bg-gray-800/20">
                  {folderFiles.map((file, index) => {
                    const fileIcon = getWindowsFileIcon(file.name, file.type);
                    return (
                      <div 
                        key={`${folderName}-${index}`}
                        className="flex items-center px-8 py-2 hover:bg-green-600/20 cursor-pointer border-b border-gray-700/30 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <FontAwesomeIcon 
                            icon={fileIcon.icon}
                            className={`${fileIcon.color} text-sm`} 
                          />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="w-20 text-center text-xs text-white/70">
                          {file.size}
                        </div>
                        <div className="w-32 text-center text-xs text-white/70">
                          {file.modified}
                        </div>
                        <div className="w-16 text-center">
                          <button 
                            className="text-green-400 hover:text-green-300 transition-colors p-1"
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

const ChallengeJobDetails: React.FC<ChallengeJobDetailsProps> = ({ job, onBack }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleJoinChallenge = () => {
    console.log("Joining challenge:", job.id);
  };

  const formatCompensation = (compensation: string | number) => {
    if (typeof compensation === 'number') {
      return compensation.toFixed(2);
    }
    const amount = parseFloat(compensation.toString().replace(/[^0-9.-]+/g, ""));
    return isNaN(amount) ? compensation : amount.toFixed(2);
  };

  const formatProjectLength = (length: string) => {
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

  const getTimeRemaining = () => {
    if (!job.challengeCloseTime) return null;

    const end = new Date(job.challengeCloseTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Challenge Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    let date;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      case 'expert': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  // Function to get developer score color based on value
  const getDeveloperScoreColor = (score: number) => {
    if (score >= 900) return 'text-green-400';
    if (score >= 700) return 'text-yellow-400';
    if (score >= 500) return 'text-orange-400';
    return 'text-red-400';
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

  // Mock leaderboard data with status instead of rank
  const mockLeaderboard: LeaderboardEntry[] = job.leaderboard || [
    {
      rank: 1,
      name: "CodeMaster Pro",
      score: 985,
      completionTime: "02:34",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      status: "Submitted"
    },
    {
      rank: 2,
      name: "DevNinja",
      score: 962,
      completionTime: "03:12",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b74bb76d?w=40&h=40&fit=crop&crop=face",
      status: "Submitted"
    },
    {
      rank: 3,
      name: "AlgoExpert",
      score: 945,
      completionTime: "03:45",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      status: "Submitted"
    },
    {
      rank: 4,
      name: "ByteCoder",
      score: 0,
      completionTime: "",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      status: "Interested"
    },
    {
      rank: 5,
      name: "TechSavvy",
      score: 0,
      completionTime: "",
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face",
      status: "Interested"
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

        {/* Challenge Job Header */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <FontAwesomeIcon icon={faTrophy} className="text-green-400 text-4xl" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{job.projectTitle}</h1>
                <div className="flex items-center gap-4 text-white/70">
                  <span className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                    <FontAwesomeIcon icon={faTrophy} className="text-sm" />
                    Coding Challenge
                  </span>
                  <span>{job.projectType}</span>
                  {job.difficulty && (
                    <>
                      <span>•</span>
                      <span className={`font-semibold ${getDifficultyColor(job.difficulty)}`}>
                        {job.difficulty}
                      </span>
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
                  className={`text-xl ${isFavorite ? "text-[#00FF00]" : "text-white/70"}`}
                />
              </button>
              <button
                onClick={handleJoinChallenge}
                className="whitespace-nowrap px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Join Challenge
              </button>
            </div>
          </div>

          {/* Challenge-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-400" />
                <span className="text-sm text-white/70">Compensation</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                ${formatCompensation(job.compensation)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-white/70" />
                <span className="text-sm text-white/70">Time Remaining</span>
              </div>
              <div className="text-lg font-semibold text-green-400">
                {getTimeRemaining() || "No deadline"}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faRocket} className="text-white/70" />
                <span className="text-sm text-white/70">Estimated Length</span>
              </div>
              <div className="text-lg font-semibold">
                {formatProjectLength(job.estimatedProjectLength)}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70" />
                <span className="text-sm text-white/70">Submissions</span>
              </div>
              <div className="text-lg font-semibold">
                {job.currentParticipants || mockLeaderboard.length}
              </div>
            </div>
          </div>
        </div>

        {/* Three boxes spanning full width */}
        <div className="grid grid-cols-3 gap-6 mb-3">
          {/* Tags */}
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg pt-0 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-green-400" />
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
              <FontAwesomeIcon icon={faTools} className="text-green-400" />
              Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.tools?.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
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
            <div className={`text-3xl font-bold ${getDeveloperScoreColor(job.developerScore || 750)}`}>
              {job.developerScore || '750'}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-3">
            {/* Challenge Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 mt-4 pt-1">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-green-400" />
                Challenge Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            {job.deliverables && job.deliverables.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-1">
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

            {/* Project Description */}
            {job.projectDescription && job.projectOverview && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-1">
                <h2 className="text-2xl font-bold mb-4">
                  Project Description
                </h2>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {job.projectDescription}
                </p>
              </div>
            )}

            {/* Challenge Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-1">
                <h2 className="text-2xl font-bold mb-4">
                  Challenge Requirements
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-white/80">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3">
           
            {/* Current Leaderboard with Sorting */}
            <SortableLeaderboard 
              leaderboard={mockLeaderboard} 
              getTimeAgo={getTimeAgo} 
              handleJoinChallenge={handleJoinChallenge} 
            />

            {/* Challenge Terms */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-0 border border-green-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileText} className="text-green-400" />
                Challenge Terms
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {job.challengeStartTime && (
                  <div>
                    <span className="text-white/50">Challenge Start:</span>
                    <div className="font-semibold">{formatDate(job.challengeStartTime)}</div>
                  </div>
                )}
                {job.challengeCloseTime && (
                  <div>
                    <span className="text-white/50">Challenge End:</span>
                    <div className="font-semibold">{formatDate(job.challengeCloseTime)}</div>
                  </div>
                )}
                <div>
                  <span className="text-white/50">Duration:</span>
                  <div className="font-semibold">{formatProjectLength(job.estimatedProjectLength)}</div>
                </div>
                {job.challengeType && (
                  <div>
                    <span className="text-white/50">Challenge Type:</span>
                    <div className="font-semibold text-green-300">{job.challengeType}</div>
                  </div>
                )}
                {job.submissionFormat && (
                  <div>
                    <span className="text-white/50">Submission Format:</span>
                    <div className="font-semibold">{job.submissionFormat}</div>
                  </div>
                )}
                <div>
                  <span className="text-white/50">Prize Distribution:</span>
                  <div className="font-semibold">Winner takes all</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
              <h3 className="text-xl font-bold mb-4">Client Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Client Rating:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">4.9</span>
                    <FontAwesomeIcon icon={faMedal} className="text-yellow-400 text-xs" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Challenges Hosted:</span>
                  <span>47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Avg. Prize Pool:</span>
                  <span>$3,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Verification:</span>
                  <span className="text-green-400">Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Response Time:</span>
                  <span>~1 hour</span>
                </div>
                {job.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Created By:</span>
                    <span>{job.createdBy}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Created:</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Location:</span>
                    <span>{job.location}</span>
                  </div>
                )}
                {job.remote !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Remote Participation:</span>
                    <span className={job.remote ? "text-green-400" : "text-red-400"}>
                      {job.remote ? "Yes" : "No"}
                    </span>
                  </div>
                )}
                {job.experienceLevel && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Target Level:</span>
                    <span>{job.experienceLevel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Windows-style Challenge Files Section */}
        <div className="mt-6">
          <WindowsFileExplorer files={[]} />
        </div>
      </div>
    </div>
  );
};

export default ChallengeJobDetails;