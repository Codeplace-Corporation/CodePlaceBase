import React, { useEffect, useState } from "react";
import { firestore } from '../../../firebase'; // Corrected path
import { collection, query, orderBy, limit, getDocs, getDoc, doc, updateDoc, arrayUnion } from "@firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './JobSearch.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGavel, faCrosshairs, faFileContract, faTrophy, faHandsHelping, faUser, faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomSlider from './CustomSlider'; // Import CustomSlider
import CompensationSlider from './CompensationSlider'; // Import CompensationSlider
import '../../../App.css';
const jobTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faCrosshairs },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
  { type: "Assist", icon: faHandsHelping },
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
  const [activeInterestedJob, setActiveInterestedJob] = useState(null); // Separate state for active interested job
  const [filterSelected, setFilterSelected] = useState(null);
  const [filterActive, setFilterActive] = useState({});
  const [filters, setFilters] = useState({
    type: [],
    category: [],
    tools: [],
    language: "",
    compensation: [0, 10000],
    timing: [0, 85]
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [compensationError, setCompensationError] = useState("");

  const fetchJobs = async () => {
    try {
      const jobsCol = collection(firestore, "jobs");
      let jobsQuery = query(jobsCol, orderBy("jobCancelDateTime", "desc"), limit(20));

      const jobSnapshot = await getDocs(jobsQuery);
      const jobList = await Promise.all(jobSnapshot.docs.map(async jobDoc => {
        const jobData = jobDoc.data();
        const userRef = doc(firestore, "users", jobData.userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          jobData.postedBy = userDoc.data().displayName;
        } else {
          jobData.postedBy = "Unknown";
        }
        return { id: jobDoc.id, ...jobData };
      }));

      setJobs(jobList);
      setLoading(false);
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
            const jobDoc = await getDoc(doc(firestore, "jobs", jobId));
            if (jobDoc.exists()) {
              return { id: jobDoc.id, ...jobDoc.data() };
            }
            return null;
          }));
          const jobList = jobDocs.filter(job => job !== null);
          console.log("Interested job list:", jobList);
          setInterestedJobs(jobList);
        } else {
          setInterestedJobs([]); // Clear interested jobs if no interested jobs found
        }
      } else {
        console.log("User doc does not exist.");
        setInterestedJobs([]); // Clear interested jobs if user doc does not exist
      }
    } else {
      console.log("No authenticated user.");
      setInterestedJobs([]); // Clear interested jobs if no authenticated user
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
        setInterestedJobs([]); // Clear interested jobs if no user is signed in
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
    setFilters(prevState => ({
      ...prevState,
      type: prevState.type[0] === type ? [] : [type]
    }));
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

  const calculateTimeRemaining = (jobCancelDateTime) => {
    const now = new Date();
    const jobEnd = new Date(jobCancelDateTime);
    const timeDiff = jobEnd - now;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return `${daysRemaining}d`;
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

  const convertCompensationValue = (value) => {
    return `$${value}`;
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
        fetchInterestedJobs(user); // Fetch the updated list of interested jobs
      } catch (error) {
        console.error("Error adding job to Interested Jobs: ", error);
        alert("Error adding job to Interested Jobs");
      }
    } else {
      alert("You need to be logged in to add jobs to Interested Jobs");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type.length === 0 || filters.type.includes(job.jobType);
    const matchesCategory = filters.category.length === 0 || (job.jobCategory && filters.category.some(category => job.jobCategory?.includes(category)));
    const matchesTools = filters.tools.length === 0 || (job.jobTools && filters.tools.some(tool => job.jobTools?.includes(tool)));
    const matchesCompensation = job.compensation >= filters.compensation[0] && job.compensation <= filters.compensation[1];
    const matchesTiming = (
      (job.projectLengthHours >= filters.timing[0] && job.projectLengthHours <= filters.timing[1]) ||
      (job.projectLengthDays >= filters.timing[0] && job.projectLengthDays <= filters.timing[1]) ||
      (job.projectLengthWeeks >= filters.timing[0] && job.projectLengthWeeks <= filters.timing[1]) ||
      (job.projectLengthMonths >= filters.timing[0] && job.projectLengthMonths <= filters.timing[1])
    );
    return matchesSearch && matchesType && matchesCategory && matchesTools && matchesCompensation && matchesTiming;
  });

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
        <button className="search-button">Advanced Search</button>
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

      <div className="jobs-list">
        {filteredJobs.map((job) => (
          <div key={job.id} className={`job-container ${activeJob === job.id ? 'active' : ''}`}>
            <div className="job-box" onClick={() => handleJobClick(job.id)}>
              <div className="job-content">
                <FontAwesomeIcon icon={getJobIcon(job.jobType)} className="job-icon" />
                <div className="job-details">
                  <h3 className="job-title">{job.jobTitle}</h3>
                  <div className="job-subtitle-wrapper">
                    <h4 className="job-subtitle">
                      {formatSubtitle(`${job.jobType} | ${job.jobCategory || ''} | ${job.jobreqs || ''} | ${job.jobTools || ''}`)}
                      <span className={`subtitle-arrow ${activeJob === job.id ? 'rotated' : ''}`}>
                        <FontAwesomeIcon icon={faChevronRight} className="subtitle-arrow" />
                      </span>
                    </h4>
                    <div className="job-extra">
                      <div className="job-info">
                        <span><FontAwesomeIcon icon={faUser} className="user-icon" /> {job.Applications}</span>
                        <span>{calculateTimeRemaining(job.jobCancelDateTime)}</span>
                      </div>
                      <div className="job-price-box">
                        <span className="job-price">{job.compensation}$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`job-expanded ${activeJob === job.id ? 'expanded' : ''}`}>
              <h3 className="job-expanded-title">{job.jobTitle}</h3>
              <p className="job-expanded-user">Posted by: {job.postedBy}</p>
              <p className="job-expanded-description">{job.jobDescription}</p>
              <button onClick={() => handleInterestedJob(job.id)}>Add to Interested Jobs</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="interested-jobs-title">My Jobs</h2>
      <div className="jobs-list">
        {interestedJobs.length > 0 ? (
          interestedJobs.map((job) => (
            <div key={job.id} className={`job-container ${activeInterestedJob === job.id ? 'active' : ''}`}>
              <div className="job-box" onClick={() => handleInterestedJobClick(job.id)}>
                <div className="job-content">
                  <FontAwesomeIcon icon={getJobIcon(job.jobType)} className="job-icon" />
                  <div className="job-details">
                    <h3 className="job-title">{job.jobTitle}</h3>
                    <div className="job-subtitle-wrapper">
                      <h4 className="job-subtitle">
                        {formatSubtitle(`${job.jobType} | ${job.jobCategory || ''} | ${job.jobreqs || ''} | ${job.jobTools || ''}`)}
                        <span className={`subtitle-arrow ${activeInterestedJob === job.id ? 'rotated' : ''}`}>
                          <FontAwesomeIcon icon={faChevronRight} className="subtitle-arrow" />
                        </span>
                      </h4>
                      <div className="job-extra">
                        <div className="job-info">
                          <span><FontAwesomeIcon icon={faUser} className="user-icon" /> {job.Applications}</span>
                          <span>{calculateTimeRemaining(job.jobCancelDateTime)}</span>
                        </div>
                        <div className="job-price-box">
                          <span className="job-price">{job.compensation}$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`job-expanded ${activeInterestedJob === job.id ? 'expanded' : ''}`}>
                <h3 className="job-expanded-title">{job.jobTitle}</h3>
                <p className="job-expanded-user">Posted by: {job.postedBy}</p>
                <p className="job-expanded-description">{job.jobDescription}</p>
                <button onClick={() => handleInterestedJob(job.id)}>Add to Interested Jobs</button>
              </div>
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
