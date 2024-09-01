export const Footer = () => {
    const handleToggleContactInfo = () => {};
    const handleShowMessage = (content?: string) => {};

    return (
        <footer className="w-full p-5 text-white/50 border-t-2 border-white/40 mt-5">
            <div className="flex justify-between items-center flex-wrap text-sm">
                <p>&copy; 2024 CodePlace. All Rights Reserved.</p>
                <div className="flex gap-5">
                    <a
                        className="hover:underline"
                        href="/#"
                        onClick={() => handleShowMessage()}
                    >
                        Terms of Service
                    </a>
                    <a
                        className="hover:underline"
                        href="/#"
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
        </footer>
    );
};
