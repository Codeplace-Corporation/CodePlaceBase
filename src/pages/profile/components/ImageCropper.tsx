import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
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
        
        // Use container's actual dimensions (400px height)
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
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
        
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle wheel zoom
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
            
            setPosition(prev => ({
                x: mouseX - (mouseX - prev.x) * scaleRatio,
                y: mouseY - (mouseY - prev.y) * scaleRatio
            }));
            
            setScale(newScale);
        }
    }, [scale, imageSize, CIRCLE_SIZE]);

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
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        } else if (e.touches.length === 2 && touchData.initialDistance > 0) {
            const distance = getTouchDistance(e.touches);
            const scaleRatio = distance / touchData.initialDistance;
            const minScale = CIRCLE_SIZE / Math.min(imageSize.width, imageSize.height);
            const maxScale = minScale * 3;
            const newScale = Math.max(minScale, Math.min(maxScale, touchData.initialScale * scaleRatio));
            
            setScale(newScale);
        }
    }, [isDragging, dragStart, touchData, imageSize, CIRCLE_SIZE]);

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
                <div className="flex-1 relative overflow-hidden bg-gray-900" style={{ height: '400px' }}>
                    {imageSrc && (
                        <div
                            ref={containerRef}
                            className="w-full h-full relative cursor-move bg-gray-800"
                            onWheel={handleWheel}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Crop preview"
                                className="absolute origin-top-left select-none"
                                onLoad={handleImageLoad}
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    touchAction: 'none',
                                    zIndex: 1,
                                    maxWidth: 'none',
                                    maxHeight: 'none'
                                }}
                                draggable={false}
                            />
                            
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
                                        <svg width="100%" height="100%" className="absolute inset-0">
                                            <defs>
                                                <mask id="cropMask">
                                                    <rect width="100%" height="100%" fill="white" />
                                                    <circle 
                                                        cx="50%" 
                                                        cy="50%" 
                                                        r={CIRCLE_SIZE / 2} 
                                                        fill="black" 
                                                    />
                                                </mask>
                                            </defs>
                                            <rect 
                                                width="100%" 
                                                height="100%" 
                                                fill="rgba(0, 0, 0, 0.7)" 
                                                mask="url(#cropMask)" 
                                            />
                                        </svg>
                                        
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
    resume?: string;
}

const ProfileCard = ({ className = "" }: ProfileCardProps) => {
    const { currentUser } = useAuth();
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    
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
                    resume: data.resume
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
                        resume: userData.resume || ""
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
        
        // Auto-save after user stops typing
        autoSave(newFormData);
    };

    const handleAvatarSelect = (file: File) => {
        console.log('ProfileCard: Avatar selected', file.name, file.size);
        setSelectedImageFile(file);
        setCropperOpen(true);
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        try {
            // Convert blob to data URL for immediate preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(croppedImageBlob);

            // Here you would typically upload to Firebase Storage
            // const storage = getStorage();
            // const avatarRef = ref(storage, `avatars/${currentUser?.uid}`);
            // await uploadBytes(avatarRef, croppedImageBlob);
            // const downloadURL = await getDownloadURL(avatarRef);
            // setProfileImageUrl(downloadURL);

            console.log("Cropped image ready for upload:", croppedImageBlob);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
            console.error("Error processing avatar:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
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
        <div className={`bg-gray-900 text-white p-6 rounded-lg max-w-md mx-auto ${className}`}>
            {/* Avatar Section */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <button 
                        type="button"
                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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
                            <div className="w-full h-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded transform rotate-45"></div>
                                <div className="w-4 h-12 bg-white absolute"></div>
                                <div className="w-12 h-4 bg-white absolute"></div>
                            </div>
                        )}
                        
                        {/* Overlay with camera icon - shows on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                    <div className="absolute bottom-0 right-0 bg-gray-700 rounded-full p-2 border-2 border-gray-900 pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Auto-save Status */}
            {saveStatus !== "idle" && (
                <div className="flex justify-center mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                        saveStatus === "saving" ? "bg-blue-500/20 text-blue-400" :
                        saveStatus === "saved" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                    }`}>
                        {saveStatus === "saving" && (
                            <>
                                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
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
            <div className="space-y-4">
                {/* Display Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Display Name"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        You can @mention other users and organizations to link to them.
                    </p>
                </div>

                {/* Pronouns */}
                <div>
                    <label className="block text-sm font-medium mb-1">Pronouns</label>
                    <select
                        value={formData.pronouns}
                        onChange={(e) => handleInputChange('pronouns', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                        {pronounOptions.map((pronoun) => (
                            <option key={pronoun} value={pronoun}>
                                {pronoun}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Company */}
                <div>
                    <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Company</span>
                    </div>
                    <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Company"
                    />
                </div>

                {/* Location */}
                <div>
                    <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Location</span>
                    </div>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Location"
                    />
                </div>

                {/* Display local time */}
                <div>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="checkbox"
                            id="displayLocalTime"
                            checked={formData.displayLocalTime}
                            onChange={(e) => handleInputChange('displayLocalTime', e.target.checked)}
                            className="mr-2 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="displayLocalTime" className="text-sm text-gray-300">
                            Display current local time
                        </label>
                    </div>
                </div>

                {/* Portfolio Site */}
                <div>
                    <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Portfolio Site</span>
                    </div>
                    <input
                        type="text"
                        value={formData.portfolioSite}
                        onChange={(e) => handleInputChange('portfolioSite', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Portfolio Site URL"
                    />
                </div>

                {/* GitHub */}
                <div>
                    <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">GitHub</span>
                    </div>
                    <input
                        type="text"
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="GitHub Profile URL"
                    />
                </div>

                {/* Resume PDF */}
                <div>
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-300">Resume (PDF)</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                                onClick={() => document.getElementById('resume-file')?.click()}
                            >
                                Upload PDF
                            </button>
                            <span className="text-xs text-gray-400 self-center">or</span>
                        </div>
                        <input
                            type="file"
                            id="resume-file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Handle file upload here - you'd typically upload to Firebase Storage
                                    console.log("Resume file selected:", file.name);
                                    handleInputChange('resume', `Uploaded: ${file.name}`);
                                }
                            }}
                        />
                        <input
                            type="text"
                            value={formData.resume}
                            onChange={(e) => handleInputChange('resume', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Resume PDF Link"
                        />
                    </div>
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