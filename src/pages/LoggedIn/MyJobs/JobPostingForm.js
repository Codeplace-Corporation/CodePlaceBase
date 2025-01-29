import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { firestore, collection, addDoc } from '../../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProgressBar from './ProgressBar';
import './JobPostingForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { faGavel, faGift, faFileContract, faTrophy, faQuestionCircle, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
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
    compensation: "",
    challengeStartTime: "",
    projectEndTime: "",
    projectDescription: "",
    deliverables: [],
    prepaidRevisions: "",
    revisionCost: "",
    projectFiles: [],
    estimatedProjectLength: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [tempJobId, setTempJobId] = useState(null);

  const validateForm = () => {
  const errors = {};
  const allRequiredFields = [
    'projectTitle',
    'projectOverview',
    'projectType',
    'tools',
    'tags',
    'selectedJobPostType',
    'compensation',
    'projectDescription',
    'deliverables',
    'prepaidRevisions',
    'filePermissions',
    'estimatedProjectLength'
  ];

  // Add job type-specific required fields
  if (formData.selectedJobPostType === "Bounty") {
    allRequiredFields.push('bountyStartTime', 'bountyEndTime');
  } else if (formData.selectedJobPostType === "Challenge") {
    allRequiredFields.push('challengeStartTime', 'challengeEndTime');
  } else if (formData.selectedJobPostType === "Contract") {
    allRequiredFields.push('applicationsOpenTime', 'applicationsCloseTime', 'contractEndTime');
  } else if (formData.selectedJobPostType === "Auction") {
    allRequiredFields.push('auctionOpenTime', 'auctionCloseTime', 'projectEndTime');
  }

  allRequiredFields.forEach(field => {
    if (Array.isArray(formData[field])) {
      if (formData[field].length === 0) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    } else if (!formData[field] || formData[field].trim() === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
  });

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};



// Helper function to determine which step a field belongs to
const getStepForField = (field) => {
  // Define which fields belong to which steps
  const stepFields = {
    1: ['projectTitle', 'companyName', 'projectOverview'],
    2: ['projectType', 'tools', 'tags'],
    3: ['selectedJobPostType', 'compensation'],
    4: ['projectDescription', 'filePermissions'],
    5: ['deliverables', 'prepaidRevisions', 'revisionCost'],
    6: ['bountyStartTime', 'bountyEndTime', 'challengeStartTime', 'challengeEndTime', 
        'applicationsOpenTime', 'applicationsCloseTime', 'contractEndTime', 
        'auctionOpenTime', 'auctionCloseTime', 'projectEndTime', 'estimatedProjectLength']
  };

  for (let [step, fields] of Object.entries(stepFields)) {
    if (fields.includes(field)) {
      return parseInt(step);
    }
  }
  return null;
};

const handleGeneratePreview = () => {
  const isValid = validateForm();
  if (isValid) {
    setStep(7); // Move to the preview step
  } else {
    setShowErrorPopup(true);
  }
};

const ErrorPopup = ({ errors, onClose, goToStep }) => (
  <div className="job-posting-form__error-popup">
    <div className="job-posting-form__error-popup-content">
      <button onClick={onClose} className="job-posting-form__error-close-button">
        ×
      </button>
      <h2>Required Fields Missing</h2>
      <p>Please fill in the following required fields:</p>
      <ul>
        {Object.entries(errors).map(([field, error]) => (
          <li key={field} onClick={() => goToStep(getStepForField(field))} className="job-posting-form__error-item">
            {error}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
  const goToStep = (step) => {
    setStep(step);
    setShowErrorPopup(false);
  };


  const handleProjectFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prevData => ({
      ...prevData,
      projectFiles: [...prevData.projectFiles, ...files]
    }));
  };
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(prevData => ({
      ...prevData,
      projectFiles: [...prevData.projectFiles, ...files]
    }));
  };
  
  const handleSubmitJob = async (isDraft = false) => {
    if (!userId) {
      console.error("User is not authenticated.");
      return;
    }

    try {
  
      const dataToSubmit = {
        ...formData,
        
        userId: userId,
        createdAt: new Date(),
      };

      const collectionName = isDraft ? 'draftedJobs' : 'activeJobs';
      const jobRef = await addDoc(collection(firestore, collectionName), dataToSubmit);
      console.log(`Job added to ${collectionName}, jobId: ${jobRef.id}`);

      if (!isDraft) {
        // Create Stripe checkout session for active jobs
        const response = await fetch('https://us-central1-codeplace-76019.cloudfunctions.net/createCheckoutSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobRef.id,
            amount: 2000, // Replace with actual amount in cents
            currency: 'usd', // Replace with actual currency
            userId: userId
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
      } else {
        // If it's a draft, just close the form
        closeForm();
      }
    } catch (error) {
      console.error("Error in handleSubmitJob:", error);
    }
  };

  const removeProjectFile = (index) => {
    setFormData(prevData => ({
      ...prevData,
      projectFiles: prevData.projectFiles.filter((_, i) => i !== index)
    }));
  };
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
  const [displayName, setDisplayName] = useState('');
  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setDisplayName(user.displayName); // Assuming user.displayName contains the display name
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalSteps = 7;

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let updatedValue = value;
  
    // Special handling for radio buttons
    if (type === 'radio') {
      updatedValue = e.target.value;
    }
  
    setFormData(prevData => ({
      ...prevData,
      [name]: updatedValue
    }));
  
    // Clear validation error for this field
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined
    }));
  
    // Special handling for fields that need immediate validation
    if (name === 'deliverables' || name === 'tools' || name === 'tags') {
      if (formData[name].length > 0) {
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          [name]: undefined
        }));
      }
    }
  };
  
  // For fields like deliverables, tools, and tags that use a separate input and button to add items
  const handleAddItem = (itemName, item) => {
    setFormData(prevData => ({
      ...prevData,
      [itemName]: [...prevData[itemName], item]
    }));
  
    // Clear validation error when an item is added
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [itemName]: undefined
    }));
  };
  const EstimatedProjectLengthInput = () => (
    <div className="job-posting-form__field">
      <label className="job-posting-form__label">
        Estimated Project Length
        <span className="job-posting-form__tooltip">
          <FontAwesomeIcon icon={faQuestionCircle} />
          <span className="job-posting-form__tooltiptext">Select the estimated length of the project</span>
        </span>
        <span className='Required'></span>
      </label>
      <select
        name="estimatedProjectLength"
        className="job-posting-form__select"
        value={formData.estimatedProjectLength}
        onChange={handleChange}
        required
      >
        <option value="">Select project length</option>
        <option value="<1hour">Less than 1 hour</option>
        <option value="1-3hours">1-3 hours</option>
        <option value="3-6hours">3-6 hours</option>
        <option value="6-12hours">6-12 hours</option>
        <option value="12-24hours">12-24 hours</option>
        <option value="1-3days">1-3 days</option>
        <option value="3-7days">3-7 days</option>
        <option value="1-2weeks">1-2 weeks</option>
        <option value="2-4weeks">2-4 weeks</option>
        <option value=">1month">More than 1 month</option>
      </select>
    </div>
  );


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
  
        userId: userId,
      };

      // Save job data to tempJobs collection in Firestore
      const tempJobRef = await addDoc(collection(firestore, 'tempJobs'), dataToSubmit);
      console.log("Job added to tempJobs, getting jobId...");
      const jobId = tempJobRef.id;

      setTempJobId(jobId); // Store the tempJob ID for later use

      // The rest of your handleSubmit function (Stripe checkout, etc.)
      // ...
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

   // New function to handle "Publish Job" button click
   const handlePublishJob = () => {
    handleSubmitJob(false);
  };

  // New function to handle "Save as Draft" button click
  const handleSaveAsDraft = () => {
    handleSubmitJob(true);
  };
  // New function to handle "Close" button click
  const handleClose = async () => {
    closeForm(); // Close the form
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
      handleAddItem('tools', { name: toolInput.trim() });
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
      handleAddItem('tags', tagInput.trim());
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

  const handleCompensationChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only keep numeric characters
    setFormData(prevData => ({
      ...prevData,
      compensation: value
    }));
  
    // Clear validation error
    setValidationErrors(prevErrors => ({
      ...prevErrors,
      compensation: undefined
    }));
  };
  
  const formatCompensation = (e) => {
    const value = parseInt(e.target.value, 10);
    const formattedValue = isNaN(value) ? "$0.00" : `$${(value / 100).toFixed(2)}`;
    setFormData(prevData => ({
      ...prevData,
      compensation: formattedValue
    }));
  
    // Clear validation error if the value is valid
    if (!isNaN(value) && value > 0) {
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        compensation: undefined
      }));
    }
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
      handleAddItem('deliverables', deliverableInput.trim());
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
        onClick={handleSaveAsDraft}
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

      {showErrorPopup && (
        <ErrorPopup 
          errors={validationErrors} 
          onClose={() => setShowErrorPopup(false)} 
          goToStep={goToStep}
        />
      )}

      <form className="job-posting-form__form" onSubmit={handleSubmit}>
        <ProgressBar step={step} totalSteps={totalSteps} />
{step === 1 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__section">
      <div className="job-posting-form__column job-posting-form__column-heading">
        <h2 className="job-posting-form__title">Project <br />Overview</h2>
        <p className="job-posting-form__paragraph">&nbsp; Introduce Your Project and yourself </p>
        <p className="job-posting-form__paragraph">&nbsp; Give a brief overview of the work you need done</p>
        <p className="job-posting-form__paragraph">&nbsp; Add Images that will help give a clearer picture  <br /> &nbsp; on what you need done </p>
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
          <input 
            type="text" 
            name="projectTitle" 
            className={`job-posting-form__input ${validationErrors.projectTitle ? 'error' : ''}`}
            value={formData.projectTitle} 
            onChange={handleChange} 
          />
        </div>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Company Name
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Enter the name of your company</span>
            </span>
          </label>
          <input 
            type="text" 
            name="companyName" 
            className={`job-posting-form__input ${validationErrors.companyName ? 'error' : ''}`}
            value={formData.companyName} 
            onChange={handleChange} 
          />
        </div>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label" style={{ fontFamily: 'Inter, sans-serif' }}>
            Project Overview
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Provide a brief overview of the job, a couple sentences to let people know what the project is about</span>
            </span>
            <span className='Required'></span>
          </label>
          <textarea 
            name="projectOverview" 
            className={`job-posting-form__textarea ${validationErrors.projectOverview ? 'error' : ''}`}
            value={formData.projectOverview} 
            onChange={handleChange} 
            style={{ fontFamily: 'Inter, sans-serif' }}
          ></textarea>
        </div>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Upload Image Files
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Upload any relevant images for the project, These will be used to advertise the post</span>
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
                <button 
                  type="button" 
                  className="job-posting-form__remove-image-button" 
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="job-posting-form__button-group job-posting-form__button-group-step1">
      <button type="button" className="job-posting-form__next-button" onClick={nextStep}>
        Next Step
      </button>
    </div>
  </div>
)}

