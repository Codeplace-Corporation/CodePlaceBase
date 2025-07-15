import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../../context/AuthContext';
import { doc, getDoc, setDoc, arrayUnion, serverTimestamp, updateDoc } from 'firebase/firestore';
import Modal from '../../../components/Modal';

interface JobData {
  id: string;
  projectTitle: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: string;
  compensation: string | number;
  eprojectlength: string;
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
  bountyAmount?: string;
  bountyStartDate?: string;
  bountyStartTime?: string;
  bountyDeadline?: string;
  bountyExpiryTime?: string;
  estimatedProjectLength?: string;
  JobSubType?: string; // Added JobSubType to JobData interface
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
    <div>
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
            <span className={'transition-all duration-200 ' + (sortConfig.key === 'score' ? 'text-green-400' : 'text-white/70')}>Score</span>
            <button onClick={() => handleSort('score')} className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10">
              <FontAwesomeIcon icon={getSortIcon('score').icon} className={'text-[0.6rem] ' + getSortIcon('score').className} />
            </button>
          </div>
          {/* Sortable Status Header */}
          <div className="text-xs font-semibold text-white/70 w-20 ml-1 flex items-center justify-start -mr-4 ml-3 gap-1">
            <span className={'transition-all duration-200 ' + (sortConfig.key === 'status' ? 'text-green-400' : 'text-white/70')}>Status</span>
            <button onClick={() => handleSort('status')} className="hover:scale-110 transition-transform duration-300 p-0.5 rounded hover:bg-white/10">
              <FontAwesomeIcon icon={getSortIcon('status').icon} className={'text-[0.6rem] ' + getSortIcon('status').className} />
            </button>
          </div>
        </div>
        {/* Inner container for all participants */}
        <div className="bg-gray-800/30 rounded-lg p-1 min-h-[140px] flex items-center justify-center">
          {sortedEntries.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/60 text-base font-medium">No developers attempting</span>
            </div>
          ) : (
            <div className="space-y-1 w-full">
              {sortedEntries.map((entry: LeaderboardEntry, index: number) => (
                <div 
                  key={entry.name + '-' + index} 
                  className="flex items-center pl-1 pr-1 hover:bg-white/5 rounded-[1rem] transition-all duration-200 bg-black/40 hover:border-green-500/30 cursor-pointer"
                  style={{
                    animationDelay: (index * 50) + 'ms',
                    animation: sortConfig.key ? 'fadeInSlide 0.3s ease-out forwards' : 'none'
                  }}
                  title={entry.name + ' - Status: ' + (entry.status || 'Interested') + (entry.score ? ' - Score: ' + entry.score : '') + (entry.completionTime ? ' - Time: ' + entry.completionTime : '')}
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <img 
                      src={entry.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                      alt={entry.name}
                      className="w-3.5 h-3.5 rounded-full bg-gray-600 border border-green-500/30 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-medium text-white text-[0.65rem] truncate">{entry.name}</h4>
                    </div>
                  </div>
                  <div className="w-16">
                    <span className={'text-[0.65rem] transition-all duration-200 ' + (sortConfig.key === 'score' ? 'text-green-300 transform scale-105' : 'text-green-300')}>
                      {entry.score || 'N/A'}
                    </span>
                  </div>
                  <div className="w-20 -mr-2">
                    <span className={'font-semibold text-[0.65rem] transition-all duration-200 ' + (sortConfig.key === 'status' ? 'transform scale-105' : '') + ' ' + getStatusColor(entry.status)}>
                      {entry.status || 'Interested'}
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
    </div>
  );
};

// Windows-style File System Component
const WindowsFileExplorer: React.FC<{ files: any[] }> = ({ files }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Add logging to see what files we're receiving
  useEffect(() => {
    console.log('🗂️ WindowsFileExplorer received files:', files);
    console.log('🗂️ Files length:', files?.length || 0);
    console.log('🗂️ Files structure:', files?.map(f => ({ 
      name: f.name || f.fileName, 
      type: f.type || f.fileType,
      url: f.url || f.downloadUrl 
    })));
  }, [files]);

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
  const organizeSubmittedFiles = (submittedFiles: any[]) => {
    console.log('🗂️ organizeSubmittedFiles called with:', submittedFiles);
    console.log('🗂️ Files length:', submittedFiles?.length || 0);
    
    if (!submittedFiles || submittedFiles.length === 0) {
      console.log('🗂️ No files provided, returning empty objects');
      // Return empty objects if no files are provided
      return { organized: {}, folderMetadata: {} };
    }

    const organized: { [key: string]: any[] } = {};
    const folderMetadata: { [key: string]: { githubRepos: Array<{ url: string; isPrivate: boolean; name?: string }> } } = {};

    submittedFiles.forEach((file, index) => {
      console.log(`🔍 Processing file ${index + 1}:`, file);
      console.log(`🔍 File keys:`, Object.keys(file));
      console.log(`🔍 File URL:`, file.url);
      console.log(`🔍 File permissions:`, file.permissions);
      let category = 'Other Files';
      let githubRepo: { url: string; isPrivate: boolean; name?: string } | null = null;

      // Handle GitHub repositories stored as pseudo-files (name starts with "github:")
      if (file.name?.startsWith('github:')) {
        category = 'GitHub Repositories';
        const repoUrl = file.name.replace('github:', '');
        githubRepo = {
          url: repoUrl,
          isPrivate: file.permissions?.visibility === 'participants-only' || false,
          name: file.name
        };
      } else if (file.type?.startsWith('image/')) {
        category = 'Images';
      } else if (file.type?.includes('pdf') || file.name?.toLowerCase().includes('.pdf')) {
        category = 'Documents';
      } else if (file.type?.includes('video') || file.name?.toLowerCase().match(/\.(mp4|avi|mov|wmv)$/)) {
        category = 'Videos';
      } else if (file.name?.toLowerCase().match(/\.(zip|rar|7z|tar|gz)$/)) {
        category = 'Archives';
      } else if (file.name?.toLowerCase().match(/\.(js|ts|jsx|tsx|html|css|py|java|cpp|c|cs|php|rb|go|rs)$/)) {
        category = 'Code Files';
      }

      if (!organized[category]) {
        organized[category] = [];
        folderMetadata[category] = { githubRepos: [] };
      }

      // Normalize the file object to ensure it has the correct structure
      const normalizedFile = {
        name: file.name || file.fileName || 'Unknown File',
        type: file.type || file.fileType || 'unknown',
        size: file.size || file.fileSize || 'Unknown',
        modified: file.modified || file.lastModified || file.createdAt || file.uploadedAt || new Date().toISOString(),
        url: file.url || file.downloadUrl || file.path || '#',
        bytes: file.size || file.fileSize || 0,
        id: file.id || file._id,
        uploadedBy: file.uploadedBy || file.submittedBy,
        permissions: file.permissions || {
          visibility: 'public',
          downloadable: true,
          viewable: true
        }
      };

      console.log(`🔍 Normalized file ${index + 1}:`, normalizedFile);
      console.log(`🔍 Normalized URL:`, normalizedFile.url);
      console.log(`🔍 Normalized permissions:`, normalizedFile.permissions);

      organized[category].push(normalizedFile);
      if (githubRepo) {
        folderMetadata[category].githubRepos.push(githubRepo);
      }
    });

    console.log('🗂️ Final organized result:', organized);
    console.log('🗂️ Final folder metadata:', folderMetadata);
    return { organized, folderMetadata };
  };

  const { organized, folderMetadata } = organizeSubmittedFiles(files);

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
      <h2 className="text-lg lg:text-2xl font-bold mb-4 lg:mb-6 flex items-center gap-2">
        <FontAwesomeIcon icon={faFolder} className="text-orange-400" />
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
            <div className="w-16 lg:w-24 text-center">Actions</div>
          </div>
        </div>
        
        {/* File list */}
        <div className="max-h-80 lg:max-h-96 overflow-y-auto">
          {Object.entries(organized).map(([folderName, folderFiles]) => (
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
                  <span className="text-xs text-white/50">({folderFiles.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">
                    {folderFiles.length} files
                  </span>
                </div>
              </div>
              
              {/* Folder contents */}
              {expandedFolders.has(folderName) && (
                <div className="bg-gray-800/30">
                  {/* GitHub Repositories Section */}
                  {folderName === 'GitHub Repositories' && folderMetadata[folderName]?.githubRepos?.map((repo, index) => (
                    <div key={`repo-${index}`} className="px-4 py-2 border-b border-gray-700/30">
                      <GitHubRepoLink repoUrl={repo.url} isPrivate={repo.isPrivate} />
                    </div>
                  ))}
                  
                  {/* Regular Files Section */}
                  {folderFiles.map((file, index) => {
                    // Skip GitHub repos as they're handled separately
                    if (file.name?.startsWith('github:')) return null;
                    
                    const fileIcon = getWindowsFileIcon(file.name, file.type);
                    const fileSize = file.size || 'Unknown';
                    const fileDate = file.modified || new Date();
                    const isPublic = file.permissions && (file.permissions.visibility === 'public' || file.permissions.viewable);
                    const isDownloadable = file.permissions && file.permissions.downloadable;
                    const isViewable = file.permissions && file.permissions.viewable;
                    
                    console.log(`🔍 File ${index} in ${folderName}:`, {
                      name: file.name,
                      url: file.url,
                      permissions: file.permissions,
                      isPublic,
                      isDownloadable,
                      isViewable
                    });

                    return (
                      <div key={index} className="flex items-center px-4 py-2 hover:bg-gray-700/30 border-b border-gray-700/30">
                        <div className="flex items-center gap-2 flex-1">
                          <FontAwesomeIcon 
                            icon={fileIcon.icon} 
                            className={`text-xs lg:text-sm ${fileIcon.color}`} 
                          />
                          <span className="text-xs lg:text-sm truncate">
                            {file.name || 'Unknown file'}
                          </span>
                        </div>
                        <div className="w-16 lg:w-20 text-center text-xs text-white/50">
                          {fileSize}
                        </div>
                        <div className="w-24 lg:w-32 text-center text-xs text-white/50">
                          {formatDate(fileDate)}
                        </div>
                        <div className="w-16 lg:w-24 text-center flex gap-1 justify-center">
                          {isPublic ? (
                            <>
                              {isViewable && (
                                <button 
                                  className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                  title="View file"
                                  onClick={e => {
                                    e.stopPropagation();
                                    console.log('🔍 View button clicked for file:', file.name);
                                    console.log('🔍 File URL:', file.url);
                                    if (file.url && file.url !== '#') {
                                      console.log('🔍 Opening file in new tab:', file.url);
                                      window.open(file.url, '_blank');
                                    } else {
                                      console.log('🔍 Cannot view file - invalid URL:', file.url);
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
                                  onClick={e => {
                                    e.stopPropagation();
                                    console.log('🔍 Download button clicked for file:', file.name);
                                    console.log('🔍 File URL:', file.url);
                                    if (file.url && file.url !== '#') {
                                      console.log('🔍 Downloading file:', file.url);
                                      // Force download by creating a blob and downloading it
                                      fetch(file.url)
                                        .then(response => response.blob())
                                        .then(blob => {
                                          const url = window.URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = file.name;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          window.URL.revokeObjectURL(url);
                                        })
                                        .catch(error => {
                                          console.error('🔍 Error downloading file:', error);
                                          // Fallback to direct download
                                          const link = document.createElement('a');
                                          link.href = file.url;
                                          link.download = file.name;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        });
                                    } else {
                                      console.log('🔍 Cannot download file - invalid URL:', file.url);
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
          
          {/* Empty state */}
          {Object.keys(organized).length === 0 && (
            <div className="px-4 py-8 text-center text-white/50">
              <FontAwesomeIcon icon={faFolder} className="text-4xl mb-2" />
              <p>No files available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

const ChallengeJobDetails: React.FC<ChallengeJobDetailsProps> = (props) => {
  const { job, onBack } = props;
  const { currentUser } = useAuth();
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Developer Score Calculation Function
  const getRecommendedDeveloperScore = (jobData: JobData | null): number => {
    // Add null check at the beginning of the function
    if (!jobData) {
      return 1000; // Default score for null job data
    }

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
    const finalCompensation = jobData.bountyAmount || jobData.compensation || 0;
    const base = complexityBaseScores[difficultyOrComplexity] || complexityBaseScores['simple'];
    const adjustment = getCompensationAdjustment(finalCompensation);
    return Math.round(base + adjustment);
  };

  // Calculate the recommended score
  const recommendedScore = getRecommendedDeveloperScore(job);

  // Helper functions for displaying score breakdown
  const getBaseScore = (difficulty?: string): number => {
    const complexityBaseScores: { [key: string]: number } = {
      'easy': 1000, 'simple': 1000, 'moderate': 1400, 'medium': 1400,
      'complex': 1800, 'hard': 1800, 'expert': 2200,
    };
    return complexityBaseScores[(difficulty || 'simple').toLowerCase()] || 1000;
  };

  const getCompensationBonus = (compensation?: string | number): number => {
    const numericCompensation = typeof compensation === 'number' 
      ? compensation 
      : parseFloat(String(compensation || 0).replace(/[^0-9.-]+/g, "")) || 0;
    return Math.round(Math.log10(numericCompensation + 1) * 100);
  };

  // Move useEffect hooks below recommendedScore declaration
  useEffect(() => {
    if (job) {
      console.log('='.repeat(80));
      console.log('🎯 CHALLENGE JOB DETAILS - RECEIVED DATA');
      console.log('='.repeat(80));
      
      // Log the entire job object
      console.log('📋 Complete Job Object:', job);
      console.log('');
      
      // Log specific fields that are relevant to the bug
      console.log('🔍 KEY FIELDS ANALYSIS:');
      console.log('- Job ID:', job.id);
      console.log('- Project Title:', job.projectTitle);
      console.log('- Selected Job Post Type:', job.selectedJobPostType);
      console.log('- Estimated Project Length:', job.eprojectlength);
      console.log('- Job SubType (if exists):', job.JobSubType || 'NOT SET');
      console.log('- Challenge Type:', job.challengeType || 'NOT SET');
      console.log('- Compensation:', job.compensation);
      console.log('- Bounty Amount:', job.bountyAmount || 'NOT SET');
      console.log('- Difficulty:', job.difficulty);
      console.log('- Recommended Score (Calculated):', recommendedScore);
      console.log('');

      // Log all available properties
      console.log('📝 ALL AVAILABLE PROPERTIES:');
      Object.keys(job).forEach(key => {
        const value = job[key];
        console.log(`- ${key}:`, value);
      });
      console.log('');

      // Check for the specific bug we're tracking
      if (job.eprojectlength === 'open-challenge') {
        console.error('🚨 BUG DETECTED: eprojectlength contains "open-challenge"');
        console.error('This should contain a duration value like "1-day", "2-weeks", etc.');
      } else {
        console.log('✅ eprojectlength appears to have valid value:', job.eprojectlength);
      }

      // Check data types
      console.log('🔍 DATA TYPES:');
      console.log('- typeof eprojectlength:', typeof job.eprojectlength);
      console.log('- typeof compensation:', typeof job.compensation);
      console.log('- typeof bountyAmount:', typeof job.bountyAmount);
      
      console.log('='.repeat(80));
    }
  }, [job, recommendedScore]);

  useEffect(() => {
    if (job) {
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
    }
  }, [currentUser, job]);

  // Null check for job for rendering only
  if (!job) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Loading Challenge Details...</h2>
        <p className="text-white/70">Please wait while we load the challenge information.</p>
      </div>
    );
  }

  // Helper functions for displaying score breakdown
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

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
  };

  const handleJoinChallenge = async () => {
    setShowJoinModal(true);
    // Only add to active jobs if this is an open challenge and user is logged in
    if (
      (job.JobSubType === 'Open Challenge' || job.JobSubType === 'open-challenge') &&
      currentUser?.uid
    ) {
      try {
        // Add job to activeJobs collection with participant info
        const activeJobsRef = collection(firestore, 'activeJobs');
        const jobData = {
          ...job,
          joinedBy: currentUser.uid,
          joinedAt: serverTimestamp(),
        };
        const docRef = await addDoc(activeJobsRef, jobData);
        // Optionally, add jobId to user's profile (postedJobs or joinedChallenges)
        const userRef = doc(firestore, 'users', currentUser.uid);
        await setDoc(
          userRef,
          {
            joinedChallenges: arrayUnion({
              jobId: docRef.id,
              jobTitle: job.projectTitle,
              jobType: job.selectedJobPostType,
              status: 'active',
              joinedAt: serverTimestamp(),
            })
          },
          { merge: true }
        );
        // Add user to currentAttempts of the job (in activeJobs or staged_jobs)
        // Try to update the job in activeJobs first
        try {
          const joinedUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email || 'Anonymous',
            joinedAt: serverTimestamp(),
            status: 'Interested',
          };
          const jobDocRef = doc(firestore, 'activeJobs', job.id);
          await updateDoc(jobDocRef, {
            currentAttempts: arrayUnion(joinedUser)
          });
        } catch (err) {
          // If not found in activeJobs, try staged_jobs
          try {
            const jobDocRef = doc(firestore, 'staged_jobs', job.id);
            await updateDoc(jobDocRef, {
              currentAttempts: arrayUnion({
                uid: currentUser.uid,
                displayName: currentUser.displayName || currentUser.email || 'Anonymous',
                joinedAt: serverTimestamp(),
                status: 'Interested',
              })
            });
          } catch (err2) {
            console.error('Could not update currentAttempts in activeJobs or staged_jobs:', err2);
          }
        }
      } catch (err) {
        console.error('Error joining open challenge:', err);
      }
    }
    console.log('Joining challenge:', job.id);
  };

  const formatCompensation = (amount?: string | number) => {
    // For challenges, use Amount field first, then fall back to bountyAmount and compensation
    const value = job.Amount || job.bountyAmount || amount;
    console.log('💰 formatCompensation called with:', { 
      Amount: job.Amount, 
      bountyAmount: job.bountyAmount, 
      amount, 
      finalValue: value 
    });
    
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return isNaN(parsed) ? value : parsed.toFixed(2);
    }
    return '0.00';
  };

  // Helper to convert 12-hour time (e.g., '09:00 PM') to 24-hour (e.g., '21:00')
  function to24Hour(time12: string): string {
    console.log('🔍 to24Hour called with:', time12);
    
    if (!time12) {
      console.log('❌ Empty time string');
      return '';
    }
    
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    console.log('🔍 Regex match result:', match);
    
    if (!match) {
      console.log('🔍 No 12-hour format match, returning original:', time12);
      return time12; // Already 24-hour or invalid
    }
    
    let [_, hours, minutes, period] = match;
    console.log('🔍 Parsed components:', { hours, minutes, period });
    
    let h = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    
    const result = `${h.toString().padStart(2, '0')}:${minutes}`;
    console.log('🔍 Converted to 24-hour:', result);
    return result;
  }

  // Helper to format challenge end date/time properly
  const formatChallengeEnd = (deadline: string, expiryTime: string): string => {
    console.log('🔍 formatChallengeEnd called with:', { deadline, expiryTime });
    
    if (!deadline || !expiryTime) {
      console.log('❌ Missing deadline or expiryTime:', { deadline, expiryTime });
      return 'No deadline set';
    }
    
    // Convert to 24-hour if needed
    const expiryTime24 = to24Hour(expiryTime);
    console.log('🔍 Time conversion:', { original: expiryTime, converted: expiryTime24 });
    
    if (!expiryTime24.match(/^\d{2}:\d{2}$/)) {
      console.log('❌ Invalid time format after conversion:', expiryTime24);
      return 'Invalid time format';
    }
    
    // Combine into full date-time string
    const deadlineString = `${deadline}T${expiryTime24}:00`;
    console.log('🔍 Combined deadline string:', deadlineString);
    
    const deadlineDate = new Date(deadlineString);
    console.log('🔍 Parsed date object:', deadlineDate);
    console.log('🔍 Is date valid?', !isNaN(deadlineDate.getTime()));
    
    if (isNaN(deadlineDate.getTime())) {
      console.log('❌ Invalid date created from:', deadlineString);
      return 'Invalid date';
    }
    
    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('🔍 Final formatted date:', formattedDate);
    return formattedDate;
  };

  const getTimeRemaining = (): string | null => {
    const { Deadline, ExpiryTime } = job;
    console.log('🔍 getTimeRemaining called with:', { Deadline, ExpiryTime });
    
    if (!Deadline || !ExpiryTime) {
      console.log('❌ Missing Deadline or ExpiryTime:', { Deadline, ExpiryTime });
      return null;
    }

    // Convert to 24-hour if needed
    const expiryTime24 = to24Hour(ExpiryTime);
    console.log('🔍 Time conversion in getTimeRemaining:', { original: ExpiryTime, converted: expiryTime24 });
    
    if (!expiryTime24.match(/^\d{2}:\d{2}$/)) {
      console.log('❌ Invalid time format in getTimeRemaining:', expiryTime24);
      return 'No deadline';
    }

    // Combine into full date-time string
    const deadlineString = `${Deadline}T${expiryTime24}:00`;
    console.log('🔍 Combined deadline string in getTimeRemaining:', deadlineString);
    
    const deadline = new Date(deadlineString);
    console.log('🔍 Parsed date in getTimeRemaining:', deadline);
    console.log('🔍 Is date valid in getTimeRemaining?', !isNaN(deadline.getTime()));
    
    if (isNaN(deadline.getTime())) {
      console.log('❌ Invalid deadline in getTimeRemaining:', deadlineString);
      return 'Invalid deadline';
    }
    
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m remaining`;

    console.log('🔍 Final time remaining result:', result);
    return result;
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
    
    if (months > 0) return months + 'mo ago';
    if (weeks > 0) return weeks + 'w ago';
    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    if (minutes > 0) return minutes + 'm ago';
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

  // Log the eprojectlength when it's being displayed
  console.log('🎯 DISPLAYING ESTIMATED PROJECT LENGTH:', job.eprojectlength);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Green-themed Join Challenge Modal */}
      {showJoinModal && (
        <Modal
          headerTitle="Join Challenge"
          showHeader={true}
          barrierDismissable={true}
          onClose={() => setShowJoinModal(false)}
          body={
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="mb-4">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-green-500 mb-2">You have joined the challenge!</h2>
              <p className="text-green-200 mb-4">Good luck! Check your dashboard for updates and submission options.</p>
              <button
                className="mt-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
                onClick={() => setShowJoinModal(false)}
              >
                Close
              </button>
            </div>
          }
          showFooter={false}
        />
      )}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-8">

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
                  {job.JobSubType && (
                    <span className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                      {job.JobSubType}
                    </span>
                  )}
                  <span>{job.projectType}</span>
                  {job.difficulty && (
                    <>
                      <span>•</span>
                      <span className={'font-semibold ' + getDifficultyColor(job.difficulty || '')}>
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
                  className={isFavorite ? 'text-xl text-red-600' : 'text-xl text-white/70 hover:text-white'}
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
                ${formatCompensation()}
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
                {job.estimatedProjectLength || job.eprojectlength || 'Not specified'}
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg pt-2 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-green-400" />
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg pt-2 p-6">
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
          <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartLine} className="text-green-400" />
              Recommended Developer Score
            </h3>
            <div className={'text-3xl font-bold ' + getDeveloperScoreColor(recommendedScore)}>
              {recommendedScore}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-3">
            {/* Challenge Overview */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 mt-4 pt-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-green-400" />
                Challenge Overview
              </h2>
              <p className="text-white/80 leading-relaxed whitespace-pre-line">
                {job.projectOverview || job.projectDescription}
              </p>
            </div>

            {/* Required Deliverables */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBullseye} className="text-green-400" />
                Required Deliverables
              </h2>
              {job.deliverables && job.deliverables.length > 0 ? (
                <ul className="space-y-3">
                  {job.deliverables?.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-white/80">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-white/60 text-base">No deliverables specified yet.</div>
              )}
            </div>

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

            {/* Participation Requirements */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-green-400" />
                Participation Requirements
              </h2>
              {job.requirements && job.requirements.length > 0 ? (
                <ul className="space-y-3">
                  {job.requirements?.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-white/80">{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-white/60 text-base">No participation requirements specified yet.</div>
              )}
            </div>
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
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2 border border-green-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileText} className="text-green-400" />
                Challenge Terms
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {/* Challenge Start - using bountyStartDate and bountyStartTime */}
                {(job.bountyStartDate || job.bountyStartTime) && (
                  <div>
                    <span className="text-white/50">Challenge Start:</span>
                    <div className="font-semibold">
                      {job.bountyStartDate && job.bountyStartTime 
                        ? formatDate(`${job.bountyStartDate}T${job.bountyStartTime}:00`)
                        : formatDate(job.bountyStartDate || job.bountyStartTime)
                      }
                    </div>
                  </div>
                )}
                
                {/* Challenge End - using Deadline and ExpiryTime (the actual fields where data is stored) */}
                {(job.Deadline || job.ExpiryTime) && (
                  <div>
                    <span className="text-white/50">Challenge End:</span>
                    <div className="font-semibold">
                      {(() => {
                        console.log('🔍 Challenge End display - job data:', {
                          Deadline: job.Deadline,
                          ExpiryTime: job.ExpiryTime,
                          jobKeys: Object.keys(job)
                        });
                        return formatChallengeEnd(job.Deadline || '', job.ExpiryTime || '');
                      })()}
                    </div>
                  </div>
                )}
                
                {/* If no start time is available, show default */}
                {!(job.bountyStartDate || job.bountyStartTime) && (
                  <div>
                    <span className="text-white/50">Challenge Start:</span>
                    <div className="font-semibold">Immediately upon joining</div>
                  </div>
                )}
                
                {/* If no end time is available, show default */}
                {!(job.bountyDeadline || job.bountyExpiryTime) && (
                  <div>
                    <span className="text-white/50">Challenge End:</span>
                    <div className="font-semibold">No fixed deadline</div>
                  </div>
                )}
                
                <div>
                  <span className="text-white/50">Duration:</span>
                  <div className="font-semibold">{job.estimatedProjectLength || job.eprojectlength || 'Not specified'}</div>
                </div>
                
                {job.challengeType && (
                  <div>
                    <span className="text-white/50">Challenge Type:</span>
                    <div className="font-semibold text-green-300">{job.challengeType}</div>
                  </div>
                )}
                {job.JobSubType && (
                  <div>
                    <span className="text-white/50">Job Subtype:</span>
                    <div className="font-semibold">{job.JobSubType || 'Not specified'}</div>
                  </div>
                )}
                
                {/* Remove Submission Format field */}
                <div>
                  <span className="text-white/50">Prize Distribution:</span>
                  <div className="font-semibold">Winner takes all</div>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 pt-2 border border-green-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-green-400" />
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
                    <span className={job.remote ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>{job.remote ? 'Yes' : 'No'}</span>
                    {/* Debug info */}
                    <div className="text-xs text-gray-400 mt-1">Debug: remote={String(job.remote)}, type={typeof job.remote}</div>
                  </div>
                  <div>
                    <span className="text-white/50">Verified:</span>
                    <span className={currentUser?.emailVerified ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>{currentUser?.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                  {job.experienceLevel && (
                    <div>
                      <span className="text-white/50">Target Level:</span>
                      <span className="ml-2">{job.experienceLevel}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50">Job Created At:</span>
                    <span className="ml-2">{getCreatedAtString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Windows-style Challenge Files Section */}
        {(() => {
          const allFiles = [
            ...(job.projectFiles || []),
            ...(job.imageFiles || []),
            ...(job.submittedFiles || []),
            ...(job.challengeFiles || []),
            ...(job.files || [])
          ];
          
          // Only render if there are files
          if (allFiles.length === 0) {
            return null;
          }
          
          return (
            <div className="mt-4">
              <WindowsFileExplorer files={allFiles} />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ChallengeJobDetails;