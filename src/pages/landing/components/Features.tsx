import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jobTypes } from "../../../data/jobTypes";

export const Features = () => {
    return (
        <div className="flex-col justify-items-center items-center text-center my-36">
            <h1>Job Posting Optimized for Your Needs </h1>
            <div className="flex flex-wrap justify-center my-5">
                {jobTypes.map((jobtype, index) => (
                    <div
                        key={index}
                        className="flex p-3 m-3 items-center"
                    >
                        <div className="flex justify-center items-center w-12 h-12 border-2 border-primary mx-1 rounded-md">
                            <FontAwesomeIcon
                                icon={jobtype.icon}
                                size="2x"
                            />
                        </div>
                        <div className="h-auto w-0.5 mx-1 bg-primary"></div>
                        <div className="flex flex-col ml-2 text-start">
                            <span className="text-sm">{jobtype.type}</span>
                            <span className="text-sm opacity-60">
                                {jobtype.subheading}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
