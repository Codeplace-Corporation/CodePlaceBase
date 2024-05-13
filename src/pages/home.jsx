import React, { useEffect, useState, useRef } from 'react';
import { firestore } from "../firebase";
import { addDoc, collection, getDocs, query, orderBy, limit } from "@firebase/firestore";
import './home.css';

export default function Home() {
  const [topJobs, setTopJobs] = useState([]);
  const ref = collection(firestore, "messages");
  const messageRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(firestore, 'jobs'), orderBy('compensation', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Convert compensation values to numbers
      const sortedData = data.map(job => ({ ...job, compensation: parseFloat(job.compensation) }));
      // Sort by compensation in descending order
      sortedData.sort((a, b) => b.compensation - a.compensation);
      setTopJobs(sortedData);
    };

    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    console.log(messageRef.current.value);
    let data = {
      message: messageRef.current.value,
    };
    try {
      addDoc(ref, data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='Starter'>
      <div className='Starter-top'>
        <p className='Starter-p'>Let's Get To Work</p>
        <p className='Starter-p2'>CodePlace is freelance software marketplace designed to meet developer needs. </p>
        <a href="/signIn">
          <button>Get Started</button>
        </a>
        <a href="/SearchJobs"></a>
        <>
          <a href="/searchJobs">
            <button> Search For Jobs </button>
          </a>
        </>
      </div>
      <div className='Starter-middle'>
        <div className="box-container">
          <div className="box">
            <div className="box-section top-section">
              <p className='TopJob'>Top Jobs</p>
            </div>
            {topJobs.map(job => (
              <div className="box-section" key={job.id}>
                <p>{job.jobTitle}</p>
                <p>$: {job.compensation}</p>
                <p>Posted By: {job.user}</p>
              </div>
            ))}
            <div className="box-section">
              <a href="/seeMore">See More</a>
            </div>
          </div>
          <div className="box">
            {/* Add content for the second box here */}
          </div>
        </div>
      </div>
    </div>
  );
}



/*   <form onSubmit={handleSave}>
        <label>Enter Meassage</label>
        <input type="text" ref={messageRef} />
        <button type="submit">Save</button>
        </form>
        <img src={'GeneralCode.png'} alt="Description of the image" />



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
            <p className='PostSub'>Have an idea you want made, need a bug fixed, feature added, or even help on an existing project? Post a job on CodePlace.</p><ul className='listo'>
              <li><p>Job posts that are optimized to your needs</p></li>
              <li><p>Completion assured by our satisfaction system</p></li>
              <li><p>Pick between qualified developers</p></li>
              <li><p>Get jobs done faster, cheaper, and better than other freelance sites</p></li>
            </ul>
*/