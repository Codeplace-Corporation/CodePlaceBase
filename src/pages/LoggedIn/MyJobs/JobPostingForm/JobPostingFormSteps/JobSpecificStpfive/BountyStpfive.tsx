import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faDollarSign, faClock, faCalendarAlt, faCogs } from '@fortawesome/free-solid-svg-icons';
import { FormData } from '../../JobPostingForm';

interface BountyStpfiveProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const BountyStpfive: React.FC<BountyStpfiveProps> = ({ formData, updateFormData, errors }) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const Tooltip: React.FC<{ id: string; text: string; children: React.ReactNode }> = ({ id, text, children }) => (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setHoveredTooltip(id)}
        onMouseLeave={() => setHoveredTooltip(null)}
        className="cursor-help"
      >
        {children}
      </div>
      {hoveredTooltip === id && (
        <div className="absolute z-50 w-64 p-2 mt-1 text-xs text-white bg-gray-900 border border-white/20 rounded-md shadow-lg">
          {text}
          <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-900 border-l border-t border-white/20 transform rotate-45"></div>
        </div>
      )}
    </div>
  );

  // Get current date in YYYY-MM-DD format (local timezone)
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Get date with offset (helper for presets) - local timezone
  const getDateOffset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (e.g., "Mar 18th, 2020") - local timezone
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNum = date.getDate();
    const suffix = dayNum === 1 || dayNum === 21 || dayNum === 31 ? 'st' : 
                   dayNum === 2 || dayNum === 22 ? 'nd' : 
                   dayNum === 3 || dayNum === 23 ? 'rd' : 'th';
    return `${months[date.getMonth()]} ${dayNum}${suffix}, ${date.getFullYear()}`;
  };

  // Convert 12-hour time to 24-hour for input
  const convertTo24Hour = (time12: string) => {
    if (!time12 || time12 === '--:-- PM') return '09:00';
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Convert 24-hour time to 12-hour for display
  const convertTo12Hour = (time24: string) => {
    if (!time24) return '--:-- PM';
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Custom time input component with grouped number boxes
  const CustomTimeInput = ({ value, onChange }: { value: string; onChange: (time: string) => void }) => {
    // Handle the placeholder case
    if (value === '--:-- PM') {
      return (
        <div className="flex items-center gap-2 px-2 py-2">
          {/* Placeholder Hours Box */}
          <input
            type="text"
            value="--"
            onClick={(e) => {
              onChange('12:00 PM');
              setTimeout(() => (e.target as HTMLInputElement).select(), 0);
            }}
            readOnly
            className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/20 cursor-pointer"
            maxLength={2}
            placeholder="--"
          />
          
          {/* Colon separator */}
          <span className="text-white/70">:</span>
          
          {/* Placeholder Minutes Box */}
          <input
            type="text"
            value="--"
            onClick={(e) => {
              onChange('12:00 PM');
              setTimeout(() => (e.target as HTMLInputElement).select(), 0);
            }}
            readOnly
            className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/20 cursor-pointer"
            maxLength={2}
            placeholder="--"
          />
          
          {/* AM/PM Box */}
          <button
            type="button"
            onClick={() => onChange('12:00 PM')}
            className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white text-xs hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
          >
            PM
          </button>
        </div>
      );
    }

    const time24 = convertTo24Hour(value);
    const [hours, minutes] = time24.split(':');
    const time12 = convertTo12Hour(time24);
    const [timeOnly, period] = time12.split(' ');
    const [hoursDisplay, minutesDisplay] = timeOnly.split(':');
    
    const updateTime = (newHours: string, newMinutes: string, newPeriod?: string) => {
      // Convert display hours to 24-hour format
      let hours24 = parseInt(newHours);
      const currentPeriod = newPeriod || period;
      
      if (currentPeriod === 'AM' && hours24 === 12) {
        hours24 = 0;
      } else if (currentPeriod === 'PM' && hours24 !== 12) {
        hours24 += 12;
      }
      
      const time12Result = convertTo12Hour(`${hours24.toString().padStart(2, '0')}:${newMinutes}`);
      onChange(time12Result);
    };

    const togglePeriod = () => {
      const newPeriod = period === 'AM' ? 'PM' : 'AM';
      updateTime(hoursDisplay, minutesDisplay, newPeriod);
    };

    return (
      <div className="flex items-center gap-2 px-2 py-2">
        {/* Hours Box */}
        <input
          type="text"
          value={hoursDisplay}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\D/g, ''); // Only digits
            if (newValue === '' || (parseInt(newValue) >= 1 && parseInt(newValue) <= 12)) {
              updateTime(newValue || '1', minutesDisplay);
            }
          }}
          className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/20"
          maxLength={2}
          placeholder="12"
        />
        
        {/* Colon separator */}
        <span className="text-white/70">:</span>
        
        {/* Minutes Box */}
        <input
          type="text"
          value={minutesDisplay}
          onClick={(e) => (e.target as HTMLInputElement).select()}
          onChange={(e) => {
            const newValue = e.target.value.replace(/\D/g, ''); // Only digits
            if (newValue === '' || (parseInt(newValue) >= 0 && parseInt(newValue) <= 59)) {
              updateTime(hoursDisplay, newValue.padStart(2, '0'));
            }
          }}
          className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/20"
          maxLength={2}
          placeholder="00"
        />
        
        {/* AM/PM Box */}
        <button
          type="button"
          onClick={togglePeriod}
          className="w-8 h-6 text-center bg-white/10 border border-white/30 rounded text-white text-xs hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
        >
          {period}
        </button>
      </div>
    );
  };

  // Simple calendar component
  const Calendar = ({ selectedDate, onDateSelect, onClose }: { 
    selectedDate: string; 
    onDateSelect: (date: string) => void; 
    onClose: () => void;
  }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const [viewMonth, setViewMonth] = useState(currentMonth);
    const [viewYear, setViewYear] = useState(currentYear);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateString === selectedDate;
      const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      
      days.push(
        <button
          key={day}
          onClick={() => {
            onDateSelect(dateString);
            onClose();
          }}
          className={`w-8 h-8 text-sm rounded hover:bg-white/20 transition-colors ${
            isSelected 
              ? 'bg-purple-500 text-white' 
              : isToday 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white/20 rounded-lg shadow-xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear(viewYear - 1);
                } else {
                  setViewMonth(viewMonth - 1);
                }
              }}
              className="text-white/70 hover:text-white text-sm px-2 py-1 hover:bg-white/10 rounded"
            >
              ‹
            </button>
            <div className="text-white text-sm font-medium">
              {months[viewMonth]} {viewYear}
            </div>
            <button 
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear(viewYear + 1);
                } else {
                  setViewMonth(viewMonth + 1);
                }
              }}
              className="text-white/70 hover:text-white text-sm px-2 py-1 hover:bg-white/10 rounded"
            >
              ›
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="w-8 h-8 text-xs text-white/60 flex items-center justify-center font-medium">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>
      </div>
    );
  };

  // Format the display value to always show .00
  const formatPrice = (value: string) => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue.toFixed(2);
  };

  // Handle price input changes
  const handlePriceChange = (value: string) => {
    // Allow typing without formatting, but store the raw number
    updateFormData({ Amount: value });
  };

  // Handle blur to format the price
  const handlePriceBlur = () => {
    if (formData.Amount) {
      const formatted = formatPrice(formData.Amount);
      updateFormData({ Amount: formatted });
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Bounty Compensation */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faDollarSign} className="text-purple-400" />
          Bounty Compensation
          <Tooltip id="bounty-compensation" text="The fixed amount you'll pay to the developer who successfully completes your bounty requirements.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <input
          type="number"
          value={formData.Amount || ''}
          onChange={(e) => handlePriceChange(e.target.value)}
          onBlur={handlePriceBlur}
          className={`w-full px-3 py-2 bg-white/5 border rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
            errors.Amount ? 'border-red-500' : 'border-white/20'
          }`}
          placeholder="Enter amount (e.g., 1000.00)"
          min="0"
          step="0.01"
        />
        {errors.Amount && <p className="text-red-400 text-xs mt-1">{errors.Amount}</p>}
      </div>

      {/* Bounty Timeline */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-400" />
          Bounty Timeline
          <Tooltip id="bounty-timeline" text="Set when your bounty starts and expires. Click the date to open calendar, and set the time.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="space-y-4">
          {/* Bounty Starts */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Bounty Starts</label>
            <div className="inline-flex bg-white/5 border border-white/20 rounded-md overflow-hidden">
              <div 
                className="relative"
                onMouseLeave={() => setShowStartCalendar(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="flex items-center gap-2 px-3 py-2 text-white text-sm hover:text-purple-400 transition-colors whitespace-nowrap border-r border-white/20 group"
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-white group-hover:text-purple-300 text-xs transition-colors" />
                  <span className="group-hover:text-purple-300 transition-colors">
                    {formatDisplayDate(formData.StartDate || getCurrentDate())}
                  </span>
                </button>
                {showStartCalendar && (
                  <Calendar
                    selectedDate={formData.StartDate || getCurrentDate()}
                    onDateSelect={(date) => updateFormData({ StartDate: date })}
                    onClose={() => setShowStartCalendar(false)}
                  />
                )}
              </div>
              <div>
                <CustomTimeInput
                  value={formData.StartTime || getCurrentTime()}
                  onChange={(time) => updateFormData({ StartTime: time })}
                />
              </div>
            </div>
          </div>

          {/* Bounty Expires */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Bounty Expires</label>
            <div className={`inline-flex bg-white/5 border rounded-md overflow-hidden ${
              errors.Deadline ? 'border-red-500' : 'border-white/20'
            }`}>
              <div 
                className="relative"
                onMouseLeave={() => setShowEndCalendar(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="flex items-center gap-2 px-3 py-2 text-white text-sm hover:text-purple-400 transition-colors whitespace-nowrap border-r border-white/20 group"
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-white group-hover:text-purple-300 text-xs transition-colors" />
                  <span className="group-hover:text-purple-300 transition-colors">
                    {formatDisplayDate(formData.Deadline || '')}
                  </span>
                </button>
                {showEndCalendar && (
                  <Calendar
                    selectedDate={formData.Deadline || ''}
                    onDateSelect={(date) => updateFormData({ Deadline: date })}
                    onClose={() => setShowEndCalendar(false)}
                  />
                )}
              </div>
              <div>
                <CustomTimeInput
                  value={formData.ExpiryTime || '--:-- PM'}
                  onChange={(time) => updateFormData({ ExpiryTime: time })}
                />
              </div>
            </div>
          </div>
        </div>
        
        {errors.Deadline && <p className="text-red-400 text-xs mt-1">{errors.Deadline}</p>}
      </div>

      {/* Estimated Project Length */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-purple-400" />
          Estimated Project Length
          <Tooltip id="project-length" text="How long do you expect this project to take once a developer starts working on it?">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              type="range"
              min="1"
              max="13"
              step="1"
              value={
                formData.eprojectlength === '<1-hour' ? '1' :
                formData.eprojectlength === '1-3-hours' ? '2' :
                formData.eprojectlength === '3-6-hours' ? '3' :
                formData.eprojectlength === '6-12-hours' ? '4' :
                formData.eprojectlength === '1-day' ? '5' :
                formData.eprojectlength === '2-days' ? '6' :
                formData.eprojectlength === '3-5-days' ? '7' :
                formData.eprojectlength === '1-week' ? '8' :
                formData.eprojectlength === '2-weeks' ? '9' :
                formData.eprojectlength === '1-month' ? '10' :
                formData.eprojectlength === '1-2-months' ? '11' :
                formData.eprojectlength === '3-5-months' ? '12' :
                formData.eprojectlength === '6-months-plus' ? '13' : '5'
              }
              onChange={(e) => {
                const value = e.target.value;
                const duration = 
                  value === '1' ? '<1-hour' :
                  value === '2' ? '1-3-hours' :
                  value === '3' ? '3-6-hours' :
                  value === '4' ? '6-12-hours' :
                  value === '5' ? '1-day' :
                  value === '6' ? '2-days' :
                  value === '7' ? '3-5-days' :
                  value === '8' ? '1-week' :
                  value === '9' ? '2-weeks' :
                  value === '10' ? '1-month' :
                  value === '11' ? '1-2-months' :
                  value === '12' ? '3-5-months' : '6-months-plus';
                updateFormData({ eprojectlength: duration });
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer duration-slider"
            />
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>&lt;1h</span>
              <span></span>
              <span>3-6h</span>
              <span></span>
              <span>1d</span>
              <span></span>
              <span>3-5d</span>
              <span></span>
              <span>2w</span>
              <span></span>
              <span>1-2m</span>
              <span></span>
              <span>6m+</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium text-white">
              {formData.eprojectlength === '<1-hour' ? '<1 Hour' :
               formData.eprojectlength === '1-3-hours' ? '1-3 Hours' :
               formData.eprojectlength === '3-6-hours' ? '3-6 Hours' :
               formData.eprojectlength === '6-12-hours' ? '6-12 Hours' :
               formData.eprojectlength === '1-day' ? '1 Day' :
               formData.eprojectlength === '2-days' ? '2 Days' :
               formData.eprojectlength === '3-5-days' ? '3-5 Days' :
               formData.eprojectlength === '1-week' ? '1 Week' :
               formData.eprojectlength === '2-weeks' ? '2 Weeks' :
               formData.eprojectlength === '1-month' ? '1 Month' :
               formData.eprojectlength === '1-2-months' ? '1-2 Months' :
               formData.eprojectlength === '3-5-months' ? '3-5 Months' :
               formData.eprojectlength === '6-months-plus' ? '6+ Months' :
               'Select Duration'}
            </div>
            <div className="text-sm text-white/70">
              {formData.eprojectlength === '<1-hour' ? 'Quick fixes, small tweaks' :
               formData.eprojectlength === '1-3-hours' ? 'Minor features, bug fixes' :
               formData.eprojectlength === '3-6-hours' ? 'Small components, scripts' :
               formData.eprojectlength === '6-12-hours' ? 'Medium features, integrations' :
               formData.eprojectlength === '1-day' ? 'Full day project, complete feature' :
               formData.eprojectlength === '2-days' ? 'Extended feature development' :
               formData.eprojectlength === '3-5-days' ? 'Multi-component features' :
               formData.eprojectlength === '1-week' ? 'Small to medium project' :
               formData.eprojectlength === '2-weeks' ? 'Medium project with testing' :
               formData.eprojectlength === '1-month' ? 'Large feature or small application' :
               formData.eprojectlength === '1-2-months' ? 'Medium application development' :
               formData.eprojectlength === '3-5-months' ? 'Large application or system' :
               formData.eprojectlength === '6-months-plus' ? 'Enterprise-level project' :
               'Choose the expected time to complete this project'}
            </div>
          </div>
        </div>
        {errors.eprojectlength && <p className="text-red-400 text-xs mt-1">{errors.eprojectlength}</p>}
      </div>

      {/* Project Complexity */}
      <div>
        <label className="block text-white font-medium mb-2 text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faCogs} className="text-purple-400" />
          Project Complexity
          <Tooltip id="project-complexity" text="How complex is this project? This helps developers understand the skill level required.">
            <FontAwesomeIcon icon={faInfoCircle} className="text-white/50 text-xs hover:text-white/80" />
          </Tooltip>
        </label>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={
                formData.complexityLevel === 'simple' ? '1' :
                formData.complexityLevel === 'moderate' ? '2' :
                formData.complexityLevel === 'complex' ? '3' :
                formData.complexityLevel === 'expert' ? '4' : '2'
              }
              onChange={(e) => {
                const value = e.target.value;
                const complexity = 
                  value === '1' ? 'simple' :
                  value === '2' ? 'moderate' :
                  value === '3' ? 'complex' : 'expert';
                updateFormData({ complexityLevel: complexity });
              }}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer complexity-slider"
            />
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>Simple</span>
              <span>Moderate</span>
              <span>Complex</span>
              <span>Expert</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium text-white">
              {formData.complexityLevel === 'simple' ? 'Simple' :
               formData.complexityLevel === 'moderate' ? 'Moderate' :
               formData.complexityLevel === 'complex' ? 'Complex' :
               formData.complexityLevel === 'expert' ? 'Expert' :
               'Select Complexity'}
            </div>
            <div className="text-sm text-white/70">
              {formData.complexityLevel === 'simple' ? 'Basic functionality, straightforward tasks' :
               formData.complexityLevel === 'moderate' ? 'Some complexity, requires experience' :
               formData.complexityLevel === 'complex' ? 'Advanced features, significant expertise' :
               formData.complexityLevel === 'expert' ? 'Highly specialized, expert-level skills' :
               'Choose the complexity level that best fits your project'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .complexity-slider::-webkit-slider-thumb,
        .duration-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .complexity-slider::-moz-range-thumb,
        .duration-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default BountyStpfive;