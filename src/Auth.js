// Auth.js
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Auth({ children }) {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set isAuthenticated to true if user exists
    });

    return () => unsubscribe();
  }, [auth]);

  // Pass isAuthenticated as a prop to children components
  return children({ isAuthenticated });
}
