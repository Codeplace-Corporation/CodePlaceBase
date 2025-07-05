import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './App.css';
import { Navigate } from 'react-router-dom';
// Import pages and components
import LandingPageMain from './pages/Nologin/homepage/LandingPageMain';
import Navbar from './pages/navbar';
import About from './pages/Nologin/about';

import Messages from './pages/LoggedIn/Messages';
import Teams from './pages/LoggedIn/Teams';
import Profile from './pages/profile/Profile';
import CreateAccount from './pages/Nologin/CreateAccount';
import Dashboard from './pages/LoggedIn/Dashboard/DashBoard';
import JobSearch from './pages/jobSearch/JobSearch';
import PostJobs from './pages/LoggedIn/MyJobs/PostJobs';
import JobDetails from './DataManegment/JobPreview/JobDetails';
import EmailVerificationPage from './pages/EmailVerificationPage';
// Context providers
import { AuthProvider } from './context/AuthContext';
import { SignInModalProvider } from './context/SignInModalContext';


// Type definition for Navbar props
interface NavbarProps {
  isAuthenticated: boolean;
}

// Cast the Navbar import to accept props
const TypedNavbar = Navbar as React.ComponentType<NavbarProps>;


const auth = getAuth();

// Component to handle navbar visibility based on route
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const location = useLocation();

  const showNavbar = location.pathname !== "/signIn" && location.pathname !== "/email-verified";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {showNavbar && <TypedNavbar isAuthenticated={isAuthenticated} />}
      <Routes>
        <Route path="/" element={<LandingPageMain />} />
        <Route path="/about" element={<About />} />
     
        <Route path="/Messages" element={<Messages />} />
        <Route path="/LandingPage" element={<LandingPageMain />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Teams" element={<Teams />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/JobSearch" element={<JobSearch />} />
        <Route path="/PostJobs" element={<PostJobs />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/email-verified" element={<EmailVerificationPage />} />
        <Route path="/__/auth/action" element={<EmailVerificationPage />} />
        <Route path="*" element={<LandingPageMain />} />
        <Route path="/JoinWaitlist" element={<Navigate to="/?showWaitlist=true" replace />} />
      </Routes>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SignInModalProvider>
          <AppContent />
        </SignInModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;