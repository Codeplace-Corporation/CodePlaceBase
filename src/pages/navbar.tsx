import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, signOut, User, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../Auth'; // Adjust the path if needed
import logo from '../assets/logo.png'; // Adjust the path if needed
import { useSignInModal } from '../context/SignInModalContext'; // Add this import
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { updateWaitlistStatus } from '../utils/waitlistUtils';

const auth = getAuth();

// Interface for ForgotPasswordModal props
interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

// Forgot Password Modal Component
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, userEmail = '' }) => {
  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      
      setEmailSent(true);
      setMessage(`Password reset email sent to ${email}`);
      console.log('Password reset email sent successfully');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later');
          break;
        default:
          setError(error.message || 'Failed to send password reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setMessage('');
    setEmailSent(false);
    setLoading(false);
    onClose();
  };

  // Add keyframes for spinner
  useEffect(() => {
    if (isOpen) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [isOpen]);

  // Update email when userEmail prop changes
  useEffect(() => {
    console.log('ForgotPasswordModal props:', { isOpen, userEmail }); // Debug log
    if (userEmail && isOpen) {
      setEmail(userEmail);
    }
  }, [userEmail, isOpen]);

  if (!isOpen) {
    console.log('ForgotPasswordModal not open, returning null'); // Debug log
    return null;
  }

  console.log('ForgotPasswordModal rendering, isOpen:', isOpen); // Debug log

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(8, 8, 8, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000, // Higher than sign in modal
      padding: '1rem'
    },

    modal: {
      backgroundColor: '#000000',
      borderRadius: '1rem',
      padding: '2rem',
      width: '100%',
      maxWidth: '28rem',
      position: 'relative' as const,
      border: '1px solid #1a1a1a',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      fontFamily: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    },

    closeButton: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '1.25rem',
      cursor: 'pointer',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.375rem',
      transition: 'all 0.2s ease'
    },

    header: {
      textAlign: 'center' as const,
      marginBottom: '1.5rem'
    },

    title: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '0.5rem',
      lineHeight: '1.2'
    },

    subtitle: {
      color: '#8e8ea0',
      fontSize: '0.875rem',
      lineHeight: '1.5'
    },

    formContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },

    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },

    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#ffffff'
    },

    input: {
      width: '100%',
      padding: '0.875rem',
      backgroundColor: '#000000',
      border: '1px solid #1a1a1a',
      borderRadius: '0.375rem',
      color: '#ffffff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const
    },

    button: {
      width: '100%',
      padding: '0.875rem',
      fontSize: '1rem',
      fontWeight: '600',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: 'none',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },

    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },

    message: {
      padding: '0.875rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      textAlign: 'center' as const,
      marginBottom: '1rem'
    },

    successMessage: {
      backgroundColor: 'rgba(16, 163, 127, 0.1)',
      border: '1px solid #10a37f',
      color: '#10a37f'
    },

    errorMessage: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      color: '#ef4444'
    },

    successIcon: {
      textAlign: 'center' as const,
      marginBottom: '1rem'
    },

    iconCircle: {
      width: '4rem',
      height: '4rem',
      backgroundColor: 'rgba(16, 163, 127, 0.1)',
      border: '2px solid #10a37f',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      marginBottom: '1rem'
    },

    loadingSpinner: {
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTop: '2px solid #000000',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    backButton: {
      width: '100%',
      padding: '0.875rem',
      fontSize: '1rem',
      fontWeight: '500',
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1px solid #565869',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      marginTop: '0.5rem'
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          style={styles.closeButton}
          onClick={handleClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          ×
        </button>

        {emailSent ? (
          // Success State
          <>
            <div style={styles.successIcon}>
              <div style={styles.iconCircle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
            
            <div style={styles.header}>
              <h2 style={styles.title}>Check Your Email</h2>
              <p style={styles.subtitle}>
                We've sent password reset instructions to<br />
                <strong style={{ color: '#ffffff' }}>{email}</strong>
              </p>
            </div>

            <div style={{ ...styles.message, ...styles.successMessage }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                {message}
              </div>
            </div>

            <div style={{ color: '#8e8ea0', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              <p>Click the link in the email to reset your password.</p>
              <p style={{ marginTop: '0.5rem' }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <button
              style={styles.backButton}
              onClick={handleClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#8e8ea0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#565869';
              }}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          // Form State
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Forgot Password?</h2>
              <p style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div style={{ ...styles.message, ...styles.errorMessage }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div style={styles.formContainer}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  style={styles.input}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') {
                      handleFormSubmit(e as any);
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleFormSubmit}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#d0d0d0';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={styles.loadingSpinner}></div>
                    Sending Email...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Send Reset Email
                  </>
                )}
              </button>

              <button
                type="button"
                style={styles.backButton}
                onClick={handleClose}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = '#8e8ea0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#565869';
                  }
                }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Replace local state with context
  const { showSignInPopup, setShowSignInPopup } = useSignInModal();
  const { handleNavigationAttempt } = useUnsavedChanges();
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Add this state
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      // Update waitlist status if email exists in waitlist
      if (result?.user?.email) {
        await updateWaitlistStatus(result.user.email);
      }
      
      setShowSignInPopup(false);
      handleNavigationAttempt('/Dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // Handle form sign in
  const handleFormSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      
      // Update waitlist status if email exists in waitlist
      await updateWaitlistStatus(username);
      
      // Clear form
      setUsername('');
      setPassword('');
      setRememberMe(false);
      
      // Close popup and redirect to dashboard
      setShowSignInPopup(false);
      navigate('/Dashboard');
      
    } catch (error: any) {
      console.error('Form sign in error:', error);
      
      // Handle specific Firebase errors with user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Incorrect Email and/or Password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid Email Address');
      } else if (error.code === 'auth/user-disabled') {
        setError('This Account Has Been Disabled');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too Many Failed Attempts. Please Try Again Later');
      } else {
        setError('Failed to Sign In. Please Try Again');
      }
    } finally {
      setLoading(false);
    }
  };

  // Updated forgot password handler
  const handleForgotPassword = () => {
    console.log('handleForgotPassword called, opening modal...'); // Debug log
    setShowForgotPassword(true);
  };

  // Handle join button click
  const handleJoinClick = () => {
    navigate('/CreateAccount');
  };

  // Handle signup from popup
  const handleSignupClick = () => {
    setShowSignInPopup(false);
    navigate('/CreateAccount');
  };

  // Handle opening sign in popup - clear any existing errors
  const handleOpenSignInPopup = () => {
    setError(null); // Clear any previous errors
    setUsername(''); // Clear form
    setPassword(''); // Clear form
    setRememberMe(false); // Reset checkbox
    setShowSignInPopup(true);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Staff authorization check
  const isStaffMember = user?.email === 'diegorafaelpitt@gmail.com' || user?.email === 'jacobnathanshaprio@gmail.com';

  // All your existing styles remain the same...
  const navStyles = {
    backgroundColor: isScrolled ? '#08080841' : '#080808',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    width: '100%',
    zIndex: 1000,
    transition: 'background-color 0.3s ease',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none'
  };

  const mainContainerStyles = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const leftSectionStyles = {
    display: 'flex',
    alignItems: 'center'
  };

  const logoStyles = {
    height: '30px'
  };

  const middleSectionStyles = {
    display: 'flex',
    alignItems: 'center'
  };

  const navListStyles = {
    listStyle: 'none',
    display: 'flex',
    margin: 0,
    padding: 0,
    gap: '2.5rem'
  };

  const linkStyles = {
    color: '#ffffff',
    textDecoration: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'transform 0.2s ease'
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const authButtonsStyles = {
    display: 'flex',
    gap: '1rem'
  };

  const baseButtonStyles = {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease, border 0.3s ease, transform 0.2s ease',
    outline: 'none'
  };

  const signInButtonStyles = {
    ...baseButtonStyles,
    backgroundColor: '#080808',
    color: 'white',
    border: '1px solid white'
  };

  const joinButtonStyles = {
    ...baseButtonStyles,
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid black'
  };

  const iconStyles = {
    fontSize: '32px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const profileMenuStyles = {
    position: 'relative' as const,
    cursor: 'pointer'
  };

  const profilePictureStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%'
  };

  const dropdownStyles = {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    zIndex: 20,
    borderRadius: '4px',
    overflow: 'hidden',
    minWidth: '150px'
  };

  const dropdownLinkStyles = {
    display: 'block',
    color: 'white',
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    transition: 'transform 0.2s ease'
  };

  const popupOverlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(59, 131, 246, 0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(8px)'
  };

  const popupStyles = {
    backgroundColor: '#000000',
    padding: '2rem',
    borderRadius: '0.75rem',
    width: '26rem',
    maxWidth: '90%',
    color: '#ffffff',
    position: 'relative' as const,
    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.12)',
    fontFamily: '"OpenAI Sans", sans-serif',
    border: '1px solid #1a1a1a'
  };

  const popupHeaderStyles = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    textAlign: 'center' as const,
    color: '#ffffff',
    lineHeight: '1.5',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const popupSubtitleStyles = {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    lineHeight: '1.4',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const googleButtonStyles = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const primaryButtonStyles = {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '0.75rem',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const inputStyles = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#000000',
    border: '1px solid #1a1a1a',
    borderRadius: '0.375rem',
    color: '#ffffff',
    fontSize: '0.875rem',
    marginBottom: '0.75rem',
    fontFamily: '"OpenAI Sans", sans-serif',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  };

  const passwordContainerStyles = {
    position: 'relative' as const,
    marginBottom: '0.75rem'
  };

  const passwordToggleStyles = {
    position: 'absolute' as const,
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const checkboxContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    fontSize: '0.875rem'
  };

  const checkboxStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const forgotPasswordStyles = {
    color: '#ffffff',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
    fontFamily: '"OpenAI Sans", sans-serif',
    background: 'none',
    border: 'none',
    padding: 0
  };

  const signupLinkStyles = {
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    display: 'inline'
  };

  const dividerStyles = {
    textAlign: 'center' as const,
    margin: '1rem 0',
    position: 'relative' as const,
    color: 'rgba(255, 255, 255, 0.44)',
    fontSize: '0.75rem',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  const dividerLineStyles = {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: '#1a1a1a'
  };

  const dividerTextStyles = {
    backgroundColor: '#000000',
    padding: '0 0.75rem',
    position: 'relative' as const,
    zIndex: 1
  };

  const closeButtonStyles = {
    position: 'absolute' as const,
    top: '0.75rem',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s ease',
    fontFamily: '"OpenAI Sans", sans-serif'
  };

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=forum,notifications" />
      
      <nav style={navStyles}>
        <div style={mainContainerStyles}>
          <div style={leftSectionStyles}>
            <a 
              href={isAuthenticated ? '/LandingPage' : '/'} 
              onClick={(e) => {
                e.preventDefault();
                navigate(isAuthenticated ? '/Dashboard' : '/');
              }}
              style={{color: 'inherit', textDecoration: 'none'}}
            >
              <img src={logo} alt="CodePlace" style={logoStyles} />
            </a>
          </div>

          <div style={middleSectionStyles}>
            <ul style={navListStyles}>
              <li>
                <a 
                  href="/Dashboard" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/Dashboard');
                  }}
                  style={linkStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="/JobSearch" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/JobSearch');
                  }}
                  style={linkStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Find Jobs
                </a>
              </li>
              <li>
                <a 
                  href="/PostJobs" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/PostJobs');
                  }}
                  style={linkStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Post Jobs
                </a>
              </li>
              <li>
                <a 
                  href="/Teams" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/Teams');
                  }}
                  style={linkStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Teams
                </a>
              </li>
              {isStaffMember && (
                <li>
                  <a 
                    href="/Staff" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/Staff');
                    }}
                    style={{
                      ...linkStyles,
                      color: '#ff6b6b',
                      fontWeight: 700
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                      e.currentTarget.style.color = '#ff5252';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.color = '#ff6b6b';
                    }}
                  >
                    Staff
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div style={rightSectionStyles}>
            {!isAuthenticated ? (
              <div style={authButtonsStyles}>
                <button 
                  style={signInButtonStyles} 
                  onClick={handleOpenSignInPopup}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Sign In
                </button>
                <button 
                  style={joinButtonStyles} 
                  onClick={handleJoinClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.color = 'black';
                    e.currentTarget.style.border = '1px solid #f5f5f5';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = 'black';
                    e.currentTarget.style.border = '1px solid black';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Join
                </button>
              </div>
            ) : (
              <>
                <span
                  className="material-symbols-outlined"
                  style={iconStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => navigate('/Messages')}
                >
                  forum
                </span>

                <span
                  className="material-symbols-outlined"
                  style={iconStyles}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onClick={() => navigate('/Dashboard')}
                >
                  notifications
                </span>

                <div
                  style={profileMenuStyles}
                  ref={dropdownRef}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      style={profilePictureStyles}
                    />
                  ) : (
                    <div
                      style={{
                        ...profilePictureStyles,
                        backgroundColor: '#7f4dca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                    </div>
                  )}
                  {isDropdownOpen && (
                    <div style={dropdownStyles}>
                      <a 
                        href="/Profile" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/Profile');
                        }}
                        style={dropdownLinkStyles}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Profile
                      </a>
                      <a 
                        href="/Settings" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/Profile');
                        }}
                        style={dropdownLinkStyles}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Settings
                      </a>
                      <button 
                        onClick={handleLogout} 
                        style={{
                          ...dropdownLinkStyles, 
                          background: 'none', 
                          border: 'none', 
                          width: '100%', 
                          textAlign: 'left' as const, 
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Sign In Popup - now controlled by context */}
      {showSignInPopup && (
        <div style={popupOverlayStyles} onClick={() => setShowSignInPopup(false)}>
          <div style={popupStyles} onClick={(e) => e.stopPropagation()}>
            <button 
              style={closeButtonStyles}
              onClick={() => setShowSignInPopup(false)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            
            <h1 style={popupHeaderStyles}>Welcome back</h1>
            <p style={popupSubtitleStyles}>
              Choose your preferred sign-in method.
            </p>

            {error && (
              <div style={{
                padding: '0.875rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                textAlign: 'center' as const,
                color: '#ef4444'
              }}>
                {error}
              </div>
            )}

            <button 
              style={googleButtonStyles}
              onClick={handleGoogleSignIn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div style={dividerStyles}>
              <div style={dividerLineStyles}></div>
              <span style={dividerTextStyles}>OR</span>
            </div>

            <form onSubmit={handleFormSignIn}>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyles}
                placeholder="Email"
                required
                onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
              />

              <div style={passwordContainerStyles}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyles, marginBottom: 0, paddingRight: '3rem' }}
                  placeholder="Password"
                  required
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
                />
                <button
                  type="button"
                  style={passwordToggleStyles}
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  {!showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div style={checkboxContainerStyles}>
                <div style={checkboxStyles}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    id="rememberMe"
                    style={{ accentColor: '#ffffff' }}
                  />
                  <label htmlFor="rememberMe" style={{ color: '#ffffff', cursor: 'pointer', fontSize: '0.875rem', fontFamily: '"OpenAI Sans", sans-serif' }}>
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  style={forgotPasswordStyles}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Forgot password clicked!'); // Debug log
                    handleForgotPassword();
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit"
                style={primaryButtonStyles}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '1rem', lineHeight: '1.4', fontFamily: '"OpenAI Sans", sans-serif' }}>
              Don't have an account? <button 
                type="button"
                style={signupLinkStyles}
                onClick={handleSignupClick}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >Sign up</button>
            </p>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userEmail={username} // Pass the current email from the sign-in form
      />
    </>
  );
}