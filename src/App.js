import './App.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import Home from './pages/Nologin/homepage/home.jsx';
import Navbar from './pages/navbar';
import About from './pages/Nologin/about';
import SignIn from './pages/Nologin/SignIn';
import Messages from './pages/LoggedIn/Messages';
import Teams from './pages/LoggedIn/Teams.js';
import Profile from './pages/LoggedIn/Profile.js';
import CreateAccount from './pages/Nologin/CreateAccount.js';
import LandingPage from './pages/LoggedIn/LandingPage/LandingPage.js';
import JobSearch from './pages/LoggedIn/Search Jobs/JobSearch.js'; // Correct path
import MyJobs from './pages/LoggedIn/MyJobs/MyJobs.js'; // Correct path


const auth = getAuth();

function App() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is on the sign-in page
    const isSignInPage = window.location.pathname === "/signIn";
    // Set showNavbar state based on whether the user is on the sign-in page
    setShowNavbar(!isSignInPage);

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

  const renderPage = () => {
    switch (window.location.pathname) {
      case "/":
        return <Home />;
      case "/about":
        return <About />;
      case "/signIn":
        return <SignIn />;
      case "/Messages":
        return <Messages />;
      case "/LandingPage":
        return <LandingPage />;
      case "/Teams":
        return <Teams />;
      case "/Profile":
        return <Profile />;
      case "/CreateAccount":
        return <CreateAccount />;
      case "/JobSearch":
        return <JobSearch />;
      case "/MyJobs":
        return <MyJobs />;
      default:
        return <Home />; // Default to Home if no route matches
    }
  };

  return (
    <div>
      {showNavbar && <Navbar isAuthenticated={isAuthenticated} />}
      {renderPage()}
    </div>
  );
}

export default App;
