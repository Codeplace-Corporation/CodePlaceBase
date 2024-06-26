import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './CustomSlider.css';

const CustomSlider = ({ value, onChange }) => {
  const handleSliderChange = (value) => {
    onChange(value);
  };

  const convertToDisplayValue = (val) => {
    if (val < 1) return `${val + 1} Hour`;
    if (val <= 7) return `${val + 1} Hours`;
    if (val <= 8) return `${val - 7} Day`;
    if (val <= 20) return `${val - 7} Days`;
    if (val <= 24) return `${(val - 27) / 2 + 5} Weeks`;
    if (val <= 25) return `${val - 24} Month`;
    return `+${1} Month`;
  };

  const calculatePosition = (val) => {
    const percentage = (val / 26) * 100;
    return `calc(${percentage}% + 0px)`; // Adjust 15px as needed to move the tooltip to the right
  };

  return (
    <div className="slider-container">
      <div className="slider-values">
        <span
          className="slider-value"
          style={{ left: calculatePosition(value[0]) }}
        >
          {convertToDisplayValue(value[0])}
        </span>
        <span
          className="slider-value right-value"
          style={{ left: calculatePosition(value[1]) }}
        >
          {convertToDisplayValue(value[1])}
        </span>
      </div>
      <Slider
        range
        min={0}
        max={26}
        value={value}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: '#7d4cdb' }]}
        handleStyle={[
          { borderColor: '#32CD32', backgroundColor: '#121212' },
          { borderColor: '#32CD32', backgroundColor: '#121212' }
        ]}
        railStyle={{ backgroundColor: '#333333' }}
      />
    </div>
  );
};

export default CustomSlider;
