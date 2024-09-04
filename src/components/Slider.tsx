import Slider, { SliderProps } from "rc-slider";

const StyledSlider: React.FC<SliderProps> = ({ ...rest }) => {
    return (
        <Slider
            {...rest}
            className="w-full"
            styles={{
                handle: {
                    borderColor: "#32CD32",
                    backgroundColor: "#121212",
                },
                track: { backgroundColor: "#7d4cdb" },
                tracks: { backgroundColor: "#7d4cbd" },
                rail: { backgroundColor: "#333333" },
            }}
        />
    );
};
export default StyledSlider;
