import { useState } from "react";
import StyledButton from "../../../components/styled/StyledButton";
import Modal from "../../../components/Modal";

export const Footer = () => {
    const [showContactInfo, setShowContactInfo] = useState(false);
    const handleToggleContactInfo = () => {
        setShowContactInfo(!showContactInfo);
    };
    const handleShowMessage = (content?: string) => {};

    return (
        <footer className="w-full p-5 text-white/50 border-t-2 border-white/40 mt-5">
            <div className="flex justify-between items-center flex-wrap text-sm">
                <p>&copy; 2024 CodePlace. All Rights Reserved.</p>
                <div className="flex gap-5">
                    <a
                        className="hover:underline"
                        href="/terms"
                        onClick={() => handleShowMessage()}
                    >
                        Terms of Service
                    </a>
                    <a
                        className="hover:underline"
                        href="/privacy"
                        onClick={() => handleShowMessage()}
                    >
                        Privacy Policy
                    </a>
                    <a
                        className="hover:underline"
                        href="/#"
                        onClick={handleToggleContactInfo}
                    >
                        Contact Us
                    </a>
                </div>
            </div>
            {showContactInfo && (
                <Modal
                    barrierDismissable={false}
                    onClose={handleToggleContactInfo}
                    body={
                        <ul>
                            <li>E: contact@codeplace.com</li>
                            <li>P: +1 (555) 234 567</li>
                        </ul>
                    }
                    footer={
                        <StyledButton
                            variant="outline"
                            size="small"
                            children={"Close"}
                            onClick={handleToggleContactInfo}
                        />
                    }
                />
            )}
        </footer>
    );
};
