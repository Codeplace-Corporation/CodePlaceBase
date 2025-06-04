import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {
    title: string;
    client: string;
    deadline: string;
    status?: string;
    stack: string;
    completedMilestones?: number;
    totalMilestones: number;
};

type AppliedProps = {
    title: string;
    client: string;
    duration: string;
    stack: string;
    totalMilestones: number;
    icon: any;
    type: string;
};

export const ActiveJobItem = ({
    title,
    client,
    deadline,
    status,
    stack,
    completedMilestones,
    totalMilestones,
}: Props) => {
    return (
        <div className="flex flex-row py-4 px-5 items-center border-b border-card-dark hover:bg-card-dark cursor-pointer">
            <div className="flex-1 flex flex-col">
                <h3>{title}</h3>
                <p className="text-white/50">Client: {client}</p>
                <p className="text-white/50 text-xs">
                    Stack: {stack} <br />
                    Deliverables: {completedMilestones}/{totalMilestones}
                </p>
            </div>
            <div className="flex flex-col items-center">
                <p className="px-2 py-1 mb-2 text-xs rounded-full bg-orange-400/10 text-orange-400">
                    {status}
                </p>
                <p className="text-xs text-white/50">Deadline: {deadline}</p>
            </div>
        </div>
    );
};

export const AppliedJobItem = ({
    title,
    client,
    duration,
    stack,
    totalMilestones,
    icon,
    type,
}: AppliedProps) => {
    return (
        <div className="flex flex-row py-4 px-5 items-center border-b border-card-dark hover:bg-card-dark cursor-pointer">
            <div className="flex flex-col items-center justify-center">
                <FontAwesomeIcon icon={icon} />
                <p>{type}</p>
            </div>
            <div className="flex-1 flex flex-col ml-5">
                <h3>{title}</h3>
                <p className="text-white/50">Client: {client}</p>
                <p className="text-white/50 text-xs">
                    Stack: {stack} <br />
                    Deliverables: {totalMilestones}
                </p>
            </div>
            <div className="flex flex-col items-center">
                <p className="text-xs text-white/50">Duration: {duration}</p>
            </div>
        </div>
    );
};
