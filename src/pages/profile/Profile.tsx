import MainContent from "./components/MainContent";
import ProfileCard from "./components/ProfileCard";

const Profile = () => {
    return (
        <div className="grid grid-cols-profile gap-5 h-screen pb-20 pt-4">
            <div className="border border-white rounded-md px-4 py-3">
                <ProfileCard />
            </div>
            <div className="bg-card rounded-md">
                <MainContent />
            </div>
        </div>
    );
};

export default Profile;
