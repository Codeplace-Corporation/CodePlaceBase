import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { firestore } from "../../../firebase";

// Modern Twitter-style Image Cropper Component
interface ImageCropperProps {
    isOpen: boolean;
    imageFile: File | null;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
}

const ImageCropper = ({ isOpen, imageFile, onClose, onCropComplete }: ImageCropperProps) => {
    const [imageSrc, setImageSrc] = useState('');
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const CIRCLE_SIZE = 300;

    // Load image when file changes
    useEffect(() => {
        console.log('ImageCropper: File changed', { imageFile: imageFile?.name, isOpen });
        if (!imageFile) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
                console.log('ImageCropper: Image loaded from file reader');
                setImageSrc(e.target.result);
                setImageLoaded(false);
            }
        };
        reader.onerror = (e) => {
            console.error('ImageCropper: Error reading file', e);
        };
        reader.readAsDataURL(imageFile);
    }, [imageFile, isOpen]);

    // Initialize image position and scale when loaded
    const handleImageLoad = useCallback(() => {
        if (!imageRef.current || !containerRef.current) return;
        
        const img = imageRef.current;
        const container = containerRef.current;
        
        // Store natural image dimensions
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        
        // Force container dimensions to be 400px height
        const containerWidth = container.clientWidth || 512;
        const containerHeight = 400; // Fixed height
        
        // Calculate initial scale to ensure image fills the circle
        const minDimension = Math.min(img.naturalWidth, img.naturalHeight);
        const initialScale = Math.max(
            CIRCLE_SIZE / minDimension,
            containerWidth / img.naturalWidth,
            containerHeight / img.naturalHeight
        ) * 0.8; // Add some padding
        
        setScale(initialScale);
        
        // Center the image in the container
        const scaledWidth = img.naturalWidth * initialScale;
        const scaledHeight = img.naturalHeight * initialScale;
        setPosition({
            x: (containerWidth - scaledWidth) / 2,
            y: (containerHeight - scaledHeight) / 2
        });
        
        setImageLoaded(true);
        console.log('Image loaded:', {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            containerWidth,
            containerHeight,
            initialScale,
            scaledWidth,
            scaledHeight,
            position: {
                x: (containerWidth - scaledWidth) / 2,
                y: (containerHeight - scaledHeight) / 2
            }
        });
    }, []);

    // Handle mouse down for dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    }, [position]);

    // Handle mouse move for dragging
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Calculate constraints to keep image within crop circle
        const containerWidth = containerRef.current?.clientWidth || 512;
        const containerHeight = 400;
        const circleCenterX = containerWidth / 2;
        const circleCenterY = containerHeight / 2;
        const circleRadius = CIRCLE_SIZE / 2;
        
        // Calculate scaled image dimensions
        const scaledWidth = imageSize.width * scale;
        const scaledHeight = imageSize.height * scale;
        
        // Minimum boundaries - image must cover the entire circle
        const minX = circleCenterX - scaledWidth + circleRadius;
        const maxX = circleCenterX - circleRadius;
        const minY = circleCenterY - scaledHeight + circleRadius;
        const maxY = circleCenterY - circleRadius;
        
        // Constrain position
        const constrainedX = Math.max(minX, Math.min(maxX, newX));
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        
        setPosition({
            x: constrainedX,
            y: constrainedY
        });
    }, [isDragging, dragStart, scale, imageSize]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle wheel zoom with position constraints
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const minScale = CIRCLE_SIZE / Math.min(imageSize.width, imageSize.height);
        const maxScale = minScale * 3;
        
        const newScale = Math.max(minScale, Math.min(maxScale, scale * delta));
        
        if (newScale !== scale && containerRef.current) {
            const container = containerRef.current;
            const mouseX = e.clientX - container.getBoundingClientRect().left;
            const mouseY = e.clientY - container.getBoundingClientRect().top;
            
            const scaleRatio = newScale / scale;
            
            const newX = mouseX - (mouseX - position.x) * scaleRatio;
            const newY = mouseY - (mouseY - position.y) * scaleRatio;
            
            // Apply constraints after scaling
            const containerWidth = container.clientWidth || 512;
            const containerHeight = 400;
            const circleCenterX = containerWidth / 2;
            const circleCenterY = containerHeight / 2;
            const circleRadius = CIRCLE_SIZE / 2;
            
            const scaledWidth = imageSize.width * newScale;
            const scaledHeight = imageSize.height * newScale;
            
            const minX = circleCenterX - scaledWidth + circleRadius;
            const maxX = circleCenterX - circleRadius;
            const minY = circleCenterY - scaledHeight + circleRadius;
            const maxY = circleCenterY - circleRadius;
            
            const constrainedX = Math.max(minX, Math.min(maxX, newX));
            const constrainedY = Math.max(minY, Math.min(maxY, newY));
            
            setPosition({
                x: constrainedX,
                y: constrainedY
            });
            
            setScale(newScale);
        }
    }, [scale, imageSize, CIRCLE_SIZE, position]);

    // Handle touch events for mobile - simplified without Touch type issues
    const [touchData, setTouchData] = useState<{
        initialDistance: number;
        initialScale: number;
    }>({ initialDistance: 0, initialScale: 1 });

    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            setDragStart({
                x: touch.clientX - position.x,
                y: touch.clientY - position.y
            });
        } else if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches);
            setTouchData({
                initialDistance: distance,
                initialScale: scale
            });
        }
    }, [position, scale]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            const newX = touch.clientX - dragStart.x;
            const newY = touch.clientY - dragStart.y;
            
            // Apply same constraints as mouse move
            const containerWidth = containerRef.current?.clientWidth || 512;
            const containerHeight = 400;
            const circleCenterX = containerWidth / 2;
            const circleCenterY = containerHeight / 2;
            const circleRadius = CIRCLE_SIZE / 2;
            
            const scaledWidth = imageSize.width * scale;
            const scaledHeight = imageSize.height * scale;
            
            const minX = circleCenterX - scaledWidth + circleRadius;
            const maxX = circleCenterX - circleRadius;
            const minY = circleCenterY - scaledHeight + circleRadius;
            const maxY = circleCenterY - circleRadius;
            
            const constrainedX = Math.max(minX, Math.min(maxX, newX));
            const constrainedY = Math.max(minY, Math.min(maxY, newY));
            
            setPosition({
                x: constrainedX,
                y: constrainedY
            });
        } else if (e.touches.length === 2 && touchData.initialDistance > 0) {
            const distance = getTouchDistance(e.touches);
            const scaleRatio = distance / touchData.initialDistance;
            const minScale = CIRCLE_SIZE / Math.min(imageSize.width, imageSize.height);
            const maxScale = minScale * 3;
            const newScale = Math.max(minScale, Math.min(maxScale, touchData.initialScale * scaleRatio));
            
            setScale(newScale);
        }
    }, [isDragging, dragStart, touchData, imageSize, scale]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        setTouchData({ initialDistance: 0, initialScale: 1 });
    }, []);

    // Reset function
    const handleReset = useCallback(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const minScale = CIRCLE_SIZE / Math.min(imageSize.width, imageSize.height);
        
        setScale(minScale);
        
        const scaledWidth = imageSize.width * minScale;
        const scaledHeight = imageSize.height * minScale;
        setPosition({
            x: (containerWidth - scaledWidth) / 2,
            y: (containerHeight - scaledHeight) / 2
        });
    }, [imageSize, CIRCLE_SIZE]);

    // Crop function
    const handleCrop = useCallback(async () => {
        if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const container = containerRef.current;
        
        // Circle center in container coordinates
        const circleCenterX = container.clientWidth / 2;
        const circleCenterY = container.clientHeight / 2;
        const circleRadius = CIRCLE_SIZE / 2;
        
        // Convert to image coordinates
        const imageScaleRatio = 1 / scale;
        const sourceCenterX = (circleCenterX - position.x) * imageScaleRatio;
        const sourceCenterY = (circleCenterY - position.y) * imageScaleRatio;
        const sourceRadius = circleRadius * imageScaleRatio;
        
        // Crop area in original image
        const sourceX = sourceCenterX - sourceRadius;
        const sourceY = sourceCenterY - sourceRadius;
        const sourceSize = sourceRadius * 2;
        
        // Set canvas size
        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // High quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Create circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw the image
        ctx.drawImage(
            imageRef.current,
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, outputSize, outputSize
        );
        
        ctx.restore();
        
        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
                onClose();
            }
        }, 'image/png', 0.95);
    }, [position, scale, CIRCLE_SIZE, onCropComplete, onClose]);

    // Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter') {
                handleCrop();
            } else if (e.key.toLowerCase() === 'r') {
                handleReset();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleCrop, handleReset]);

    if (!isOpen) {
        console.log('ImageCropper: Not open, returning null');
        return null;
    }

    console.log('ImageCropper: Rendering', { 
        isOpen, 
        hasImageFile: !!imageFile, 
        hasImageSrc: !!imageSrc, 
        imageLoaded 
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 text-white border-b border-gray-700">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <h1 className="text-lg font-medium">Crop Image</h1>
                    
                    <button
                        onClick={handleCrop}
                        disabled={!imageLoaded}
                        className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply
                    </button>
                </div>

                {/* Main crop area */}
                <div className="relative overflow-hidden bg-gray-900" style={{ height: '400px', minHeight: '400px' }}>
                    {imageSrc && (
                        <div
                            ref={containerRef}
                            className="w-full h-full relative cursor-move bg-gray-800 overflow-visible"
                            style={{ height: '400px' }}
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop preview"
                                className="absolute origin-top-left select-none block"
                                onLoad={handleImageLoad}
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    touchAction: 'none',
                                    zIndex: 1,
                                    maxWidth: 'none',
                                    maxHeight: 'none',
                                    width: 'auto',
                                    height: 'auto',
                                    display: 'block',
                                    opacity: imageLoaded ? 1 : 0.5,
                                    border: '2px solid red' // Debug border to see if image is there
                                }}
                                draggable={false}
                            />
                            
                            {/* Debug info overlay */}
                            {imageLoaded && (
                                <div 
                                    className="absolute top-4 left-4 bg-red-500 text-white p-2 text-xs z-50"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    Image: {imageSize.width}x{imageSize.height}<br/>
                                    Scale: {scale.toFixed(2)}<br/>
                                    Position: {Math.round(position.x)}, {Math.round(position.y)}
                                </div>
                            )}
                            
                            {/* Debug info */}
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                                    Loading image...
                                </div>
                            )}
                            
                            {/* Draggable overlay */}
                            <div
                                className="absolute inset-0"
                                style={{ zIndex: 2 }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            />
                            
                            {imageLoaded && (
                                <>
                                    {/* Overlay with circle cutout */}
                                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
                                        {/* Simple radial gradient overlay */}
                                        <div 
                                            className="absolute inset-0"
                                            style={{
                                                background: `radial-gradient(circle ${CIRCLE_SIZE / 2}px at 50% 50%, transparent ${CIRCLE_SIZE / 2}px, rgba(0, 0, 0, 0.7) ${CIRCLE_SIZE / 2 + 1}px)`
                                            }}
                                        />
                                        
                                        {/* Circle border */}
                                        <div 
                                            className="absolute border-2 border-white rounded-full"
                                            style={{
                                                width: CIRCLE_SIZE,
                                                height: CIRCLE_SIZE,
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* Show message if no image */}
                    {!imageSrc && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No image selected
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 text-white text-center border-t border-gray-700">
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <span>Drag to move • Scroll to zoom</span>
                        <button
                            onClick={handleReset}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Hidden canvas for cropping */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }) as T;
}

// Main ProfileCard Component
interface ProfileCardProps {
    className?: string;
}

interface UserProfile {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    pronouns?: string;
    company?: string;
    location?: string;
    displayLocalTime?: boolean;
    portfolioSite?: string;
    github?: string;
    socials?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    resume?: string;
    resumeURL?: string;
    resumeFileName?: string;
}

const ProfileCard = ({ className = "" }: ProfileCardProps) => {
    const { currentUser } = useAuth();
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        pronouns: "Don't specify",
        company: "",
        location: "",
        displayLocalTime: false,
        portfolioSite: "",
        github: "",
        socials: "",
        twitter: "",
        instagram: "",
        youtube: "",
        resume: ""
    });

    // Debounced auto-save function
    const autoSave = useCallback(
        debounce(async (data: typeof formData) => {
            if (!currentUser?.uid) return;

            setSaveStatus("saving");
            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                let updateData: Partial<UserProfile> = {
                    bio: data.bio,
                    pronouns: data.pronouns,
                    company: data.company,
                    location: data.location,
                    displayLocalTime: data.displayLocalTime,
                    portfolioSite: data.portfolioSite,
                    github: data.github,
                    socials: data.socials
                };

                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserProfile;
                    const originalDisplayName = userData.firstName && userData.lastName ? 
                        `${userData.firstName} ${userData.lastName}` : 
                        (userData.firstName || currentUser.displayName || currentUser.email?.split('@')[0] || "");

                    // Only save displayName to Firebase if it's different from the default
                    if (data.displayName !== originalDisplayName) {
                        updateData.displayName = data.displayName;
                    }

                    await updateDoc(userDocRef, updateData);
                } else {
                    // For new users, only save displayName if it's different from the default
                    const defaultDisplayName = currentUser.displayName || 
                                             currentUser.email?.split('@')[0] || 
                                             "";
                    if (data.displayName !== defaultDisplayName) {
                        updateData.displayName = data.displayName;
                    }

                    await setDoc(userDocRef, updateData);
                }

                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } catch (error) {
                console.error("Error auto-saving profile:", error);
                setSaveStatus("error");
                setTimeout(() => setSaveStatus("idle"), 3000);
            }
        }, 1000),
        [currentUser]
    );

    // Load user profile data on component mount
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!currentUser?.uid) return;

            // Set initial profile image
            setProfileImageUrl(currentUser.photoURL || "");

            try {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserProfile;
                    
                    // Determine display name logic
                    let displayName = "";
                    if (userData.displayName) {
                        // Use custom display name if it exists
                        displayName = userData.displayName;
                    } else if (userData.firstName && userData.lastName) {
                        // Use "First Last" format if both names exist
                        displayName = `${userData.firstName} ${userData.lastName}`;
                    } else if (userData.firstName) {
                        // Use just first name if only first name exists
                        displayName = userData.firstName;
                    } else {
                        // Fallback to email username or current user display name
                        displayName = currentUser.displayName || currentUser.email?.split('@')[0] || "";
                    }

                    setFormData({
                        displayName,
                        bio: userData.bio || "",
                        pronouns: userData.pronouns || "Don't specify",
                        company: userData.company || "",
                        location: userData.location || "",
                        displayLocalTime: userData.displayLocalTime || false,
                        portfolioSite: userData.portfolioSite || "",
                        github: userData.github || "",
                        socials: userData.socials || "",
                        twitter: userData.twitter || "",
                        instagram: userData.instagram || "",
                        youtube: userData.youtube || "",
                        resume: userData.resumeURL || ""
                    });
                } else {
                    // New user - set default display name from firstName + lastName or fallback
                    const defaultDisplayName = currentUser.displayName || 
                                            currentUser.email?.split('@')[0] || 
                                            "";
                    setFormData(prev => ({
                        ...prev,
                        displayName: defaultDisplayName
                    }));
                }
            } catch (error) {
                console.error("Error loading user profile:", error);
            }
        };

        loadUserProfile();
    }, [currentUser]);

    const handleInputChange = (field: string, value: string | boolean) => {
        const newFormData = {
            ...formData,
            [field]: value
        };
        setFormData(newFormData);
        
        // Auto-save after user stops typing (exclude resume field as it's handled separately)
        if (field !== 'resume') {
            autoSave(newFormData);
        }
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange('bio', e.target.value);
        
        // Auto-resize textarea without max height restriction
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 2 + 'px'; // Add 2px buffer
        textarea.style.overflow = 'hidden'; // Always hidden to prevent scrollbars
    };

    const handleAvatarSelect = (file: File) => {
        console.log('ProfileCard: Avatar selected', file.name, file.size);
        setSelectedImageFile(file);
        setCropperOpen(true);
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        try {
            setSaveStatus("saving");
            
            if (!currentUser?.uid) {
                throw new Error("No user authenticated");
            }

            // Upload to Firebase Storage
            const storage = getStorage();
            const avatarRef = ref(storage, `avatars/${currentUser.uid}`);
            
            console.log("Uploading cropped image to Firebase Storage...");
            await uploadBytes(avatarRef, croppedImageBlob);
            
            // Get download URL
            const downloadURL = await getDownloadURL(avatarRef);
            console.log("Image uploaded, download URL:", downloadURL);
            
            // Update Firebase Auth profile
            await updateProfile(currentUser, {
                photoURL: downloadURL
            });
            
            // Update Firestore user document
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                photoURL: downloadURL
            });
            
            // Update local state for immediate preview
            setProfileImageUrl(downloadURL);
            
            console.log("Profile image updated successfully");
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            
        } catch (error) {
            console.error("Error uploading avatar:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
            
            // Still show local preview even if upload fails
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(croppedImageBlob);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file only.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        try {
            setIsUploadingResume(true);
            setSaveStatus("saving");
            
            if (!currentUser?.uid) {
                throw new Error("No user authenticated");
            }

            // Upload to Firebase Storage
            const storage = getStorage();
            const resumeRef = ref(storage, `resumes/${currentUser.uid}/${file.name}`);
            
            console.log("Uploading resume to Firebase Storage...");
            await uploadBytes(resumeRef, file);
            
            // Get download URL
            const downloadURL = await getDownloadURL(resumeRef);
            console.log("Resume uploaded, download URL:", downloadURL);
            
            // Update Firestore user document
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                resumeURL: downloadURL,
                resumeFileName: file.name
            });
            
            // Update local state
            setFormData(prev => ({
                ...prev,
                resume: downloadURL
            }));
            
            console.log("Resume updated successfully");
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            
        } catch (error) {
            console.error("Error uploading resume:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
            alert('Error uploading resume. Please try again.');
        } finally {
            setIsUploadingResume(false);
        }

        // Clear the input
        e.target.value = '';
    };

    const handleResumeRemove = async () => {
        if (!currentUser?.uid) return;

        try {
            setSaveStatus("saving");
            
            // Update Firestore user document
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                resumeURL: "",
                resumeFileName: ""
            });
            
            // Update local state
            setFormData(prev => ({
                ...prev,
                resume: ""
            }));
            
            console.log("Resume removed successfully");
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            
        } catch (error) {
            console.error("Error removing resume:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
            alert('Error removing resume. Please try again.');
        }
    };

    const pronounOptions = [
        "Don't specify",
        "they/them",
        "she/her",
        "he/him",
        "she/they",
        "he/they",
        "xe/xem",
        "ze/zir"
    ];

    return (
        <div className={`bg-[#0F0F0F] text-white p-3 rounded-lg max-w-md mx-auto ${className}`}>
            {/* Avatar Section */}
            <div className="flex justify-center mb-3">
                <div className="relative">
                    <button 
                        type="button"
                        className="relative w-32 h-32 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center overflow-hidden hover:opacity-80 transition-all duration-300 focus:outline-none focus:ring focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-[#0F0F0F] shadow-lg"
                        onClick={() => document.getElementById('avatar-file')?.click()}
                        aria-label="Change profile picture"
                    >
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                                <div className="text-white text-sm font-bold">
                                    {formData.displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </div>
                        )}
                        
                        {/* Overlay with camera icon - shows on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v.93a2 2 0 001.664 1.973l.06.017A1 1 0 004 8h12a1 1 0 00.276-.027l.06-.017A2 2 0 0018 5.93V5a2 2 0 00-2-2H4zm8 5a4 4 0 11-8 0 4 4 0 018 0zm-2 0a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </button>
                    
                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="avatar-file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            console.log('Avatar file input changed', file?.name);
                            if (file) {
                                handleAvatarSelect(file);
                            }
                        }}
                    />
                    
                    {/* Edit indicator icon in bottom right */}
                    <div className="absolute bottom-0 right-0 bg-[#1F1F1F] rounded-full p-1.5 border-2 border-[#0F0F0F] pointer-events-none shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Auto-save Status */}
            {saveStatus !== "idle" && (
                <div className="flex justify-center mb-2">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        saveStatus === "saving" ? "bg-white/20 text-white" :
                        saveStatus === "saved" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                    }`}>
                        {saveStatus === "saving" && (
                            <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        )}
                        {saveStatus === "saved" && (
                            <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Saved
                            </>
                        )}
                        {saveStatus === "error" && (
                            <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Error saving
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <div className="space-y-2">
                {/* Display Name */}
                <div>
                    <label className="block text-xs font-medium mb-0.5 text-white">Display Name</label>
                    <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                        placeholder="Display Name"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-xs font-medium mb-0.5 text-white">Bio</label>
                    <textarea
                        value={formData.bio}
                        onChange={handleBioChange}
                        className="w-full px-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white resize-none transition-all duration-200 min-h-[3.5rem] overflow-hidden"
                        placeholder="Tell us about yourself..."
                        style={{ height: '3.5rem' }}
                    />
                   
                </div>

                {/* Pronouns */}
                <div>
                    <label className="block text-xs font-medium mb-0.5 text-white">Pronouns</label>
                    <div className="relative">
                    <select
                        value={formData.pronouns}
                        onChange={(e) => handleInputChange('pronouns', e.target.value)}
                            className="w-full px-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white focus:outline-none focus:border-white appearance-none transition-all duration-200 pr-8 cursor-pointer hover:border-white/70"
                    >
                        {pronounOptions.map((pronoun) => (
                                <option key={pronoun} value={pronoun} className="bg-[#000000] text-white py-1">
                                {pronoun}
                            </option>
                        ))}
                    </select>
                        {/* Custom dropdown arrow */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Company */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="Company"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="Location"
                        />
                    </div>
                </div>


                {/* Portfolio Site */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            value={formData.portfolioSite}
                            onChange={(e) => handleInputChange('portfolioSite', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="Portfolio Site URL"
                        />
                    </div>
                </div>

                {/* GitHub */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            value={formData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="GitHub Profile URL"
                        />
                    </div>
                </div>

                {/* Socials */}
                <div>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 border border-white rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <input
                            type="text"
                            value={formData.socials}
                            onChange={(e) => handleInputChange('socials', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="LinkedIn Profile"
                        />
                    </div>
                </div>

                {/* Twitter/X */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <input
                            type="text"
                            value={formData.twitter || ""}
                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="Twitter/X Profile"
                        />
                    </div>
                </div>

                {/* Instagram */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <input
                            type="text"
                            value={formData.instagram || ""}
                            onChange={(e) => handleInputChange('instagram', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="Instagram Profile"
                        />
                    </div>
                </div>

                {/* YouTube */}
                <div>
                    <div className="relative">
                        <svg className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <input
                            type="text"
                            value={formData.youtube || ""}
                            onChange={(e) => handleInputChange('youtube', e.target.value)}
                            className="w-full pl-7 pr-2.5 py-1 bg-[#000000] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-200"
                            placeholder="YouTube Channel"
                        />
                    </div>
                </div>

                {/* Resume PDF */}
                <div>
                    {formData.resume ? (
                        <div className="bg-[#000000] border border-[#1a1a1a] rounded p-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-900 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-white">Resume.pdf</div>
                                        <div className="text-xs text-white/60">PDF Document</div>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => window.open(formData.resume, '_blank')}
                                        className="p-1.5 bg-white hover:bg-gray-200 text-black rounded-md transition-colors"
                                        title="View Resume"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleResumeRemove()}
                                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                                        title="Remove Resume"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : isUploadingResume ? (
                        <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg p-4 text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="text-xs font-medium text-white mb-1">Uploading resume...</div>
                            <div className="text-xs text-white/60">Please wait</div>
                        </div>
                    ) : (
                        <div 
                            className="bg-[#000000] border border-[#1a1a1a] border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-white transition-colors"
                            onClick={() => document.getElementById('resume-file')?.click()}
                        >
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="text-xs font-medium text-white mb-1">Upload your resume</div>
                            <div className="text-xs text-white/60">Click to select a PDF file</div>
                        </div>
                    )}
                    
                    <input
                        type="file"
                        id="resume-file"
                        className="hidden"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                    />
                </div>
            </div>

            {/* Image Cropper Modal */}
            <ImageCropper
                isOpen={cropperOpen}
                imageFile={selectedImageFile}
                onClose={() => {
                    setCropperOpen(false);
                    setSelectedImageFile(null);
                }}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default ProfileCard;