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
                const errorCode = error.code;
                alert(errorCode);
            });
    };

    const handleDisplayNameChange = () => {
        updateProfile(auth.currentUser, { displayName: newDisplayName })
            .then(() => {
                // Update user object locally
                setUser({ ...user, displayName: newDisplayName });
                setNewDisplayName('');
            })
            .catch((error) => {
                console.error('Error updating display name:', error);
            });
    };

    const handlePhotoURLChange = () => {
        if (!imageFile) {
            console.error('No image file selected');
            return;
        }
    
        const storageRef = ref(storage, 'profile_images/' + auth.currentUser.uid);
        uploadBytes(storageRef, imageFile)
            .then((snapshot) => {
                if (!snapshot) {
                    throw new Error('No snapshot received after uploading image');
                }
                return getDownloadURL(snapshot.ref);
            })
            .then((downloadURL) => {
                updateProfile(auth.currentUser, { photoURL: downloadURL })
                    .then(() => {
                        setUser({ ...user, photoURL: downloadURL });
                    })
                    .catch((error) => {
                        console.error('Error updating photo URL:', error);
                    });
            })
            .catch((error) => {
                console.error('Error uploading image:', error);
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}> 
            <h1>Welcome, {user.displayName || 'User'}</h1>
            <div className={styles.profile}> 
                <img src={user.photoURL} alt="Profile" className={styles.profileImg} />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button onClick={handlePhotoURLChange} className={styles.button}>Change Profile Picture</button> 
            </div>
            <div className={styles.inputContainer}> 
                <p>Username: {user.displayName || 'User'}</p>
                <input
                    type="text"
                    placeholder="New Username"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className={styles.input} 
                />
                <button onClick={handleDisplayNameChange} className={styles.button}>Change Username</button> 
            </div>
            <button onClick={handleSignOut} className={styles.button}>Sign Out</button> 
        </div>
    );
}
