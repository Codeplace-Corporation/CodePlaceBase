import StyledSlider from "../../../components/Slider";

type TimingProps = {
    value: number[];
    onChange?: any;
};

const ProjectLengthSlider: React.FC<TimingProps> = ({ value, onChange }) => {
    const handlSliderChange = (val: number | number[]) => onChange(val);
    const convertToDisplayValue = (val: number) => {
        if (val < 1) return `${val + 1} Hour`;
        if (val <= 7) return `${val + 1} Hours`;
        if (val <= 8) return `${val - 7} Day`;
        if (val <= 20) return `${val - 7} Days`;
        if (val <= 24) return `${(val - 27) / 2 + 5} Weeks`;
        if (val <= 25) return `${val - 24} Month`;
        return `+${1} Month`;
    };
    const calculatePosition = (val: number) => {
        const percentage = (val / 26) * 100;
        return `calc(${percentage}% + 0px)`; // Adjust 15px as needed to move the tooltip to the right
    };

    return (
        <div className="relative w-full pt-12">
            {/* slider values */}
            <div className="relative mb-2 flex justify-between">
                <span
                    className="absolute text-accent whitespace-nowrap text-sm"
                    style={{
                        left: calculatePosition(value[0]),
                        bottom: "0px",
                    }}
                >
                    {convertToDisplayValue(value[0])}
                </span>
                <span
                    className="absolute text-accent whitespace-nowrap text-sm ml-0"
                    style={{
                        left: calculatePosition(value[1]),
                        bottom: "0px",
                    }}
                >
                    {convertToDisplayValue(value[1])}
                </span>
            </div>
            <StyledSlider
                range
                min={0}
                max={26}
                value={value}
                onChange={handlSliderChange}
            />
        </div>
    );
};
export default ProjectLengthSlider;
