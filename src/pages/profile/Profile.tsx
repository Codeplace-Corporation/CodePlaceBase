import ProfileCard from "./components/ProfileCard";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
    const { currentUser } = useAuth();

    return (
        <div className="grid grid-cols-profile gap-5 h-screen pb-20 pt-4">
            <div className="border border-white rounded-md px-4 py-3">
                <ProfileCard />
            </div>
            <div className="bg-card rounded-md"></div>
        </div>
    );
};

export default Profile;
