// Create this file: context/SignInModalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SignInModalContextType {
  showSignInPopup: boolean;
  setShowSignInPopup: (show: boolean) => void;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

const SignInModalContext = createContext<SignInModalContextType | undefined>(undefined);

export const useSignInModal = () => {
  const context = useContext(SignInModalContext);
  if (context === undefined) {
    throw new Error('useSignInModal must be used within a SignInModalProvider');
  }
  return context;
};

interface SignInModalProviderProps {
  children: ReactNode;
}

export const SignInModalProvider: React.FC<SignInModalProviderProps> = ({ children }) => {
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const openSignInModal = () => setShowSignInPopup(true);
  const closeSignInModal = () => setShowSignInPopup(false);

  return (
    <SignInModalContext.Provider value={{ 
      showSignInPopup, 
      setShowSignInPopup, 
      openSignInModal, 
      closeSignInModal 
    }}>
      {children}
    </SignInModalContext.Provider>
  );
};