import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useLoginWithGoogle,
    useSignUpWithEmail,
} from "../../../hooks/useAuthContext";
import StyledButton from "../../../components/styled/StyledButton";
import { StyledInput } from "../../../components/styled/StyledInput";

export const SignupForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        displayName: "",
        email: "",
        password: "",
        confPassword: "",
    });
    const { handleSignUp, loading, error } = useSignUpWithEmail();
    const { handleLoginWithGoogle } = useLoginWithGoogle();

    const handleSignup = async () => {
        await handleSignUp(form.email, form.password, form.displayName)
            .then((v) => {
                navigate("/dashboard"); // Redirect to the homepage or dashboard after successful sign-up
            })
            .catch((e) => {
                // show error
            });
    };
    const handleGoogleLogin = async () => {
        await handleLoginWithGoogle()
            .then((v) => {
                navigate("/dashboard"); // Redirect to the homepage or dashboard after successful sign-up
            })
            .catch((e) => {
                // show error
            });
    };
    const handleInputChange = (name: string, value: string) => {
        setForm({
            ...form,
            [name]: value,
        });
    };

    return (
        <>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1 text-left">
                    Display Name
                </label>
                <StyledInput
                    type="name"
                    placeholder="Display name"
                    onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                    }
                    value={form.displayName}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1 text-left">
                    Email Address
                </label>
                <StyledInput
                    type="email"
                    placeholder="Email address"
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    value={form.email}
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1 text-left">
                    Password
                </label>
                <StyledInput
                    type="password"
                    placeholder="Password"
                    onChange={(e) =>
                        handleInputChange("password", e.target.value)
                    }
                    value={form.password}
                    className="w-full"
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-1 text-left">
                    Confirm Password
                </label>
                <StyledInput
                    type="password"
                    placeholder="Retype Password"
                    onChange={(e) =>
                        handleInputChange("confPassword", e.target.value)
                    }
                    value={form.confPassword}
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
        </>
    );
};
