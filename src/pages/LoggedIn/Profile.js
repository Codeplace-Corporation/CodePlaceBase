import React, { useState, useEffect } from "react";
import { signOut, getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, getFirestore } from "firebase/firestore";
import styles from "./Profile.module.css"; // Import the CSS module
import { firestore } from "../../firebase";

export default function Profile() {
  const auth = getAuth();
  const storage = getStorage();
  const [user, setUser] = useState(auth.currentUser);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const ProfileCard = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [initialProfileData, setInitialProfileData] = useState({
      displayName: '',
      bio: '',
      skills: [],
    });
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
        <img
          src={profileData.photoURL}
          alt="Profile"
          className={styles["avatar"]}
        />
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
          {profileData.skills.map((skill, index) => (
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
          ))}

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

// export default function Profile() {
//     const auth = getAuth();
//     const storage = getStorage();
//     const [user, setUser] = useState(auth.currentUser);
//     const [newDisplayName, setNewDisplayName] = useState('');
//     const [imageFile, setImageFile] = useState(null);

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged((user) => {
//             setUser(user);
//         });

//         return () => {
//             unsubscribe();
//         };
//     }, [auth]);

//     const handleSignOut = () => {
//         signOut(auth)
//             .then(() => {
//                 // Redirect to homepage
//                 window.location.pathname = '/';
//             })
//             .catch((error) => {
//                 console.error('Error signing out:', error);
//                 alert(error.message);
//             });
//     };

//     const handleDisplayNameChange = () => {
//         if (!newDisplayName.trim()) {
//             alert('Display name cannot be empty');
//             return;
//         }

//         updateProfile(auth.currentUser, { displayName: newDisplayName })
//             .then(() => {
//                 // Update user object locally
//                 setUser((prevUser) => ({ ...prevUser, displayName: newDisplayName }));
//                 setNewDisplayName('');
//             })
//             .catch((error) => {
//                 console.error('Error updating display name:', error);
//                 alert(error.message);
//             });
//     };

//     const handlePhotoURLChange = () => {
//         if (!imageFile) {
//             alert('Please select an image file');
//             return;
//         }

//         const storageRef = ref(storage, 'profile_images/' + auth.currentUser.uid);
//         uploadBytes(storageRef, imageFile)
//             .then((snapshot) => getDownloadURL(snapshot.ref))
//             .then((downloadURL) => {
//                 return updateProfile(auth.currentUser, { photoURL: downloadURL }).then(() => downloadURL);
//             })
//             .then((downloadURL) => {
//                 setUser((prevUser) => ({ ...prevUser, photoURL: downloadURL }));
//             })
//             .catch((error) => {
//                 console.error('Error updating photo URL:', error);
//                 alert(error.message);
//             });
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setImageFile(file);
//         }
//     };

//     if (!user) {
//         return <div>Loading...</div>;
//     }

//     const UserActivities = () => {
//         return (
//           <div>
//             <h3>User Activities</h3>
//             {/* Render activities */}
//           </div>
//         );
//     }

//     const UserPosts = () => {
//         return (
//           <div>
//             <h3>User Posts</h3>
//             {/* Render posts */}
//           </div>
//         );
//     }

//     const ProfileForm = () => {
//       return (
//         <form className={styles['profile-form']}>
//           <label>
//             Name:
//             <input type="text" name="name" />
//           </label>
//           <label>
//             Bio:
//             <input type="email" name="email" />
//           </label>
//         </form>
//       );
//     };

//     const ProfileDetails = () => {
//       const [isFormVisible, setFormVisible] = useState(false);

//       const toggleFormVisibility = () => {
//       setFormVisible(!isFormVisible);
//       };

//         return (
//           <div>
//             <button onClick={toggleFormVisibility} className={styles['toggle-form-button']}>
//                {isFormVisible ? 'Finish' : 'Edit Profile'}
//             </button>
//             {isFormVisible && <ProfileForm />}
//           </div>
//         );
//       }

//   const ProfileInfo = () => {
//     return (
//       <div>
//         <h2>{user.displayName}</h2>
//         <p> Bio Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
//       </div>
//     );
//   }

//   const ProfileSkills = () => {
//     const skills = [
//       'Java', 'Javascript', 'Python', 'Blender',
//     'Golang', 'Web Development', 'UI Design', 'Game Development', 'Flutter'
//     ];

//     return (
//       <div>
//         <h2>Skills:</h2>
//         <div className={ styles['skills']}>
//           {skills.map((skill, index) => (
//             <div className={styles['skill']} key={index}>{skill}</div>
//           ))}
//       </div>
//       </div>
//     );
//   }

//     const ProfileName = () => {
//         return (
//           <div>
//             <h2>{user.displayName}</h2>
//           </div>
//         );
//       }

//     const ProfilePicture = () => {
//         return (
//           <div>
//             <img src={user.photoURL} alt="Profile" className={styles['main-profile-img']} />
//           </div>
//         );
//     }

//   const ProfileActionButtons = () => {
//     return (
//       <div>
//         <button className={ styles['edit-button'] } >Edit Profile</button>
//       </div>
//     );
//   }

//     const ProfileRating = () => {
//       return (
//         <div className={styles.horizontalBar}>
//           <div className={styles.box}>Rating</div>
//           <div className={styles.box}>Info</div>
//           <div className={styles.box}>Other</div>
//         </div>
//       );
//     };

//     const MainContent = () => {
//         const [activeTab, setActiveTab] = useState('Developer');
//         const handleTabClick = (tab) => {
//           setActiveTab(tab);
//         };

//         return (
//         <div className={styles['main-content']}>
//           <div className={styles.tabs}>
//             <button
//               className={`${styles.tab} ${activeTab === 'Developer' ? styles.active : ''}`}
//               onClick={() => handleTabClick('Developer')}
//             >
//             Developer
//         </button>
//         <button
//           className={`${styles.tab} ${activeTab === 'info2' ? styles.active : ''}`}
//           onClick={() => handleTabClick('info2')}
//         >
//           Client
//         </button>
//       </div>
//       <div className={styles['tab-content']}>
//         {activeTab === 'Developer' && <Developer />}
//         {activeTab === 'info2' && <Client />}
//       </div>
//           </div>
//         );
//       }
//       const Developer = () => {
//         return(
//         <div>
//             <ProfileRating />
//             <UserPosts />
//             <UserActivities />

//         </div>
//       );
//       }
//       const Client = () => (
//         <div>
//           <h2>Client</h2>
//           <p>This is the content for client </p>
//           {/* Add more modules as needed */}
//         </div>
//       );

//     const Sidebar = () => {
//         return (
//           <div className={styles.sidebar}>
//             <div>
//               <h2>My Profile</h2>
//             </div>
//             <ProfilePicture />
//             {/* <ProfileName /> */}
//             <ProfileInfo />
//             <ProfileSkills />
//             <ProfileActionButtons />
//             {/* <ProfileDetails /> */}
//             {/* Add more modules as needed */}
//           </div>
//         );
//       }

//     const ProfilePage = () => {
//         return (
//           <div className="container">
//             <Sidebar />
//             <MainContent />
//           </div>
//         );
//     }

//     return (
//         <div className={styles.container}>
//             <Sidebar />
//             <MainContent />
//         </div>
//     );
// }
