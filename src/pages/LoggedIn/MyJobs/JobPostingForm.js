import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { firestore } from '../../../firebase'; // Import your Firestore instance
import ProgressBar from './ProgressBar';
import './JobPostingForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faGift, faFileContract, faTrophy, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

// Use the test key for testing purposes
const stripePromise = loadStripe('pk_test_51PVdEj02Xwjq9MLsTy2IJAZ52ar7iGwPWHNGOdTYNbkkFKDcKSZO2NlIWoTU3g24EZMaox1qsRUst9MUYvjWKVEF00VvCrzadl'); // Change to pk_live_YOUR_LIVE_PUBLISHABLE_KEY for live

const jobPostTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faGift },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
  { type: "Assist", icon: faHandsHelping },
];

function JobPostingForm({ closeForm }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectTitle: "",
    companyName: "",
    projectOverview: "",
    projectType: "",
    tools: [],
    tags: [],
    filePermissions: 'public',
    selectedJobPostType: "",
    auctionStartingBid: "",
    auctionStartTime: "",
    auctionLength: "",
    bountyAmount: "",
    projectStart: "",
    projectEnd: "",
    contractAmount: "",
    contractApplyPeriodStart: "",
    contractApplyPeriodEnd: "",
    challengeAmount: "",
    challengeStartTime: "",
    projectStartTime: "",
    projectEndTime: "",
    projectLength: "",
    includedRevisions: "",
    extraPaidRevisions: "",
    requirements: "",
    milestones: "",
    prepaidRevisions: "",
    revisionCost: "",
    lateDiscount: "",
    postLiveDate: "",
    jobClosedTiming: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [toolInput, setToolInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [suggestedTypes, setSuggestedTypes] = useState([]);

  const totalSteps = 8;

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Publishing job...");

    try {
      // Save job data to Firestore
      const jobRef = await firestore.collection('jobs').add(formData);
      const jobId = jobRef.id;

      // Create Stripe checkout session
      const response = await fetch('https://us-central1-codeplace-76019.cloudfunctions.net/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobId, // Use actual job ID from Firestore
          amount: 2000, // Replace with actual amount in cents
          currency: 'usd', // Replace with actual currency
          userId: 'user_67890' // Replace with actual user ID
        }),
      });

      if (!response.ok) {
        console.error("Failed to create checkout session");
        return;
      }

      const session = await response.json();
      console.log("Session created:", session);

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error("Stripe Checkout Error:", error);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImageFiles = files.map(file => {
      return {
        file,
        preview: URL.createObjectURL(file)
      };
    });
    setImageFiles([...imageFiles, ...newImageFiles]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleProjectTypeChange = (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      projectType: value,
    });
    const suggestions = ["Mobile App Development", "Native App Development", "Cross-Platform App Development", "Mobile Game Development", "Web Development", "Frontend Development",
      "Backend Development", "Full Stack Development", "E-commerce Website Development", "CMS Development (e.g., WordPress, Joomla)", "Desktop Application Development", "Windows Application Development",
      "Mac Application Development", "Cross-Platform Desktop Development", "Game Development", "2D Game Development", "3D Game Development", "VR/AR Game Development", "Database Management", "Database Design",
      "Database Optimization", "Database Migration", "Big Data Management", "DevOps and Infrastructure", "CI/CD Pipeline Setup", "Cloud Infrastructure Setup (AWS, Azure, Google Cloud)", "Server Management", "API Development and Integration",
      "RESTful API Development", "GraphQL API Development", "Third-Party API Integration", "Software Testing and QA", "Manual Testing", "Automated Testing", "Performance Testing", "Security", "Application Security Assessment", "Penetration Testing",
      "Security Patch Implementation", "Artificial Intelligence and Machine Learning", "AI Model Development", "Machine Learning Algorithm Implementation", "Natural Language Processing", "Data Science and Analytics", "Data Analysis and Visualization",
      "Predictive Modeling", "Data Mining", "IoT (Internet of Things)", "IoT Device Programming", "IoT Data Management", "Smart Home Solutions", "Blockchain and Cryptocurrency", "Smart Contract Development", "Blockchain Integration",
      "Cryptocurrency Wallet Development", "AR/VR Development", "Augmented Reality Solutions", "Virtual Reality Applications", "Automation", "Script Development", "Robotic Process Automation (RPA)", "Workflow Automation", "CRM and ERP Solutions",
      "Custom CRM Development", "ERP System Integration", "Content Management Systems", "Custom CMS Development", "CMS Customization", "E-learning Solutions", "LMS Development", "Educational App Development", "Legacy System Modernization",
      "Code Refactoring", "System Migration", "Technical Support and Maintenance", "Bug Fixing", "Performance Optimization", "System Updates"].filter(type => type.toLowerCase().includes(value.toLowerCase()));
    setSuggestedTypes(suggestions);
  };

  const selectSuggestedType = (type) => {
    setFormData({
      ...formData,
      projectType: type,
    });
    setSuggestedTypes([]);
  };

  const handleToolInputChange = (e) => {
    setToolInput(e.target.value);
  };

  const handleAddTool = () => {
    if (toolInput.trim() !== '') {
      setFormData({
        ...formData,
        tools: [...formData.tools, { name: toolInput.trim() }],
      });
      setToolInput('');
    }
  };

  const handleRemoveTool = (index) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_, i) => i !== index),
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleFilePermissionsChange = (e) => {
    setFormData({
      ...formData,
      filePermissions: e.target.value,
    });
  };

  const handleJobPostTypeClick = (type) => {
    setFormData({
      ...formData,
      selectedJobPostType: type,
    });
  };

  return (
    <div className="job-posting-form">
      <form className="job-posting-form__form" onSubmit={handleSubmit}>
        <ProgressBar step={step} totalSteps={totalSteps} /> {/* Add ProgressBar here */}
        {step === 1 && (
          <div>
            <h2 className="job-posting-form__title">Project Overview</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Title</label>
              <input type="text" name="projectTitle" className="job-posting-form__input" value={formData.projectTitle} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Company Name</label>
              <input type="text" name="companyName" className="job-posting-form__input" value={formData.companyName} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Overview</label>
              <textarea name="projectOverview" className="job-posting-form__textarea" value={formData.projectOverview} onChange={handleChange}></textarea>
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Upload Image Files</label>
              <input type="file" name="imageFiles" className="job-posting-form__file-input" accept="image/*" multiple onChange={handleImageUpload} />
              <div className="job-posting-form__image-preview">
                {imageFiles.map((image, index) => (
                  <div key={index} className="job-posting-form__image-container">
                    <img src={image.preview} alt="Preview" className="job-posting-form__image" />
                    <button type="button" className="job-posting-form__remove-button" onClick={() => removeImage(index)}>X</button>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="job-posting-form__title">Project Type and Tools</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Type</label>
              <input
                type="text"
                name="projectType"
                className="job-posting-form__input"
                value={formData.projectType}
                onChange={handleProjectTypeChange}
              />
              {suggestedTypes.length > 0 && (
                <ul className="job-posting-form__suggestions">
                  {suggestedTypes.map((type, index) => (
                    <li
                      key={index}
                      className="job-posting-form__suggestion-item"
                      onClick={() => selectSuggestedType(type)}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Required Tools</label>
              <div className="job-posting-form__tool-input-container">
                <input
                  type="text"
                  className="job-posting-form__input"
                  value={toolInput}
                  onChange={handleToolInputChange}
                  placeholder="Type a tool and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                />
                <button type="button" className="job-posting-form__add-tool-button" onClick={handleAddTool}>
                  Add
                </button>
              </div>
              <div className="job-posting-form__tool-list">
                {formData.tools.map((tool, index) => (
                  <div key={index} className="job-posting-form__tool-item">
                    <span>{tool.name}</span>
                    <button
                      type="button"
                      className="job-posting-form__remove-button"
                      onClick={() => handleRemoveTool(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Add Tags for Filtering</label>
              <div className="job-posting-form__tag-input-container">
                <input
                  type="text"
                  className="job-posting-form__input"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  placeholder="Type a tag and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button type="button" className="job-posting-form__add-tag-button" onClick={handleAddTag}>
                  Add
                </button>
              </div>
              <div className="job-posting-form__tag-list">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="job-posting-form__tag-item">
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="job-posting-form__remove-button"
                      onClick={() => handleRemoveTag(index)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 className="job-posting-form__title">Job Post Type and Project Length</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Job Post Type</label>
              <div className="job-posting-form__icons">
                {jobPostTypes.map(({ type, icon }) => (
                  <div
                    key={type}
                    className={`job-posting-form__icon-container ${formData.selectedJobPostType === type ? 'selected' : ''}`}
                    onClick={() => handleJobPostTypeClick(type)}
                  >
                    <FontAwesomeIcon icon={icon} className="job-posting-form__icon" />
                    <span className="job-posting-form__icon-text">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            {formData.selectedJobPostType === 'Auction' && (
              <>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Auction Starting Bid</label>
                  <input type="text" name="auctionStartingBid" className="job-posting-form__input" value={formData.auctionStartingBid} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Auction Start Time</label>
                  <input type="datetime-local" name="auctionStartTime" className="job-posting-form__input" value={formData.auctionStartTime} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Auction Length</label>
                  <input type="text" name="auctionLength" className="job-posting-form__input" value={formData.auctionLength} onChange={handleChange} />
                </div>
              </>
            )}
            {formData.selectedJobPostType === 'Bounty' && (
              <>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Bounty Amount</label>
                  <input type="text" name="bountyAmount" className="job-posting-form__input" value={formData.bountyAmount} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Project Start</label>
                  <input type="datetime-local" name="projectStart" className="job-posting-form__input" value={formData.projectStart} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Project End</label>
                  <input type="datetime-local" name="projectEnd" className="job-posting-form__input" value={formData.projectEnd} onChange={handleChange} />
                </div>
              </>
            )}
            {formData.selectedJobPostType === 'Contract' && (
              <>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Contract Amount</label>
                  <input type="text" name="contractAmount" className="job-posting-form__input" value={formData.contractAmount} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Contract Apply Period Start</label>
                  <input type="datetime-local" name="contractApplyPeriodStart" className="job-posting-form__input" value={formData.contractApplyPeriodStart} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Contract Apply Period End</label>
                  <input type="datetime-local" name="contractApplyPeriodEnd" className="job-posting-form__input" value={formData.contractApplyPeriodEnd} onChange={handleChange} />
                </div>
              </>
            )}
            {formData.selectedJobPostType === 'Challenge' && (
              <>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Challenge Amount</label>
                  <input type="text" name="challengeAmount" className="job-posting-form__input" value={formData.challengeAmount} onChange={handleChange} />
                </div>
                <div className="job-posting-form__field">
                  <label className="job-posting-form__label">Challenge Start Time</label>
                  <input type="datetime-local" name="challengeStartTime" className="job-posting-form__input" value={formData.challengeStartTime} onChange={handleChange} />
                </div>
              </>
            )}
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Start Time</label>
              <input type="datetime-local" name="projectStartTime" className="job-posting-form__input" value={formData.projectStartTime} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project End Time</label>
              <input type="datetime-local" name="projectEndTime" className="job-posting-form__input" value={formData.projectEndTime} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Length</label>
              <input type="text" name="projectLength" className="job-posting-form__input" value={formData.projectLength} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Included Revisions</label>
              <input type="number" name="includedRevisions" className="job-posting-form__input" value={formData.includedRevisions} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Extra Paid Revisions</label>
              <input type="number" name="extraPaidRevisions" className="job-posting-form__input" value={formData.extraPaidRevisions} onChange={handleChange} />
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2 className="job-posting-form__title">Project Requirements and Deliverables</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Requirements and Deliverables</label>
              <textarea name="requirements" className="job-posting-form__textarea" value={formData.requirements} onChange={handleChange}></textarea>
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Project Milestones</label>
              <textarea name="milestones" className="job-posting-form__textarea" value={formData.milestones} onChange={handleChange}></textarea>
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Amount of Prepaid Revisions</label>
              <input type="number" name="prepaidRevisions" className="job-posting-form__input" value={formData.prepaidRevisions} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Cost of Revisions</label>
              <input type="text" name="revisionCost" className="job-posting-form__input" value={formData.revisionCost} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Late Discount</label>
              <input type="text" name="lateDiscount" className="job-posting-form__input" value={formData.lateDiscount} onChange={handleChange} />
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="job-posting-form__title">Upload Graphics, Code, and Existing Works</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Upload Graphics, Code, and Existing Works</label>
              <input type="file" name="existingWorks" className="job-posting-form__file-input" multiple />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">File Permissions Control</label>
              <div className="job-posting-form__permissions">
                <label>
                  <input
                    type="radio"
                    name="filePermissions"
                    value="public"
                    checked={formData.filePermissions === 'public'}
                    onChange={handleFilePermissionsChange}
                  />
                  Public
                </label>
                <label>
                  <input
                    type="radio"
                    name="filePermissions"
                    value="applicants"
                    checked={formData.filePermissions === 'applicants'}
                    onChange={handleFilePermissionsChange}
                  />
                  Open to those who apply
                </label>
                <label>
                  <input
                    type="radio"
                    name="filePermissions"
                    value="hired"
                    checked={formData.filePermissions === 'hired'}
                    onChange={handleFilePermissionsChange}
                  />
                  Open to those who are hired
                </label>
              </div>
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="job-posting-form__title">Job Posting Details</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">When Should the Post Go Live?</label>
              <input type="datetime-local" name="postLiveDate" className="job-posting-form__input" value={formData.postLiveDate} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Auction Length</label>
              <input type="text" name="auctionLength" className="job-posting-form__input" value={formData.auctionLength} onChange={handleChange} />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">Job Closed Timing</label>
              <input type="text" name="jobClosedTiming" className="job-posting-form__input" value={formData.jobClosedTiming} onChange={handleChange} />
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
              Next
            </button>
          </div>
        )}
        {step === 7 && (
          <div>
            <h2 className="job-posting-form__title">Overview of Your Post</h2>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Please review all the details of your job post. Ensure all information is correct.
              </label>
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                <input type="checkbox" name="agreeTerms" className="job-posting-form__checkbox" />
                I agree to the terms and conditions
              </label>
            </div>
            <button type="button" className="job-posting-form__prev-button" onClick={prevStep}>
              Previous
            </button>
            <button type="submit" className="job-posting-form__submit-button">
              Publish Job
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default JobPostingForm;
