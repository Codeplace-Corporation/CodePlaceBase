import Logo from "../../assets/logo.png";
import { LoginForm } from "./components/LoginForm";

export const Login = () => {
    return (
        <div className="flex items-center justify-center pt-2">
            <div className="text-center mb-6 p-8 rounded-lg max-w-md w-full">
                <img
                    src={Logo}
                    alt="Logo"
                    className="mx-auto mb-4 w-14"
                />
                <h2 className="text-white text-2xl font-bold mb-8">
                    Sign in to CodePlace
                </h2>
                <LoginForm />
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
