import React from 'react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  // Dummy data for recent messages
  const recentMessages = [
    {
      name: 'John Doe',
      profilePicture: 'https://via.placeholder.com/50',
      messagePreview: 'Hello, this is a preview of the message.',
      dateTime: '2024-05-29 10:00 AM',
    },
    {
      name: 'Jane Smith',
      profilePicture: 'https://via.placeholder.com/50',
      messagePreview: 'Here is another message preview.',
      dateTime: '2024-05-29 09:45 AM',
    },
    {
      name: 'Alice Johnson',
      profilePicture: 'https://via.placeholder.com/50',
      messagePreview: 'This is the third message preview.',
      dateTime: '2024-05-29 09:30 AM',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.messagesBox}>
        <h2>Recent Messages</h2>
        {recentMessages.map((message, index) => (
          <div key={index} className={styles.message}>
            <img src={message.profilePicture} alt={`${message.name}'s profile`} className={styles.profilePicture} />
            <div className={styles.messageDetails}>
              <h3>{message.name}</h3>
              <p>{message.messagePreview}</p>
              <span className={styles.dateTime}>{message.dateTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
