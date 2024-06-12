import React, { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { app } from '../../../firebase';
import styles from './LandingPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBell, faCalendarAlt, faBriefcase } from '@fortawesome/free-solid-svg-icons';

const auth = getAuth(app);
const firestore = getFirestore(app);
const localizer = momentLocalizer(moment);

const UnreadMessagesWidget = ({ count }) => (
  <div className={styles.unreadMessageWidget}>
    {count > 0 ? (
      <p>You have {count} unread {count > 1 ? 'messages' : 'message'}</p>
    ) : (
      <p>No unread messages</p>
    )}
  </div>
);

const NotificationsWidget = ({ count }) => (
  <div className={styles.notificationsWidget}>
    <p>{count > 0 ? `You have ${count} new notifications` : 'No new notifications'}</p>
  </div>
);

const UpcomingDeadlineWidget = ({ count }) => (
  <div className={styles.upcomingDeadlineWidget}>
    <p>{count > 0 ? `You have ${count} upcoming deadlines` : 'No upcoming deadlines'}</p>
  </div>
);

const CurrentJobsWidget = ({ jobs }) => (
  <div className={styles.currentJobsWidget}>
    <h2>Current Jobs</h2>
    {jobs.length > 0 ? (
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>{job}</li>
        ))}
      </ul>
    ) : (
      <p>No current jobs</p>
    )}
  </div>
);

const AppliedJobsWidget = ({ jobs }) => (
  <div className={styles.appliedJobsWidget}>
    <h2>Applied Jobs</h2>
    {jobs.length > 0 ? (
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>{job}</li>
        ))}
      </ul>
    ) : (
      <p>No applied jobs</p>
    )}
  </div>
);

const CalendarWidget = ({ events, onSelectEvent }) => (
  <div className={styles.calendarWidget}>
    <h2>Calendar</h2>
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 400 }}
      onSelectEvent={onSelectEvent}
    />
  </div>
);

const PastJobsWidget = ({ jobs }) => (
  <div className={styles.pastJobsWidget}>
    <h2>Past Jobs</h2>
    {jobs.length > 0 ? (
      <ul>
        {jobs.map((job, index) => (
          <li key={index}>{job}</li>
        ))}
      </ul>
    ) : (
      <p>No past jobs</p>
    )}
  </div>
);

