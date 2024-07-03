import React, { useState } from 'react';
import './MyJobs.css';  // Import the CSS file for page styles
import JobPostingForm from './JobPostingForm';

function MyJobs() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  return (
    <div>
      {isFormOpen ? (
        <JobPostingForm closeForm={toggleForm} />
      ) : (
        <div>
          <button onClick={toggleForm} className="open-form-button">
            Create Job Post
          </button>
          {/* Other content of MyJobs component */}
        </div>
      )}
    </div>
  );
}

export default MyJobs;
