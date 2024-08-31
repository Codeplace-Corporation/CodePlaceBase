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
        await createUserWithEmailAndPassword(auth, email, password).then(
            async (credential) =>
                await updateProfile(credential.user, {
                    displayName: displayName,
                }),
        );
    };

    const loginWithGoogle = async () => {
        await signInWithPopup(auth, googleProvider);
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
