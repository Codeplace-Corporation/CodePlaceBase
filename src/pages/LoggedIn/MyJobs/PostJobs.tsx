import { useState } from "react";
import JobPostingForm from "./JobPostingForm/JobPostingForm"; // Import your JobPostingForm

const MyJobs = () => {
    // Temporarily use mock user instead of useAuth
    const currentUser = { email: "test@example.com", displayName: "Test User" };
    
    // Debug logging
    console.log("MyJobs component rendering...");
    console.log("Current user:", currentUser);

    const handleCloseJobPostingForm = () => {
        // You can add navigation logic here if needed
        // For now, we'll just keep the form open since it's always displayed
        console.log("Job posting form closed");
    };

    return (
        <>
            
            
            {/* Job Posting Form - Full Page */}
            <div className="min-h-screen w-full">
                <JobPostingForm closeForm={handleCloseJobPostingForm} />
            </div>
        </>
    );
};

export default MyJobs;