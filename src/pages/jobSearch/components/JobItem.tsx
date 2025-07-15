import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel,
  faGift,
  faFileContract,
  faTrophy,
  faQuestionCircle,
  faEllipsisV,
  faHeart as faHeartSolid,
  faCheck,
  faBan,
  faFlag,
  faCrosshairs,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import React, { useState, ReactNode, useEffect, useRef } from "react";
import { ExpandableBox } from "./ExpandableBox";

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
  projectOverview?: string; // Add this new optional field
  auctionCloseTime?: string;
  bountyEndTime?: string;
  applicationsCloseTime?: string;
  challengeCloseTime?: string;
}

interface JobItemProps {
  job: Job;
  onNavigateToJob?: (jobId: string) => void; // Optional callback for navigation
}

const jobPostTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faCrosshairs },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
];

const getTimeLabel = (jobType: string) => {
  switch (jobType) {
    case "Auction":
      return "Time left in auction";
    case "Bounty":
    case "Challenge":
      return "Time remaining";
    case "Contract":
      return "Applications close";
    default:
      return "Time remaining";
  }
};

const getTimeRemaining = (job: Job) => {
  let endTime: string | undefined;

  switch (job.selectedJobPostType) {
    case "Auction":
      endTime = job.auctionCloseTime;
      break;
    case "Bounty":
    case "Challenge":
      endTime =
        job.selectedJobPostType === "Bounty"
          ? job.bountyEndTime
          : job.challengeCloseTime;
      break;
    case "Contract":
      endTime = job.applicationsCloseTime;
      break;
  }

  if (!endTime) return null;

  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const JobItem: React.FC<JobItemProps> = ({ job, onNavigateToJob }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug: Log the job object to see what fields are available
  console.log('JobItem received job:', job);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleApplyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('Apply Now clicked for job:', job.id);
    console.log('Navigating to:', `/jobs/${job.id}`);
    
    // Option 1: Use callback function (recommended for parent component control)
    if (onNavigateToJob) {
      console.log('Using callback navigation');
      onNavigateToJob(job.id);
      return;
    }
    
    // Option 2: Direct navigation using window.location (fallback)
    console.log('Using window.location navigation');
    window.location.href = `/jobs/${job.id}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getJobTypeIcon = (type: string) => {
    const jobType = jobPostTypes.find((jt) => jt.type === type);
    return jobType ? jobType.icon : faQuestionCircle;
  };

  const getJobTypeGradient = (type: string) => {
    switch (type) {
      case "Auction":
        return "bg-white/5 border-purple-500";
      case "Bounty":
        return "bg-white/5 border-blue-500";
      case "Contract":
        return "bg-white/5 border-orange-500";
      case "Challenge":
        return "bg-white/5 border-white";
      default:
        return "bg-white/5 border-gray-600";
    }
  };

  const getJobTypeColor = (type: string) => {
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

  const formatCompensation = (compensation: string) => {
    const amount = parseFloat(compensation.replace(/[^0-9.-]+/g, ""));
    return amount.toFixed(2);
  };

  const formatProjectLength = (length: string) => {
    const lengthMap: { [key: string]: string } = {
      "<1hour": "Less than 1 hour",
      "1-3hours": "1-3 hours",
      "3-6hours": "3-6 hours",
      "6-12hours": "6-12 hours",
      "12-24hours": "12-24 hours",
      "1-3days": "1-3 days",
      "3-7days": "3-7 days",
      "1-2weeks": "1-2 weeks",
      "2-4weeks": "2-4 weeks",
      ">1month": "More than 1 month",
    };

    return lengthMap[length] || "Unknown";
  };

  const mainContent = (
    <div className="flex flex-row gap-4 items-center w-auto h-20 px-4 py-5">
      <div className="w-8 h-8 flex items-center justify-center">
        <FontAwesomeIcon
          icon={getJobTypeIcon(job.selectedJobPostType)}
          className={`text-2xl ${getJobTypeIconColor(job.selectedJobPostType)}`}
        />
      </div>
      <div className="flex flex-col flex-1 gap-1">
     <h3 className={`text-2xl font-semibold mb-0 mt-0 bg-gradient-to-r ${getJobTypeColor(job.selectedJobPostType)} bg-clip-text text-transparent`}>{job.projectTitle}</h3>

        <div className="flex flex-row items-center gap-1">
          <p className="text-white/80 text-xs">{job.selectedJobPostType}</p>
          <p className="text-white/60">|</p>
          <p className="text-white/80 text-xs">{job.projectType}</p>
          <p className="text-white/60">|</p>
          <p className="text-white/80 text-xs">
            {job.tools.map((tool) => tool.name).join(", ")}
          </p>
          {job.tags.length > 0 && (
            <>
              <p className="text-white/60">|</p>
              <p className="text-white/80 text-xs">{job.tags.join(", ")}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="min-w-[120px] flex flex-col items-center">
          <span className="text-white/70 text-[10px] mb-0.5">
            {getTimeLabel(job.selectedJobPostType)}
          </span>
          <span className={`bg-gradient-to-r ${getJobTypeColor(job.selectedJobPostType)} bg-clip-text text-transparent font-semibold`}>
            {getTimeRemaining(job) || "Closed"}
          </span>
        </div>

        <div className="min-w-[120px] flex flex-col items-center">
          <span className="text-white/70 text-[10px] mb-0.5">
            Estimated Project Length
          </span>
          <span className={`bg-gradient-to-r ${getJobTypeColor(job.selectedJobPostType)} bg-clip-text text-transparent font-semibold`}>
            {formatProjectLength(job.estimatedProjectLength)}
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-white/70 text-[10px] mb-0.5">
            Expected Compensation
          </span>
          <div className="flex items-center text-3xl font-bold">
            <span className={`bg-gradient-to-r ${getJobTypeColor(job.selectedJobPostType)} bg-clip-text text-transparent`}>$</span>
            <span className={`bg-gradient-to-r ${getJobTypeColor(job.selectedJobPostType)} bg-clip-text text-transparent`}>
              {formatCompensation(job.compensation)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleFavoriteClick}
          className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors duration-200"
        >
          <FontAwesomeIcon
            icon={isFavorite ? faHeartSolid : faHeartRegular}
            className={`text-xl ${
              isFavorite
                ? "text-red-600"
                : "text-white/70 hover:text-white"
            }`}
          />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors duration-200"
          >
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="text-xl text-white/70 hover:text-white"
            />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-black border border-white/10 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-white/5 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-white/50 group-hover:text-white transition-colors"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Show me more jobs like this
                  </span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-white/5 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBan}
                    className="text-white/50 group-hover:text-red-500 transition-colors"
                  />
                  <span className="group-hover:text-red-500 transition-colors">
                    Don't show me this type of job
                  </span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-white/5 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="text-white/50 group-hover:text-yellow-500 transition-colors"
                  />
                  <span className="group-hover:text-yellow-500 transition-colors">
                    Report this job
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const expandedContent: ReactNode = (
    <div className="text-white relative">
    
      <div className="flex justify-between gap-4">
        <div className="flex-1 bg-white/5 backdrop-blur-sm p-4 rounded-lg">
          <h3 className="text-xl font-bold mt-0 mb-2 text-white">Project Overview</h3>
          <p className="text-base leading-relaxed text-white/90">{job.projectOverview || "No overview available"}</p>
        </div>
        <div className="w-[40%] bg-white/5 backdrop-blur-sm p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mt-0 mb-4 text-white">Job Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-24 text-white/70">Type:</span>
                  <span className="text-white">{job.selectedJobPostType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-white/70">Project Type:</span>
                  <span className="text-white">{job.projectType}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-white/70">Duration:</span>
                  <span className="text-white">{formatProjectLength(job.estimatedProjectLength)}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-white/70">
                    {getTimeLabel(job.selectedJobPostType)}:
                  </span>
                  <span className="text-white">
                    {getTimeRemaining(job) || "Closed"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mt-0 mb-4 text-white">Project Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 rounded-md text-sm text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">Required Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 rounded-md text-sm text-white/90"
                    >
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-4">
     <button
  onClick={(e) => {
    e.stopPropagation();
    handleFavoriteClick(e);
  }}
  className={`px-6 py-2 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2
    ${isFavorite ? "text-red-600" : "text-white/70 hover:text-white"}`}
>
  <FontAwesomeIcon
    icon={isFavorite ? faHeartSolid : faHeartRegular}
    className={`transition-colors ${isFavorite ? "text-red-600" : ""}`}
  />
  <span className="transition-colors">Add to Interested Jobs</span>
</button>

      <button
        onClick={handleApplyNow}
        className="px-6 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-black rounded-lg transition-colors font-medium"
      >
        Apply Now
      </button>

      </div>
    </div>
  );

  return (
    <ExpandableBox
      expandedContent={expandedContent}
      className={`mx-4 ${getJobTypeGradient(job.selectedJobPostType)} ${
        isExpanded
          ? "hover:brightness-95"
          : "hover:brightness-95 rounded-lg"
      } transition-all duration-300`}
    >
      {mainContent}
    </ExpandableBox>
  );
};

export default JobItem;