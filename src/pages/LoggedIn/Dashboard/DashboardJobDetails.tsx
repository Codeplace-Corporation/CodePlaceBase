import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase';
import { getAuth } from 'firebase/auth';

// Client Detail Components
import ContractClientDetails from './ClientDetails/ContractClientDetails';
import BountyClientDetails from './ClientDetails/BountyClientDetails';
import ChallengeClientDetails from './ClientDetails/ChallengeClientDetails';
import AuctionClientDetails from './ClientDetails/AuctionClientDetails';

// Developer Detail Components
import ContractDeveloperDetails from './DeveloperDetails/ContractDeveloperDetails';
import BountyDeveloperDetails from './DeveloperDetails/BountyDeveloperDetails';
import ChallengeDeveloperDetails from './DeveloperDetails/ChallengeDeveloperDetails';
import AuctionDeveloperDetails from './DeveloperDetails/AuctionDeveloperDetails';

// Fallback components (temporary)
import ClientJobDetails from './ClientJobDetails';
import DeveloperJobDetails from './DeveloperJobDetails';

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
}

const DashboardJobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean | null>(null);

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
          const jobData = { id: jobDoc.id, ...jobDoc.data() } as ActiveJob;
          setJob(jobData);
          
          // Check if the authenticated user is the one who posted the job
          const currentUser = auth.currentUser;
          if (currentUser && jobData.createdBy) {
            setIsClient(currentUser.uid === jobData.createdBy);
          } else {
            setIsClient(false); // Default to developer view if no createdBy field
          }
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
  }, [jobId, auth.currentUser]);

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
            <p className="mt-4 text-white/60">Loading job details...</p>
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

  // Render the appropriate view based on job type and whether the user is the client or developer
  const renderComponent = () => {
    const jobType = job.selectedJobPostType;
    
    try {
      if (isClient) {
        // Client view based on job type
        switch (jobType) {
          case 'Contract':
            return <ContractClientDetails />;
          case 'Bounty':
            return <BountyClientDetails />;
          case 'Challenge':
            return <ChallengeClientDetails />;
          case 'Auction':
            return <AuctionClientDetails />;
          default:
            return <ClientJobDetails />; // Fallback to old component
        }
      } else {
        // Developer view based on job type
        switch (jobType) {
          case 'Contract':
            return <ContractDeveloperDetails />;
          case 'Bounty':
            return <BountyDeveloperDetails />;
          case 'Challenge':
            return <ChallengeDeveloperDetails />;
          case 'Auction':
            return <AuctionDeveloperDetails />;
          default:
            return <DeveloperJobDetails />; // Fallback to old component
        }
      }
    } catch (error) {
      console.error('Error rendering component:', error);
      // Fallback to old components if new ones fail
      if (isClient) {
        return <ClientJobDetails />;
      } else {
        return <DeveloperJobDetails />;
      }
    }
  };

  return renderComponent();
};

export default DashboardJobDetails; 