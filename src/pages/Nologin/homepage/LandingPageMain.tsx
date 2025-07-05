import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faCrosshairs, faFileContract, faTrophy } from '@fortawesome/free-solid-svg-icons';

// Import Firebase functions from your existing firebase.ts file
import { firestore, collection, addDoc } from '../../../firebase'; // Adjust path as needed

interface JobType {
  type: string;
  icon: any;
  subheading: string;
}

const jobTypes: JobType[] = [
  { type: "Auction", icon: faGavel, subheading: "" },
  { type: "Bounty", icon: faCrosshairs, subheading: "" },
  { type: "Contract", icon: faFileContract, subheading: "" },
  { type: "Challenge", icon: faTrophy, subheading: "" },
];

const LandingPageMain: React.FC = () => {
  const [showWaitlistForm, setShowWaitlistForm] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [selectedJobTypeIndex, setSelectedJobTypeIndex] = useState<number>(-1);
  const [hoveredJobTypeIndex, setHoveredJobTypeIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Add useLocation hook for URL parameter detection
  const location = useLocation();

  const headerText = "Let's Get to Work";

  // Check if we should show the waitlist modal based on URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const showModal = searchParams.get('showWaitlist') === 'true';
    
    if (showModal) {
      setShowWaitlistForm(true);
    }
  }, [location]);

  // Typewriter effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= headerText.length) {
        setDisplayedText(headerText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 100); // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval);
  }, []);

  // Handle job type selection and hover
  const handleJobTypeClick = (index: number) => {
    if (selectedJobTypeIndex === index) {
      // If clicking the already selected item, deselect it
      setSelectedJobTypeIndex(-1);
    } else {
      // Select the clicked item
      setSelectedJobTypeIndex(index);
    }
  };

  const handleJobTypeHover = (index: number) => {
    if (selectedJobTypeIndex === -1) {
      // Only allow hover effects if nothing is locked/selected
      setHoveredJobTypeIndex(index);
    }
  };

  const handleJobTypeLeave = () => {
    if (selectedJobTypeIndex === -1) {
      // Only clear hover if nothing is locked/selected
      setHoveredJobTypeIndex(-1);
    }
  };

  const toggleWaitlistForm = (): void => setShowWaitlistForm(!showWaitlistForm);

  const openWaitlistWithUserType = (type: 'developer' | 'client'): void => {
    setUserType(type);
    setShowWaitlistForm(true);
  };

  const handleJoinWaitlist = async (): Promise<void> => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Add document to 'waitlist' collection
      const docRef = await addDoc(collection(firestore, 'waitlist'), {
        firstName,
        lastName,
        email,
        phone,
        userType,
        timestamp: new Date(),
        createdAt: new Date().toISOString(),
        status: 'pending' // You can add additional fields as needed
      });
      
      console.log('Document written with ID: ', docRef.id);
      setSubmitStatus('success');
      setStatusMessage('You have been successfully added to the waitlist! We\'ll be in touch soon.');
      
      // Reset form after a short delay
      setTimeout(() => {
        setShowWaitlistForm(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setUserType('');
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding document to waitlist: ', error);
      setSubmitStatus('error');
      setStatusMessage('Sorry, there was an error joining the waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gradient styles for job types
  const getJobTypeGradient = (jobType: string) => {
    switch (jobType) {
      case 'Auction':
        return 'linear-gradient(to right, #f97316, #dc2626)'; // orange-500 to red-500
      case 'Bounty':
        return 'linear-gradient(to right, #a855f7, #ec4899)'; // purple-500 to pink-500
      case 'Contract':
        return 'linear-gradient(to right, #3b82f6, #1e3a8a)'; // blue-500 to blue-900
      case 'Challenge':
        return 'linear-gradient(to right, #22c55e, #10b981)'; // green-500 to emerald-500
      default:
        return 'linear-gradient(to right, #374151, #1f2937)';
    }
  };

  const isFormValid = firstName && lastName && email && phone && userType;

  const styles = {
    container: {
      backgroundColor: '#080808',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      paddingTop: '80px', // Account for sticky navbar
      minHeight: '100vh'
    },
    section: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    introSection: {
      padding: '120px 1rem 80px',
      textAlign: 'center' as const
    },
    title: {
      fontSize: 'clamp(3rem, calc(3rem + 3 * ((100vw - 23.4375rem) / 66.5625)), 6rem)',
      lineHeight: 'clamp(3.42rem, calc(3.42rem + 2.58 * ((100vw - 23.4375rem) / 66.5625)), 6rem)',
      letterSpacing: '-.03em',
      fontWeight: 500,
      marginBottom: '1.5rem',
      color: 'white',
      position: 'relative' as const
    },
    cursor: {
      display: 'inline-block',
      backgroundColor: 'white',
      width: '3px',
      height: '1em',
      marginLeft: '4px',
      verticalAlign: 'baseline'
    },
    cursorBlinking: {
      display: 'inline-block',
      backgroundColor: 'white',
      width: '3px',
      height: '1em',
      marginLeft: '4px',
      animation: 'blink 1s infinite',
      verticalAlign: 'baseline'
    },
    subtitle: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
      fontWeight: 300,
      marginBottom: '3rem',
      color: 'white',
      lineHeight: 1.6,
      maxWidth: '66.67%', // Equivalent to col-span-8 out of 12 columns
      margin: '0 auto 3rem',
      textWrap: 'balance' as const
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
      marginTop: '3rem'
    },
    primaryButton: {
      padding: '1rem 2rem',
      backgroundColor: 'white',
      color: 'black',
      border: 'none',
      borderRadius: '50px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '200px'
    },
    secondaryButton: {
      padding: '1rem 2rem',
      backgroundColor: 'transparent',
      color: 'white',
      border: '2px solid #7f4dca',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '160px'
    },
    carouselSection: {
      padding: '40px 1rem',
      backgroundColor: '#080808',
    },
    devSection: {
      padding: '40px 1rem'
    },
    sectionTitle: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      lineHeight: 'clamp(2.4rem, calc(2.4rem + 1.8 * ((100vw - 23.4375rem) / 66.5625)), 3.6rem)',
      letterSpacing: '-.03em',
      fontWeight: 500,
      textAlign: 'center' as const,
      marginBottom: '1rem',
      color: 'white'
    },
    sectionSubtitle: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
      fontWeight: 300,
      textAlign: 'center' as const,
      marginBottom: '4rem',
      color: 'white',
      lineHeight: 1.6,
      maxWidth: '66.67%',
      margin: '0 auto 4rem',
      textWrap: 'balance' as const
    },
    jobTypesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      marginBottom: '4rem'
    },
    jobTypeCard: {
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid #333',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardIcon: {
      width: '60px',
      height: '60px',
      backgroundColor: '#7f4dca',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      fontSize: '1.5rem',
      color: 'white'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
      color: 'white'
    },
    cardSubheading: {
      fontSize: '1rem',
      color: '#7f4dca',
      marginBottom: '0.5rem',
      fontWeight: 500
    },
    ctaSection: {
      textAlign: 'center' as const,
      padding: '4rem 0'
    },
    popup: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    popupContent: {
      backgroundColor: '#1a1a1a',
      padding: '2rem',
      borderRadius: '12px',
      border: '1px solid #333',
      maxWidth: '400px',
      width: '100%'
    },
    popupTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
      color: 'white'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #333',
      borderRadius: '8px',
      backgroundColor: '#2a2a2a',
      color: 'white',
      fontSize: '1rem'
    },
    footer: {
      backgroundColor: '#1a1a1a',
      padding: '3rem 1rem 2rem',
      borderTop: '1px solid #333'
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '1rem'
    },
    footerLinks: {
      display: 'flex',
      gap: '2rem',
      flexWrap: 'wrap' as const
    },
    footerLink: {
      color: '#b0b0b0',
      textDecoration: 'none',
      transition: 'color 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      {/* CSS Animation for blinking cursor */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
      
      {/* Introduction Section */}
      <section style={{...styles.section, ...styles.introSection}}>
        <h1 style={styles.title}>
          {displayedText}
          <span style={isTypingComplete ? styles.cursorBlinking : styles.cursor}></span>
        </h1>
        <p style={styles.subtitle}>
          Connecting you with top-tier freelance developers through job types that are tailored to your priorities — speed, quality, creativity, or cost-effectiveness.
        </p>
        <div style={styles.buttonContainer}>
          <button 
            style={styles.primaryButton}
            onClick={() => openWaitlistWithUserType('developer')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            For Developers
          </button>
          <button 
            style={styles.primaryButton}
            onClick={() => openWaitlistWithUserType('client')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            For Clients
          </button>
        </div>
      </section>

      {/* Job Types Section - Simple Version */}
      <section style={styles.carouselSection}>
        <div style={styles.section}>
          <h2 style={{
            ...styles.sectionTitle,
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Job Types Tailored to Your Needs
          </h2>
          <p style={{
            ...styles.sectionSubtitle,
            marginBottom: '4rem'
          }}>
            Choose the perfect job type based on your priorities
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {jobTypes.map((jobType, index) => {
              const isSelected = index === selectedJobTypeIndex;
              const isHovered = index === hoveredJobTypeIndex;
              const isExpanded = isSelected || (isHovered && selectedJobTypeIndex === -1);
              
              return (
                <div 
                  key={index} 
                  style={{
                    backgroundColor: isExpanded ? '#1a1a1a' : 'transparent',
                    backgroundImage: isExpanded ? getJobTypeGradient(jobType.type) : 'none',
                    border: isExpanded ? '1px solid #333' : 'none',
                    borderRadius: isExpanded ? '24px' : '0',
                    padding: isExpanded ? '2rem' : '1rem',
                    cursor: 'pointer',
                    width: isExpanded ? '500px' : '160px',
                    height: isExpanded ? 'auto' : '160px',
                    minHeight: isExpanded ? '180px' : '160px',
                    display: 'flex',
                    flexDirection: isExpanded ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    textAlign: isExpanded ? 'left' : 'center',
                    gap: isExpanded ? '2rem' : '0.5rem',
                    boxShadow: isExpanded ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
                    // Custom animations: slow opening, slow closing
                    transition: isExpanded 
                      ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' // Slower smooth ease-out for opening
                      : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slower smooth closing
                    overflow: 'hidden'
                  }}
                  onClick={() => handleJobTypeClick(index)}
                  onMouseEnter={() => handleJobTypeHover(index)}
                  onMouseLeave={handleJobTypeLeave}
                >
                  {/* Circle */}
                  <div style={{
                    width: isExpanded ? '100px' : '120px',
                    height: isExpanded ? '100px' : '120px',
                    borderRadius: '50%',
                    background: getJobTypeGradient(jobType.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isExpanded ? '0 15px 35px rgba(0, 0, 0, 0.4)' : '0 10px 25px rgba(0, 0, 0, 0.3)',
                    marginBottom: isExpanded ? '0' : '0.5rem',
                    transition: isExpanded 
                      ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' // Slower smooth for opening
                      : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slower smooth for closing
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    {/* White overlay for expanded state */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      opacity: isExpanded ? 1 : 0,
                      transition: isExpanded 
                        ? 'opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s' // Delayed fade-in
                        : 'opacity 0.4s ease-out' // Slower fade-out
                    }} />
                    <FontAwesomeIcon 
                      icon={jobType.icon} 
                      style={{
                        fontSize: isExpanded ? '2.5rem' : '3rem',
                        color: 'white',
                        transition: isExpanded 
                          ? 'font-size 0.8s cubic-bezier(0.23, 1, 0.32, 1)' // Slower smooth scaling
                          : 'font-size 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Slower smooth scaling
                      }}
                    />
                  </div>
                  
                  {/* Content wrapper */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isExpanded ? 'flex-start' : 'center',
                    flex: isExpanded ? 1 : 'none',
                    width: isExpanded ? 'auto' : '100%',
                    transition: isExpanded 
                      ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' // Slower smooth layout changes
                      : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Slower smooth layout changes
                  }}>
                    {/* Title */}
                    <h3 style={{
                      fontSize: isExpanded ? 'clamp(1.3rem, 2.5vw, 1.8rem)' : '1.1rem',
                      fontWeight: 600,
                      color: 'white',
                      margin: isExpanded ? '0 0 1rem 0' : '0',
                      transition: isExpanded 
                        ? 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)' // Slower smooth title changes
                        : 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Slower smooth title changes
                    }}>
                      {jobType.type}
                    </h3>
                    
                    {/* Description */}
                    <div style={{
                      opacity: isExpanded ? 1 : 0,
                      maxHeight: isExpanded ? '200px' : '0',
                      overflow: 'hidden',
                      transition: isExpanded 
                        ? 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.4s' // Delayed slower smooth appearance
                        : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Slower smooth collapse
                    }}>
                      <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                        fontWeight: 300,
                        color: 'white',
                        lineHeight: 1.6,
                        margin: '0'
                      }}>
                        {jobType.type === 'Auction' ? 'Auctions are publicly bid on guaranteeing you the lowest possible cost without compromising on quality. Perfect for projects with strict budgets.' :
                         jobType.type === 'Bounty' ? 'Bounties pay out to the first developer to successfully complete the task. No long application process or haggling over prices.' :
                         jobType.type === 'Contract' ? 'Contracts let you setup an application process to find the perfect developer for your project. You can set a fixed price or hourly rate and get the best quality work.' :
                         'Challenges are timed competitions where multiple developers submit solutions. You pick the best one when time expires. Perfect for creative or open-ended projects.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developer Score Section */}
      <section style={styles.devSection}>
        <div style={styles.section}>
          <h2 style={{
            ...styles.sectionTitle,
            marginBottom: '4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Find Qualified Talent Without The Guesswork
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '5rem',
            marginBottom: '4rem',
            flexWrap: 'wrap'
          }}>
            {/* Left Side - Content */}
            <div style={{ flex: 1, minWidth: '400px', textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 600,
                color: 'white',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em'
              }}>
                Developer Score
              </h3>
              <p style={{
                fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
                color: '#b8b8b8',
                lineHeight: 1.7,
                marginBottom: '3rem',
                maxWidth: '500px',
                margin: '0 auto 3rem'
              }}>
                Our Developer Score replaces vague star ratings with precise numerical evaluations. Initial scores reflect developers' experience and portfolios, then dynamically adjust based on real job performance and earned certifications—so you confidently choose the best talent every time.
              </p>
            </div>
            
            {/* Right Side - Tool Certification */}
            <div style={{ flex: 1, minWidth: '400px', textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 600,
                color: 'white',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em'
              }}>
                Tool Certification
              </h3>
              <p style={{
                fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
                color: '#b8b8b8',
                lineHeight: 1.7,
                marginBottom: '3rem',
                maxWidth: '500px',
                margin: '0 auto 3rem'
              }}>
                Our Tool Certifications are on-site coding competency tests verifying developer proficiency in specific languages, frameworks, plugins, and development tools—ensuring the right skills for your project's needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section style={styles.devSection}>
        <div style={styles.section}>
          <h2 style={{
            ...styles.sectionTitle,
            marginBottom: '3rem'
          }}>
            Get Started With CodePlace
          </h2>
          
          <div style={{
            marginBottom: '10rem',
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '3rem'
          }}>
            {/* Discord Button */}
            <button 
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#5865F2',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onClick={() => window.open('https://discord.gg/Hgd8s68fZU', '_blank')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4752C4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5865F2'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join the Discord
            </button>

            {/* Waitlist Button */}
            <button 
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}
              onClick={toggleWaitlistForm}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid white',
        backgroundColor: '#080808',
        padding: '2rem 1rem 1.5rem',
        marginTop: '3rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{color: '#b0b0b0', margin: 0, fontSize: '0.9rem'}}>
            &copy; 2024 CodePlace. All Rights Reserved.
          </p>
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => {
                // Add your privacy policy logic here
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#b0b0b0',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => {
                // Add your terms of service logic here
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#b0b0b0',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}
            >
              Terms of Service
            </button>
            <button 
              onClick={() => {
                // Add your contact logic here
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#b0b0b0',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b0b0b0'}
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>

      {/* OpenAI-Style Waitlist Popup */}
      {showWaitlistForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          opacity: 1,
          visibility: 'visible',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '20px'
        }} 
        onClick={(e) => e.target === e.currentTarget && setShowWaitlistForm(false)}
        >
          {/* Modal Content */}
          <div style={{
            background: '#000000',
            borderRadius: '12px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            transform: 'scale(1) translateY(0)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            border: '1px solid #333'
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowWaitlistForm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {/* The Point - OpenAI's signature circle */}
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#000000',
                  borderRadius: '50%'
                }} />
              </div>
              
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
              }}>
                Join the Waitlist
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#9ca3af',
                margin: 0,
                lineHeight: 1.5
              }}>
                Be the first to experience CodePlace
              </p>
            </div>

            {/* Form */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Name Fields Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10a37f';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    fontSize: '16px',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10a37f';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Email */}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10a37f';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {/* Phone */}
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10a37f';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {/* User Type Selection */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                }}>
                  I am a:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setUserType('developer')}
                    style={{
                      padding: '12px 16px',
                      border: `2px solid ${userType === 'developer' ? '#10a37f' : '#333'}`,
                      borderRadius: '6px',
                      backgroundColor: userType === 'developer' ? 'rgba(16, 163, 127, 0.1)' : '#1a1a1a',
                      color: userType === 'developer' ? '#10a37f' : '#ffffff',
                      fontSize: '14px',
                      fontWeight: userType === 'developer' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (userType !== 'developer') {
                        e.currentTarget.style.borderColor = '#10a37f';
                        e.currentTarget.style.backgroundColor = 'rgba(16, 163, 127, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (userType !== 'developer') {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                      }
                    }}
                  >
                    Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('client')}
                    style={{
                      padding: '12px 16px',
                      border: `2px solid ${userType === 'client' ? '#10a37f' : '#333'}`,
                      borderRadius: '6px',
                      backgroundColor: userType === 'client' ? 'rgba(16, 163, 127, 0.1)' : '#1a1a1a',
                      color: userType === 'client' ? '#10a37f' : '#ffffff',
                      fontSize: '14px',
                      fontWeight: userType === 'client' ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (userType !== 'client') {
                        e.currentTarget.style.borderColor = '#10a37f';
                        e.currentTarget.style.backgroundColor = 'rgba(16, 163, 127, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (userType !== 'client') {
                        e.currentTarget.style.borderColor = '#333';
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                      }
                    }}
                  >
                    Client
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button 
                  onClick={handleJoinWaitlist}
                  disabled={!isFormValid || isSubmitting}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: (isFormValid && !isSubmitting) ? '#ffffff' : '#333',
                    color: (isFormValid && !isSubmitting) ? '#000000' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: (isFormValid && !isSubmitting) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: (isFormValid && !isSubmitting) ? '0 1px 3px rgba(255, 255, 255, 0.1)' : 'none',
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFormValid && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>

              {/* Status Message */}
              {submitStatus !== 'idle' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: submitStatus === 'success' ? 'rgba(16, 163, 127, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${submitStatus === 'success' ? '#10a37f' : '#ef4444'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {submitStatus === 'success' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  )}
                  <span style={{
                    fontSize: '14px',
                    color: submitStatus === 'success' ? '#10a37f' : '#ef4444',
                    fontWeight: 500,
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
                  }}>
                    {statusMessage}
                  </span>
                </div>
              )}
            </div>

            {/* Footer text */}
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center',
              marginTop: '20px',
              marginBottom: 0,
              lineHeight: 1.4,
              fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'
            }}>
              By joining, you agree to receive updates about our platform launch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageMain;