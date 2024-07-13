import React, { useState } from 'react';
import './MyJobs.css';  // Import the CSS file for page styles
import JobPostingForm from './JobPostingForm';
import { firestore, collection, addDoc } from '../../../firebase';

function MyJobs() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const createTenJobs = async () => {
    const jobData = {
      projectTitle: "Sample Project Title",
      companyName: "Sample Company Name",
      projectOverview: "Sample project overview.",
      projectType: "Website",
      tools: [{ name: "React" }, { name: "Firebase" }],
      tags: ["sample", "project"],
      filePermissions: 'public',
      selectedJobPostType: "Auction",
      auctionStartingBid: "1000",
      auctionStartTime: new Date().toISOString(),
      auctionLength: "7d",
      bountyAmount: "5000",
      projectStart: new Date().toISOString(),
      projectEnd: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      compensation: "10000",
      contractApplyPeriodStart: new Date().toISOString(),
      contractApplyPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      challengeAmount: "2000",
      challengeStartTime: new Date().toISOString(),
      projectStartTime: new Date().toISOString(),
      projectEndTime: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      projectLength: "30d",
      includedRevisions: "3",
      extraPaidRevisions: "2",
      requirements: "Sample requirements",
      milestones: "Sample milestones",
      prepaidRevisions: "1",
      revisionCost: "100",
      lateDiscount: "50",
      postLiveDate: new Date().toISOString(),
      jobClosedTiming: "7d",
      UserId:"QjoOcxsWCfOQgfUQAGWDm3CESlH3",
    };

    try {
      for (let i = 0; i < 10; i++) {
        await addDoc(collection(firestore, 'jobs'), jobData);
      }
      alert("10 jobs created successfully!");
    } catch (error) {
      console.error("Error creating jobs: ", error);
      alert("Error creating jobs");
    }
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
          <button onClick={createTenJobs} className="create-ten-jobs-button">
            Create 10 Jobs
          </button>
          {/* Other content of MyJobs component */}
        </div>
      )}
    </div>
  );
}

export default MyJobs;
