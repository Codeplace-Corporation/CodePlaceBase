// Auth.js
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Auth({ children }) {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set isAuthenticated to true if user exists
      setUser(user); // Set the user object
    });

    return () => unsubscribe();
  }, [auth]);

  // Pass isAuthenticated and user as props to children components
  return children({ isAuthenticated, user });
}
