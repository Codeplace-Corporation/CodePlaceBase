import React from 'react';
import './ProgressBar.css';

function ProgressBar({ step, totalSteps }) {
  const getProgressClass = (currentStep) => {
    if (currentStep < step) return 'completed';
    if (currentStep === step) return 'current';
    return '';
  };

  return (
    <div className="progress-bar">
      {[...Array(totalSteps)].map((_, index) => (
        <div key={index} className={`progress-step ${getProgressClass(index + 1)}`}>
          <div className="circle">{index + 1}</div>
          {index < totalSteps - 1 && <div className="line"></div>}
        </div>
      ))}
    </div>
  );
}

export default ProgressBar;
