import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faBell,
    faCalendarAlt,
} from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../context/AuthContext";
import {
    faChevronCircleRight,
    faFileContract,
} from "@fortawesome/free-solid-svg-icons";
import { ActiveJobItem, AppliedJobItem } from "./components/JobItem";
import { useState } from "react";
import StyledButton from "../../components/styled/StyledButton";
// FIXED: Changed from "../job/components/JobItem" to "../jobSearch/components/JobItem"
import JobItem from "../jobSearch/components/JobItem";

const metrics = [
    {
        icon: faEnvelope,
        title: "Unread messages",
        value: "You have 0 unread messages",
    },
    {
        icon: faBell,
        title: "Notifications",
        value: "You have 5 new notifications",
    },
    {
        icon: faCalendarAlt,
        title: "Upcoming Deadline",
        value: "You have 3 upcoming deadline",
    },
];
const activeJobs = [
    {
        title: "A good project",
        client: "A weird client",
        deadline: "15-Sep-2024",
        status: "IN PROGRESS",
        type: "Contract",
        stack: "React",
        completedMilestones: 3,
        totalMilestones: 5,
    },
];
const appliedJobs = [
    {
        title: "A good project",
        client: "A weird client",
        type: "Contract",
        stack: "React",
        totalMilestones: 5,
        duration: "3 weeks",
        icon: faFileContract,
    },
];

// Sample job data for JobItem component
const sampleJob = {
    id: "sample-job-1",
    projectTitle: "Build a React Dashboard",
    projectType: "Frontend",
    tools: [{ name: "React" }, { name: "TypeScript" }, { name: "Tailwind CSS" }],
    tags: ["urgent", "remote"],
    selectedJobPostType: "Contract",
    compensation: "2500.00",
    estimatedProjectLength: "2-4weeks",
    projectDescription: "We're looking for an experienced React developer to build a modern dashboard application with real-time data visualization and responsive design.",
    applicationsCloseTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

const Dashboard = () => {
    const { currentUser } = useAuth();

    const JobsPane = () => {
        const tabs = ["Active Jobs", "Applied Jobs"];
        const [activeTab, setActiveTab] = useState("Active Jobs");

        return (
            <div className="flex flex-col flex-1 h-96 bg-card-light rounded-lg">
                <div className="flex flex-row px-5 py-3 gap-1 border-b border-card-dark">
                    {tabs.map((tab, index) => (
                        <StyledButton
                            key={index}
                            size="small"
                            variant={`${
                                activeTab === tab ? "primary" : "inactive"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </StyledButton>
                    ))}
                </div>
                <div className="flex-1 h-full overflow-scroll">
                    {activeTab === tabs[0] &&
                        activeJobs.map((job, index) => (
                            <ActiveJobItem
                                key={index}
                                title={job.title}
                                client={job.client}
                                deadline={job.deadline}
                                stack={job.stack}
                                totalMilestones={job.totalMilestones}
                                completedMilestones={job.completedMilestones}
                                status={job.status}
                            />
                        ))}
                    {activeTab === tabs[1] &&
                        appliedJobs.map((job, index) => (
                            <AppliedJobItem
                                key={index}
                                title={job.title}
                                client={job.client}
                                duration={job.duration}
                                stack={job.stack}
                                totalMilestones={job.totalMilestones}
                                type={job.type}
                                icon={job.icon}
                            />
                        ))}
                </div>
            </div>
        );
    };
    const RightPane = () => {
        const tabs = ["Upcoming Deadlines"];
        const [activeTab, setActiveTab] = useState(tabs[0]);

        return (
            <div className="flex flex-col flex-1 h-96 bg-card-light rounded-lg">
                <div className="flex flex-row px-5 py-3 gap-1 border-b border-card-dark">
                    {tabs.map((tab, index) => (
                        <StyledButton
                            key={index}
                            size="small"
                            variant={`${
                                activeTab === tab ? "primary" : "inactive"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </StyledButton>
                    ))}
                </div>
                <div className="flex-1 h-full overflow-scroll">
                    <div className="flex flex-row py-4 px-5 items-center border-b border-card-dark hover:bg-card-dark cursor-pointer">
                        <div className="flex flex-col justify-center items-center pr-5 mr-5 border-r border-card">
                            <p className="text-2xl">20</p>
                            <p className="text-md">Dec</p>
                        </div>
                        <div className="flex flex-col items-start">
                            <h3>Deliverable Name</h3>
                            <p className="text-white/50 text-xs">
                                Project: Project Name
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const BottomPane = () => { 
        const tabs = ['Job Recommendations'];
        const [activeTab, setActiveTab] = useState(tabs[0]);

        return (
            <div className="flex flex-col flex-1 bg-card-light rounded-lg">
                <div className="flex flex-row px-5 py-3 gap-1 border-b border-card-dark">
                    {tabs.map((tab, index) => (
                        <StyledButton
                            key={index}
                            size="small"
                            variant={`${
                                activeTab === tab ? "primary" : "inactive"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </StyledButton>
                    ))}
                </div>
                <div className="flex-1 h-full overflow-scroll">
                    <JobItem job={sampleJob} />
                </div>
            </div>
        );
    };

    return (
        <div className=" flex flex-col pb-10">
            {/* Head */}
            <h2 className="text-3xl mb-3 mt-3 font-normal">
                Welcome back, {currentUser?.displayName} 👋
            </h2>
            {/* Purple Pane */}
            <div className="w-full rounded-lg bg-primary p-2">
                <div className="flex flex-row gap-5">
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex-1 rounded-md bg-black/20 p-2 flex flex-col">
                            <div className="flex flex-row items-center">
                                <h3 className="flex-1 font-bold">
                                    <FontAwesomeIcon
                                        icon={metric.icon}
                                        className="mr-2"
                                    />
                                    {metric.title}
                                </h3>
                                <FontAwesomeIcon
                                    icon={faChevronCircleRight}
                                    className="cursor-pointer"
                                />
                            </div>
                            <p className="text-center mt-5">{metric.value}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Middle Side-By-Side Pane */}
            <div className="w-full flex flex-row gap-4 mt-3">
                <JobsPane />
                <RightPane />
            </div>
            {/* Bottom Pane */}
            <div className="w-full flex flex-row bg-card-light rounded-lg mt-3 mb-6 min-h-52">
                <BottomPane />
            </div>
        </div>
    );
};
export default Dashboard;