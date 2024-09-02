import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StyledButton from "../../components/styled/StyledButton";
import {
    StyledInput,
    StyledInputArea,
} from "../../components/styled/StyledInput";
import {
    faSearch,
    faEllipsisVertical,
    faArrowRight,
    faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import ProfilePlaceholder from "../../assets/profile_placeholder.png";

const Messages = () => {
    // States go here 🦆

    const Conversations = () => {
        const conversations = [0, 0, 0, 0, 0];

        return (
            <div>
                {conversations.map((conv, index) => (
                    <div
                        key={index}
                        className="hover:bg-card flex items-center gap-2 py-2 px-3 cursor-pointer"
                    >
                        <img
                            className="w-10 aspect-square rounded-full"
                            src={ProfilePlaceholder}
                            alt="conversation_profile"
                        />
                        <div className="flex-1 flex flex-col overflow-hidden max-w-52">
                            <p>conversation name</p>
                            <p className="text-xs text-white/50 truncate">
                                You: i think i said something weirdly sad and
                                this is why i belive i should be president
                            </p>
                        </div>
                        <button className="hover:bg-black text-white bg-transparent px-3 rounded-full">
                            <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                size="sm"
                            />
                        </button>
                    </div>
                ))}
            </div>
        );
    };
    const Messages = () => {
        const chats = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0,
        ];

        return (
            <>
                <div className="flex flex-col flex-1 h-full justify-end">
                    <div className="flex-1 overflow-y-auto">
                        {chats.map((chat, index) => (
                            <div className="py-4 bg-black">weee</div>
                        ))}
                    </div>
                </div>
                {/*  */}

                <div className="flex items-center gap-4 p-2.5 w-full border-t border-white/30">
                    <label className="text-sm cursor-pointer">
                        <input type="file" />
                        <FontAwesomeIcon icon={faPaperclip} />
                    </label>
                    <StyledInputArea
                        rows={1}
                        required
                        variant="filled"
                        inputSize="small"
                        placeholder="Type a message"
                        className="flex-1"
                    />
                    <button>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="grid grid-cols-profile h-screen pt-20 pb-10">
            <div className="flex flex-col bg-card-dark rounded-md pt-3">
                <form
                    action="#"
                    onSubmit={() => console.log("Search submitted")}
                >
                    <div className="flex mb-3">
                        <StyledInput
                            type="text"
                            inputSize="small"
                            variant="filled"
                            placeholder="Search conversations"
                            className="w-full"
                        />
                        <StyledButton
                            size="small"
                            variant="primary"
                            className="rounded-full bg-primary"
                            type="submit"
                        >
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="text-white"
                            />
                        </StyledButton>
                    </div>
                </form>
                <div className="flex-1 w-full">
                    <Conversations />
                </div>
            </div>
            <div className="flex flex-col bg-card rounded-md">
                <div className="bg-card-dark py-4 px-3 flex flex-col items-end">
                    <span>Messenger</span>
                </div>
                <div className="flex-1 w-full flex flex-col h-vp">
                    <Messages />
                </div>
            </div>
        </div>
    );
};
export default Messages;
