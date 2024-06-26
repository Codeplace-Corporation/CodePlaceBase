import React, { useState } from 'react';
import './MyJobs.css';
import JobPostingForm from './JobPostingForm';

function MyJobs() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  return (
    <div>
      <button onClick={toggleForm} className="open-form-button">
        Create Job Post
      </button>
      {isFormOpen && <JobPostingForm closeForm={toggleForm} />}
    </div>
  );
}

export default MyJobs;
