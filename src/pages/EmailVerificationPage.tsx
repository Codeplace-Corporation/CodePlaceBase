// EmailVerificationPage.tsx - Updated to handle both email verification and password reset
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuth, applyActionCode, confirmPasswordReset, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'password-reset'>('loading');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);
  const [actionMode, setActionMode] = useState<string>('');
  
  // Password reset specific states
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const handleAction = async () => {
      // Prevent double processing
      if (hasProcessed) {
        console.log('Already processed, skipping...');
        return;
      }
      
      setHasProcessed(true);
      
      try {
        // Get URL parameters
        const actionCode = searchParams.get('oobCode');
        const mode = searchParams.get('mode');
        const continueUrl = searchParams.get('continueUrl');
        
        console.log('Action parameters:', { 
          actionCode: actionCode?.substring(0, 20) + '...', 
          mode, 
          continueUrl 
        });

        // Extract user info from continueUrl if present
        let email = searchParams.get('email') || '';
        let name = searchParams.get('name') || '';
        
        if (continueUrl) {
          try {
            const decodedUrl = decodeURIComponent(continueUrl);
            console.log('Decoded continue URL:', decodedUrl);
            
            // Extract parameters from the continue URL
            const urlParts = decodedUrl.split('?');
            if (urlParts.length > 1) {
              const urlParams = new URLSearchParams(urlParts[1]);
              email = urlParams.get('email') || email;
              name = urlParams.get('name') || name;
              
              // Decode email if it's URL encoded
              if (email) {
                email = decodeURIComponent(email.replace(/\+/g, ' '));
              }
              if (name) {
                name = decodeURIComponent(name.replace(/\+/g, ' '));
              }
            }
          } catch (e) {
            console.error('Error parsing continueUrl:', e);
          }
        }

        setUserEmail(email);
        setUserName(name);
        setActionMode(mode || '');

        if (!actionCode) {
          console.error('No action code found in URL');
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link - no action code found');
          return;
        }

        if (!mode) {
          console.error('No mode found in URL');
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link - no mode specified');
          return;
        }

        // Handle different modes
        switch (mode) {
          case 'verifyEmail':
            await handleEmailVerification(actionCode, email, name);
            break;
          case 'resetPassword':
            await handlePasswordResetVerification(actionCode, email);
            break;
          default:
            console.error('Invalid mode:', mode);
            setVerificationStatus('error');
            setErrorMessage(`Invalid verification link - unsupported mode: ${mode}`);
        }

      } catch (error: any) {
        console.error('❌ Action processing error:', error);
        
        if (error.code === 'auth/invalid-action-code') {
          setVerificationStatus('expired');
          setErrorMessage('This verification link has expired or has already been used.');
        } else if (error.code === 'auth/expired-action-code') {
          setVerificationStatus('expired');
          setErrorMessage('This verification link has expired. Please request a new one.');
        } else {
          setVerificationStatus('error');
          setErrorMessage(error.message || 'Failed to process verification link.');
        }
      }
    };

    handleAction();
  }, [searchParams, auth, db, navigate, hasProcessed]);

  const handleEmailVerification = async (actionCode: string, email: string, name: string) => {
    console.log('Processing email verification...');

    // Apply the email verification code
    await applyActionCode(auth, actionCode);
    console.log('✅ Email verification successful!');

    // Small delay to ensure Firebase processes the verification
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check current user and reload to get fresh status
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      console.log('User reloaded, emailVerified:', currentUser.emailVerified);
      
      if (currentUser.emailVerified) {
        // Update Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            verificationMethod: 'email_link'
          });
          console.log('✅ Firestore updated successfully');
        } catch (firestoreError) {
          console.error('Error updating Firestore:', firestoreError);
        }

        // Set success immediately
        setVerificationStatus('success');
        
        // Redirect to dashboard after 4 seconds
        setTimeout(() => {
          navigate('/Dashboard');
        }, 4000);
        
        return;
      }
    }

    // If we get here, something went wrong
    console.log('⚠️ Verification applied but user not found or not verified');
    setVerificationStatus('error');
    setErrorMessage('Verification completed but user session not found. Please sign in.');
  };

  const handlePasswordResetVerification = async (actionCode: string, email: string) => {
    console.log('Processing password reset verification...');
    
    // For password reset, we just verify the code is valid
    // The actual password reset happens when user submits new password
    setVerificationStatus('password-reset');
    setUserEmail(email);
  };

  const validatePassword = (password: string): boolean => {
    // Same validation as your CreateAccount component
    const passwordRegex = /^(?=.*[0-9])(?=.*[!?&%#$])[A-Za-z0-9!?&%#$]{10,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }

    if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 10 characters with one number and one special character (!?&%#$)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setResetLoading(true);
    setPasswordError('');

    try {
      const actionCode = searchParams.get('oobCode');
      if (!actionCode) {
        throw new Error('Invalid action code');
      }

      // Confirm the password reset
      await confirmPasswordReset(auth, actionCode, newPassword);
      console.log('✅ Password reset successful!');
      
      setVerificationStatus('success');
      
      // Redirect to landing page immediately
      console.log('Redirecting to landing page immediately...'); // Debug log
      navigate('/');
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/invalid-action-code') {
        setPasswordError('This reset link has expired or has already been used.');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('Password is too weak. Please choose a stronger password.');
      } else {
        setPasswordError(error.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignIn = () => {
    // Go to landing page where they can sign in
    navigate('/');
  };

  const handleResendVerification = () => {
    // Redirect back to sign up page using exact route
    navigate('/CreateAccount');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    } as React.CSSProperties,

    card: {
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      borderRadius: '1rem',
      padding: '3rem',
      width: '100%',
      maxWidth: '32rem',
      border: '1px solid #565869',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      textAlign: 'center' as const
    } as React.CSSProperties,

    icon: {
      width: '5rem',
      height: '5rem',
      margin: '0 auto 2rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem'
    } as React.CSSProperties,

    successIcon: {
      background: `
        conic-gradient(
          from 0deg,
          #22c55e 0deg,
          #16a34a 90deg,
          #15803d 180deg,
          #22c55e 270deg,
          #16a34a 360deg
        )
      `,
      color: '#ffffff',
      animation: 'pulse 2s infinite'
    } as React.CSSProperties,

    errorIcon: {
      background: 'conic-gradient(from 0deg, #ef4444 0deg, #dc2626 180deg, #b91c1c 360deg)',
      color: '#ffffff'
    } as React.CSSProperties,

    loadingIcon: {
      background: 'conic-gradient(from 0deg, #3b82f6 0deg, #2563eb 180deg, #1d4ed8 360deg)',
      color: '#ffffff'
    } as React.CSSProperties,

    passwordResetIcon: {
      background: 'conic-gradient(from 0deg, #8b5cf6 0deg, #7c3aed 180deg, #6d28d9 360deg)',
      color: '#ffffff'
    } as React.CSSProperties,

    title: {
      fontSize: '2rem',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '1rem',
      lineHeight: '1.2'
    } as React.CSSProperties,

    subtitle: {
      color: '#8e8ea0',
      fontSize: '1rem',
      marginBottom: '2rem',
      lineHeight: '1.5'
    } as React.CSSProperties,

    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      textAlign: 'left' as const
    } as React.CSSProperties,

    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    } as React.CSSProperties,

    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#ffffff'
    } as React.CSSProperties,

    input: {
      width: '100%',
      padding: '0.875rem',
      backgroundColor: 'transparent',
      border: '1px solid #565869',
      borderRadius: '0.375rem',
      color: '#ffffff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const
    } as React.CSSProperties,

    passwordContainer: {
      position: 'relative' as const
    } as React.CSSProperties,

    passwordToggle: {
      position: 'absolute' as const,
      right: '0.875rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#8e8ea0',
      cursor: 'pointer',
      padding: '0.25rem'
    } as React.CSSProperties,

    button: {
      width: '100%',
      padding: '0.875rem',
      fontSize: '1rem',
      fontWeight: '600',
      backgroundColor: '#ffffff',
      color: '#000000',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      marginBottom: '1rem'
    } as React.CSSProperties,

    secondaryButton: {
      width: '100%',
      padding: '0.875rem',
      fontSize: '1rem',
      fontWeight: '500',
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1px solid #565869',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit'
    } as React.CSSProperties,

    loadingSpinner: {
      width: '2rem',
      height: '2rem',
      border: '3px solid transparent',
      borderTop: '3px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    } as React.CSSProperties,

    errorBox: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1.5rem',
      color: '#ef4444',
      fontSize: '0.875rem'
    } as React.CSSProperties,

    successBox: {
      backgroundColor: 'rgba(16, 163, 127, 0.1)',
      border: '1px solid #10a37f',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginBottom: '2rem',
      color: '#10a37f'
    } as React.CSSProperties,

    countdown: {
      color: '#10a37f',
      fontSize: '0.875rem',
      marginTop: '1rem',
      padding: '0.5rem',
      backgroundColor: 'rgba(16, 163, 127, 0.1)',
      borderRadius: '0.375rem',
      border: '1px solid rgba(16, 163, 127, 0.3)'
    } as React.CSSProperties
  };

  // Add animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [countdown, setCountdown] = useState(4);

  // Countdown timer for success state
  useEffect(() => {
    if (verificationStatus === 'success' && actionMode === 'verifyEmail') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus, actionMode]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <>
            <div style={{ ...styles.icon, ...styles.loadingIcon }}>
              <div style={styles.loadingSpinner}></div>
            </div>
            <h1 style={styles.title}>Processing...</h1>
            <p style={styles.subtitle}>
              Please wait while we process your request.
            </p>
          </>
        );

      case 'password-reset':
        return (
          <>
            <div style={{ ...styles.icon, ...styles.passwordResetIcon }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={styles.title}>Reset Your Password</h1>
            <p style={styles.subtitle}>
              {userEmail && <>for <strong style={{ color: '#ffffff' }}>{userEmail}</strong><br/></>}
              Enter your new password below.
            </p>

            {passwordError && (
              <div style={styles.errorBox}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordReset} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    style={styles.input}
                    placeholder="Enter your new password"
                    required
                    disabled={resetLoading}
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={resetLoading}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                      </svg>
                    )}
                  </button>
                </div>
                <small style={{ color: '#8e8ea0', fontSize: '0.75rem' }}>
                  At least 10 characters with one number and one special character (!?&%#$)
                </small>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  style={styles.input}
                  placeholder="Confirm your new password"
                  required
                  disabled={resetLoading}
                />
              </div>

              <button 
                type="submit"
                style={{
                  ...styles.button,
                  ...(resetLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                }}
                disabled={resetLoading}
                onMouseEnter={(e) => {
                  if (!resetLoading) {
                    e.currentTarget.style.backgroundColor = '#d0d0d0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!resetLoading) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                {resetLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <button 
              style={styles.secondaryButton}
              onClick={handleSignIn}
              disabled={resetLoading}
              onMouseEnter={(e) => {
                if (!resetLoading) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = '#8e8ea0';
                }
              }}
              onMouseLeave={(e) => {
                if (!resetLoading) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#565869';
                }
              }}
            >
              Back to Sign In
            </button>
          </>
        );

      case 'success':
        if (actionMode === 'resetPassword') {
          return (
            <>
              <div style={{ ...styles.icon, ...styles.successIcon }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 style={styles.title}>Password Reset Successful!</h1>
              <p style={styles.subtitle}>
                Your password has been successfully reset.
              </p>
              
              <div style={styles.successBox}>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                  🎉 <strong>All done!</strong> Your password has been successfully reset. You can now sign in with your new password from the CodePlace homepage.
                </p>
              </div>

              <button 
                style={styles.button}
                onClick={() => {
                  console.log('Manual redirect to landing page'); // Debug log
                  navigate('/');
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Go to CodePlace
              </button>

              <div style={styles.countdown}>
                🕒 Redirecting to CodePlace in 3 seconds...
              </div>
            </>
          );
        } else {
          // Email verification success
          return (
            <>
              <div style={{ ...styles.icon, ...styles.successIcon }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 style={styles.title}>
                🎉 Welcome to CodePlace{userName ? `, ${userName}` : ''}!
              </h1>
              <p style={styles.subtitle}>
                Your email address has been successfully verified.
              </p>
              
              <div style={styles.successBox}>
                <h3 style={{ color: '#10a37f', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                  🚀 You're all set! Here's what's next:
                </h3>
                <ul style={{ textAlign: 'left', lineHeight: '1.8', margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  <li><strong>Complete your profile</strong> - Add your skills and experience</li>
                  <li><strong>Browse projects</strong> - Find work that matches your expertise</li>
                  <li><strong>Connect with clients</strong> - Build lasting professional relationships</li>
                  <li><strong>Grow your portfolio</strong> - Showcase your best work</li>
                </ul>
              </div>

              <button 
                style={styles.button}
                onClick={() => navigate('/Dashboard')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Enter Your Dashboard
              </button>

              {countdown > 0 && (
                <div style={styles.countdown}>
                  🕒 Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
                </div>
              )}
            </>
          );
        }

      case 'expired':
        return (
          <>
            <div style={{ ...styles.icon, ...styles.errorIcon }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 style={styles.title}>Link Expired</h1>
            <p style={styles.subtitle}>
              This {actionMode === 'resetPassword' ? 'password reset' : 'verification'} link has expired or has already been used.
            </p>
            
            <div style={styles.errorBox}>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                {errorMessage}
              </p>
            </div>

            <button 
              style={styles.button}
              onClick={actionMode === 'resetPassword' ? () => navigate('/signIn') : handleResendVerification}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              {actionMode === 'resetPassword' ? 'Request New Reset Link' : 'Request New Verification Email'}
            </button>

            <button 
              style={styles.secondaryButton}
              onClick={handleSignIn}
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
        );

      case 'error':
      default:
        return (
          <>
            <div style={{ ...styles.icon, ...styles.errorIcon }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h1 style={styles.title}>Action Failed</h1>
            <p style={styles.subtitle}>
              We couldn't process your request at this time.
            </p>
            
            <div style={styles.errorBox}>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                {errorMessage || 'There was an issue with the verification link.'}
              </p>
            </div>

            <button 
              style={styles.button}
              onClick={actionMode === 'resetPassword' ? () => navigate('/signIn') : handleResendVerification}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d0d0d0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Try Again
            </button>

            <button 
              style={styles.secondaryButton}
              onClick={handleSignIn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = '#8e8ea0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#565869';
              }}
            >
              Contact Support
            </button>
          </>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {renderContent()}
      </div>
    </div>
     );
};

export default EmailVerificationPage;