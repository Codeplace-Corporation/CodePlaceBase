import { useState } from "react";
import StyledButton from "./styled/StyledButton";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type DropdownButtonProps = {
    label?: string;
    children?: React.ReactNode;
};

const DropdownButton: React.FC<DropdownButtonProps> = ({ label, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative inline-block">
            <StyledButton
                size="small"
                variant="primary"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {label}
                <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`ml-1 text-white transition ease-linear transform ${
                        isHovered && "rotate-90"
                    }`}
                />
            </StyledButton>
            {isHovered && (
                <div
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="absolute p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default DropdownButton;
