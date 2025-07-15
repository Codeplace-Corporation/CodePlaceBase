import Slider, { SliderProps } from "rc-slider";

const StyledSlider: React.FC<SliderProps> = ({ ...rest }) => {
    return (
        <Slider
            {...rest}
            className="w-full"
            styles={{
                handle: {
                    borderColor: "#32CD32",
                    backgroundColor: "#000000",
                },
                track: { backgroundColor: "#32CD32" },
                tracks: { backgroundColor: "#32CD32" },
                rail: { backgroundColor: "#333333" },
            }}
        />
    );
};
export default StyledSlider;
