import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign,
  faCalendarAlt,
  faTasks,
  faCheckCircle,
  faPlus,
  faTrash,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../JobPostingForm';

interface StepFiveProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

interface Milestone {
  title: string;
  amount: number;
  description: string;
  dueDate?: string;
}

const StepFive: React.FC<StepFiveProps> = ({ formData, updateFormData, errors }) => {
  const [paymentType, setPaymentType] = useState<'completion' | 'milestone'>(
    formData.compensation === 'milestones' ? 'milestone' : 'completion'
  );
  
  const [milestones, setMilestones] = useState<Milestone[]>(
    formData.milestones || [
      { title: 'Project Setup', description: '', amount: 25, dueDate: '' },
      { title: 'Development Phase', description: '', amount: 50, dueDate: '' },
      { title: 'Final Delivery', description: '', amount: 25, dueDate: '' }
    ]
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
  
  // Check if job type supports milestone payments
  const supportsMilestones = formData.selectedJobPostType === 'Auction' || formData.selectedJobPostType === 'Contract';
  
  // Force completion payment for non-supporting types
  React.useEffect(() => {
    if (!supportsMilestones && paymentType === 'milestone') {
      setPaymentType('completion');
      updateFormData({ compensation: 'completion' });
    }
  }, [supportsMilestones, paymentType, updateFormData]);

  const handlePaymentTypeChange = (type: 'completion' | 'milestone') => {
    setPaymentType(type);
    updateFormData({ 
      compensation: type === 'milestone' ? 'milestones' : 'completion',
      milestones: type === 'milestone' ? milestones : undefined
    });
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      title: `Milestone ${milestones.length + 1}`,
      description: '',
      amount: 0,
      dueDate: ''
    };
    const updatedMilestones = [...milestones, newMilestone];
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return; // Keep at least one milestone
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = milestones.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    );
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
  };

  const getTotalPercentage = () => {
    return milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  };

  const isValidPercentage = () => {
    const total = getTotalPercentage();
    return total === 100;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faDollarSign} className={colors.primary} />
          Payment Structure
        </h2>
        <p className="text-white/70 text-sm">
          Configure how and when participants will be compensated for their work.
        </p>
      </div>

      {/* Payment Type Selection */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-lg">Payment Schedule</h3>
        
        {/* Payment Upon Completion */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            paymentType === 'completion' 
              ? `${colors.bg} ${colors.border} border-2` 
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          onClick={() => handlePaymentTypeChange('completion')}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
              paymentType === 'completion' 
                ? `${colors.border.replace('border-', 'border-')} ${colors.primary.replace('text-', 'bg-').replace('-400', '-500')}` 
                : 'border-white/30 bg-transparent'
            }`}>
              {paymentType === 'completion' && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className={colors.primary} />
                Payment Upon Completion
              </h4>
              <p className="text-white/60 text-sm mt-1">
                Full payment is released when the project is completed and approved.
              </p>
              <div className="mt-2 text-xs text-white/50">
                ✓ Available for all job types
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Payments */}
        <div 
          className={`p-4 border rounded-lg transition-all ${
            supportsMilestones 
              ? `cursor-pointer ${paymentType === 'milestone' 
                  ? `${colors.bg} ${colors.border} border-2` 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`
              : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
          }`}
          onClick={() => supportsMilestones && handlePaymentTypeChange('milestone')}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all ${
              paymentType === 'milestone' && supportsMilestones
                ? `${colors.border.replace('border-', 'border-')} ${colors.primary.replace('text-', 'bg-').replace('-400', '-500')}` 
                : 'border-white/30 bg-transparent'
            }`}>
              {paymentType === 'milestone' && supportsMilestones && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FontAwesomeIcon icon={faTasks} className={supportsMilestones ? colors.primary : 'text-white/30'} />
                Milestone Payments
              </h4>
              <p className="text-white/60 text-sm mt-1">
                Break down payment into multiple milestones for better project management.
              </p>
              <div className="mt-2 text-xs text-white/50">
                {supportsMilestones 
                  ? '✓ Available for Contracts and Auctions'
                  : '✗ Only available for Contracts and Auctions'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Configuration */}
      {paymentType === 'milestone' && supportsMilestones && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-lg">Configure Milestones</h3>
            <button
              onClick={addMilestone}
              className={`px-3 py-2 ${colors.primary.replace('text-', 'bg-').replace('-400', '-500')} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2`}
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Milestone
            </button>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center text-sm font-medium text-white`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Milestone Name</label>
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                          placeholder="Enter milestone name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Description (Optional)</label>
                        <textarea
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
                          rows={2}
                          placeholder="Describe what needs to be completed"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-white/70 text-sm mb-1">Payment Percentage</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 pr-8"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">%</span>
                          </div>
                        </div>
                        
                        {milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(index)}
                            className="mt-6 w-10 h-10 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Percentage Validation */}
          <div className={`p-3 rounded-lg border ${
            isValidPercentage() 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon 
                icon={faInfoCircle} 
                className={isValidPercentage() ? 'text-green-400' : 'text-red-400'} 
              />
              <span className={`text-sm font-medium ${isValidPercentage() ? 'text-green-300' : 'text-red-300'}`}>
                Total: {getTotalPercentage()}% 
                {isValidPercentage() ? ' ✓' : ' (Must equal 100%)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepFive;