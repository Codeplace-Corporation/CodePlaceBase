import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Messages = () => {
    // States go here 🦆

    const Conversations = () => {
        return <div>{/* Return list of conversations */}</div>;
    };
    const Messages = () => {
        return (
            <div>{/* Return list of messages for selected conversation */}</div>
        );
    };

    return (
        <div className="grid grid-cols-profile h-screen pt-20 pb-10">
            <div className="flex flex-col bg-card-dark rounded-md pt-3 px-3">
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
                <div className="flex-1 w-full">
                    <Messages />
                </div>
            </div>
        </div>
    );
};
export default Messages;
