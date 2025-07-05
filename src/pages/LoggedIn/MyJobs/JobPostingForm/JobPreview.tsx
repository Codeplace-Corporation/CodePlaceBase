import React, { useEffect } from 'react';
import { FormData } from './JobPostingForm';
import ContractJobDetails from '../../../../DataManegment/JobPreview/components/ContractJobDetails';
import BountyJobDetails from '../../../../DataManegment/JobPreview/components/BountyJobDetails';
import AuctionJobDetails from '../../../../DataManegment/JobPreview/components/AuctionJobDetails';
import ChallengeJobDetails from '../../../../DataManegment/JobPreview/components/ChallengeJobDetails';
interface JobPreviewProps {
  formData: FormData;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onEditStep: (stepNumber: number) => void;
}

const JobPreview: React.FC<JobPreviewProps> = ({ 
  formData, 
  onBack, 
  onSubmit, 
  isSubmitting,
  onEditStep 
}) => {
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs created for file previews
      formData.projectFiles?.forEach(file => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [formData.projectFiles]);
  // Convert FormData to the JobData format expected by the JobDetails components
  const convertToJobData = (formData: FormData) => {
    // Convert File objects to the format expected by JobDetails components
    const convertedProjectFiles = formData.projectFiles?.map(file => ({
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: URL.createObjectURL(file), // Create temporary URL for preview
      permissions: {
        visibility: 'public',
        downloadable: true,
        viewable: true
      }
    })) || [];

    // Convert image files to the expected format
    const convertedImageFiles = formData.imageFiles?.map(imageFile => ({
      name: imageFile.file.name,
      type: imageFile.file.type,
      size: `${(imageFile.file.size / 1024).toFixed(1)} KB`,
      url: imageFile.preview, // Use the existing preview URL
      permissions: {
        visibility: 'public',
        downloadable: true,
        viewable: true
      }
    })) || [];

    return {
      id: formData.id || 'preview',
      projectTitle: formData.projectTitle,
      projectType: formData.projectType,
      tools: formData.tools,
      tags: formData.tags,
      selectedJobPostType: formData.selectedJobPostType,
      compensation: formData.compensation,
      estimatedProjectLength: formData.JobSubType,
      projectDescription: formData.projectDescription,
      projectOverview: formData.projectOverview,
      auctionCloseTime: formData.auctionCloseTime,
      bountyEndTime: formData.bountyEndTime,
      applicationsCloseTime: formData.applicationsCloseTime,
      challengeCloseTime: formData.challengeCloseTime,
      createdAt: formData.createdAt,
      createdBy: formData.createdBy,
      requirements: formData.requirements,
      deliverables: formData.deliverables,
      skills: formData.skills,
      budget: formData.budget,
      location: formData.location,
      remote: formData.remote,
      experienceLevel: formData.experienceLevel,
      applicationCount: formData.applicationCount || 0,
      status: formData.status || 'draft',
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
      submissionDeadline: formData.submissionDeadline,
      judgingCriteria: formData.judgingCriteria,
      prizes: formData.prizes,
      submissionCount: formData.submissionCount || 0,
      currentAttempts: formData.currentAttempts || [],

      // Auction-specific fields
      auctionStartTime: formData.auctionStartTime,
      auctionEndTime: formData.auctionEndTime,
      minimumBid: formData.minimumBid,
      bidIncrement: formData.bidIncrement,
      auctionDuration: formData.auctionDuration,
      startingBid: formData.startingBid,
      revisionCost: formData.revisionCost,
      prepaidRevisions: formData.prepaidRevisions,
      projectDeadline: formData.projectDeadline,
      bidAmount: formData.bidAmount,
      proposalText: formData.proposalText,
      currentBids: formData.currentBids || [],

      // Contract-specific fields
      contractStartTime: formData.contractStartTime,
      contractEndTime: formData.contractEndTime,
      contractType: formData.contractType,
      applicationsOpenTime: formData.applicationsOpenTime,
      milestones: formData.milestones,
      paymentTerms: formData.paymentTerms,

      // Challenge-specific fields
      challengeStartTime: formData.challengeStartTime,
      challengeEndTime: formData.challengeEndTime,
      challengeType: formData.challengeType,
      difficulty: formData.difficulty,
      developerScore: formData.developerScore,
      participantLimit: formData.participantLimit,
      currentParticipants: formData.currentParticipants || 0,
      challengeRules: formData.challengeRules,
      leaderboard: formData.leaderboard || [],
      submissionFormat: formData.submissionFormat,
      testCases: formData.testCases,
      submissionGuidelines: formData.submissionGuidelines,
      eprojectlength: formData.eprojectlength ?? "",

      // File handling - use converted files
      projectFiles: convertedProjectFiles,
      imageFiles: convertedImageFiles,
      projectFilesPreview: formData.projectFilesPreview || [...convertedProjectFiles, ...convertedImageFiles],

      // Additional fields
      projectEndTime: formData.projectEndTime,
    };
  };

  const jobData = convertToJobData(formData);

  // Custom back handler that includes preview actions
  const handleBackToJobSearch = () => {
    onBack();
  };

  // Render preview header with actions
  const PreviewHeader = () => (
    <div className="bg-black/95 border-b border-white/10 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            ← Back to edit
          </button>
          <div className="text-white/60">|</div>
          <span className="text-white/80 text-sm">Preview Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Continue Editing
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </div>
            ) : (
              `Publish ${formData.selectedJobPostType || 'Job'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render the appropriate job details component based on type
  const renderJobDetails = () => {
    switch (formData.selectedJobPostType) {
      case 'Contract':
        return <ContractJobDetails job={jobData} onBack={handleBackToJobSearch} />;
      case 'Bounty':
        return <BountyJobDetails job={jobData} onBack={handleBackToJobSearch} />;
      case 'Auction':
        return <AuctionJobDetails job={jobData} onBack={handleBackToJobSearch} />;
      case 'Challenge':
        return <ChallengeJobDetails job={jobData} onBack={handleBackToJobSearch} />;
      default:
        // Fallback to Contract component for unknown types
        return <ContractJobDetails job={jobData} onBack={handleBackToJobSearch} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <PreviewHeader />
      {renderJobDetails()}
    </div>
  );
};

export default JobPreview;