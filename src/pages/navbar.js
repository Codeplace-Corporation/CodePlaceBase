import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { signInWithGoogle } from '../Auth'; // Ensure the correct path
import './Navbar.css';

const auth = getAuth();

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
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
    <nav className={`nav ${isScrolled ? 'semi-transparent' : ''}`}>
      <div className="nav-left">
        <a href={isAuthenticated ? "/LandingPage" : "/"}>
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
          <a onClick={signInWithGoogle}>Sign In / Create Account</a>
        ) : (
          <div
            className="profile-menu"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleDropdown}
          >
            <div className="profile-info">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="profile-picture"
                />
              )}
              <span>{user?.displayName || user?.email}</span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown">
                <a href="/Profile">Profile</a>
                <a href="/Profile">Settings</a>
                <a href="/logout">Logout</a>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
