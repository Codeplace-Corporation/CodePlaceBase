import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { firestore, auth } from "../../firebase";
import './Jobpage.css';

const Jobpage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [jobType, setJobType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const getJobs = async () => {
      const q = query(collection(firestore, "jobs"));
      const querySnapshot = await getDocs(q);
      const jobList = [];
      querySnapshot.forEach((doc) => {
        jobList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobList);
    };
    getJobs();
  }, []);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;
    console.log("Current User:", currentUser); // Log the current user

    if (!currentUser) {
      console.error("No user is currently logged in.");
      return;
    }

    const newJob = {
      jobTitle: e.target.jobTitle.value,
      jobType: e.target.jobType.value,
      jobDescription: e.target.jobDescription.value,
      tags: e.target.tags.value.split(","),
      userId: currentUser.uid,
      userName: currentUser.displayName || "Anonymous", // Default to "Anonymous" if no display name
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
    try {
      const docRef = await addDoc(collection(firestore, "jobs"), newJob);
      console.log("Job created with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    closePopup();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  let filteredJobs = [...jobs];

  if (searchQuery !== "") {
    filteredJobs = filteredJobs.filter(job =>
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy !== "") {
    filteredJobs.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }

  return (
    <div className="jobpage-container">
      <h1 className="jobpage-heading">My Jobs</h1>
      <button className="jobpage-button" onClick={openPopup}>Post Job</button>

      <input
        className="jobpage-input"
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />

      <button className="jobpage-button" onClick={handleFilterChange}>Filter</button>

      <select className="jobpage-input" onChange={handleSortChange}>
        <option value="">Sort by</option>
        <option value="jobTitle">Job Title</option>
        <option value="jobType">Job Type</option>
        <option value="compensation">Compensation</option>
        <option value="submissionDeadline">Submission Deadline</option>
      </select>

      {isPopupOpen && (
        <div className="jobpage-popup">
          <h1 className="jobpage-popup-heading">Create a New Job</h1>
          <form onSubmit={handleSubmit}>
            <label className="jobpage-form-label" htmlFor="jobTitle">Job Title</label>
            <input className="jobpage-input" type="text" id="jobTitle" name="jobTitle" required />

            <label className="jobpage-form-label" htmlFor="jobType">Job Type</label>
            <select className="jobpage-input" id="jobType" name="jobType" onChange={(e) => setJobType(e.target.value)} required>
              <option value="">Select a job type</option>
              <option value="Assist">Assist</option>
              <option value="Bounty">Bounty</option>
              <option value="Auction">Auction</option>
              <option value="Challenge">Challenge</option>
            </select>

            <label className="jobpage-form-label" htmlFor="jobDescription">Job Description</label>
            <textarea className="jobpage-input" id="jobDescription" name="jobDescription" required></textarea>

            <label className="jobpage-form-label" htmlFor="tags">Tags</label>
            <input className="jobpage-input" type="text" id="tags" name="tags" placeholder="Enter tags separated by commas" required />

            {jobType === "Assist" && (
              <>
                <label className="jobpage-form-label" htmlFor="compensation">Compensation</label>
                <input className="jobpage-input" type="number" id="compensation" name="compensation" required />

                <label className="jobpage-form-label" htmlFor="jobCancelDateTime">Job Cancel Date and Time</label>
                <input className="jobpage-date-time-input" type="datetime-local" id="jobCancelDateTime" name="jobCancelDateTime" required />
              </>
            )}

            {jobType === "Bounty" && (
              <>
                <label className="jobpage-form-label" htmlFor="compensation">Compensation</label>
                <input className="jobpage-input" type="number" id="compensation" name="compensation" required />

                <label className="jobpage-form-label" htmlFor="jobCancelDateTime">Job Cancel Date and Time</label>
                <input className="jobpage-date-time-input" type="datetime-local" id="jobCancelDateTime" name="jobCancelDateTime" required />
              </>
            )}

            {jobType === "Auction" && (
              <>
                <label className="jobpage-form-label" htmlFor="startingBid">Starting Bid</label>
                <input className="jobpage-input" type="number" id="startingBid" name="startingBid" required />

                <label className="jobpage-form-label" htmlFor="auctionStartDateTime">Auction Start Date and Time</label>
                <input className="jobpage-date-time-input" type="datetime-local" id="auctionStartDateTime" name="auctionStartDateTime" required />

                <label className="jobpage-form-label" htmlFor="auctionStopDateTime">Auction Stop Date and Time</label>
                <input className="jobpage-date-time-input" type="datetime-local" id="auctionStopDateTime" name="auctionStopDateTime" required />
              </>
            )}

            {jobType === "Challenge" && (
              <>
                <label className="jobpage-form-label" htmlFor="compensation">Compensation</label>
                <input className="jobpage-input" type="number" id="compensation" name="compensation" required />

                <label className="jobpage-form-label" htmlFor="submissionDeadline">Submission Deadline</label>
                <input className="jobpage-date-time-input" type="date" id="submissionDeadline" name="submissionDeadline" required />
              </>
            )}

            <button className="jobpage-button" type="submit">Submit</button>
            <button className="jobpage-button" type="button" onClick={closePopup}>
              Cancel
            </button>
          </form>
        </div>
      )}
      <div>
        {filteredJobs.map((job) => (
          <div className="job" key={job.id}>
            <h2>{job.jobTitle}</h2>
            <p>{job.jobDescription}</p>
            <p>Type: {job.jobType}</p>
            {job.compensation && <p>Compensation: {job.compensation}</p>}
            {job.jobCancelDateTime && <p>Cancel Date and Time: {job.jobCancelDateTime}</p>}
            {job.startingBid && <p>Starting Bid: {job.startingBid}</p>}
            {job.auctionStartDateTime && <p>Auction Start Date and Time: {job.auctionStartDateTime}</p>}
            {job.auctionStopDateTime && <p>Auction Stop Date and Time: {job.auctionStopDateTime}</p>}
            {job.submissionDeadline && <p>Submission Deadline: {job.submissionDeadline}</p>}
            <p>Posted by: {job.userName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobpage;

