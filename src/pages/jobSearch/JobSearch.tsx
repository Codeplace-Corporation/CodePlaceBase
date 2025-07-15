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
    type: [] as string[],
    category: [] as string[],
    tools: [] as string[],
    language: "",
    compensation: [0, 10000],
    timing: [0, 26],
  });

  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
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
          orderBy("activatedAt", "desc") // Order by activation date, newest first
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
        setAllJobs(fetchedJobs);
        setFilteredJobs(fetchedJobs); // Initialize filtered jobs with all fetched jobs

        // For now, we'll use the same jobs as bookmarked
        // You might want to fetch from a different collection or filter by user bookmarks
        setBookmarkedJobs(fetchedJobs.slice(0, 5)); // First 5 as bookmarked for demo

      } catch (err) {
        console.error("Error fetching jobs from Firebase:", err);
        setError("Failed to load jobs. Please try again.");
        
        // Fallback to empty array
        setAllJobs([]);
        setFilteredJobs([]);
        setBookmarkedJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on component mount

  // Apply filters whenever filter state changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allJobs];

      // Filter by job type
      if (filters.type.length > 0) {
        filtered = filtered.filter(job => filters.type.includes(job.selectedJobPostType));
      }

      // Filter by category
      if (filters.category.length > 0) {
        filtered = filtered.filter(job => 
          filters.category.some(cat => 
            job.projectType.toLowerCase().includes(cat.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(cat.toLowerCase()))
          )
        );
      }

      // Filter by tools
      if (filters.tools.length > 0) {
        filtered = filtered.filter(job => 
          filters.tools.some(tool => 
            job.tools.some(jobTool => 
              jobTool.name.toLowerCase().includes(tool.toLowerCase())
            )
          )
        );
      }

      // Filter by compensation range
      const minComp = filters.compensation[0];
      const maxComp = filters.compensation[1];
      filtered = filtered.filter(job => {
        const comp = parseFloat(job.compensation);
        return comp >= minComp && comp <= maxComp;
      });

      // Filter by project length (timing)
      const minTiming = filters.timing[0];
      const maxTiming = filters.timing[1];
      filtered = filtered.filter(job => {
        // Convert estimatedProjectLength to a numeric value for comparison
        const lengthValue = getProjectLengthValue(job.estimatedProjectLength);
        return lengthValue >= minTiming && lengthValue <= maxTiming;
      });

      setFilteredJobs(filtered);
    };

    applyFilters();
  }, [allJobs, filters]);

  // Helper function to convert project length to numeric value
  const getProjectLengthValue = (length: string): number => {
    const lengthMap: { [key: string]: number } = {
      "<1hour": 0,
      "1-3hours": 1,
      "3-6hours": 2,
      "6-12hours": 3,
      "12-24hours": 4,
      "1-3days": 5,
      "3-7days": 6,
      "1-2weeks": 7,
      "2-4weeks": 8,
      ">1month": 9,
    };
    return lengthMap[length] || 0;
  };

  const handleFilterJobTypeItemClicked = (type: string) => {
    setFilters((prevState) => ({
      ...prevState,
      type: prevState.type.includes(type) ? prevState.type.filter(t => t !== type) : [...prevState.type, type],
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

  const clearAllFilters = () => {
    setFilters({
      type: [],
      category: [],
      tools: [],
      language: "",
      compensation: [0, 10000],
      timing: [0, 26],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type.length > 0) count += filters.type.length;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.tools.length > 0) count += filters.tools.length;
    if (filters.language) count += 1;
    if (filters.compensation[0] > 0 || filters.compensation[1] < 10000) count += 1;
    if (filters.timing[0] > 0 || filters.timing[1] < 26) count += 1;
    return count;
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

  const getJobTypeGradient = (type: string) => {
    switch (type) {
      case "Auction":
        return "from-orange-500 to-red-500";
      case "Bounty":
        return "from-purple-500 to-pink-500";
      case "Contract":
        return "from-blue-500 to-cyan-500";
      case "Challenge":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getJobTypeIconColor = (type: string) => {
    switch (type) {
      case "Auction":
        return "text-orange-400";
      case "Bounty":
        return "text-purple-400";
      case "Contract":
        return "text-blue-400";
      case "Challenge":
        return "text-green-400";
      default:
        return "text-white";
    }
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
            className="px-4 py-2 bg-white text-black rounded hover:bg-white/80 transition"
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
        <h1 className="text-5xl font-medium text-white leading-tight mb-2 tracking-[-0.03em]">
          Job Search
        </h1>

        <p className="text-base font-light text-white/80 flex items-center gap-2 leading-relaxed">
          Find jobs optimized for your skillset from our four types
          <span className="text-white/40">|</span>
          <span className="text-white/50 hover:text-white cursor-pointer transition">
            How CodePlace works
          </span>
          <FontAwesomeIcon
            icon={faCircleQuestion}
            className="text-white/40 hover:text-white transition"
          />
          {/* Show job count */}
          <span className="ml-auto text-sm text-white/50">
            {isLoading ? "Loading..." : `${filteredJobs.length} jobs available`}
          </span>
        </p>
      </div>

      <div className="flex flex-row gap-2 items-center mt-4">
        <DropdownButton label={`Job Type ${filters.type.length > 0 ? `(${filters.type.length})` : ''}`}>
          <div className="m-8 flex flex-row justify-between gap-32">
            {jobTypes.map((jobtype, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer transition ease-linear p-2 rounded-lg ${
                  filters.type.includes(jobtype.type) 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => handleFilterJobTypeItemClicked(jobtype.type)}
              >
                <FontAwesomeIcon 
                  icon={jobtype.icon} 
                  className={getJobTypeIconColor(jobtype.type)}
                />
                <span className="text-sm mt-1">{jobtype.type}</span>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label={`Categories ${filters.category.length > 0 ? `(${filters.category.length})` : ''}`}>
          <div className="m-8 flex flex-wrap w-[500px] gap-2">
            {categories.map((cat, index) => (
              <div key={index} className="w-2/5">
                <label className="flex gap-2 text-white/70 hover:text-white cursor-pointer p-2 rounded hover:bg-white/5">
                  <input
                    type="checkbox"
                    name={cat}
                    checked={filters.category.includes(cat)}
                    onChange={(e) => handleCheckboxChange(e, "category")}
                    className="text-white"
                  />
                  <span className="text-sm">{cat}</span>
                </label>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label={`Tools ${filters.tools.length > 0 ? `(${filters.tools.length})` : ''}`}>
          <div className="m-8 flex flex-wrap w-[500px] gap-2">
            {tools.map((tool, index) => (
              <div key={index} className="w-2/5">
                <label className="flex gap-2 text-white/70 hover:text-white cursor-pointer p-2 rounded hover:bg-white/5">
                  <input
                    type="checkbox"
                    name={tool}
                    checked={filters.tools.includes(tool)}
                    onChange={(e) => handleCheckboxChange(e, "tools")}
                    className="text-white"
                  />
                  <span className="text-sm">{tool}</span>
                </label>
              </div>
            ))}
          </div>
        </DropdownButton>

        <DropdownButton label={`Compensation ${filters.compensation[0] > 0 || filters.compensation[1] < 10000 ? '(Set)' : ''}`}>
          <div className="m-8 flex flex-col w-[500px]">
            <h3 className="text-white mb-4">Compensation Range</h3>
            <CompensationSlider
              value={filters.compensation}
              onChange={handleCompensationChange}
              minInputValue={filters.compensation[0]}
              maxInputValue={filters.compensation[1]}
            />
          </div>
        </DropdownButton>

        <DropdownButton label={`Timing ${filters.timing[0] > 0 || filters.timing[1] < 26 ? '(Set)' : ''}`}>
          <div className="m-8 flex flex-col w-[500px]">
            <h3 className="text-white mb-4">Project Length</h3>
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
        
        {getActiveFiltersCount() > 0 && (
          <StyledButton 
            size="small" 
            variant="secondary"
            onClick={clearAllFilters}
            className="whitespace-nowrap"
          >
            Clear Filters ({getActiveFiltersCount()})
          </StyledButton>
        )}
        
        <StyledButton 
          size="small" 
          variant="secondary"
          onClick={handleRefreshJobs}
        >
          Refresh Jobs
        </StyledButton>
      </div>

      <div className="flex flex-col gap-2 mt-8 h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-white/15">
       <ExpandableProvider>
          <JobList jobs={filteredJobs} />
       </ExpandableProvider>
      </div>

      <div className="mt-8">
        <h2 className="text-white font-bold">Interested Jobs</h2>
        <div className="flex flex-col gap-2 mt-4 max-h-[550px] overflow-y-scroll scrollbar-thin scrollbar-thumb-white scrollbar-track-white/15">
         <ExpandableProvider>
           <JobList jobs={bookmarkedJobs} />
          </ExpandableProvider>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;