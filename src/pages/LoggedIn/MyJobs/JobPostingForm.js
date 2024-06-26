import React from 'react';
import './MyJobs.css';  // Import the CSS file

function JobPostingForm({ closeForm }) {
  return (
    <div className="job-posting-form">
      <button onClick={closeForm} className="close-form-button">
        Close
      </button>
      <form>
        {/* Add your lengthy form fields here */}
        <div>
          <label>Job Title</label>
          <input type="text" name="jobTitle" />
        </div>
        <div>
          <label>Job Description</label>
          <textarea name="jobDescription"></textarea>
        </div>
        {/* Add more form fields as needed */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default JobPostingForm;