{step === 2 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__container">
      <div className="job-posting-form__column-right">
        <h2 className="job-posting-form__title">Project Type and Tools</h2>
        <p className="job-posting-form__paragraph">&nbsp; Select your Project type from the list</p>
        <p className="job-posting-form__paragraph">&nbsp; Select what languages, APIs or other tools you <br /> &nbsp; need your project made with</p>
        <p className="job-posting-form__paragraph">&nbsp; Add tags to help developers find your project <br /> &nbsp; </p>
      </div>
      <div className="job-posting-form__column-left">
        <p className='Required'> Required Field </p>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Project Type
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Enter the type of your project</span>
            </span>
            <span className='Required'></span>
          </label>
          <input
            type="text"
            name="projectType"
            className={`job-posting-form__input ${validationErrors.projectType ? 'error' : ''}`}
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
              <span className="job-posting-form__tooltiptext">Add Tools a developer would need to know to complete the project like React, JavaScript, NPM </span>
            </span>
            <span className='Required'></span>
          </label>
          <div className="job-posting-form__input-with-button">
            <input
              type="text"
              className={`job-posting-form__input ${validationErrors.tools ? 'error' : ''}`}
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
                  <FontAwesomeIcon icon={faTimes} />
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
              <span className="job-posting-form__tooltiptext">Enter tags to help developers find your project like Bug Fix, Large Project, Urgent</span>
            </span>
            <span className='Required'></span>
          </label>
          <div className="job-posting-form__input-with-button">
            <input
              type="text"
              className={`job-posting-form__input ${validationErrors.tags ? 'error' : ''}`}
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
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
        </div>
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
)}
{step === 3 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__container">
      <div className="job-posting-form__column-right">
        <h2 className="job-posting-form__title">Job Post Type and Project Length</h2>
        <p className="job-posting-form__paragraph">&nbsp; Select the type of job post and provide the estimated project length.</p>
      </div>
      <div className="job-posting-form__column-left">
        <p className='Required'> Required Field </p>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">Select A Post Type<span className='Required'></span></label>
          <div className={`job-posting-form__icons ${validationErrors.selectedJobPostType ? 'error' : ''}`}>
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
                <span className='Required'></span>
              </label>
              <input
                type="text"
                name="compensation"
                className={`job-posting-form__input job-posting-form__compensation-input ${validationErrors.compensation ? 'error' : ''}`}
                value={formData.compensation || ""}
                onChange={handleCompensationChange}
                onBlur={formatCompensation}
                placeholder="0"
              />
            </div>
          )}
        </div>
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
)}

