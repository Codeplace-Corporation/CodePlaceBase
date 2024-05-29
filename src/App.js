import './App.css';
import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from 'react';
import Home from './pages/Nologin/homepage/home.jsx';
import Navbar from './pages/navbar';
import SearchJob from './pages/Nologin/searchJob';
import About from './pages/Nologin/about';
import SignIn from './pages/Nologin/SignIn';
import Messages from './pages/LoggedIn/Messages';
import Teams from './pages/LoggedIn/Teams.js';
import SearchJobs from './pages/LoggedIn/Jobpage.js';
import Auth from './Auth';
import { BrowserRouter as Router } from "react-router-dom";
import Profile from './pages/LoggedIn/Profile.js';
import CreateAccount from './pages/Nologin/CreateAccount.js';
import LandingPage from './pages/LoggedIn/LandingPage/LandingPage.js';

function App() {
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Check if the user is on the sign-in page
    const isSignInPage = window.location.pathname === "/signIn";
    // Set showNavbar state based on whether the user is on the sign-in page
    setShowNavbar(!isSignInPage);
  }, []);

  return (
    <>
    <Router>
      <Auth>
        {({ isAuthenticated }) => showNavbar && <Navbar isAuthenticated={isAuthenticated} />}
      </Auth>
      
      {/* Render different components based on the route */}
      {(() => {
        switch (window.location.pathname) {
          case "/":
            return <Home />;
          case "/about":
            return <About />;
          case "/searchJobs":
            return  <SearchJobs />;
          case "/SearchJobs": // consider different case
            return <SearchJobs />;
          case "/signIn":
            return <SignIn />;
          case "/Messages":
            return <Messages />;
            case "/LandingPage" :
             return <LandingPage />;
             case "/Teams" :
             return <Teams />;
           case "/Profile":
            return <Profile />;
          case "/CreateAccount":
            return <CreateAccount />;
          
          default:
            return null;
        }
      })()}
      
      </Router>
    </>
  );
}

export default App;
