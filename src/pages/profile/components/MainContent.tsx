import { useState } from "react";

type ContentTabProps = {
    tabs: string[];
};
const ContentTab = ({ tabs }: ContentTabProps) => {
    const [activeTab, setActiveTab] = useState(tabs[0]);

    return (
        <div className="flex mb-5 p-3">
            {tabs.map((tab, index) => (
                <div
                    key={index}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer rounded-md py-3 px-5 mr-2 hover:text-white/75 transition ease-linear ${
                        activeTab === tab
                            ? "bg-transparent text-white font-bold"
                            : "bg-tab-item text-white/50 font-normal"
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Profile
                </div>
            ))}
        </div>
    );
};
const MainContent = () => {
    return (
        <>
            <ContentTab tabs={["developer", "client"]} />
        </>
    );
};
export default MainContent;
