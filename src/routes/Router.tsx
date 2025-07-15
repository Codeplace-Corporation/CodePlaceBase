/* eslint-disable no-restricted-globals */
import { Navigate, Outlet, Route, Routes, useNavigate, useLocation, useParams } from "react-router-dom";
import { auth } from "../utils/firebase";
import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import JobSearch from "../pages/jobSearch/JobSearch";
import Profile from "../pages/profile/Profile";
import Messages from "../pages/messages/Messages";
import Dashboard from "../pages/dashboard";
import JobDetails from "../DataManegment/JobPreview/JobDetails";
import PostJobs from "../pages/LoggedIn/MyJobs/PostJobs";
import JobPostingForm from "../pages/LoggedIn/MyJobs/JobPostingForm/JobPostingForm";
import DashboardJobDetails from "../pages/LoggedIn/Dashboard/DashboardJobDetails";

// Wrapper component to handle draft editing
const JobPostingFormWrapper = ({ closeForm, currentUser }: { closeForm: () => void; currentUser: any }) => {
  const { draftId } = useParams();
  console.log('JobPostingFormWrapper - draftId:', draftId);
  console.log('JobPostingFormWrapper - currentUser:', currentUser);
  return <JobPostingForm closeForm={closeForm} currentUser={currentUser} draftId={draftId} />;
};

const ProtectedRoute = () => {
    // If user is not authenticated, return user to homepage
    // Otherwise, proceed
    if (!auth.currentUser) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

const NoNav = () => (
    <>
        <Outlet />
    </>
);

const Router = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(auth.currentUser);

    // Memoize the closeForm function to prevent infinite re-renders
    const closeForm = useCallback(() => {
        navigate('/PostJobs');
    }, [navigate]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (
            user &&
            (location.pathname === "/" ||
                location.pathname === "/login" ||
                location.pathname === "/signup" ||
                location.pathname === "/forgot-password")
        ) {
            navigate("/dashboard");
        }
    }, [navigate, location.pathname, user]);

    return (
        <Routes>
            <Route element={<NoNav />}>
                {/* Unprotected Routes [home, about, about, privacy, login, signup, forgot password] */}
                <Route
                    path="/"
                    element={<Dashboard />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/signup"
                    element={<Signup />}
                />
                <Route
                    path="/jobs"
                    element={<JobSearch />}
                />
                {/* Job Details Route - Make sure this comes AFTER the /jobs route */}
                <Route
                    path="/jobs/:jobId"
                    element={<JobDetails />}
                />
                <Route
                    path="*"
                    element={<h1>404, page not found</h1>}
                />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/PostJobs"
                    element={<PostJobs />}
                />

                <Route
                    path="/job-form"
                    element={<JobPostingForm closeForm={closeForm} currentUser={user} />}
                />
                {/* Only use the wrapper for editing drafts */}
                <Route
                    path="/job-posting-form/:draftId"
                    element={<JobPostingFormWrapper closeForm={closeForm} currentUser={user} />}
                />
             
                <Route path="/profile">
                    <Route
                        index
                        element={<Profile />}
                    />
                    <Route
                        path="messages"
                        element={<Messages />}
                    />
                   
                </Route>

                <Route
                    path="*"
                    element={<div>404 - Protected route not found. Current path: {location.pathname}</div>}
                />
            </Route>
        </Routes>
    );
};

export default Router;