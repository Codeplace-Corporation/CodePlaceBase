

import React from 'react';
import Auth from '../Auth';
export default function Navbar({isAuthenticated}) {

return <nav className="nav">
{isAuthenticated ? (<a href="/LogLand" className="site-title"><img border="0" alt="CodePlace" src="CodeLogo.png" width="50" /></a>):(<a href="/" className="site-title"><img border="0" alt="CodePlace" src="CodeLogo.png" width="50" /></a>)}

{isAuthenticated ? (
  <ul>
 
  <li>
<a href="/SearchJobs">Search Jobs</a>
</li>
<li>
<a href="/MyJobs">My Jobs</a>
</li>


<li>
<a href="/Messages">Messages</a>
</li>
<li>
<a href="/Profile">Profile</a>
</li>
</ul>
      ):(
      
        <ul>
        <li>
        <a href="/searchJobs">Search Jobs</a>
      </li>
      <li>
      <a href="/about">About</a>
        </li>
        <li>
      <a href="/signIn">Sign In</a>
        </li>
        </ul>
      )}
</nav>
}