import React, { useEffect, useState, useRef } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, where, getDocs, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase'; // Adjust the path to your firebase.js file
import styles from './Messages.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

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
    <button onClick={signInWithGoogle} className={styles.signInButton}>Sign in with Google</button>
  );
};

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

const Message = ({ message }) => {
  const { text, uid, photoURL, createdAt, fileURL, fileName } = message;
  const messageClass = uid === auth.currentUser.uid ? styles.sent : styles.received;

  return (
    <div className={`${styles.message} ${messageClass}`}>
      <img src={photoURL} alt="profile" />
      <div>
        <p>{text}</p>
        {fileURL && <a href={fileURL} download={fileName}>Download {fileName}</a>}
        {createdAt && (
          <span className={`${styles.dateTime} ${messageClass}`}>
            {formatDate(createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};

const ChatRoom = ({ selectedConversation, updateLastMessage, markMessagesAsRead }) => {
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;

    const messagesRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.read === undefined) {
          data.read = false;
        }
        return { ...data, id: doc.id };
      });
      setMessages(messages);
      setTimeout(scrollToBottom, 0);

      // Mark messages as read when the conversation is opened
      await markMessagesAsRead(selectedConversation.id, messages);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;

    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    const conversationRef = doc(firestore, 'conversations', selectedConversation.id);

    let fileURL = null;
    let fileName = null;

    if (file) {
      const fileRef = ref(storage, `conversations/${selectedConversation.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      fileURL = await getDownloadURL(fileRef);
      fileName = file.name;
    }

    const newMessage = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
      fileURL,
      fileName,
      read: false
    };

    await addDoc(collection(conversationRef, 'messages'), newMessage);

    await updateDoc(conversationRef, {
      lastMessage: newMessage,
    });

    setFormValue('');
    setFile(null);
    scrollToBottom();

    updateLastMessage(selectedConversation.id, newMessage);
  };

  const handleTextareaChange = (e) => {
    setFormValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!selectedConversation) {
    return <div className={styles.chatRoomPlaceholder}>Please select a conversation to begin messaging</div>;
  }

  return (
    <div className={styles.chatRoom}>
      <div className={styles.messagesBox}>
        {messages && messages.map(msg => <Message key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.chatRoomForm} onSubmit={sendMessage}>
        <div className={styles.inputContainer}>
          <label className={styles.fileInputLabel}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className={styles.fileInput}
            />
            <FontAwesomeIcon icon={faPaperclip} />
          </label>
          <textarea
            value={formValue}
            onChange={handleTextareaChange}
            placeholder="Type a message"
            required
            className={styles.messageInput}
            rows="1"
          />
          <button type="submit" disabled={!formValue.trim()} className={styles.sendButton}>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </form>
    </div>
  );
};

const ConversationList = ({ conversations, selectConversation, selectedConversationId, updateLastMessage, searchTerm, setSearchTerm }) => {
  const [menuOpen, setMenuOpen] = useState(null);

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.userIds.find(id => id !== auth.currentUser.uid);
    const otherUserName = conversation.displayName?.[otherUser] || conversation.email?.[otherUser] || "Unknown User";
    return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const deleteConversation = async (conversationId) => {
    await deleteDoc(doc(firestore, 'conversations', conversationId));
  };

  const toggleMenu = (conversationId) => {
    setMenuOpen(menuOpen === conversationId ? null : conversationId);
  };

  return (
    <div className={styles.conversationListContainer}>
      <div className={styles.conversationList}>
        {filteredConversations.map(conversation => {
          const otherUser = conversation.userIds.find(id => id !== auth.currentUser.uid);
          const otherUserName = conversation.displayName?.[otherUser] || conversation.email?.[otherUser] || "Unknown User";
          const unreadCount = conversation.messages?.filter(msg => !msg.read && msg.uid !== auth.currentUser.uid).length || 0;
          return (
            <div
              key={conversation.id}
              className={`${styles.conversationListItem} ${conversation.id === selectedConversationId ? styles.selectedConversation : ''}`}
              onClick={() => selectConversation(conversation)}
            >
              <img src={conversation.photoURL || 'default-profile.png'} alt="Profile" className={styles.conversationPicture} />
              <div className={styles.conversationDetails}>
                <div className={styles.conversationHeader}>
                  <span className={styles.conversationName}>{otherUserName}</span>
                  <span className={styles.conversationDate}>{conversation.lastMessage ? formatDate(conversation.lastMessage.createdAt) : ''}</span>
                </div>
                <div className={styles.conversationLastMessage}>
                  {conversation.lastMessage ? conversation.lastMessage.text : ''}
                </div>
                {unreadCount > 0 && (
                  <div className={styles.notificationCircle}>{unreadCount}</div>
                )}
              </div>
              <div className={styles.conversationActions}>
                <button
                  className={styles.menuButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(conversation.id);
                  }}
                  title="More options"
                >
                  ⋮
                </button>
                {menuOpen === conversation.id && (
                  <div className={styles.menu}>
                    <button onClick={() => alert('Mute conversation')}>Mute conversation</button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                    >
                      Delete conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NewConversationPopup = ({ onClose, onCreateConversation }) => {
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async (search) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('displayName', '>=', search), where('displayName', '<=', search + '\uf8ff'));
      const userSnapshot = await getDocs(q);

      if (!userSnapshot.empty) {
        const usersList = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
        setSuggestions(usersList);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const handleInputChange = (e) => {
    const search = e.target.value.toLowerCase();
    setUsername(search);
    setErrorMessage('');
    if (search) {
      fetchUsers(search);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username === auth.currentUser.displayName.toLowerCase()) {
      setErrorMessage('You cannot create a conversation with yourself.');
      return;
    }
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
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
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
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      const conversationsRef = collection(firestore, 'conversations');
      const q = query(
        conversationsRef,
        where('userIds', 'array-contains', user.uid)
      );
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const conversationsList = [];
        for (const docSnapshot of snapshot.docs) {
          const messagesRef = collection(firestore, 'conversations', docSnapshot.id, 'messages');
          const messagesSnapshot = await getDocs(messagesRef);
          const messages = messagesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          const lastMessage = messages[messages.length - 1];
          conversationsList.push({
            id: docSnapshot.id,
            messages,
            lastMessage,
            ...docSnapshot.data(),
          });
        }
        conversationsList.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt?.seconds ?? 0;
          const bTime = b.lastMessage?.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setConversations(conversationsList);
      });

      return () => unsubscribe();
    };

    fetchConversations();
  }, [user]);

  const openNewConversation = () => {
    setIsPopupOpen(true);
  };

  const closeNewConversation = () => {
    setIsPopupOpen(false);
  };

  const createConversation = async (username) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('displayName', '==', username));
      const userSnapshot = await getDocs(q);

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        const newUser = { ...userData, uid: userSnapshot.docs[0].id };

        const currentUser = auth.currentUser;
        if (currentUser) {
          const conversationId = [currentUser.uid, newUser.uid].sort().join('_');
          const conversationRef = doc(firestore, 'conversations', conversationId);
          await setDoc(conversationRef, {
            userIds: [currentUser.uid, newUser.uid],
            displayName: {
              [currentUser.uid]: currentUser.displayName,
              [newUser.uid]: newUser.displayName,
            },
            email: {
              [currentUser.uid]: currentUser.email,
              [newUser.uid]: newUser.email,
            },
            photoURL: newUser.photoURL,
          });

          setSelectedConversation({ id: conversationId, userIds: [currentUser.uid, newUser.uid], displayName: newUser.displayName, photoURL: newUser.photoURL });
        }
      } else {
        alert('User not found');
      }
    } catch (error) {
      console.error("Error creating conversation: ", error);
    }
  };

  const updateLastMessage = (conversationId, newMessage) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId ? { ...conversation, lastMessage: newMessage } : conversation
      )
    );
  };

  const markMessagesAsRead = async (conversationId, messages) => {
    const unreadMessages = messages.filter(msg => !msg.read && msg.uid !== auth.currentUser.uid);

    const batch = writeBatch(firestore);
    unreadMessages.forEach(msg => {
      const msgRef = doc(firestore, 'conversations', conversationId, 'messages', msg.id);
      batch.update(msgRef, { read: true });
    });

    await batch.commit();

    // Update the local state
    setConversations(prevConversations =>
      prevConversations.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map(msg =>
                unreadMessages.find(unreadMsg => unreadMsg.id === msg.id)
                  ? { ...msg, read: true }
                  : msg
              )
            }
          : conversation
      )
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {user && (
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search conversations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.newConversationButton} onClick={openNewConversation}>+</button>
          </div>
        )}
        <div className={styles.headerTitle}>Messenger</div>
      </header>
      <section className={styles.mainContent}>
        {user ? (
          <>
            <ConversationList
              conversations={conversations}
              selectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation?.id}
              updateLastMessage={updateLastMessage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <div className={styles.chatRoomContainer}>
              <ChatRoom
                selectedConversation={selectedConversation}
                updateLastMessage={updateLastMessage}
                markMessagesAsRead={markMessagesAsRead}
              />
            </div>
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
