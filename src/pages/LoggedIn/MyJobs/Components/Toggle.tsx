import React from 'react';

interface ToggleProps {
  /** Whether the toggle is currently active/on */
  isOn: boolean;
  /** Callback function called when toggle is clicked */
  onToggle: () => void;
  /** Text label for the left/off state */
  leftLabel: string;
  /** Text label for the right/on state */
  rightLabel: string;
  /** Additional CSS classes to apply to the toggle container */
  className?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Size variant of the toggle */
  size?: 'small' | 'medium' | 'large';
}

const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onToggle,
  leftLabel,
  rightLabel,
  className = '',
  disabled = false,
  size = 'medium'
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'h-8 w-40',
      slider: 'h-6 w-20',
      translateOn: 'translate-x-18',
      translateOff: 'translate-x-1',
      text: 'text-xs',
      padding: 'px-4'
    },
    medium: {
      container: 'h-10 w-48',
      slider: 'h-8 w-24',
      translateOn: 'translate-x-22',
      translateOff: 'translate-x-1',
      text: 'text-sm',
      padding: 'px-5'
    },
    large: {
      container: 'h-12 w-56',
      slider: 'h-10 w-28',
      translateOn: 'translate-x-26',
      translateOff: 'translate-x-1',
      text: 'text-base',
      padding: 'px-6'
    }
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        relative inline-flex ${config.container} items-center rounded-full 
        transition-colors duration-300 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
        ${isOn ? 'bg-blue-500' : 'bg-gray-600'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
        ${className}
      `}
    >
      {/* Left label */}
      <span 
        className={`
          absolute left-0 ${config.padding} ${config.text} font-medium z-20 
          transition-colors duration-300 select-none
          ${!isOn ? 'text-white' : 'text-gray-300'}
        `}
      >
        {leftLabel}
      </span>
      
      {/* Right label */}
      <span 
        className={`
          absolute right-0 ${config.padding} ${config.text} font-medium z-20 
          transition-colors duration-300 select-none
          ${isOn ? 'text-white' : 'text-gray-300'}
        `}
      >
        {rightLabel}
      </span>
      
      {/* Slider */}
      <span
        className={`
          inline-block ${config.slider} transform rounded-full bg-white shadow-lg 
          transition-transform duration-300 ease-in-out relative z-10
          ${isOn ? config.translateOn : config.translateOff}
        `}
      />
    </button>
  );
};

export default Toggle;