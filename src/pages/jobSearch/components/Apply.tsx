import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faGavel, 
    faGift, 
    faFileContract, 
    faTrophy, 
    faQuestionCircle,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import StyledButton from '../../../components/styled/StyledButton';

// Type definitions
interface Tool {
    name: string;
}

interface Job {
    id: string;
    projectTitle: string;
    projectType: string;
    tools: Tool[];
    tags: string[];
    selectedJobPostType: string;
    compensation: string;
    estimatedProjectLength: string;
    projectDescription: string;
}

const jobPostTypes = [
    { type: "Auction", icon: faGavel },
    { type: "Bounty", icon: faGift },
    { type: "Contract", icon: faFileContract },
    { type: "Challenge", icon: faTrophy },
];

const formatProjectLength = (length: string): string => {
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
        ">1month": "More than 1 month"
    };
    
    return lengthMap[length] || "Unknown";
};

const Apply: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { job }: { job?: Job } = location.state || {};

    if (!job) {
        return (
            <div className="text-center text-white mt-8">
                <p>Job not found</p>
                <StyledButton
                    onClick={() => navigate('/jobs')}
                    className="mt-4"
                >
                    Back to Jobs
                </StyledButton>
            </div>
        );
    }

    const getJobTypeIcon = (type: string) => {
        const jobType = jobPostTypes.find(jt => jt.type === type);
        return jobType ? jobType.icon : faQuestionCircle;
    };

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mr-4 text-white/50 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                </button>
                <h1 className="text-3xl font-bold">Apply for Job</h1>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-3 gap-8 mb-8 bg-[rgba(255,255,255,0.1)] p-6 rounded-lg">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                        <FontAwesomeIcon 
                            icon={getJobTypeIcon(job.selectedJobPostType)} 
                            className="text-accent"
                        />
                        {job.projectTitle}
                    </h2>
                    <p className="text-white/70 text-base leading-relaxed">
                        {job.projectDescription}
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Job Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="w-32 text-white/50">Type:</span>
                                <span>{job.selectedJobPostType}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32 text-white/50">Project Type:</span>
                                <span>{job.projectType}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32 text-white/50">Duration:</span>
                                <span>{formatProjectLength(job.estimatedProjectLength)}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-32 text-white/50">Compensation:</span>
                                <span className="flex items-center">
                                    <span className="text-[#00ff00]">$</span>
                                    <span>{job.compensation}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Required Tools</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.tools.map((tool: Tool, index: number) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-[#0D0D0D] rounded-md text-sm"
                                >
                                    {tool.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4">Project Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag: string, index: number) => (
                                <span 
                                    key={index}
                                    className="px-3 py-1 bg-[#0D0D0D] rounded-md text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Form Section */}
            <div className="bg-[rgba(255,255,255,0.1)] p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Your Application</h2>
                {/* Add your application form here */}
                <div className="flex justify-end mt-6">
                    <StyledButton 
                        variant="success"
                        className="w-48"
                    >
                        Submit Application
                    </StyledButton>
                </div>
            </div>
        </div>
    );
};

export default Apply;