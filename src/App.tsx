import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './App.css';
import { Navigate } from 'react-router-dom';
// Import pages and components
import LandingPageMain from './pages/Nologin/homepage/LandingPageMain';
import Navbar from './pages/navbar';
import About from './pages/Nologin/about';

import Messages from './pages/messages/Messages';
import Teams from './pages/LoggedIn/Teams';
import Profile from './pages/profile/Profile';
import CreateAccount from './pages/Nologin/CreateAccount';
import Dashboard from './pages/LoggedIn/Dashboard/DashBoard';
import JobSearch from './pages/jobSearch/JobSearch';
import PostJobs from './pages/LoggedIn/MyJobs/PostJobs';
import JobPostingForm from './pages/LoggedIn/MyJobs/JobPostingForm/JobPostingForm';
import JobDetails from './DataManegment/JobPreview/JobDetails';
import DashboardJobDetails from './pages/LoggedIn/Dashboard/DashboardJobDetails';
import EmailVerificationPage from './pages/EmailVerificationPage';
import Staff from './pages/Staff';
import DiscordRedirect from './pages/DiscordRedirect';
// Context providers
import { AuthProvider } from './context/AuthContext';
import { SignInModalProvider } from './context/SignInModalContext';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';

// Wrapper component to handle draft editing
const JobPostingFormWrapper = ({ closeForm, currentUser }: { closeForm: () => void; currentUser: any }) => {
  const { draftId } = useParams();
  console.log('JobPostingFormWrapper - draftId:', draftId);
  console.log('JobPostingFormWrapper - currentUser:', currentUser);
  return <JobPostingForm closeForm={closeForm} currentUser={currentUser} draftId={draftId} />;
};


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
  const navigate = useNavigate();

  const showNavbar = location.pathname !== "/signIn" && location.pathname !== "/email-verified";

  // Memoize the closeForm function to prevent unnecessary re-renders
  const closeForm = useCallback(() => {
    navigate('/PostJobs');
  }, [navigate]);

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
        <Route path="/job-form" element={<JobPostingForm closeForm={closeForm} currentUser={auth.currentUser} />} />
        <Route path="/job-posting-form/:draftId" element={<JobPostingFormWrapper closeForm={closeForm} currentUser={auth.currentUser} />} />
        <Route path="/Staff" element={<Staff />} />
        <Route path="/discord" element={<DiscordRedirect />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route path="/dashboard/job/:jobId" element={<DashboardJobDetails />} />
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
          <UnsavedChangesProvider>
            <AppContent />
          </UnsavedChangesProvider>
        </SignInModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;