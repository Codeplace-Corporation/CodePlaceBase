// Auth.js
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Auth({ children }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Set the user object
    });

    return () => unsubscribe();
  }, [auth]);

  return children({ isAuthenticated: !!user, user });
}
