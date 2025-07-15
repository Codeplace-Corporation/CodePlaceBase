import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDollarSign,
  faCalendarAlt,
  faTasks,
  faCheckCircle,
  faPlus,
  faTrash,
  faInfoCircle,
  faPen
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface StpsixProps {
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

const Stpsix: React.FC<StpsixProps> = ({ formData, updateFormData, errors }) => {
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

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    const remaining = getRemainingPercentage();
    const newMilestone: Milestone = {
      title: `Milestone ${milestones.length + 1}`,
      description: '',
      amount: Math.max(0, Math.min(remaining, 100)),
      dueDate: ''
    };
    const updatedMilestones = [...milestones, newMilestone];
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
    setEditingIndex(updatedMilestones.length - 1); // Open new milestone in edit mode
  };

  const removeMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
    setEditingIndex(null);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = milestones.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    );
    setMilestones(updatedMilestones);
    updateFormData({ milestones: updatedMilestones });
  };

  const saveMilestone = (index: number) => {
    setEditingIndex(null);
    updateFormData({ milestones });
  };

  const editMilestone = (index: number) => {
    setEditingIndex(index);
  };

  const cancelEditMilestone = () => {
    setEditingIndex(null);
  };

  const getTotalPercentage = () => {
    return milestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  };

  const isValidPercentage = () => {
    const total = getTotalPercentage();
    return total === 100;
  };

  // Helper to get remaining percentage
  const getRemainingPercentage = () => 100 - getTotalPercentage();

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

      {/* Milestone List */}
      {paymentType === 'milestone' && (
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg flex items-center gap-2">
            <FontAwesomeIcon icon={faTasks} className={colors.primary} />
            Milestones
          </h3>
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`transition-all duration-200 shadow-lg rounded-xl border ${editingIndex === index ? colors.border + ' border-2' : 'border-white/10'} bg-white/5 hover:shadow-xl group`}
            >
              <div className={editingIndex === index ? "p-5" : "px-4 py-2"}>
                {editingIndex === index ? (
                  <>
                    <div className="space-y-4 mb-2">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Title</label>
                        <input
                          className={`w-full px-4 py-2 rounded-lg bg-white/10 text-white border transition-all placeholder-white/40 focus:outline-none focus:ring-2 ${colors.primary.replace('text-', 'focus:ring-').replace('-400', '-400')} border-white/20`}
                          placeholder="Milestone Title"
                          value={milestone.title}
                          onChange={e => updateMilestone(index, 'title', e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Percentage of Total Compensation</label>
                        <div className="relative">
                          <input
                            className={`w-full px-4 py-2 rounded-lg bg-white/10 text-white border transition-all placeholder-white/40 focus:outline-none focus:ring-2 ${colors.primary.replace('text-', 'focus:ring-').replace('-400', '-400')} border-white/20`}
                            placeholder="Amount"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={100}
                            value={milestone.amount}
                            onChange={e => {
                              let val = Number(e.target.value.replace(/[^0-9]/g, ''));
                              if (isNaN(val)) val = 0;
                              val = Math.max(0, Math.min(val, 100));
                              updateMilestone(index, 'amount', val);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">%</span>
                        </div>
                        <div className="text-xs text-white/50 mt-1">This is the portion of the total project payment assigned to this milestone.</div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Due Date (optional)</label>
                        <input
                          className={`w-full px-4 py-2 rounded-lg bg-white/10 text-white border transition-all placeholder-white/40 focus:outline-none focus:ring-2 ${colors.primary.replace('text-', 'focus:ring-').replace('-400', '-400')} border-white/20`}
                          placeholder="Due Date (optional)"
                          type="date"
                          value={milestone.dueDate || ''}
                          onChange={e => updateMilestone(index, 'dueDate', e.target.value)}
                        />
                        <div className="text-xs text-white/50 mt-1">This field is optional. You can leave it blank if there is no specific deadline for this milestone.</div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Description</label>
                        <textarea
                          className={`w-full px-4 py-2 rounded-lg bg-white/10 text-white border transition-all placeholder-white/40 focus:outline-none focus:ring-2 ${colors.primary.replace('text-', 'focus:ring-').replace('-400', '-400')} border-white/20`}
                          placeholder="Description (optional)"
                          value={milestone.description}
                          onChange={e => updateMilestone(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                          </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        className={`px-5 py-2 rounded-lg font-semibold shadow-sm transition-all ${colors.bg} ${colors.primary} hover:opacity-90`}
                        onClick={() => saveMilestone(index)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="px-5 py-2 rounded-lg font-semibold shadow-sm bg-gray-700 text-white hover:bg-gray-600 transition-all"
                        onClick={cancelEditMilestone}
                        type="button"
                      >
                        Cancel
                      </button>
                        </div>
                  </>
                ) : (
                  <div className="flex flex-row items-center gap-2 min-h-[40px]">
                    <div className="flex-1 font-semibold text-white text-base tracking-tight truncate">{milestone.title}</div>
                    <div className={`w-20 text-right font-bold ${colors.primary}`}>{milestone.amount}%</div>
                    {milestone.dueDate && <div className="w-32 text-white/70 text-xs text-right ml-2 truncate">Due: {milestone.dueDate}</div>}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        className={`p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 ${colors.primary.replace('text-', 'focus:ring-').replace('-400', '-400')}`}
                        onClick={() => editMilestone(index)}
                        type="button"
                        title="Edit Milestone"
                      >
                        <FontAwesomeIcon icon={faPen} className={colors.primary + ' text-base'} />
                      </button>
                          <button
                        className="p-2 rounded-full hover:bg-red-600/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={() => removeMilestone(index)}
                        type="button"
                        title="Delete Milestone"
                          >
                        <FontAwesomeIcon icon={faTrash} className="text-red-500 text-base" />
                          </button>
                    </div>
                  </div>
                )}
                {editingIndex !== index && milestone.description && (
                  <div className="text-white/60 text-sm mb-2 mt-1">{milestone.description}</div>
                )}
              </div>
              </div>
            ))}
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md mt-4 transition-all ${colors.bg} ${colors.primary} hover:opacity-90`}
            onClick={addMilestone}
            type="button"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Milestone
          </button>
          <div className="mt-2 text-xs text-white/60">
            Total: <span className={isValidPercentage() ? 'text-green-400' : 'text-red-400'}>{getTotalPercentage()}%</span> (must total 100%)
          </div>
          {!isValidPercentage() && (
            <div className="mt-1 text-sm text-red-400 flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} />
              The total percentage must equal 100%.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Stpsix;