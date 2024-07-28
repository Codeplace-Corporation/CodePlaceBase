import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { firestore, collection, addDoc } from '../../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProgressBar from './ProgressBar';
import './JobPostingForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { faGavel, faGift, faFileContract, faTrophy, faQuestionCircle, faUpload } from '@fortawesome/free-solid-svg-icons';

const stripePromise = loadStripe('pk_test_51PVdEj02Xwjq9MLsTy2IJAZ52ar7iGwPWHNGOdTYNbkkFKDcKSZO2NlIWoTU3g24EZMaox1qsRUst9MUYvjWKVEF00VvCrzadl');

const jobPostTypes = [
  { type: "Auction", icon: faGavel },
  { type: "Bounty", icon: faGift },
  { type: "Contract", icon: faFileContract },
  { type: "Challenge", icon: faTrophy },
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
    compensation: "",
    contractApplyPeriodStart: "",
    contractApplyPeriodEnd: "",
    challengeAmount: "",
    challengeStartTime: "",
    projectStartTime: "",
    projectEndTime: "",
    projectLength: "",
    projectDescription: "",
    requirements: [],
    deliverables: [],
    fileDescriptions: [],
    prepaidRevisions: "",
    revisionCost: "",
    lateDiscount: "",
    postLiveDate: "",
    jobClosedTiming: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [toolInput, setToolInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [fileDescriptionInput, setFileDescriptionInput] = useState('');
  const [suggestedTypes, setSuggestedTypes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const calculateProjectLengths = (length) => {
    const hours = length * 24;
    const days = length;
    const weeks = length / 7;
    const months = length / 30;

    return { projectLengthHours: hours, projectLengthDays: days, projectLengthWeeks: weeks, projectLengthMonths: months };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error("User is not authenticated.");
      return;
    }

    console.log("Publishing job...");

    try {
      // Calculate project lengths
      const projectLengths = calculateProjectLengths(formData.projectLength);

      // Add userId and calculated project lengths to formData
      const dataToSubmit = {
        ...formData,
        ...projectLengths,
        userId: userId,
      };

      // Save job data to Firestore
      console.log("Attempting to add job to Firestore...");
      const jobRef = await addDoc(collection(firestore, 'jobs'), dataToSubmit);
      console.log("Job added to Firestore, getting jobId...");
      const jobId = jobRef.id;

      // Log job creation
      console.log(`Job created with ID: ${jobId}`);

      // Create Stripe checkout session
      console.log("Attempting to create Stripe checkout session...");
      const response = await fetch('https://us-central1-codeplace-76019.cloudfunctions.net/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobId, // Use actual job ID from Firestore
          amount: 2000, // Replace with actual amount in cents
          currency: 'usd', // Replace with actual currency
          userId: userId // Use actual user ID
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
      selectedJobPostType: formData.selectedJobPostType === type ? "" : type,
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageFiles([...imageFiles, ...newImageFiles]);
  };

  const handleCompensationChange = (e, type) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only keep numeric characters
    setFormData({
      ...formData,
      [`${type}Compensation`]: value,
    });
  };

  const formatCompensation = (e, type) => {
    const value = parseInt(e.target.value, 10);
    const formattedValue = isNaN(value) ? "$0.00" : `$${(value / 100).toFixed(2)}`;
    setFormData({
      ...formData,
      [`${type}Compensation`]: formattedValue,
    });
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim() !== '') {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()],
      });
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddDeliverable = () => {
    if (deliverableInput.trim() !== '') {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, deliverableInput.trim()],
      });
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== index),
    });
  };

  const handleAddFileDescription = () => {
    if (fileDescriptionInput.trim() !== '') {
      setFormData({
        ...formData,
        fileDescriptions: [...formData.fileDescriptions, fileDescriptionInput.trim()],
      });
      setFileDescriptionInput('');
    }
  };

  const handleRemoveFileDescription = (index) => {
    setFormData({
      ...formData,
      fileDescriptions: formData.fileDescriptions.filter((_, i) => i !== index),
    });
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prevIndex) => (prevIndex === 0 ? imageFiles.length - 1 : prevIndex - 1));
  };

  const handleNextSlide = () => {
    setCarouselIndex((prevIndex) => (prevIndex === imageFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const getTimeDifferenceInPixels = (startDate, endDate) => {
    const msInDay = 24 * 60 * 60 * 1000;
    const timeDiffInMs = endDate - startDate;
    const timeDiffInDays = timeDiffInMs / msInDay;

    // Assuming 1 day = 10 pixels (you can adjust this scale as needed)
    return timeDiffInDays * 10;
  };

  return (
    <div className="job-posting-form">
      <button
        type="button"
        className="job-posting-form__save-button"
        onClick={closeForm}
      >
        Save as Draft
      </button>
      <button
        type="button"
        className="job-posting-form__close-button"
        onClick={closeForm}
      >
        Close
      </button>
      <form className="job-posting-form__form" onSubmit={handleSubmit}>
        <ProgressBar step={step} totalSteps={totalSteps} />
        {step === 1 && (
          <div className="job-posting-form__section">
            <div className="job-posting-form__column job-posting-form__column-heading">
              <h2 className="job-posting-form__title">Project <br />Overview</h2>
              <p className="job-posting-form__paragraph">&nbsp; Introduce Your Project and yourself </p>
              <p className="job-posting-form__paragraph">&nbsp; Give a brief overview of the work you need done</p>
              <p className="job-posting-form__paragraph">&nbsp; Add Images to your job post to give a clear picture of <br /> &nbsp; what you need done </p>
            </div>
            <div className="job-posting-form__column job-posting-form__column-content">
              <div className="job-posting-form__field">
                <p className='Required'> Required Field </p>
                <label className="job-posting-form__label">
                  Project Title
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Enter the title of the project</span>
                  </span>
                  <span className='Required'></span>
                </label>
                <input type="text" name="projectTitle" className="job-posting-form__input" value={formData.projectTitle} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Company Name
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Enter the name of your company</span>
                  </span>
                </label>
                <input type="text" name="companyName" className="job-posting-form__input" value={formData.companyName} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Project Overview
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide an overview of the project</span>
                  </span>
                </label>
                <textarea name="projectOverview" className="job-posting-form__textarea" value={formData.projectOverview} onChange={handleChange} style={{ fontFamily: 'Inter, sans-serif' }}></textarea>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Upload Image Files
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Upload any relevant images for the project, These w ill be used to advertise the post</span>
                  </span>
                </label>
                <div
                  className={`job-posting-form__file-drop ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <FontAwesomeIcon icon={faUpload} className="job-posting-form__file-drop-icon" />
                  <div className="job-posting-form__file-drop-text">
                    Choose a file or drag it here.
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    name="imageFiles"
                    className="job-posting-form__file-drop-input"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="job-posting-form__image-preview">
                  {imageFiles.map((image, index) => (
                    <div key={index} className="job-posting-form__image-container">
                      <img src={image.preview} alt="Preview" className="job-posting-form__image" />
                      <button type="button" className="job-posting-form__remove-button" onClick={() => removeImage(index)}>X</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Project Type and Tools</h2>
              <p className="job-posting-form__paragraph">&nbsp; Select you Project type form the list</p>
              <p className="job-posting-form__paragraph">&nbsp; Select what languages,APIs or other tools you <br /> &nbsp; need your project made with</p>
              <p className="job-posting-form__paragraph">&nbsp; Add tags to help devlopers find your project <br /> &nbsp; </p>
            </div>
            <div className="job-posting-form__column-left">
              <p className='Required'> Required Field </p>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Type
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Enter the type of your project</span>
                    <span className='Required'></span>
                  </span>
                </label>
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
                <label className="job-posting-form__label">
                  Required Tools
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Enter the required tools for your project</span>
                  </span>
                </label>
                <div className="job-posting-form__input-with-button">
                  <input
                    type="text"
                    className="job-posting-form__input"
                    value={toolInput}
                    onChange={handleToolInputChange}
                    placeholder="Type a tool and press +"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                  />
                  <button type="button" className="job-posting-form__add-button" onClick={handleAddTool}>
                    +
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
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Add Tags for Filtering
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Enter tags to help developers find your project</span>
                  </span>
                </label>
                <div className="job-posting-form__input-with-button">
                  <input
                    type="text"
                    className="job-posting-form__input"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    placeholder="Type a tag and press +"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button type="button" className="job-posting-form__add-button" onClick={handleAddTag}>
                    +
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
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Job Post Type and Project Length</h2>
              <p className="job-posting-form__paragraph">&nbsp; Select the type of job post and provide the estimated project length.</p>
            </div>
            <div className="job-posting-form__column-left">
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">Select A Post Type</label>
                <div className="job-posting-form__icons">
                  {jobPostTypes.map(({ type, icon }) => (
                    <div
                      key={type}
                      className={`job-posting-form__icon-container ${formData.selectedJobPostType === type ? 'selected' : ''}`}
                      onClick={() => handleJobPostTypeClick(type)}
                      onMouseEnter={() => setFormData({ ...formData, hoveredJobPostType: type })}
                      onMouseLeave={() => setFormData({ ...formData, hoveredJobPostType: "" })}
                    >
                      <FontAwesomeIcon icon={icon} className="job-posting-form__icon" />
                      <span className="job-posting-form__icon-text">{type}</span>
                    </div>
                  ))}
                </div>
                {formData.hoveredJobPostType && (
                  <div className="job-posting-form__type-description">
                    {formData.hoveredJobPostType === "Auction" && <p>Auctions are optimized for price.<br /><br /> Set a starting bid and auction length, and have developers bid on your project in an open market.<br /><br /> Payment is required once you accept a bid, but if the developers fail to complete the job, the money is returned.</p>}
                    {formData.hoveredJobPostType === "Bounty" && <p>Bounties are optimized for time.<br /><br /> Set your requirements and bounty amount, and the first to finish gets paid. Bounties are recommended for projects that need to be done as fast as possible, or smaller projects like bug fixes, homework, or feature implementation.<br /><br /> Payment is required upon posting the job but is returned if it is not successfully completed in the allotted time period.</p>}
                    {formData.hoveredJobPostType === "Contract" && <p>Contracts are optimized for control.<br /><br /> Set your price, requirements, and timeline, and choose the most qualified developer from the applications you receive. Contracts are optimized for larger projects like full sites or apps where it is important to take your time and select the right developer. <br /><br />Payment is required when accepting an application and will be returned if the job is not successfully completed.</p>}
                    {formData.hoveredJobPostType === "Challenge" && <p>Challenges are optimized for creativity.<br /><br /> Set a price and duration for your challenge, then developers will create their own unique solutions, and when the time expires, select the one you like the most to be paid. Challenges are great for design-heavy jobs like UI/UX design or more open-ended jobs.<br /><br /> Payment is required when posting the job but will be returned if you receive no challenge entries or none meet your requirements.</p>}
                  </div>
                )}
                {formData.selectedJobPostType && !formData.hoveredJobPostType && (
                  <div className="job-posting-form__type-description">
                    {formData.selectedJobPostType === "Auction" && <p>Auctions are optimized for price. <br /><br />Set a starting bid and auction length, and have developers bid on your project in an open market. <br /><br /> Payment is required once you accept a bid, but if the developers fail to complete the job, the money is returned.</p>}
                    {formData.selectedJobPostType === "Bounty" && <p>Bounties are optimized for time. <br /><br /> Set your requirements and bounty amount, and the first to finish gets paid. Bounties are recommended for projects that need to be done as fast as possible, or smaller projects like bug fixes, homework, or feature implementation. <br /><br /> Payment is required upon posting the job but is returned if it is not successfully completed in the allotted time period.</p>}
                    {formData.selectedJobPostType === "Contract" && <p>Contracts are optimized for control. <br /><br /> Set your price, requirements, and timeline, and choose the most qualified developer from the applications you receive. Contracts are optimized for larger projects like full sites or apps where it is important to take your time and select the right developer. <br /><br /> Payment is required when accepting an application and will be returned if the job is not successfully completed.</p>}
                    {formData.selectedJobPostType === "Challenge" && <p>Challenges are optimized for creativity.<br /><br />  Set a price and duration for your challenge, then developers will create their own unique solutions, and when the time expires, select the one you like the most to be paid. Challenges are great for design-heavy jobs like UI/UX design or more open-ended jobs.<br /><br />  Payment is required when posting the job but will be returned if you receive no challenge entries or none meet your requirements.</p>}
                  </div>
                )}
              </div>
              <div className="job-posting-form__field">
                {formData.selectedJobPostType && (
                  <div className="job-posting-form__field">
                    <label className="job-posting-form__label">
                      {formData.selectedJobPostType === "Auction" && "Starting Bid"}
                      {formData.selectedJobPostType === "Bounty" && "Bounty Compensation"}
                      {formData.selectedJobPostType === "Contract" && "Contract Compensation"}
                      {formData.selectedJobPostType === "Challenge" && "Challenge Compensation"}
                    </label>
                    <input
                      type="text"
                      name={`${formData.selectedJobPostType.toLowerCase()}Compensation`}
                      className="job-posting-form__input job-posting-form__compensation-input"
                      value={formData[`${formData.selectedJobPostType.toLowerCase()}Compensation`] || ""}
                      onChange={(e) => handleCompensationChange(e, formData.selectedJobPostType.toLowerCase())}
                      onBlur={(e) => formatCompensation(e, formData.selectedJobPostType.toLowerCase())}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Upload Graphics, Code, and Existing Works</h2>
              <p className="job-posting-form__paragraph">&nbsp; Provide detailed descriptions of your project, including any existing works, graphics, and code. Specify the file permissions for these uploads.</p>
            </div>
            <div className="job-posting-form__column-left">
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Description
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide a detailed description of your project</span>
                  </span>
                </label>
                <textarea name="projectDescription" className="job-posting-form__textarea" value={formData.projectDescription} onChange={handleChange}></textarea>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Upload Graphics, Code, and Existing Works
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Upload any relevant files for the project</span>
                  </span>
                </label>
                <div
                  className={`job-posting-form__file-drop ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <FontAwesomeIcon icon={faUpload} className="job-posting-form__file-drop-icon" />
                  <div className="job-posting-form__file-drop-text">
                    Choose a file or drag it here.
                  </div>
                  <input
                    type="file"
                    id="fileInput"
                    name="imageFiles"
                    className="job-posting-form__file-drop-input"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="job-posting-form__image-preview">
                  {imageFiles.map((image, index) => (
                    <div key={index} className="job-posting-form__image-container">
                      <img src={image.preview} alt="Preview" className="job-posting-form__image" />
                      <button type="button" className="job-posting-form__remove-button" onClick={() => removeImage(index)}>X</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  File Permissions Control
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Set permissions for the uploaded files</span>
                  </span>
                </label>
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
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  File Descriptions
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide descriptions for the uploaded files</span>
                  </span>
                </label>
                <div className="job-posting-form__input-with-button">
                  <input
                    type="text"
                    className="job-posting-form__input"
                    value={fileDescriptionInput}
                    onChange={(e) => setFileDescriptionInput(e.target.value)}
                    placeholder="Type a file description and press Add"
                  />
                  <button type="button" className="job-posting-form__add-button" onClick={handleAddFileDescription}>
                    +
                  </button>
                </div>
                <ul className="job-posting-form__list">
                  {formData.fileDescriptions.map((fileDescription, index) => (
                    <li key={index} className="job-posting-form__list-item">
                      {fileDescription}
                      <button
                        type="button"
                        className="job-posting-form__remove-button"
                        onClick={() => handleRemoveFileDescription(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Project Requirements and Deliverables</h2>
              <p className="job-posting-form__paragraph">&nbsp; Provide detailed requirements and deliverables for the project. Outline the project milestones and any other important details.</p>
            </div>
            <div className="job-posting-form__column-left">
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Deliverables
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the deliverables for the project</span>
                  </span>
                </label>
                <div className="job-posting-form__input-with-button">
                  <input
                    type="text"
                    className="job-posting-form__input"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="Type a deliverable and press Add"
                  />
                  <button type="button" className="job-posting-form__add-button" onClick={handleAddDeliverable}>
                    +
                  </button>
                </div>
                <ul className="job-posting-form__list">
                  {formData.deliverables.map((deliverable, index) => (
                    <li key={index} className="job-posting-form__list-item">
                      {deliverable}
                      <button
                        type="button"
                        className="job-posting-form__remove-button"
                        onClick={() => handleRemoveDeliverable(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Milestones
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the project milestones</span>
                  </span>
                </label>
                <textarea name="projectMilestones" className="job-posting-form__textarea" value={formData.projectMilestones} onChange={handleChange}></textarea>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Amount of Prepaid Revisions
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the number of prepaid revisions</span>
                  </span>
                </label>
                <input type="number" name="prepaidRevisions" className="job-posting-form__input" value={formData.prepaidRevisions} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Cost of Additional Revisions
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the cost for additional revisions</span>
                  </span>
                </label>
                <input type="number" name="revisionCost" className="job-posting-form__input" value={formData.revisionCost} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Late Submission Discount
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the discount for late submissions</span>
                  </span>
                </label>
                <input type="number" name="lateDiscount" className="job-posting-form__input" value={formData.lateDiscount} onChange={handleChange} />
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Project Start and End Dates</h2>
              <p className="job-posting-form__paragraph">&nbsp; Provide the project start and end dates, including the project length in days, weeks, and months.</p>
            </div>
            <div className="job-posting-form__column-left">
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Start Date
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the project start date</span>
                  </span>
                </label>
                <input type="date" name="projectStartDate" className="job-posting-form__input" value={formData.projectStartDate} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project End Date
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the project end date</span>
                  </span>
                </label>
                <input type="date" name="projectEndDate" className="job-posting-form__input" value={formData.projectEndDate} onChange={handleChange} />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Length
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Provide the project length in days, weeks, and months</span>
                  </span>
                </label>
                <input type="text" name="projectLength" className="job-posting-form__input" value={formData.projectLength} onChange={handleChange} />
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

{step === 7 && (
  <div className="job-posting-form__container">
    <div className="job-posting-form__column-right">
      <h2 className="job-posting-form__title">Review Your Information</h2>
      <p className="job-posting-form__paragraph">&nbsp; Review all the details you have provided for the project.</p>
    </div>
    <div className="job-posting-form__column-left">
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Title
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project title</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.projectTitle}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Company Name
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the company name</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.companyName}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Overview
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project overview</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.projectOverview}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Type
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project type</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.projectType}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Required Tools
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the required tools</span>
          </span>
        </label>
        <ul className="job-posting-form__review-list">
          {formData.tools.map((tool, index) => (
            <li key={index} className="job-posting-form__review-list-item">{tool.name}</li>
          ))}
        </ul>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Tags
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the tags</span>
          </span>
        </label>
        <ul className="job-posting-form__review-list">
          {formData.tags.map((tag, index) => (
            <li key={index} className="job-posting-form__review-list-item">{tag}</li>
          ))}
        </ul>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Compensation
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the compensation</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.compensation}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Description
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project description</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.projectDescription}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          File Permissions
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the file permissions</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.filePermissions}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          File Descriptions
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the file descriptions</span>
          </span>
        </label>
        <ul className="job-posting-form__review-list">
          {formData.fileDescriptions.map((fileDescription, index) => (
            <li key={index} className="job-posting-form__review-list-item">{fileDescription}</li>
          ))}
        </ul>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Deliverables
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project deliverables</span>
          </span>
        </label>
        <ul className="job-posting-form__review-list">
          {formData.deliverables.map((deliverable, index) => (
            <li key={index} className="job-posting-form__review-list-item">{deliverable}</li>
          ))}
        </ul>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Requirements
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project requirements</span>
          </span>
        </label>
        <ul className="job-posting-form__review-list">
          {formData.requirements.map((requirement, index) => (
            <li key={index} className="job-posting-form__review-list-item">{requirement}</li>
          ))}
        </ul>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Project Milestones
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the project milestones</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.projectMilestones}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Amount of Prepaid Revisions
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the amount of prepaid revisions</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.prepaidRevisions}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Cost of Additional Revisions
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the cost of additional revisions</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.revisionCost}</p>
      </div>
      <div className="job-posting-form__field">
        <label className="job-posting-form__label">
          Late Submission Discount
          <span className="job-posting-form__tooltip">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span className="job-posting-form__tooltiptext">Review the late submission discount</span>
          </span>
        </label>
        <p className="job-posting-form__review-text">{formData.lateDiscount}</p>
      </div>
      <div className="job-posting-form__button-group">
        <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
          Next
        </button>
      </div>
    </div>
  </div>
)}


        {step === 8 && (
          <div className="job-posting-form__container">
            <div className="job-posting-form__column-right">
              <h2 className="job-posting-form__title">Review and Publish</h2>
              <p className="job-posting-form__paragraph">&nbsp; Review all the details of your job post and publish it to make it available to developers.</p>
            </div>
            <div className="job-posting-form__column-left">
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Title
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the project title</span>
                  </span>
                </label>
                <input type="text" name="projectTitle" className="job-posting-form__input" value={formData.projectTitle} onChange={handleChange} disabled />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Company Name
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the company name</span>
                  </span>
                </label>
                <input type="text" name="companyName" className="job-posting-form__input" value={formData.companyName} onChange={handleChange} disabled />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Overview
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the project overview</span>
                  </span>
                </label>
                <textarea name="projectOverview" className="job-posting-form__textarea" value={formData.projectOverview} onChange={handleChange} disabled></textarea>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Project Type
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the project type</span>
                  </span>
                </label>
                <input type="text" name="projectType" className="job-posting-form__input" value={formData.projectType} onChange={handleChange} disabled />
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Tools
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the tools for the project</span>
                  </span>
                </label>
                <ul className="job-posting-form__list">
                  {formData.tools.map((tool, index) => (
                    <li key={index} className="job-posting-form__list-item">{tool.name}</li>
                  ))}
                </ul>
              </div>
              <div className="job-posting-form__field">
                <label className="job-posting-form__label">
                  Tags
                  <span className="job-posting-form__tooltip">
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <span className="job-posting-form__tooltiptext">Review the tags for the project</span>
                  </span>
                </label>
                <ul className="job-posting-form__list">
                  {formData.tags.map((tag, index) => (
                    <li key={index} className="job-posting-form__list-item">{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="job-posting-form__button-group">
                <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
                  Back
                </button>
                <button type="submit" className="job-posting-form__submit-button">
                  Publish Job
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default JobPostingForm;
