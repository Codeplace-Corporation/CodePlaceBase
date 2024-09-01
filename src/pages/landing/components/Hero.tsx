import StyledButton from "../../../components/styled/StyledButton";

export const Hero = () => {
    return (
        <div className="flex flex-col justify-center items-center text-center">
            <h1 className="font-normal">Find Developers to Build Your Ideas</h1>
            <h2 className="my-5">
                Connecting Clients to Developers Through Job Posts Optimized for
                Client Need and <br />
                The Software Development Process.
            </h2>
            <div className="justify-center center min-w-80 flex gap-x-20 mt-8">
                <StyledButton
                    children="For Clients"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => console.log("first")}
                />
                <StyledButton
                    children="For Developers"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => console.log("first")}
                />
            </div>
        </div>
    );
};
