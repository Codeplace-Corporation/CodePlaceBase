import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faFileAlt,
  faArrowLeft,
  faCheckCircle,
  faHandshake,
  faFileContract,
  faTrophy,
  faGavel,
  faCrosshairs,
  faCode
} from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface StpsevenProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
  onSubmit: () => void;
  isSubmitting: boolean;
  currentUser?: any;
  onBack?: () => void;
}

const Stpseven: React.FC<StpsevenProps> = ({ 
  formData, 
  updateFormData, 
  errors, 
  onSubmit, 
  isSubmitting,
  currentUser,
  onBack
}) => {
  const [agreement1, setAgreement1] = useState(false);
  const [agreement2, setAgreement2] = useState(false);
  const [agreement3, setAgreement3] = useState(false);

  // Check if all agreements are accepted
  const allAgreementsChecked = agreement1 && agreement2 && agreement3;
  const isAuthenticated = !!currentUser?.email;

  const handleSubmit = () => {
    if (!isAuthenticated) {
      alert('You must be logged in to post a job.');
      return;
    }
    if (!allAgreementsChecked) {
      alert('Please agree to all terms before proceeding.');
      return;
    }
    onSubmit();
  };

  const getJobTypeTheme = () => {
    switch (formData.selectedJobPostType) {
      case 'Auction':
        return {
          color: 'text-orange-400',
          bgColor: 'from-orange-900/20 to-amber-900/20',
          borderColor: 'border-orange-500/30',
          iconBg: 'bg-orange-500/20',
          icon: faGavel,
          tagBg: 'bg-orange-500/20',
          tagText: 'text-orange-300'
        };
      case 'Bounty':
        return {
          color: 'text-purple-400',
          bgColor: 'from-purple-900/20 to-pink-900/20',
          borderColor: 'border-purple-500/30',
          iconBg: 'bg-purple-500/20',
          icon: faCrosshairs,
          tagBg: 'bg-purple-500/20',
          tagText: 'text-purple-300'
        };
      case 'Contract':
        return {
          color: 'text-blue-400',
          bgColor: 'from-blue-900/20 to-cyan-900/20',
          borderColor: 'border-blue-500/30',
          iconBg: 'bg-blue-500/20',
          icon: faFileContract,
          tagBg: 'bg-blue-500/20',
          tagText: 'text-blue-300'
        };
      case 'Challenge':
        return {
          color: 'text-green-400',
          bgColor: 'from-green-900/20 to-emerald-900/20',
          borderColor: 'border-green-500/30',
          iconBg: 'bg-green-500/20',
          icon: faTrophy,
          tagBg: 'bg-green-500/20',
          tagText: 'text-green-300'
        };
      default:
        return {
          color: 'text-blue-400',
          bgColor: 'from-blue-900/20 to-cyan-900/20',
          borderColor: 'border-blue-500/30',
          iconBg: 'bg-blue-500/20',
          icon: faFileContract,
          tagBg: 'bg-blue-500/20',
          tagText: 'text-blue-300'
        };
    }
  };

  const theme = getJobTypeTheme();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl shadow-2xl border border-white/10 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FontAwesomeIcon icon={theme.icon} className={`${theme.color} text-2xl`} />
            <h1 className="text-3xl font-bold text-white">Confirm & Post Job</h1>
          </div>
          <p className="text-white/70 text-sm">Review your job details and agree to terms</p>
        </div>

        {/* Job Info Card */}
        <div className={`bg-gradient-to-r ${theme.bgColor} border ${theme.borderColor} rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 flex items-center justify-center ${theme.iconBg} rounded-lg`}>
              <FontAwesomeIcon icon={theme.icon} className={`text-xl ${theme.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Job Summary</h2>
              <p className="text-white/70 text-sm">Review your job details</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs font-medium">Job Title</label>
                <p className="text-white font-semibold text-base">{formData.projectTitle || 'Untitled Job'}</p>
              </div>
              
              <div>
                <label className="text-white/60 text-xs font-medium">Job Type</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${theme.color} bg-opacity-20`}>
                    {formData.selectedJobPostType || 'Not specified'}
                  </span>
                  {formData.JobSubType && (
                    <span className="text-white/70 text-xs">• {formData.JobSubType}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium">Category</label>
                <p className="text-white text-sm">{formData.projectType || 'Not specified'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-xs font-medium">Project Length</label>
                <p className="text-white text-sm">{formData.estimatedProjectLength || 'Not specified'}</p>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium">Tools Required</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.tools?.slice(0, 2).map((tool, index) => (
                    <span key={index} className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/80">
                      {tool.name}
                    </span>
                  ))}
                  {formData.tools && formData.tools.length > 2 && (
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                      +{formData.tools.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.tags?.slice(0, 2).map((tag, index) => (
                    <span key={index} className={`px-1.5 py-0.5 ${theme.tagBg} rounded text-xs ${theme.tagText}`}>
                      {tag}
                    </span>
                  ))}
                  {formData.tags && formData.tags.length > 2 && (
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                      +{formData.tags.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faHandshake} className="text-green-400 text-lg" />
            <h3 className="text-lg font-bold text-white">Terms & Agreements</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                id="agreement1" 
                checked={agreement1} 
                onChange={e => setAgreement1(e.target.checked)} 
                className="mt-0.5 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2" 
              />
              <div className="flex-1">
                <label htmlFor="agreement1" className="text-white font-medium cursor-pointer flex items-center gap-2 text-sm">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 text-xs" />
                  Service Agreement
                </label>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">
                  I agree to CodePlace's service terms and acknowledge that this job will be published publicly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                id="agreement2" 
                checked={agreement2} 
                onChange={e => setAgreement2(e.target.checked)} 
                className="mt-0.5 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2" 
              />
              <div className="flex-1">
                <label htmlFor="agreement2" className="text-white font-medium cursor-pointer flex items-center gap-2 text-sm">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400 text-xs" />
                  Dispute Resolution
                </label>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">
                  I agree that CodePlace will act as the final arbitrator in any disputes between clients and developers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                id="agreement3" 
                checked={agreement3} 
                onChange={e => setAgreement3(e.target.checked)} 
                className="mt-0.5 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2" 
              />
              <div className="flex-1">
                <label htmlFor="agreement3" className="text-white font-medium cursor-pointer flex items-center gap-2 text-sm">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-purple-400 text-xs" />
                  Terms of Service & Privacy Policy
                </label>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">
                  I agree to CodePlace's Terms of Service and Privacy Policy, and confirm all information is accurate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all duration-200 font-medium text-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isAuthenticated || !allAgreementsChecked}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              isSubmitting || !isAuthenticated || !allAgreementsChecked
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </div>
            ) : !isAuthenticated ? (
              'Sign In Required'
            ) : !allAgreementsChecked ? (
              'Agree to All Terms'
            ) : (
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} />
                Publish Job
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stpseven; 