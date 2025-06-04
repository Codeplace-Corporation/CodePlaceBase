import { useState } from "react";
import ProfilePlaceholder from "../../../assets/profile_placeholder.png";
import StyledButton from "../../../components/styled/StyledButton";
import { useAuth } from "../../../context/AuthContext";
import EditProfileForm from "./EditProfileForm";

const ProfileCard = () => {
    const { currentUser } = useAuth();
    const [editModeActive, setEditModeActive] = useState(false);

    const skills = [
        "CSS",
        "UI/UX",
        "React",
        "Something else",
        "one more thing",
    ];
    const links = [
        {
            type: "url",
            slug: "https://linkedin.com/username",
        },
        {
            type: "url",
            slug: "https://linkedin.com/username",
        },
    ];

    return (
        <>
            <h2 className="font-bold">My Profile</h2>
            {/*  */}
            <div className="block mt-3 min-w-40 max-w-64 w-60 aspect-square m-auto relative">
                <img
                    src={currentUser?.photoURL ?? ProfilePlaceholder}
                    alt="profile_picture"
                    className="w-full h-full rounded-full object-cover"
                />
            </div>
            {editModeActive ? (
                <EditProfileForm
                    onCancelClick={() => setEditModeActive(false)}
                />
            ) : (
                <>
                    <h2 className="font-bold mt-3">
                        {currentUser?.displayName}{" "}
                    </h2>
                    <p className="text-xs mt-1 mb-3">
                        this is a very bio looking bio data...n
                    </p>
                    <h3 className="font-semibold">Skills:</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {skills.map((skill, index) => (
                            <div
                                className="bg-white/20 p-1.5 text-xs rounded-md"
                                key={index}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                    <h3 className="font-semibold">Links:</h3>
                    <div className="flex flex-col gap-1 mb-6">
                        {links.map((link, index) => (
                            <a
                                className="text-xs"
                                href="/#"
                            >
                                {link.slug}
                            </a>
                        ))}
                    </div>
                    <StyledButton
                        variant="outline"
                        className="w-full"
                        size="small"
                        children={"Edit Profile"}
                        onClick={() => setEditModeActive(true)}
                    />
                </>
            )}
        </>
    );
};

export default ProfileCard;
