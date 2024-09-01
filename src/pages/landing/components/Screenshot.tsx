import JobSearch from "../assets/job_search.png";

export const Screenshot = () => {
    return (
        <div className="flex-col justify-items-center items-center text-center my-36">
            <h1>Advanced Job Search</h1>
            <h2 className="my-5">
                Find The Best Jobs for your skillset and work as much as you{" "}
                <br />
                want when you want without being at the mercy of an algorithm
            </h2>

            <div className="flex justify-center">
                <img
                    className="w-3/5 border border-white/50 rounded-xl"
                    src={JobSearch}
                    alt="undraw-creative-team-r90h"
                />
            </div>
        </div>
    );
};
