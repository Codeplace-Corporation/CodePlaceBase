import React, { useEffect, useState } from 'react';
import { getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../../../firebase';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const JobPreview = ({ jobId, setCurrentPage }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyStatus, setApplyStatus] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const fetchJob = async () => {
      console.log("Fetching job with ID:", jobId);

      if (!jobId) {
        console.error("No job ID provided");
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        const jobDoc = await getDoc(doc(firestore, 'activeJobs', jobId));
        if (jobDoc.exists()) {
          console.log("Job data:", jobDoc.data());
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          console.log('No such job!');
          setError('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setError('Error fetching job: ' + error.message);
      }
      setLoading(false);
    };

    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    if (!auth.currentUser) {
      setApplyStatus('Please log in to apply');
      return;
    }

    try {
      const jobRef = doc(firestore, 'activeJobs', job.id);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setCurrentPage('/JobSearch')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Job Search
        </button>
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="job-preview">
      <button onClick={() => setCurrentPage('/JobSearch')} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Job Search
      </button>
      <h1>{job.projectTitle}</h1>
      <p><strong>Posted by:</strong> {job.postedBy}</p>
      <p><strong>Job Type:</strong> {job.selectedJobPostType}</p>
      <p><strong>Compensation:</strong> {job.compensation}</p>
      <p><strong>Estimated Project Length:</strong> {job.estimatedProjectLength}</p>
      <h2>Project Description</h2>
      <p>{job.projectDescription}</p>
      <h2>Required Tools</h2>
      <ul>
        {job.tools && job.tools.map((tool, index) => (
          <li key={index}>{tool.name}</li>
        ))}
      </ul>
      <h2>Tags</h2>
      <div className="job-tags">
        {job.tags && job.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      <button onClick={handleApply} className="apply-button">Apply Now</button>
      {applyStatus && <p className="apply-status">{applyStatus}</p>}
    </div>
  );
};

export default JobPreview;