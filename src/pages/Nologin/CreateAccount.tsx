// Fixed CreateAccount component with syntax errors resolved
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, User, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  agreeToTerms: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();

  // State variables
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    agreeToTerms: false
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmailVerification, setShowEmailVerification] = useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  const auth = getAuth();
  const db = getFirestore();
  const googleProvider = new GoogleAuthProvider();

  // For now, create a simple openSignInModal function
  // You can replace this with your actual context when available
  const openSignInModal = () => {
    console.log('Opening sign in modal');
    navigate('/signIn');
  };

  // Countries list - US first, then alphabetical
  const countries = [
    'United States',
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];

  // Effects
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showCountryDropdown && !target.closest('[data-country-dropdown]')) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  // Force dropdown positioning and prevent auto-flip
  React.useEffect(() => {
    if (showCountryDropdown) {
      // Scroll the page slightly if needed to ensure dropdown has space
      const countryInput = document.querySelector('[data-country-dropdown]');
      if (countryInput) {
        const rect = countryInput.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 200; // maxHeight of dropdown
        const spaceBelow = viewportHeight - rect.bottom;
        
        // If there's not enough space below, scroll the page up slightly
        if (spaceBelow < dropdownHeight + 20) {
          const scrollAmount = dropdownHeight + 20 - spaceBelow;
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [showCountryDropdown]);

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Force dropdown positioning and prevent browser auto-flip */
      [data-country-dropdown] .dropdown-container {
        position: relative;
        isolation: isolate;
      }
      
      [data-country-dropdown] .dropdown-menu {
        position: absolute !important;
        top: 100% !important;
        bottom: auto !important;
        transform: none !important;
      }
      
      /* Custom scrollbar styling for country dropdown */
      .country-dropdown-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
      }
      
      .country-dropdown-scroll::-webkit-scrollbar {
        width: 4px;
      }
      
      .country-dropdown-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .country-dropdown-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      
      .country-dropdown-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Email verification function
  const sendCustomEmailVerification = async (user: User): Promise<void> => {
    try {
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/email-verified?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(formData.firstName)}`,
          handleCodeInApp: false,
        };
        
        await sendEmailVerification(user, actionCodeSettings);
        console.log('Verification email sent with custom settings');
      } catch (customError) {
        console.warn('Custom settings failed, trying basic verification:', customError);
        await sendEmailVerification(user);
        console.log('Verification email sent with basic settings');
      }
      
      console.log(`Verification email sent to ${user.email} for user ${formData.firstName} ${formData.lastName}`);
      
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[!?&%#$])[A-Za-z0-9!?&%#$]{10,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 10 characters with one number and one special character (!?&%#$)';
    }

    if (!formData.country) {
      errors.country = 'Please select your country';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    return errors;
  };

  const checkExistingUser = async (): Promise<boolean> => {
    try {
      const emailQuery = query(collection(db, 'users'), where('email', '==', formData.email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        setValidationErrors(prev => ({ ...prev, email: 'Email is already registered' }));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking existing user:', error);
      setError('Error validating user information');
      return false;
    }
  };

  const saveUserToFirestore = async (user: User): Promise<void> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        verificationEmailSent: new Date(),
        developerScore: 600,
        mainAccountType: 'developer',
      });
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      throw new Error('Failed to save user profile');
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country }));
    setShowCountryDropdown(false);
    setCountrySearch('');
    
    // Clear validation error
    if (validationErrors.country) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  // Fixed input change handler
  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (error) {
      setError(null);
    }
  };

  const handleTermsClick = (type: 'terms' | 'agreement' | 'privacy') => {
    console.log(`Opening ${type} page`);
  };

  const handleLoginClick = () => {
    openSignInModal();
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setValidationErrors({});

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));

      if (userSnapshot.empty) {
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          phoneNumber: user.phoneNumber || '',
          country: '',
          userType: '',
          photoURL: user.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          signUpMethod: 'google',
          emailVerified: user.emailVerified,
          developerScore: 600,
          mainAccountType: 'developer',
        });
      }

      console.log('Google sign up successful:', user);
      
      if (user.emailVerified) {
        navigate('/Dashboard');
      } else {
        await sendCustomEmailVerification(user);
        setPendingUser(user);
        setShowEmailVerification(true);
      }
      
    } catch (error: any) {
      console.error('Google sign up error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups and try again.');
      } else {
        setError(error.message || 'Failed to sign up with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setValidationErrors(validationErrors);
        setLoading(false);
        return;
      }

      const canProceed = await checkExistingUser();
      if (!canProceed) {
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await saveUserToFirestore(userCredential.user);
      await sendCustomEmailVerification(userCredential.user);
      
      console.log('User created with email verification:', userCredential.user);
      
      setPendingUser(userCredential.user);
      setShowEmailVerification(true);
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setValidationErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      } else if (error.code === 'auth/weak-password') {
        setValidationErrors(prev => ({ ...prev, password: 'Password is too weak' }));
      } else if (error.code === 'auth/invalid-email') {
        setValidationErrors(prev => ({ ...prev, email: 'Invalid email address' }));
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleCreateAccount();
  };

  const handleVerifyEmail = async (): Promise<void> => {
    if (!pendingUser) return;

    setLoading(true);
    setError(null);

    try {
      await pendingUser.reload();
      
      if (pendingUser.emailVerified) {
        const userRef = doc(db, 'users', pendingUser.uid);
        await setDoc(userRef, {
          emailVerified: true,
          emailVerifiedAt: new Date()
        }, { merge: true });
        
        console.log('Email verified successfully');
        setShowEmailVerification(false);
        navigate('/Dashboard');
      } else {
        setError('Please check your email and click the verification link before continuing.');
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      setError('Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    if (!pendingUser) return;

    setResendLoading(true);
    setError(null);

    try {
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/email-verified?email=${encodeURIComponent(pendingUser.email || '')}&name=${encodeURIComponent(formData.firstName)}`,
          handleCodeInApp: false,
        };
        
        await sendEmailVerification(pendingUser, actionCodeSettings);
        console.log('Resend email sent with custom settings');
      } catch (customError) {
        console.warn('Custom settings failed for resend, trying basic:', customError);
        await sendEmailVerification(pendingUser);
        console.log('Resend email sent with basic settings');
      }
      
      const userRef = doc(db, 'users', pendingUser.uid);
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentCount = currentData.verificationEmailResendCount || 0;
      
      await setDoc(userRef, {
        lastVerificationEmailSent: new Date(),
        verificationEmailResendCount: currentCount + 1
      }, { merge: true });
      
      setError('✅ Verification email sent! Please check your inbox.');
      setTimeout(() => setError(null), 3000);
    } catch (error: any) {
      console.error('Error resending verification:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Helper function to get input styles with error state
  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: `1px solid ${validationErrors[fieldName] ? '#ef4444' : '#565869'}`,
    borderRadius: '0.375rem',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    '::placeholder': {
      color: '#8e8ea0'
    }
  });

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: '0rem',
      fontFamily: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    } as React.CSSProperties,

    formWrapper: {
      width: '100%',
      maxWidth: '36rem',
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      borderRadius: '1rem',
      padding: '2.5rem',
      paddingTop: '0rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    } as React.CSSProperties,

    title: {
      fontSize: '2rem',
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center' as const,
      marginBottom: '0.5rem',
      lineHeight: '1.2',
      paddingBottom: '2rem',
    } as React.CSSProperties,

    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem'
    } as React.CSSProperties,

    inputGroup: { 
      display: 'flex', 
      flexDirection: 'column' as const, 
      gap: '0.25rem'
    } as React.CSSProperties,

    label: { 
      fontSize: '0.875rem', 
      fontWeight: '500', 
      color: '#ffffff', 
      marginBottom: '0.15rem'
    } as React.CSSProperties,

    nameRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    } as React.CSSProperties,

    nameField: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    } as React.CSSProperties,

    checkboxGroup: {
      marginTop: '0.5rem'
    } as React.CSSProperties,

    checkboxLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      color: '#8e8ea0',
      fontSize: '0.875rem',
      lineHeight: '1.4',
      cursor: 'pointer'
    } as React.CSSProperties,

    checkbox: {
      width: '1rem',
      height: '1rem',
      marginTop: '0.125rem',
      accentColor: '#10a37f',
      flexShrink: 0
    } as React.CSSProperties,

    termsLink: {
      color: '#d0d0d0',
      textDecoration: 'underline',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 'inherit',
      fontFamily: 'inherit',
      display: 'inline'
    } as React.CSSProperties,

    googleButton: {
      width: '100%',
      padding: '0.875rem',
      fontSize: '1rem',
      fontWeight: '500',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      fontFamily: 'inherit'
    } as React.CSSProperties,

    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      fontSize: '0.875rem',
      color: '#8e8ea0'
    } as React.CSSProperties,

    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#565869'
    } as React.CSSProperties,

    dividerText: {
      margin: '0 1rem',
      color: '#8e8ea0',
      fontSize: '0.875rem',
      fontWeight: 500
    } as React.CSSProperties,

    submitButton: {
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
      marginTop: '0.5rem',
      fontFamily: 'inherit'
    } as React.CSSProperties,

    submitButtonDisabled: {
      backgroundColor: '#ffffff',
      cursor: 'not-allowed',
      opacity: 0.6
    } as React.CSSProperties,

    loginPrompt: {
      textAlign: 'center' as const,
      marginTop: '1.5rem',
      fontSize: '0.875rem',
      color: '#8e8ea0'
    } as React.CSSProperties,

    loginLink: {
      color: '#d0d0d0',
      textDecoration: 'underline',
      cursor: 'pointer',
      marginLeft: '0.25rem',
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 'inherit',
      fontFamily: 'inherit',
      display: 'inline'
    } as React.CSSProperties,

    error: {
      padding: '0.75rem',
      backgroundColor: '#f56565',
      color: '#ffffff',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      marginBottom: '1rem',
      textAlign: 'center' as const
    } as React.CSSProperties,

    fieldError: {
      color: '#ef4444',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
      display: 'block'
    } as React.CSSProperties,

    popupOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    } as React.CSSProperties,

    popup: {
      backgroundColor: 'rgba(8, 8, 8, 0.95)',
      borderRadius: '1rem',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '28rem',
      position: 'relative' as const,
      border: '1px solid #565869',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      fontFamily: '"Söhne", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    } as React.CSSProperties,

    popupTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center' as const,
      marginBottom: '0.75rem',
      lineHeight: '1.2'
    } as React.CSSProperties,

    popupSubtitle: {
      textAlign: 'center' as const,
      color: '#8e8ea0',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    } as React.CSSProperties
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.formWrapper}>
          <h1 style={styles.title}>Get Started With CodePlace</h1>
   
          {error && <div style={styles.error}>{error}</div>}
          
          {/* Google Sign Up Button */}
          <button 
            type="button"
            onClick={handleGoogleSignUp}
            style={styles.googleButton}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing up...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* First and Last Name */}
            <div style={styles.nameRow}>
              <div style={styles.nameField}>
                <label style={styles.label}>First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={handleInputChange('firstName')}
                  style={getInputStyles('firstName')}
                  placeholder="First name"
                />
                {validationErrors.firstName && (
                  <span style={styles.fieldError}>{validationErrors.firstName}</span>
                )}
              </div>
              <div style={styles.nameField}>
                <label style={styles.label}>Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={handleInputChange('lastName')}
                  style={getInputStyles('lastName')}
                  placeholder="Last name"
                />
                {validationErrors.lastName && (
                  <span style={styles.fieldError}>{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="text" 
                value={formData.email} 
                onChange={handleInputChange('email')}
                style={getInputStyles('email')}
                placeholder="Enter your email address"
              />
              {validationErrors.email && (
                <span style={styles.fieldError}>{validationErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} 
                  value={formData.password} 
                  onChange={handleInputChange('password')}
                  style={getInputStyles('password')}
                  placeholder="Minimum 10 characters, one number, one special (!?&%#$)" 
                  title="Password must be at least 10 characters with one number and one special character (!?&%#$)"
                />
                <button   
                  type="button"  
                  onClick={() => setShowPassword(!showPassword)}   
                  style={{    
                    position: "absolute",    
                    right: "0.75rem",    
                    top: "50%",    
                    transform: "translateY(-50%)",    
                    cursor: "pointer",    
                    color: "#8e8ea0",    
                    background: "transparent",    
                    border: "none",    
                    padding: 0  
                  }}
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
              {validationErrors.password && (
                <span style={styles.fieldError}>{validationErrors.password}</span>
              )}
            </div>

            {/* Custom Country Dropdown */}
            <div style={{...styles.inputGroup, position: 'relative', zIndex: 10}} data-country-dropdown>
              <label style={styles.label}>Country</label>
              <div style={{ position: 'relative' }} className="dropdown-container">
                <div
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  style={{
                    ...getInputStyles('country'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    minHeight: '48px'
                  }}
                >
                  <span style={{ 
                    color: formData.country ? '#ffffff' : '#8e8ea0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formData.country || 'Select your country'}
                  </span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="2"
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: showCountryDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>

                {/* Custom Dropdown - Force Downward */}
                {showCountryDropdown && (
                  
                <div 
  className="dropdown-menu"
  style={{
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    border: '1px solid #565869',
    borderRadius: '0.375rem',
    marginTop: '4px',
    maxHeight: '200px', // optional: to cap height
    overflow: 'hidden', // prevents outer scrollbars
    zIndex: 9999,
    boxShadow: '0 10px 25px -12px rgba(0, 0, 0, 0.8)',
    transform: 'translateZ(0)',
    willChange: 'transform',
  }}
>

                    {/* Search input */}
                    <div style={{ padding: '8px' }}>
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: '#111',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Country options */}
                    <div 
                      className="country-dropdown-scroll"
                        style={{ 
    maxHeight: '150px', 
    overflowY: 'auto' 
  }}
                    >
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country, index) => (
                          <div
                            key={country}
                            onClick={() => handleCountrySelect(country)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              color: '#ffffff',
                              fontSize: '14px',
                              borderBottom: index < filteredCountries.length - 1 ? '1px solid #333' : 'none',
                              fontWeight: country === 'United States' ? '600' : 'normal',
                              transition: 'background-color 0.1s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#333';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {country}
                          </div>
                        ))
                      ) : (
                        <div style={{
                          padding: '12px 16px',
                          color: '#8e8ea0',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}>
                          No countries found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {validationErrors.country && (
                <span style={styles.fieldError}>{validationErrors.country}</span>
              )}
            </div>

            {/* Terms Agreement */}
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange('agreeToTerms')}
                  style={styles.checkbox}
                />
                <span>
                  Yes, I agree to and understand the{' '}
                  <button 
                    type="button"
                    style={styles.termsLink}
                    onClick={() => handleTermsClick('terms')}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    CodePlace Terms of Service
                  </button>
                  , including the{' '}
                  <button 
                    type="button"
                    style={styles.termsLink}
                    onClick={() => handleTermsClick('agreement')}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    User Agreement
                  </button>
                  {' '}and{' '}
                  <button 
                    type="button"
                    style={styles.termsLink}
                    onClick={() => handleTermsClick('privacy')}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <span style={styles.fieldError}>{validationErrors.agreeToTerms}</span>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) { 
                  e.currentTarget.style.backgroundColor = '#d0d0d0'; 
                  e.currentTarget.style.color = '#000000'; 
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) { 
                  e.currentTarget.style.backgroundColor = '#ffffff'; 
                  e.currentTarget.style.color = '#000000'; 
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p style={styles.loginPrompt}>
            Already have an account?
            <button
              type="button"
              style={styles.loginLink}
              onClick={handleLoginClick}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Email Verification Popup */}
      {showEmailVerification && (
        <div style={styles.popupOverlay} onClick={() => setShowEmailVerification(false)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setShowEmailVerification(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#8e8ea0',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8e8ea0';
              }}
              aria-label="Close popup"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            {/* Custom Icon with Email Gradient */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                background: `
                  conic-gradient(
                    from 0deg,
                    #f97316 0deg,
                    #dc2626 22.5deg,
                    #a855f7 90deg,
                    #ec4899 112.5deg,
                    #3b82f6 180deg,
                    #1e3a8a 202.5deg,
                    #22c55e 270deg,
                    #10b981 292.5deg,
                    #f97316 360deg
                  )
                `,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(8, 8, 8, 0.95)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <linearGradient id="mailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="25%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="75%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="url(#mailGradient)" fill="none"/>
                    <polyline points="22,6 12,13 2,6" stroke="url(#mailGradient)" fill="none"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Personalized Title */}
            <h2 style={styles.popupTitle}>Welcome to CodePlace, {formData.firstName}!</h2>
            <p style={styles.popupSubtitle}>
              We've sent a verification email to<br />
              <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{pendingUser?.email}</strong>
            </p>

           

            {/* Error/Success Message */}
            {error && (
              <div style={{
                padding: '0.875rem 1rem',
                backgroundColor: error.includes('sent') ? 'rgba(16, 163, 127, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${error.includes('sent') ? '#10a37f' : '#ef4444'}`,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
                textAlign: 'center' as const,
                color: error.includes('sent') ? '#10a37f' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {error.includes('sent') ? (
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
                {error}
              </div>
            )}

            {/* Instructions */}
            <div style={{ 
              marginBottom: '2rem', 
              color: '#8e8ea0', 
              fontSize: '0.875rem', 
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              <p>Click the <strong style={{ color: '#ffffff' }}>"Verify Your Email"</strong> button in your email, then return here to continue.</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                The verification link will redirect you to Firebase's verification page.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleVerifyEmail}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  backgroundColor: loading ? 'rgba(255, 255, 255, 0.6)' : '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
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
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid #000000',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Checking Verification...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    I've Verified My Email
                  </>
                )}
              </button>

              <button 
                onClick={handleResendVerification}
                disabled={resendLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #565869',
                  borderRadius: '0.5rem',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: resendLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!resendLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = '#8e8ea0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!resendLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#565869';
                  }
                }}
              >
                {resendLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Sending Email...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>

            {/* Footer Help */}
            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center', 
              color: '#8e8ea0', 
              fontSize: '0.75rem',
              lineHeight: '1.4'
            }}>
              <p>Can't find the email? Check your spam folder or try a different email address.</p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong style={{ color: '#ffffff' }}>Need help?</strong> Contact our support team at{' '}
                <a href="mailto:support@codeplace.com" style={{ color: '#ffffff', textDecoration: 'underline' }}>
                  support@codeplace.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAccount;