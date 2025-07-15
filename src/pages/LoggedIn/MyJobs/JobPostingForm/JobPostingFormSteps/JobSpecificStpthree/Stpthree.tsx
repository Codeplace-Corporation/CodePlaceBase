// StepThree.tsx - File Access and Permissions

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faLock,
  faLockOpen,
  faFileAlt,
  faImage,
  faFilePdf,
  faFileWord,
  faFileArchive,
  faCode,
  faCodeBranch,
  faShield,
  faGlobe,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface StpthreeProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
  isSubmitting?: boolean;
  setCurrentStep?: (step: number) => void;
}

interface FilePermission {
  fileIndex: number;
  fileName: string;
  fileType: string;
  isLocked: boolean;
}

const Stpthree: React.FC<StpthreeProps> = ({ formData, updateFormData, errors, isSubmitting, setCurrentStep }) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  
  // Check if this is an open bounty or challenge
  const isOpenType = formData.JobSubType === 'open-bounty' || formData.JobSubType === 'open-challenge';
  
  // Initialize state from existing formData.projectFilesPreview if available
  const [filePermissions, setFilePermissions] = useState<FilePermission[]>(() => {
    const projectFiles = formData.projectFiles || [];
    const existingPreview = formData.projectFilesPreview || [];
    
    console.log('🔍 Step 3 - Initializing file permissions');
    console.log('🔍 Project files:', projectFiles);
    console.log('🔍 Existing preview:', existingPreview);
    
    return projectFiles.map((file, index) => {
      // Check if we have existing permissions for this file
      const existingPermission = existingPreview.find(preview => 
        preview.name === file.name && preview.type === file.type
      );
      
      console.log(`🔍 File ${index}:`, {
        fileName: file.name,
        fileType: file.type,
        existingPermission: existingPermission,
        existingPermissions: existingPermission?.permissions
      });
      
      // If we have existing permissions, use them; otherwise default based on job type
      let isLocked = !isOpenType; // Default: locked for non-open types, unlocked for open types
      
      if (existingPermission && existingPermission.permissions) {
        // Use the actual saved permission
        // Check for 'placeholder' which means no specific permission was set, so use default
        if (existingPermission.permissions.visibility === 'placeholder') {
          isLocked = !isOpenType; // Use default based on job type
          console.log(`🔍 File ${index} has placeholder permission, using default for ${isOpenType ? 'open' : 'closed'} type, isLocked: ${isLocked}`);
        } else {
          isLocked = existingPermission.permissions.visibility === 'participants-only';
          console.log(`🔍 File ${index} using existing permission:`, {
            visibility: existingPermission.permissions.visibility,
            isLocked: isLocked
          });
        }
      } else {
        console.log(`🔍 File ${index} using default permission for ${isOpenType ? 'open' : 'closed'} type, isLocked: ${isLocked}`);
      }
      
      return {
        fileIndex: index,
        fileName: file.name,
        fileType: file.type || 'unknown',
        isLocked: isLocked
      };
    });
  });

  // Update file permissions when formData changes (e.g., new files added or draft loaded)
  useEffect(() => {
    const projectFiles = formData.projectFiles || [];
    const existingPreview = formData.projectFilesPreview || [];
    
    console.log('🔍 Step 3 - useEffect triggered for file permissions update');
    console.log('🔍 Current projectFiles length:', projectFiles.length);
    console.log('🔍 Current filePermissions length:', filePermissions.length);
    console.log('🔍 Existing preview:', existingPreview);
    
    // Update if the number of files has changed OR if projectFilesPreview has changed (draft loaded)
    const shouldUpdate = projectFiles.length !== filePermissions.length || 
                        existingPreview.some((preview, index) => {
                          const currentFile = projectFiles[index];
                          return !currentFile || 
                                 preview.name !== currentFile.name || 
                                 preview.type !== currentFile.type ||
                                 preview.permissions?.visibility !== (filePermissions[index]?.isLocked ? 'participants-only' : 'public');
                        });
    
    if (shouldUpdate) {
      console.log('🔍 Updating file permissions due to file count or preview change');
      
      setFilePermissions(projectFiles.map((file, index) => {
        const existingPermission = existingPreview.find(preview => 
          preview.name === file.name && preview.type === file.type
        );
        
        console.log(`🔍 Update - File ${index}:`, {
          fileName: file.name,
          fileType: file.type,
          existingPermission: existingPermission,
          existingPermissions: existingPermission?.permissions
        });
        
        // If we have existing permissions, use them; otherwise default based on job type
        let isLocked = !isOpenType; // Default: locked for non-open types, unlocked for open types
        
        if (existingPermission && existingPermission.permissions) {
          // Use the actual saved permission
          // Check for 'placeholder' which means no specific permission was set, so use default
          if (existingPermission.permissions.visibility === 'placeholder') {
            isLocked = !isOpenType; // Use default based on job type
            console.log(`🔍 Update - File ${index} has placeholder permission, using default for ${isOpenType ? 'open' : 'closed'} type, isLocked: ${isLocked}`);
          } else {
            isLocked = existingPermission.permissions.visibility === 'participants-only';
            console.log(`🔍 Update - File ${index} using existing permission:`, {
              visibility: existingPermission.permissions.visibility,
              isLocked: isLocked
            });
          }
        } else {
          console.log(`🔍 Update - File ${index} using default permission for ${isOpenType ? 'open' : 'closed'} type, isLocked: ${isLocked}`);
        }
        
        return {
          fileIndex: index,
          fileName: file.name,
          fileType: file.type || 'unknown',
          isLocked: isLocked
        };
      }));
    } else {
      console.log('🔍 No file count or preview change, skipping permission update');
    }
  }, [formData.projectFiles, formData.projectFilesPreview, isOpenType, filePermissions.length]); // Added filePermissions.length to prevent infinite loops

  const Tooltip: React.FC<{ id: string; text: string; children: React.ReactNode }> = ({ id, text, children }) => (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setHoveredTooltip(id)}
        onMouseLeave={() => setHoveredTooltip(null)}
        className="cursor-help"
      >
        {children}
      </div>
      {hoveredTooltip === id && (
        <div className="absolute z-50 w-64 p-2 mt-1 text-xs text-white bg-gray-900 border border-white/20 rounded-md shadow-lg">
          {text}
          <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 border-l border-t border-white/20 transform rotate-45"></div>
        </div>
      )}
    </div>
  );

  // Get colors based on job type
  const getJobTypeColors = () => {
    switch (formData.selectedJobPostType) {
      case 'Bounty':
        return { primary: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
      case 'Auction':
        return { primary: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'Challenge':
        return { primary: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      case 'Contract':
        return { primary: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
      default:
        return { primary: 'text-white', bg: 'bg-white/10', border: 'border-white/30' };
    }
  };

  const colors = getJobTypeColors();
  
  const getFileIcon = (fileName: string | undefined | null) => {
    if (!fileName) return faFileAlt;
    if (fileName.startsWith('github:')) {
      return faCodeBranch;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return faImage;
      case 'pdf':
        return faFilePdf;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'zip':
      case 'rar':
      case '7z':
        return faFileArchive;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'html':
      case 'css':
        return faCode;
      default:
        return faFileAlt;
    }
  };



  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFileLock = (fileIndex: number) => {
    // Prevent changes if this is an open type
    if (isOpenType) return;
    
    setFilePermissions(prev => 
      prev.map(perm => 
        perm.fileIndex === fileIndex 
          ? { ...perm, isLocked: !perm.isLocked }
          : perm
      )
    );
  };

  const toggleAllFiles = (shouldLock: boolean) => {
    // Prevent changes if this is an open type
    if (isOpenType) return;
    
    setFilePermissions(prev => 
      prev.map(perm => ({ ...perm, isLocked: shouldLock }))
    );
  };

  // Force unlock for open types
  useEffect(() => {
    if (isOpenType) {
      setFilePermissions(prev => 
        prev.map(perm => ({ ...perm, isLocked: false }))
      );
    }
  }, [isOpenType]);

  // Save permissions to form data when permissions change with proper debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFormData({ 
        projectFilesPreview: filePermissions.map(perm => {
          const projectFile = formData.projectFiles?.[perm.fileIndex];
          const isPublic = !perm.isLocked;
          
          // Check if projectFile is a valid File object and not a pseudo-file (like GitHub URLs)
          const isValidFile = projectFile && 
            projectFile instanceof File && 
            !projectFile.name?.startsWith('github:') &&
            projectFile.size !== undefined &&
            projectFile.size > 0;
          
          return {
            name: perm.fileName,
            type: perm.fileType,
            size: isValidFile ? formatFileSize(projectFile.size) : '0',
            url: isValidFile ? (() => {
              try {
                return URL.createObjectURL(projectFile);
              } catch (error) {
                console.warn('Failed to create object URL for file:', projectFile);
                return '';
              }
            })() : '',
            permissions: {
              visibility: isPublic ? 'public' : 'participants-only',
              downloadable: isPublic, // Only downloadable if public
              viewable: isPublic // Only viewable if public
            }
          };
        })
      });
    }, 100); // Small debounce to prevent excessive updates

    return () => clearTimeout(timeoutId);
  }, [filePermissions, updateFormData, formData.projectFiles]);

  if (!formData.projectFiles || formData.projectFiles.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faFileAlt} className={`${colors.primary} text-6xl mb-4`} />
          <h3 className="text-xl font-medium text-white mb-2">No Project Files</h3>
          <p className="text-white/60">
            No files were uploaded in Step 2. File permissions can only be configured for uploaded files.
          </p>
        </div>
      </div>
    );
  }

  // Show special message for open bounties/challenges
  if (isOpenType) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className={colors.primary} />
            File Access
          </h2>
          <p className="text-white/70 text-sm">
            All files are automatically public for {formData.JobSubType === 'open-bounty' ? 'open bounties' : 'open challenges'}.
          </p>
        </div>

        <div className={`p-6 ${colors.bg} ${colors.border} border rounded-lg`}>
          <div className="flex items-start gap-4">
            <FontAwesomeIcon icon={faGlobe} className={`${colors.primary} text-2xl mt-1`} />
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2 text-lg">All Files Are Public</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                {formData.JobSubType === 'open-bounty' 
                  ? 'Open bounties require all files to be publicly accessible.'
                  : 'Open challenges require all files to be publicly accessible.'
                }
              </p>
              
              <button
                onClick={() => setCurrentStep?.(1)}
                className={`px-4 py-2 ${colors.primary.replace('text-', 'bg-').replace('-400', '-500')} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
              >
                ← Change to Closed {formData.selectedJobPostType}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {filePermissions.map((permission) => {
            const file = formData.projectFiles![permission.fileIndex];
            const fileName = permission.fileName || 'Unknown File';
            const isGithubUrl = fileName.startsWith('github:');
            const displayName = isGithubUrl ? fileName.replace('github:', '') : fileName;
            
            return (
              <div key={permission.fileIndex} className="flex items-center gap-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <FontAwesomeIcon 
                  icon={getFileIcon(fileName)} 
                  className="text-green-400 text-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium truncate">{displayName}</h4>
                    <span className="text-white/60 text-xs">
                      {isGithubUrl ? '(GitHub Repository)' : `(${formatFileSize(file.size)})`}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-green-300 text-sm font-medium">Public</span>
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                    <FontAwesomeIcon icon={faLockOpen} className="text-green-400 text-xs" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isSubmitting && (
          <div className="text-center py-4">
            <p className="text-yellow-400">Publishing your {formData.selectedJobPostType?.toLowerCase()}...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faShield} className={colors.primary} />
          File Access
        </h2>
        <p className="text-white/70 text-sm">
          Locked files are only visible to participants, unlocked files are public.
        </p>
      </div>

      {/* Lock/Unlock Explanation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <FontAwesomeIcon icon={faLockOpen} className="text-green-400 text-xs" />
            </div>
          <div>
            <h4 className="text-white font-medium text-sm">Public</h4>
            <p className="text-white/60 text-xs">Anyone can access</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faLock} className="text-white/70 text-xs" />
            </div>
          <div>
            <h4 className="text-white font-medium text-sm">Private</h4>
            <p className="text-white/60 text-xs">Participants only</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => toggleAllFiles(false)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faLockOpen} />
          Unlock All Files
        </button>
            <button
          onClick={() => toggleAllFiles(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
            >
          <FontAwesomeIcon icon={faLock} />
          Lock All Files
            </button>
          </div>

      {/* File List */}
      <div className="space-y-2">
        {filePermissions.map((permission) => {
          const file = formData.projectFiles![permission.fileIndex];
          const fileName = permission.fileName || 'Unknown File';
          const isGithubUrl = fileName.startsWith('github:');
          const displayName = isGithubUrl ? fileName.replace('github:', '') : fileName;
          
          return (
            <div key={permission.fileIndex} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
              <FontAwesomeIcon 
                icon={getFileIcon(fileName)} 
                className={`${colors.primary} text-sm`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium truncate">{displayName}</h4>
                  <span className="text-white/60 text-xs">
                    {isGithubUrl ? '(GitHub Repository)' : `(${formatFileSize(file.size)})`}
                  </span>
                      </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-sm font-medium transition-all duration-300 ${permission.isLocked ? 'text-white/70' : 'text-green-300'}`}>
                    {permission.isLocked ? 'Participants Only' : 'Public'}
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFileLock(permission.fileIndex)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 transform ${
                    permission.isLocked 
                      ? 'bg-white/10 border-2 border-white/20 hover:bg-white/20' 
                      : 'bg-green-500/20 border-2 border-green-500/40 hover:bg-green-500/30'
                  }`}
                >
                  <FontAwesomeIcon 
                    icon={permission.isLocked ? faLock : faLockOpen} 
                    className={`text-xs transition-all duration-300 transform ${
                      permission.isLocked 
                        ? 'text-white/70 animate-pulse' 
                        : 'text-green-400 animate-bounce'
                    }`}
                    style={{
                      animationDuration: permission.isLocked ? '2s' : '1s',
                      animationIterationCount: permission.isLocked ? 'infinite' : '1'
                    }}
                  />
                </button>
              </div>
            </div>
          );
        })}
          </div>

      {isSubmitting && (
        <div className="text-center py-4">
          <p className="text-yellow-400">Publishing your {formData.selectedJobPostType?.toLowerCase()}...</p>
        </div>
      )}
    </div>
  );
};

export default Stpthree;