import React, { useEffect } from 'react';
import { FormData } from './JobPostingForm';
import ContractJobDetails from '../../../../DataManegment/JobPreview/components/ContractJobDetails';
import BountyJobDetails from '../../../../DataManegment/JobPreview/components/BountyJobDetails';
import AuctionJobDetails from '../../../../DataManegment/JobPreview/components/AuctionJobDetails';
import ChallengeJobDetails from '../../../../DataManegment/JobPreview/components/ChallengeJobDetails';
import { useAuth } from '../../../../context/AuthContext';

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
  const { currentUser } = useAuth();
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs created for file previews
      formData.projectFiles?.forEach(file => {
        // Only create object URLs for valid File objects, not pseudo-files like GitHub URLs
        if (file instanceof File && !file.name?.startsWith('github:')) {
          try {
            const url = URL.createObjectURL(file);
            URL.revokeObjectURL(url);
          } catch (error) {
            console.warn('Failed to create object URL for file:', file);
          }
        }
      });
    };
  }, [formData.projectFiles]);
  // Convert FormData to the JobData format expected by the JobDetails components
  const convertToJobData = (formData: FormData) => {
    // Debug logging for entire formData
    console.log('🔍 JobPreview Debug - Full formData:', formData);
    console.log('🔍 JobPreview Debug - formData keys:', Object.keys(formData));
    // Helper function to mask GitHub URLs
    const maskGitHubUrl = (url: string | undefined | null, isPublic: boolean) => {
      if (!url || url.trim() === '') {
        return 'Unknown File';
      }
      if (!url.startsWith('github:')) {
        return url;
      }
      
      if (!isPublic) {
        // Mask the unique parts of the GitHub URL
        const cleanUrl = url.replace('github:', '');
        const parts = cleanUrl.split('/');
        if (parts.length >= 3) {
          // Format: https://github.com/username/repository
          const username = parts[2];
          const repo = parts[3];
          const maskedUsername = username.length > 2 ? username.substring(0, 2) + '***' : '***';
          const maskedRepo = repo.length > 2 ? repo.substring(0, 2) + '***' : '***';
          return `github:https://github.com/${maskedUsername}/${maskedRepo}`;
        }
      }
      
      return url;
    };

    // Convert File objects to the format expected by JobDetails components
    console.log('🔍 formData.projectFiles:', formData.projectFiles);
    console.log('🔍 formData.projectFiles length:', formData.projectFiles?.length);
    console.log('🔍 formData.projectFilesPreview:', formData.projectFilesPreview);
    console.log('🔍 Individual file objects:', formData.projectFiles?.map((file, i) => ({
      index: i,
      name: file?.name,
      type: file?.type,
      size: file?.size,
      isFile: file instanceof File,
      constructor: file?.constructor?.name
    })));
    
    // Use projectFilesPreview if available (contains URLs from Firebase Storage)
    // Otherwise fall back to converting projectFiles
    const convertedProjectFiles = formData.projectFilesPreview?.map((preview, index) => {
      const fileName = preview.name || `File ${index + 1}`;
      const isGithubUrl = fileName.startsWith('github:');
      
      // Read permissions from the preview data
      const permissions = preview.permissions || {
        visibility: 'public',
        downloadable: true,
        viewable: true
      };
      const isPublic = permissions.visibility === 'public';
      const displayName = maskGitHubUrl(fileName, isPublic);
      
      // Check if this is a valid URL (not placeholder)
      const hasValidUrl = preview.url && preview.url !== '#' && preview.url !== '';
      const isPlaceholder = !hasValidUrl;
      
      return {
        name: displayName,
        type: preview.type || 'Unknown',
        size: isGithubUrl ? 'GitHub Repository' : preview.size || 'Unknown size',
        url: hasValidUrl ? preview.url : '#',
        isClickable: hasValidUrl,
        isGithubUrl: isGithubUrl,
        isPlaceholder: isPlaceholder,
        permissions: {
          visibility: isPlaceholder ? 'placeholder' : permissions.visibility,
          downloadable: isPlaceholder ? false : permissions.downloadable,
          viewable: isPlaceholder ? false : permissions.viewable
        }
      };
    }) || formData.projectFiles?.map((file, index) => {
      // Fallback for when projectFilesPreview is not available
      const existingPermission = formData.projectFilesPreview?.find(preview => 
        preview.name === file?.name && preview.type === file?.type
      );
      const previewUrl = existingPermission?.url;
      let isPublic = existingPermission ? 
        existingPermission.permissions?.visibility === 'public' : 
        true; // Default to public if no permissions set
      // Apply masking to GitHub URLs
      const fileName = file?.name || `File ${index + 1}`;
      const displayName = maskGitHubUrl(fileName, isPublic);
      // Handle GitHub URLs differently
      const isGithubUrl = fileName ? fileName.startsWith('github:') : false;
      // Use previewUrl for placeholder logic
      const isPlaceholder = !previewUrl || previewUrl === '#';
      let fileUrl = '';
      let isClickable = true;
      if (isGithubUrl) {
        if (isPublic) {
          fileUrl = fileName ? fileName.replace('github:', '') : '';
        } else {
          fileUrl = '#';
          isClickable = false;
        }
      } else if (isPlaceholder) {
        fileUrl = '#';
        isClickable = false;
        isPublic = false;
      } else {
        fileUrl = previewUrl || '#';
        isClickable = !!previewUrl && previewUrl !== '#';
      }
      return {
        name: displayName,
        type: file?.type || 'Unknown',
        size: isGithubUrl ? 'GitHub Repository' : 
              isPlaceholder ? `${(((file as any)?.size || 0) / 1024).toFixed(1)} KB` :
              (file?.size && typeof file.size === 'number' ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'),
        url: fileUrl,
        isClickable: isClickable,
        isGithubUrl: isGithubUrl,
        isPlaceholder: isPlaceholder,
        permissions: {
          visibility: isPlaceholder ? 'placeholder' : (isPublic ? 'public' : 'participants-only'),
          downloadable: isPlaceholder ? false : isPublic,
          viewable: isPlaceholder ? false : isPublic
        }
      };
    }) || [];

    // Convert image files to the expected format
    // Use imageFilesPreview if available (contains URLs from Firebase Storage)
    // Otherwise fall back to converting imageFiles
    const convertedImageFiles = formData.imageFilesPreview?.map((preview, index) => {
      const fileName = preview.name || `Image ${index + 1}`;
      const isGithubUrl = fileName.startsWith('github:');
      
      // Image files don't have permissions in their type, so default to public
      const isPublic = true;
      const displayName = maskGitHubUrl(fileName, isPublic);
      
      // Check if this is a valid URL (not placeholder)
      const hasValidUrl = preview.url && preview.url !== '#' && preview.url !== '';
      const isPlaceholder = !hasValidUrl;
      
      return {
        name: displayName,
        type: preview.type || 'Unknown',
        size: isGithubUrl ? 'GitHub Repository' : preview.size || 'Unknown size',
        url: hasValidUrl ? preview.url : '#',
        isClickable: hasValidUrl,
        isGithubUrl: isGithubUrl,
        isPlaceholder: isPlaceholder,
        permissions: {
          visibility: isPlaceholder ? 'placeholder' : 'public',
          downloadable: isPlaceholder ? false : true,
          viewable: isPlaceholder ? false : true
        }
      };
    }) || formData.imageFiles?.map(imageFile => {
      // Fallback for when imageFilesPreview is not available
      const existingPermission = formData.projectFilesPreview?.find(preview => 
        preview.name === imageFile.file.name && preview.type === imageFile.file.type
      );
      
      let isPublic = existingPermission ? 
        existingPermission.permissions?.visibility === 'public' : 
        true; // Default to public if no permissions set
      
      // Apply masking to GitHub URLs
      const imageFileName = imageFile?.file?.name;
      const displayName = maskGitHubUrl(imageFileName, isPublic);
      
      // Handle GitHub URLs differently
      const isGithubUrl = imageFileName ? imageFileName.startsWith('github:') : false;
      const isPlaceholder = !(imageFile.file instanceof File) && (imageFile.file as any)?.isPlaceholder;
      let fileUrl = '';
      let isClickable = true;
      
      if (isGithubUrl) {
        if (isPublic) {
          // Public GitHub URL - make it clickable
          fileUrl = imageFileName ? imageFileName.replace('github:', '') : '';
        } else {
          // Private GitHub URL - not clickable
          fileUrl = '#';
          isClickable = false;
        }
      } else if (isPlaceholder) {
        // Placeholder image file from draft - not clickable
        fileUrl = '#';
        isClickable = false;
        isPublic = false; // Placeholder files are not downloadable/viewable
      } else {
        // Regular image file - use existing preview URL
        fileUrl = imageFile.preview;
      }
      
      return {
        name: displayName,
        type: imageFile?.file?.type || 'Unknown',
        size: isGithubUrl ? 'GitHub Repository' : (imageFile?.file?.size && typeof imageFile.file.size === 'number' ? `${(imageFile.file.size / 1024).toFixed(1)} KB` : 'Unknown size'),
        url: fileUrl,
        isClickable: isClickable,
        isGithubUrl: isGithubUrl,
        isPlaceholder: isPlaceholder,
        permissions: {
          visibility: isPlaceholder ? 'placeholder' : (isPublic ? 'public' : 'participants-only'),
          downloadable: isPlaceholder ? false : isPublic,
          viewable: isPlaceholder ? false : isPublic
        }
      };
    }) || [];



    return {
      id: formData.id || 'preview',
      projectTitle: formData.projectTitle,
      projectType: formData.projectType,
      tools: formData.tools,
      tags: formData.tags,
      selectedJobPostType: formData.selectedJobPostType,
      compensation: formData.compensation,
      estimatedProjectLength: formData.estimatedProjectLength || formData.eprojectlength || '',
      projectDescription: formData.projectDescription,
      projectOverview: formData.projectOverview,
      auctionCloseTime: formData.auctionCloseTime,
      bountyEndTime: formData.bountyEndTime,
      applicationsCloseTime: formData.applicationsCloseTime,
      challengeCloseTime: formData.challengeCloseTime,
      createdAt: formData.createdAt,
      createdBy: formData.createdBy,
      requirements: formData.requirements || [],
      deliverables: formData.requiredDeliverables || formData.deliverables,
      skills: formData.skills,
      budget: formData.budget,
      location: formData.location,
      remote: formData.remote,
      experienceLevel: formData.experienceLevel,
      applicationCount: formData.applicationCount || 0,
      status: formData.status || 'draft',
      category: formData.category,
      
      // Bounty-specific fields
      Amount: formData.Amount,
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
      auctionEndDate: formData.auctionEndDate,
      minimumBid: formData.minimumBid,
      bidIncrement: formData.bidIncrement,
      auctionDuration: formData.auctionDuration,
      startingBid: formData.startingBid,
      revisionCost: formData.revisionCost,
      prepaidRevisions: formData.prepaidRevisions,
      projectDeadline: formData.projectDeadline,
      Deadline: formData.Deadline,
      ExpiryTime: formData.ExpiryTime,
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
      projectFilesPreview: [...convertedProjectFiles, ...convertedImageFiles],

      // Additional fields
      projectEndTime: formData.projectEndTime,
      JobSubType: formData.JobSubType || '',
    };
  };

  // --- Add state to force re-computation of jobData on permission change ---
  const [jobData, setJobData] = React.useState<any>(null);

  // Always recompute jobData when projectFiles or projectFilesPreview changes
  useEffect(() => {
    const jobDataResult = {
      ...convertToJobData(formData),
      createdByEmail: currentUser?.email || '',
      createdByDisplayName: currentUser?.displayName || '',
    };
    
    setJobData(jobDataResult);
  }, [formData, formData.projectFiles, formData.projectFilesPreview, currentUser]);

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
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`text-white/70 hover:text-white transition-colors text-sm flex items-center gap-2 ${
              isSubmitting ? 'cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </div>
            ) : (
              <>
                {formData.selectedJobPostType === 'Challenge' ? 'Review Challenge' : `Publish ${formData.selectedJobPostType || 'Job'}`}
                →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render the appropriate job details component based on type
  const renderJobDetails = () => {
    // Add null check to prevent rendering when jobData is null
    if (!jobData) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading job preview...</div>
        </div>
      );
    }

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