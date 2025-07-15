import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UnsavedChangesContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  handleNavigationAttempt: (targetPath: string) => void;
  showUnsavedChangesModal: boolean;
  setShowUnsavedChangesModal: (show: boolean) => void;
  pendingNavigation: string | null;
  setPendingNavigation: (path: string | null) => void;
  handleSaveAndNavigate: () => void;
  handleNavigateWithoutSaving: () => void;
  handleCancelNavigation: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return context;
};

export const UnsavedChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const handleNavigationAttempt = useCallback((targetPath: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(targetPath);
      setShowUnsavedChangesModal(true);
    } else {
      navigate(targetPath);
    }
  }, [hasUnsavedChanges, navigate]);

  const handleSaveAndNavigate = useCallback(() => {
    setShowUnsavedChangesModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate]);

  const handleNavigateWithoutSaving = useCallback(() => {
    setShowUnsavedChangesModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  }, []);

  const value = {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    handleNavigationAttempt,
    showUnsavedChangesModal,
    setShowUnsavedChangesModal,
    pendingNavigation,
    setPendingNavigation,
    handleSaveAndNavigate,
    handleNavigateWithoutSaving,
    handleCancelNavigation,
  };

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}; 