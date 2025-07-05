import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface UserData {
  firstName: string;
  lastName: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserData>({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userType, setUserType] = useState<'developer' | 'client'>('developer'); // Toggle state
  const auth = getAuth();

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
      } else {
        // No user logged in
        setUser({ firstName: 'Guest', lastName: '' });
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

  // Add CSS animation for cursor blink
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Mock data for action items
  const actionItems = [
    { id: 1, message: "You have 3 new project proposals to review", priority: "high" },
    { id: 2, message: "2 clients are waiting for project updates", priority: "medium" },
    { id: 3, message: "Payment received for Web Development Project", priority: "low" },
    { id: 4, message: "New message from John regarding the mobile app", priority: "medium" }
  ];

  // Mock data for calendar events
  const upcomingEvents = [
    { id: 1, title: "Client Meeting - E-commerce Project", time: "Today, 2:00 PM", type: "meeting" },
    { id: 2, title: "Project Deadline - Mobile App", time: "Tomorrow, 11:59 PM", type: "deadline" },
    { id: 3, title: "Team Standup", time: "Wed, 9:00 AM", type: "meeting" },
    { id: 4, title: "Code Review Session", time: "Thu, 3:30 PM", type: "review" },
    { id: 5, title: "Client Presentation", time: "Fri, 10:00 AM", type: "presentation" }
  ];

  // Mock data for recent messages
  const recentMessages = [
    { id: 1, sender: "Sarah Johnson", message: "The wireframes look great! Can we schedule a call to discuss the next steps?", time: "2 min ago", unread: true },
    { id: 2, sender: "Mike Chen", message: "I've completed the backend API integration. Ready for testing.", time: "1 hour ago", unread: true },
    { id: 3, sender: "Emily Davis", message: "Thanks for the quick turnaround on the design changes!", time: "3 hours ago", unread: false },
    { id: 4, sender: "Alex Rodriguez", message: "Can you send me the final invoice for the web development project?", time: "Yesterday", unread: false },
    { id: 5, sender: "Lisa Thompson", message: "The client approved the proposal. Let's start next week!", time: "2 days ago", unread: false }
  ];

  // Mock data for jobs - updated with project types
  const jobs = [
    { 
      id: 1, 
      title: "E-commerce Website Development", 
      client: "TechStart Inc.", 
      status: "in-progress", 
      jobType: "Contract",
      projectType: "Web Development",
      progress: 75, 
      dueDate: "Dec 15, 2024",
      budget: "$12,500",
      technologies: ["React", "Node.js", "MongoDB"]
    },
    { 
      id: 2, 
      title: "Mobile App UI/UX Design", 
      client: "FitLife Solutions", 
      status: "review", 
      jobType: "Bounty",
      projectType: "Mobile Development",
      progress: 90, 
      dueDate: "Dec 8, 2024",
      budget: "$8,000",
      technologies: ["Figma", "React Native", "Firebase"]
    },
    { 
      id: 3, 
      title: "API Integration & Backend", 
      client: "DataFlow Corp", 
      status: "completed", 
      jobType: "Challenge",
      projectType: "Backend Development",
      progress: 100, 
      dueDate: "Nov 30, 2024",
      budget: "$6,750",
      technologies: ["Python", "PostgreSQL", "AWS"]
    },
    { 
      id: 4, 
      title: "WordPress Site Redesign", 
      client: "Creative Agency", 
      status: "pending", 
      jobType: "Auction",
      projectType: "Web Development",
      progress: 25, 
      dueDate: "Dec 20, 2024",
      budget: "$4,200",
      technologies: ["WordPress", "PHP", "CSS"]
    },
    { 
      id: 5, 
      title: "Real Estate Platform", 
      client: "PropertyPro", 
      status: "in-progress", 
      jobType: "Contract",
      projectType: "Full Stack Development",
      progress: 45, 
      dueDate: "Jan 10, 2025",
      budget: "$18,900",
      technologies: ["Vue.js", "Laravel", "MySQL"]
    },
    { 
      id: 6, 
      title: "Dashboard Analytics Tool", 
      client: "MetricsMaster", 
      status: "proposal", 
      jobType: "Bounty",
      projectType: "Data Visualization",
      progress: 0, 
      dueDate: "Jan 25, 2025",
      budget: "$15,600",
      technologies: ["React", "D3.js", "Express.js"]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#3b82f6';
      case 'deadline': return '#ef4444';
      case 'review': return '#f59e0b';
      case 'presentation': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'Bounty':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'Auction':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.02"/>
            <path d="M22 6l-3-3l-1.5 1.5L19 6l1.5 1.5L22 6z"/>
          </svg>
        );
      case 'Challenge':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
        );
      case 'Contract':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        );
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'Bounty': return '#a855f7'; // Purple
      case 'Auction': return '#f97316'; // Orange  
      case 'Challenge': return '#22c55e'; // Green
      case 'Contract': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e'; // Green
      case 'in-progress': return '#3b82f6'; // Blue
      case 'review': return '#f59e0b'; // Yellow
      case 'pending': return '#8b5cf6'; // Purple
      case 'proposal': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  const getJobStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'review': return 'Under Review';
      case 'pending': return 'Pending Start';
      case 'proposal': return 'Proposal';
      default: return status;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case 'deadline':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
        );
      case 'review':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3l8-8"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93.37 4.18 1.02"></path>
          </svg>
        );
      case 'presentation':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#080808', 
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      {/* Container with navbar width limit */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Welcome Back Message */}
        <div style={{ 
          marginBottom: '2rem', 
          marginTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 0.8rem + 2vw, 2.5rem)',
            lineHeight: 'clamp(1.6rem, 0.9rem + 2vw, 2.6rem)',
            letterSpacing: '-0.03em',
            fontWeight: '500',
            marginBottom: '0.5rem',
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

          {/* User Type Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: '2rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2px',
              display: 'flex',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative'
            }}>
              {/* Sliding pill background */}
              <div style={{
                position: 'absolute',
                top: '2px',
                left: userType === 'developer' ? '2px' : 'calc(50% - 2px)',
                width: 'calc(50% - 2px)',
                height: 'calc(100% - 4px)',
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                transition: 'left 0.3s ease',
                zIndex: 1
              }} />
              
              <button
                onClick={() => setUserType('developer')}
                style={{
                  padding: '6px 20px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: userType === 'developer' ? '#000000' : '#8e8ea0',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                  fontFamily: 'Inter, sans-serif',
                  position: 'relative',
                  zIndex: 2,
                  width: '50%'
                }}
              >
                Developer
              </button>
              <button
                onClick={() => setUserType('client')}
                style={{
                  padding: '6px 20px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: userType === 'client' ? '#000000' : '#8e8ea0',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                  fontFamily: 'Inter, sans-serif',
                  position: 'relative',
                  zIndex: 2,
                  width: '50%'
                }}
              >
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid #565869',
          borderRadius: '12px',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              margin: 0,
              color: '#ffffff'
            }}>
              Your Jobs
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {jobs.filter(job => job.status === 'completed').length} completed
              </span>
              <span style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {jobs.filter(job => job.status === 'in-progress').length} active
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8ea0" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1.5rem' 
          }}>
            {jobs.map((job) => (
              <div 
                key={job.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  gap: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Job Type Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: getJobTypeColor(job.jobType),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  filter: `drop-shadow(0 4px 8px ${getJobTypeColor(job.jobType)}40)`
                }}>
                  {getJobTypeIcon(job.jobType)}
                </div>

                {/* Job Content */}
                <div style={{ flex: 1, minWidth: 0, marginLeft: '1rem' }}>
                  {/* Job Title */}
                  <h3 style={{ 
                    margin: '0 0 0.25rem 0', 
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    lineHeight: '1.4'
                  }}>
                    {job.title}
                  </h3>
                  
                  {/* Client • Job Type • Project Type */}
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem',
                    color: '#8e8ea0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{job.client}</span>
                    <span style={{ 
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%', 
                      backgroundColor: '#8e8ea0' 
                    }} />
                    <span style={{ color: getJobTypeColor(job.jobType) }}>{job.jobType}</span>
                    <span style={{ 
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%', 
                      backgroundColor: '#8e8ea0' 
                    }} />
                    <span>{job.projectType}</span>
                  </p>
                </div>

                {/* Right Side Actions */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem',
                  marginLeft: '1rem'
                }}>
                  {/* Status Section */}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#8e8ea0',
                      fontWeight: '500'
                    }}>
                      Status
                    </span>
                    <span style={{
                      backgroundColor: getJobStatusColor(job.status),
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}>
                      {getJobStatusLabel(job.status)}
                    </span>
                  </div>

                  {/* Action Icons */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem'
                  }}>
                    {/* Message Icon */}
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </button>

                    {/* Notifications Icon */}
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      {/* Notification dot */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                      }} />
                    </button>

                    {/* Three Dots Menu */}
                    <button style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#8e8ea0'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem', display: 'block' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                💼 No jobs yet. Start building your portfolio!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;