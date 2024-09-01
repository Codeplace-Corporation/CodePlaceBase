import StyledButton from "../../../components/styled/StyledButton";

export const Waitlist = () => {
    return (
        <div className="flex-col justify-items-center items-center text-center my-36">
            <h1 className="mb-4">Get Started With CodePlace</h1>
            <StyledButton
                children="Join Waitlist"
                variant="secondary"
                onClick={() => console.log("JoinWitlist Clicked")}
            />
        </div>
    );
};
