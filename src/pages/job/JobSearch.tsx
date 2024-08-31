import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";

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
        </div>
    );
};

export default JobSearch;
