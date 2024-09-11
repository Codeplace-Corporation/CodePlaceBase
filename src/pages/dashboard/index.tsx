import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faBell,
    faCalendarAlt,
} from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../context/AuthContext";

const metrics = [
    {
        icon: faEnvelope,
        title: "Unread messages",
        value: "You have 0 unread messages",
    },
    {
        icon: faBell,
        title: "Notifications",
        value: "You have 5 new notifications",
    },
    {
        icon: faCalendarAlt,
        title: "Upcoming Deadline",
        value: "You have 3 upcoming deadline",
    },
];

const Dashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className=" flex flex-col pb-10">
            {/* Head */}
            <h2 className="text-3xl mb-3 mt-3 font-normal">
                Welcome back, {currentUser?.displayName} 👋
            </h2>
            <div className="w-full rounded-lg bg-primary p-2">
                {/* <h2 className="text-3xl mb-3 mt-3 font-normal">
                    Welcome back, {currentUser?.displayName} 👋
                </h2> */}
                <div className="flex flex-row gap-5">
                    {metrics.map((metric, index) => (
                        <div className="flex-1 rounded-md bg-black/20 p-2 flex flex-col">
                            <h3 className="font-bold">
                                <FontAwesomeIcon
                                    icon={metric.icon}
                                    className="mr-2"
                                />
                                {metric.title}
                            </h3>
                            <p className="text-center mt-5">{metric.value}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/*  */}
            <div className="w-full flex flex-row gap-4 mt-3">
                <div className="flex-1 h-80 bg-card-light rounded-lg"></div>
                <div className="flex-1 h-80 bg-card-light rounded-lg"></div>
            </div>
            {/*  */}
            <div className="w-full bg-card-light rounded-lg mt-3 mb-6 min-h-40 "></div>
        </div>
    );
};
export default Dashboard;
