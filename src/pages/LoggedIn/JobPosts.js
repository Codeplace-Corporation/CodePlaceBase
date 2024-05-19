import React, { useState, useEffect } from "react";
import { firestore } from "../../firebase";

const JobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    // Define your initial filters here
  });

  // Function to fetch job posts from Firestore
  const fetchJobs = async () => {
    try {
      const jobsCollection = await firestore.collection("jobs").get();
      const jobsData = jobsCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Function to filter jobs based on search query and filters
  const filteredJobs = jobs.filter((job) => {
    // Check if the job title or description matches the search query
    const matchesSearchQuery = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) || job.jobDescription.toLowerCase().includes(searchQuery.toLowerCase());
  
    // Check if the job matches any of the applied filters
    const matchesFilters = Object.keys(filters).every((filterKey) => {
      return job[filterKey] === filters[filterKey] || !filters[filterKey]; // <-- Fix: Check if filter value is empty string
    });
  
    // Return true if the job matches the search query and all applied filters
    return matchesSearchQuery && matchesFilters;
  });

  return (
    <div>
      <h1>Job Posts</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      {/* Add additional filter inputs here */}
      <div className="jobs-list">
        {filteredJobs.map((job) => (
          <div key={job.id} className="job-item">
            <h2>{job.jobTitle}</h2>
            <p>{job.jobDescription}</p>
            {/* Display other job details */}
            <p>Type: {job.jobType}</p>
            <p>Compensation: {job.compensation}</p>
            <p>Cancel Date and Time: {job.jobCancelDateTime}</p>
            <p>Starting Bid: {job.startingBid}</p>
            <p>Auction Start Date and Time: {job.auctionStartDateTime}</p>
            <p>Auction Stop Date and Time: {job.auctionStopDateTime}</p>
            <p>Submission Deadline: {job.submissionDeadline}</p>
            <p>Posted by: {job.userName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobPosts;
