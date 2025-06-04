import Logo from "../../assets/logo.png";
import { SignupForm } from "./components/SignupForm";

export const Signup = () => {
    return (
        <div className="flex justify-center items-center pt-2">
            <div className="text-center mb-6 p-8 rounded-lg max-w-md w-full">
                <img
                    src={Logo}
                    alt="Logo"
                    className="mx-auto mb-4 w-14"
                />
                <h2 className="text-white text-2xl font-bold mb-8">
                    Welcome to CodePlace
                </h2>
                <SignupForm />
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
