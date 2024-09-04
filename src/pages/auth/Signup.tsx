import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import {
    useSignUpWithEmail,
    useLoginWithGoogle,
} from "../../hooks/useAuthContext";
import { StyledInput } from "../../components/styled/StyledInput";
import StyledButton from "../../components/styled/StyledButton";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const navigate = useNavigate();
    const { handleSignUp, loading, error } = useSignUpWithEmail();
    const { handleLoginWithGoogle } = useLoginWithGoogle();

    const handleSignup = async () => {
        await handleSignUp(email, password, displayName);
        navigate("/"); // Redirect to the homepage or dashboard after successful sign-up
    };
    const handleGoogleLogin = async () => {
        await handleLoginWithGoogle();
        navigate("/"); // Redirect to the homepage or dashboard after successful sign-up
    };

    return (
        <div className="flex justify-center items-center pt-16">
            <div className="text-center mb-6 p-8 rounded-lg max-w-md w-full">
                <img
                    src={Logo}
                    alt="Logo"
                    className="mx-auto mb-4 w-14"
                />
                <h2 className="text-white text-2xl font-bold mb-8">
                    Welcome to CodePlace
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1 text-left">
                        Display Name
                    </label>
                    <StyledInput
                        type="name"
                        placeholder="display name"
                        onChange={(e) => setDisplayName(e.target.value)}
                        value={displayName}
                        className="w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1 text-left">
                        Email Address
                    </label>
                    <StyledInput
                        type="email"
                        placeholder="email address"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-full"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-1 text-left">
                        Password
                    </label>
                    <StyledInput
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="w-full"
                    />
                </div>
                <StyledButton
                    className="w-full mb-4"
                    children={loading ? "Signing up..." : "Create account"}
                    variant="outline"
                    onClick={handleSignup}
                    disabled={loading}
                />

                <div className="text-center my-4 text-gray-400">OR</div>
                <div className="flex justify-between">
                    <StyledButton
                        className=" w-full mb-4"
                        children="Sign in with Google"
                        variant="secondary"
                        onClick={handleGoogleLogin}
                    />
                </div>

                <p className="text-gray-400 mt-12">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-blue-500"
                    >
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};