const CustomArrow = ({ onClick, direction }) => (
  <button
    onClick={onClick}
    className={`${styles.customArrow} ${direction === 'left' ? styles.leftArrow : styles.rightArrow}`}
  />
);

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [deadlinesCount, setDeadlinesCount] = useState(0);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUnreadMessagesCount(user.uid);
        fetchNotificationsCount(user.uid);
        fetchDeadlinesCount(user.uid);
        fetchCurrentJobs(user.uid);
        fetchAppliedJobs(user.uid);
        fetchPastJobs(user.uid);
        fetchCalendarEvents(user.uid);
      } else {
        setUser(null);
        setUnreadMessagesCount(0);
        setNotificationsCount(0);
        setDeadlinesCount(0);
        setCurrentJobs([]);
        setAppliedJobs([]);
        setPastJobs([]);
        setEvents([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchUnreadMessagesCount = useCallback(async (userId) => {
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(conversationsRef, where('userIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    let totalUnreadCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const messagesRef = collection(firestore, 'conversations', docSnapshot.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const unreadMessages = messagesSnapshot.docs.filter((msg) => {
        const data = msg.data();
        return !data.read && data.uid !== userId;
      });

      totalUnreadCount += unreadMessages.length;
    }

    setUnreadMessagesCount(totalUnreadCount);
  }, []);

  const fetchNotificationsCount = useCallback(async (userId) => {
    const notificationsCount = 5; // Placeholder value
    setNotificationsCount(notificationsCount);
  }, []);

  const fetchDeadlinesCount = useCallback(async (userId) => {
    const deadlinesCount = 3; // Placeholder value
    setDeadlinesCount(deadlinesCount);
  }, []);

  const fetchCurrentJobs = useCallback(async (userId) => {
    const jobsRef = collection(firestore, 'jobs');
    const q = query(jobsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const jobs = querySnapshot.docs.map((doc) => doc.data().jobTitle);
    setCurrentJobs(jobs);
  }, []);

  const fetchAppliedJobs = useCallback(async (userId) => {
    const appliedJobsRef = collection(firestore, 'appliedJobs');
    const q = query(appliedJobsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const jobs = querySnapshot.docs.map((doc) => doc.data().jobTitle);
    setAppliedJobs(jobs);
  }, []);

  const fetchPastJobs = useCallback(async (userId) => {
    const pastJobsRef = collection(firestore, 'pastJobs');
    const q = query(pastJobsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const jobs = querySnapshot.docs.map((doc) => doc.data().jobTitle);
    setPastJobs(jobs);
  }, []);

  const fetchCalendarEvents = useCallback(async (userId) => {
    const eventsRef = collection(firestore, 'events');
    const q = query(eventsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        title: data.title,
        start: data.start.toDate(),
        end: data.end.toDate(),
        allDay: data.allDay,
      };
    });
    setEvents(events);
  }, []);

  const handleSelectEvent = (event) => {
    alert(`Schedule for ${event.title}`);
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overallBox}>
        <h1 className={styles.globalHeading}>Welcome Back, {user ? user.displayName : 'Guest'}!</h1>
        <div className={styles.sliderContainer}>
          <Carousel 
            responsive={responsive} 
            infinite={true} 
            showDots={true} 
            dotListClass={styles.customDots} 
            itemClass={styles.carouselItem}
            customLeftArrow={<CustomArrow direction="left" />}
            customRightArrow={<CustomArrow direction="right" />}
          >
            <div className={styles.carouselItem}>
              <div className={styles.subBox}>
                <div className={styles.subBoxHeader}>
                  <p><FontAwesomeIcon icon={faEnvelope} /> Unread Messages</p>
                  {unreadMessagesCount > 0 && (
                    <div className={styles.notificationCircle}>{unreadMessagesCount}</div>
                  )}
                </div>
                <div className={styles.subBoxContent}>
                  <UnreadMessagesWidget count={unreadMessagesCount} />
                </div>
              </div>
            </div>
            <div className={styles.carouselItem}>
              <div className={styles.subBox}>
                <div className={styles.subBoxHeader}>
                  <p><FontAwesomeIcon icon={faBell} /> Notifications</p>
                  {notificationsCount > 0 && (
                    <div className={styles.notificationCircle}>{notificationsCount}</div>
                  )}
                </div>
                <div className={styles.subBoxContent}>
                  <NotificationsWidget count={notificationsCount} />
                </div>
              </div>
            </div>
            <div className={styles.carouselItem}>
              <div className={styles.subBox}>
                <div className={styles.subBoxHeader}>
                  <p><FontAwesomeIcon icon={faCalendarAlt} /> Upcoming Deadline</p>
                  {deadlinesCount > 0 && (
                    <div className={styles.notificationCircle}>{deadlinesCount}</div>
                  )}
                </div>
                <div className={styles.subBoxContent}>
                  <UpcomingDeadlineWidget count={deadlinesCount} />
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </div>
      <div className={styles.currentJobsContainer}>
        <CurrentJobsWidget jobs={currentJobs} />
      </div>
      <div className={styles.calendarAppliedContainer}>
        <div className={styles.calendarWidgetContainer}>
          <CalendarWidget events={events} onSelectEvent={handleSelectEvent} />
        </div>
        <div className={styles.appliedJobsWidgetContainer}>
          <AppliedJobsWidget jobs={appliedJobs} />
        </div>
      </div>
      <div className={styles.pastJobsContainer}>
        <PastJobsWidget jobs={pastJobs} />
      </div>
    </div>
  );
};

export default LandingPage;
