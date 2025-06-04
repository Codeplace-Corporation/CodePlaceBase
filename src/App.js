import './App.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Nologin/homepage/home.jsx';
import Navbar from './pages/navbar';
import About from './pages/Nologin/about';
import SignIn from './pages/Nologin/SignIn';
import Messages from './pages/LoggedIn/Messages';
import Teams from './pages/LoggedIn/Teams.js';
import Profile from './pages/LoggedIn/Profile.js';
import CreateAccount from './pages/Nologin/CreateAccount.js';
import LandingPage from './pages/LoggedIn/LandingPage/LandingPage.js';
import JobSearch from './pages/jobSearch/JobSearch.tsx';
import MyJobs from './pages/LoggedIn/MyJobs/MyJobs.tsx';
import JobDetails from './DataManegment/JobPreview/JobDetails.tsx';

const auth = getAuth();

// Component to handle navbar visibility based on route
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  
  // Hide navbar on sign-in page
  const showNavbar = location.pathname !== "/signIn";

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {showNavbar && <Navbar isAuthenticated={isAuthenticated} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signIn" element={<SignIn />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/Teams" element={<Teams />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/JobSearch" element={<JobSearch />} />
        <Route path="/MyJobs" element={<MyJobs />} />
        {/* Job Details Route */}
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        {/* Fallback route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;