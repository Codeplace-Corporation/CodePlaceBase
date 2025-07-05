import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCheck, faExclamationTriangle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

// Import your step components
import StepOne from './JobPostingFormSteps/StepOne';
import AuctionStepTwo from './JobPostingFormSteps/JobSpecificStepTwo/AuctionStepTwo';
import BountyStepTwo from './JobPostingFormSteps/JobSpecificStepTwo/BountyStepTwo';
import ContractStepTwo from './JobPostingFormSteps/JobSpecificStepTwo/ContractStepTwo';
import ChallengeStepTwo from './JobPostingFormSteps/JobSpecificStepTwo/ChallengeStepTwo';
import BountyStepThree from './JobPostingFormSteps/JobSpecifcStepThree/BountyStepThree';
import AuctionStepThree from './JobPostingFormSteps/JobSpecifcStepThree/AuctionStepThree';
import ContractStepThree from './JobPostingFormSteps/JobSpecifcStepThree/ContractStepThree';
import ChallengeStepThree from './JobPostingFormSteps/JobSpecifcStepThree/ChallengeStepThree';
import StepFour from './JobPostingFormSteps/StepFour';
import StepFive from './JobPostingFormSteps/StepFive';
import StepSix from './JobPostingFormSteps/StepSix';
import JobPreview from './JobPreview';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

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
  projectFiles: File[];
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
  applicationsOpenTime?: string;
  applicationsCloseTime?: string;
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

  // Additional fields that might be used
  hoveredJobPostType?: string;
  projectEndTime?: string;
}

