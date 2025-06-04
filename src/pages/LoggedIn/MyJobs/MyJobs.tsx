import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPlus, 
    faCode, 
    faBuilding,
    faFileContract,
    faClock,
    faCheck,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import StyledButton from "../../../components/styled/StyledButton";

const MyJobs = () => {
    const [userMode, setUserMode] = useState(false); // false = Developer, true = Client
    const [activeTab, setActiveTab] = useState("Active Jobs");

    // Developer tabs
    const developerTabs = ["Active Jobs", "Interested Jobs", "Past Jobs", "Applied Jobs"];
    
    // Client tabs (when userMode is true)
    const clientTabs = ["Posted Jobs", "Active Projects", "Completed Jobs", "Draft Jobs"];

    const getCurrentTabs = () => userMode ? clientTabs : developerTabs;

    const renderTabContent = () => {
        const currentRole = userMode ? "Client" : "Developer";
        
        return (
            <div className="min-h-96 bg-card-light rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FontAwesomeIcon 
                        icon={userMode ? faBuilding : faCode} 
                        className={`text-2xl ${userMode ? 'text-blue-400' : 'text-green-400'}`} 
                    />
                    <h3 className="text-xl font-bold">
                        {currentRole} View - {activeTab}
                    </h3>
                </div>
                
                <div className="space-y-4">
                    <p className="text-white/70">
                        You are currently viewing as a <strong>{currentRole}</strong>.
                    </p>
                    <p className="text-white/70">
                        Active tab: <strong>{activeTab}</strong>
                    </p>
                    
                    {userMode ? (
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <h4 className="font-semibold text-blue-400 mb-2">Client Features</h4>
                            <ul className="text-sm text-white/70 space-y-1">
                                <li>• Post new job opportunities</li>
                                <li>• Manage active projects</li>
                                <li>• Review developer applications</li>
                                <li>• Track project progress</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <h4 className="font-semibold text-green-400 mb-2">Developer Features</h4>
                            <ul className="text-sm text-white/70 space-y-1">
                                <li>• Browse and apply to jobs</li>
                                <li>• Track application status</li>
                                <li>• Manage active work</li>
                                <li>• View earnings and history</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col pb-10 px-6 md:px-8 lg:px-12 xl:px-16">
            {/* Header with main toggle and post button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl mt-3 font-normal">My Jobs Hub</h2>
                
                <div className="flex items-center gap-4">
                    {/* Developer/Client Toggle */}
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faCode} className="text-green-400" />
                        <button
                            onClick={() => {
                                setUserMode(!userMode);
                                setActiveTab((!userMode ? clientTabs : developerTabs)[0]);
                            }}
                            className={`
                                relative inline-flex h-10 w-48 items-center rounded-full 
                                transition-colors duration-300 ease-in-out 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                ${userMode ? 'bg-blue-500' : 'bg-green-500'}
                                cursor-pointer hover:shadow-md
                            `}
                        >
                            <span className={`absolute left-0 px-4 text-sm font-medium z-20 transition-colors duration-300 select-none ${!userMode ? 'text-white' : 'text-gray-200'}`}>
                                Developer
                            </span>
                            <span className={`absolute right-0 px-4 text-sm font-medium z-20 transition-colors duration-300 select-none ${userMode ? 'text-white' : 'text-gray-200'}`}>
                                Client
                            </span>
                            <span className={`inline-block h-8 w-24 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out relative z-10 ${userMode ? 'translate-x-22' : 'translate-x-1'}`} />
                        </button>
                        <FontAwesomeIcon icon={faBuilding} className="text-blue-400" />
                    </div>
                    
                    {/* Post Job Button - only show for clients */}
                    {userMode && (
                        <StyledButton variant="success" size="small">
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Post a Job
                        </StyledButton>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 overflow-x-auto">
                {getCurrentTabs().map((tab) => (
                    <StyledButton
                        key={tab}
                        size="small"
                        variant={activeTab === tab ? "primary" : "inactive"}
                        onClick={() => setActiveTab(tab)}
                        className="whitespace-nowrap"
                    >
                        {tab}
                    </StyledButton>
                ))}
            </div>

            {/* Content Area */}
            {renderTabContent()}
        </div>
    );
};

export default MyJobs;