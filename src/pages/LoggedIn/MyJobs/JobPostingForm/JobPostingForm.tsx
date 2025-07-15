import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../../../components/Modal';
// Remove the uuid import
// import { v4 as uuidv4 } from 'uuid';

// Import your step components
import Stpone from './JobPostingFormSteps/JobSpecificStpone/Stpone';
import ChallengeStepTwo from './JobPostingFormSteps/JobSpecifcStptwo/ChallengeStptwo';
import BountyStepThree from './JobPostingFormSteps/JobSpecifcStptwo/BountyStptwo';
import AuctionStepThree from './JobPostingFormSteps/JobSpecifcStptwo/AuctionStptwo';
import ContractStepThree from './JobPostingFormSteps/JobSpecifcStptwo/ContractStptwo';
import Stpfour from './JobPostingFormSteps/JobSpecificStpfour/Stpfour';
import Stpsix from './JobPostingFormSteps/JobSpecificStpsix/Stptsix';
import Stpthree from './JobPostingFormSteps/JobSpecificStpthree/Stpthree';
import AuctionStpfive from './JobPostingFormSteps/JobSpecificStpfive/AuctionStpfive';
import BountyStpfive from './JobPostingFormSteps/JobSpecificStpfive/BountyStpfive';
import ContractStpfive from './JobPostingFormSteps/JobSpecificStpfive/ContractStpfive';
import ChallengeStpfive from './JobPostingFormSteps/JobSpecificStpfive/ChallengeSptfive';
import Stpseven from './JobPostingFormSteps/JobSpecificStpseven/Stpseven';
import JobPreview from './JobPreview';

export interface FormData {
  // Basic project details (existing)
  projectTitle: string;
  companyName: string;
  projectOverview: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: 'Auction' | 'Bounty' | 'Contract' | 'Challenge' | '';
  JobSubType: string;
  projectDescription: string;
  projectFiles: (File | { name: string; type: string; size: number; isPlaceholder?: boolean; isGithubUrl?: boolean })[];
  imageFiles: Array<{ file: File; preview: string }>;
  compensation: string;
  estimatedProjectLength?: string; // Added for project length
  // Core job fields used in all job types
  id?: string;
  createdAt?: any;
  createdBy?: string;
  requirements?: string[];
  deliverables?: string[];
  skills?: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  remote?: boolean;
  experienceLevel?: string;
  applicationCount?: number;
  status?: string;
  category?: string;
  eprojectlength?: string; // Added for project length
  // Bounty-specific fields
  bountyAmount?: string;
  currency?: string;
  bountyStartDate?: string;
  bountyStartTime?: string; // Added for start time
  bountyExpiryTime?: string; // Added for expiry time
  complexityLevel?: string; // Added for project complexity
  deadlineType?: string;
  bountyDeadline?: string;
  bountyDuration?: string;
  completionCriteria?: string;
  requiredDeliverables?: string[];
  evaluationMethod?: string;
  reviewTimeline?: string;
  allowMultipleWinners?: boolean;
  firstPlacePct?: string;
  secondPlacePct?: string;
  thirdPlacePct?: string;
  minExperienceLevel?: string;
  submissionFormats?: string[];
  bountyInstructions?: string;
  bountyEndTime?: string;
  bountyType?: string;
  submissionDeadline?: string;
  judgingCriteria?: string[];
  prizes?: Array<{
    place: number;
    amount: number;
    description?: string;
  }>;
  submissionCount?: number;
  currentAttempts?: Array<{
    name: string;
    avatar: string;
    score?: number;
    status: string;
    submittedAt: string;
  }>;

  // Auction-specific fields
  auctionStartTime?: string;
  auctionEndTime?: string;
  auctionCloseTime?: string;
  minimumBid?: string;
  bidIncrement?: string;
  auctionDuration?: string;
  startingBid?: string;
  revisionCost?: string;
  prepaidRevisions?: string;
  projectDeadline?: string;
  bidAmount?: string;
  proposalText?: string;
  currentBids?: Array<{
    bidderName: string;
    avatar: string;
    bidAmount: number;
    proposalText: string;
    submittedAt: string;
    rating: number;
    completedProjects: number;
  }>;

  // Contract-specific fields
  contractStartTime?: string;
  contractEndTime?: string;
  contractType?: string;
  milestones?: Array<{
    title: string;
    amount: number;
    description: string;
    dueDate?: string;
  }>;
  paymentTerms?: string;

  // Challenge-specific fields
  challengeStartTime?: string;
  challengeEndTime?: string;
  challengeCloseTime?: string;
  challengeType?: string;
  difficulty?: string;
  developerScore?: number;
  participantLimit?: number;
  currentParticipants?: number;
  challengeRules?: string[];
  leaderboard?: Array<{
    rank: number;
    name: string;
    score?: number;
    completionTime?: string;
    avatar?: string;
    status?: 'Submitted' | 'Interested';
  }>;
  submissionFormat?: string;
  testCases?: string[];
  submissionGuidelines?: string;

  // File handling for job previews
  projectFilesPreview?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
    permissions?: {
      visibility: string;
      downloadable: boolean;
      viewable: boolean;
    };
  }>;
  
  imageFilesPreview?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
    preview: string;
  }>;

  // Additional fields that might be used
  hoveredJobPostType?: string;
  projectEndTime?: string;

  // New standardized Step 5 fields
  StartTime?: string;
  auctionEndDate?: string;
  Deadline?: string;
  ExpiryTime?: string;
  Amount?: string;
  StartDate?: string;
  applicationsOpenDate?: string;
  applicationsOpenTime?: string;
  applicationsCloseDate?: string;
  applicationsCloseTime?: string;
}

