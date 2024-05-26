import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { firestore, auth } from "../../firebase";
import './Jobpage.css';

const Jobpage = () => {
  // State variables to manage various aspects of the component
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [jobType, setJobType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [jobs, setJobs] = useState([]);

  // useEffect hook to fetch jobs from Firestore when the component mounts
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

  // Function to open the job creation popup
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to close the job creation popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Function to handle form submission when creating a new job
  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;

    // Check if a user is logged in
    if (!currentUser) {
      console.error("No user is currently logged in.");
      return;
    }

    // Construct the new job object based on form inputs
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

    // Add the new job to the Firestore collection
    try {
      const docRef = await addDoc(collection(firestore, "jobs"), newJob);
      console.log("Job created with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }

    closePopup();
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Function to handle sorting input change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Filter and sort the jobs based on search, filters, and sorting criteria
  let filteredJobs = [...jobs];

  if (searchQuery !== "") {
    filteredJobs = filteredJobs.filter(job =>
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (sortBy !== "") {
    filteredJobs.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }

  // JSX to render the job page component
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

      {/* Job creation popup */}
      {isPopupOpen && (
        <div className="jobpage-popup">
          <h1 className="jobpage-popup-heading">Create a New Job</h1>
          <form onSubmit={handleSubmit}>
            {/* Form inputs for job creation */}
          </form>
        </div>
      )}

      {/* Display the filtered and sorted jobs */}
      <div>
        {filteredJobs.map((job) => (
          <div className="job" key={job.id}>
            {/* Render job details */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobpage;