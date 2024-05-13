import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions
import styles from './CreateAccount.module.css';

function CreateAccount() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore instance

  const handleCreateAccount = async () => {
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // Check if email is already registered
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      const isEmailTaken = !emailSnapshot.empty;

      if (isEmailTaken) {
        setError('Email is already registered');
        setLoading(false);
        return;
      }

      // Check if username is already taken
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      const isUsernameTaken = !usernameSnapshot.empty;

      if (isUsernameTaken) {
        setError('Username is already taken');
        setLoading(false);
        return;
      }

      // Password validation criteria
      const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

      if (!passwordPattern.test(password)) {
        setError(
          'Password must be at least 8 characters long and contain at least one numeral and one special character'
        );
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "/LogLand";
      console.log('User created:', userCredential.user);
    } catch (error) {
      setError(error.message);
      console.error('Error creating account:', error);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h2>Create an Account</h2>
      {error && <p className={styles.error}>{error}</p>}
      <label>Username:</label>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} required />
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} required />
      <label>Password:</label>
      <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} required />
      <label>Confirm Password:</label>
      <input type="text" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={styles.input} required />
      <button onClick={handleCreateAccount} className={styles.button} disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </div>
  );
}

export default CreateAccount;
