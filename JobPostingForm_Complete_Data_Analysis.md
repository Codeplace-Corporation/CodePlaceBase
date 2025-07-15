# JobPostingForm - Complete Input and Data Storage Analysis

## **Data Storage Structure**
The form uses a single `FormData` state object that contains all form data. Data is updated using the `updateFormData` function which takes partial updates.

## **Step-by-Step Input Analysis**

### **Step 1: Project Details (Stpone.tsx)**

**Inputs:**
1. **Project Title** - `formData.projectTitle` (string)
   - Text input field
   - Required validation

2. **Job Post Type** - `formData.selectedJobPostType` (enum: 'Bounty' | 'Auction' | 'Contract' | 'Challenge')
   - Radio button selection with icons
   - Required validation

3. **Job Sub Type** - `formData.JobSubType` (string)
   - Conditional radio buttons based on job type:
     - Bounty: 'Open Bounty' | 'Closed Bountyty'
     - Challenge: 'Open Challenge' | 'Closed Challenge' 
     - Contract: 'FIxed-Price-Contract' | 'open-price-contract'

4. **Project Category** - `formData.projectType` (string)
   - Autocomplete dropdown with search
   - Uses external `JOB_CATEGORIES` array
   - Required validation

5. **Project Tags** - `formData.tags` (string[])
   - Dynamic tag input with add/remove functionality
   - Max 20 tags, max 30 chars each
   - Required validation (minimum 5 tags)

6. **Required Tools/Skills** - `formData.tools` (Array<{name: string}>)
   - Dynamic tool input with add/remove functionality
   - Max 20 tools, max 40 chars each
   - Required validation (minimum 3 tools)

7. **Project Overview** - `formData.projectOverview` (string)
   - Textarea with auto-resize
   - Required validation

### **Step 2: Requirements (Job-specific components)**

**Bounty Requirements (BountyStptwo.tsx):**
1. **Detailed Project Description** - `formData.projectDescription` (string)
   - Large textarea with auto-resize
   - Required validation

2. **GitHub Repository** - `formData.projectFiles` (File[])
   - URL input field
   - Stored as pseudo-file object with name starting "github:"

3. **Project Files & Resources** - `formData.projectFiles` (File[])
   - Drag & drop file upload
   - Multiple file support
   - File type validation and icons

**Other job types have similar but job-specific requirements components.**

### **Step 3: File Access (Stpthree.tsx)**

**File Permissions:**
- **File Visibility Settings** - `formData.projectFilesPreview` (Array with permissions)
  - Toggle switches for each uploaded file
  - Controls `visibility`, `downloadable`, `viewable` properties
  - Auto-unlocks for open bounty/challenge types

### **Step 4: Deliverables and Requirements (Stpfour.tsx)**

**Inputs:**

1. **Required Deliverables** - `formData.requiredDeliverables` (string[])
   - Dynamic input with add/remove functionality
   - Max 15 deliverables, max 100 chars each
   - Job-specific titles and examples:
     - Bounty: "Required Deliverables" (e.g., "Working source code with documentation")
     - Auction: "Project Deliverables" (e.g., "Complete responsive website")
     - Challenge: "Required Deliverables" (e.g., "Working prototype with source code")
     - Contract: "Project Deliverables" (e.g., "Fully functional web application")

2. **Participation Requirements** - `formData.requirements` (string[])
   - Dynamic input with add/remove functionality
   - Max 15 requirements, max 100 chars each
   - Job-specific titles and examples:
     - Bounty: "Participation Requirements" (e.g., "Minimum 2 years React experience")
     - Auction: "Bidder Requirements" (e.g., "Minimum 5 completed projects")
     - Challenge: "Participation Requirements" (e.g., "Individual participation only")
     - Contract: "Contractor Requirements" (e.g., "5+ years experience with required technologies")

**Features:**
- **Job-specific content**: Different titles, tooltips, and examples based on job type
- **Dynamic management**: Add/remove items with animations
- **Validation**: Duplicate prevention and length limits
- **Visual feedback**: Color-coded based on job type

### **Step 5: Configuration (Job-specific components)**

**Bounty Configuration (BountyStpfive.tsx):**
1. **Bounty Amount** - `formData.bountyAmount` (string)
   - Currency input with formatting

2. **Currency** - `formData.currency` (string)
   - Defaults to 'USD'

3. **Bounty Start Date/Time** - `formData.bountyStartDate` & `formData.bountyStartTime` (string)
   - Date picker and custom time input (12-hour format)

4. **Bounty Expiry Date/Time** - `formData.bountyDeadline` & `formData.bountyExpiryTime` (string)
   - Date picker and custom time input

5. **Estimated Project Length** - `formData.estimatedProjectLength` (string)
   - Slider with predefined ranges: '<1-hour' to '6-months-plus'

6. **Project Complexity** - `formData.complexityLevel` (string)
   - Slider: 'simple' | 'moderate' | 'complex' | 'expert'

**Other job types have their own configuration fields (budget ranges, auction settings, etc.)**

### **Step 6: Compensation (Stptsix.tsx)**

1. **Payment Type** - `formData.compensation` (string)
   - Radio selection: 'completion' | 'milestones'

2. **Milestones** - `formData.milestones` (Array<Milestone>)
   - Dynamic milestone configuration (only for Contracts & Auctions)
   - Each milestone has: title, description, amount (%), dueDate
   - Validation ensures total = 100%

