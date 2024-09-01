import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import {
    useLoginWithEmail,
    useLoginWithGoogle,
} from "../../hooks/useAuthContext";
import { StyledInput } from "../../components/styled/StyledInput";
import StyledButton from "../../components/styled/StyledButton";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { handleLoginWithEmail, loading, error } = useLoginWithEmail();
    const { handleLoginWithGoogle } = useLoginWithGoogle();

    const handleLogin = async () => {
        await handleLoginWithEmail(email, password);
        navigate("/"); // Redirect to home page after login
    };

    const handleGoogleLogin = async () => {
        await handleLoginWithGoogle();
        navigate("/"); // Redirect to the homepage or dashboard after successful sign-up
    };

    return (
        <div className="flex items-center justify-center">
            <div className="text-center mb-6 p-8 rounded-lg max-w-md w-full">
                <img
                    src={Logo}
                    alt="Logo"
                    className="mx-auto mb-4 w-14"
                />
                <h2 className="text-white text-2xl font-bold mb-8">
                    Sign in to CodePlace
                </h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4 items-stretch">
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
                    type="submit"
                    className="w-full mb-4"
                    children={loading ? "Logging in..." : "Login"}
                    variant="outline"
                    onClick={handleLogin}
                    disabled={loading}
                />

                <div className="text-center my-4 text-gray-400">OR</div>
                <div className="flex justify-between">
                    <StyledButton
                        className=" w-full mb-4 bg-white hover:text-black"
                        children="Sign in with Google"
                        variant="secondary"
                        onClick={handleGoogleLogin}
                    />
                </div>

                <p className="text-gray-400 mt-12">
                    New to CodePlace?{" "}
                    <a
                        href="/signup"
                        className="text-blue-500"
                    >
                        Create an account
                    </a>
                </p>
            </div>
        </div>
    );
};
