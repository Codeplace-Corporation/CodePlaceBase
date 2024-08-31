import { useEffect, useState } from "react";
import { auth } from "../../utils/firebase";
import ProfileCard from "./components/ProfileCard";

const Profile = () => {
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    return (
        <div className="grid grid-cols-profile gap-5 h-screen py-20">
            <div className="border border-white rounded-md px-4 py-3">
                <ProfileCard />
            </div>
            <div className="bg-card rounded-md"></div>
        </div>
    );
};

export default Profile;
