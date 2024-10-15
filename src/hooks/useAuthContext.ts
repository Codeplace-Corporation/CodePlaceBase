import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FirebaseError } from "firebase/app";

export const useAuthStatus = () => {
    const { currentUser } = useAuth();
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoggedIn(!!currentUser);
        setLoading(false);
    }, [currentUser]);

    return { loggedIn, loading };
};

export const useLoginWithEmail = () => {
    const { loginWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoginWithEmail = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await loginWithEmail(email, password);
        } catch (err) {
            setError("Failed to log in");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleLoginWithEmail, loading, error };
};

export const useLoginWithGoogle = () => {
    const { loginWithGoogle } = useAuth();

    const handleLoginWithGoogle = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Google login failed", error);
            throw error;
        }
    };

    return { handleLoginWithGoogle };
};

// Hook to handle sign-up
export const useSignUpWithEmail = () => {
    const { signupWithEmail } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (
        email: string,
        password: string,
        displayName: string,
    ) => {
        setLoading(true);
        setError(null);
        try {
            await signupWithEmail(email, password, displayName);
        } catch (err) {
            console.log(` Error is :: ${(err as FirebaseError).code}`);
            setError("Failed to sign up");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleSignUp, loading, error };
};

// Hook to handle logout
export const useLogout = () => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setLoading(true);
        setError(null);
        try {
            await logout();
        } catch (err) {
            setError("Failed to log out");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { handleLogout, loading, error };
};
