import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { app, firestore, auth } from "../../firebase";
import "./MyJobs.css";
const MyJobs = ({ currentUser }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [jobType, setJobType] = useState("");

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentUser } = auth;

    const newJob = {
      jobTitle: e.target.jobTitle.value,
      jobType: e.target.jobType.value,
      jobDescription: e.target.jobDescription.value,
      tags: e.target.tags.value.split(","),
      userId: currentUser.uid,
    };

    // Add additional fields based on job type
    if (jobType === "Assist" || jobType === "Bounty") {
      newJob.compensation = e.target.compensation.value;
      newJob.jobCancelDateTime = e.target.jobCancelDateTime.value;
    } else if (jobType === "Auction") {
      newJob.startingBid = e.target.startingBid.value;
      newJob.auctionStartDateTime = e.target.auctionStartDateTime.value;
      newJob.auctionStopDateTime = e.target.auctionStopDateTime.value;
    } else if (jobType === "Challenge") {
      newJob.compensation = e.target.compensation.value;
      newJob.submissionDeadline = e.target.submissionDeadline.value;
    }

    // Add the new job to the "jobs" collection in Firestore
    const docRef = await addDoc(collection(firestore, "jobs"), newJob);
    console.log("Job created with ID:", docRef.id);

    closePopup();
  };


  return (
    <div>
      <h1 className="CreateJob">My Jobs</h1>
      <button onClick={openPopup} className="PosterButton">Post Job</button>

      {isPopupOpen && (
        <div className="popup">
          <h1 className="PopupHeading">Create a New Job</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="jobTitle">Job Title</label>
            <input type="text" id="jobTitle" name="jobTitle" />

            <label htmlFor="jobType">Job Type</label>
            <select id="jobType" name="jobType" onChange={(e) => setJobType(e.target.value)}>
              <option value="">Select a job type</option>
              <option value="Assist">Assist</option>
              <option value="Bounty">Bounty</option>
              <option value="Auction">Auction</option>
              <option value="Challenge">Challenge</option>
            </select>

            <label htmlFor="jobDescription">Job Description</label>
            <textarea id="jobDescription" name="jobDescription"></textarea>

            <label htmlFor="tags">Tags</label>
            <input type="text" id="tags" name="tags" placeholder="Enter tags separated by commas" />

            {jobType === "Assist" && (
              <>
                <label htmlFor="compensation">Compensation</label>
                <input type="number" id="compensation" name="compensation" />

                <label htmlFor="jobCancelDateTime">Job Cancel Date and Time</label>
                <input type="datetime-local" id="jobCancelDateTime" name="jobCancelDateTime" />
              </>
            )}

            {jobType === "Bounty" && (
              <>
                <label htmlFor="compensation">Compensation</label>
                <input type="number" id="compensation" name="compensation" />

                <label htmlFor="jobCancelDateTime">Job Cancel Date and Time</label>

                <input type="datetime-local" id="jobCancelDateTime" name="jobCancelDateTime" />
              </>
            )}

            {jobType === "Auction" && (
              <>
                <label htmlFor="startingBid">Starting Bid</label>
                <input type="number" id="startingBid" name="startingBid" />

                <label htmlFor="auctionStartDateTime">Auction Start Date and Time</label>
                <input type="datetime-local" id="auctionStartDateTime" name="auctionStartDateTime" />

                <label htmlFor="auctionStopDateTime">Auction Stop Date and Time</label>
                <input type="datetime-local" id="auctionStopDateTime" name="auctionStopDateTime" />
              </>
            )}

            {jobType === "Challenge" && (
              <>
                <label htmlFor="compensation">Compensation</label>
                <input type="number" id="compensation" name="compensation" />

                <label htmlFor="submissionDeadline">Submission Deadline</label>
                <input type="date" id="submissionDeadline" name="submissionDeadline" />
              </>
            )}

            <button type="submit">Submit</button>
            <button type="button" onClick={closePopup}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
