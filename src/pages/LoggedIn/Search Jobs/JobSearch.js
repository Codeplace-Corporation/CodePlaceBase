import React, { useEffect, useState } from "react";
import { firestore } from '../../../firebase';
import { collection, query, orderBy, limit, getDocs, getDoc, doc, updateDoc, arrayUnion } from "@firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './JobSearch.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel, faCrosshairs, faFileContract, faTrophy, faHandsHelping, faUser, faChevronRight, faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomSlider from './CustomSlider';
import CompensationSlider from './CompensationSlider';
import JobDetails from './JobDetails';
import '../../../App.css';

const jobTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faCrosshairs },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
];

const categories = [
  "Website", "Mobile App", "CyberSecurity", "Web Design", "Frontend",
  "Backend", "Fullstack", "Bug Fix", "Robotics", "AI",
  "DevOps", "Data Science", "Machine Learning", "Blockchain", "Game Development",
  "AR/VR", "E-commerce", "SEO", "Content Writing", "Graphic Design",
  "Customer Support", "Marketing", "Sales", "HR", "Finance"
];

const tools = [
  "React", "Firebase", "Node.js", "Python", "AWS",
  "Django", "Flask", "Angular", "Vue.js", "Java",
  "Spring Boot", "Kotlin", "Swift", "Ruby on Rails", "PHP",
  "Laravel", "WordPress", "Magento", "SQL", "NoSQL",
  "MongoDB", "GraphQL", "Docker", "Kubernetes", "Git"
];

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [interestedJobs, setInterestedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [activeInterestedJob, setActiveInterestedJob] = useState(null);
  const [filterSelected, setFilterSelected] = useState(null);
  const [filterActive, setFilterActive] = useState({});
  const [filters, setFilters] = useState({
    type: [],
    category: [],
    tools: [],
    compensation: [0, 10000],
    timing: [0, 85]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [compensationError, setCompensationError] = useState("");
  const [currentPage, setCurrentPage] = useState('jobSearch');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchJobs = async () => {
    try {
      const jobsCol = collection(firestore, "activeJobs");
      let jobsQuery = query(jobsCol, orderBy("createdAt", "desc"), limit(20));

      const jobSnapshot = await getDocs(jobsQuery);
      console.log("Number of jobs fetched:", jobSnapshot.docs.length);

      const jobList = jobSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Raw job data:", data);
        return { id: doc.id, ...data };
      });

      setJobs(jobList);
      setLoading(false);
      console.log("Jobs set in state:", jobList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error);
      setLoading(false);
    }
  };

  const fetchInterestedJobs = async (user) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const interestedJobIds = userDoc.data().InterestedJobs || [];
        console.log("Interested job IDs:", interestedJobIds);
        if (interestedJobIds.length > 0) {
          const jobDocs = await Promise.all(interestedJobIds.map(async (jobId) => {
            try {
              const jobDoc = await getDoc(doc(firestore, "activeJobs", jobId));
              if (jobDoc.exists()) {
                return { id: jobDoc.id, ...jobDoc.data() };
              }
              console.warn(`Job with ID ${jobId} not found`);
              return null;
            } catch (error) {
              console.error(`Error fetching job with ID ${jobId}:`, error);
              return null;
            }
          }));
          const jobList = jobDocs.filter(job => job !== null);
          console.log("Interested job list:", jobList);
          setInterestedJobs(jobList);
        } else {
          setInterestedJobs([]);
        }
      } else {
        console.log("User doc does not exist.");
        setInterestedJobs([]);
      }
    } else {
      console.log("No authenticated user.");
      setInterestedJobs([]);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in:", user);
        fetchInterestedJobs(user);
      } else {
        console.log("No user is signed in.");
        setInterestedJobs([]);
      }
    });
    fetchJobs();
  }, []);

  useEffect(() => {
    setFilterActive({
      type: filters.type.length > 0,
      category: filters.category.length > 0,
      tools: filters.tools.length > 0,
      compensation: filters.compensation[0] > 0 || filters.compensation[1] < 10000,
      timing: filters.timing[0] > 0 || filters.timing[1] < 85,
    });
  }, [filters]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchReset = () => {
    setSearchTerm("");
  };

  const handleIconClick = (type) => {
    setFilters(prevFilters => {
      const newTypes = prevFilters.type.includes(type)
        ? prevFilters.type.filter(t => t !== type)
        : [...prevFilters.type, type];
      
      console.log("Updated job types filter:", newTypes);
      return { ...prevFilters, type: newTypes };
    });
  };

  const handleCheckboxChange = (e, filterType) => {
    const { name, checked } = e.target;
    setFilters(prevState => {
      const newFilter = checked
        ? [...prevState[filterType], name]
        : prevState[filterType].filter(item => item !== name);
      return { ...prevState, [filterType]: newFilter };
    });
  };

  const handleCompensationChange = (value) => {
    console.log("Compensation filter changed:", value);
    setFilters(prevState => ({
      ...prevState,
      compensation: value
    }));
  };

  const handleCompensationInputChange = (e, index) => {
    const value = Number(e.target.value);
    setFilters(prevState => {
      const newCompensation = [...prevState.compensation];
      newCompensation[index] = value;
      validateCompensation(newCompensation);
      return { ...prevState, compensation: newCompensation };
    });
  };

  const validateCompensation = (compensation) => {
    if (compensation[0] <= 0) {
      setCompensationError("Minimum compensation cannot be less than zero.");
    } else if (compensation[1] < compensation[0]) {
      setCompensationError("Maximum compensation cannot be less than minimum compensation.");
    } else {
      setCompensationError("");
    }
  };

  const handleTimingChange = (value) => {
    setFilters(prevState => ({
      ...prevState,
      timing: value
    }));
  };

  const getJobIcon = (jobType) => {
    const jobTypeObj = jobTypes.find(typeObj => typeObj.type === jobType);
    return jobTypeObj ? jobTypeObj.icon : faFileContract;
  };

  const formatSubtitle = (subtitle) => {
    return subtitle.split("|").map((part, index, array) => (
      <React.Fragment key={index}>
        {part.trim()}
        {index < array.length - 1 && <span className="subtitle-separator"> | </span>}
      </React.Fragment>
    ));
  };

  const handleJobClick = (jobId) => {
    setActiveJob(activeJob === jobId ? null : jobId);
  };

  const handleInterestedJobClick = (jobId) => {
    setActiveInterestedJob(activeInterestedJob === jobId ? null : jobId);
  };

  const toggleFilter = (filterName) => {
    setFilterSelected(filterSelected === filterName ? null : filterName);
  };

  const convertTimingValue = (value) => {
    if (value <= 7) return `${value + 1}h`;
    if (value <= 27) return `${value - 7}d`;
    if (value <= 55) return `${(value - 27) / 2}w`;
    return `${(value - 55) / 14}m`;
  };

  const handleInterestedJob = async (jobId) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        await updateDoc(userDocRef, {
          InterestedJobs: arrayUnion(jobId)
        });
        alert("Job added to your Interested Jobs");
        fetchInterestedJobs(user);
      } catch (error) {
        console.error("Error adding job to Interested Jobs: ", error);
        alert("Error adding job to Interested Jobs");
      }
    } else {
      alert("You need to be logged in to add jobs to Interested Jobs");
    }
  };

  const handleApplyClick = (jobId) => {
    setSelectedJobId(jobId);
    setCurrentPage('jobDetails');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? faSortUp : faSortDown;
    }
    return faSort;
  };

  const filteredJobs = jobs.filter(job => {
    console.log("Filtering job:", job);
    const matchesSearch = job.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    console.log("Matches search:", matchesSearch);
    
    const matchesType = filters.type.length === 0 || 
      filters.type.some(type => type.toLowerCase() === (job.selectedJobPostType || '').toLowerCase());
    console.log("Job type:", job.selectedJobPostType, "Selected types:", filters.type, "Matches type:", matchesType);
    
    const matchesCategory = filters.category.length === 0 || (job.projectType && filters.category.includes(job.projectType));
    console.log("Matches category:", matchesCategory);
    
    const matchesTools = filters.tools.length === 0 || (job.tools && job.tools.some(tool => filters.tools.includes(tool.name)));
    console.log("Matches tools:", matchesTools);
    
    const jobCompensation = parseFloat(job.compensation.replace(/[^0-9.-]+/g,""));
    const matchesCompensation = isNaN(jobCompensation) || 
      (jobCompensation >= filters.compensation[0] && jobCompensation <= filters.compensation[1]);
    console.log("Job compensation:", job.compensation, "Parsed compensation:", jobCompensation, 
      "Filter range:", filters.compensation, "Matches compensation:", matchesCompensation);
    
    const matchesTiming = true; // Implement proper timing filter if needed
    console.log("Matches timing:", matchesTiming);
    
    const isVisible = matchesSearch && matchesType && matchesCategory && matchesTools && matchesCompensation && matchesTiming;
    console.log("Job visible:", isVisible);
    
    return isVisible;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'compensation') {
      const compA = parseFloat(a.compensation.replace(/[^0-9.-]+/g,""));
      const compB = parseFloat(b.compensation.replace(/[^0-9.-]+/g,""));
      return sortOrder === 'asc' ? compA - compB : compB - compA;
    } else if (sortBy === 'projectLength') {
      const lengthA = a.estimatedProjectLength || '';
      const lengthB = b.estimatedProjectLength || '';
      return sortOrder === 'asc' ? lengthA.localeCompare(lengthB) : lengthB.localeCompare(lengthA);
    }
    return 0;
  });

  console.log("Filtered and sorted jobs:", sortedJobs);

  if (currentPage === 'jobDetails') {
    return <JobDetails jobId={selectedJobId} />;
  }

  return (
    <div className="jobs-container">
      <h1 className="title">Job Search</h1>
      <h2 className="styled-h2">
        <span className="part1">Find jobs optimized for your skillset from our four types </span>
        <span className="line">|</span>
        <span className="part2"> How CodePlace work <HelpOutlineIcon className="icon" /></span>
      </h2>
      <div className="search-container">
        <div className={`filter-buttons ${filterSelected}`}>
          <button
            className={`filter-button ${filterSelected === 'type' ? 'selected' : ''} ${filterActive.type ? 'active' : ''}`}
            onClick={() => toggleFilter('type')}
          >
            Job Types <FontAwesomeIcon icon={faChevronRight} className={`subtitle-arrow ${filterSelected === 'type' ? 'rotated' : ''}`} />
          </button>
          <button
            className={`filter-button ${filterSelected === 'category' ? 'selected' : ''} ${filterActive.category ? 'active' : ''}`}
            onClick={() => toggleFilter('category')}
          >
            Job Categories <FontAwesomeIcon icon={faChevronRight} className={`subtitle-arrow ${filterSelected === 'category' ? 'rotated' : ''}`} />
          </button>
<button
            className={`filter-button ${filterSelected === 'tools' ? 'selected' : ''} ${filterActive.tools ? 'active' : ''}`}
            onClick={() => toggleFilter('tools')}
          >
            Job Tools <FontAwesomeIcon icon={faChevronRight} className={`subtitle-arrow ${filterSelected === 'tools' ? 'rotated' : ''}`} />
          </button>
          <button
            className={`filter-button ${filterSelected === 'compensation' ? 'selected' : ''} ${filterActive.compensation ? 'active' : ''}`}
            onClick={() => toggleFilter('compensation')}
          >
            Compensation <FontAwesomeIcon icon={faChevronRight} className={`subtitle-arrow ${filterSelected === 'compensation' ? 'rotated' : ''}`} />
          </button>
          <button
            className={`filter-button ${filterSelected === 'timing' ? 'selected' : ''} ${filterActive.timing ? 'active' : ''}`}
            onClick={() => toggleFilter('timing')}
          >
            Timing <FontAwesomeIcon icon={faChevronRight} className={`subtitle-arrow ${filterSelected === 'timing' ? 'rotated' : ''}`} />
          </button>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="search-button" onClick={handleSearchReset}>Reset Search</button>
      </div>

      {filterSelected === 'type' && (
        <div className="filters-container">
          <div className="filter-icons">
            {jobTypes.map(({ type, icon }) => (
              <div
                key={type}
                className={`filter-icon-container ${filters.type.includes(type) ? 'selected' : ''}`}
                onClick={() => handleIconClick(type)}
              >
                <FontAwesomeIcon icon={icon} className="filter-icon" />
                <span className="filter-icon-text">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterSelected === 'category' && (
        <div className="filters-container">
          <div className="filter-columns">
            {categories.map((category) => (
              <div key={category} className="filter-column">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    name={category}
                    checked={filters.category.includes(category)}
                    onChange={(e) => handleCheckboxChange(e, "category")}
                  />
                  <span className="checkmark"></span>
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterSelected === 'tools' && (
        <div className="filters-container">
          <div className="filter-columns">
            {tools.map((tool) => (
              <div key={tool} className="filter-column">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    name={tool}
                    checked={filters.tools.includes(tool)}
                    onChange={(e) => handleCheckboxChange(e, "tools")}
                  />
                  <span className="checkmark"></span>
                  {tool}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterSelected === 'compensation' && (
        <div className="filters-container filter-compensation">
          <h3 className="filter-compensation-heading">Compensation range</h3>
          <CompensationSlider
            value={filters.compensation}
            onChange={handleCompensationChange}
            minInputValue={filters.compensation[0]}
            maxInputValue={filters.compensation[1]}
            onInputChange={handleCompensationInputChange}
          />
          {compensationError && (
            <div className="error-message">{compensationError}</div>
          )}
        </div>
      )}

      {filterSelected === 'timing' && (
        <div className="filters-container filter-timing">
          <h3 className="filter-timing-heading">Project Length</h3>
          <CustomSlider
            value={filters.timing}
            onChange={handleTimingChange}
            min={0}
            max={85}
            step={1}
            convertToDisplayValue={convertTimingValue}
          />
        </div>
      )}

<div className="sorting-section">
        <div className="sort-buttons">
          <button 
            className={`sort-button ${sortBy === 'compensation' ? 'active' : ''}`} 
            onClick={() => handleSort('compensation')}
          >
            Compensation 
            <FontAwesomeIcon icon={getSortIcon('compensation')} className="sort-icon" />
          </button>
          <button 
            className={`sort-button ${sortBy === 'projectLength' ? 'active' : ''}`} 
            onClick={() => handleSort('projectLength')}
          >
            Project Length 
            <FontAwesomeIcon icon={getSortIcon('projectLength')} className="sort-icon" />
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading jobs...</p>
      ) : error ? (
        <p>Error loading jobs: {error.message}</p>
      ) : (
        <div className="jobs-list">
          {sortedJobs.length > 0 ? (
            sortedJobs.map((job) => (
              <div key={job.id} className={`job-container ${activeJob === job.id ? 'active' : ''}`}>
                <div className="job-box" onClick={() => handleJobClick(job.id)}>
                  <div className="job-content">
                    <FontAwesomeIcon icon={getJobIcon(job.selectedJobPostType)} className="job-icon" />
                    <div className="job-details">
                      <h3 className="job-title">{job.projectTitle || 'Untitled Project'}</h3>
                      <div className="job-subtitle-wrapper">
                        <h4 className="job-subtitle">
                          {formatSubtitle(`${job.selectedJobPostType || 'Unknown Type'} | ${job.projectType || ''} | ${job.tools?.map(tool => tool.name).join(', ') || ''} | ${job.tags?.join(', ') || ''}`)}
                          <span className={`subtitle-arrow ${activeJob === job.id ? 'rotated' : ''}`}>
                            <FontAwesomeIcon icon={faChevronRight} className="subtitle-arrow" />
                          </span>
                        </h4>
                        <div className="job-extra">
                          <div className="job-info">
                            <span><FontAwesomeIcon icon={faUser} className="user-icon" /> {job.postedBy || 'Unknown'}</span>
                            <span>{job.estimatedProjectLength || 'Unknown duration'}</span>
                          </div>
                          <div className="job-price-box">
                            <span className="job-price">{job.compensation || 'Price not set'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {activeJob === job.id && (
                  <div className="job-expanded">
                    <h3 className="job-expanded-title">{job.projectTitle}</h3>
                    <p className="job-expanded-user">Posted by: {job.postedBy || 'Unknown'}</p>
                    <p className="job-expanded-description">{job.projectDescription || 'No description available.'}</p>
                    <button onClick={() => handleInterestedJob(job.id)}>Add to Interested Jobs</button>
                    <button onClick={() => handleApplyClick(job.id)}>Apply</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No jobs found.</p>
          )}
        </div>
      )}

      <h2 className="interested-jobs-title">My Jobs</h2>
      <div className="jobs-list">
        {interestedJobs.length > 0 ? (
          interestedJobs.map((job) => (
            <div key={job.id} className={`job-container ${activeInterestedJob === job.id ? 'active' : ''}`}>
              <div className="job-box" onClick={() => handleInterestedJobClick(job.id)}>
                <div className="job-content">
                  <FontAwesomeIcon icon={getJobIcon(job.selectedJobPostType)} className="job-icon" />
                  <div className="job-details">
                    <h3 className="job-title">{job.projectTitle || 'Untitled Project'}</h3>
                    <div className="job-subtitle-wrapper">
                      <h4 className="job-subtitle">
                        {formatSubtitle(`${job.selectedJobPostType || 'Unknown Type'} | ${job.projectType || ''} | ${job.tools?.map(tool => tool.name).join(', ') || ''} | ${job.tags?.join(', ') || ''}`)}
                        <span className={`subtitle-arrow ${activeInterestedJob === job.id ? 'rotated' : ''}`}>
                          <FontAwesomeIcon icon={faChevronRight} className="subtitle-arrow" />
                        </span>
                      </h4>
                      <div className="job-extra">
                        <div className="job-info">
                          <span><FontAwesomeIcon icon={faUser} className="user-icon" /> {job.postedBy || 'Unknown'}</span>
                          <span>{job.estimatedProjectLength || 'Unknown duration'}</span>
                        </div>
                        <div className="job-price-box">
                          <span className="job-price">{job.compensation || 'Price not set'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {activeInterestedJob === job.id && (
                <div className="job-expanded">
                  <h3 className="job-expanded-title">{job.projectTitle}</h3>
                  <p className="job-expanded-user">Posted by: {job.postedBy || 'Unknown'}</p>
                  <p className="job-expanded-description">{job.projectDescription || 'No description available.'}</p>
                  <button onClick={() => handleApplyClick(job.id)}>Apply</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No interested jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default JobSearch;