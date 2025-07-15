import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../firebase";

// Import the tools and categories lists from jobTypes
import { tools, categories } from "../../../data/jobTypes";

type ContentTabProps = {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
};

const ContentTab = ({ tabs, activeTab, onTabChange }: ContentTabProps) => {
    return (
        <div className="flex mb-5 gap-2">
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => onTabChange(tab)}
                    className={`cursor-pointer rounded-full py-1 px-3 text-xs font-medium transition-all duration-200 border ${
                        activeTab === tab
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white border-white hover:bg-white/10"
                    }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Profile
                </button>
            ))}
        </div>
    );
};

// Developer Metrics Component
const DeveloperMetrics = () => {
    const { currentUser } = useAuth();
    const [metrics, setMetrics] = useState({
        developerScore: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        jobsAppliedTo: 0,
        jobsAttempted: 0,
        jobSuccessRate: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch developer metrics from Firebase
    useEffect(() => {
        const fetchDeveloperMetrics = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log("User data from Firebase:", userData);
                    
                    // Get the developer score directly from the user document
                    const firebaseScore = userData.developerScore || 600;
                    console.log("Raw developer score from Firebase:", firebaseScore);
                    
                    setMetrics({
                        developerScore: firebaseScore, // Use the raw score value
                        totalEarnings: userData.totalEarnings || 0,
                        monthlyEarnings: userData.monthlyEarnings || 0,
                        jobsAppliedTo: userData.jobsAppliedTo || 0,
                        jobsAttempted: userData.jobsAttempted || 0,
                        jobSuccessRate: userData.jobSuccessRate || 0
                    });
                } else {
                    console.log("User document does not exist");
                }
            } catch (error) {
                console.error("Error fetching developer metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeveloperMetrics();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-3 bg-gray-700 rounded w-20"></div>
                            <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Developer Score */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Developer Score</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.developerScore}</div>
                <div className="text-xs text-white/60">developer score</div>
            </div>

            {/* Total Earnings */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Total Earnings</h3>
                </div>
                <div className="text-2xl font-bold text-white">${metrics.totalEarnings.toLocaleString()}</div>
                <div className="text-xs text-white/60">lifetime</div>
            </div>

            {/* Monthly Earnings */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Monthly Earnings</h3>
                </div>
                <div className="text-2xl font-bold text-white">${metrics.monthlyEarnings.toLocaleString()}</div>
                <div className="text-xs text-white/60">this month</div>
            </div>

            {/* Jobs Applied To */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Jobs Applied</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.jobsAppliedTo}</div>
                <div className="text-xs text-white/60">total applications</div>
            </div>

            {/* Jobs Attempted */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Jobs Attempted</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.jobsAttempted}</div>
                <div className="text-xs text-white/60">successful attempts</div>
            </div>

            {/* Job Success Rate */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Success Rate</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.jobSuccessRate}%</div>
                <div className="text-xs text-white/60">completion rate</div>
            </div>
        </div>
    );
};

// Skills and Tools Component
const SkillsAndTools = () => {
    const { currentUser } = useAuth();
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [userTools, setUserTools] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [toolInput, setToolInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

    // Project expertise categories from job posting form
    const projectExpertise = categories;

    // Example tools for tooltip
    const exampleTools = [
        'VS Code', 'IntelliJ IDEA', 'Sublime Text', 'Atom', 'Vim', 'Emacs',
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
        'Docker', 'Kubernetes', 'Jenkins', 'Travis CI', 'CircleCI',
        'Postman', 'Insomnia', 'Swagger', 'Jira', 'Trello', 'Asana',
        'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin',
        'Chrome DevTools', 'Firefox DevTools', 'Safari DevTools',
        'Webpack', 'Vite', 'Parcel', 'Babel', 'ESLint', 'Prettier',
        'npm', 'yarn', 'pnpm', 'Maven', 'Gradle', 'pip', 'conda'
    ];

    // Get tooltip content for skills
    const getSkillTooltip = (skill: string): string => {
        const tooltips: { [key: string]: string } = {
            'Frontend Development': 'Building user interfaces and client-side applications',
            'React Development': 'Creating interactive UIs with React.js framework',
            'Angular Development': 'Building scalable web applications with Angular',
            'Vue.js Development': 'Developing progressive web applications with Vue.js',
            'Backend Development': 'Creating server-side applications and APIs',
            'Node.js Development': 'Building scalable server applications with Node.js',
            'Python Development': 'Developing applications using Python programming language',
            'Java Development': 'Creating enterprise applications with Java',
            'Full-Stack Development': 'Building both frontend and backend of applications',
            'Mobile Development': 'Creating applications for mobile devices',
            'iOS Development': 'Building native iOS applications with Swift/Objective-C',
            'Android Development': 'Creating Android applications with Kotlin/Java',
            'Game Development': 'Developing video games and interactive experiences',
            'Database Development': 'Designing and managing database systems',
            'DevOps': 'Managing infrastructure and deployment pipelines',
            'API Development': 'Creating and maintaining application programming interfaces',
            'E-commerce Development': 'Building online shopping platforms and stores',
            'CMS Development': 'Creating content management systems',
            'Software Testing': 'Ensuring software quality through testing methodologies',
            'Data Science': 'Analyzing and interpreting complex data sets',
            'Machine Learning': 'Building AI models and predictive systems',
            'Cybersecurity Development': 'Implementing security measures and protocols',
            'Blockchain Development': 'Creating decentralized applications and smart contracts',
            'AR/VR Development': 'Building augmented and virtual reality experiences'
        };
        
        return tooltips[skill] || `Expertise in ${skill}`;
    };

    // Fetch user skills and tools from Firebase
    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserSkills(userData.skills || []);
                    setUserTools(userData.tools || []);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser]);

    // Save skills and tools to Firebase
    const saveToFirebase = async (skills: string[], tools: string[]) => {
        if (!currentUser?.uid) return;

        try {
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                skills: skills,
                tools: tools
            });
        } catch (error) {
            console.error("Error saving skills and tools:", error);
        }
    };

    // Handle skills with autocomplete
    const handleSkillInputChange = (value: string) => {
        setSkillInput(value);
        
        // Filter skills based on input
        if (value.trim() === '') {
            setFilteredSkills(projectExpertise);
        } else {
            const filtered = projectExpertise.filter(skill =>
                skill.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSkills(filtered);
        }
        
        setShowSkillDropdown(true);
    };

    const handleSkillSelect = (skill: string) => {
        if (!userSkills.includes(skill) && userSkills.length < 20) {
            const newSkills = [...userSkills, skill];
            setUserSkills(newSkills);
            saveToFirebase(newSkills, userTools);
        }
        setSkillInput('');
        setShowSkillDropdown(false);
    };

    const handleSkillInputFocus = () => {
        if (skillInput.trim() === '') {
            setFilteredSkills(projectExpertise);
        } else {
            const filtered = projectExpertise.filter(skill =>
                skill.toLowerCase().includes(skillInput.toLowerCase())
            );
            setFilteredSkills(filtered);
        }
        setShowSkillDropdown(true);
    };

    const handleSkillInputBlur = () => {
        setTimeout(() => setShowSkillDropdown(false), 200);
    };

    const addSkill = () => {
        if (skillInput.trim() && !userSkills.includes(skillInput.trim()) && userSkills.length < 20) {
            const newSkills = [...userSkills, skillInput.trim()];
            setUserSkills(newSkills);
            saveToFirebase(newSkills, userTools);
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        const newSkills = userSkills.filter((_, i) => i !== index);
        setUserSkills(newSkills);
        saveToFirebase(newSkills, userTools);
    };

    // Handle tools
    const addTool = () => {
        if (toolInput.trim() && !userTools.includes(toolInput.trim()) && userTools.length < 20) {
            const newTools = [...userTools, toolInput.trim()];
            setUserTools(newTools);
            saveToFirebase(userSkills, newTools);
            setToolInput('');
        }
    };

    const removeTool = (index: number) => {
        const newTools = userTools.filter((_, i) => i !== index);
        setUserTools(newTools);
        saveToFirebase(userSkills, newTools);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-24 mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 rounded w-full"></div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-20 mb-4"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-700 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Project Expertise Column */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Add Your Project Expertise</h3>
                
                {/* Add Skill Input */}
                <div className="relative">
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                onFocus={handleSkillInputFocus}
                                onBlur={handleSkillInputBlur}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder=""
                                disabled={userSkills.length >= 20}
                                maxLength={40}
                            />
                            {skillInput === '' && !showSkillDropdown && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="flex items-center h-full px-3">
                                        <span className="text-white/40 text-sm">
                                        Ex: pentesting, web development, etc • ({userSkills.length}/20)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={addSkill}
                            className={`w-8 h-8 text-black rounded-full transition-colors flex items-center justify-center ${
                                userSkills.length >= 20 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-white hover:bg-white/90'
                            }`}
                            disabled={userSkills.length >= 20}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Autocomplete Dropdown */}
                    <div 
                        className={`absolute top-full left-0 right-0 z-50 mt-1 transition-all duration-200 ease-out ${
                            showSkillDropdown ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-1 pointer-events-none'
                        }`}
                    >
                        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg shadow-xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
                            {filteredSkills.length > 0 ? (
                                filteredSkills.map((skill, index) => (
                                    <div
                                        key={skill}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
                                        onClick={() => handleSkillSelect(skill)}
                                        className={`px-3 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-b-0 group relative ${
                                            skill === skillInput 
                                                ? 'bg-white/10 text-white' 
                                                : 'text-white/80 hover:bg-white/5 hover:text-white'
                                        }`}
                                        title={getSkillTooltip(skill)}
                                    >
                                        {skill}
                                        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                            {getSkillTooltip(skill)}
                                            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/90 rotate-45"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-3 text-sm text-white/50">
                                    No expertise areas found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Project Expertise List */}
                <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(index)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Tools Column */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Add Tools You Have Experience With</h3>
                
                {/* Add Tool Input */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={toolInput}
                            onChange={(e) => setToolInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                            placeholder=""
                            disabled={userTools.length >= 40}
                            maxLength={40}
                        />
                        {toolInput === '' && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="flex items-center h-full px-3">
                                    <span className="text-white/40 text-sm">
                                      Ex: VS Code, Figma, firebase, ect • ({userTools.length}/40)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={addTool}
                        className={`w-8 h-8 text-black rounded-full transition-colors flex items-center justify-center ${
                            userTools.length >= 40 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-white hover:bg-white/90'
                        }`}
                        disabled={userTools.length >= 40}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Tools List */}
                <div className="flex flex-wrap gap-2">
                    {userTools.map((tool, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20"
                        >
                            {tool}
                            <button
                                onClick={() => removeTool(index)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
                

            </div>
        </div>
    );
};

// Previous Projects Component
const PreviousProjects = () => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState<Array<{
        id: string;
        title: string;
        description: string;
        imageUrl: string;
        images: Array<{ url: string; isMain: boolean }>;
        files?: Array<{ url: string; name: string; size: number }>;
        projectUrl?: string;
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [viewingProject, setViewingProject] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        imageFiles: [] as File[],
        imagePreviews: [] as string[],
        projectFiles: [] as File[],
        projectUrl: ''
    });
    const [editProject, setEditProject] = useState({
        title: '',
        description: '',
        imageFiles: [] as File[],
        imagePreviews: [] as string[],
        projectFiles: [] as File[],
        projectUrl: ''
    });
    const [imageUploading, setImageUploading] = useState(false);

    // Fetch user projects from Firebase
    useEffect(() => {
        const fetchUserProjects = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // If no projects exist, add fake data
                    if (!userData.projects || userData.projects.length === 0) {
                        const fakeProjects = [
                            {
                                id: "1",
                                title: "E-commerce Platform",
                                description: "Built a full-stack e-commerce platform using React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, payment integration with Stripe, and admin dashboard. Handled 10,000+ daily users and processed $50K+ in transactions.",
                                imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", isMain: true },
                                    { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", isMain: false },
                                    { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", isMain: false }
                                ],
                                projectUrl: "https://example-ecommerce.com"
                            },
                            {
                                id: "2",
                                title: "Mobile Fitness App",
                                description: "Developed a cross-platform fitness tracking app using React Native and Firebase. Includes workout planning, progress tracking, social features, and integration with wearable devices. Achieved 4.8-star rating with 50K+ downloads.",
                                imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", isMain: true },
                                    { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", isMain: false }
                                ],
                                projectUrl: "https://example-fitness-app.com"
                            },
                            {
                                id: "3",
                                title: "AI-Powered Chatbot",
                                description: "Created an intelligent customer service chatbot using Python, TensorFlow, and natural language processing. Handles 500+ daily conversations with 95% accuracy. Integrated with Slack and web platforms for seamless deployment.",
                                imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop", isMain: true }
                                ],
                                projectUrl: "https://example-chatbot.com"
                            },
                            {
                                id: "4",
                                title: "Real Estate Dashboard",
                                description: "Built a comprehensive real estate management dashboard using Vue.js and Django. Features property listings, client management, financial tracking, and market analytics. Used by 200+ real estate agents across 5 cities.",
                                imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", isMain: true },
                                    { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", isMain: false }
                                ],
                                projectUrl: "https://example-realestate.com"
                            },
                            {
                                id: "5",
                                title: "Blockchain DeFi Protocol",
                                description: "Developed a decentralized finance protocol on Ethereum using Solidity and Web3.js. Features include yield farming, liquidity pools, and governance tokens. Achieved $2M+ in total value locked (TVL) within 3 months of launch.",
                                imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop", isMain: true }
                                ],
                                projectUrl: "https://example-defi.com"
                            },
                            {
                                id: "6",
                                title: "Video Streaming Platform",
                                description: "Created a Netflix-like streaming platform using React, Node.js, and AWS. Features include video upload, transcoding, adaptive streaming, user profiles, and recommendation engine. Handles 1M+ video views monthly.",
                                imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
                                images: [
                                    { url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop", isMain: true },
                                    { url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop", isMain: false }
                                ],
                                projectUrl: "https://example-streaming.com"
                            }
                        ];
                        
                        setProjects(fakeProjects);
                        // Save fake data to Firebase
                        await updateDoc(userDocRef, {
                            projects: fakeProjects
                        });
                    } else {
                        // Ensure existing projects have the proper images array structure
                        const projectsWithImages = userData.projects.map((project: any) => {
                            if (!project.images) {
                                // Convert old project structure to new structure
                                return {
                                    ...project,
                                    images: project.imageUrl ? [{ url: project.imageUrl, isMain: true }] : []
                                };
                            }
                            return project;
                        });
                        setProjects(projectsWithImages);
                    }
                }
            } catch (error) {
                console.error("Error fetching user projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProjects();
    }, [currentUser]);

    // Handle image file selection for new project
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert('Please select only image files');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file size must be less than 5MB');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setNewProject({
                ...newProject,
                imageFiles: [...newProject.imageFiles, ...validFiles],
                imagePreviews: [...newProject.imagePreviews, ...newPreviews]
            });
        }
    };

    // Handle image file selection for edit project
    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert('Please select only image files');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file size must be less than 5MB');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setEditProject({
                ...editProject,
                imageFiles: [...editProject.imageFiles, ...validFiles],
                imagePreviews: [...editProject.imagePreviews, ...newPreviews]
            });
        }
    };

    // Remove image from new project
    const removeNewImage = (index: number) => {
        const newFiles = newProject.imageFiles.filter((_, i) => i !== index);
        const newPreviews = newProject.imagePreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(newProject.imagePreviews[index]);
        setNewProject({
            ...newProject,
            imageFiles: newFiles,
            imagePreviews: newPreviews
        });
    };

    // Remove image from edit project
    const removeEditImage = (index: number) => {
        const newFiles = editProject.imageFiles.filter((_, i) => i !== index);
        const newPreviews = editProject.imagePreviews.filter((_, i) => i !== index);
        URL.revokeObjectURL(editProject.imagePreviews[index]);
        setEditProject({
            ...editProject,
            imageFiles: newFiles,
            imagePreviews: newPreviews
        });
    };

    // Upload multiple images to Firebase Storage and get URLs
    const uploadImages = async (files: File[]): Promise<Array<{ url: string; isMain: boolean }>> => {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        
        const uploadPromises = files.map(async (file, index) => {
            const imageRef = ref(storage, `project-images/${currentUser?.uid}/${Date.now()}-${index}-${file.name}`);
            const snapshot = await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return {
                url: downloadURL,
                isMain: index === 0 // First image in the current order is main
            };
        });
        
        return Promise.all(uploadPromises);
    };

    // Handle project file selection for new project
    const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert('File size must be less than 50MB');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setNewProject({
                ...newProject,
                projectFiles: [...newProject.projectFiles, ...validFiles]
            });
        }
    };

    // Handle project file selection for edit project
    const handleEditProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                alert('File size must be less than 50MB');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setEditProject({
                ...editProject,
                projectFiles: [...editProject.projectFiles, ...validFiles]
            });
        }
    };

    // Remove project file from new project
    const removeNewProjectFile = (index: number) => {
        const newFiles = newProject.projectFiles.filter((_, i) => i !== index);
        setNewProject({
            ...newProject,
            projectFiles: newFiles
        });
    };

    // Remove project file from edit project
    const removeEditProjectFile = (index: number) => {
        const newFiles = editProject.projectFiles.filter((_, i) => i !== index);
        setEditProject({
            ...editProject,
            projectFiles: newFiles
        });
    };

    // Remove existing image from edit project
    const removeExistingImage = (index: number) => {
        const currentProject = projects.find(p => p.id === editingProject);
        if (!currentProject?.images) return;
        
        const updatedImages = currentProject.images.filter((_, i) => i !== index);
        
        const updatedProjects = projects.map(project => 
            project.id === editingProject 
                ? { ...project, images: updatedImages }
                : project
        );
        setProjects(updatedProjects);
    };

    // Remove existing file from edit project
    const removeExistingFile = (index: number) => {
        const currentProject = projects.find(p => p.id === editingProject);
        if (!currentProject?.files) return;
        
        const updatedFiles = currentProject.files.filter((_, i) => i !== index);
        
        const updatedProjects = projects.map(project => 
            project.id === editingProject 
                ? { ...project, files: updatedFiles }
                : project
        );
        setProjects(updatedProjects);
    };

    // Reorder existing images in edit form
    const reorderExistingImages = (fromIndex: number, toIndex: number) => {
        const currentProject = projects.find(p => p.id === editingProject);
        if (!currentProject?.images) return;
        
        if (fromIndex === 0) return; // Already main
        
        const images = [...currentProject.images];
        
        // Swap the clicked image with the first image
        [images[0], images[fromIndex]] = [images[fromIndex], images[0]];
        
        // Update the project in the projects array
        const updatedProjects = projects.map(project => 
            project.id === editingProject 
                ? { ...project, images: images }
                : project
        );
        setProjects(updatedProjects);
    };

    // Upload project files to Firebase Storage and get URLs
    const uploadProjectFiles = async (files: File[]): Promise<Array<{ url: string; name: string; size: number }>> => {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage();
        
        const uploadPromises = files.map(async (file) => {
            const fileRef = ref(storage, `project-files/${currentUser?.uid}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return {
                url: downloadURL,
                name: file.name,
                size: file.size
            };
        });
        
        return Promise.all(uploadPromises);
    };

    // Save projects to Firebase
    const saveToFirebase = async (projectsData: typeof projects) => {
        if (!currentUser?.uid) return;

        try {
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                projects: projectsData
            });
        } catch (error) {
            console.error("Error saving projects:", error);
        }
    };

    // Start editing a project
    const startEditProject = (project: typeof projects[0]) => {
        setEditingProject(project.id);
        setEditProject({
            title: project.title,
            description: project.description,
            imageFiles: [],
            imagePreviews: [],
            projectFiles: [],
            projectUrl: project.projectUrl || ''
        });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingProject(null);
        editProject.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        setEditProject({
            title: '',
            description: '',
            imageFiles: [],
            imagePreviews: [],
            projectFiles: [],
            projectUrl: ''
        });
    };

    // Save edited project
    const saveEditProject = async () => {
        if (!editingProject || !editProject.title.trim() || !editProject.description.trim()) return;

        setImageUploading(true);
        
        try {
            const currentProject = projects.find(p => p.id === editingProject);
            let images = currentProject?.images || [];
            let files = currentProject?.files || [];
            
            // If new images were selected, upload them
            if (editProject.imageFiles.length > 0) {
                const newImages = await uploadImages(editProject.imageFiles);
                images = [...images, ...newImages];
            }
            
            // If new files were selected, upload them
            if (editProject.projectFiles.length > 0) {
                const newFiles = await uploadProjectFiles(editProject.projectFiles);
                files = [...files, ...newFiles];
            }
            
            const updatedProjects = projects.map(project => 
                project.id === editingProject 
                    ? {
                        ...project,
                        title: editProject.title.trim(),
                        description: editProject.description.trim(),
                        imageUrl: images[0]?.url || '', // First image is always the main one
                        images: images,
                        files: files,
                        projectUrl: editProject.projectUrl.trim() || undefined
                    }
                    : project
            );
            
            setProjects(updatedProjects);
            saveToFirebase(updatedProjects);
            cancelEdit();
        } catch (error) {
            console.error("Error updating project:", error);
            alert('Failed to update project. Please try again.');
        } finally {
            setImageUploading(false);
        }
    };

    // Add new project
    const addProject = async () => {
        if (newProject.title.trim() && newProject.description.trim() && newProject.imageFiles.length > 0) {
            setImageUploading(true);
            
            try {
                // Upload images to Firebase Storage with proper main image marking
                const images = await uploadImages(newProject.imageFiles);
                
                // Upload project files to Firebase Storage
                const projectFiles = newProject.projectFiles.length > 0 
                    ? await uploadProjectFiles(newProject.projectFiles)
                    : [];
                
                const project = {
                    id: Date.now().toString(),
                    title: newProject.title.trim(),
                    description: newProject.description.trim(),
                    imageUrl: images[0]?.url || '', // First image is always the main one
                    images: images,
                    files: projectFiles,
                    projectUrl: newProject.projectUrl.trim() || undefined
                };
                
                const updatedProjects = [...projects, project];
                setProjects(updatedProjects);
                saveToFirebase(updatedProjects);
                
                // Reset form
                newProject.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                setNewProject({
                    title: '',
                    description: '',
                    imageFiles: [],
                    imagePreviews: [],
                    projectFiles: [],
                    projectUrl: ''
                });
                setShowAddForm(false);
            } catch (error) {
                console.error("Error uploading files:", error);
                alert('Failed to upload files. Please try again.');
            } finally {
                setImageUploading(false);
            }
        }
    };

    // Remove project
    const removeProject = (projectId: string) => {
        const updatedProjects = projects.filter(project => project.id !== projectId);
        setProjects(updatedProjects);
        saveToFirebase(updatedProjects);
    };

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            newProject.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
            editProject.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
        };
    }, [newProject.imagePreviews, editProject.imagePreviews]);

    if (loading) {
        return (
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 mb-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-32 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Previous Projects</h3>
                <div className="flex items-center gap-3">
                    {projects.length >= 6 && (
                        <span className="text-white/50 text-sm">Maximum 6 projects allowed</span>
                    )}
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        disabled={projects.length >= 6 && !showAddForm}
                        className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Add Project
                    </button>
                </div>
            </div>

            {/* Add Project Form */}
            {showAddForm && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-4">Add New Project</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Project Title *</label>
                            <input
                                type="text"
                                value={newProject.title}
                                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder="Enter project title"
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Project URL (Optional)</label>
                            <input
                                type="url"
                                value={newProject.projectUrl}
                                onChange={(e) => setNewProject({...newProject, projectUrl: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder="https://example.com/project"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/70 text-sm mb-2">Project Images *</label>
                            <div className="space-y-3">
                                {/* File Input */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="project-images-input"
                                    />
                                    <label
                                        htmlFor="project-images-input"
                                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-xs cursor-pointer hover:bg-white/20 transition-colors"
                                    >
                                        + Choose Images
                                    </label>
                                    {newProject.imageFiles.length > 0 && (
                                        <span className="text-white/50 text-xs">
                                            {newProject.imageFiles.length} selected
                                        </span>
                                    )}
                                </div>
                                
                                {/* Image Previews */}
                                {newProject.imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {newProject.imagePreviews.map((preview, index) => (
                                            <div key={`new-${preview.slice(-20)}`} className="relative group">
                                                <div 
                                                    className="w-full h-24 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Simple approach: just swap with the first image
                                                        if (index === 0) return; // Already main
                                                        
                                                        const newFiles = [...newProject.imageFiles];
                                                        const newPreviews = [...newProject.imagePreviews];
                                                        
                                                        // Swap the clicked image with the first image
                                                        [newFiles[0], newFiles[index]] = [newFiles[index], newFiles[0]];
                                                        [newPreviews[0], newPreviews[index]] = [newPreviews[index], newPreviews[0]];
                                                        
                                                        setNewProject({
                                                            ...newProject,
                                                            imageFiles: newFiles,
                                                            imagePreviews: newPreviews
                                                        });
                                                    }}
                                                >
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute top-1 left-1">
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-medium shadow-lg">
                                                            ★ Main
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNewImage(index);
                                                    }}
                                                    className="absolute top-2 right-2 w-5 h-5 text-white hover:text-red-500 transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                                                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Click to make main
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <p className="text-white/50 text-xs">
                                    First image will be the main image. Accepted formats: JPG, PNG, GIF. Max size: 5MB per image.
                                </p>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/70 text-sm mb-2">Description *</label>
                            <textarea
                                value={newProject.description}
                                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white resize-none"
                                placeholder="Describe your project, technologies used, and your role..."
                                rows={3}
                                maxLength={500}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/70 text-sm mb-2">Project Files (Optional)</label>
                            <div className="space-y-3">
                                {/* File Input */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleProjectFileChange}
                                        className="hidden"
                                        id="project-files-input"
                                    />
                                    <label
                                        htmlFor="project-files-input"
                                        className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-xs cursor-pointer hover:bg-white/20 transition-colors"
                                    >
                                        + Choose Files
                                    </label>
                                    {newProject.projectFiles.length > 0 && (
                                        <span className="text-white/50 text-xs">
                                            {newProject.projectFiles.length} selected
                                        </span>
                                    )}
                                </div>
                                
                                {/* File List */}
                                {newProject.projectFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {newProject.projectFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-white text-sm">{file.name}</span>
                                                    <span className="text-white/50 text-xs">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeNewProjectFile(index)}
                                                    className="w-4 h-4 text-white hover:text-red-500 transition-colors duration-200"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <p className="text-white/50 text-xs">
                                    Upload project files, documentation, or source code. Max size: 50MB per file.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                newProject.imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
                                setNewProject({
                                    title: '',
                                    description: '',
                                    imageFiles: [],
                                    imagePreviews: [],
                                    projectFiles: [],
                                    projectUrl: ''
                                });
                            }}
                            className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={addProject}
                            disabled={!newProject.title.trim() || !newProject.description.trim() || newProject.imageFiles.length === 0 || imageUploading}
                            className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {imageUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                'Add Project'
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-white/60 text-sm">No projects added yet. Click "Add Project" to showcase your work.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                            {/* Project Image */}
                            <div className="relative h-48 bg-gray-800">
                                <img
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg4LjU0NCA4MSA5OSA4MUMxMDkuNDU2IDgxIDExOCA4OS41NDQgMTE4IDEwMEMxMTggMTEwLjQ1NiAxMDkuNDU2IDExOSA5OSAxMTlDODguNTQ0IDExOSA4MCAxMTAuNDU2IDgwIDEwMFoiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTE2MCAxMzBIMTQwVjExMEgxNjBWMTMwWiIgZmlsbD0iIzY2NjY2NiIvPgo8cGF0aCBkPSJNMTYwIDE3MEg0MFYxNTBIMTYwVjE3MFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+';
                                    }}
                                />
                                {/* Action Buttons - Always Visible */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    {/* Edit Button */}
                                    <button
                                        onClick={() => startEditProject(project)}
                                        className="w-6 h-6 text-white hover:text-blue-500 transition-colors duration-200"
                                        title="Edit Project"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeProject(project.id)}
                                        className="w-6 h-6 text-white hover:text-red-500 transition-colors duration-200"
                                        title="Delete Project"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Project Info */}
                            <div className="p-4">
                                <h4 className="text-white font-medium mb-2 line-clamp-1">{project.title}</h4>
                                <p className="text-white/70 text-sm line-clamp-3 mb-3">{project.description}</p>
                                <button
                                    onClick={() => setViewingProject(project.id)}
                                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                >
                                    View Project
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Project Form */}
            {editingProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-white font-medium text-lg">Edit Project</h4>
                            <button
                                onClick={cancelEdit}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Project Title *</label>
                                <input
                                    type="text"
                                    value={editProject.title}
                                    onChange={(e) => setEditProject({...editProject, title: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                                    placeholder="Enter project title"
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Project URL (Optional)</label>
                                <input
                                    type="url"
                                    value={editProject.projectUrl}
                                    onChange={(e) => setEditProject({...editProject, projectUrl: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                                    placeholder="https://example.com/project"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2">Add New Images</label>
                                <div className="space-y-3">
                                    {/* Current Images */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(projects.find(p => p.id === editingProject)?.images || []).map((image, index) => (
                                            <div key={`existing-${image.url.slice(-30)}`} className="relative group">
                                                <div 
                                                    className="w-full h-24 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Move this image to the front (make it main)
                                                        reorderExistingImages(index, 0);
                                                    }}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={`Current ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute top-1 left-1">
                                                    {index === 0 && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-medium shadow-lg">
                                                            ★ Main
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeExistingImage(index);
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 text-white hover:text-red-500 transition-colors duration-200"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                                                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Click to make main
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* File Input */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleEditImageChange}
                                            className="hidden"
                                            id="edit-project-images-input"
                                        />
                                        <label
                                            htmlFor="edit-project-images-input"
                                            className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-xs cursor-pointer hover:bg-white/20 transition-colors"
                                        >
                                            + Add Images
                                        </label>
                                        {editProject.imageFiles.length > 0 && (
                                            <span className="text-white/50 text-xs">
                                                {editProject.imageFiles.length} new
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* New Image Previews */}
                                    {editProject.imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {editProject.imagePreviews.map((preview, index) => (
                                                <div key={`edit-new-${preview.slice(-20)}`} className="relative group">
                                                    <div 
                                                        className="w-full h-24 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-colors cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Simple approach: just swap with the first image
                                                            if (index === 0) return; // Already main
                                                            
                                                            const newFiles = [...editProject.imageFiles];
                                                            const newPreviews = [...editProject.imagePreviews];
                                                            
                                                            // Swap the clicked image with the first image
                                                            [newFiles[0], newFiles[index]] = [newFiles[index], newFiles[0]];
                                                            [newPreviews[0], newPreviews[index]] = [newPreviews[index], newPreviews[0]];
                                                            
                                                            setEditProject({
                                                                ...editProject,
                                                                imageFiles: newFiles,
                                                                imagePreviews: newPreviews
                                                            });
                                                        }}
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`New Preview ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute top-1 left-1">
                                                        {index === 0 && (
                                                            <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-medium shadow-lg">
                                                                ★ Main
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeEditImage(index);
                                                        }}
                                                        className="absolute top-2 right-2 w-5 h-5 text-white hover:text-red-500 transition-colors duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                                                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Click to make main
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2">Description *</label>
                                <textarea
                                    value={editProject.description}
                                    onChange={(e) => setEditProject({...editProject, description: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white resize-none"
                                    placeholder="Describe your project, technologies used, and your role..."
                                    rows={3}
                                    maxLength={500}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/70 text-sm mb-2">Files</label>
                                <div className="space-y-2">
                                    {/* Existing Files */}
                                    {(projects.find(p => p.id === editingProject)?.files || []).map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-sm">
                                            <span className="text-white">{file.name}</span>
                                            <button
                                                onClick={() => removeExistingFile(index)}
                                                className="text-white hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* Add Files */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleEditProjectFileChange}
                                            className="hidden"
                                            id="edit-project-files-input"
                                        />
                                        <label
                                            htmlFor="edit-project-files-input"
                                            className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-xs cursor-pointer hover:bg-white/20 transition-colors"
                                        >
                                            + Add Files
                                        </label>
                                        {editProject.projectFiles.length > 0 && (
                                            <span className="text-white/50 text-xs">
                                                {editProject.projectFiles.length} new
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* New Files */}
                                    {editProject.projectFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-sm">
                                            <span className="text-white">{file.name}</span>
                                            <button
                                                onClick={() => removeEditProjectFile(index)}
                                                className="text-white hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEditProject}
                                disabled={!editProject.title.trim() || !editProject.description.trim() || imageUploading}
                                className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {imageUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Project Modal */}
            {viewingProject && (() => {
                const selectedProject = projects.find(p => p.id === viewingProject);
                if (!selectedProject) return null;
                

                
                return (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold text-white">{selectedProject.title}</h2>
                                    <button
                                        onClick={() => setViewingProject(null)}
                                        className="w-6 h-6 text-white hover:text-red-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                {/* Project Images */}
                                {selectedProject.images && selectedProject.images.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            {/* Main Image */}
                                            <div className="w-full max-h-96 overflow-hidden bg-[#000000]">
                                                <img
                                                    src={selectedProject.images[currentImageIndex].url}
                                                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                                                    className="w-full h-auto max-h-96 object-contain"
                                                    onLoad={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        // Add a small delay to ensure smooth transitions
                                                        setTimeout(() => {
                                                            img.style.opacity = '1';
                                                        }, 50);
                                                    }}
                                                    style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                                                />
                                            </div>
                                            
                                            {/* Navigation Arrows */}
                                            {selectedProject.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const newIndex = currentImageIndex === 0 ? selectedProject.images.length - 1 : currentImageIndex - 1;
                                                            setCurrentImageIndex(newIndex);
                                                        }}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newIndex = currentImageIndex === selectedProject.images.length - 1 ? 0 : currentImageIndex + 1;
                                                            setCurrentImageIndex(newIndex);
                                                        }}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            
                                            {/* Image Counter */}
                                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                {currentImageIndex + 1} / {selectedProject.images.length}
                                            </div>
                                        </div>
                                        
                                        {/* Thumbnail Navigation */}
                                        {selectedProject.images.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {selectedProject.images.map((image, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            setCurrentImageIndex(index);
                                                        }}
                                                        className={`flex-shrink-0 w-16 h-12 border-2 rounded-lg overflow-hidden transition-colors bg-white/5 ${
                                                            currentImageIndex === index 
                                                                ? 'border-blue-400' 
                                                                : 'border-white/20 hover:border-white/40'
                                                        }`}
                                                    >
                                                        <img
                                                            src={image.url}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Project Description */}
                                {selectedProject.description && (
                                    <div className="px-4">
                                        <p className="text-white text-base leading-relaxed">{selectedProject.description}</p>
                                    </div>
                                )}

                                {/* Project URL */}
                                {selectedProject.projectUrl && (
                                    <div className="px-4">
                                        <p className="text-white text-base">
                                            <a
                                                href={selectedProject.projectUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                {selectedProject.projectUrl}
                                            </a>
                                        </p>
                                    </div>
                                )}

                                {/* Project Files */}
                                {selectedProject.files && selectedProject.files.length > 0 && (
                                    <div className="px-4 space-y-2">
                                        <h3 className="text-white/70 text-sm font-medium">Files</h3>
                                        <div className="space-y-1">
                                            {selectedProject.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-white">{file.name}</span>
                                                        <span className="text-white/50 text-xs">({file.size} KB)</span>
                                                    </div>
                                                    <a
                                                        href={file.url}
                                                        download
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

// Client Metrics Component
const ClientMetrics = () => {
    const { currentUser } = useAuth();
    const [metrics, setMetrics] = useState({
        totalSpent: 0,
        monthlySpent: 0,
        projectsPosted: 0,
        projectsCompleted: 0,
        averageProjectValue: 0,
        clientRating: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch client metrics from Firebase
    useEffect(() => {
        const fetchClientMetrics = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    
                    setMetrics({
                        totalSpent: userData.totalSpent || 0,
                        monthlySpent: userData.monthlySpent || 0,
                        projectsPosted: userData.projectsPosted || 0,
                        projectsCompleted: userData.projectsCompleted || 0,
                        averageProjectValue: userData.averageProjectValue || 0,
                        clientRating: userData.clientRating || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching client metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientMetrics();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-3 bg-gray-700 rounded w-20"></div>
                            <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Client Rating */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Client Rating</h3>
                </div>
                <div className="text-2xl font-bold text-white">
                    {metrics.clientRating > 0 ? metrics.clientRating.toFixed(2) : 'Post First Job'}
                </div>
                <div className="text-xs text-white/60">
                    {metrics.clientRating > 0 ? 'out of 10.00' : 'to get rated'}
                </div>
            </div>

            {/* Total Spend */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Total Spend</h3>
                </div>
                <div className="text-2xl font-bold text-white">${metrics.totalSpent.toLocaleString()}</div>
                <div className="text-xs text-white/60">lifetime</div>
            </div>

            {/* Monthly Spend */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Monthly Spend</h3>
                </div>
                <div className="text-2xl font-bold text-white">${metrics.monthlySpent.toLocaleString()}</div>
                <div className="text-xs text-white/60">this month</div>
            </div>

            {/* Jobs Posted */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Jobs Posted</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.projectsPosted}</div>
                <div className="text-xs text-white/60">total jobs</div>
            </div>

            {/* Jobs Completed */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Jobs Completed</h3>
                </div>
                <div className="text-2xl font-bold text-white">{metrics.projectsCompleted}</div>
                <div className="text-xs text-white/60">successful jobs</div>
            </div>

            {/* Average Job Value */}
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4">
                <div className="mb-2">
                    <h3 className="text-xs font-medium text-white/60">Average Job Value</h3>
                </div>
                <div className="text-2xl font-bold text-white">${metrics.averageProjectValue.toLocaleString()}</div>
                <div className="text-xs text-white/60">per job</div>
            </div>
        </div>
    );
};

// Company Information Component
const CompanyInformation = () => {
    const { currentUser } = useAuth();
    const [companyInfo, setCompanyInfo] = useState({
        companyName: '',
        entityType: 'individual', // 'individual' or 'company'
        industry: '',
        companySize: '',
        website: '',
        description: '',
        location: ''
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Fetch company information from Firebase
    useEffect(() => {
        const fetchCompanyInfo = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCompanyInfo({
                        companyName: userData.company || userData.companyName || '',
                        entityType: userData.entityType || 'individual',
                        industry: userData.industry || '',
                        companySize: userData.companySize || '',
                        website: userData.website || '',
                        description: userData.description || '',
                        location: userData.location || ''
                    });
                }
            } catch (error) {
                console.error("Error fetching company info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyInfo();
    }, [currentUser]);

    const saveCompanyInfo = async () => {
        if (!currentUser?.uid) return;

        try {
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                company: companyInfo.companyName, // Update profile card company field
                companyName: companyInfo.companyName, // Keep for backward compatibility
                entityType: companyInfo.entityType,
                industry: companyInfo.industry,
                companySize: companyInfo.companySize,
                website: companyInfo.website,
                description: companyInfo.description,
                location: companyInfo.location
            });
            setEditing(false);
        } catch (error) {
            console.error("Error saving company info:", error);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Company Information</h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            </div>

            {editing ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Entity Type</label>
                            <select
                                value={companyInfo.entityType}
                                onChange={(e) => setCompanyInfo({...companyInfo, entityType: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                            >
                                <option value="individual">Individual</option>
                                <option value="company">Company</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-2">{companyInfo.entityType === 'company' ? 'Company Name' : 'Name'}</label>
                            <input
                                type="text"
                                value={companyInfo.companyName}
                                onChange={(e) => setCompanyInfo({...companyInfo, companyName: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder={companyInfo.entityType === 'company' ? "Enter company name" : "Enter your name"}
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Industry</label>
                            <input
                                type="text"
                                value={companyInfo.industry}
                                onChange={(e) => setCompanyInfo({...companyInfo, industry: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder="e.g., Technology, Healthcare"
                            />
                        </div>
                        {companyInfo.entityType === 'company' && (
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Company Size</label>
                                <select
                                    value={companyInfo.companySize}
                                    onChange={(e) => setCompanyInfo({...companyInfo, companySize: e.target.value})}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                                >
                                    <option value="">Select size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="501-1000">501-1000 employees</option>
                                    <option value="1001-5000">1001-5000 employees</option>
                                    <option value="5001-10000">5001-10000 employees</option>
                                    <option value="10000+">10000+ employees</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-white/70 text-sm mb-2">Website</label>
                            <input
                                type="url"
                                value={companyInfo.website}
                                onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-white/70 text-sm mb-2">Location</label>
                            <input
                                type="text"
                                value={companyInfo.location}
                                onChange={(e) => setCompanyInfo({...companyInfo, location: e.target.value})}
                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-white/70 text-sm mb-2">Company Description</label>
                        <textarea
                            value={companyInfo.description}
                            onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                            rows={4}
                            placeholder="Describe your company and what you do..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={saveCompanyInfo}
                            className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 bg-white/10 text-white rounded-md text-sm font-medium hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div>
                        <span className="text-white/70 text-sm">Type:</span>
                        <span className="text-white ml-2 capitalize">{companyInfo.entityType || 'Not specified'}</span>
                    </div>
                    <div>
                        <span className="text-white/70 text-sm">{companyInfo.entityType === 'company' ? 'Company:' : 'Name:'}</span>
                        <span className="text-white ml-2">{companyInfo.companyName || 'Not specified'}</span>
                    </div>
                    <div>
                        <span className="text-white/70 text-sm">Industry:</span>
                        <span className="text-white ml-2">{companyInfo.industry || 'Not specified'}</span>
                    </div>
                    {companyInfo.entityType === 'company' && (
                        <div>
                            <span className="text-white/70 text-sm">Size:</span>
                            <span className="text-white ml-2">{companyInfo.companySize || 'Not specified'}</span>
                        </div>
                    )}
                    <div>
                        <span className="text-white/70 text-sm">Website:</span>
                        {companyInfo.website ? (
                            <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2">
                                {companyInfo.website}
                            </a>
                        ) : (
                            <span className="text-white ml-2">Not specified</span>
                        )}
                    </div>
                    <div>
                        <span className="text-white/70 text-sm">Location:</span>
                        <span className="text-white ml-2">{companyInfo.location || 'Not specified'}</span>
                    </div>
                    <div>
                        <span className="text-white/70 text-sm">Description:</span>
                        <p className="text-white mt-1">{companyInfo.description || 'No description added yet.'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// What I'm Looking For Component
const ProjectRequirements = () => {
    const { currentUser } = useAuth();
    const [preferences, setPreferences] = useState<string[]>([]);
    const [preferenceInput, setPreferenceInput] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch preferences from Firebase
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!currentUser?.uid) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setPreferences(userData.projectRequirements || []);
                }
            } catch (error) {
                console.error("Error fetching preferences:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [currentUser]);

    const addPreference = () => {
        if (preferenceInput.trim() && preferences.length < 10) {
            const newPreferences = [...preferences, preferenceInput.trim()];
            setPreferences(newPreferences);
            setPreferenceInput('');
            savePreferences(newPreferences);
        }
    };

    const removePreference = (index: number) => {
        const newPreferences = preferences.filter((_, i) => i !== index);
        setPreferences(newPreferences);
        savePreferences(newPreferences);
    };

    const savePreferences = async (preferencesData: string[]) => {
        if (!currentUser?.uid) return;

        try {
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                projectRequirements: preferencesData
            });
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">What I'm Looking For</h3>
            
            {/* Add Preference Input */}
            <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={preferenceInput}
                        onChange={(e) => setPreferenceInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference())}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/20 rounded-md text-white text-sm placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder=""
                        disabled={preferences.length >= 10}
                        maxLength={100}
                    />
                    {preferenceInput === '' && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="flex items-center h-full px-2">
                                <span className="text-white/40 text-xs">
                                    Add preference • Example: US based, 3+ years experience • ({preferences.length}/10)
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={addPreference}
                    className={`w-7 h-7 text-black rounded-full transition-colors flex items-center justify-center ${
                        preferences.length >= 10 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-white hover:bg-white/90'
                    }`}
                    disabled={preferences.length >= 10}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            {/* Preferences List */}
            <div className="space-y-1">
                {preferences.map((preference, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded text-sm"
                    >
                        <span className="text-white text-xs">{preference}</span>
                        <button
                            onClick={() => removePreference(index)}
                            className="w-5 h-5 text-white hover:text-red-400 transition-colors flex items-center justify-center"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            {preferences.length === 0 && (
                <p className="text-white/60 text-xs mt-2">No preferences added yet. Add preferences like location, experience level, availability, etc.</p>
            )}
        </div>
    );
};

// Client Profile Component
const ClientProfile = () => {
    return (
        <>
            <ClientMetrics />
            <CompanyInformation />
            <ProjectRequirements />
        </>
    );
};

const MainContent = () => {
    const [activeTab, setActiveTab] = useState("developer");

    return (
        <>
            <ContentTab 
                tabs={["developer", "client"]} 
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            
            {activeTab === "developer" && (
                <>
                    <DeveloperMetrics />
                    <SkillsAndTools />
                    <PreviousProjects />
                </>
            )}
            {activeTab === "client" && <ClientProfile />}
        </>
    );
};
export default MainContent;
