import React, { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../../../firebase'; // Adjust the path to your firebase.js file
import styles from './LandingPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBell, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const auth = getAuth(app);
const firestore = getFirestore(app);

const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diff = now - date;

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString();
  }
};

const UnreadMessagesWidget = ({ message }) => {
  if (!message) {
    return <h4>No unread messages</h4>;
  }

  const { text, createdAt, sender } = message;
  const formattedDate = formatDate(createdAt);

  return (
    <div className={styles.unreadMessageWidget}>
      <img src={sender.photoURL || 'default-profile.png'} alt="profile" className={styles.profilePicture} />
      <div className={styles.messageDetails}>
        <h4>{sender.displayName}</h4>
        <p>{text}</p>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

const NotificationsWidget = () => {
  return (
    <div>
      <h4>No new notifications</h4>
    </div>
  );
};

const UpcomingDeadlineWidget = () => {
  return (
    <div>
      <h4>No upcoming deadlines</h4>
    </div>
  );
};

const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [mostRecentUnreadMessage, setMostRecentUnreadMessage] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchMostRecentUnreadMessage(user.uid);
      } else {
        setUser(null);
        setMostRecentUnreadMessage(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchMostRecentUnreadMessage = useCallback(async (userId) => {
    const conversationsRef = collection(firestore, 'conversations');
    const q = query(conversationsRef, where('userIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    let mostRecentMessage = null;
    let mostRecentTimestamp = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const messagesRef = collection(firestore, 'conversations', docSnapshot.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const unreadMessages = messagesSnapshot.docs.filter((msg) => {
        const data = msg.data();
        return !data.read && data.uid !== userId;
      });

      for (const msg of unreadMessages) {
        const data = msg.data();
        if (data.createdAt && data.createdAt.seconds > mostRecentTimestamp) {
          mostRecentTimestamp = data.createdAt.seconds;
          mostRecentMessage = data;

          // Fetch the sender's profile picture and username
          const senderRef = doc(firestore, 'users', data.uid);
          const senderSnapshot = await getDoc(senderRef);
          if (senderSnapshot.exists()) {
            const senderData = senderSnapshot.data();
            mostRecentMessage.sender = {
              displayName: senderData.displayName,
              photoURL: senderData.photoURL,
            };
          }
        }
      }
    }

    setMostRecentUnreadMessage(mostRecentMessage);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeHeading}>Welcome back, {user ? user.displayName : 'Guest'}!</h1>
      <div className={styles.subBoxes}>
        <div className={styles.subBox}>
          <h3><FontAwesomeIcon icon={faEnvelope} /> Unread Messages</h3>
          <UnreadMessagesWidget message={mostRecentUnreadMessage} />
        </div>
        <div className={styles.subBox}>
          <h3><FontAwesomeIcon icon={faBell} /> Notifications</h3>
          <NotificationsWidget />
        </div>
        <div className={styles.subBox}>
          <h3><FontAwesomeIcon icon={faCalendarAlt} /> Upcoming Deadline</h3>
          <UpcomingDeadlineWidget />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
