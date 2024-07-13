import React, { useEffect, useState } from 'react';
import { firestore } from '../../../firebase';
import { doc, getDoc } from '@firebase/firestore';
import './JobDetails.css';

const JobDetails = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDocRef = doc(firestore, 'jobs', jobId);
        const jobDoc = await getDoc(jobDocRef);
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        } else {
          setError('Job not found');
        }
      } catch (error) {
        setError('Error fetching job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="job-details-container">
      <h1>{job.projectTitle}</h1>
      <p><strong>Company Name:</strong> {job.companyName}</p>
      <p><strong>Project Overview:</strong> {job.projectOverview}</p>
      <p><strong>Project Type:</strong> {job.projectType}</p>
      <p><strong>Tools:</strong> {job.tools.map(tool => tool.name).join(', ')}</p>
      <p><strong>Tags:</strong> {job.tags.join(', ')}</p>
      <p><strong>File Permissions:</strong> {job.filePermissions}</p>
      <p><strong>Selected Job Post Type:</strong> {job.selectedJobPostType}</p>
      {job.selectedJobPostType === 'Auction' && (
        <>
          <p><strong>Auction Starting Bid:</strong> {job.auctionStartingBid}</p>
          <p><strong>Auction Start Time:</strong> {job.auctionStartTime}</p>
          <p><strong>Auction Length:</strong> {job.auctionLength}</p>
        </>
      )}
      {job.selectedJobPostType === 'Bounty' && (
        <>
          <p><strong>Bounty Amount:</strong> {job.bountyAmount}</p>
          <p><strong>Project Start:</strong> {job.projectStart}</p>
          <p><strong>Project End:</strong> {job.projectEnd}</p>
        </>
      )}
      {job.selectedJobPostType === 'Contract' && (
        <>
          <p><strong>Contract Amount:</strong> {job.compensation}</p>
          <p><strong>Contract Apply Period Start:</strong> {job.contractApplyPeriodStart}</p>
          <p><strong>Contract Apply Period End:</strong> {job.contractApplyPeriodEnd}</p>
        </>
      )}
      {job.selectedJobPostType === 'Challenge' && (
        <>
          <p><strong>Challenge Amount:</strong> {job.challengeAmount}</p>
          <p><strong>Challenge Start Time:</strong> {job.challengeStartTime}</p>
        </>
      )}
      <p><strong>Project Start Time:</strong> {job.projectStartTime}</p>
      <p><strong>Project End Time:</strong> {job.projectEndTime}</p>
      <p><strong>Project Length:</strong> {job.projectLength}</p>
      <p><strong>Included Revisions:</strong> {job.includedRevisions}</p>
      <p><strong>Extra Paid Revisions:</strong> {job.extraPaidRevisions}</p>
      <p><strong>Project Requirements and Deliverables:</strong> {job.requirements}</p>
      <p><strong>Project Milestones:</strong> {job.milestones}</p>
      <p><strong>Amount of Prepaid Revisions:</strong> {job.prepaidRevisions}</p>
      <p><strong>Cost of Revisions:</strong> {job.revisionCost}</p>
      <p><strong>Late Discount:</strong> {job.lateDiscount}</p>
      <p><strong>When Should the Post Go Live?</strong> {job.postLiveDate}</p>
      <p><strong>Job Closed Timing:</strong> {job.jobClosedTiming}</p>
    </div>
  );
};

export default JobDetails;