{step === 4 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__container">
      <div className="job-posting-form__column-right">
        <h2 className="job-posting-form__title">Project Details and Files</h2>
        <p className="job-posting-form__paragraph">&nbsp; Provide a detailed description of your project.</p>
        <p className="job-posting-form__paragraph">&nbsp; Upload any relevant files or folders, including graphics, code, and existing works.</p>
        <p className="job-posting-form__paragraph">&nbsp; Specify the file permissions for these uploads.</p>
      </div>
      <div className="job-posting-form__column-left">
        <p className='Required'> Required Field </p>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Project Description
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Provide a full detailed description of your project</span>
            </span>
            <span className='Required'></span>
          </label>
          <textarea
            name="projectDescription"
            className={`job-posting-form__textarea job-posting-form__textarea-auto-grow ${validationErrors.projectDescription ? 'error' : ''}`}
            value={formData.projectDescription}
            onChange={handleChange}
            onInput={handleTextareaInput}
          ></textarea>
        </div>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Upload Project Files
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Add any files related to the project files</span>
            </span>
          </label>
          <div
            className={`job-posting-form__file-drop ${isDragOver ? 'dragover' : ''} ${validationErrors.projectFiles ? 'error' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('projectFileInput').click()}
          >
            <FontAwesomeIcon icon={faUpload} className="job-posting-form__file-drop-icon" />
            <div className="job-posting-form__file-drop-text">
              Choose files/folders or drag them here.
            </div>
            <input
              type="file"
              id="projectFileInput"
              name="projectFiles"
              className="job-posting-form__file-drop-input"
              multiple
              onChange={handleProjectFileUpload}
            />
          </div>
          <div className="job-posting-form__file-list-container">
            <div className="job-posting-form__file-list">
              {formData.projectFiles.map((file, index) => (
                <div key={index} className="job-posting-form__file-item">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="job-posting-form__remove-button"
                    onClick={() => removeProjectFile(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            File Permissions Control
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Set who can view the files related to the job</span>
            </span>
            <span className='Required'></span>
          </label>
          <div className={`job-posting-form__permissions ${validationErrors.filePermissions ? 'error' : ''}`}>
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
)}
{step === 5 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__container">
      <div className="job-posting-form__column-right">
        <h2 className="job-posting-form__title">Project Requirements and Deliverables</h2>
        <p className="job-posting-form__paragraph">&nbsp; Provide detailed requirements and deliverables for the project. Outline the project milestones and any other important details.</p>
      </div>
      <div className="job-posting-form__column-left">
        <p className='Required'> Required Field </p>
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Project Deliverables
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Add specific deliverables to the project this will be used to judge completion of the project </span>
            </span>
            <span className='Required'></span>
          </label>
          <div className="job-posting-form__input-with-button">
            <input
              type="text"
              className={`job-posting-form__input ${validationErrors.deliverables ? 'error' : ''}`}
              value={deliverableInput}
              onChange={(e) => setDeliverableInput(e.target.value)}
              placeholder="Type a deliverable and press Add"
            />
            <button type="button" className="job-posting-form__add-button" onClick={handleAddDeliverable}>
              +
            </button>
          </div>
          <div className="job-posting-form__deliverable-list-container">
            <div className="job-posting-form__deliverable-list">
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="job-posting-form__deliverable-item">
                  <span>{deliverable}</span>
                  <button
                    type="button"
                    className="job-posting-form__remove-button"
                    onClick={() => handleRemoveDeliverable(index)}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {validationErrors.deliverables && <p className="job-posting-form__error-message">{validationErrors.deliverables}</p>}
        </div>
        
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Amount of Prepaid Revisions
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Select the number of prepaid revisions</span>
            </span>
            <span className='Required'></span>
          </label>
          <div className={`job-posting-form__revisions ${validationErrors.prepaidRevisions ? 'error' : ''}`}>
            {[0, 1, 2, 3].map((revision) => (
              <label key={revision}>
                <input
                  type="radio"
                  name="prepaidRevisions"
                  value={revision}
                  checked={parseInt(formData.prepaidRevisions) === revision}
                  onChange={handleChange}
                />
                {revision} Revision{revision !== 1 ? 's' : ''}
              </label>
            ))}
          </div>
          {validationErrors.prepaidRevisions && <p className="job-posting-form__error-message">{validationErrors.prepaidRevisions}</p>}
        </div>
        
        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Cost of Additional Revisions
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Provide the price to request additional revisions past the prepaid ones</span>
            </span>
          </label>
          <div className="job-posting-form__cost-input">
            <span className="job-posting-form__currency-symbol">$</span>
            <input
              type="number"
              name="revisionCost"
              className={`job-posting-form__input ${validationErrors.revisionCost ? 'error' : ''}`}
              value={formData.revisionCost}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>
          {validationErrors.revisionCost && <p className="job-posting-form__error-message">{validationErrors.revisionCost}</p>}
        </div>
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
)}
{step === 6 && (
  <div className="job-posting-form__step-container">
    <div className="job-posting-form__container">
      <div className="job-posting-form__column-right">
        <h2 className="job-posting-form__title">Project Timeline</h2>
        <p className="job-posting-form__paragraph">&nbsp; Set the timeline for your project based on the selected job post type.</p>
      </div>
      <div className="job-posting-form__column-left">
        <p className='Required'> Required Field </p>
        
        {formData.selectedJobPostType === "Bounty" && (
          <>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Bounty Start Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the bounty start?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="bountyStartTime" 
                className={`job-posting-form__input ${validationErrors.bountyStartTime ? 'error' : ''}`}
                value={formData.bountyStartTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Bounty End Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the bounty end?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="bountyEndTime" 
                className={`job-posting-form__input ${validationErrors.bountyEndTime ? 'error' : ''}`}
                value={formData.bountyEndTime} 
                onChange={handleChange} 
              />
            </div>
          </>
        )}

        {formData.selectedJobPostType === "Challenge" && (
          <>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Challenge Start Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the challenge start?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="challengeStartTime" 
                className={`job-posting-form__input ${validationErrors.challengeStartTime ? 'error' : ''}`}
                value={formData.challengeStartTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Challenge End Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the challenge end?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="challengeEndTime" 
                className={`job-posting-form__input ${validationErrors.challengeEndTime ? 'error' : ''}`}
                value={formData.challengeEndTime} 
                onChange={handleChange} 
              />
            </div>
          </>
        )}

        {formData.selectedJobPostType === "Contract" && (
          <>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Applications Open Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When do applications open?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="applicationsOpenTime" 
                className={`job-posting-form__input ${validationErrors.applicationsOpenTime ? 'error' : ''}`}
                value={formData.applicationsOpenTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Applications Close Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When do applications close?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="applicationsCloseTime" 
                className={`job-posting-form__input ${validationErrors.applicationsCloseTime ? 'error' : ''}`}
                value={formData.applicationsCloseTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Contract End Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the contract end?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="contractEndTime" 
                className={`job-posting-form__input ${validationErrors.contractEndTime ? 'error' : ''}`}
                value={formData.contractEndTime} 
                onChange={handleChange} 
              />
            </div>
          </>
        )}

        {formData.selectedJobPostType === "Auction" && (
          <>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Auction Open Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the auction open?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="auctionOpenTime" 
                className={`job-posting-form__input ${validationErrors.auctionOpenTime ? 'error' : ''}`}
                value={formData.auctionOpenTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Auction Close Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the auction close?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="auctionCloseTime" 
                className={`job-posting-form__input ${validationErrors.auctionCloseTime ? 'error' : ''}`}
                value={formData.auctionCloseTime} 
                onChange={handleChange} 
              />
            </div>
            <div className="job-posting-form__field">
              <label className="job-posting-form__label">
                Project End Time
                <span className="job-posting-form__tooltip">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  <span className="job-posting-form__tooltiptext">When does the project end?</span>
                </span>
                <span className='Required'></span>
              </label>
              <input 
                type="datetime-local" 
                name="projectEndTime" 
                className={`job-posting-form__input ${validationErrors.projectEndTime ? 'error' : ''}`}
                value={formData.projectEndTime} 
                onChange={handleChange} 
              />
            </div>
          </>
        )}

        <div className="job-posting-form__field">
          <label className="job-posting-form__label">
            Estimated Project Length
            <span className="job-posting-form__tooltip">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span className="job-posting-form__tooltiptext">Select the estimated length of the project</span>
            </span>
            <span className='Required'></span>
          </label>
          <select
            name="estimatedProjectLength"
            className={`job-posting-form__select ${validationErrors.estimatedProjectLength ? 'error' : ''}`}
            value={formData.estimatedProjectLength}
            onChange={handleChange}
            required
          >
            <option value="">Select project length</option>
            <option value="<1hour">Less than 1 hour</option>
            <option value="1-3hours">1-3 hours</option>
            <option value="3-6hours">3-6 hours</option>
            <option value="6-12hours">6-12 hours</option>
            <option value="12-24hours">12-24 hours</option>
            <option value="1-3days">1-3 days</option>
            <option value="3-7days">3-7 days</option>
            <option value="1-2weeks">1-2 weeks</option>
            <option value="2-4weeks">2-4 weeks</option>
            <option value=">1month">More than 1 month</option>
          </select>
        </div>
      </div>
    </div>
    <div className="job-posting-form__button-group">
      <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
        Back
      </button>
      <button type="button" className="job-posting-form__next-button" onClick={handleGeneratePreview}>
        Generate Preview 
      </button>
    </div>
  </div>
)}
{step === 7 && (
  <div className="job-posting-form__review">
    <div className="job-posting-form__header">
      <h2 className="job-posting-form__project-title">{"Sample Project Title"}</h2>
      <p className="job-posting-form__subline">
  <span>{displayName}</span> |
  <span className="company-name">{"Your Company Name"}</span>
  <span className='sublineRight'>
   <span>{formData.projectType}</span>
   &nbsp;• <span>{formData.selectedJobPostType}</span>
   &nbsp;•  <span>{"2 weeks"}</span>
  </span>
</p>


    </div>
    
    <div className="job-posting-form__content">
      <div className="job-posting-form__main-content">
        {imageFiles.length > 0 && (
          <div className="job-posting-form__carousel">
            <div className="job-posting-form__carousel-image-wrapper">
              <img 
                src={imageFiles[carouselIndex].preview}
                alt={`Project image ${carouselIndex + 1}`} 
                className="job-posting-form__carousel-image"
              />
            </div>
            <button onClick={handlePrevSlide} className="job-posting-form__carousel-button job-posting-form__carousel-button-left">&#10094;</button>
            <button onClick={handleNextSlide} className="job-posting-form__carousel-button job-posting-form__carousel-button-right">&#10095;</button>
          </div>
        )}
        
        <div className="job-posting-form__project-overview">
          <h3>Project Overview</h3>
          <p>{"This is a sample project overview. It describes the main goals and scope of the project. This is a sample project overview. It describes the main goals and scope of the project.This is a sample project overview. It describes the main goals and scope of the project.This is a sample project overview. It describes the mThis is a sample project overview. It describes the main goals and scope of the project.ain goals and scope of the project.This is a sample project overview. It describes the main goals and scope of the project."}</p>
        </div>
      </div>
      
      <div className="job-posting-form__sidebar">
        <div className="job-posting-form__sidebar-section">
        <div className="compensation-wrapper">
          <h4>Compensation</h4>
          <p className='compNumber'>{formData.compensation }</p>
        </div>
        </ div>
        
        <div className="job-posting-form__sidebar-section">
          <h4>Tools</h4>
          <p className="job-posting-form__tools">
      {formData.tools.map(tool => tool.name).join(', ')}
    </p>
        </div>
        
        <div className="job-posting-form__sidebar-section">
          <h4>Tags</h4>
          <p className="job-posting-form__tags">
      {formData.tags.join(', ')}
    </p>
        </div>
      </div>
    </div>
    
    <div className="job-posting-form__button-group">
          <button type="button" className="job-posting-form__back-button" onClick={prevStep}>
            Back
          </button>
          <button type="button" className="job-posting-form__next-button" onClick={handlePublishJob}>
            Publish Job
          </button>
        </div>
  </div>
)}
      </form>
    </div>
  );
}

export default JobPostingForm;
