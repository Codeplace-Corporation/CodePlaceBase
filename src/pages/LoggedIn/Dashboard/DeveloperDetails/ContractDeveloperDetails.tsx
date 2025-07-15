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
  faFileContract,
  faTools,
  faChartLine
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

const ContractDeveloperDetails: React.FC = () => {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-white/60">Loading contract details...</p>
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              <h1 className="text-xl font-semibold text-white">Contract Details - Developer View</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-lg font-semibold ${getJobTypeColor(job.selectedJobPostType)}`}>
                {getJobTypeIcon(job.selectedJobPostType)} {job.selectedJobPostType}
              </span>
            </div>
          </div>
        </div>

        {/* Top Card - Contract Stats */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold mb-2">{job.projectTitle}</h2>
              <div className="flex items-center gap-4 text-white/70">
                {job.JobSubType && (
                  <span className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                    {job.JobSubType}
                  </span>
                )}
                <span>{job.projectType}</span>
                <span>•</span>
                <span className="font-semibold text-blue-400">
                  Contract Project
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">
                ${formatCompensation()}
              </div>
              <div className="text-sm text-white/60">Contract Value</div>
            </div>
          </div>

          {/* Contract-specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faDollarSign} className="text-blue-400" />
                <span className="text-sm text-white/70">Contract Value</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                ${formatCompensation()}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faClock} className="text-white/70" />
                <span className="text-sm text-white/70">Time Remaining</span>
              </div>
              <div className="text-lg font-semibold text-blue-400">
                {getTimeRemaining() || "No deadline"}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faRocket} className="text-white/70" />
                <span className="text-sm text-white/70">Project Length</span>
              </div>
              <div className="text-lg font-semibold">
                {job.estimatedProjectLength || 'Not specified'}
              </div>
            </div>
            
            <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faUser} className="text-white/70" />
                <span className="text-sm text-white/70">Contractors</span>
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
            {/* Box 1: Contract Overview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Status</span>
                  <span className="font-semibold text-blue-400">{job.status}</span>
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

            {/* Box 2: Contract Requirements */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Requirements</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Duration</span>
                  <span className="font-semibold text-white">{job.estimatedProjectLength || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Budget</span>
                  <span className="font-semibold text-blue-400">
                    ${typeof job.compensation === 'number' ? job.compensation.toFixed(2) : job.compensation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Milestones</span>
                  <span className="font-semibold text-white">{job.completedMilestones || 0}/{job.totalMilestones || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Experience</span>
                  <span className="font-semibold text-orange-400">Intermediate+</span>
                </div>
              </div>
            </div>

            {/* Box 3: Contract Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Apply for Contract
                </button>
                <button className="w-full bg-white/10 text-white py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                  Save Contract
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Contact Client
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - 3 Boxes */}
          <div className="lg:col-span-3 space-y-6">
            {/* Box 1: Contract Description */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Description</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Project Overview</h4>
                  <p className="text-white/80 leading-relaxed">
                    {job.projectOverview || job.projectDescription || 'No project overview available.'}
                  </p>
                </div>
                
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-white mb-2">Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {job.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {job.tools && job.tools.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-white mb-2">Required Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.tools.map((tool: any, index: number) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {job.tags && job.tags.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Contract Milestones */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Milestones</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Progress: {job.completedMilestones || 0}/{job.totalMilestones || 0} completed</span>
                  <span className="text-blue-400 font-semibold">
                    {job.totalMilestones ? Math.round(((job.completedMilestones || 0) / job.totalMilestones) * 100) : 0}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: job.totalMilestones || 3 }, (_, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            index < (job.completedMilestones || 0) 
                              ? 'bg-green-500' 
                              : 'bg-white/20'
                          }`}>
                            {index < (job.completedMilestones || 0) ? '✓' : (index + 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              Milestone {index + 1}
                            </div>
                            <div className="text-sm text-white/60">
                              {index < (job.completedMilestones || 0) ? 'Completed' : 'Pending'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-400">
                            ${Math.round((Number(job.compensation) || 0) / (job.totalMilestones || 3))}
                          </div>
                          <div className="text-xs text-white/60">Payment</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-white/80">
                        Description of milestone {index + 1} requirements and deliverables.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Box 3: Contract Files */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6" style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <h3 className="text-lg font-semibold text-white mb-4">Contract Files</h3>
              
              {job.projectFiles && job.projectFiles.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {job.projectFiles.map((file: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white">
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
                        <div className="text-right">
                          <div className="text-sm text-white/60">
                            {file.permissions || 'Read Only'}
                          </div>
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
                          <div className="text-blue-400 font-medium">{file.status || 'Active'}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Download
                        </button>
                        <button className="flex-1 bg-white/10 text-white py-2 px-3 rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/20">
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white/40 text-6xl mb-4">📁</div>
                  <div className="text-white/60 text-lg font-medium mb-2">No Contract Files</div>
                  <div className="text-white/40 text-sm">
                    No files have been uploaded for this contract
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

export default ContractDeveloperDetails; 