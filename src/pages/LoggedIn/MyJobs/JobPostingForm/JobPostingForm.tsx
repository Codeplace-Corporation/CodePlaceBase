import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { firestore, collection, addDoc } from '../../../../firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGavel, 
  faGift, 
  faFileContract, 
  faTrophy, 
  faQuestionCircle, 
  faUpload, 
  faTimes,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import ProgressBar from './Components/ProgressBar';
import './JobPostingForm.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

// Type definitions
interface Tool {
  name: string;
}

interface FormData {
  projectTitle: string;
  companyName: string;
  projectOverview: string;
  projectType: string;
  tools: Tool[];
  tags: string[];
  filePermissions: 'public' | 'applicants' | 'hired';
  selectedJobPostType: string;
  compensation: string;
  challengeStartTime: string;
  challengeEndTime: string;
  bountyStartTime: string;
  bountyEndTime: string;
  applicationsOpenTime: string;
  applicationsCloseTime: string;
  contractEndTime: string;
  auctionOpenTime: string;
  auctionCloseTime: string;
  projectEndTime: string;
  projectDescription: string;
  deliverables: string[];
  prepaidRevisions: string;
  revisionCost: string;
  projectFiles: File[];
  estimatedProjectLength: string;
  hoveredJobPostType?: string;
}

