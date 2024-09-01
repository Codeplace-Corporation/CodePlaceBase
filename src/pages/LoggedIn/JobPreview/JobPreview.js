import React, { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../../../firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import './JobPreview.css';

const JobPreview = ({ job, setCurrentPage }) => {
  const [jobData, setJobData] = useState(job);
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const fetchJob = async () => {
      if (!job || !job.id) {
        console.error("No job data provided");
        setError("No job data provided");
        setLoading(false);
        return;
      }

      try {
        const jobDoc = await getDoc(doc(firestore, 'activeJobs', job.id));
        if (jobDoc.exists()) {
          console.log("Fetched job data:", jobDoc.data());
          setJobData({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          console.log('No such job in Firestore, using provided data');
          setJobData(job);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Error fetching job: ' + error.message);
        setJobData(job); // Fallback to provided data
      } finally {
        setLoading(false);
      }
    };

    if (!jobData) {
      fetchJob();
    }
  }, [job]);

  const handleApply = async () => {
    if (!auth.currentUser) {
      setApplyStatus('Please log in to apply');
      return;
    }

    try {
      const jobRef = doc(firestore, 'activeJobs', jobData.id);
      await updateDoc(jobRef, {
        applicants: arrayUnion(auth.currentUser.uid)
      });
      setApplyStatus('Application submitted successfully!');
    } catch (error) {
      console.error("Error applying to job:", error);
      setApplyStatus('Error submitting application. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setCurrentPage('/JobSearch')} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Job Search
        </button>
      </div>
    );
  }

  if (!jobData) {
    return <div className="not-found">Job not found</div>;
  }

  return (
    <div className="job-preview">
      <button onClick={() => setCurrentPage('/JobSearch')} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Job Search
      </button>
      <h1>{jobData.projectTitle || 'Untitled Project'}</h1>
      <p><strong>Posted by:</strong> {jobData.postedBy || 'Unknown'}</p>
      <p><strong>Job Type:</strong> {jobData.selectedJobPostType || 'Not specified'}</p>
      <p><strong>Compensation:</strong> {jobData.compensation || 'Not specified'}</p>
      <p><strong>Estimated Project Length:</strong> {jobData.estimatedProjectLength || 'Not specified'}</p>
      <h2>Project Description</h2>
      <p>{jobData.projectDescription || 'No description provided.'}</p>
      <h2>Required Tools</h2>
      <ul>
        {jobData.tools && jobData.tools.length > 0 ? (
          jobData.tools.map((tool, index) => (
            <li key={index}>{tool.name}</li>
          ))
        ) : (
          <li>No specific tools mentioned</li>
        )}
      </ul>
      <h2>Tags</h2>
      <div className="job-tags">
        {jobData.tags && jobData.tags.length > 0 ? (
          jobData.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))
        ) : (
          <span>No tags</span>
        )}
      </div>
      <button onClick={handleApply} className="apply-button">Apply Now</button>
      {applyStatus && <p className="apply-status">{applyStatus}</p>}
    </div>
  );
};

export default JobPreview;