interface JobPostingFormProps {
  closeForm: () => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ closeForm }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Get current date in YYYY-MM-DD format for default bountyStartDate
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
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
  
    // Core job fields
    id: '',
    createdAt: undefined,
    createdBy: '',
    requirements: [],
    deliverables: [],
    skills: [],
    budget: undefined,
    location: '',
    remote: false,
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
    currentAttempts: [],

    // Auction-specific fields
    auctionStartTime: '',
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
    applicationsOpenTime: '',
    applicationsCloseTime: '',
    milestones: [],
    paymentTerms: '',

    // Challenge-specific fields
    challengeStartTime: '',
    challengeEndTime: '',
    challengeCloseTime: '',
    challengeType: '',
    difficulty: '',
    developerScore: undefined,
    participantLimit: undefined,
    currentParticipants: 0,
    challengeRules: [],
    leaderboard: [],
    submissionFormat: '',
    testCases: [],
    submissionGuidelines: '',

    // File handling
    projectFilesPreview: [],

    // Additional fields
    hoveredJobPostType: '',
    projectEndTime: '',
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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

  const validateStep2 = () => {
    if (formData.selectedJobPostType === 'Bounty') {
      const allFields = [
        { field: 'bountyAmount', label: 'Bounty Compensation', required: true },
        { field: 'bountyDeadline', label: 'Bounty Expiry Date', required: true },
        { field: 'eprojectlength', label: 'Estimated Project Length', required: true },
        { field: 'complexityLevel', label: 'Project Complexity', required: false }
      ];

      const completed = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !!fieldValue;
      });

      const errors = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return field.required && !fieldValue;
      });

      const warnings = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !field.required && !fieldValue;
      });

      return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
    } else if (formData.selectedJobPostType === 'Auction') {
      const allFields = [
        { field: 'startingBid', label: 'Starting Bid', required: true },
        { field: 'bidIncrement', label: 'Minimum Bid Increment', required: false },
        { field: 'auctionCloseTime', label: 'Auction Close Date', required: true },
        { field: 'projectDeadline', label: 'Project Deadline', required: true },
        { field: 'eprojectlength', label: 'Estimated Project Length', required: true },
        { field: 'complexityLevel', label: 'Project Complexity', required: false }
      ];

      const completed = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !!fieldValue;
      });

      const errors = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return field.required && !fieldValue;
      });

      const warnings = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !field.required && !fieldValue;
      });

      return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
    } else if (formData.selectedJobPostType === 'Contract') {
      const allFields = [
        { field: 'startingBid', label: 'Project Budget', required: true },
        { field: 'applicationsCloseTime', label: 'Applications Close Date', required: true },
        { field: 'projectDeadline', label: 'Project Deadline', required: true },
        { field: 'eprojectlength', label: 'Estimated Project Length', required: true },
        { field: 'complexityLevel', label: 'Project Complexity', required: false }
      ];

      const completed = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !!fieldValue;
      });

      const errors = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return field.required && !fieldValue;
      });

      const warnings = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !field.required && !fieldValue;
      });

      return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
    } else if (formData.selectedJobPostType === 'Challenge') {
      const allFields = [
        { field: 'bountyAmount', label: 'Challenge Prize', required: true },
        { field: 'bountyDeadline', label: 'Challenge End Date', required: true },
        { field: 'eprojectlength', label: 'Estimated Project Length', required: true },
        { field: 'complexityLevel', label: 'Project Complexity', required: false }
      ];

      const completed = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !!fieldValue;
      });

      const errors = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return field.required && !fieldValue;
      });

      const warnings = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !field.required && !fieldValue;
      });

      return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
    } else {
      // Default validation for other job types
      const allFields = [
        { field: 'compensation', label: 'Compensation', required: true },
        { field: 'eprojectlength', label: 'Project Length', required: true }
      ];

      const completed = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !!fieldValue;
      });

      const errors = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return field.required && !fieldValue;
      });

      const warnings = allFields.filter(field => {
        const fieldValue = formData[field.field as keyof FormData];
        return !field.required && !fieldValue;
      });

      return { allFields, completed, errors, warnings, isValid: errors.length === 0 };
    }
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
    const step5Valid = validateStep2().isValid; // Step 5 uses step 2 validation (configuration)
    return { allFields: [], completed: [], errors: [], warnings: [], isValid: step1Valid && step3Valid && step4Valid && step5Valid };
  };

  const getStepValidation = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return validateStep1(); // Project Details
      case 2: return { allFields: [], completed: [], errors: [], warnings: [], isValid: true }; // Requirements - always allow (file upload)
      case 3: return validateStep3(); // File Access - check step 1
      case 4: return validateStep4(); // Review - check steps 1,3
      case 5: return validateStep2(); // Configuration - use step 2 validation directly
      case 6: return validateStep6(); // Compensation - check all previous
      default: return { allFields: [], completed: [], errors: [], warnings: [], isValid: false };
    }
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
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
        return <StepOne {...stepProps} />;
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
            return <ChallengeStepThree {...stepProps} />;
          default:
            return <BountyStepThree {...stepProps} />;
        }
      case 3:
        // Now shows StepSix component (file permissions)
        return <StepSix {...stepProps} setCurrentStep={setCurrentStep} />;
      case 4:
        // Unchanged - still StepFour
        return <StepFour {...stepProps} />;
      case 5:
        // Now shows StepTwo components (job configuration)
        switch (formData.selectedJobPostType) {
          case 'Auction':
            return <AuctionStepTwo {...stepProps} />;
          case 'Bounty':
            return <BountyStepTwo {...stepProps} />;
          case 'Contract':
            return <ContractStepTwo {...stepProps} />;
          case 'Challenge':
            return <ChallengeStepTwo {...stepProps} />;
          default:
            return <div className="text-white p-8">Please select a job type in Step 1</div>;
        }
      case 6:
        // Now shows StepFive component (compensation)
        return <StepFive {...stepProps} />;
      default:
        return <div className="text-white p-8">Step not found</div>;
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Add your submission logic here
      console.log('Submit job', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle success
    } catch (error) {
      console.error('Error submitting job:', error);
      // Handle error
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

  const steps = [
    { number: 1, title: 'Project Details' },
    { number: 2, title: 'Requirements' }, // Was step 3
    { number: 3, title: 'File Access' }, // Was step 6
    { number: 4, title: 'Review' }, // Unchanged
    { number: 5, title: 'Configuration' }, // Was step 2
    { number: 6, title: 'Compensation' } // Was step 5
  ];

  // Show preview section if enabled
  if (showPreview) {
    return (
      <JobPreview 
        formData={formData}
        onBack={handleBackFromPreview}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onEditStep={handleEditStep}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white flex scale-90 origin-top-left" style={{ width: '111.11%', height: '111.11%' }}>
        {/* Left Margin */}
        <div className="w-64 bg-black"></div>

        {/* Main Content Container */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-[rgba(0, 0, 0, 0.05)] border-b border-white/10">
            <div className="p-6">
              <div className="mb-4">
                <button className="text-white/70 hover:text-white transition-colors text-sm flex items-center mt-10 gap-2">
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                  <span>Back to dashboard</span>
                </button>
              </div>
              <h1 className="text-3xl font-bold text-white">Job Posting Form</h1>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex pb-24">
            <div className="flex-1 flex">
              {/* Left Side - Information Panel */}
              <div className="w-1/2 p-8 ">
                <div className="max-w-lg">
                  <div className="mb-6">
                    <span className="text-white/60 text-sm">{currentStep}/6</span>
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

      {/* Bottom Navigation - Fixed to Window */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
        {/* Progress Line */}
        <div className="w-full h-1 bg-gray-600">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
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
    </>
  );
};

export default JobPostingForm;