// Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import Auth from '../Auth'; // Update the path to Auth.js
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState(""); // State to hold the username
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <Auth>
      {({ isAuthenticated, user }) => {
        if (isAuthenticated && user) {
          setUsername(user.displayName || user.email); // Use displayName or email if username not available
        }
        return (
          <nav className={`nav ${isScrolled ? 'semi-transparent' : ''}`}>
            <div className="nav-left">
              <a href={isAuthenticated ? "/LogLand" : "/"}>
                <img src="CodeLogo.png" alt="CodePlace" />
              </a>
            </div>
            <div className="nav-center">
              <ul>
                <li>
                  <a href="/searchJobs">Browse Jobs</a>
                </li>
                <li>
                  <a href="/MyJobs">For Developers</a>
                </li>
                <li>
                  <a href="/MyJobs">For Clients</a>
                </li>
                <li>
                  <a href="/About">Teams</a>
                </li>
                <li>
                  <a href="/MyJobs">About</a>
                </li>
                {isAuthenticated && (
                  <>
                    <li>
                      <a href="/MyJobs">My Jobs</a>
                    </li>
                    <li>
                      <a href="/Messages">Messages</a>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div className="nav-right">
              {!isAuthenticated ? (
                <a href="/signIn">Sign In / Create Account</a>
              ) : (
                <div
                  className="profile-menu"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={toggleDropdown}
                >
                  <div className="profile-info">
                    <span>{username}</span> {/* Display username here */}
                    <span className="arrow">&#9662;</span> {/* Unicode for down arrow */}
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown">
                      <a href="/Profile">Profile</a>
                      <a href="/logout">Logout</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        );
      }}
    </Auth>
  );
}
