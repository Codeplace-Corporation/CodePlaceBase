import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfoCircle, 
  faCheckCircle, 
  faClipboardList,
  faPlus,
  faTimes,
  faGavel,
  faUpload,
  faCode,
  faFileAlt,
  faTrophy,
  faFileContract,
  faUsers,
  faStar,
  faBullseye
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface StpfourProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const Stpfour: React.FC<StpfourProps> = ({ formData, updateFormData, errors }) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [deliverableInput, setDeliverableInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [removingDeliverables, setRemovingDeliverables] = useState<Set<number>>(new Set());
  const [removingRequirements, setRemovingRequirements] = useState<Set<number>>(new Set());

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
        return {
          primary: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          hoverBg: 'hover:bg-purple-500/20',
          focus: 'focus:ring-purple-400'
        };
      case 'Auction':
        return {
          primary: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          hoverBg: 'hover:bg-orange-500/20',
          focus: 'focus:ring-orange-400'
        };
      case 'Challenge':
        return {
          primary: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          hoverBg: 'hover:bg-green-500/20',
          focus: 'focus:ring-green-400'
        };
      case 'Contract':
        return {
          primary: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          hoverBg: 'hover:bg-blue-500/20',
          focus: 'focus:ring-blue-400'
        };
      default:
        return {
          primary: 'text-white',
          bg: 'bg-white/10',
          border: 'border-white/30',
          hoverBg: 'hover:bg-white/20',
          focus: 'focus:ring-white'
        };
    }
  };

  const colors = getJobTypeColors();

  // Get job type specific content
  const getJobTypeContent = () => {
    switch (formData.selectedJobPostType) {
      case 'Bounty':
        return {
          deliverableTitle: 'Required Deliverables',
          deliverableIcon: faClipboardList,
          deliverableTooltip: 'Specify exactly what participants must submit to claim the bounty. Be clear and specific about file formats, content requirements, and any other submission criteria.',
          deliverableExample: '"Working source code with documentation", "Deployed live demo with URL", "Test suite with 80%+ coverage"',
          requirementTitle: 'Participation Requirements',
          requirementIcon: faGavel,
          requirementTooltip: 'Set specific requirements participants must meet before they can claim the bounty. This could include experience level, portfolio requirements, or other qualifications.',
          requirementExample: '"Minimum 2 years React experience", "Must provide portfolio of similar projects", "GitHub account required"'
        };
      case 'Auction':
        return {
          deliverableTitle: 'Project Deliverables',
          deliverableIcon: faBullseye,
          deliverableTooltip: 'Define what the winning bidder must deliver upon project completion. Be specific about formats, quality standards, and delivery methods.',
          deliverableExample: '"Complete responsive website", "Source code with documentation", "3 rounds of revisions included"',
          requirementTitle: 'Bidder Requirements',
          requirementIcon: faUsers,
          requirementTooltip: 'Set qualifications that bidders must meet to participate in your auction. This ensures only qualified contractors bid.',
          requirementExample: '"Minimum 5 completed projects", "Portfolio showcasing similar work", "Available to start within 1 week"'
        };
      case 'Challenge':
        return {
          deliverableTitle: 'Project Deliverables',
          deliverableIcon: faUpload,
          deliverableTooltip: 'Specify what participants must submit for their challenge entry. Include file formats, documentation requirements, and submission guidelines.',
          deliverableExample: '"Working prototype with source code", "Demo video (max 3 minutes)", "Technical documentation and setup instructions"',
          requirementTitle: 'Participation Requirements',
          requirementIcon: faUsers,
          requirementTooltip: 'Set eligibility requirements for challenge participants. This could include skill level, team size, or other qualifications.',
          requirementExample: '"Individual participation only", "Must be available for live demo", "Basic knowledge of the technology stack"'
        };
      case 'Contract':
        return {
          deliverableTitle: 'Project Deliverables',
          deliverableIcon: faFileContract,
          deliverableTooltip: 'Define the specific outputs and deliverables the contractor must provide. Include quality standards, formats, and delivery timelines.',
          deliverableExample: '"Fully functional web application", "Complete documentation and user guide", "Source code with comments and setup instructions"',
          requirementTitle: 'Contractor Requirements',
          requirementIcon: faCheckCircle,
          requirementTooltip: 'Set the qualifications and requirements contractors must meet to be considered for this position.',
          requirementExample: '"5+ years experience with required technologies", "Strong portfolio of similar projects", "Excellent English communication skills"'
        };
      default:
        return {
          deliverableTitle: 'Required Deliverables',
          deliverableIcon: faClipboardList,
          deliverableTooltip: 'Specify what must be delivered upon completion.',
          deliverableExample: '"Complete project with documentation"',
          requirementTitle: 'Requirements',
          requirementIcon: faCheckCircle,
          requirementTooltip: 'Set specific requirements for participants.',
          requirementExample: '"Experience with relevant technologies"'
        };
    }
  };

  const content = getJobTypeContent();

  // Handle deliverables
  const addDeliverable = () => {
    if (deliverableInput.trim() && !formData.requiredDeliverables?.includes(deliverableInput.trim()) && (formData.requiredDeliverables?.length || 0) < 15) {
      updateFormData({
        requiredDeliverables: [...(formData.requiredDeliverables || []), deliverableInput.trim()]
      });
      setDeliverableInput('');
    }
  };

  const removeDeliverable = (index: number) => {
    setRemovingDeliverables(prev => new Set(prev).add(index));
    setTimeout(() => {
      updateFormData({
        requiredDeliverables: (formData.requiredDeliverables || []).filter((_, i) => i !== index)
      });
      setRemovingDeliverables(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200);
  };

  // Handle requirements
  const addRequirement = () => {
    if (requirementInput.trim() && !formData.requirements?.includes(requirementInput.trim()) && (formData.requirements?.length || 0) < 15) {
      updateFormData({
        requirements: [...(formData.requirements || []), requirementInput.trim()]
      });
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setRemovingRequirements(prev => new Set(prev).add(index));
    setTimeout(() => {
      updateFormData({
        requirements: (formData.requirements || []).filter((_, i) => i !== index)
      });
      setRemovingRequirements(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Required Deliverables */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={content.deliverableIcon} className={colors.primary} />
          {content.deliverableTitle}
          <Tooltip id="deliverables" text={content.deliverableTooltip}>
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={deliverableInput}
            onChange={(e) => setDeliverableInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
            className={`flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 ${colors.focus}`}
            placeholder={`Add deliverable requirement (${(formData.requiredDeliverables?.length || 0)}/15 used)`}
            disabled={(formData.requiredDeliverables?.length || 0) >= 15}
            maxLength={100}
          />
          <button
            onClick={addDeliverable}
            className={`w-10 h-10 text-black rounded-full transition-colors flex items-center justify-center ${
              (formData.requiredDeliverables?.length || 0) >= 15 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-white/90'
            }`}
            disabled={(formData.requiredDeliverables?.length || 0) >= 15}
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>

        <div className="space-y-2">
          {(formData.requiredDeliverables || []).map((deliverable, index) => (
            <div
              key={`${deliverable}-${index}`}
              className={`transition-all duration-200 ${
                removingDeliverables.has(index) ? 'animate-fadeOutScale' : 'animate-fadeInScale'
              }`}
            >
              <div className={`flex items-center gap-3 px-3 py-2 ${colors.bg} ${colors.border} border rounded group ${colors.hoverBg} transition-colors`}>
                <FontAwesomeIcon icon={faCheckCircle} className={`${colors.primary} text-sm flex-shrink-0`} />
                <span className="text-white text-sm flex-1">{deliverable}</span>
                <button
                  onClick={() => removeDeliverable(index)}
                  className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                  disabled={removingDeliverables.has(index)}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {errors.requiredDeliverables && (
          <p className="text-red-400 text-xs mt-1">{errors.requiredDeliverables}</p>
        )}

        <div className="mt-2 text-white/60 text-xs">
          <span className="font-medium">Examples:</span> {content.deliverableExample}
        </div>
      </div>

      {/* Participation Requirements */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={content.requirementIcon} className={colors.primary} />
          {content.requirementTitle}
          <Tooltip id="requirements" text={content.requirementTooltip}>
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className={`flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 ${colors.focus}`}
            placeholder={`Add participation requirement (${(formData.requirements?.length || 0)}/15 used)`}
            disabled={(formData.requirements?.length || 0) >= 15}
            maxLength={100}
          />
          <button
            onClick={addRequirement}
            className={`w-10 h-10 text-black rounded-full transition-colors flex items-center justify-center ${
              (formData.requirements?.length || 0) >= 15 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-white hover:bg-white/90'
            }`}
            disabled={(formData.requirements?.length || 0) >= 15}
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>

        <div className="space-y-2">
          {(formData.requirements || []).map((requirement, index) => (
            <div
              key={`${requirement}-${index}`}
              className={`transition-all duration-200 ${
                removingRequirements.has(index) ? 'animate-fadeOutScale' : 'animate-fadeInScale'
              }`}
            >
              <div className={`flex items-center gap-3 px-3 py-2 ${colors.bg} ${colors.border} border rounded group ${colors.hoverBg} transition-colors`}>
                <FontAwesomeIcon icon={faCheckCircle} className={`${colors.primary} text-sm flex-shrink-0`} />
                <span className="text-white text-sm flex-1">{requirement}</span>
                <button
                  onClick={() => removeRequirement(index)}
                  className="flex-shrink-0 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                  disabled={removingRequirements.has(index)}
                >
                  <FontAwesomeIcon icon={faTimes} className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {errors.requirements && (
          <p className="text-red-400 text-xs mt-1">{errors.requirements}</p>
        )}

        <div className="mt-2 text-white/60 text-xs">
          <span className="font-medium">Examples:</span> {content.requirementExample}
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default Stpfour;