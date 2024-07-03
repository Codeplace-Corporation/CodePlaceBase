import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faCrosshairs, faFileContract, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { firestore, collection, addDoc } from '../../../firebase'; // Adjusted import to match your configuration file
import './home.css';

const jobTypes = [
  { type: "Auction", icon: faGavel, subheading: "Optimized for Price" },
  { type: "Bounty", icon: faCrosshairs, subheading: "Optimized for Time" },
  { type: "Contract", icon: faFileContract, subheading: "Optimized for Control" },
  { type: "Challenge", icon: faTrophy, subheading: "Optimized for Creativity " },
];

export default function Home() {
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showPolicyInfo, setShowPolicyInfo] = useState({ open: false, content: '' });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const toggleWaitlistForm = () => setShowWaitlistForm(!showWaitlistForm);
  const toggleContactInfo = () => setShowContactInfo(!showContactInfo);
  const openPolicyInfo = (content) => setShowPolicyInfo({ open: true, content });
  const closePolicyInfo = () => setShowPolicyInfo({ open: false, content: '' });

  const handleJoinWaitlist = async () => {
    try {
      await addDoc(collection(firestore, 'waitlist'), { email, phone });
      alert('You have been added to the waitlist!');
      setShowWaitlistForm(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <div className='homepagediv'>
      <h1 className='hometitle'>Find Developers To Build Your Ideas</h1>
      <h2 className='subtitleone'>
        Connecting Clients to Developers Through Job Posts Optimized for Client Need and <br />
        The Software Development Process.
      </h2>
      <div className='homebtns'>
        <button className='homebtnclient'>For Clients</button>
        <button className='homebtndev'>For Developers</button>
      </div>

      <h2 className='subtitleone'></h2>
      <h1 className='hometitletypetwo'>Advanced Job Search</h1>
      <h2 className='subtitletwo'>
        Find The Best Jobs for your skillset and work as much as you <br />
        want when you want without being at the mercy of an algorithm
      </h2>
      <img className='homeimg' src="JobSearch.png" alt="undraw-creative-team-r90h" border="0" />
      <h1 className='hometitle'>Job Posting Optimized for Your Needs</h1>

      <div className='icon-list'>
        {jobTypes.map((jobType, index) => (
          <div key={index} className='icon-container'>
            <div className='icon-box'>
              <FontAwesomeIcon icon={jobType.icon} size="2x" />
            </div>
            <div className='vertical-line'></div>
            <div className='icon-text-container'>
              <span className='icon-text'>{jobType.type}</span>
              <span className='icon-subheading'>{jobType.subheading}</span>
            </div>
          </div>
        ))}
      </div>
      <h2 className='hometitletypetwo'>Get Started With CodePlace</h2>
      <button className='waitbutton' onClick={toggleWaitlistForm}>Join Waitlist</button>
      
      {showWaitlistForm && (
        <div className='popup'>
          <h2>Join Waitlist</h2>
          <form>
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Phone:
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
            <button type="button" onClick={handleJoinWaitlist}>Submit</button>
          </form>

        </div>
      )}

      {showContactInfo && (
        <div className='popup'>
          <h2>Contact Us</h2>
          <p>Email: diegorafaelpitt@gmail.com</p>
          <p>Phone: 612-666-1948</p>
          <button onClick={toggleContactInfo}>Close</button>
        </div>
      )}

      {showPolicyInfo.open && (
        <div className='popup'>
          <h2>{showPolicyInfo.content}</h2>
          <p>{showPolicyInfo.content === 'Terms of Service' ? 'Please Dont Sue Us.' : 'Like I am being so fr right now like I have 0 Money If you sue me I will cry'}</p>
          <button onClick={closePolicyInfo}>Close</button>
        </div>
      )}

      <footer className='footer'>
        <div className='footer-content'>
          <p>&copy; 2024 CodePlace. All Rights Reserved.</p>
          <div className='footer-links'>
            <a href='#' onClick={() => openPolicyInfo('Terms of Service')}>Terms of Service</a>
            <a href='#' onClick={() => openPolicyInfo('Privacy Policy')}>Privacy Policy</a>
            <a href='#' onClick={toggleContactInfo}>Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
