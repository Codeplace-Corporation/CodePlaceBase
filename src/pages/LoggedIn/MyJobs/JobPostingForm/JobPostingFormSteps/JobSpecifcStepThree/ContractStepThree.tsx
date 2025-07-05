import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faFileAlt, 
  faUpload,
  faTrash,
  faFolder,
  faCode,
  faLink,
  faPlus,
  faImage,
  faFilePdf,
  faFileWord,
  faFileArchive,
  faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface ContractStepThreeProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const ContractStepThree: React.FC<ContractStepThreeProps> = ({ formData, updateFormData, errors }) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 200) + 'px'; // Minimum height of 200px
    }
  };

  // Auto-resize on content change
  useEffect(() => {
    autoResizeTextarea();
  }, [formData.projectDescription]);

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

  // File handling functions
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const currentFiles = formData.projectFiles || [];
    updateFormData({
      projectFiles: [...currentFiles, ...newFiles]
    });
  };

  const removeFile = (index: number) => {
    const currentFiles = formData.projectFiles || [];
    const updated = currentFiles.filter((_, i) => i !== index);
    updateFormData({
      projectFiles: updated
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (fileName: string) => {
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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Full Project Description */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faFileAlt} className="text-blue-400" />
          Detailed Project Description
          <Tooltip id="project-description" text="Provide a comprehensive description of your project including technical requirements, user stories, acceptance criteria, and any specific implementation details.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <textarea
          ref={textareaRef}
          value={formData.projectDescription || ''}
          onChange={(e) => {
            updateFormData({ projectDescription: e.target.value });
            // Auto-resize on input
            setTimeout(autoResizeTextarea, 0);
          }}
          onInput={autoResizeTextarea}
          className={`w-full px-4 py-3 bg-white/5 border rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none min-h-[200px] ${
            errors.projectDescription ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder="Provide detailed information about your project:

• Technical requirements and specifications
• User stories and acceptance criteria  
• Design guidelines and frameworks to use
• Performance expectations and testing requirements
• Integration requirements with existing systems
• Browser/device compatibility requirements

Be as specific as possible to help developers understand exactly what you need..."
          style={{ overflow: 'hidden' }}
        />
        {errors.projectDescription && <p className="text-red-400 text-xs mt-1">{errors.projectDescription}</p>}
        
        <div className="mt-2 text-white/60 text-xs">
          <span className="font-medium">Tip:</span> The more detailed your description, the better quality submissions you'll receive.
        </div>
      </div>

      {/* GitHub Repository Link */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faCodeBranch} className="text-blue-400" />
          GitHub Repository (Optional)
          <Tooltip id="github-repo" text="Link to an existing GitHub repository with starter code, examples, or related projects that developers can reference.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faCodeBranch} className="text-white/40 text-sm" />
            </div>
            <input
              type="url"
              value={formData.projectFiles?.find(file => file.name?.startsWith('github:'))?.name?.replace('github:', '') || ''}
              onChange={(e) => {
                const githubUrl = e.target.value;
                const currentFiles = formData.projectFiles?.filter(file => !file.name?.startsWith('github:')) || [];
                if (githubUrl.trim()) {
                  // Create a pseudo-file object for GitHub URL
                  const githubFile = new File([''], `github:${githubUrl}`, { type: 'application/x-git-url' });
                  updateFormData({
                    projectFiles: [...currentFiles, githubFile]
                  });
                } else {
                  updateFormData({
                    projectFiles: currentFiles
                  });
                }
              }}
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
              placeholder="https://github.com/username/repository"
            />
          </div>
        </div>
        <p className="text-white/60 text-xs mt-1">
          Link to starter code, reference implementations, or related repositories
        </p>
      </div>

      {/* Project Files and Resources */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faUpload} className="text-blue-400" />
          Project Files & Resources
          <Tooltip id="project-files" text="Upload design mockups, technical specifications, data files, or any other resources that developers will need to complete the project.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        {/* File Upload Area */}
        <label
          htmlFor="file-upload"
          className={`border-2 border-dashed rounded-lg transition-all duration-200 min-h-[300px] flex flex-col cursor-pointer relative ${
            dragActive 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-white/20 hover:border-white/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Upload Interface */}
          {(!formData.projectFiles || formData.projectFiles.length === 0) ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">
                    Drop files here or click to browse
                  </p>
                  <p className="text-white/50 text-xs">
                    Upload design files, specifications, data samples, or reference materials
                  </p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-full">
                  <FontAwesomeIcon icon={faUpload} className="text-white/60 text-2xl" />
                </div>
                
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg,.zip,.rar,.7z,.txt,.md,.json,.xml,.csv,.xls,.xlsx,.psd,.ai,.fig,.sketch"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Header with upload option */}
              <div className="p-4 border-b border-white/10 flex justify-between items-center py-0">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faFolder} className="text-blue-400" />
                  Project Files ({formData.projectFiles.length})
                </h3>
                <label
                  htmlFor="file-upload-additional"
                  className="px-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-500/30 transition-colors cursor-pointer text-xs font-medium flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  Add More
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload-additional"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg,.zip,.rar,.7z,.txt,.md,.json,.xml,.csv,.xls,.xlsx,.psd,.ai,.fig,.sketch"
                />
              </div>

              {/* Files List */}
              <div className="flex-1 py-4 px-4">
                <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-track-rounded-full scrollbar-thumb-rounded-full">
                  {formData.projectFiles.map((file, index) => {
                    const isGithubUrl = file.name?.startsWith('github:');
                    const displayName = isGithubUrl ? file.name.replace('github:', '') : file.name;
                    const fileInfo = isGithubUrl ? 'GitHub Repository' : `${file.type || 'Unknown'} • ${formatFileSize(file.size)}`;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 px-3 bg-white/5 border border-white/10 rounded group hover:bg-white/10 transition-colors">
                        <div className="flex-shrink-0">
                          <FontAwesomeIcon 
                            icon={isGithubUrl ? faCodeBranch : getFileIcon(file.name)} 
                            className={`text-sm ${isGithubUrl ? 'text-blue-400' : 'text-gray-400'}`} 
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-sm font-medium truncate">
                            {displayName}
                          </span>
                          <span className="text-white/60 text-xs ml-2">
                            • {fileInfo}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drop zone overlay when dragging */}
              {dragActive && (
                <div className="absolute inset-2 border-2 border-dashed border-blue-400 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faUpload} className="text-blue-400 text-3xl mb-2" />
                    <p className="text-blue-400 font-medium">Drop files here to add them</p>
                  </div>
                </div>
              )}
            </>
          )}
        </label>
        
        <div className="mt-2 text-white/60 text-xs">
          <span className="font-medium">Supported formats:</span> Images (PNG, JPG, SVG), Documents (PDF, DOC), Archives (ZIP, RAR), Design files (PSD, AI, Figma), Data files (JSON, CSV, XML), and more
        </div>
      </div>
    </div>
  );
};

export default ContractStepThree;