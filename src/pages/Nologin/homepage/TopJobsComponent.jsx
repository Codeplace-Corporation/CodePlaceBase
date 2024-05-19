import * as React from 'react';
import './TopJobsComponent.css';
function TopJobsComponent({ title, username, price, timeRemaining }) {
  return (
    <section className="job-listing"> {/* Ensure this class name matches the one in MyComponent */}
      <div className="job-details">
        <h3 className="job-title">{title}</h3>
        <p className="posted-by">Posted By: {username}</p>
      </div>
      <div className="job-meta">
        <div className="price-info">
          <span className="currency-symbol">$</span>
          <span className="price-amount">{price}</span>
        </div>
        <p className="time-remaining">Time Remaining: {timeRemaining}</p>
      </div>
    </section>
  );
}

export default TopJobsComponent;