### **Step 7: Confirmation (Stpseven.tsx)**
- Final review and submission
- No new inputs

## **Complete FormData Interface**

```typescript
export interface FormData {
  // Basic project details (Step 1)
  projectTitle: string;
  companyName: string;
  projectOverview: string;
  projectType: string;
  tools: Array<{ name: string }>;
  tags: string[];
  selectedJobPostType: 'Auction' | 'Bounty' | 'Contract' | 'Challenge' | '';
  JobSubType: string;
  projectDescription: string;
  projectFiles: File[];
  imageFiles: Array<{ file: File; preview: string }>;
  compensation: string;
  estimatedProjectLength?: string;
  
  // Core job fields
  id?: string;
  createdAt?: any;
  createdBy?: string;
  requirements?: string[]; // Step 4
  deliverables?: string[];
  skills?: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  remote?: boolean;
  experienceLevel?: string;
  applicationCount?: number;
  status?: string;
  category?: string;
  eprojectlength?: string;
  
  // Bounty-specific fields (Step 5)
  bountyAmount?: string;
  currency?: string;
  bountyStartDate?: string;
  bountyStartTime?: string;
  bountyExpiryTime?: string;
  complexityLevel?: string;
  deadlineType?: string;
  bountyDeadline?: string;
  bountyDuration?: string;
  completionCriteria?: string;
  requiredDeliverables?: string[]; // Step 4
  evaluationMethod?: string;
  reviewTimeline?: string;
  allowMultipleWinners?: boolean;
  firstPlacePct?: string;
  secondPlacePct?: string;
  thirdPlacePct?: string;
  minExperienceLevel?: string;
  submissionFormats?: string[];
  bountyInstructions?: string;
  bountyEndTime?: string;
  bountyType?: string;
  submissionDeadline?: string;
  judgingCriteria?: string[];
  prizes?: Array<{
    place: number;
    amount: number;
    description?: string;
  }>;
  submissionCount?: number;
  currentAttempts?: Array<{
    name: string;
    avatar: string;
    score?: number;
    status: string;
    submittedAt: string;
  }>;

  // Auction-specific fields
  auctionStartTime?: string;
  auctionEndTime?: string;
  auctionCloseTime?: string;
  minimumBid?: string;
  bidIncrement?: string;
  auctionDuration?: string;
  startingBid?: string;
  revisionCost?: string;
  prepaidRevisions?: string;
  projectDeadline?: string;
  bidAmount?: string;
  proposalText?: string;
  currentBids?: Array<{
    bidderName: string;
    avatar: string;
    bidAmount: number;
    proposalText: string;
    submittedAt: string;
    rating: number;
    completedProjects: number;
  }>;

  // Contract-specific fields
  contractStartTime?: string;
  contractEndTime?: string;
  contractType?: string;
  applicationsOpenTime?: string;
  applicationsCloseTime?: string;
  milestones?: Array<{ // Step 6
    title: string;
    amount: number;
    description: string;
    dueDate?: string;
  }>;
  paymentTerms?: string;

  // Challenge-specific fields
  challengeStartTime?: string;
  challengeEndTime?: string;
  challengeCloseTime?: string;
  challengeType?: string;
  difficulty?: string;
  developerScore?: number;
  participantLimit?: number;
  currentParticipants?: number;
  challengeRules?: string[];
  leaderboard?: Array<{
    rank: number;
    name: string;
    score?: number;
    completionTime?: string;
    avatar?: string;
    status?: 'Submitted' | 'Interested';
  }>;
  submissionFormat?: string;
  testCases?: string[];
  submissionGuidelines?: string;

  // File handling for job previews (Step 3)
  projectFilesPreview?: Array<{
    name: string;
    type: string;
    size: string;
    url: string;
    permissions?: {
      visibility: string;
      downloadable: boolean;
      viewable: boolean;
    };
  }>;

  // Additional fields
  hoveredJobPostType?: string;
  projectEndTime?: string;
}
```

## **Data Flow Summary**

1. **State Management**: Single `formData` state with `updateFormData` function
2. **Step Navigation**: 7-step process with validation between steps
3. **Conditional Rendering**: Different inputs based on job type
4. **File Handling**: Drag & drop with permissions management
5. **Validation**: Step-specific validation with real-time feedback
6. **Storage**: Data cleaned and saved to Firebase `staged_jobs` collection
7. **User Profile**: Job references added to user's `postedJobs` array

## **Key Features**

- **50+ Input Fields** across 7 steps
- **4 Job Types** with specific configurations
- **Dynamic Content** based on job type selection
- **File Management** with permissions
- **Real-time Validation** with step-by-step progression
- **Auto-save** functionality between steps
- **Preview Mode** before final submission

## **Step Flow**
1. **Step 1**: Project Details (title, type, category, tags, tools, overview)
2. **Step 2**: Requirements (detailed description, files, GitHub repo)
3. **Step 3**: File Access (permissions for uploaded files)
4. **Step 4**: Deliverables and Requirements (specific deliverables and participation requirements)
5. **Step 5**: Configuration (job-specific settings like budget, timeline, complexity)
6. **Step 6**: Compensation (payment structure and milestones)
7. **Step 7**: Confirmation (final review and submission) 