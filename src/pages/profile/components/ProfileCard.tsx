import { useState } from "react";
import ProfilePlaceholder from "../../../assets/profile_placeholder.png";
import { auth } from "../../../utils/firebase";
import StyledButton from "../../../components/styled/StyledButton";

const ProfileCard = () => {
    const [user] = useState(auth.currentUser);

    const skills = ["CSS", "UI/UX", "React"];

    return (
        <>
            <h2 className="font-bold">My Profile</h2>
            {/*  */}
            <div className="block mt-3 min-w-40 max-w-64 w-60 aspect-square m-auto relative">
                <img
                    src={user?.photoURL ?? ProfilePlaceholder}
                    alt="profile_picture"
                    className="w-full h-full rounded-full object-cover"
                />
            </div>
            <h2 className="font-bold mt-3">{user?.displayName} </h2>
            <p className="text-xs mt-1 mb-3">
                this is a very bio looking bio data...n
            </p>
            <h3 className="font-semibold">Skills:</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
                {skills.map((skill, index) => (
                    <div
                        className="bg-white/20 p-1.5 text-xs rounded-md"
                        key={index}
                    >
                        {skill}
                    </div>
                ))}
            </div>
            <StyledButton
                variant="outline"
                className="w-full"
                size="small"
                children={"Edit Profile"}
            />
        </>
    );
};

export default ProfileCard;
