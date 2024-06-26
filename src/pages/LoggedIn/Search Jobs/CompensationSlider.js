// CompensationSlider.js
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './CompensationSlider.css';

const CompensationSlider = ({ value, onChange, onInputChange, minInputValue, maxInputValue }) => {
  const handleSliderChange = (value) => {
    onChange(value);
  };

  const handleInputChange = (e, index) => {
    const newValue = [...value];
    newValue[index] = Number(e.target.value);
    onChange(newValue);
  };

  const convertToDisplayValue = (val) => {
    return `$${val}`;
  };

  const calculatePosition = (val) => {
    const percentage = (val / 10000) * 100;
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
      <div className="input-container">
        <input
          type="number"
          value={minInputValue}
          onChange={(e) => handleInputChange(e, 0)}
          min={0}
          max={10000}
        />
        <span> - </span>
        <input
          type="number"
          value={maxInputValue}
          onChange={(e) => handleInputChange(e, 1)}
          min={0}
          max={10000}
        />
      </div>
      <Slider
        range
        min={0}
        max={10000}
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

export default CompensationSlider;
