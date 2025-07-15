import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../firebase';
import { getAuth } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign, 
  faClock, 
  faRocket, 
  faUser,
  faTrophy,
  faMedal,
  faEnvelope,
  faChevronLeft,
  faChevronRight,
  faFolder,
  faFolderOpen,
  faFile,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faArchive,
  faImage,
  faVideo,
  faFileCode,
  faDownload,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../../../../components/Modal';

interface ActiveJob {
  id: string;
  projectTitle: string;
  client?: string;
  deadline?: string;
  status: string;
  selectedJobPostType: string;
  tools?: Array<{ name: string }>;
  compensation?: string | number;
  estimatedProjectLength?: string;
  projectDescription?: string;
  completedMilestones?: number;
  totalMilestones?: number;
  activatedAt?: string;
  createdBy?: string;
  currentAttempts?: Array<any>;
  projectType?: string;
  tags?: string[];
  projectOverview?: string;
  requirements?: string[];
  createdAt?: string;
  JobSubType?: string;
  projectFiles?: Array<{
    name: string;
    size?: number;
    type?: string;
    uploadedAt?: string;
    downloads?: number;
    status?: string;
    description?: string;
    permissions?: 'read' | 'write' | 'admin';
  }>;
}

const ChallengeClientDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const participantsPerPage = 5;

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        // Use fake data for client view
        const fakeJob: ActiveJob = {
          id: jobId,
          projectTitle: "AI-Powered Code Review System",
          client: "TechCorp Solutions",
          deadline: "2024-02-15T23:59:59Z",
          status: "Active",
          selectedJobPostType: "Challenge",
          tools: [
            { name: "React" },
            { name: "Node.js" },
            { name: "Python" },
            { name: "Machine Learning" }
          ],
          compensation: 5000,
          estimatedProjectLength: "3 weeks",
          projectDescription: "Build an intelligent code review system that can analyze code quality, detect bugs, and provide automated feedback to developers.",
          completedMilestones: 2,
          totalMilestones: 5,
          activatedAt: "2024-01-15T10:00:00Z",
          createdBy: "client123",
          projectType: "Web Application",
          tags: ["AI", "Code Review", "Machine Learning", "React"],
          projectOverview: "Create a sophisticated code review platform that leverages AI to provide intelligent feedback on code quality, security vulnerabilities, and best practices.",
          requirements: [
            "Implement real-time code analysis",
            "Build ML model for bug detection",
            "Create intuitive UI/UX",
            "Integrate with popular IDEs",
            "Generate detailed reports"
          ],
          createdAt: "2024-01-10T08:00:00Z",
          JobSubType: "Advanced",
          currentAttempts: [
            {
              userId: "dev1",
              userName: "Alex Chen",
              submittedAt: "2024-01-20T14:30:00Z",
              status: "Active",
              progress: 85,
              score: 92,
              comment: "Excited to work on this AI challenge! I have experience with ML and code analysis.",
              submission: {
                title: "SmartCode Review v1.0",
                description: "Implemented a comprehensive code review system with ML-powered bug detection and real-time analysis.",
                submittedAt: "2024-01-25T16:45:00Z",
                status: "submitted",
                score: 92
              }
            },
            {
              userId: "dev2",
              userName: "Sarah Johnson",
              submittedAt: "2024-01-18T09:15:00Z",
              status: "Active",
              progress: 72,
              score: 88,
              comment: "Great challenge! Working on integrating multiple code analysis tools.",
              submission: {
                title: "CodeGuard AI",
                description: "Advanced code review platform with security focus and performance optimization.",
                submittedAt: "2024-01-24T11:20:00Z",
                status: "reviewing",
                score: 88
              }
            },
            {
              userId: "dev3",
              userName: "Mike Rodriguez",
              submittedAt: "2024-01-22T13:45:00Z",
              status: "Active",
              progress: 45,
              score: null,
              comment: "Challenging project! Currently working on the ML integration part.",
              submission: null
            },
            {
              userId: "dev4",
              userName: "Emily Watson",
              submittedAt: "2024-01-19T16:20:00Z",
              status: "Active",
              progress: 60,
              score: null,
              comment: "Interesting challenge. Focusing on the UI/UX aspects first.",
              submission: null
            },
            {
              userId: "dev5",
              userName: "David Kim",
              submittedAt: "2024-01-21T10:30:00Z",
              status: "Active",
              progress: 30,
              score: null,
              comment: "Just started. The requirements are quite comprehensive!",
              submission: null
            },
            // 6th participant
            {
              userId: "dev6",
              userName: "Priya Patel",
              submittedAt: "2024-01-23T12:00:00Z",
              status: "Active",
              progress: 55,
              score: 80,
              comment: "Looking forward to applying my AI experience to this challenge!",
              submission: {
                title: "AI Code Analyzer",
                description: "A robust code review tool leveraging deep learning for bug detection and code suggestions.",
                submittedAt: "2024-01-27T15:00:00Z",
                status: "submitted",
                score: 80
              }
            }
          ],
          projectFiles: [
            {
              name: "Challenge_Requirements.pdf",
              size: 2048576,
              type: "PDF",
              uploadedAt: "2024-01-15T10:00:00Z",
              downloads: 15,
              status: "Active",
              description: "Detailed challenge requirements and specifications",
              permissions: "read"
            },
            {
              name: "Sample_Code_Base.zip",
              size: 15728640,
              type: "ZIP",
              uploadedAt: "2024-01-15T10:05:00Z",
              downloads: 12,
              status: "Active",
              description: "Sample codebase for reference and testing",
              permissions: "read"
            },
            {
              name: "API_Documentation.md",
              size: 512000,
              type: "Markdown",
              uploadedAt: "2024-01-15T10:10:00Z",
              downloads: 8,
              status: "Active",
              description: "API documentation and integration guidelines",
              permissions: "read"
            },
            {
              name: "Design_Mockups.fig",
              size: 3145728,
              type: "Figma",
              uploadedAt: "2024-01-15T10:15:00Z",
              downloads: 5,
              status: "Active",
              description: "UI/UX design mockups and wireframes",
              permissions: "read"
            },
            {
              name: "Evaluation_Criteria.xlsx",
              size: 102400,
              type: "Excel",
              uploadedAt: "2024-01-15T10:20:00Z",
              downloads: 10,
              status: "Active",
              description: "Detailed evaluation criteria and scoring matrix",
              permissions: "read"
            }
          ]
        };

        setJob(fakeJob);
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const formatCompensation = (amount?: string | number) => {
    if (!amount) return '0';
    if (typeof amount === 'number') {
      return amount.toFixed(2);
    }
    return amount.toString();
  };

  const getTimeRemaining = (): string | null => {
    if (!job?.deadline) return null;
    
    const deadline = new Date(job.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'Challenge':
        return 'text-purple-600';
      case 'Bounty':
        return 'text-green-600';
      case 'Contract':
        return 'text-blue-600';
      case 'Auction':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'Challenge':
        return '🏆';
      case 'Bounty':
        return '💰';
      case 'Contract':
        return '📋';
      case 'Auction':
        return '🔨';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#080808', 
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-white/60">Loading challenge details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#080808', 
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
            <p className="text-white/60 mb-4">{error || 'Job not found'}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#080808', 
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg mb-6" style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-white">Challenge Details - Client View</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-lg font-semibold ${getJobTypeColor(job.selectedJobPostType)}`}>
                {getJobTypeIcon(job.selectedJobPostType)} {job.selectedJobPostType}
              </span>
            </div>
          </div>
        </div>

        {/* Top Card - Challenge Stats */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold mb-2">{job.projectTitle}</h2>
              <div className="flex items-center gap-4 text-white/70">
                {job.JobSubType && (
                  <span className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                    {job.JobSubType}
                  </span>
                )}
                <span>{job.projectType}</span>
                <span>•</span>
                <span className="font-semibold text-green-400">
                  Challenge Competition
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${formatCompensation()}
              </div>
              <div className="text-sm text-white/60">Prize Pool</div>
            </div>
          </div>

          {/* Challenge-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-400" />
                <span className="text-sm text-white/70">Prize Pool</span>
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
                <span className="text-sm text-white/70">Duration</span>
              </div>
              <div className="text-lg font-semibold">
                {job.estimatedProjectLength || 'Not specified'}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70" />
                <span className="text-sm text-white/70">Participants</span>
              </div>
              <div className="text-lg font-semibold">
                {job.currentAttempts?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Side - 3 Boxes */}
          <div className="space-y-6">
            {/* Box 1: Challenge Messages */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-base font-semibold text-white mb-3">Challenge Messages</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {job.currentAttempts && job.currentAttempts.length > 0 ? (
                  job.currentAttempts.map((participant: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-2 border border-white/10">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {participant.userName ? participant.userName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-xs">
                              {participant.userName || participant.userId || `Participant ${index + 1}`}
                            </span>
                            <span className="text-xs text-white/40">
                              {participant.submittedAt ? new Date(participant.submittedAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          {participant.comment && (
                            <div className="text-xs text-white/80">
                              "{participant.comment}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3">
                    <div className="text-white/40 text-xl mb-1">💬</div>
                    <div className="text-white/60 text-xs">No messages yet</div>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Time Remaining */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-base font-semibold text-white mb-3">Time Remaining</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {getTimeRemaining() || "No deadline"}
                  </div>
                  <div className="text-xs text-white/60">
                    Challenge Deadline
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs">Started</span>
                    <span className="font-semibold text-white text-xs">
                      {job.activatedAt ? new Date(job.activatedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs">Deadline</span>
                    <span className="font-semibold text-white text-xs">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-xs">Duration</span>
                    <span className="font-semibold text-white text-xs">{job.estimatedProjectLength || 'Unknown'}</span>
                  </div>
                </div>
                
                {job.deadline && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>Time Elapsed</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(() => {
                            if (!job.deadline || !job.activatedAt) return 0;
                            const start = new Date(job.activatedAt).getTime();
                            const end = new Date(job.deadline).getTime();
                            const now = new Date().getTime();
                            const elapsed = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                            return elapsed;
                          })()}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Challenge Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-base font-semibold text-white mb-3">Challenge Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Edit Challenge
                </button>
                <button className="w-full bg-white/10 text-white py-1.5 px-3 rounded-lg hover:bg-white/20 transition-colors border border-white/20 text-sm">
                  Pause Challenge
                </button>
                <button className="w-full bg-red-600 text-white py-1.5 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  End Challenge
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - 3 Boxes */}
          <div className="lg:col-span-3 space-y-6">
            {/* Box 1: Challenge Participants */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-sm font-semibold text-white mb-2">Challenge Participants</h3>
              
              {job.currentAttempts && job.currentAttempts.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-xs">Total Participants: {job.currentAttempts.length}</span>
                    <span className="text-green-400 font-semibold text-xs">{job.currentAttempts.length} Active</span>
                  </div>
                  
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {job.currentAttempts
                      .slice((currentPage - 1) * participantsPerPage, currentPage * participantsPerPage)
                      .map((participant: any, index: number) => (
                                              <div key={index} className="flex flex-row py-3 px-4 items-start border-b border-card-dark hover:bg-card-dark cursor-pointer relative">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {participant.userName ? participant.userName.charAt(0).toUpperCase() : 'P'}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-white font-semibold">
                                        {participant.userName || participant.userId || `Participant ${index + 1}`}
                                    </h3>
                                    <p className="text-white/50 text-xs">
                                        Started: {participant.submittedAt ? new Date(participant.submittedAt).toLocaleDateString() : 'Recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col ml-6">
                                <div className="flex justify-center gap-8" style={{ marginLeft: '50%' }}>
                                    <div className="text-center">
                                        <p className="text-white/50 text-xs">Status</p>
                                        <p className={`text-xs font-semibold ${
                                            participant.submission ? 'text-green-400' : 'text-yellow-400'
                                        }`}>
                                            {participant.submission ? 'Submitted' : 'Started'}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white/50 text-xs">Developer Score</p>
                                        <p className="text-white font-semibold text-sm">
                                            {participant.score ? `${participant.score}/100` : 'Not scored'}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <button 
                                            className="text-white hover:text-green-400 transition-colors p-1 mt-2"
                                            onClick={() => {
                                                console.log('Message participant:', participant.userName);
                                            }}
                                            title="Message participant"
                                        >
                                            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-4 right-5 flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${
                                    Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-400'
                                }`}></div>
                                <span className="text-xs text-white/50">
                                    {Math.random() > 0.5 ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {job.currentAttempts && job.currentAttempts.length > participantsPerPage && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      {/* Left Chevron */}
                      {currentPage > 1 && (
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-black bg-black text-white hover:bg-white hover:text-black"
                          title="Previous page"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                        </button>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil((job.currentAttempts?.length || 0) / participantsPerPage) }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors border border-black ${
                              currentPage === i + 1
                                ? 'bg-white text-black' // Active
                                : 'bg-black text-white hover:bg-white hover:text-black'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      {/* Right Chevron */}
                      {currentPage < Math.ceil((job.currentAttempts?.length || 0) / participantsPerPage) && (
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-black bg-black text-white hover:bg-white hover:text-black"
                          title="Next page"
                        >
                          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/40 text-6xl mb-4">🏆</div>
                  <div className="text-white/60 text-lg font-medium mb-2">No Participants Yet</div>
                  <div className="text-white/40 text-sm">
                    Challenge participants will appear here when they join
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: Challenge Submissions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-base font-semibold text-white mb-3">Challenge Submissions</h3>
              
              {job.currentAttempts && job.currentAttempts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/60 text-sm">Total Submissions: {job.currentAttempts.filter((p: any) => p.submission).length}</span>
                    <span className="text-green-400 font-semibold text-sm">
                      {job.currentAttempts.filter((p: any) => p.submission && p.submission.status === 'submitted').length} Submitted
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {job.currentAttempts
                      .filter((participant: any) => participant.submission)
                      .map((participant: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm">
                                {participant.userName ? participant.userName.charAt(0).toUpperCase() : 'P'}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">
                                  {participant.userName || participant.userId || `Participant ${index + 1}`}
                                </div>
                                <div className="text-xs text-white/60">
                                  Submitted: {participant.submission?.submittedAt ? new Date(participant.submission.submittedAt).toLocaleDateString() : 'Recently'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-semibold ${
                                participant.submission?.status === 'submitted' ? 'text-green-400' : 
                                participant.submission?.status === 'reviewing' ? 'text-yellow-400' : 
                                participant.submission?.status === 'approved' ? 'text-blue-400' : 
                                'text-white/60'
                              }`}>
                                {participant.submission?.status || 'Pending'}
                              </div>
                              {participant.submission?.score && (
                                <div className="text-xs text-white/60">
                                  Score: {participant.submission.score}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {participant.submission?.title && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-white mb-1">Submission Title</div>
                              <div className="text-white/80 text-xs">{participant.submission.title}</div>
                            </div>
                          )}
                          
                          {participant.submission?.description && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-white mb-1">Description</div>
                              <div className="text-white/80 text-xs">{participant.submission.description}</div>
                            </div>
                          )}
                          
                          <div className="flex gap-1 mt-3">
                            <button className="flex-1 bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 transition-colors text-xs">
                              Award Prize
                            </button>
                            <button className="flex-1 bg-yellow-600 text-white py-1 px-2 rounded-lg hover:bg-yellow-700 transition-colors text-xs">
                              Review
                            </button>
                            <button className="flex-1 bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-700 transition-colors text-xs">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/40 text-6xl mb-4">📦</div>
                  <div className="text-white/60 text-lg font-medium mb-2">No Submissions Yet</div>
                  <div className="text-white/40 text-sm">
                    Participants haven't submitted their solutions yet
                  </div>
                </div>
              )}
            </div>

            {/* Box 3: Challenge Files */}
            <WindowsFileExplorer files={job.projectFiles || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Windows-style File System Component
const WindowsFileExplorer: React.FC<{ files: any[] }> = ({ files }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileList, setFileList] = useState<any[]>(files);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  useEffect(() => {
    setFileList(files);
  }, [files]);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      url: URL.createObjectURL(file),
      permissions: 'participants',
    }));
    setFileList((prev) => [...prev, ...newFiles]);
  };

  const handleDeleteFile = (fileName: string) => {
    setFileList((prev) => prev.filter((f) => f.name !== fileName));
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const handleChangePermission = (fileName: string, newPermission: string) => {
    setFileList((prev) => prev.map((f) => f.name === fileName ? { ...f, permissions: newPermission } : f));
  };

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

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
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

  // Organize files into folders by type
  const organizeFiles = (files: any[]) => {
    if (!files || files.length === 0) return {};
    const organized: { [key: string]: any[] } = {};
    files.forEach((file) => {
      let category = 'Other Files';
      if (file.type?.startsWith('image/')) category = 'Images';
      else if (file.type?.includes('pdf') || file.name?.toLowerCase().includes('.pdf')) category = 'Documents';
      else if (file.type?.includes('video') || file.name?.toLowerCase().match(/\.(mp4|avi|mov|wmv)$/)) category = 'Videos';
      else if (file.name?.toLowerCase().match(/\.(zip|rar|7z|tar|gz)$/)) category = 'Archives';
      else if (file.name?.toLowerCase().match(/\.(js|ts|jsx|tsx|html|css|py|java|cpp|c|cs|php|rb|go|rs)$/)) category = 'Code Files';
      if (!organized[category]) organized[category] = [];
      organized[category].push(file);
    });
    return organized;
  };

  const organized = organizeFiles(fileList);

  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-3 lg:p-6 pt-1">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h2 className="text-lg lg:text-2xl font-bold flex items-center gap-2">
          <FontAwesomeIcon icon={faFolder} className="text-green-400" />
          Project Files & Resources
        </h2>
        <button
          className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.onchange = (e) => handleAddFiles(e as any);
            input.click();
          }}
        >
          + Add Files
        </button>
      </div>
      <div className="bg-gray-900/50 border border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-800/70 px-2 lg:px-4 py-2 border-b border-gray-600">
          <div className="flex items-center text-xs text-white/70">
            <div className="flex-1">Name</div>
            <div className="w-16 lg:w-20 text-center">Size</div>
            <div className="w-24 lg:w-32 text-center">Date Modified</div>
            <div className="w-32 lg:w-40 text-center">Actions</div>
          </div>
        </div>
        <div className="max-h-80 lg:max-h-96 overflow-y-auto">
          {Object.entries(organizeFiles(fileList)).map(([folderName, folderFiles]) => (
            <div key={folderName}>
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
              {expandedFolders.has(folderName) && (
                <div className="bg-gray-900/40">
                  {folderFiles.map((file, idx) => {
                    const { icon, color } = getWindowsFileIcon(file.name, file.type);
                    return (
                      <div key={file.name + idx} className="flex items-center px-2 lg:px-4 py-3 gap-x-6 border-b border-gray-800/40 text-xs lg:text-sm text-white/90 hover:bg-gray-800/30 transition-all">
                        <div className="flex-1 flex items-center gap-3 pl-2">
                          <FontAwesomeIcon icon={icon} className={color} />
                          <span>{file.name}</span>
                        </div>
                        <div className="w-16 lg:w-20 text-center">{formatFileSize(file.size)}</div>
                        <div className="w-24 lg:w-32 text-center">{formatDate(file.uploadedAt || file.modified || file.createdAt || new Date())}</div>
                        <div className="w-32 lg:w-40 text-center flex gap-4 px-2 justify-center items-center">
                          <a href={file.url || '#'} download className="text-green-400 hover:text-green-300" title="Download">
                            <FontAwesomeIcon icon={faDownload} />
                          </a>
                          <select
                            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600"
                            value={file.permissions || 'participants'}
                            onChange={e => handleChangePermission(file.name, e.target.value)}
                          >
                            <option value="participants">Participants Only</option>
                            <option value="public">Public</option>
                          </select>
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors text-xs px-2 py-1 rounded"
                            onClick={() => { setShowDeleteModal(true); setFileToDelete(file.name); }}
                            title="Delete file"
                          >
                            <FontAwesomeIcon icon={faTrash} />
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
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          headerTitle="Delete File"
          showHeader={true}
          showFooter={true}
          showCloseButton={false}
          onClose={() => { setShowDeleteModal(false); setFileToDelete(null); }}
          body={
            <div className="text-center">
              <div className="text-red-500 text-3xl mb-2">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <div className="text-white text-lg font-semibold mb-2">Are you sure you want to delete this file?</div>
              <div className="text-white/60 text-sm mb-1">This action cannot be undone.</div>
            </div>
          }
          footer={
            <div className="flex justify-center gap-6 w-full">
              <button
                className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors text-base font-medium shadow"
                onClick={() => { setShowDeleteModal(false); setFileToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-base font-semibold shadow"
                onClick={() => fileToDelete && handleDeleteFile(fileToDelete)}
              >
                Delete
              </button>
            </div>
          }
        />
      )}
      {/* Hide close (x) button in Modal header for delete confirmation */}
      <style>{`
        .modal-no-x .flex.items-start.justify-between > button { display: none !important; }
      `}</style>
    </div>
  );
};

export default ChallengeClientDetails; 