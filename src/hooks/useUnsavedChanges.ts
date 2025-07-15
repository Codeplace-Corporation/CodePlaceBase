import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseUnsavedChangesReturn {
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

export const useUnsavedChanges = (): UseUnsavedChangesReturn => {
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

  return {
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
}; 