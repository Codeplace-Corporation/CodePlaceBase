import React from 'react';
import './Navbar.css';

export default function Navbar({ isAuthenticated }) {
  return (
    <nav className="nav">
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
              <li>
                <a href="/Profile">Profile</a>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="nav-right">
        {!isAuthenticated ? (
          <>

            <a href="/signIn">Sign In</a>
          </>
        ) : (
          <a href="/logout">Logout</a>
        )}
      </div>
    </nav>
  );
}
