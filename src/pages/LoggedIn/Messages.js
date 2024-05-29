import React, { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { app } from '../../firebase'; // Adjust the path to your firebase.js file
import styles from './Messages.module.css';

const auth = getAuth(app);
const firestore = getFirestore(app);

const SignIn = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Save user display name to Firestore
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      displayName: user.displayName.toLowerCase(), // Save display name in lowercase
      email: user.email,
      photoURL: user.photoURL,
    }, { merge: true });
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
};

const Message = ({ message }) => {
  const { text, uid, photoURL, createdAt } = message;
  const messageClass = uid === auth.currentUser.uid ? styles.sent : styles.received;

  return (
    <div className={`${styles.message} ${messageClass}`}>
      <img src={photoURL} alt="profile" />
      <p>{text}</p>
      <span className={styles.dateTime}>{new Date(createdAt.seconds * 1000).toLocaleString()}</span>
    </div>
  );
};

const ChatRoom = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    if (!selectedUser) return;

    console.log("Selected user:", selectedUser);

    const messagesRef = collection(firestore, 'messages', selectedUser.uid, 'conversations');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    await addDoc(collection(firestore, 'messages', selectedUser.uid, 'conversations'), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
  };

  if (!selectedUser) {
    return <div className={styles.chatRoomPlaceholder}>Select a user to start messaging</div>;
  }

  return (
    <div className={styles.chatRoom}>
      <div className={styles.messagesBox}>
        {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

const UserList = ({ users, selectUser, openNewConversation }) => {
  return (
    <div className={styles.userList}>
      <button className={styles.newConversationButton} onClick={openNewConversation}>+</button>
      {users.map(user => (
        <div key={user.uid} className={styles.userListItem} onClick={() => selectUser(user)}>
          <img src={user.photoURL || 'default-profile.png'} alt="Profile" className={styles.userPicture} />
          <span>{user.displayName || user.email}</span>
        </div>
      ))}
    </div>
  );
};

const NewConversationPopup = ({ onClose, onCreateConversation }) => {
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchUsers = async (search) => {
    try {
      console.log("Fetching users for search term:", search);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('displayName', '>=', search), where('displayName', '<=', search + '\uf8ff'));
      const userSnapshot = await getDocs(q);

      if (!userSnapshot.empty) {
        const usersList = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
        console.log("Users found:", usersList);
        setSuggestions(usersList);
      } else {
        console.log("No users found");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const handleInputChange = (e) => {
    const search = e.target.value.toLowerCase(); // Convert search term to lowercase
    setUsername(search);
    if (search) {
      fetchUsers(search);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateConversation(username);
    onClose();
  };

  const handleSuggestionClick = (suggestion) => {
    setUsername(suggestion.displayName);
    setSuggestions([]);
  };

  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <h2>Start New Conversation</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder="Enter username"
            required
          />
          {suggestions.length > 0 ? (
            <ul className={styles.suggestions}>
              {suggestions.map(suggestion => (
                <li key={suggestion.uid} onClick={() => handleSuggestionClick(suggestion)}>
                  {suggestion.displayName}
                </li>
              ))}
            </ul>
          ) : username && (
            <div className={styles.noResults}>No results</div>
          )}
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default function Messages() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      console.log("Auth state changed:", user);
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
        console.log("Fetched users:", usersList);
        setUsers(usersList);
      });

      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  const openNewConversation = () => {
    setIsPopupOpen(true);
  };

  const closeNewConversation = () => {
    setIsPopupOpen(false);
  };

  const createConversation = async (username) => {
    try {
      console.log("Creating conversation with:", username);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('displayName', '==', username));
      const userSnapshot = await getDocs(q);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const newUser = { ...userData, uid: userSnapshot.docs[0].id };

        const currentUser = auth.currentUser;
        if (currentUser) {
          await setDoc(doc(firestore, 'messages', currentUser.uid, 'conversations', newUser.uid), {
            userIds: [currentUser.uid, newUser.uid],
          });

          await setDoc(doc(firestore, 'messages', newUser.uid, 'conversations', currentUser.uid), {
            userIds: [currentUser.uid, newUser.uid],
          });

          setSelectedUser(newUser);
        }
      } else {
        console.log("User not found");
        alert('User not found');
      }
    } catch (error) {
      console.error("Error creating conversation: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.mainContent}>
        {user ? (
          <>
            <UserList users={users} selectUser={setSelectedUser} openNewConversation={openNewConversation} />
            <ChatRoom selectedUser={selectedUser} />
            {isPopupOpen && (
              <NewConversationPopup
                onClose={closeNewConversation}
                onCreateConversation={createConversation}
              />
            )}
          </>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}