interface JobPostType {
  type: string;
  icon: IconDefinition;
  description: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface JobPostingFormProps {
  closeForm: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
}

const JOB_POST_TYPES: JobPostType[] = [
  { 
    type: "Auction", 
    icon: faGavel,
    description: "Auctions are optimized for price. Set a starting bid and auction length, and have developers bid on your project in an open market. Payment is required once you accept a bid, but if the developers fail to complete the job, the money is returned."
  },
  { 
    type: "Bounty", 
    icon: faGift,
    description: "Bounties are optimized for time. Set your requirements and bounty amount, and the first to finish gets paid. Bounties are recommended for projects that need to be done as fast as possible, or smaller projects like bug fixes, homework, or feature implementation. Payment is required upon posting the job but is returned if it is not successfully completed in the allotted time period."
  },
  { 
    type: "Contract", 
    icon: faFileContract,
    description: "Contracts are optimized for control. Set your price, requirements, and timeline, and choose the most qualified developer from the applications you receive. Contracts are optimized for larger projects like full sites or apps where it is important to take your time and select the right developer. Payment is required when accepting an application and will be returned if the job is not successfully completed."
  },
  { 
    type: "Challenge", 
    icon: faTrophy,
    description: "Challenges are optimized for creativity. Set a price and duration for your challenge, then developers will create their own unique solutions, and when the time expires, select the one you like the most to be paid. Challenges are great for design-heavy jobs like UI/UX design or more open-ended jobs. Payment is required when posting the job but will be returned if you receive no challenge entries or none meet your requirements."
  },
];

const PROJECT_TYPES = [
  "Mobile App Development", "Native App Development", "Cross-Platform App Development", 
  "Mobile Game Development", "Web Development", "Frontend Development",
  "Backend Development", "Full Stack Development", "E-commerce Website Development", 
  "CMS Development (e.g., WordPress, Joomla)", "Desktop Application Development", 
  "Windows Application Development", "Mac Application Development", 
  "Cross-Platform Desktop Development", "Game Development", "2D Game Development", 
  "3D Game Development", "VR/AR Game Development", "Database Management", 
  "Database Design", "Database Optimization", "Database Migration", 
  "Big Data Management", "DevOps and Infrastructure", "CI/CD Pipeline Setup", 
  "Cloud Infrastructure Setup (AWS, Azure, Google Cloud)", "Server Management", 
  "API Development and Integration", "RESTful API Development", 
  "GraphQL API Development", "Third-Party API Integration", 
  "Software Testing and QA", "Manual Testing", "Automated Testing", 
  "Performance Testing", "Security", "Application Security Assessment", 
  "Penetration Testing", "Security Patch Implementation", 
  "Artificial Intelligence and Machine Learning", "AI Model Development", 
  "Machine Learning Algorithm Implementation", "Natural Language Processing", 
  "Data Science and Analytics", "Data Analysis and Visualization",
  "Predictive Modeling", "Data Mining", "IoT (Internet of Things)", 
  "IoT Device Programming", "IoT Data Management", "Smart Home Solutions", 
  "Blockchain and Cryptocurrency", "Smart Contract Development", 
  "Blockchain Integration", "Cryptocurrency Wallet Development", 
  "AR/VR Development", "Augmented Reality Solutions", 
  "Virtual Reality Applications", "Automation", "Script Development", 
  "Robotic Process Automation (RPA)", "Workflow Automation", 
  "CRM and ERP Solutions", "Custom CRM Development", "ERP System Integration", 
  "Content Management Systems", "Custom CMS Development", "CMS Customization", 
  "E-learning Solutions", "LMS Development", "Educational App Development", 
  "Legacy System Modernization", "Code Refactoring", "System Migration", 
  "Technical Support and Maintenance", "Bug Fixing", "Performance Optimization", 
  "System Updates"
];

const STEP_FIELDS: Record<number, string[]> = {
  1: ['projectTitle', 'companyName', 'projectOverview'],
  2: ['projectType', 'tools', 'tags'],
  3: ['selectedJobPostType', 'compensation'],
  4: ['projectDescription', 'filePermissions'],
  5: ['deliverables', 'prepaidRevisions', 'revisionCost'],
  6: ['bountyStartTime', 'bountyEndTime', 'challengeStartTime', 'challengeEndTime', 
      'applicationsOpenTime', 'applicationsCloseTime', 'contractEndTime', 
      'auctionOpenTime', 'auctionCloseTime', 'projectEndTime', 'estimatedProjectLength']
};

export const JobPostingForm: React.FC<JobPostingFormProps> = ({ closeForm }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
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
    challengeEndTime: "",
    bountyStartTime: "",
    bountyEndTime: "",
    applicationsOpenTime: "",
    applicationsCloseTime: "",
    contractEndTime: "",
    auctionOpenTime: "",
    auctionCloseTime: "",
    projectEndTime: "",
    projectDescription: "",
    deliverables: [],
    prepaidRevisions: "",
    revisionCost: "",
    projectFiles: [],
    estimatedProjectLength: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [toolInput, setToolInput] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [deliverableInput, setDeliverableInput] = useState<string>('');
  const [suggestedTypes, setSuggestedTypes] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserId(user.uid);
        setDisplayName(user.displayName || '');
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
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
      const value = formData[field as keyof FormData];
      if (Array.isArray(value)) {
        if (value.length === 0) {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStepForField = (field: string): number | null => {
    for (const [step, fields] of Object.entries(STEP_FIELDS)) {
      if (fields.includes(field)) {
        return parseInt(step);
      }
    }
    return null;
  };

  const handleGeneratePreview = (): void => {
    const isValid = validateForm();
    if (isValid) {
      setStep(7);
    } else {
      setShowErrorPopup(true);
    }
  };

  const goToStep = (stepNumber: number): void => {
    setStep(stepNumber);
    setShowErrorPopup(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    let updatedValue = value;

    if (type === 'radio' && e.target instanceof HTMLInputElement) {
      updatedValue = e.target.value;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: updatedValue
    }));

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: undefined
    }));
  };

  const handleAddItem = (itemName: keyof FormData, item: string | Tool): void => {
    setFormData(prevData => ({
      ...prevData,
      [itemName]: [...(prevData[itemName] as any[]), item]
    }));

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [itemName]: undefined
    }));
  };

  const handleProjectFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setFormData(prevData => ({
      ...prevData,
      projectFiles: [...prevData.projectFiles, ...files]
    }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setFormData(prevData => ({
      ...prevData,
      projectFiles: [...prevData.projectFiles, ...files]
    }));
  };

  const handleSubmitJob = async (isDraft: boolean = false): Promise<void> => {
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
        const response = await fetch('https://us-central1-codeplace-76019.cloudfunctions.net/createCheckoutSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobRef.id,
            amount: 2000,
            currency: 'usd',
            userId: userId
          }),
        });

        if (!response.ok) {
          console.error("Failed to create checkout session");
          return;
        }

        const session = await response.json();
        console.log("Session created:", session);

        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: session.id,
          });

          if (error) {
            console.error("Stripe Checkout Error:", error);
          }
        }
      } else {
        closeForm();
      }
    } catch (error) {
      console.error("Error in handleSubmitJob:", error);
    }
  };

  const removeProjectFile = (index: number): void => {
    setFormData(prevData => ({
      ...prevData,
      projectFiles: prevData.projectFiles.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImageFiles([...imageFiles, ...newImageFiles]);
  };

  const removeImage = (index: number): void => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleProjectTypeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setFormData(prevData => ({
      ...prevData,
      projectType: value,
    }));
    const suggestions = PROJECT_TYPES.filter(type => 
      type.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestedTypes(suggestions);
  };

  const selectSuggestedType = (type: string): void => {
    setFormData(prevData => ({
      ...prevData,
      projectType: type,
    }));
    setSuggestedTypes([]);
  };

  const handleAddTool = (): void => {
    if (toolInput.trim() !== '') {
      handleAddItem('tools', { name: toolInput.trim() });
      setToolInput('');
    }
  };

  const handleRemoveTool = (index: number): void => {
    setFormData(prevData => ({
      ...prevData,
      tools: prevData.tools.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = (): void => {
    if (tagInput.trim() !== '') {
      handleAddItem('tags', tagInput.trim());
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number): void => {
    setFormData(prevData => ({
      ...prevData,
      tags: prevData.tags.filter((_, i) => i !== index),
    }));
  };

  const handleFilePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prevData => ({
      ...prevData,
      filePermissions: e.target.value as 'public' | 'applicants' | 'hired',
    }));
  };

  const handleJobPostTypeClick = (type: string): void => {
    setFormData(prevData => ({
      ...prevData,
      selectedJobPostType: prevData.selectedJobPostType === type ? "" : type,
    }));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
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

  const handleCompensationChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prevData => ({
      ...prevData,
      compensation: value
    }));

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      compensation: undefined
    }));
  };

  const formatCompensation = (e: React.FocusEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    const formattedValue = isNaN(value) ? "$0.00" : `$${(value / 100).toFixed(2)}`;
    setFormData(prevData => ({
      ...prevData,
      compensation: formattedValue
    }));

    if (!isNaN(value) && value > 0) {
      setValidationErrors(prevErrors => ({
        ...prevErrors,
        compensation: undefined
      }));
    }
  };

  const handleAddDeliverable = (): void => {
    if (deliverableInput.trim() !== '') {
      handleAddItem('deliverables', deliverableInput.trim());
      setDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number): void => {
    setFormData(prevData => ({
      ...prevData,
      deliverables: prevData.deliverables.filter((_, i) => i !== index),
    }));
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const handlePrevSlide = (): void => {
    setCarouselIndex((prevIndex) => (prevIndex === 0 ? imageFiles.length - 1 : prevIndex - 1));
  };

  const handleNextSlide = (): void => {
    setCarouselIndex((prevIndex) => (prevIndex === imageFiles.length - 1 ? 0 : prevIndex + 1));
  };

  const handlePublishJob = (): void => {
    handleSubmitJob(false);
  };

  const handleSaveAsDraft = (): void => {
    handleSubmitJob(true);
  };

  const nextStep = (): void => {
    setStep(step + 1);
  };

  const prevStep = (): void => {
    setStep(step - 1);
  };

  const totalSteps = 7;

  const ErrorPopup: React.FC<{
    errors: ValidationErrors;
    onClose: () => void;
    goToStep: (step: number) => void;
  }> = ({ errors, onClose, goToStep }) => (
    <div className="job-posting-form__error-popup">
      <div className="job-posting-form__error-popup-content">
        <button onClick={onClose} className="job-posting-form__error-close-button">
          ×
        </button>
        <h2>Required Fields Missing</h2>
        <p>Please fill in the following required fields:</p>
        <ul>
          {Object.entries(errors).map(([field, error]) => (
            <li 
              key={field} 
              onClick={() => {
                const stepNum = getStepForField(field);
                if (stepNum) goToStep(stepNum);
              }} 
              className="job-posting-form__error-item"
            >
              {error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const getSelectedJobTypeDescription = (): string => {
    const jobType = JOB_POST_TYPES.find(type => type.type === formData.selectedJobPostType);
    return jobType?.description || '';
  };

  const getHoveredJobTypeDescription = (): string => {
    const jobType = JOB_POST_TYPES.find(type => type.type === formData.hoveredJobPostType);
    return jobType?.description || '';
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

      <form className="job-posting-form__form" onSubmit={(e) => e.preventDefault()}>
        <ProgressBar step={step} totalSteps={totalSteps} />

        {/* Step 1: Project Overview */}
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
                    onClick={() => document.getElementById('fileInput')?.click()}
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

        {/* Step 2: Project Type and Tools */}
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
                      onChange={(e) => setToolInput(e.target.value)}
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
                      onChange={(e) => setTagInput(e.target.value)}
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

        {/* Step 3: Job Post Type and Compensation */}
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
                    {JOB_POST_TYPES.map(({ type, icon }) => (
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
                      <p>{getHoveredJobTypeDescription()}</p>
                    </div>
                  )}
                  {formData.selectedJobPostType && !formData.hoveredJobPostType && (
                    <div className="job-posting-form__type-description">
                      <p>{getSelectedJobTypeDescription()}</p>
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

        {/* Step 4: Project Details and Files */}
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
                    onChange={(e) => {
                      handleChange(e);
                      handleTextareaInput(e);
                    }}
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
                    onClick={() => document.getElementById('projectFileInput')?.click()}
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

        {/* Step 5: Requirements and Deliverables */}
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

        {/* Step 6: Project Timeline */}
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

        {/* Step 7: Preview */}
        {step === 7 && (
          <div className="job-posting-form__review">
            <div className="job-posting-form__header">
              <h2 className="job-posting-form__project-title">{formData.projectTitle || "Sample Project Title"}</h2>
              <p className="job-posting-form__subline">
                <span>{displayName}</span> |
                <span className="company-name">{formData.companyName || "Your Company Name"}</span>
                <span className='sublineRight'>
                  <span>{formData.projectType}</span>
                  &nbsp;• <span>{formData.selectedJobPostType}</span>
                  &nbsp;• <span>{formData.estimatedProjectLength || "2 weeks"}</span>
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
                        alt={`Project visual ${carouselIndex + 1}`} 
                        className="job-posting-form__carousel-image"
                      />
                    </div>
                    <button onClick={handlePrevSlide} className="job-posting-form__carousel-button job-posting-form__carousel-button-left">&#10094;</button>
                    <button onClick={handleNextSlide} className="job-posting-form__carousel-button job-posting-form__carousel-button-right">&#10095;</button>
                  </div>
                )}
                
                <div className="job-posting-form__project-overview">
                  <h3>Project Overview</h3>
                  <p>{formData.projectOverview || "This is a sample project overview. It describes the main goals and scope of the project."}</p>
                </div>
              </div>
              
              <div className="job-posting-form__sidebar">
                <div className="job-posting-form__sidebar-section">
                  <div className="compensation-wrapper">
                    <h4>Compensation</h4>
                    <p className='compNumber'>{formData.compensation}</p>
                  </div>
                </div>
                
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
};

export default JobPostingForm;