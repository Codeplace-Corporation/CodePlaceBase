import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput } from "../../components/styled/StyledInput";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Messages = () => {
    return (
        <div className="grid grid-cols-profile h-screen pt-20 pb-10">
            <div className="bg-card-dark rounded-md pt-3 px-3">
                <div className="flex mb-4">
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
                    >
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-white"
                        />
                    </StyledButton>
                </div>
                <div> {/* Show list of conversations */} </div>
            </div>
            <div className="flex flex-col bg-card rounded-md">
                <div className="bg-card-dark py-4 px-3 flex flex-col items-end">
                    <span>Messenger</span>
                </div>
                <div>{/* Show the chat here */}</div>
            </div>
        </div>
    );
};
export default Messages;
