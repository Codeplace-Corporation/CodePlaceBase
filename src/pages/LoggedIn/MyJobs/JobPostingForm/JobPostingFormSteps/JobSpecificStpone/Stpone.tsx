import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faBullseye,
  faTrophy,
  faFileContract,
  faPlus,
  faTimes,
  faInfoCircle,
  faChevronDown,
  faChevronUp,
  faCrosshairs,
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

// Import categories from external file
import { JOB_CATEGORIES } from '../Components/JobCategoryList';

interface StponeProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const JOB_POST_TYPES = [
  { 
    type: 'Bounty', 
    icon: faCrosshairs, 
    color: 'text-purple-400',
    tooltip: 'Set a fixed reward for completing specific tasks or features. Developers work to claim the bounty upon successful delivery.'
  },
  { 
    type: 'Auction', 
    icon: faGavel, 
    color: 'text-orange-400',
    tooltip: 'Developers submit bids with their proposed timeline and cost. You choose the best proposal based on price, timeline, and experience.'
  },
  { 
    type: 'Challenge', 
    icon: faTrophy, 
    color: 'text-green-400',
    tooltip: 'Create competitive coding challenges where multiple developers compete. Winner takes all or prizes are distributed among top performers.'
  },
  { 
    type: 'Contract', 
    icon: faFileContract, 
    color: 'text-blue-400',
    tooltip: 'Traditional freelance contract with negotiated terms, milestones, and ongoing collaboration throughout the project lifecycle.'
  },
];

const PROJECT_CATEGORIES = JOB_CATEGORIES.filter((category, index, self) => 
  category && typeof category === 'string' && self.indexOf(category) === index
).sort();

