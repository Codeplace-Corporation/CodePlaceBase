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

const Dashboard = () => {
    const { currentUser } = useAuth();

    const JobsPane = () => {
        const tabs = ["Active Jobs", "Applied Jobs"];
        const [activeTab, setActiveTab] = useState("Active Jobs");

        return (
            <div className="flex flex-col flex-1 h-80 bg-card-light rounded-lg">
                <div className="flex flex-row px-5 py-3 gap-1 border-b border-card-dark">
                    {/* <p className="font-semibold text-white/50">
                        Active Jobs Overview
                    </p> */}
                    {tabs.map((tab, index) => (
                        <StyledButton
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

    return (
        <div className=" flex flex-col pb-10">
            {/* Head */}
            <h2 className="text-3xl mb-3 mt-3 font-normal">
                Welcome back, {currentUser?.displayName} 👋
            </h2>
            {/* Purple Pane */}
            <div className="w-full rounded-lg bg-primary p-2">
                {/* <h2 className="text-3xl mb-3 mt-3 font-normal">
                    Welcome back, {currentUser?.displayName} 👋
                </h2> */}
                <div className="flex flex-row gap-5">
                    {metrics.map((metric, index) => (
                        <div className="flex-1 rounded-md bg-black/20 p-2 flex flex-col">
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
                <div className="flex flex-col flex-1 h-80 bg-card-light rounded-lg">
                    <div className="px-5 py-3 border-b border-card-dark">
                        <p className="font-semibold text-white/50">
                            Something else should come here
                        </p>
                    </div>
                </div>
            </div>
            {/* Bottom Pane */}
            <div className="w-full bg-card-light rounded-lg mt-3 mb-6 min-h-52 "></div>
        </div>
    );
};
export default Dashboard;
