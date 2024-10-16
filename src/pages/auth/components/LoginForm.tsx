import { useState } from "react";
import {
    useLoginWithEmail,
    useLoginWithGoogle,
} from "../../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import StyledButton from "../../../components/styled/StyledButton";
import { StyledInput } from "../../../components/styled/StyledInput";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const { handleLoginWithEmail, loading, error } = useLoginWithEmail();
    const { handleLoginWithGoogle } = useLoginWithGoogle();

    // handlers
    const handleInputChange = (name: string, value: any) => {
        setForm({
            ...form,
            [name]: value, // Dynamically set the field value by name (email or password)
        });
    };
    const handleLogin = async () => {
        await handleLoginWithEmail(form.email, form.password)
            .then((v) => {
                //
                navigate("/dashboard"); //Redirect to home page after login
            })
            .catch((e) => {
                //
            });
    };
    const handleGoogleLogin = async () => {
        await handleLoginWithGoogle()
            .then((e) => {
                navigate("/"); // Redirect to the homepage or dashboard after successful sign-up
            })
            .catch((e) => {
                // show error
            });
    };

    return (
        <>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 items-stretch">
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
            <div className="mb-6">
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
        </>
    );
};
