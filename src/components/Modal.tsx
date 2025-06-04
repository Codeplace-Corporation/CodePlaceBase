type ModalProps = {
    headerTitle?: string;
    showHeader?: boolean;
    barrierDismissable?: boolean;
    body: React.ReactNode;
    showFooter?: boolean;
    footer?: React.ReactNode;
    onClose: () => void;
};

const Modal = ({
    headerTitle,
    showHeader = true,
    barrierDismissable = true,
    body,
    showFooter = true,
    footer,
    onClose,
}: ModalProps) => {
    return (
        <>
            <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                onClick={() => {
                    if (barrierDismissable) {
                        onClose();
                    }
                }}
            >
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                    {/* content */}
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-card py-4 outline-none focus:outline-none">
                        {/* header */}
                        {showHeader && (
                            <div className="flex items-start justify-between px-6 pb-4 border-b border-solid border-card-light rounded-t">
                                <h3>{headerTitle}</h3>
                                <button
                                    className="p-1 ml-auto bg-transparent border-0 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                    onClick={onClose}
                                >
                                    <span className="text-sm block outline-none focus:outline-none">
                                        &times;
                                    </span>
                                </button>
                            </div>
                        )}
                        <div className="relative p-6 flex-auto">{body}</div>
                        {showFooter && (
                            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="opacity-50 fixed inset-0 z-40 bg-black"></div>
        </>
    );
};
export default Modal;
