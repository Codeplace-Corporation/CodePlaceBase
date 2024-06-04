import React, { useState, useEffect } from 'react';
import { signOut, getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './Profile.module.css'; // Import the CSS module

export default function Profile() {
    const auth = getAuth();
    const storage = getStorage();
    const [user, setUser] = useState(auth.currentUser);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, [auth]);

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                // Redirect to homepage
                window.location.pathname = '/';
            })
            .catch((error) => {
                console.error('Error signing out:', error);
                alert(error.message);
            });
    };

    const handleDisplayNameChange = () => {
        if (!newDisplayName.trim()) {
            alert('Display name cannot be empty');
            return;
        }

        updateProfile(auth.currentUser, { displayName: newDisplayName })
            .then(() => {
                // Update user object locally
                setUser((prevUser) => ({ ...prevUser, displayName: newDisplayName }));
                setNewDisplayName('');
            })
            .catch((error) => {
                console.error('Error updating display name:', error);
                alert(error.message);
            });
    };

    const handlePhotoURLChange = () => {
        if (!imageFile) {
            alert('Please select an image file');
            return;
        }

        const storageRef = ref(storage, 'profile_images/' + auth.currentUser.uid);
        uploadBytes(storageRef, imageFile)
            .then((snapshot) => getDownloadURL(snapshot.ref))
            .then((downloadURL) => {
                return updateProfile(auth.currentUser, { photoURL: downloadURL }).then(() => downloadURL);
            })
            .then((downloadURL) => {
                setUser((prevUser) => ({ ...prevUser, photoURL: downloadURL }));
            })
            .catch((error) => {
                console.error('Error updating photo URL:', error);
                alert(error.message);
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    const UserActivities = () => {
        return (
          <div>
            <h3>User Activities</h3>
            {/* Render activities */}
          </div>
        );
    }

    const UserPosts = () => {
        return (
          <div>
            <h3>User Posts</h3>
            {/* Render posts */}
          </div>
        );
    }

    const ProfileForm = () => {
      return (
        <form className={styles['profile-form']}>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          <label>
            Bio:
            <input type="email" name="email" />
          </label>
        </form>
      );
    };

    const ProfileDetails = () => {
      const [isFormVisible, setFormVisible] = useState(false);

      const toggleFormVisibility = () => {
      setFormVisible(!isFormVisible);
      };

        return (
          <div>
            <button onClick={toggleFormVisibility} className={styles['toggle-form-button']}>
               {isFormVisible ? 'Finish' : 'Edit Profile'}
            </button>
            {isFormVisible && <ProfileForm />}
          </div>
        );
      }

    const ProfileName = () => {
        return (
          <div>
            <h2>Welcome, {user.displayName}</h2>
          </div>
        );
      }      

    const ProfilePicture = () => {
        return (
          <div>
            <img src={user.photoURL} alt="Profile" className={styles['main-profile-img']} />
          </div>
        );
      }
    
    const ProfileRating = () => {
      return (
        <div className={styles.horizontalBar}>
          <div className={styles.box}>Rating</div>
          <div className={styles.box}>Info</div>
          <div className={styles.box}>Other</div>
        </div>
      );
    };
      
    const MainContent = () => {
        const [activeTab, setActiveTab] = useState('Developer');
        const handleTabClick = (tab) => {
          setActiveTab(tab);
        };
        
        return (
        <div className={styles['main-content']}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'Developer' ? styles.active : ''}`}
              onClick={() => handleTabClick('Developer')}
            >
            Developer
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'info2' ? styles.active : ''}`}
          onClick={() => handleTabClick('info2')}
        >
          Client
        </button>
      </div>
      <div className={styles['tab-content']}>
        {activeTab === 'Developer' && <Developer />}
        {activeTab === 'info2' && <Client />}
      </div>
          </div>
        );
      }
      const Developer = () => {
        return(
        <div>
            <ProfileRating />
            <UserPosts />
            <UserActivities />
         
        </div>
      );
      }
      const Client = () => (
        <div>
          <h2>Client</h2>
          <p>This is the content for client </p>
          {/* Add more modules as needed */}
        </div>
      );
      

    const Sidebar = () => {
        return (
          <div className={styles.sidebar}>
            <ProfilePicture />
            <ProfileName />
            <ProfileDetails />
            {/* Add more modules as needed */}
          </div>
        );
      }

    const ProfilePage = () => {
        return (
          <div className="container">
            <Sidebar />
            <MainContent />
          </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <MainContent />
        </div>
    );
}
