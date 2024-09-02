import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";

const count = [0, 0, 0, 0, 0, 0, 0];

const JobSearch = () => {
    return (
        <div>
            <h1>Job Search</h1>
            <p>
                Find jobs optimized for your skillset from our four types{" "}
                <span> | </span>
                <span className="text-white/30">How CodePlace works</span>{" "}
                <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="text-white/30"
                />
            </p>
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
            {/* Add div here for filter-toggle */}
            <div className="flex flex-col gap-2 mt-8 min-h-[550px] max-h-[750px] overflow-y-scroll">
                {/*  */}
                {count.map((c, index) => (
                    <div className="flex flex-row gap-4 items-center w-auto mx-4 bg-card-light h-20 rounded-lg px-4 cursor-pointer">
                        <div className="w-6 h-6 bg-primary"></div>
                        <div className="flex flex-col flex-1 gap-1">
                            <h3>A good job</h3>
                            <div className="flex flex-row items-center gap-1">
                                <p className="text-white/50 text-xs">jobType</p>
                                <p className="text-green-600">|</p>
                                <p className="text-white/50 text-xs">
                                    jobCategory
                                </p>
                                <p className="text-green-600">|</p>
                                <p className="text-white/50 text-xs">
                                    jobTechnology
                                </p>
                                <p className="text-green-600">|</p>
                                <p className="text-white/50 text-xs">jobTags</p>
                            </div>
                        </div>
                        <div className="p-2 rounded-md bg-card text-sm">
                            Unknown 1-3 days
                        </div>
                        <div className="p-2 rounded-md bg-card text-sm text-green-600 font-bold">
                            $1.00
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobSearch;
