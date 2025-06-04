import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";
import JobItem from "./components/JobItem";
import DropdownButton from "../../components/DropdownButton";
import { categories, jobTypes, tools } from "../../data/jobTypes";
import { useState, useEffect } from "react";
import CompensationSlider from "./components/CompensationSlider";
import ProjectLengthSlider from "./components/ProjectLengthSlider";
import { ExpandableProvider } from "./components/ExpandableBox";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestore } from "../../utils/firebase"; // Import firestore instead of db

// Job interface to match your JobItem expectations
interface Job {
  id: string;
  projectTitle: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: string;
  compensation: string;
  estimatedProjectLength: string;
  projectDescription: string;
  projectOverview?: string; // Add this field
  auctionCloseTime?: string;
  bountyEndTime?: string;
  applicationsCloseTime?: string;
  challengeCloseTime?: string;
}

const JobSearch = () => {
  const [filters, setFilters] = useState({
    type: [""],
    category: [""],
    tools: [""],
    language: "",
    compensation: [0, 10000],
    timing: [0, 85],
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from Firebase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create query to get all jobs from activeJobs collection
        const jobsQuery = query(
          collection(firestore, "activeJobs"),
          orderBy("createdAt", "desc") // Order by creation date, newest first
        );

        const querySnapshot = await getDocs(jobsQuery);
        const fetchedJobs: Job[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Transform Firebase document to match Job interface
          const job: Job = {
            id: doc.id, // Use Firebase document ID
            projectTitle: data.projectTitle || "Untitled Project",
            projectType: data.projectType || "General",
            tools: data.tools || [],
            tags: data.tags || [],
            selectedJobPostType: data.selectedJobPostType || "Contract",
            compensation: data.compensation?.toString() || "0",
            estimatedProjectLength: data.estimatedProjectLength || "Unknown",
            projectDescription: data.projectDescription || "No description available",
            projectOverview: data.projectOverview, // Add this line to include projectOverview
            // Time fields based on job type
            auctionCloseTime: data.auctionCloseTime,
            bountyEndTime: data.bountyEndTime,
            applicationsCloseTime: data.applicationsCloseTime,
            challengeCloseTime: data.challengeCloseTime,
          };

          fetchedJobs.push(job);
        });

        console.log(`Fetched ${fetchedJobs.length} jobs from Firebase`);
        setJobs(fetchedJobs);

        // For now, we'll use the same jobs as bookmarked
        // You might want to fetch from a different collection or filter by user bookmarks
        setBookmarkedJobs(fetchedJobs.slice(0, 5)); // First 5 as bookmarked for demo

      } catch (err) {
        console.error("Error fetching jobs from Firebase:", err);
        setError("Failed to load jobs. Please try again.");
        
        // Fallback to empty array
        setJobs([]);
        setBookmarkedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on component mount

  const handleFilterJobTypeItemClicked = (type: string) => {
    setFilters((prevState) => ({
      ...prevState,
      type: prevState.type[0] === type ? [] : [type],
    }));
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    filterType: "category" | "tools"
  ) => {
    const { name, checked } = e.target;
    setFilters((prevState) => {
      const newFilter = checked
        ? [...prevState[filterType], name]
        : prevState[filterType].filter((item) => item !== name);
      return { ...prevState, [filterType]: newFilter };
    });
  };

  const handleCompensationChange = (value: number[]) => {
    setFilters((prevState) => ({
      ...prevState,
      compensation: value,
    }));
  };

  const handleTimingChange = (value: number[]) => {
    setFilters((prevState) => ({
      ...prevState,
      timing: value,
    }));
  };

  // Add navigation handler for job details
  const handleNavigateToJob = (jobId: string) => {
    console.log('Navigating to job:', jobId);
    window.location.href = `/jobs/${jobId}`;
  };

  // Add function to refresh jobs
  const handleRefreshJobs = async () => {
    setIsLoading(true);
    // Trigger re-fetch by calling the useEffect logic
    window.location.reload(); // Simple refresh for now
  };

  const JobList = ({ jobs }: { jobs: Job[] }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading jobs...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-32">
          <div className="text-red-400 mb-2">{error}</div>
          <button 
            onClick={handleRefreshJobs}
            className="px-4 py-2 bg-accent text-black rounded hover:bg-accent/80 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">No jobs found. Try adjusting your filters.</div>
        </div>
      );
    }

    return (
      <>
        {jobs.map((job) => (
          <JobItem 
            key={job.id} 
            job={job} 
            onNavigateToJob={handleNavigateToJob}
          />
        ))}
      </>
    );
  };

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 text-white">
      <div className="mt-10 mb-8 pb-4 border-b border-white/10">
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-2">
          Job Search
        </h1>

        <p className="text-base text-white/80 flex items-center gap-2">
          Find jobs optimized for your skillset from our four types
          <span className="text-white/40">|</span>
          <span className="text-white/50 hover:text-accent cursor-pointer transition">
            How CodePlace works
          </span>
          <FontAwesomeIcon
            icon={faCircleQuestion}
            className="text-white/40 hover:text-accent transition"
          />
          {/* Show job count */}
          <span className="ml-auto text-sm text-white/50">
            {isLoading ? "Loading..." : `${jobs.length} jobs available`}
          </span>
        </p>
      </div>

      <div className="flex flex-row gap-2 items-center mt-4">
        <DropdownButton label="Job Type">
          <div className="m-8 flex flex-row justify-between gap-32">
            {jobTypes.map((jobtype, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer transition ease-linear ${
                  filters.type.includes(jobtype.type) ? "text-accent" : ""
                }`}
                onClick={() => handleFilterJobTypeItemClicked(jobtype.type)}
              >
                <FontAwesomeIcon icon={jobtype.icon} />
                <span>{jobtype.type}</span>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label="Job Categories">
          <div className="m-8 flex flex-wrap w-[500px] gap-2">
            {categories.map((cat, index) => (
              <div key={index} className="w-2/5">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    name={cat}
                    checked={filters.category.includes(cat)}
                    onChange={(e) => handleCheckboxChange(e, "category")}
                  />
                  {cat}
                </label>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label="Job Tools">
          <div className="m-8 flex flex-wrap w-[500px] gap-2">
            {tools.map((tool, index) => (
              <div key={index} className="w-2/5">
                <label className="flex gap-2">
                  <input
                    type="checkbox"
                    name={tool}
                    checked={filters.tools.includes(tool)}
                    onChange={(e) => handleCheckboxChange(e, "tools")}
                  />
                  {tool}
                </label>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label="Compensation">
          <div className="m-8 flex flex-col w-[500px]">
            <h3>Compensation Range</h3>
            <CompensationSlider
              value={filters.compensation}
              onChange={handleCompensationChange}
              minInputValue={filters.compensation[0]}
              maxInputValue={filters.compensation[1]}
            />
          </div>
        </DropdownButton>

        <DropdownButton label="Timing">
          <div className="m-8 flex flex-col w-[500px]">
            <h3>Project Length</h3>
            <ProjectLengthSlider
              value={filters.timing}
              onChange={handleTimingChange}
            />
          </div>
        </DropdownButton>

        <StyledInput
          variant="filled"
          className="flex-1 placeholder-white/50"
          inputSize="small"
          placeholder="Search jobs"
        />
        <StyledButton 
          size="small" 
          variant="success"
          onClick={handleRefreshJobs}
        >
          Refresh Jobs
        </StyledButton>
      </div>

      <div className="flex flex-col gap-2 mt-8 h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-white/15">
       <ExpandableProvider>
          <JobList jobs={jobs} />
       </ExpandableProvider>
      </div>

      <div className="mt-8">
        <h2 className="text-accent font-bold">Interested Jobs</h2>
        <div className="flex flex-col gap-2 mt-4 max-h-[550px] overflow-y-scroll scrollbar-thin scrollbar-thumb-accent scrollbar-track-white/15">
         <ExpandableProvider>
           <JobList jobs={bookmarkedJobs} />
          </ExpandableProvider>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;