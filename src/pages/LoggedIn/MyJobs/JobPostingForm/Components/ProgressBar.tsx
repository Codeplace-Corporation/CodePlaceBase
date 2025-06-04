import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;

  const stepLabels = [
    'Overview',
    'Type & Tools',
    'Job Type',
    'Details',
    'Deliverables',
    'Timeline',
    'Preview'
  ];

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-steps">
        {stepLabels.map((label, index) => (
          <div 
            key={index}
            className={`progress-step ${index < step ? 'completed' : ''} ${index === step - 1 ? 'active' : ''}`}
          >
            <div className="progress-step-circle">
              {index + 1}
            </div>
            <div className="progress-step-label">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;