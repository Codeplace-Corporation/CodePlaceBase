import MainContent from "./components/MainContent";
import ProfileCard from "./components/ProfileCard";

const Profile = () => {
    return (
        // Main container with navbar-matching width constraints
        <div className="w-full">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-16 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-screen">
                    {/* Profile Card - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <ProfileCard />
                        </div>
                    </div>
                    
                    {/* Main Content - Takes 3 columns */}
                    <div className="lg:col-span-3">
                        <div className=" rounded-md">
                            <MainContent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;