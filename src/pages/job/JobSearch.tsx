import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";
import JobItem from "./components/JobItem";
import DropdownButton from "../../components/DropdownButton";
import { categories, jobTypes, tools } from "../../data/jobTypes";
import { useState } from "react";

const JobSearch = () => {
    const [filters, setFilters] = useState({
        type: [""],
        category: [""],
        tools: [""],
        language: "",
        compensation: [0, 10000],
        timing: [0, 85],
    });

    const jobs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const bookmarkedJobs = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    const handleFilterJobTypeItemClicked = (type: string) => {
        setFilters((prevState) => ({
            ...prevState,
            type: prevState.type[0] === type ? [] : [type],
        }));
    };
    const handleCheckboxChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        filterType: "category" | "tools",
    ) => {
        const { name, checked } = e.target;
        setFilters((prevState) => {
            const newFilter = checked
                ? [...prevState[filterType], name]
                : prevState[filterType].filter((item) => item !== name);

            return { ...prevState, [filterType]: newFilter };
        });
    };

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
                <DropdownButton label="Job Type">
                    <div className="m-8 flex flex-row justify-between gap-32">
                        {jobTypes.map((jobtype, index) => (
                            <div
                                key={index}
                                className={`flex flex-col items-center cursor-pointer transition ease-linear ${
                                    filters.type.includes(jobtype.type) &&
                                    "text-accent"
                                }`}
                                onClick={() =>
                                    handleFilterJobTypeItemClicked(jobtype.type)
                                }
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
                            <div className="w-2/5">
                                <label className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        name={cat}
                                        checked={filters.category.includes(cat)}
                                        onChange={(e) =>
                                            handleCheckboxChange(e, "category")
                                        }
                                    />
                                    <span className="absolute w-4 h-4 rounded"></span>
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>
                </DropdownButton>
                <DropdownButton label="Job Tools">
                    <div className="m-8 flex flex-wrap w-[500px] gap-2">
                        {tools.map((tool, index) => (
                            <div className="w-2/5">
                                <label className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        name={tool}
                                        checked={filters.tools.includes(tool)}
                                        onChange={(e) =>
                                            handleCheckboxChange(e, "tools")
                                        }
                                    />
                                    <span className="absolute w-4 h-4 rounded"></span>
                                    {tool}
                                </label>
                            </div>
                        ))}
                    </div>
                </DropdownButton>
                <DropdownButton label="Compensation"></DropdownButton>
                <DropdownButton label="Timing"></DropdownButton>

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
