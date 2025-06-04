/* eslint-disable no-restricted-globals */
import { Navigate, Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../utils/firebase";
import { useEffect } from "react";
import Landing from "../pages/landing/Landing";
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import JobSearch from "../pages/jobSearch/JobSearch";
import Profile from "../pages/profile/Profile";
import Messages from "../pages/messages/Messages";
import Dashboard from "../pages/dashboard";
import JobDetails from "../DataManegment/JobPreview/JobDetails";
import MyJobs from "../pages/LoggedIn/MyJobs/MyJobs";

const ProtectedRoute = () => {
    // If user is not authenticated, return user to homepage
    // Otherwise, proceed
    return auth.currentUser ? (
        <Outlet />
    ) : (
        <Navigate
            to="/"
            replace
        />
    );
};

const NoNav = () => (
    <>
        <Outlet />
    </>
);

const Router = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (
            auth.currentUser &&
            (location.pathname === "/" ||
                location.pathname === "/login" ||
                location.pathname === "/signup" ||
                location.pathname === "/forgot-password")
        )
            navigate("/dashboard");
    }, [navigate, location.pathname]);

    return (
        <Routes>
            <Route element={<NoNav />}>
                {/* Unprotected Routes [home, about, privacy, login, signup, forgot password] */}
                <Route
                    path="/"
                    element={<Landing />}
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
                {/* Add MyJobs routes - handle both URL patterns */}
                <Route
                    path="/my-jobs"
                    element={<MyJobs />}
                />
                <Route
                    path="/MyJobs"
                    element={<MyJobs />}
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
                    <Route
                        path="jobs"
                        element={<MyJobs />}
                    />
                </Route>

                <Route
                    path="*"
                    element={<h1>404, page not found</h1>}
                />
            </Route>
        </Routes>
    );
};

export default Router;