interface JobPostingFormProps {
  closeForm: () => void;
  currentUser?: any;
  draftId?: string; // Added draftId prop
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ closeForm, currentUser, draftId }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Get current date in YYYY-MM-DD format for default bountyStartDate
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  // Load draft or staged job data if draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;
      
      setLoading(true);
      try {
        // First try to load from draftedJobs collection
        let draftRef = doc(firestore, 'draftedJobs', draftId);
        let draftDoc = await getDoc(draftRef);
        let collectionName = 'draftedJobs';
        
        // If not found in draftedJobs, try staged_jobs collection
        if (!draftDoc.exists()) {
          draftRef = doc(firestore, 'staged_jobs', draftId);
          draftDoc = await getDoc(draftRef);
          collectionName = 'staged_jobs';
        }
        
        if (draftDoc.exists()) {
          const draftData = draftDoc.data();
          setFormData(prev => {
            // Extract metadata and convert back to file information
            const { projectFilesMetadata, imageFilesMetadata, projectFilesPreview, imageFilesPreview, ...restDraftData } = draftData;
            
            // Use projectFilesPreview if available, otherwise fall back to metadata
            const restoredProjectFiles = projectFilesPreview?.map((preview: any) => {
              if (preview.name?.startsWith('github:')) {
                // For GitHub URLs, create a pseudo-file object
                return {
                  name: preview.name,
                  type: 'github-url',
                  size: 0,
                  isGithubUrl: true,
                  url: preview.url
                };
              } else {
                // For regular files, create a placeholder object with the URL
                return {
                  name: preview.name,
                  type: preview.type,
                  size: preview.size,
                  isPlaceholder: true,
                  url: preview.url
                };
              }
            }) || projectFilesMetadata?.map((metadata: any) => {
              if (metadata.isGithubUrl) {
                // For GitHub URLs, create a pseudo-file object
                return {
                  name: metadata.name,
                  type: 'github-url',
                  size: 0,
                  isGithubUrl: true
                };
              } else {
                // For regular files, create a placeholder object
                return {
                  name: metadata.name,
                  type: metadata.type,
                  size: metadata.size,
                  isPlaceholder: true // Mark as placeholder since we can't restore the actual File
                };
              }
            }) || [];
            
            const restoredImageFiles = imageFilesPreview?.map((preview: any) => ({
              file: {
                name: preview.name,
                type: preview.type,
                size: preview.size,
                isPlaceholder: true,
                url: preview.url
              },
              preview: preview.preview || preview.url || ''
            })) || imageFilesMetadata?.map((metadata: any) => ({
              file: {
                name: metadata.name,
                type: metadata.type,
                size: metadata.size,
                isPlaceholder: true
              },
              preview: metadata.preview || ''
            })) || [];
            
            // Parse auction start time if it's an ISO string
            let parsedAuctionStartTime = restDraftData.auctionStartTime;
            let parsedStartTime = restDraftData.StartTime;
            
            if (restDraftData.auctionStartTime && restDraftData.auctionStartTime.includes('T')) {
              const date = new Date(restDraftData.auctionStartTime);
              if (!isNaN(date.getTime())) {
                parsedAuctionStartTime = date.toISOString().split('T')[0];
                parsedStartTime = date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                });
              }
            }
            
            // Parse auction end time if it's an ISO string
            let parsedAuctionEndTime = restDraftData.auctionEndTime;
            let parsedAuctionEndDate = restDraftData.auctionEndDate;
            
            if (restDraftData.auctionEndTime && restDraftData.auctionEndTime.includes('T')) {
              const date = new Date(restDraftData.auctionEndTime);
              if (!isNaN(date.getTime())) {
                parsedAuctionEndDate = date.toISOString().split('T')[0];
                parsedAuctionEndTime = date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                });
              }
            }
            
            // Parse project deadline if it's an ISO string
            let parsedDeadline = restDraftData.Deadline;
            let parsedExpiryTime = restDraftData.ExpiryTime;
            
            if (restDraftData.projectDeadline && restDraftData.projectDeadline.includes('T')) {
              const date = new Date(restDraftData.projectDeadline);
              if (!isNaN(date.getTime())) {
                parsedDeadline = date.toISOString().split('T')[0];
                parsedExpiryTime = date.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                });
              }
            }
            
            const newFormData = {
              ...prev,
              ...restDraftData,
              auctionStartTime: parsedAuctionStartTime,
              StartTime: parsedStartTime,
              auctionEndDate: parsedAuctionEndDate,
              auctionEndTime: parsedAuctionEndTime,
              Deadline: parsedDeadline,
              ExpiryTime: parsedExpiryTime,
              projectFiles: restoredProjectFiles,
              imageFiles: restoredImageFiles,
              projectFilesPreview: projectFilesPreview || [],
              imageFilesPreview: imageFilesPreview || [],
              id: draftId, // Set the draft ID
              // Always set remote to true for new jobs
              remote: true,
            };
            console.log(`FormData after loading ${collectionName === 'staged_jobs' ? 'staged job' : 'draft'}:`, newFormData);
            console.log('🔍 Restored projectFiles with URLs:', restoredProjectFiles);
            console.log('🔍 Restored projectFilesPreview with permissions:', projectFilesPreview);
            console.log('🔍 Remote field after loading draft:', newFormData.remote);
            
            // Debug individual file permissions
            if (projectFilesPreview && projectFilesPreview.length > 0) {
              projectFilesPreview.forEach((preview: any, index: number) => {
                console.log(`🔍 File ${index} permissions:`, {
                  name: preview.name,
                  permissions: preview.permissions
                });
              });
            }
            return newFormData;
          });
        } else {
          console.error('Job not found in either collection:', draftId);
          alert('Job not found. Please try again.');
          handleCloseForm();
        }
      } catch (error) {
        console.error('Error loading job:', error);
        alert('Error loading job. Please try again.');
        handleCloseForm();
      } finally {
        setLoading(false);
      }
    };
    
    loadDraft();
  }, [draftId]); // Removed closeForm from dependencies since it's now stable
  
  // Single formData state declaration with comprehensive initial state
  const [formData, setFormData] = useState<FormData>({
    // Basic project details (existing)
    projectTitle: '',
    companyName: '',
    projectOverview: '',
    projectType: '',
    tools: [],
    tags: [],
    selectedJobPostType: '',
    JobSubType: '',
    projectDescription: '',
    projectFiles: [],
    imageFiles: [],
    compensation: '',
    currentAttempts: [],
  
    // Core job fields
    id: '',
    createdAt: undefined,
    createdBy: currentUser?.uid || currentUser?.email || '',
    requirements: [],
    deliverables: [],
    skills: [],
    budget: undefined,
    location: '',
    remote: true,
    experienceLevel: '',
    applicationCount: 0,
    status: 'draft',
    category: '',
    eprojectlength: '',


    // Bounty-specific fields
    bountyAmount: '',
    currency: 'USD',
    bountyStartDate: getCurrentDate(), // Initialize with current date
    bountyStartTime: '09:00', // Default start time
    bountyExpiryTime: '17:00', // Default expiry time
    complexityLevel: '', // Default complexity level
    deadlineType: '',
    bountyDeadline: '',
    bountyDuration: '',
    completionCriteria: '',
    requiredDeliverables: [],
    evaluationMethod: '',
    reviewTimeline: '',
    allowMultipleWinners: false,
    firstPlacePct: '50',
    secondPlacePct: '30',
    thirdPlacePct: '20',
    minExperienceLevel: '',
    submissionFormats: [],
    bountyInstructions: '',
    bountyEndTime: '',
    bountyType: '',
    submissionDeadline: '',
    judgingCriteria: [],
    prizes: [],
    submissionCount: 0,

    // Auction-specific fields
    auctionStartTime: getCurrentDate(),
    auctionEndTime: '',
    auctionCloseTime: '',
    minimumBid: '',
    bidIncrement: '',
    auctionDuration: '',
    startingBid: '',
    revisionCost: '',
    prepaidRevisions: '',
    projectDeadline: '',
    bidAmount: '',
    proposalText: '',
    currentBids: [],

    // Contract-specific fields
    contractStartTime: '',
    contractEndTime: '',
    contractType: '',
    milestones: [],
    paymentTerms: '',

    // Challenge-specific fields
    challengeStartTime: '',
    challengeEndTime: '',
    challengeCloseTime: '',
    challengeType: '',
    difficulty: '',
    developerScore: 0,
    participantLimit: 0,
    currentParticipants: 0,
    challengeRules: [],
    leaderboard: [],
    submissionFormat: '',
    testCases: [],
    submissionGuidelines: '',

    // Additional fields
    hoveredJobPostType: '',
    projectEndTime: '',
    StartTime: getCurrentTime(),
    auctionEndDate: '',
    Deadline: '',
    ExpiryTime: '',
    Amount: '',
    StartDate: '',
    applicationsOpenDate: '',
    applicationsOpenTime: '',
    applicationsCloseDate: '',
    applicationsCloseTime: '',
  });

  // Debug initial formData
  console.log('🔍 Initial formData remote field:', formData.remote);

  // Track unsaved changes
  useEffect(() => {
    const checkForUnsavedChanges = () => {
      // Check if there are any meaningful changes
      const hasChanges = formData.projectTitle || 
                        formData.projectOverview || 
                        formData.projectDescription ||
                        formData.projectFiles.length > 0 ||
                        formData.imageFiles.length > 0 ||
                        formData.selectedJobPostType;
      
      setHasUnsavedChanges(!!hasChanges);
    };

    checkForUnsavedChanges();
  }, [formData]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation attempts
  const handleNavigationAttempt = useCallback((targetPath: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(targetPath);
      setShowUnsavedChangesModal(true);
    } else {
      navigate(targetPath);
    }
  }, [hasUnsavedChanges, navigate]);

  // Handle modal actions
  const handleSaveAndNavigate = async () => {
    try {
      await handleSaveDraft();
      setShowUnsavedChangesModal(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    }
  };

  const handleNavigateWithoutSaving = () => {
    setShowUnsavedChangesModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  // Override the closeForm prop to use our navigation handler
  const handleCloseForm = () => {
    handleNavigationAttempt('/PostJobs');
  };



  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Improved removeUndefined to handle arrays of objects
  const removeUndefined = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(removeUndefined);
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
          cleaned[key] = removeUndefined(obj[key]);
        }
      });
      return cleaned;
    }
    return obj;
  };

  // Validation functions for each step
  const validateStep1 = () => {
    const allFields = [
      { field: 'projectTitle', label: 'Job Title', required: true },
      { field: 'selectedJobPostType', label: 'Job Post Type', required: true },
      { field: 'projectType', label: 'Project Category', required: true },
      { field: 'projectOverview', label: 'Project Overview', required: true },
      { field: 'tags', label: 'Project Tags', required: true },
      { field: 'tools', label: 'Required Tools/Skills', required: true }
    ];

    const completed = allFields.filter(field => {
      const fieldValue = formData[field.field as keyof FormData];
      if (field.field === 'tags') {
        return Array.isArray(fieldValue) && fieldValue.length >= 5;
      }
      if (field.field === 'tools') {
        return Array.isArray(fieldValue) && fieldValue.length >= 3;
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.length > 0;
      }
      return !!fieldValue;
    });

    const errors = allFields.filter(field => {
      const fieldValue = formData[field.field as keyof FormData];
      if (field.field === 'tags') {
        return Array.isArray(fieldValue) && fieldValue.length <= 1;
      }
      if (field.field === 'tools') {
        return false;
      }
      const isEmpty = Array.isArray(fieldValue) ? fieldValue.length === 0 : !fieldValue;
      return field.required && isEmpty;
    });

    const warnings = allFields.filter(field => {
      const fieldValue = formData[field.field as keyof FormData];
      if (field.field === 'tags') {
        return Array.isArray(fieldValue) && fieldValue.length >= 2 && fieldValue.length <= 4;
      }
      if (field.field === 'tools') {
        return Array.isArray(fieldValue) && fieldValue.length <= 2;
      }
      return false;
    });

    return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
  };

  const validateStep3 = () => {
    // For file access step, just check if previous steps are valid
    const step1Valid = validateStep1().isValid;
    // Check if requirements step (step 2 in new order) is valid - this is just file upload, so always allow
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid };
  };

  const validateStep4 = () => {
    // Review step - check if first 3 steps are valid
    const step1Valid = validateStep1().isValid;
    const step3Valid = validateStep3().isValid;
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid && step3Valid };
  };

  const validateStep5 = () => {
    // Configuration step - check previous steps
    const step1Valid = validateStep1().isValid;
    const step3Valid = validateStep3().isValid;
    const step4Valid = validateStep4().isValid;
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid && step3Valid && step4Valid };
  };

  const validateStep6 = () => {
    // Compensation step - check all previous steps
    const step1Valid = validateStep1().isValid;
    const step3Valid = validateStep3().isValid;
    const step4Valid = validateStep4().isValid;
    const step5Valid = validateStep5().isValid; // Fixed: use step5 validation instead of step2
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid && step3Valid && step4Valid && step5Valid };
  };

  const validateStep7 = () => {
    // Confirmation step - check all previous steps
    const step1Valid = validateStep1().isValid;
    const step3Valid = validateStep3().isValid;
    const step4Valid = validateStep4().isValid;
    const step5Valid = validateStep5().isValid;
    const step6Valid = validateStep6().isValid;
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid && step3Valid && step4Valid && step5Valid && step6Valid };
  };

  const getStepValidation = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return validateStep1(); // Project Details
      case 2: return { allFields: [], completed: [], errors: [], warnings: [], isValid: true }; // Requirements - always allow (file upload)
      case 3: return validateStep3(); // File Access - check step 1
      case 4: return validateStep4(); // Review - check steps 1,3
      case 5: return validateStep5(); // Configuration - use step 2 validation directly
      case 6: return validateStep6(); // Compensation - check all previous
      case 7: return validateStep7(); // Confirmation - check all previous
      default: return { allFields: [], completed: [], errors: [], warnings: [], isValid: false };
    }
  };

  const handleNext = () => {
    if (currentStep === 6) {
      // From step 6, go to preview instead of step 7
      setShowPreview(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      errors: {},
      isSubmitting
    };

    switch (currentStep) {
      case 1:
        return <Stpone {...stepProps} />;
      case 2:
        // Now shows StepThree components (file upload/requirements)
        switch (formData.selectedJobPostType) {
          case 'Auction':
            return <AuctionStepThree {...stepProps} />;
          case 'Bounty':
            return <BountyStepThree {...stepProps} />;
          case 'Contract':
            return <ContractStepThree {...stepProps} />;
          case 'Challenge':
            return <ChallengeStepTwo {...stepProps} />;
          default:
            return <BountyStepThree {...stepProps} />;
        }
      case 3:
        // Now shows StepThree component (file permissions)
        return <Stpthree {...stepProps} setCurrentStep={setCurrentStep} />;
      case 4:
        // Unchanged - still StepFour
        return <Stpfour {...stepProps} />;
      case 5:
        // Now shows StepFive components (job configuration)
        switch (formData.selectedJobPostType) {
          case 'Auction':
            return <AuctionStpfive {...stepProps} />;
          case 'Bounty':
            return <BountyStpfive {...stepProps} />;
          case 'Contract':
            return <ContractStpfive {...stepProps} />;
          case 'Challenge':
            return <ChallengeStpfive {...stepProps} />;
          default:
            return <div className="text-white p-8">Please select a job type in Step 1</div>;
        }
      case 6:
        // Now shows StepSix component (compensation)
        return <Stpsix {...stepProps} />;
      case 7:
        // Shows StepSeven component (confirmation)
        return <Stpseven {...stepProps} onSubmit={handleSubmit} currentUser={currentUser} onBack={() => setCurrentStep(6)} />;
      default:
        return <div className="text-white p-8">Step not found</div>;
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleNavigateToStep7 = () => {
    setShowPreview(false);
    setCurrentStep(7);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare job data for staging
      const jobData = {
        // Basic project details
        projectTitle: formData.projectTitle,
        companyName: formData.companyName,
        projectOverview: formData.projectOverview,
        projectType: formData.projectType,
        tools: formData.tools,
        tags: formData.tags,
        selectedJobPostType: formData.selectedJobPostType,
        JobSubType: formData.JobSubType,
        projectDescription: formData.projectDescription,
        compensation: formData.compensation,
        estimatedProjectLength: formData.estimatedProjectLength,
        eprojectlength: formData.eprojectlength,

        // Core job fields
        requirements: formData.requirements,
        deliverables: formData.deliverables,
        skills: formData.skills,
        budget: formData.budget,
        location: formData.location,
        remote: formData.remote,
        experienceLevel: formData.experienceLevel,
        status: 'staged', // Mark as staged
        category: formData.category,

        // Bounty-specific fields
        bountyAmount: formData.bountyAmount,
        currency: formData.currency,
        bountyStartDate: formData.bountyStartDate,
        bountyStartTime: formData.bountyStartTime,
        bountyExpiryTime: formData.bountyExpiryTime,
        complexityLevel: formData.complexityLevel,
        deadlineType: formData.deadlineType,
        bountyDeadline: formData.bountyDeadline,
        bountyDuration: formData.bountyDuration,
        completionCriteria: formData.completionCriteria,
        requiredDeliverables: formData.requiredDeliverables,
        evaluationMethod: formData.evaluationMethod,
        reviewTimeline: formData.reviewTimeline,
        allowMultipleWinners: formData.allowMultipleWinners,
        firstPlacePct: formData.firstPlacePct,
        secondPlacePct: formData.secondPlacePct,
        thirdPlacePct: formData.thirdPlacePct,
        minExperienceLevel: formData.minExperienceLevel,
        submissionFormats: formData.submissionFormats,
        bountyInstructions: formData.bountyInstructions,
        bountyEndTime: formData.bountyEndTime,
        bountyType: formData.bountyType,
        submissionDeadline: formData.submissionDeadline,
        judgingCriteria: formData.judgingCriteria,
        prizes: formData.prizes,

        // Auction-specific fields
        auctionStartTime: formData.auctionStartTime,
        auctionEndTime: formData.auctionEndTime,
        auctionEndDate: formData.auctionEndDate,
        auctionCloseTime: formData.auctionCloseTime,
        minimumBid: formData.minimumBid,
        bidIncrement: formData.bidIncrement,
        auctionDuration: formData.auctionDuration,
        startingBid: formData.startingBid,
        revisionCost: formData.revisionCost,
        prepaidRevisions: formData.prepaidRevisions,
        projectDeadline: formData.projectDeadline,
        Deadline: formData.Deadline,
        ExpiryTime: formData.ExpiryTime,

        // Contract-specific fields
        contractStartTime: formData.contractStartTime,
        contractEndTime: formData.contractEndTime,
        contractType: formData.contractType,
        applicationsOpenTime: formData.applicationsOpenTime,
        applicationsCloseTime: formData.applicationsCloseTime,
        milestones: formData.milestones,
        paymentTerms: formData.paymentTerms,

        // Challenge-specific fields
        challengeStartTime: formData.challengeStartTime,
        challengeEndTime: formData.challengeEndTime,
        challengeCloseTime: formData.challengeCloseTime,
        challengeType: formData.challengeType,
        difficulty: formData.difficulty,
        developerScore: formData.developerScore,
        participantLimit: formData.participantLimit,
        challengeRules: formData.challengeRules,
        submissionFormat: formData.submissionFormat,
        testCases: formData.testCases,
        submissionGuidelines: formData.submissionGuidelines,

        // File handling
        projectFilesPreview: formData.projectFilesPreview,

        // Metadata with user ID
        createdBy: currentUser?.uid || currentUser?.email,
        userId: currentUser?.uid, // Add user ID for easy querying
        userEmail: currentUser?.email, // Add user email for reference
        updatedAt: serverTimestamp(),
        applicationCount: 0,
        submissionCount: 0,
        currentParticipants: 0,
        currentBids: [],
        currentAttempts: [],
        leaderboard: []
      };

      // Remove undefined values before saving
      const cleanedJobData = removeUndefined(jobData);

      let docRef;
      let isEditing = false;

      // Check if we're editing an existing job
      if (draftId) {
        // Try to find the job in staged_jobs collection first
        let jobRef = doc(firestore, 'staged_jobs', draftId);
        let jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          // Update existing staged job
          await updateDoc(jobRef, cleanedJobData);
          docRef = jobRef;
          isEditing = true;
          console.log('Updated existing staged job with ID:', draftId);
        } else {
          // Try draftedJobs collection
          jobRef = doc(firestore, 'draftedJobs', draftId);
          jobDoc = await getDoc(jobRef);
          
          if (jobDoc.exists()) {
            // Convert draft to staged job
            await updateDoc(jobRef, {
              ...cleanedJobData,
              status: 'staged'
            });
            docRef = jobRef;
            isEditing = true;
            console.log('Converted draft to staged job with ID:', draftId);
          } else {
            // Job not found, create new
            const stagedJobsRef = collection(firestore, 'staged_jobs');
            docRef = await addDoc(stagedJobsRef, cleanedJobData);
            console.log('Created new staged job with ID:', docRef.id);
          }
        }
      } else {
        // Create new staged job
        const stagedJobsRef = collection(firestore, 'staged_jobs');
        docRef = await addDoc(stagedJobsRef, cleanedJobData);
        console.log('Created new staged job with ID:', docRef.id);
      }

      // Update the job with its own ID if it's a new job
      if (!isEditing) {
        await updateDoc(docRef, {
          jobId: docRef.id
        });
      }

      // Add job ID to user's profile (only for new jobs)
      if (currentUser?.uid && !isEditing) {
        try {
          const userRef = doc(firestore, 'users', currentUser.uid);
          await setDoc(
            userRef,
            {
              postedJobs: arrayUnion({
                jobId: docRef.id,
                jobTitle: formData.projectTitle,
                jobType: formData.selectedJobPostType,
                status: 'staged'
              }),
              lastJobPosted: serverTimestamp()
            },
            { merge: true }
          );
        } catch (userUpdateError) {
          console.warn('Could not update user profile:', userUpdateError);
          alert('Could not update your profile with the new job. Please check your account settings.');
        }
      }

      console.log('Job staged successfully with ID:', docRef.id);
      
      // Trigger manual activation for auctions that should start immediately
      if (formData.selectedJobPostType === 'Auction') {
        try {
          const response = await fetch('https://us-central1-your-project-id.cloudfunctions.net/manualActivateStagedJobs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            console.log('Manual activation triggered successfully');
          } else {
            console.warn('Manual activation failed, but job was staged successfully');
          }
        } catch (error) {
          console.warn('Could not trigger manual activation:', error);
        }
      }
      
      // Show success message
      const message = isEditing ? 'Job has been updated successfully!' : 'Job has been staged successfully! Job ID: ' + docRef.id;
      alert(message);
      
      // Close the form or redirect
      handleCloseForm();
      
    } catch (error) {
      console.error('Error staging job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error staging job: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackFromPreview = () => {
    setShowPreview(false);
  };

  const handleEditStep = (stepNumber: number) => {
    setShowPreview(false);
    setCurrentStep(stepNumber);
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    if (!currentUser?.uid) {
      console.error('No user UID found:', currentUser);
      alert('No user found. Please log in again.');
      return;
    }
    
    console.log('Saving draft for user:', currentUser.uid);
    console.log('Current form data:', formData);
    
    try {
      // Create a copy of formData without File objects (which can't be serialized)
      const { projectFiles, imageFiles, ...serializableFormData } = formData;
      
      // Upload files to Firebase Storage and get URLs
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storage = getStorage();
      
      // Upload project files to Firebase Storage
      const projectFilesPreview = [];
      if (projectFiles && projectFiles.length > 0) {
        for (let i = 0; i < projectFiles.length; i++) {
          const file = projectFiles[i];
          
          // Check if we have existing permissions for this file
          const existingPreview = formData.projectFilesPreview || [];
          const existingPermission = existingPreview.find(preview => 
            preview.name === file.name && preview.type === file.type
          );
          
          if (file instanceof File) {
            // Upload actual file to Firebase Storage
            const fileRef = ref(storage, `draft-files/${currentUser.uid}/${draftId || 'new'}/${Date.now()}-${i}-${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Use existing permissions if available, otherwise default to public
            const permissions = existingPermission?.permissions || {
              visibility: 'public',
              downloadable: true,
              viewable: true
            };
            
            console.log(`🔍 Saving file ${file.name} with permissions:`, permissions);
            
            projectFilesPreview.push({
              name: file.name,
              type: file.type,
              size: formatFileSize(file.size),
              url: downloadURL,
              permissions: permissions
            });
          } else if ('isGithubUrl' in file && file.isGithubUrl) {
            // Handle GitHub URLs (no upload needed)
            // Use existing permissions if available, otherwise default to public
            const permissions = existingPermission?.permissions || {
              visibility: 'public',
              downloadable: false,
              viewable: true
            };
            
            projectFilesPreview.push({
              name: file.name,
              type: 'github-url',
              size: '0 B',
              url: file.name.replace('github:', ''),
              permissions: permissions
            });
          } else if ('isPlaceholder' in file && (file as any).isPlaceholder) {
            // Handle placeholder files (from loaded drafts)
            // Use existing permissions if available, otherwise default to public
            const permissions = existingPermission?.permissions || {
              visibility: 'public',
              downloadable: false,
              viewable: false
            };
            
            console.log(`🔍 Saving placeholder file ${(file as any).name} with permissions:`, permissions);
            
            projectFilesPreview.push({
              name: (file as any).name,
              type: (file as any).type,
              size: formatFileSize((file as any).size),
              url: '#', // No URL for placeholders
              permissions: permissions
            });
          }
        }
      }
      
      // Upload image files to Firebase Storage
      const imageFilesPreview = [];
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i];
          
          if (imageFile.file instanceof File) {
            // Upload actual image to Firebase Storage
            const imageRef = ref(storage, `draft-images/${currentUser.uid}/${draftId || 'new'}/${Date.now()}-${i}-${imageFile.file.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile.file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            imageFilesPreview.push({
              name: imageFile.file.name,
              type: imageFile.file.type,
              size: formatFileSize(imageFile.file.size),
              url: downloadURL,
              preview: imageFile.preview
            });
          } else if ('isPlaceholder' in imageFile.file && (imageFile.file as any).isPlaceholder) {
            // Handle placeholder images (from loaded drafts)
            imageFilesPreview.push({
              name: (imageFile.file as any).name,
              type: (imageFile.file as any).type,
              size: formatFileSize((imageFile.file as any).size),
              url: imageFile.preview || '#',
              preview: imageFile.preview
            });
          }
        }
      }
      
      // Convert File objects to metadata for storage (for backward compatibility)
      const fileMetadata = projectFiles?.map((file, index) => ({
        index,
        name: file?.name || `File ${index + 1}`,
        type: file?.type || 'unknown',
        size: file?.size || 0,
        isFile: file instanceof File,
        isGithubUrl: 'isGithubUrl' in file ? file.isGithubUrl : false,
        isPlaceholder: 'isPlaceholder' in file ? file.isPlaceholder : false
      })) || [];
      
      const imageMetadata = imageFiles?.map((imageFile, index) => ({
        index,
        name: imageFile?.file?.name || `Image ${index + 1}`,
        type: imageFile?.file?.type || 'unknown',
        size: imageFile?.file?.size || 0,
        isFile: imageFile?.file instanceof File,
        isPlaceholder: 'isPlaceholder' in (imageFile?.file || {}) ? (imageFile?.file as any).isPlaceholder : false,
        preview: imageFile?.preview || ''
      })) || [];
      
      const draftData = removeUndefined({
        ...serializableFormData,
        projectFilesMetadata: fileMetadata,
        imageFilesMetadata: imageMetadata,
        projectFilesPreview: projectFilesPreview,
        imageFilesPreview: imageFilesPreview,
        status: 'draft',
        jobTitle: formData.projectTitle,
        jobType: formData.selectedJobPostType,
        savedAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        userId: currentUser.uid,
        userEmail: currentUser.email,
      });
      
      console.log('Draft data to save:', draftData);
      
      if (draftId) {
        // Determine which collection to update based on the original job status
        const collectionName = formData.status === 'staged' ? 'staged_jobs' : 'draftedJobs';
        const jobRef = doc(firestore, collectionName, draftId);
        await updateDoc(jobRef, draftData);
        console.log(`${formData.status === 'staged' ? 'Staged job' : 'Draft'} updated successfully with ID:`, draftId);
      } else {
        // Create new draft
        const draftedJobsRef = collection(firestore, 'draftedJobs');
        const docRef = await addDoc(draftedJobsRef, draftData);
        console.log('Draft saved successfully with ID:', docRef.id);
        console.log('Document reference:', docRef);
        console.log('Document path:', docRef.path);
      }
      
      alert('Draft saved!');
    } catch (error: unknown) {
      console.error('Error saving draft:', error);
      if (error instanceof Error) {
        alert('Failed to save draft: ' + error.message);
      } else {
        alert('Failed to save draft: ' + String(error));
      }
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to generate a filled job for a given type
  const generateFilledJob = (type: 'Bounty' | 'Auction' | 'Contract' | 'Challenge', idx: number) => {
    const now = new Date();
    const base = {
      ...formData,
      projectTitle: `${formData.projectTitle || 'Example'} ${type} Job #${idx + 1}`,
      selectedJobPostType: type,
      status: 'staged',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: '1tyyipm91FTUchRzkEMqsMg60Ok1',
      userId: '1tyyipm91FTUchRzkEMqsMg60Ok1',
      userEmail: '1tyyipm91FTUchRzkEMqsMg60Ok1',
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : ['example', type.toLowerCase()],
      tools: formData.tools && formData.tools.length > 0 ? formData.tools : [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Firebase' }],
      requirements: formData.requirements && formData.requirements.length > 0 ? formData.requirements : ['Requirement 1', 'Requirement 2'],
      deliverables: formData.deliverables && formData.deliverables.length > 0 ? formData.deliverables : ['Deliverable 1', 'Deliverable 2'],
      compensation: formData.compensation || '1000',
      projectOverview: formData.projectOverview || 'This is an example project overview.',
      projectType: formData.projectType || 'Web Development',
      projectDescription: formData.projectDescription || 'Example project description.',
      projectFilesPreview: formData.projectFilesPreview || [],
      eprojectlength: formData.eprojectlength || '2 weeks',
      estimatedProjectLength: formData.estimatedProjectLength || '2 weeks',
      // Add type-specific required fields
      ...(type === 'Bounty' && {
        bountyAmount: formData.bountyAmount || '500',
        bountyDeadline: formData.bountyDeadline || now.toISOString().split('T')[0],
        currency: formData.currency || 'USD',
        requiredDeliverables: formData.requiredDeliverables && formData.requiredDeliverables.length > 0 ? formData.requiredDeliverables : ['Code', 'Docs'],
      }),
      ...(type === 'Auction' && {
        startingBid: formData.startingBid || '100',
        auctionEndTime: formData.auctionEndTime || now.toISOString(),
        minimumBid: formData.minimumBid || '50',
        bidIncrement: formData.bidIncrement || '10',
      }),
      ...(type === 'Contract' && {
        budget: formData.budget || { min: 1000, max: 2000, currency: 'USD' },
        contractEndTime: formData.contractEndTime || now.toISOString(),
        milestones: formData.milestones && formData.milestones.length > 0 ? formData.milestones : [{ title: 'Milestone 1', amount: 500, description: 'First milestone' }],
      }),
      ...(type === 'Challenge' && {
        prizes: formData.prizes && formData.prizes.length > 0 ? formData.prizes : [{ place: 1, amount: 300 }],
        challengeEndTime: formData.challengeEndTime || now.toISOString(),
        requiredDeliverables: formData.requiredDeliverables && formData.requiredDeliverables.length > 0 ? formData.requiredDeliverables : ['Submission'],
      })
    };
    // Remove undefineds
    return removeUndefined(base);
  };

  // Add example jobs handler
  const handleAddExampleJobs = async () => {
    setIsSubmitting(true);
    try {
      const types: ('Bounty' | 'Auction' | 'Contract' | 'Challenge')[] = ['Bounty', 'Auction', 'Contract', 'Challenge'];
      let allJobIds: string[] = [];
      for (const type of types) {
        for (let i = 0; i < 3; i++) {
          const jobData = generateFilledJob(type, i);
          const activeJobsRef = collection(firestore, 'activeJobs');
          const docRef = await addDoc(activeJobsRef, jobData);
          await updateDoc(docRef, { jobId: docRef.id });
          allJobIds.push(docRef.id);
          // Add to user profile
          if (true) { // always true, to ensure the block runs
            const userRef = doc(firestore, 'users', '1tyyipm91FTUchRzkEMqsMg60Ok1');
            await setDoc(
              userRef,
              {
                postedJobs: arrayUnion({
                  jobId: docRef.id,
                  jobTitle: jobData.projectTitle,
                  jobType: type,
                  status: 'staged'
                }),
                lastJobPosted: serverTimestamp()
              },
              { merge: true }
            );
          }
        }
      }
      alert('Added 3 jobs of each type! Job IDs: ' + allJobIds.join(', '));
    } catch (err) {
      console.error('Error adding example jobs:', err);
      alert('Error adding example jobs: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };


  const steps = [
    { number: 1, title: 'Project Details' },
    { number: 2, title: 'Requirements' }, // Was step 3
    { number: 3, title: 'File Access' }, // Was step 6
    { number: 4, title: 'Review' }, // Unchanged
    { number: 5, title: 'Configuration' }, // Was step 2
    { number: 6, title: 'Compensation' }, // Was step 5
    { number: 7, title: 'Confirmation' } // New step 7
  ];

  // Show preview section if enabled
  if (showPreview) {
    return (
      <JobPreview 
        formData={formData}
        onBack={handleBackFromPreview}
        onSubmit={handleNavigateToStep7}
        isSubmitting={isSubmitting}
        onEditStep={handleEditStep}
      />
    );
  }

  // Show loading state when loading draft data
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-4">Loading draft...</div>
          <div className="text-gray-400">Please wait while we load your draft data.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-posting-form-container" style={{ position: 'relative' }}>

      {currentStep === 7 ? (
        // Full screen step 7 without navigation
        <div className="min-h-screen bg-black text-white">
          {renderCurrentStep()}
        </div>
      ) : (
        // Regular form layout for other steps
        <div className="min-h-screen bg-black text-white flex scale-90 origin-top-left" style={{ width: '111.11%', height: '111.11%' }}>
          {/* Left Margin */}
          <div className="w-64 bg-black"></div>

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-[rgba(0, 0, 0, 0.05)] border-b border-white/10">
              <div className="p-6">
                <div className="mb-4">
                  <button 
                    onClick={handleCloseForm}
                    className="text-white/70 hover:text-white transition-colors text-sm flex items-center mt-10 gap-2"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                    <span>Back to dashboard</span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold text-white">Job Posting Form</h1>
                  
                  {/* Save Draft Button */}
                  {currentStep !== 7 && !showPreview && (
                    <button
                      onClick={handleSaveDraft}
                      className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
                    >
                      Save Draft
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex pb-24">
              <div className="flex-1 flex">
                {/* Left Side - Information Panel */}
                <div className="w-1/2 p-8 ">
                  <div className="max-w-lg">
                    <div className="mb-6">
                      <span className="text-white/60 text-sm">{currentStep}/7</span>
                      <span className="text-white/60 text-sm ml-4">Job post</span>
                    </div>
                  
                  {currentStep === 1 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Tell us about your project
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Start by giving your job a clear title, selecting the type of work, and describing what you need done. This helps the right talent find your project.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">What we need to know</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• A clear, descriptive job title</li>
                            <li>• The type of work (Bounty, Challenge, Auction, or Contract)</li>
                            <li>• Project category and required skills</li>
                            <li>• Detailed overview of your requirements</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {formData.selectedJobPostType === 'Bounty' ? 'Define bounty requirements' : 'Define project requirements'}
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        {formData.selectedJobPostType === 'Bounty' 
                          ? 'Set up the detailed requirements, evaluation criteria, and submission guidelines for your bounty.'
                          : 'Provide detailed project requirements, upload necessary files, and specify what developers need to know.'
                        }
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Required information</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Detailed project description</li>
                            <li>• Technical specifications</li>
                            <li>• Reference files and resources</li>
                            <li>• Clear deliverable expectations</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Configure file access
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Control who can access your project files. You can make files public for everyone or restrict them to only participants who have applied to your project.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Access options</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Public files are visible to everyone</li>
                            <li>• Private files require project participation</li>
                            <li>• Easily toggle access per file</li>
                            <li>• Open bounties/challenges are always public</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Review your {formData.selectedJobPostType?.toLowerCase()}
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Take a moment to review all the details before continuing. Make sure everything looks good and accurately represents your project.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Double-check these items</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Job title and description</li>
                            <li>• Required skills and tools</li>
                            <li>• Project files and access settings</li>
                            <li>• Requirements and deliverables</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 5 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Configure your {formData.selectedJobPostType?.toLowerCase()}
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Set up the specific details for your {formData.selectedJobPostType?.toLowerCase()} including budget, timeline, and any special requirements.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Configuration details</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Set your budget or compensation</li>
                            <li>• Define project timeline</li>
                            <li>• Add any specific requirements</li>
                            <li>• Configure project complexity</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 6 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Set up compensation
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Configure how and when participants will be paid. Choose between payment upon completion or milestone-based payments for better project management.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Payment options</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Payment upon completion (all job types)</li>
                            <li>• Milestone payments (Contracts & Auctions only)</li>
                            <li>• Custom percentage breakdowns</li>
                            <li>• Flexible milestone scheduling</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 7 && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">
                        Confirm and publish
                      </h2>
                      
                      <p className="text-white/70 text-sm leading-relaxed mb-8">
                        Review all the details of your {formData.selectedJobPostType?.toLowerCase()} one final time before publishing. Make sure everything is correct and ready to go live.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-2">Final checklist</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• All required fields are completed</li>
                            <li>• Compensation and timeline are set</li>
                            <li>• File access permissions are configured</li>
                            <li>• Job details are accurate and complete</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side - Form Content */}
              <div className="w-1/2 p-8">
                <div className="max-w-2xl">
                  {renderCurrentStep()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Margin */}
        <div className="w-64 bg-black"></div>
      </div>
      )}

      {/* Bottom Navigation - Fixed to Window - Only show for steps 1-6 */}
      {currentStep !== 7 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
          {/* Progress Line */}
          <div className="w-full h-1 bg-gray-600">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
          
          <div className="p-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
              {currentStep > 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              ) : (
                <span></span>
              )}

              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  disabled={!getStepValidation(currentStep).isValid}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors flex items-center space-x-2 ${
                    getStepValidation(currentStep).isValid
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Next: {steps[currentStep] ? steps[currentStep].title : 'Continue'}</span>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              ) : currentStep === 6 ? (
                <button
                  onClick={handleNext}
                  disabled={!getStepValidation(currentStep).isValid}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
                    getStepValidation(currentStep).isValid
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Preview Job
                </button>
              ) : (
                <button
                  onClick={handlePreview}
                  disabled={!getStepValidation(currentStep).isValid}
                  className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
                    getStepValidation(currentStep).isValid
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Preview Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedChangesModal && (
        <Modal
          headerTitle=""
          showHeader={false}
          barrierDismissable={true}
          onClose={handleCancelNavigation}
          body={
            <div className="relative px-4 py-4">
              <button
                onClick={handleCancelNavigation}
                className="absolute -top-2 right-2 text-white/60 hover:text-white transition-colors p-2"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
              <div className="flex items-center space-x-4 pr-8">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon 
                      icon={faExclamationTriangle} 
                      className="text-yellow-400 text-lg" 
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Unsaved Changes
                  </h3>
                  <p className="text-white/60 text-sm">
                    Save your work as a draft before leaving?
                  </p>
                </div>
              </div>
            </div>
          }
          showFooter={true}
          showFooterBorder={false}
          showFooterPadding={false}
          showBodyPadding={false}
          footer={
            <div className="flex justify-between px-4 pb-4 pt-2">
              <button
                onClick={handleNavigateWithoutSaving}
                className="px-6 py-2 text-red-400 hover:text-red-300 transition-colors text-sm whitespace-nowrap"
              >
                Leave without saving
              </button>
              <button
                onClick={handleSaveAndNavigate}
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Save Draft
              </button>
            </div>
          }
        />
      )}
    </div>
  );
};

export default JobPostingForm;
