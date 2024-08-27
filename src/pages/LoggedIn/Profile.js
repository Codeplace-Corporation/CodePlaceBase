import React, { useState, useEffect } from "react";
import { signOut, getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";
import styles from "./Profile.module.css"; // Import the CSS module
import { firestore } from "../../firebase";
import { FaCamera } from 'react-icons/fa';

export default function Profile() {
  const auth = getAuth();
  const storage = getStorage();
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  const ProfileCard = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [initialProfileData, setInitialProfileData] = useState({
      displayName: '',
      bio: '',
      skills: [],
      photoURL: '',
    });
    const something = null;
    const [profileData, setProfileData] = useState(initialProfileData);
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const fetchUserData = async () => {
        // if (!user) return;

        try {
          const userDocRef = doc(firestore, "users", user.uid); // Assuming 'users' is the collection
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            console.log('weee',)
            const data = userDocSnap.data();
            setInitialProfileData(data)
            setProfileData(data);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.log('Error fetching user data~!', error);
        } finally {
          setLoading(false);
        }
      }

      fetchUserData();
    }, [user]);

    const handleProfilePictureClick = () => {
      document.getElementById('profilePictureInput').click(); // Trigger the hidden file input
    };
    const handleProfilePictureChange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // 
      const storageRef = ref(storage, 'profile_images/' + auth.currentUser.uid);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // update the profile picture in the Firestore immediately
        const profileDocRef = doc(firestore, "users", user.uid);
        await updateDoc(profileDocRef, { photoURL: downloadURL });
        setProfileData((prevData) => ({
          ...prevData,
          photoURL: downloadURL,
        }));
      } catch (error) {
        console.error("Error uploading profile picture: ", error);
      }
    };
    const handleEditClick = () => setIsEditing(true);
    const handleSaveClick = async () => {
      if (!user || !profileData) return;
      const userDocRef = doc(firestore, 'users', user.uid)
      await updateDoc(userDocRef, profileData);
      setInitialProfileData(profileData);
      setIsEditing(false)
    }
    const handleCancelClick = () => {
      setProfileData(initialProfileData)
      setIsEditing(false)
    }
    const handleChange = (e) => {
      const { name, value } = e.target;
      setProfileData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
    const handleSkillChange = (e) => {
      setNewSkill(e.target.value);
    };
    const addSkill = () => {
      if (newSkill.trim()) {
        setProfileData((prevData) => ({
          ...prevData,
          skills: [...prevData.skills, newSkill],
        }));
        setNewSkill(''); // Clear the input field
      }
    };
    const removeSkill = (skillToRemove) => {
      setProfileData((prevData) => ({
        ...prevData,
        skills: prevData.skills.filter(skill => skill !== skillToRemove),
      }));
    };

    if (loading) {
      return <div>Loading...</div>;
    }
    return (
      <div className={styles["profile-card"]}>
        <h2>My Profile</h2>
        <div
          className={styles['avatar-container']}
          onClick={handleProfilePictureClick} >
          <img
            src={profileData.photoURL}
            alt="Profile"
            className={styles["avatar"]}
          />
          <div className={styles["overlay"]}>
            <FaCamera className={styles["camera-icon"]} />
          </div>
          {/* Hidden File Input */}
          <input
            id="profilePictureInput"
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleProfilePictureChange}
          />
        </div>
        {isEditing ? (
          <input
            name="displayName"
            placeholder="Enter name"
            value={profileData.displayName}
            onChange={handleChange}
            className={styles['input-field']}
          />
        ) :
          (<h2>{profileData.displayName}</h2>)}
        {isEditing ? (
          <textarea
            name="bio"
            placeholder="Enter bio"
            value={profileData.bio}
            onChange={handleChange}
            className={styles["textarea-field"]}
          />
        ) : (
          <p>{profileData.bio}</p>
        )}
        <h3>Skills:</h3>
        <div className={styles["skills"]}>
          {!profileData.skills ? (<div></div>) : (profileData.skills.map((skill, index) => (
            <div key={index}>
              {skill}
              {isEditing && (
                <button
                  className={styles["remove-skill"]}
                  onClick={() => removeSkill(skill)}
                >
                  &times;
                </button>
              )}
            </div>
          )))}


          {isEditing && (
            <div className={styles["add-skill"]}>
              <input
                type="text"
                placeholder="Add a skill"
                value={newSkill}
                onChange={handleSkillChange}
                className={styles["input-field"]}
              />
              <button onClick={addSkill} className={styles["add-skill-button"]}>
                +
              </button>
            </div>
          )}
        </div>
        <h3>Links</h3>
        <div className={styles["links"]}>
          <a href="#">https://linkedin.com/username</a>
          <a href="#">https://linkedin.com/username</a>
          <a href="#">https://linkedin.com/username</a>
        </div>
        {isEditing ? (
          <div className={styles['action-buttons']}>
            <button className={styles["primary"]} onClick={handleSaveClick}>Save</button>
            <button className={styles["secondary"]} onClick={handleCancelClick}>Cancel</button>
          </div>
        ) : (
          <button className={styles["edit-button"]} onClick={handleEditClick}>Edit Profile</button>
        )}

      </div>
    );
  };

  const MainContent = () => {
    const [activeTab, setActiveTab] = useState('developer');

    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
    const getTabClassName = (tab) =>
      `${styles["tab-item"]} ${activeTab === tab ? styles["active"] : ''}`;

    return (
      <div className={styles["main-content"]}>
        <div className={styles["tab-header"]}>
          {["developer", "client"].map((tab) => (
            <div
              key={tab}
              className={getTabClassName(tab)}
              onClick={() => handleTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} Profile
            </div>
          ))}
        </div>
        {/*  */}
        <div className={styles['tab-content']}>
          {activeTab === 'developer' ? (<DeveloperContent />) : (<ClientContent />)}
        </div>
      </div>
    );
  };

  const DeveloperContent = () => {
    return (
      <div className={styles["stat-content"]}>
        <div className={styles["stat-box"]}>
          <h2>Developer Rating</h2>
          <p>1102</p>
          <span>16</span>
        </div>
        <div className={styles["stat-box"]}>
          <h2>Average Review</h2>
          <p>4.9 <sup>2</sup>/5</p>
          <span>213 Reviews</span>
        </div>
        <div className={styles["stat-box"]}>
          <h2>Current Balance</h2>
          <p>$536.69</p>
          <span>Lifetime Earnings: $3,548.39</span>
        </div>
      </div>
    );
  }
  const ClientContent = () => {
    return (
      <div>
        <h2>Client Content goes here</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ProfileCard />
      <MainContent />
    </div>
  );
}
