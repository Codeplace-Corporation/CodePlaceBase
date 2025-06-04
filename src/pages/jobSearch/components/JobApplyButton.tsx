import { useNavigate } from 'react-router-dom';
import React from 'react';

interface Job {
  id: string;
  projectTitle: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: string;
  compensation: string;
  estimatedProjectLength: string;
  projectDescription: string;
  [key: string]: any; // For any additional job properties
}

interface JobApplyButtonProps {
  jobId: string;
  job: Job;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const JobApplyButton: React.FC<JobApplyButtonProps> = ({ 
  jobId, 
  job, 
  variant = 'primary', 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleApplyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/jobs/${jobId}/apply`, { state: { job } });
  };

  const variants = {
    primary: 'bg-[#00FF00] hover:bg-[#00FF00]/90 text-black font-medium',
    secondary: 'bg-black hover:bg-black/80 text-white/70 hover:text-white'
  } as const;

  return (
    <button 
      onClick={handleApplyClick}
      className={`px-6 py-2 rounded-lg transition-colors ${variants[variant]} ${className}`}
    >
      Apply Now
    </button>
  );
};

export default JobApplyButton;