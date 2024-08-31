import { useRef, useState } from "react";
import CodeLogoIcon from "../assets/logo.png";
import ProfilePlaceholder from "../assets/profile_placeholder.png";
import { useAuth } from "../context/AuthContext";
import { auth } from "../utils/firebase";

export const NavBar = () => {
    const { currentUser } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleMouseEnter = () => {
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        setIsDropdownOpen(false);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="flex justify-between items-center px-12 py-4 fixed z-10 flex-wrap w-full text-sm bg-black/55">
            <div className="w-40">
                <a href="/">
                    <img
                        className="w-8"
                        src={CodeLogoIcon}
                        alt="CodeLogoIcon"
                    />
                </a>
            </div>
            <div>
                <ul className="list-none flex gap-8">
                    <li>
                        <a
                            className="hover:text-primary"
                            href="/jobs"
                        >
                            Job Search
                        </a>
                    </li>
                    <li>
                        <a
                            className="hover:text-primary"
                            href="/teams"
                        >
                            Teams
                        </a>
                    </li>
                    {currentUser ? (
                        <>
                            <li>
                                <a
                                    className="hover:text-primary"
                                    href="/profile/messages"
                                >
                                    Messages
                                </a>
                            </li>
                            <li>
                                <a
                                    className="hover:text-primary"
                                    href="/profile/jobs"
                                >
                                    My Jobs
                                </a>
                            </li>
                        </>
                    ) : (
                        <div></div>
                    )}
                </ul>
            </div>
            <div className="w-40">
                {currentUser ? (
                    <div
                        className="relative flex items-center"
                        ref={dropdownRef}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={toggleDropdown}
                    >
                        <div className="flex items-center justify-end cursor-pointer text-xs">
                            <img
                                className="w-8 h-8 rounded-full order-2 ml-2"
                                src={currentUser.photoURL ?? ProfilePlaceholder}
                                alt="Profile"
                            />
                            <span>
                                {currentUser.displayName ?? currentUser.email}
                            </span>
                        </div>
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 bg-black/20 z-20 rounded-sm overflow-hidden shadow-sm">
                                <a
                                    className="block hover:bg-primary hover:text-white py-2 px-4"
                                    href="/dashboard"
                                >
                                    Dashboard
                                </a>
                                <a
                                    className="block hover:bg-primary hover:text-white py-2 px-4"
                                    href="/profile"
                                >
                                    Profile
                                </a>
                                <a
                                    className="block hover:bg-primary hover:text-white py-2 px-4"
                                    href="/settings"
                                >
                                    Settings
                                </a>
                                <a
                                    className="block hover:bg-primary hover:text-white py-2 px-4"
                                    href="/#"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <a
                        className="hover:text-primary"
                        href="/login"
                    >
                        Signin/Signup
                    </a>
                )}
            </div>
        </nav>
    );
};
