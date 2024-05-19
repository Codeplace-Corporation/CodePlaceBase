import React, { useEffect, useState, useRef } from 'react';
import { firestore } from "../../../firebase";
import { addDoc, collection, getDocs, query, orderBy, limit } from "@firebase/firestore";
import './home.css';
import TopJobsComponent from './TopJobsComponent'; // Import TopJobsComponent

export default function Home() {
  const [topJobs, setTopJobs] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const ref = collection(firestore, "messages");
  const messageRef = useRef();

  useEffect(() => {
    const fetchJobs = async () => {
      const q = query(collection(firestore, 'jobs'), orderBy('compensation', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = data.map(job => ({ ...job, compensation: parseFloat(job.compensation) }));
      sortedData.sort((a, b) => b.compensation - a.compensation);
      setTopJobs(sortedData);
    };

    const fetchUsers = async () => {
      const q = query(collection(firestore, 'users'), orderBy('monthlyEarnings', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = data.map(user => ({ ...user, monthlyEarnings: parseFloat(user.monthlyEarnings) }));
      sortedData.sort((a, b) => b.monthlyEarnings - a.monthlyEarnings);
      setTopUsers(sortedData);
    };

    fetchJobs();
    fetchUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    let data = {
      message: messageRef.current.value,
    };
    try {
      await addDoc(ref, data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='Starter'>
      <div className='Starter-top'>
        <p className='Starter-p'>Let's Get To Work</p>
        <p className='Starter-p2'>CodePlace is a freelance software marketplace designed to meet developer needs.</p>
        <a href="/signIn">
          <button>Get Started</button>
        </a>
      </div>
      <div className='Starter-middle'>
        <div className="box-container">
          <div className="box">
            <div className="box-section top-section">
              <p className='TopJob'>Top Jobs</p>
            </div>
            {topJobs.map(job => (
              <TopJobsComponent // Render TopJobsComponent for each job
                key={job.id}
                title={job.jobTitle}
                username={job.userName}
                price={job.compensation}
                timeRemaining={job.timeRemaining}
              />
            ))}
          </div>
          <div className="box">
            <div className="box-section top-section">
              <p className='TopUser'>Top Users</p>
            </div>
            {topUsers.map(user => (
              <div className="box-section" key={user.id}>
                <div className="user-info">
                  <span className="user-name">{user.userName}</span>
                  <span className="monthly-earnings">$: {user.monthlyEarnings}</span>
                </div>
              </div>
            ))}
            <div className="box-section">
              <a href="/seeMore">See More</a>
            </div>
          </div>
        </div>
      </div>
  
      <img className='codeexample' src={'GeneralCode.png'} alt="Description of the image" />
      <h2>Start Developing</h2>
      <p className='DevSub'>Ready to work? Browse through available jobs, apply, and start earning!</p>
      <ul className='listotwo'>
        <li><p>Find jobs that match your skills and interests</p></li>
        <li><p>Get hired based on your qualifications</p></li>
        <li><p>Work on projects you're passionate about</p></li>
        <li><p>Earn money doing what you love</p></li>
      </ul>

      <img className='codelogo' src={'CodeLogo.png'} alt="Description of the image" />
      <h2>Post a Job</h2>
      <p className='PostSub'>Have an idea you want made, need a bug fixed, feature added, or even help on an existing project? Post a job on CodePlace.</p>
      <ul className='listo'>
        <li><p>Job posts that are optimized to your needs</p></li>
        <li><p>Completion assured by our satisfaction system</p></li>
        <li><p>Pick between qualified developers</p></li>
        <li><p>Get jobs done faster, cheaper, and better than other freelance sites</p></li>
      </ul>
    </div>
  );
}
