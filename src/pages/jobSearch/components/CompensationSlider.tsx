import StyledSlider from "../../../components/Slider";
import { StyledInput } from "../../../components/styled/StyledInput";

type CompensationSliderProps = {
    value: number[];
    onChange?: any;
    minInputValue?: any;
    maxInputValue?: any;
};

const CompensationSlider: React.FC<CompensationSliderProps> = ({
    value,
    onChange,
    minInputValue,
    maxInputValue,
}) => {
    const handleSliderChange = (value: number | number[]) => onChange(value);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        const newValue = [...value];
        newValue[index] = Number(e.target.value);
        onChange(newValue);
    };

    const convertToDisplayValue = (val: number) => {
        return `$${val}`;
    };

    const calculatePosition = (val: number) => {
        const percentage = (val / 10000) * 100;
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
            {/* input values */}
            <div>
                <StyledInput
                    inputSize="small"
                    type="number"
                    variant="filled"
                    value={minInputValue}
                    min={0}
                    max={10000}
                    onChange={(e) => handleInputChange(e, 0)}
                />
                <span> - </span>
                <StyledInput
                    inputSize="small"
                    type="number"
                    variant="filled"
                    value={maxInputValue}
                    min={0}
                    max={10000}
                    onChange={(e) => handleInputChange(e, 0)}
                />
            </div>
            <StyledSlider
                range
                min={0}
                max={10000}
                value={value}
                onChange={handleSliderChange}
            />
        </div>
    );
};

export default CompensationSlider;
