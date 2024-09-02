import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";
import JobItem from "./components/JobItem";

const JobSearch = () => {
    const jobs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const bookmarkedJobs = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    const JobList = ({ jobs }: { jobs: any[] }) => {
        return (
            <>
                {jobs.map((job, index) => (
                    <JobItem />
                ))}
            </>
        );
    };

    return (
        <div className="pt-16 pb-16">
            <div>
                <h1>Job Search</h1>
                <p>
                    Find jobs optimized for your skillset from our four types{" "}
                    <span> | </span>
                    <span className="text-white/30">
                        How CodePlace works
                    </span>{" "}
                    <FontAwesomeIcon
                        icon={faCircleQuestion}
                        className="text-white/30"
                    />
                </p>
            </div>
            <div className="flex flex-row gap-2 items-center mt-4">
                <StyledButton
                    size="small"
                    variant="primary"
                    children={
                        <>
                            Job Types{" "}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="ml-1 text-accent transition ease-linear transform"
                            />
                        </>
                    }
                />
                <StyledButton
                    size="small"
                    variant="primary"
                    children={
                        <>
                            Job Categories{" "}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="ml-1 text-accent transition ease-linear transform"
                            />
                        </>
                    }
                />
                <StyledButton
                    size="small"
                    variant="primary"
                    children={
                        <>
                            Job Tools{" "}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="ml-1 text-accent transition ease-linear transform"
                            />
                        </>
                    }
                />
                <StyledButton
                    size="small"
                    variant="primary"
                    children={
                        <>
                            Compensation{" "}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="ml-1 text-accent transition ease-linear transform"
                            />
                        </>
                    }
                />
                <StyledButton
                    size="small"
                    variant="primary"
                    children={
                        <>
                            Timing{" "}
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className="ml-1 text-accent transition ease-linear transform"
                            />
                        </>
                    }
                />
                <StyledInput
                    variant="filled"
                    className="flex-1"
                    inputSize="small"
                    placeholder="Search jobs"
                />
                <StyledButton
                    size="small"
                    variant="success"
                    children={"Reset Search"}
                />
            </div>

            <div className="flex flex-col gap-2 mt-8 h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-white/15">
                <JobList jobs={jobs} />
            </div>
            <div className="mt-8">
                <h2 className="text-accent font-bold">Interested Jobs</h2>
                <div className="flex flex-col gap-2 mt-4 max-h-[550px] overflow-y-scroll scrollbar-thin scrollbar-thumb-accent scrollbar-track-white/15">
                    <JobList jobs={bookmarkedJobs} />
                </div>
            </div>
        </div>
    );
};

export default JobSearch;
