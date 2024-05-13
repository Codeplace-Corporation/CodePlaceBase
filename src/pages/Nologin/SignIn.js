import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { GoogleAuthProvider, signInWithPopup, signOut, getAuth } from "firebase/auth";
import { app } from '../../firebase';
import './SignStyle.css';
import { Link } from 'react-router-dom';

function SignIn() {
  const [user, setUser] = useState(null);

  const provider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const SIGN_IN_WITH_GOOGLE = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
        window.location.href = "/LogLand"; // Redirect to the home page after sign in
      })
      .catch((error) => {
        const errorCode = error.code;
        alert(errorCode);
      });
  };

  const SIGN_OUT = () => {
    signOut(auth)
      .then(() => {
        setUser(null); // Clear user state after sign-out
      })
      .catch((error) => {
        const errorCode = error.code;
        alert(errorCode);
      });
  };

  return (
    <div>
      <div className='SignInBackground'>
        <div className="SignIn">
        
          <h1>
          <a href="/">
            <img src="CodeLogo.png" alt="Logo" />
            </a>
          </h1>
          <h2>Sign In to CodePlace</h2>
          <div className='App'>
            {user ? (
              <div className='profile'>
                <h1>{user.displayName}</h1>
                
                <img src={user.photoURL} alt="user" />
                <button onClick={SIGN_OUT}>Sign Out</button>
              </div>
            ) : (
              <>
                <label className='label1'>Username or email address</label>
                <input className="SignIn-input" type={"email"} placeholder="Please enter your email" />
                <label className='label1'>Password</label>
                <input className="SignIn-input" type={"password"} placeholder="Please enter password" />
                <button className="SignIn-button">Sign in</button>
                <p className="SignIn-text">or</p>
                <button onClick={SIGN_IN_WITH_GOOGLE} className='google'>
                  Sign with Google
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    
      <div className='SecondBox'>
      <p class='newacc'>New To codeplace? <a href="/CreateAccount" class="blue-text">Create an account</a></p>

  
        <p className='forgot'>Forgot Username/Password</p>
      </div>
    </div>
  );
}

export default SignIn;