const Stpone: React.FC<StponeProps> = ({ formData, updateFormData, errors }) => {
  const [tagInput, setTagInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [removingTags, setRemovingTags] = useState<Set<number>>(new Set());
  const [removingTools, setRemovingTools] = useState<Set<number>>(new Set());
  const [showSubTypeContent, setShowSubTypeContent] = useState(false);
  const [categoryInput, setCategoryInput] = useState(formData.projectType || '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<string[]>(PROJECT_CATEGORIES);

  // Handle category input and filtering
  const handleCategoryInputChange = (value: string) => {
    setCategoryInput(value);
    updateFormData({ projectType: value });
    
    // Filter categories based on input
    if (value.trim() === '') {
      // If input is empty, show all categories
      setFilteredCategories(PROJECT_CATEGORIES);
    } else {
      // Filter categories based on input
      const filtered = PROJECT_CATEGORIES.filter(category =>
        category.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
    
    // Show dropdown if input has focus and there's text (even if no results)
    setShowCategoryDropdown(true);
  };

  const handleCategorySelect = (category: string) => {
    setCategoryInput(category);
    updateFormData({ projectType: category });
    setShowCategoryDropdown(false);
  };

  const handleCategoryInputFocus = () => {
    // Reset filtered categories to show all when focused
    if (categoryInput.trim() === '') {
      setFilteredCategories(PROJECT_CATEGORIES);
    } else {
      // Re-filter based on current input
      const filtered = PROJECT_CATEGORIES.filter(category =>
        category.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
    setShowCategoryDropdown(true);
  };

  // Get dynamic colors based on selected job post type
  const getJobTypeColors = () => {
    switch (formData.selectedJobPostType) {
      case 'Bounty':
        return {
          text: 'text-purple-300',
          bg: 'bg-purple-500/20',
          border: 'border-purple-400'
        };
      case 'Auction':
        return {
          text: 'text-orange-300',
          bg: 'bg-orange-500/20',
          border: 'border-orange-400'
        };
      case 'Challenge':
        return {
          text: 'text-green-300',
          bg: 'bg-green-500/20',
          border: 'border-green-400'
        };
      case 'Contract':
        return {
          text: 'text-blue-300',
          bg: 'bg-blue-500/20',
          border: 'border-blue-400'
        };
      default:
        return {
          text: 'text-white',
          bg: 'bg-white/10',
          border: 'border-white'
        };
    }
  };

  const handleCategoryInputBlur = () => {
    // Delay hiding to allow for category selection
    setTimeout(() => setShowCategoryDropdown(false), 200);
  };

  // Handle sub-type visibility with animations
  const shouldShowSubType = formData.selectedJobPostType === 'Bounty' || 
                           formData.selectedJobPostType === 'Challenge' || 
                           formData.selectedJobPostType === 'Contract';

  React.useEffect(() => {
    if (shouldShowSubType) {
      // Small delay to let height animation start, then show content
      setTimeout(() => setShowSubTypeContent(true), 50);
    } else {
      // Hide content immediately, let height animation handle the collapse
      setShowSubTypeContent(false);
    }
  }, [shouldShowSubType]);

  // Update category input when formData changes
  React.useEffect(() => {
    setCategoryInput(formData.projectType || '');
  }, [formData.projectType]);

  

  const jobColors = getJobTypeColors();

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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 20) {
      updateFormData({
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setRemovingTags(prev => new Set(prev).add(index));
    setTimeout(() => {
      updateFormData({
        tags: formData.tags.filter((_, i) => i !== index)
      });
      setRemovingTags(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200); // Match animation duration
  };

  const addTool = () => {
    if (toolInput.trim() && !formData.tools.find(t => t.name === toolInput.trim()) && formData.tools.length < 20) {
      updateFormData({
        tools: [...formData.tools, { name: toolInput.trim() }]
      });
      setToolInput('');
    }
  };

  const removeTool = (index: number) => {
    setRemovingTools(prev => new Set(prev).add(index));
    setTimeout(() => {
      updateFormData({
        tools: formData.tools.filter((_, i) => i !== index)
      });
      setRemovingTools(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200); // Match animation duration
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Job Title */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Job Title
          <Tooltip id="job-title" text="Enter a clear, descriptive title for your job posting. This is what developers will see first, so make it specific and engaging.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <input
          type="text"
          value={formData.projectTitle}
          onChange={(e) => updateFormData({ projectTitle: e.target.value })}
          className={`w-full px-3 py-2 bg-white/5 border rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white ${
            errors.projectTitle ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder="Enter your job title"
        />
        {errors.projectTitle && (
          <p className="text-red-400 text-xs mt-1">{errors.projectTitle}</p>
        )}
      </div>

      {/* Job Post Type */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Job Post Type
          <Tooltip id="job-type" text="Choose the type of job posting: Bounty (fixed reward for completion), Auction (developers bid), Challenge (competitive coding), or Contract (traditional hiring).">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <div className="grid grid-cols-4 gap-4">
          {JOB_POST_TYPES.map((jobType) => (
            <Tooltip 
              key={jobType.type}
              id={`job-type-${jobType.type.toLowerCase()}`} 
              text={jobType.tooltip}
            >
              <div
                onClick={() => updateFormData({ selectedJobPostType: jobType.type as any })}
                className={`cursor-pointer transition-all hover:scale-105 text-center p-2 rounded-lg border-2 ${
                  formData.selectedJobPostType === jobType.type
                    ? jobType.type === 'Bounty' 
                      ? 'border-purple-400 bg-purple-500/10'
                      : jobType.type === 'Auction'
                      ? 'border-orange-400 bg-orange-500/10'
                      : jobType.type === 'Challenge'
                      ? 'border-green-400 bg-green-500/10'
                      : 'border-blue-400 bg-blue-500/10'
                    : 'border-transparent bg-transparent'
                }`}
              >
                <div className="w-24 h-20 mx-auto mb-1 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={jobType.icon}
                    size="3x"
                    className={`transition-all ${
                      formData.selectedJobPostType === jobType.type
                        ? jobType.type === 'Bounty' 
                          ? 'text-purple-300 drop-shadow-lg filter brightness-125'
                          : jobType.type === 'Auction'
                          ? 'text-orange-300 drop-shadow-lg filter brightness-125'
                          : jobType.type === 'Challenge'
                          ? 'text-green-300 drop-shadow-lg filter brightness-125'
                          : 'text-blue-300 drop-shadow-lg filter brightness-125'
                        : jobType.type === 'Bounty' 
                          ? 'text-purple-400 hover:text-purple-300 drop-shadow-md' 
                          : jobType.type === 'Auction'
                          ? 'text-orange-400 hover:text-orange-300 drop-shadow-md'
                          : jobType.type === 'Challenge'
                          ? 'text-green-400 hover:text-green-300 drop-shadow-md'
                          : 'text-blue-400 hover:text-blue-300 drop-shadow-md'
                    }`}
                    style={{
                      filter: formData.selectedJobPostType === jobType.type
                        ? jobType.type === 'Bounty'
                          ? 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))'
                          : jobType.type === 'Auction'
                          ? 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.8))'
                          : jobType.type === 'Challenge'
                          ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))'
                          : 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))'
                        : jobType.type === 'Bounty'
                        ? 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.4))'
                        : jobType.type === 'Auction'
                        ? 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4))'
                        : jobType.type === 'Challenge'
                        ? 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.4))'
                        : 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))'
                    }}
                  />
                </div>
                <h3 className={`font-medium text-sm transition-all mt-0 ${
                  formData.selectedJobPostType === jobType.type
                    ? jobType.type === 'Bounty' 
                      ? 'text-purple-300 filter brightness-125'
                      : jobType.type === 'Auction'
                      ? 'text-orange-300 filter brightness-125'
                      : jobType.type === 'Challenge'
                      ? 'text-green-300 filter brightness-125'
                      : 'text-blue-300 filter brightness-125'
                    : 'text-white'
                }`}
                style={formData.selectedJobPostType === jobType.type ? {
                  textShadow: jobType.type === 'Bounty'
                    ? '0 0 8px rgba(168, 85, 247, 0.6)'
                    : jobType.type === 'Auction'
                    ? '0 0 8px rgba(249, 115, 22, 0.6)'
                    : jobType.type === 'Challenge'
                    ? '0 0 8px rgba(34, 197, 94, 0.6)'
                    : '0 0 8px rgba(59, 130, 246, 0.6)'
                } : {}}
                >{jobType.type}</h3>
              </div>
            </Tooltip>
          ))}
        </div>
        {errors.selectedJobPostType && (
          <p className="text-red-400 text-xs mt-1">{errors.selectedJobPostType}</p>
        )}
      </div>

      {/* Job Post Sub Type - Only show for Bounty, Challenge, and Contract */}
      <div 
        className={`grid transition-all duration-500 ease-out ${
          shouldShowSubType ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        style={{
          marginBottom: shouldShowSubType ? '1rem' : '0rem'
        }}
      >
        <div className="overflow-hidden">
          {showSubTypeContent && (
            <div className="pb-4">
              <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
                {formData.selectedJobPostType === 'Bounty' ? 'Bounty Type' : 
                 formData.selectedJobPostType === 'Challenge' ? 'Challenge Type' : 
                 'Contract Type'}
                <Tooltip 
                  id="sub-type" 
                  text={formData.selectedJobPostType === 'Bounty' 
                    ? "Choose between Open Bounty (anyone can see and work on it) or Closed Bounty (invitation-only or private bounty for specific developers)."
                    : formData.selectedJobPostType === 'Challenge'
                    ? "Choose between Open Challenge (submissions are public and visible to all) or Closed Challenge (submissions are private until judging is complete)."
                    : "Choose between Fixed Price Contract (set budget agreed upfront) or Open Price Contract (budget negotiated based on proposals and scope discussions)."
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
                </Tooltip>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {formData.selectedJobPostType === 'Bounty' ? (
                  <>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'Open Bounty' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'Open Bounty'
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'Open Bounty' ? 'text-purple-300' : 'text-white'
                      }`}>Open Bounty</h4>
                      <p className="text-xs text-white/70">Public & visible to all developers</p>
                    </div>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'Closed Bountyty' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'Closed Bountyty'
                          ? 'border-purple-400 bg-purple-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'Closed Bountyty' ? 'text-purple-300' : 'text-white'
                      }`}>Closed Bounty</h4>
                      <p className="text-xs text-white/70">Private & invitation-only</p>
                    </div>
                  </>
                ) : formData.selectedJobPostType === 'Challenge' ? (
                  <>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'Open Challenge' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'Open Challenge'
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'Open Challenge' ? 'text-green-300' : 'text-white'
                      }`}>Open Challenge</h4>
                      <p className="text-xs text-white/70">Public submissions & leaderboard</p>
                    </div>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'Closed Challenge' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'Closed Challenge'
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'Closed Challenge' ? 'text-green-300' : 'text-white'
                      }`}>Closed Challenge</h4>
                      <p className="text-xs text-white/70">Private until judging complete</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'FIxed-Price-Contract' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'FIxed-Price-Contract'
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'FIxed-Price-Contract' ? 'text-blue-300' : 'text-white'
                      }`}>Fixed Price Contract</h4>
                      <p className="text-xs text-white/70">Set budget agreed upfront</p>
                    </div>
                    <div
                      onClick={() => updateFormData({ JobSubType: 'open-price-contract' })}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-102 ${
                        formData.JobSubType === 'open-price-contract'
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-gray-500/40 bg-transparent hover:border-gray-400/60'
                      }`}
                    >
                      <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                        formData.JobSubType === 'open-price-contract' ? 'text-blue-300' : 'text-white'
                      }`}>Open Price Contract</h4>
                      <p className="text-xs text-white/70">Budget negotiated with proposals</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Category - Autocomplete */}
      <div className="relative">
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Project Category
          <Tooltip id="category" text="Start typing to see suggestions or select from the dropdown. Choose the category that best describes your project to help developers find it.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <div className="relative">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => handleCategoryInputChange(e.target.value)}
            onFocus={handleCategoryInputFocus}
            onBlur={handleCategoryInputBlur}
            className={`w-full px-3 py-2 pr-8 bg-white/5 border rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white ${
              errors.projectType ? 'border-red-500' : 'border-white/20'
            }`}
            placeholder="Type to search categories..."
          />
       
        </div>
        
        {/* Dropdown */}
        <div 
          className={`absolute top-full left-0 right-0 z-50 mt-1 transition-all duration-300 ease-out ${
            showCategoryDropdown ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-gray-900 border border-white/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <div
                  key={category}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-blue-600/20 ${
                    category === categoryInput ? 'bg-blue-600/30 text-blue-300' : 'text-white hover:text-blue-300'
                  }`}
                  style={{
                    animation: showCategoryDropdown ? `fadeInStagger 0.2s ease-out forwards ${index * 0.03}s` : 'none'
                  }}
                >
                  {category}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-white/50">
                No categories found
              </div>
            )}
          </div>
        </div>
        
        {errors.projectType && (
          <p className="text-red-400 text-xs mt-1">{errors.projectType}</p>
        )}
      </div>

      {/* Project Tags */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Project Tags
          <Tooltip id="tags" text="Add relevant tags to help developers find your project. Use keywords like 'urgent', 'bug-fix', 'frontend', 'beginner-friendly', etc. Tags improve discoverability.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
            placeholder={`Add tags (${formData.tags.length}/20 used)`}
            disabled={formData.tags.length >= 20}
            maxLength={30}
          />
          <button
            onClick={addTag}
            className={`w-8 h-8 text-black rounded-full transition-colors flex items-center justify-center ${
              formData.tags.length >= 20 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-white/90'
            }`}
            disabled={formData.tags.length >= 20}
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.tags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className={`transition-all duration-200 ${
                removingTags.has(index) ? 'animate-fadeOutScale' : 'animate-fadeInScale'
              }`}
              style={{
                animation: removingTags.has(index) 
                  ? 'fadeOutScale 0.2s ease-in forwards' 
                  : 'fadeInScale 0.2s ease-out forwards'
              }}
            >
              <span className={`inline-flex items-center gap-1 px-2 py-1 ${jobColors.bg} ${jobColors.text} rounded-full text-xs border-2 ${jobColors.border} transition-all duration-500 ease-in-out`}>
                {tag}
                <button
                  onClick={() => removeTag(index)}
                  className="hover:text-red-600 transition-colors"
                  disabled={removingTags.has(index)}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </span>
            </div>
          ))}
        </div>
        {errors.tags && (
          <p className="text-red-400 text-xs mt-1">{errors.tags}</p>
        )}
      </div>

      {/* Required Tools/Skills */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Required Tools/Skills
          <Tooltip id="tools" text="List the specific technologies, tools, and skills required for this project. Be specific (e.g., 'React 18', 'Python 3.9', 'Figma') to attract qualified developers.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
            placeholder={`Add required tools (${formData.tools.length}/20 used)`}
            disabled={formData.tools.length >= 20}
            maxLength={40}
          />
          <button
            onClick={addTool}
            className={`w-8 h-8 text-black rounded-full transition-colors flex items-center justify-center ${
              formData.tools.length >= 20 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-white/90'
            }`}
            disabled={formData.tools.length >= 20}
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.tools.map((tool, index) => (
            <div
              key={`${tool.name}-${index}`}
              className={`transition-all duration-200 ${
                removingTools.has(index) ? 'animate-fadeOutScale' : 'animate-fadeInScale'
              }`}
              style={{
                animation: removingTools.has(index) 
                  ? 'fadeOutScale 0.2s ease-in forwards' 
                  : 'fadeInScale 0.2s ease-out forwards'
              }}
            >
              <span className={`inline-flex items-center gap-1 px-2 py-1 ${jobColors.bg} ${jobColors.text} rounded-full text-xs border-2 ${jobColors.border} transition-all duration-500 ease-in-out`}>
                {tool.name}
                <button
                  onClick={() => removeTool(index)}
                  className="hover:text-red-600 transition-colors"
                  disabled={removingTools.has(index)}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </span>
            </div>
          ))}
        </div>
        {errors.tools && (
          <p className="text-red-400 text-xs mt-1">{errors.tools}</p>
        )}
      </div>

      {/* Project Overview */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          Project Overview
          <Tooltip id="overview" text="Provide a comprehensive description of your project including goals, requirements, deliverables, timeline, and any specific instructions. The more detail you provide, the better proposals you'll receive.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        <textarea
          value={formData.projectOverview}
          onChange={(e) => updateFormData({ projectOverview: e.target.value })}
          rows={4}
          className={`w-full px-3 py-2 bg-white/5 border rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white resize-none ${
            errors.projectOverview ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder="Provide a detailed overview of your project requirements, goals, and any specific instructions..."
        />
        {errors.projectOverview && (
          <p className="text-red-400 text-xs mt-1">{errors.projectOverview}</p>
        )}
      </div>

      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeOutSlide {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.8);
          }
        }
        
        @keyframes fadeInStagger {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Stpone;