import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel,
  faGift,
  faFileContract,
  faTrophy,
  faQuestionCircle,
  faEllipsisV,
  faHeart as faHeartSolid,
  faCheck,
  faBan,
  faFlag,
  faCrosshairs,
  faBell,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

interface UserData {
  firstName: string;
  lastName: string;
}

interface UserMetrics {
  developerScore: number;
  clientRating: number;
  accountBalance: number;
  upcomingDeadlines: number;
  notifications: number;
  messages: number;
}

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
}

const JOB_TABS = [
  { key: 'current', label: 'Current Jobs' },
  { key: 'interested', label: 'Interested Jobs' },
  { key: 'applied', label: 'Applied Jobs' },
  { key: 'past', label: 'Past Jobs' },
];

// Active jobs will be fetched from Firebase

const jobPostTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faCrosshairs },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
];

const getJobTypeIcon = (type: string) => {
  const jobType = jobPostTypes.find((jt) => jt.type === type);
  return jobType ? jobType.icon : faQuestionCircle;
};

const getJobTypeColor = (type: string) => {
  switch (type) {
    case "Auction":
      return "text-orange-500";
    case "Bounty":
      return "text-purple-500";
    case "Contract":
      return "text-blue-500";
    case "Challenge":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

const getJobTypeIconColor = (type: string) => {
  switch (type) {
    case "Auction":
      return "text-orange-400";
    case "Bounty":
      return "text-purple-400";
    case "Contract":
      return "text-blue-400";
    case "Challenge":
      return "text-green-400";
    default:
      return "text-white";
  }
};

const formatCompensation = (compensation: string | number) => {
  if (typeof compensation === 'number') {
    return compensation.toFixed(2);
  }
  const amount = parseFloat(compensation.replace(/[^0-9.-]+/g, ""));
  return isNaN(amount) ? "0.00" : amount.toFixed(2);
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

  return lengthMap[length] || length || "Unknown";
};

// Dashboard Job Card Component - Exact copy from JobItem unexpanded state
const DashboardJobCard: React.FC<{ job: ActiveJob }> = ({ job }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleJobCardClick = () => {
    navigate(`/dashboard/job/${job.id}`);
  };

  return (
    <div 
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.2s ease',
      }}
      onClick={handleJobCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex flex-row gap-4 items-center w-auto h-20 px-4 py-5">
        <div className="w-12 h-12 flex items-center justify-center">
          <FontAwesomeIcon
            icon={getJobTypeIcon(job.selectedJobPostType)}
            className={`text-4xl ${getJobTypeIconColor(job.selectedJobPostType)}`}
          />
        </div>
        <div className="flex flex-col flex-1 gap-1">
          <h3 className={`text-2xl font-semibold mb-0 mt-0 ${getJobTypeColor(job.selectedJobPostType)}`}>
            {job.projectTitle}
          </h3>
          <div className="flex flex-row items-center gap-1">
            <p className="text-white/80 text-xs">{job.selectedJobPostType}</p>
            <p className="text-white/60">|</p>
            <p className="text-white/80 text-xs">{job.projectType || 'General'}</p>
            <p className="text-white/60">|</p>
            <p className="text-white/80 text-xs">
              {job.tools?.map((tool) => tool.name).join(", ") || 'No tools specified'}
            </p>
            {job.tags && job.tags.length > 0 && (
              <>
                <p className="text-white/60">|</p>
                <p className="text-white/80 text-xs">{job.tags.join(", ")}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="min-w-[120px] flex flex-col items-center">
            <span className="text-white/70 text-[10px] mb-0.5">
              Status
            </span>
            <span className={`${getJobTypeColor(job.selectedJobPostType)} font-bold text-lg`}>
              {job.status || 'Active'}
            </span>
          </div>

          <div className="min-w-[120px] flex flex-col items-center">
            <span className="text-white/70 text-[10px] mb-0.5">
              Next Deadline
            </span>
            <span className={`${getJobTypeColor(job.selectedJobPostType)} font-semibold text-lg`}>
              {job.deadline || 'No deadline'}
            </span>
          </div>

          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-white/70 text-[10px] mb-0.5">
              Expected Compensation
            </span>
            <div className="flex items-center text-3xl font-bold">
              <span className={`${getJobTypeColor(job.selectedJobPostType)}`}>$</span>
              <span className={`${getJobTypeColor(job.selectedJobPostType)}`}>
                {formatCompensation(job.compensation || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-200">
            <FontAwesomeIcon
              icon={faBell}
              className="text-xl text-white/70 hover:text-white"
            />
          </button>
          <button className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-200">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-xl text-white/70 hover:text-white"
            />
          </button>
          <button className="w-10 h-10 flex items-center justify-center cursor-pointer transition-colors duration-200">
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="text-xl text-white/70 hover:text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserData>({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const auth = getAuth();
  const [activeJobTab, setActiveJobTab] = useState('current');
  const [selectedRole, setSelectedRole] = useState<'developer' | 'client'>('developer');
  const [selectedJobsPill, setSelectedJobsPill] = useState('Active');
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    developerScore: 0,
    clientRating: 0,
    accountBalance: 0,
    upcomingDeadlines: 0,
    notifications: 0,
    messages: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Helper for status color
  const statusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#22c55e'; // green
      case 'Applied': return '#3b82f6'; // blue
      case 'Interested': return '#f59e0b'; // yellow
      case 'Past': return '#a1a1aa'; // gray
      default: return '#888';
    }
  };

  // Helper for job type icon
  const jobTypeIcon = (type: string) => {
    switch (type) {
      case 'Contract':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 15, marginRight: 14 }}>C</span>;
      case 'Bounty':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#a855f7', color: '#fff', fontWeight: 700, fontSize: 15, marginRight: 14 }}>B</span>;
      case 'Challenge':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: 17, marginRight: 14 }}>⚡</span>;
      case 'Auction':
        return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 15, marginRight: 14 }}>A</span>;
      default:
        return null;
    }
  };

  // Fetch user metrics from Firestore
  const fetchUserMetrics = async (uid: string) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserMetrics({
          developerScore: userData.developerScore || 600, // Default to 600 if not set
          clientRating: userData.clientRating || 0,
          accountBalance: userData.accountBalance || 0,
          upcomingDeadlines: userData.upcomingDeadlines || 0,
          notifications: userData.notifications || 0,
          messages: userData.messages || 0
        });
      } else {
        // Set default values if user document doesn't exist
        setUserMetrics({
          developerScore: 600,
          clientRating: 0,
          accountBalance: 0,
          upcomingDeadlines: 0,
          notifications: 0,
          messages: 0
        });
      }
    } catch (error) {
      console.error("Error fetching user metrics:", error);
      // Set default values on error
      setUserMetrics({
        developerScore: 600,
        clientRating: 0,
        accountBalance: 0,
        upcomingDeadlines: 0,
        notifications: 0,
        messages: 0
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  // Fetch active jobs from Firestore
  const fetchActiveJobs = async () => {
    try {
      setJobsLoading(true);
      
      // If user is client, use fake data
      if (selectedRole === 'client') {
        const fakeJobs: ActiveJob[] = [
          {
            id: 'fake-job-1',
            projectTitle: 'Build a React Dashboard',
            client: 'TechCorp Inc.',
            deadline: '2024-12-15',
            status: 'Active',
            selectedJobPostType: 'Contract',
            tools: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Tailwind CSS' }],
            compensation: 2500,
            estimatedProjectLength: '2-4 weeks',
            projectDescription: 'Modern dashboard with real-time data visualization',
            completedMilestones: 2,
            totalMilestones: 5,
            activatedAt: '2024-11-01T10:00:00Z',
            createdBy: 'client-1',
            currentAttempts: [
              {
                userName: 'John Developer',
                userId: 'dev-1',
                submittedAt: '2024-11-05T14:30:00Z',
                status: 'Active',
                progress: 75,
                comment: 'Making great progress on the dashboard components'
              },
              {
                userName: 'Sarah Coder',
                userId: 'dev-2',
                submittedAt: '2024-11-03T09:15:00Z',
                status: 'Active',
                progress: 45,
                comment: 'Working on the data visualization features'
              }
            ],
            projectType: 'Frontend',
            tags: ['urgent', 'remote', 'dashboard'],
            projectOverview: 'Building a comprehensive dashboard for data analytics'
          },
          {
            id: 'fake-job-2',
            projectTitle: 'E-commerce Mobile App',
            client: 'ShopSmart Ltd.',
            deadline: '2024-12-20',
            status: 'Active',
            selectedJobPostType: 'Challenge',
            tools: [{ name: 'React Native' }, { name: 'Firebase' }, { name: 'Stripe' }],
            compensation: 5000,
            estimatedProjectLength: '3-5 weeks',
            projectDescription: 'Full-featured mobile app with payment integration',
            completedMilestones: 1,
            totalMilestones: 4,
            activatedAt: '2024-11-10T08:00:00Z',
            createdBy: 'client-2',
            currentAttempts: [
              {
                userName: 'Mike Mobile',
                userId: 'dev-3',
                submittedAt: '2024-11-12T16:45:00Z',
                status: 'Active',
                progress: 30,
                comment: 'Setting up the project structure and navigation'
              },
              {
                userName: 'Alex AppDev',
                userId: 'dev-4',
                submittedAt: '2024-11-11T11:20:00Z',
                status: 'Active',
                progress: 60,
                comment: 'Working on the payment integration module'
              },
              {
                userName: 'Emma Engineer',
                userId: 'dev-5',
                submittedAt: '2024-11-13T13:10:00Z',
                status: 'Active',
                progress: 25,
                comment: 'Implementing the product catalog features'
              }
            ],
            projectType: 'Mobile',
            tags: ['mobile', 'ecommerce', 'payment'],
            projectOverview: 'Creating a modern e-commerce mobile application'
          },
          {
            id: 'fake-job-3',
            projectTitle: 'AI Chatbot Integration',
            client: 'AI Solutions Co.',
            deadline: '2024-12-10',
            status: 'Active',
            selectedJobPostType: 'Bounty',
            tools: [{ name: 'Python' }, { name: 'OpenAI API' }, { name: 'FastAPI' }],
            compensation: 3000,
            estimatedProjectLength: '1-2 weeks',
            projectDescription: 'Integrate AI chatbot into existing website',
            completedMilestones: 3,
            totalMilestones: 3,
            activatedAt: '2024-11-15T12:00:00Z',
            createdBy: 'client-3',
            currentAttempts: [
              {
                userName: 'David AI',
                userId: 'dev-6',
                submittedAt: '2024-11-16T10:30:00Z',
                status: 'Active',
                progress: 90,
                comment: 'Almost completed, just need to test the integration'
              }
            ],
            projectType: 'Backend',
            tags: ['ai', 'chatbot', 'integration'],
            projectOverview: 'Integrating an AI-powered chatbot into the company website'
          },
          {
            id: 'fake-job-4',
            projectTitle: 'Website Redesign',
            client: 'Creative Agency',
            deadline: '2024-12-25',
            status: 'Active',
            selectedJobPostType: 'Auction',
            tools: [{ name: 'WordPress' }, { name: 'Elementor' }, { name: 'Photoshop' }],
            compensation: 1800,
            estimatedProjectLength: '2-3 weeks',
            projectDescription: 'Complete website redesign with modern design',
            completedMilestones: 0,
            totalMilestones: 6,
            activatedAt: '2024-11-20T09:00:00Z',
            createdBy: 'client-4',
            currentAttempts: [
              {
                userName: 'Lisa Designer',
                userId: 'dev-7',
                submittedAt: '2024-11-22T15:20:00Z',
                status: 'Active',
                progress: 15,
                comment: 'Starting with the design mockups and wireframes'
              },
              {
                userName: 'Tom WebDev',
                userId: 'dev-8',
                submittedAt: '2024-11-21T14:00:00Z',
                status: 'Active',
                progress: 35,
                comment: 'Working on the homepage layout and navigation'
              }
            ],
            projectType: 'Design',
            tags: ['design', 'wordpress', 'redesign'],
            projectOverview: 'Complete redesign of the company website with modern aesthetics'
          }
        ];
        
        console.log(`Using ${fakeJobs.length} fake jobs for client view`);
        setActiveJobs(fakeJobs);
      } else {
        // Original Firebase fetch for developer view
        const activeJobsRef = collection(firestore, "activeJobs");
        const activeJobsQuery = query(
          activeJobsRef,
          orderBy("activatedAt", "desc")
        );
        const querySnapshot = await getDocs(activeJobsQuery);
        
        const fetchedJobs: ActiveJob[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedJobs.push({
            id: doc.id,
            projectTitle: data.projectTitle || "Untitled Project",
            client: data.client || "Unknown Client",
            deadline: data.deadline || data.Deadline,
            status: data.status || "active",
            selectedJobPostType: data.selectedJobPostType || "Contract",
            tools: data.tools || [],
            compensation: data.compensation || 0,
            estimatedProjectLength: data.estimatedProjectLength || "Unknown",
            projectDescription: data.projectDescription || "",
            completedMilestones: data.completedMilestones || 0,
            totalMilestones: data.totalMilestones || 0,
            activatedAt: data.activatedAt,
            createdBy: data.createdBy,
            currentAttempts: data.currentAttempts || [],
            projectType: data.projectType || "General",
            tags: data.tags || [],
            projectOverview: data.projectOverview || ""
          });
        });
        
        console.log(`Fetched ${fetchedJobs.length} active jobs from Firebase`);
        setActiveJobs(fetchedJobs);
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      setActiveJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Extract first and last name from Firebase user
        const displayName = firebaseUser.displayName || '';
        const email = firebaseUser.email || '';
        
        if (displayName) {
          // Split display name into first and last name
          const nameParts = displayName.split(' ');
          setUser({
            firstName: nameParts[0] || 'User',
            lastName: nameParts.slice(1).join(' ') || ''
          });
        } else {
          // Fallback to email username if no display name
          const emailUsername = email.split('@')[0];
          setUser({
            firstName: emailUsername || 'User',
            lastName: ''
          });
        }

        // Fetch user metrics from Firestore
        fetchUserMetrics(firebaseUser.uid);
        // Fetch active jobs
        fetchActiveJobs();
      } else {
        // No user logged in
        setUser({ firstName: 'Guest', lastName: '' });
        setMetricsLoading(false);
        setJobsLoading(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Typewriter effect - only for the name part
  useEffect(() => {
    if (!loading && user.firstName) {
      const nameText = `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
      
      setIsTyping(true);
      setDisplayedText('');
      
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        setDisplayedText(nameText.slice(0, currentIndex + 1));
        currentIndex++;
        
        if (currentIndex >= nameText.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 80);

      return () => clearInterval(typingInterval);
    } else if (loading) {
      setDisplayedText('');
      setIsTyping(false);
    }
  }, [loading, user.firstName, user.lastName]);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      .metric-card {
        animation: fadeInUp 0.3s ease-out;
      }
      
      .pill-container {
        animation: slideIn 0.3s ease-out;
      }
      
      .role-switch {
        transition: all 0.25s cubic-bezier(.4,2,.6,1);
      }
      
      .metric-value {
        transition: all 0.3s ease-out;
      }
      
      .metric-value.animating {
        animation: pulse 0.6s ease-out;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Reset selected jobs pill when role changes and trigger animation
  useEffect(() => {
    setIsAnimating(true);
    setSelectedJobsPill('Active');
    
    // Reset animation state after animation completes
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedRole]);

  // Fetch jobs when role changes
  useEffect(() => {
    if (!loading) {
      fetchActiveJobs();
    }
  }, [selectedRole, loading]);

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
        {/* Welcome Back Message */}
        <div style={{ 
          marginBottom: '0.5rem', 
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
        }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 0.8rem + 2vw, 2.5rem)',
            lineHeight: 'clamp(1.6rem, 0.9rem + 2vw, 2.6rem)',
            letterSpacing: '-0.03em',
            fontWeight: '500',
            marginBottom: 0,
            color: 'white',
            position: 'relative',
            margin: 0,
            flex: 1
          }}>
            Welcome Back, {displayedText}
            {isTyping && (
              <span style={{
                opacity: 1,
                animation: 'blink 1s infinite',
                marginLeft: '2px'
              }}>
                |
              </span>
            )}
          </h1>
        </div>
        {/* Role Selector - below welcome message, right-aligned */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', gap: '0.8rem', alignItems: 'flex-end', minHeight: '2em' }}>
          {['developer', 'client'].map(role => (
            <span
              key={role}
              className="role-switch"
              onClick={() => setSelectedRole(role as 'developer' | 'client')}
              style={{
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                fontSize: selectedRole === role ? '1.4rem' : '1.1rem',
                color: selectedRole === role ? '#fff' : '#888',
                opacity: selectedRole === role ? 1 : 0.7,
                userSelect: 'none',
                lineHeight: '1',
                display: 'inline-block',
                verticalAlign: 'bottom',
              }}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>
        {/* 5 Top Row Boxes */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: '1.2rem',
          marginBottom: '2.5rem',
        }}>
          {/* Upcoming Deadlines */}
          <div className="metric-card" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.1rem 1.2rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '0.3rem' }}>Upcoming Deadlines</span>
            <span className="metric-value" style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {metricsLoading ? '...' : userMetrics.upcomingDeadlines}
            </span>
          </div>
          {/* Notifications */}
          <div className="metric-card" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.1rem 1.2rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '0.3rem' }}>Notifications</span>
            <span className="metric-value" style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {metricsLoading ? '...' : userMetrics.notifications}
            </span>
          </div>
          {/* Messages */}
          <div className="metric-card" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.1rem 1.2rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '0.3rem' }}>Messages</span>
            <span className="metric-value" style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {metricsLoading ? '...' : userMetrics.messages}
            </span>
          </div>
          {/* Developer Score / Client Rating */}
          <div className="metric-card" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.1rem 1.2rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '0.3rem' }}>
              {selectedRole === 'developer' ? 'Developer Score' : 'Client Rating'}
            </span>
            <span className={`metric-value ${isAnimating ? 'animating' : ''}`} style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {metricsLoading ? '...' : selectedRole === 'developer' ? userMetrics.developerScore : userMetrics.clientRating}
            </span>
          </div>
          {/* Account Balance */}
          <div className="metric-card" style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '1.1rem 1.2rem',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}>
            <span style={{ fontSize: '0.95rem', color: '#a1a1aa', fontWeight: 600, marginBottom: '0.3rem' }}>Account Balance</span>
            <span className="metric-value" style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
              {metricsLoading ? '...' : `$${userMetrics.accountBalance.toFixed(2)}`}
            </span>
          </div>
        </div>
        {/* My Jobs Heading and Pills Row Container */}
        <div style={{ maxWidth: '600px', paddingLeft: '2.5rem', marginBottom: 0 }}>
          {/* My Jobs Heading, left-aligned below boxes */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
            <span style={{
              fontSize: '1.35rem',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#fff',
              lineHeight: 1.2,
            }}>
              My Jobs
            </span>
          </div>
        </div>
        {/* Pills Row below My Jobs, compact and centered, no left padding */}
        <div className="pill-container" style={{ maxWidth: '380px', margin: '0 auto 0 0', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          {(selectedRole === 'developer' 
            ? ['Active', 'Applied', 'Interested', 'Past']
            : ['Active', 'Drafts', 'Staged', 'Past']
          ).map(pill => (
            <span
              key={pill}
              onClick={() => setSelectedJobsPill(pill)}
              style={{
                flex: 1,
                textAlign: 'center',
                cursor: 'pointer',
                padding: '0.12rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 500,
                fontSize: '0.75rem',
                background: selectedJobsPill === pill ? '#fff' : 'transparent',
                color: selectedJobsPill === pill ? '#111' : '#fff',
                border: selectedJobsPill === pill ? 'none' : '1px solid #444',
                boxShadow: selectedJobsPill === pill ? '0 2px 8px #fff2' : 'none',
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                opacity: selectedJobsPill === pill ? 1 : 0.8,
                userSelect: 'none',
              }}
            >
              {pill}
            </span>
          ))}
        </div>
        {/* Job Cards List below pills */}
        <div style={{ marginTop: '2.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {selectedRole === 'developer' && selectedJobsPill === 'Active' && jobsLoading && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                Loading active jobs...
              </p>
            </div>
          )}
          
          {selectedRole === 'developer' && selectedJobsPill === 'Active' && !jobsLoading && activeJobs.map((job, index) => (
            <DashboardJobCard key={job.id} job={job} />
          ))}
          
          {selectedRole === 'developer' && selectedJobsPill === 'Active' && !jobsLoading && activeJobs.length === 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                No active jobs found
              </p>
            </div>
          )}
          
          {selectedRole === 'developer' && selectedJobsPill !== 'Active' && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                No {selectedJobsPill.toLowerCase()} jobs to display
              </p>
            </div>
          )}
          
          {selectedRole === 'client' && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>
                No {selectedJobsPill.toLowerCase()} projects to display
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;