import React, { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import { updateWaitlistStatus } from "../utils/waitlistUtils";

interface AuthContextProps {
    currentUser: User | null;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (
        email: string,
        password: string,
        displayName: string,
    ) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signupWithEmail = async (
        email: string,
        password: string,
        displayName: string,
    ) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user profile with display name
        await updateProfile(credential.user, {
            displayName: displayName,
        });

        // Update waitlist status if email exists in waitlist
        await updateWaitlistStatus(email);
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        
        // Update waitlist status if email exists in waitlist
        if (result.user.email) {
            await updateWaitlistStatus(result.user.email);
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        currentUser,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
    };
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
