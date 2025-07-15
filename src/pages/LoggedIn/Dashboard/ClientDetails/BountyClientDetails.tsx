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
  faCrosshairs,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';

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

const BountyClientDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        const jobDoc = await getDoc(doc(firestore, 'activeJobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as ActiveJob);
        } else {
          setError('Job not found');
        }
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-white/60">Loading bounty details...</p>
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
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
              <h1 className="text-xl font-semibold text-white">Bounty Details - Client View</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-lg font-semibold ${getJobTypeColor(job.selectedJobPostType)}`}>
                {getJobTypeIcon(job.selectedJobPostType)} {job.selectedJobPostType}
              </span>
            </div>
          </div>
        </div>

        {/* Top Card - Bounty Stats */}
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
                  Bounty Hunt
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${formatCompensation()}
              </div>
              <div className="text-sm text-white/60">Bounty Reward</div>
            </div>
          </div>

          {/* Bounty-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-green-400" />
                <span className="text-sm text-white/70">Bounty Reward</span>
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
                <span className="text-sm text-white/70">Hunters</span>
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
            {/* Box 1: Bounty Overview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Status</span>
                  <span className="font-semibold text-green-400">{job.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Type</span>
                  <span className="font-semibold text-white">{job.selectedJobPostType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Posted</span>
                  <span className="font-semibold text-white">
                    {job.activatedAt ? new Date(job.activatedAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Deadline</span>
                  <span className="font-semibold text-white">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Bounty Details */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Duration</span>
                  <span className="font-semibold text-white">{job.estimatedProjectLength || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Reward</span>
                  <span className="font-semibold text-green-400">
                    ${typeof job.compensation === 'number' ? job.compensation.toFixed(2) : job.compensation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Hunters</span>
                  <span className="font-semibold text-white">{job.currentAttempts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Difficulty</span>
                  <span className="font-semibold text-orange-400">Medium</span>
                </div>
              </div>
            </div>

            {/* Box 3: Bounty Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Edit Bounty
                </button>
                <button className="w-full bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                  Pause Bounty
                </button>
                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                  Cancel Bounty
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - 3 Boxes */}
          <div className="lg:col-span-3 space-y-6">
            {/* Box 1: Bounty Hunters */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Hunters</h3>
              
              {job.currentAttempts && job.currentAttempts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60">Total Hunters: {job.currentAttempts.length}</span>
                    <span className="text-green-400 font-semibold">{job.currentAttempts.length} Active</span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {job.currentAttempts.map((hunter: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {hunter.userName ? hunter.userName.charAt(0).toUpperCase() : 'H'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {hunter.userName || hunter.userId || `Hunter ${index + 1}`}
                              </div>
                              <div className="text-sm text-white/60">
                                {hunter.submittedAt ? new Date(hunter.submittedAt).toLocaleDateString() : 'Recently joined'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-400">
                              {hunter.status || 'Active'}
                            </div>
                            {hunter.progress && (
                              <div className="text-xs text-white/60">
                                Progress: {hunter.progress}%
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {hunter.progress && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-white/60 mb-1">
                              <span>Progress</span>
                              <span>{hunter.progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${hunter.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {hunter.comment && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <div className="text-sm text-white/80 italic">
                              "{hunter.comment}"
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/40 text-6xl mb-4">🎯</div>
                  <div className="text-white/60 text-lg font-medium mb-2">No Hunters Yet</div>
                  <div className="text-white/40 text-sm">
                    Bounty hunters will appear here when they join
                  </div>
                </div>
              )}
            </div>

            {/* Box 2: Bounty Submissions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Bounty Submissions</h3>
              
              {job.currentAttempts && job.currentAttempts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60">Total Submissions: {job.currentAttempts.filter((h: any) => h.submission).length}</span>
                    <span className="text-green-400 font-semibold">
                      {job.currentAttempts.filter((h: any) => h.submission && h.submission.status === 'submitted').length} Submitted
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {job.currentAttempts
                      .filter((hunter: any) => hunter.submission)
                      .map((hunter: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                                {hunter.userName ? hunter.userName.charAt(0).toUpperCase() : 'H'}
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {hunter.userName || hunter.userId || `Hunter ${index + 1}`}
                                </div>
                                <div className="text-sm text-white/60">
                                  Submitted: {hunter.submission?.submittedAt ? new Date(hunter.submission.submittedAt).toLocaleDateString() : 'Recently'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-semibold ${
                                hunter.submission?.status === 'submitted' ? 'text-green-400' : 
                                hunter.submission?.status === 'reviewing' ? 'text-yellow-400' : 
                                hunter.submission?.status === 'approved' ? 'text-blue-400' : 
                                'text-white/60'
                              }`}>
                                {hunter.submission?.status || 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          {hunter.submission?.title && (
                            <div className="mb-3">
                              <div className="text-sm font-medium text-white mb-1">Submission Title</div>
                              <div className="text-white/80">{hunter.submission.title}</div>
                            </div>
                          )}
                          
                          {hunter.submission?.description && (
                            <div className="mb-3">
                              <div className="text-sm font-medium text-white mb-1">Description</div>
                              <div className="text-white/80 text-sm">{hunter.submission.description}</div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
                              Award Bounty
                            </button>
                            <button className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                              Review
                            </button>
                            <button className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors text-sm">
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
                    Hunters haven't submitted their solutions yet
                  </div>
                </div>
              )}
            </div>

            {/* Box 3: Bounty Files */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Bounty Files</h3>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        console.log('Files selected:', files);
                      }
                    };
                    input.click();
                  }}
                >
                  + Add Files
                </button>
              </div>
              
              {job.projectFiles && job.projectFiles.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {job.projectFiles.map((file: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                            📄
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">
                              {file.name || `File ${index + 1}`}
                            </div>
                            <div className="text-sm text-white/60">
                              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-white/10 text-white text-sm px-3 py-1 rounded border border-white/20"
                            value={file.permissions || 'read'}
                            onChange={(e) => {
                              console.log('Permission changed for', file.name, 'to', e.target.value);
                            }}
                          >
                            <option value="read">Read Only</option>
                            <option value="write">Read & Write</option>
                            <option value="admin">Full Access</option>
                          </select>
                          <button 
                            className="text-red-400 hover:text-red-300 transition-colors"
                            onClick={() => {
                              console.log('Remove file:', file.name);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-white/60">Type</div>
                          <div className="text-white font-medium">{file.type || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-white/60">Uploaded</div>
                          <div className="text-white font-medium">
                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60">Downloads</div>
                          <div className="text-white font-medium">{file.downloads || 0}</div>
                        </div>
                        <div>
                          <div className="text-white/60">Status</div>
                          <div className="text-green-400 font-medium">{file.status || 'Active'}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Download
                        </button>
                        <button className="flex-1 bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/20">
                          Edit
                        </button>
                        <button className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/40 text-6xl mb-4">📁</div>
                  <div className="text-white/60 text-lg font-medium mb-2">No Bounty Files</div>
                  <div className="text-white/40 text-sm">
                    Upload files to share with hunters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyClientDetails; 