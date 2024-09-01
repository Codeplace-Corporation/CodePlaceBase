/* eslint-disable no-restricted-globals */
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { useEffect } from "react";
import Landing from "../pages/landing/Landing";
import { Login } from "../pages/auth/Login";
import { Signup } from "../pages/auth/Signup";
import JobSearch from "../pages/job/JobSearch";
import Profile from "../pages/profile/Profile";
import Messages from "../pages/messages/Messages";

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

    useEffect(() => {
        if (
            auth.currentUser &&
            (location.pathname === "/login" ||
                location.pathname === "/signup" ||
                location.pathname === "/forgot-password")
        )
            navigate("/");
    }, [navigate]);

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
                <Route
                    path="*"
                    element={<h1>404, page not found</h1>}
                />
            </Route>
            <Route element={<ProtectedRoute />}>
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
                    element={<h1>404, page not found</h1>}
                />
            </Route>

            <Route
                path="*"
                element={<h1>404, page not found</h1>}
            />
        </Routes>
    );
};

export default Router;
