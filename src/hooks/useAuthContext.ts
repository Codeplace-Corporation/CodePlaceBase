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
            if (err instanceof FirebaseError) {
                console.log("err", err.code);
                switch (err.code) {
                    case "auth/user-not-found":
                    case "auth/invalid-credential":
                        setError(
                            "Invalid login credentials. Please try again.",
                        );
                        break;
                    case "auth/invalid-email":
                        setError("Please enter a valid email address.");
                        break;
                    case "auth/too-many-requests":
                        setError(
                            "Too many login attempts. Please try again later",
                        );
                        break;
                    default:
                        setError("Failed to login. Please try again.");
                }
            }

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
            if (err instanceof FirebaseError) {
                // Handle different Firebase error codes
                switch (err.code) {
                    case "auth/email-already-in-use":
                        setError(
                            "This email is already associated with an account.",
                        );
                        break;
                    case "auth/invalid-email":
                        setError("Please enter a valid email address.");
                        break;
                    case "auth/operation-not-allowed":
                        setError(
                            "Signup is currently disabled. Please contact support.",
                        );
                        break;
                    case "auth/weak-password":
                        setError(
                            "Password is too weak. Please use a stronger password.",
                        );
                        break;
                    default:
                        setError(
                            "Failed to create an account. Please try again.",
                        );
                }
            } else {
                // Handle non-Firebase errors
                setError("An unexpected error occurred. Please try again.");
            }
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
