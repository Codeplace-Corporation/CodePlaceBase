import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from './firebase'; // Adjust the path to your firebase.js file

const auth = getAuth(app);
const firestore = getFirestore(app);

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

  return result; // Return the result so we can access user email
};

// Listen for auth state changes
onAuthStateChanged(auth, user => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user);
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});

export { signInWithGoogle };
