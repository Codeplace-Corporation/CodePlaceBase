import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faEllipsisVertical,
    faArrowRight,
    faPaperclip,
    faTimes,
    faCheck,
    faCheckDouble,
    faUser,
    faPlus
} from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, where, getDocs, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebase';
import StyledButton from "../../components/styled/StyledButton";
import { StyledInput, StyledInputArea } from "../../components/styled/StyledInput";
import ProfilePlaceholder from "../../assets/profile_placeholder.png";

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

interface Message {
    id: string;
    text: string;
    uid: string;
    photoURL: string;
    createdAt: any;
    fileURL?: string;
    fileName?: string;
    read: boolean;
}

interface Conversation {
    id: string;
    userIds: string[];
    displayName: { [key: string]: string };
    email: { [key: string]: string };
    photoURL: string;
    lastMessage?: Message;
    messages?: Message[];
}

const Messages = () => {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [formValue, setFormValue] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth state listener
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    // Fetch conversations
    useEffect(() => {
        if (!user) return;

        const conversationsRef = collection(firestore, 'conversations');
        const q = query(conversationsRef, where('userIds', 'array-contains', user.uid));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const conversationsList: Conversation[] = [];
            
            for (const docSnapshot of snapshot.docs) {
                const messagesRef = collection(firestore, 'conversations', docSnapshot.id, 'messages');
                const messagesSnapshot = await getDocs(messagesRef);
                const messages = messagesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Message[];
                const lastMessage = messages[messages.length - 1];
                
                conversationsList.push({
                    id: docSnapshot.id,
                    messages,
                    lastMessage,
                    ...docSnapshot.data(),
                } as Conversation);
            }
            
            conversationsList.sort((a, b) => {
                const aTime = a.lastMessage?.createdAt?.seconds ?? 0;
                const bTime = b.lastMessage?.createdAt?.seconds ?? 0;
                return bTime - aTime;
            });
            
            setConversations(conversationsList);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedConversation) return;

        const messagesRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                if (data.read === undefined) {
                    data.read = false;
                }
                return { ...data, id: doc.id } as Message;
            });
            
            setMessages(messages);
            setTimeout(scrollToBottom, 0);
            await markMessagesAsRead(selectedConversation.id, messages);
        });

        return () => unsubscribe();
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';

        const date = new Date(timestamp.seconds * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formValue.trim() && !file) return;

        const { uid, photoURL } = auth.currentUser!;
        const conversationRef = doc(firestore, 'conversations', selectedConversation!.id);

        let fileURL = null;
        let fileName = null;

        if (file) {
            const fileRef = ref(storage, `conversations/${selectedConversation!.id}/${file.name}`);
            await uploadBytes(fileRef, file);
            fileURL = await getDownloadURL(fileRef);
            fileName = file.name;
        }

        const newMessage = {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL,
            fileURL,
            fileName,
            read: false
        };

        await addDoc(collection(conversationRef, 'messages'), newMessage);
        await updateDoc(conversationRef, { lastMessage: newMessage });

        setFormValue('');
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        scrollToBottom();
    };

    const markMessagesAsRead = async (conversationId: string, messages: Message[]) => {
        const unreadMessages = messages.filter(msg => !msg.read && msg.uid !== auth.currentUser!.uid);

        if (unreadMessages.length > 0) {
            const batch = writeBatch(firestore);
            unreadMessages.forEach(msg => {
                const msgRef = doc(firestore, 'conversations', conversationId, 'messages', msg.id);
                batch.update(msgRef, { read: true });
            });
            await batch.commit();
        }
    };

    const createConversation = async (username: string) => {
        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('displayName', '==', username));
            const userSnapshot = await getDocs(q);

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const newUser = { 
                    ...userData, 
                    uid: userSnapshot.docs[0].id,
                    displayName: userData.displayName || 'Unknown User',
                    email: userData.email || '',
                    photoURL: userData.photoURL || ProfilePlaceholder
                };

                const currentUser = auth.currentUser!;
                const conversationId = [currentUser.uid, newUser.uid].sort().join('_');
                const conversationRef = doc(firestore, 'conversations', conversationId);
                
                await setDoc(conversationRef, {
                    userIds: [currentUser.uid, newUser.uid],
                    displayName: {
                        [currentUser.uid]: currentUser.displayName,
                        [newUser.uid]: newUser.displayName,
                    },
                    email: {
                        [currentUser.uid]: currentUser.email,
                        [newUser.uid]: newUser.email,
                    },
                    photoURL: newUser.photoURL,
                });

                setSelectedConversation({ 
                    id: conversationId, 
                    userIds: [currentUser.uid, newUser.uid], 
                    displayName: newUser.displayName, 
                    photoURL: newUser.photoURL 
                } as Conversation);
            } else {
                alert('User not found');
            }
        } catch (error) {
            console.error("Error creating conversation: ", error);
        }
    };

    const deleteConversation = async (conversationId: string) => {
        await deleteDoc(doc(firestore, 'conversations', conversationId));
        if (selectedConversation?.id === conversationId) {
            setSelectedConversation(null);
        }
        setMenuOpen(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const filteredConversations = conversations.filter(conversation => {
        const otherUser = conversation.userIds.find(id => id !== user?.uid);
        const otherUserName = conversation.displayName?.[otherUser!] || conversation.email?.[otherUser!] || "Unknown User";
        return otherUserName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const MessageBubble = ({ message }: { message: Message }) => {
        const isOwnMessage = message.uid === user?.uid;
        const messageClass = isOwnMessage ? 'sent' : 'received';

        return (
            <div className={`flex items-start gap-3 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                    <img 
                        src={message.photoURL || ProfilePlaceholder} 
                        alt="profile" 
                        className="w-8 h-8 rounded-full"
                    />
                )}
                
                                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-first' : ''}`}>
                        <div className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage 
                                ? 'bg-white/20 text-white rounded-br-md' 
                                : 'bg-card-light text-white rounded-bl-md'
                        }`}>
                        <p className="text-sm break-words">{message.text}</p>
                        {message.fileURL && (
                            <a 
                                href={message.fileURL} 
                                download={message.fileName}
                                className="text-xs underline block mt-1"
                            >
                                📎 {message.fileName}
                            </a>
                        )}
                    </div>
                    <div className={`text-xs text-white/50 mt-1 flex items-center gap-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}>
                        {formatDate(message.createdAt)}
                        {isOwnMessage && (
                            <FontAwesomeIcon 
                                icon={message.read ? faCheckDouble : faCheck} 
                                className={message.read ? 'text-blue-400' : 'text-white/30'}
                                size="xs"
                            />
                        )}
                    </div>
                </div>
                
                {isOwnMessage && (
                    <img 
                        src={message.photoURL || ProfilePlaceholder} 
                        alt="profile" 
                        className="w-8 h-8 rounded-full"
                    />
                )}
            </div>
        );
    };

    const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
        const otherUser = conversation.userIds.find(id => id !== user?.uid);
        const otherUserName = conversation.displayName?.[otherUser!] || conversation.email?.[otherUser!] || "Unknown User";
        const unreadCount = conversation.messages?.filter(msg => !msg.read && msg.uid !== user?.uid).length || 0;
        const isSelected = conversation.id === selectedConversation?.id;

        return (
            <div
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    isSelected 
                        ? 'bg-white/10 border-l-2 border-white/30' 
                        : 'hover:bg-card-light'
                }`}
                onClick={() => setSelectedConversation(conversation)}
            >
                <div className="relative">
                    <img 
                        src={conversation.photoURL || ProfilePlaceholder} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full"
                    />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white truncate">{otherUserName}</h4>
                        <span className="text-xs text-white/50">
                            {conversation.lastMessage ? formatDate(conversation.lastMessage.createdAt) : ''}
                        </span>
                    </div>
                    <p className="text-sm text-white/70 truncate">
                        {conversation.lastMessage ? conversation.lastMessage.text : 'No messages yet'}
                    </p>
                </div>
                
                <button
                    className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10"
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === conversation.id ? null : conversation.id);
                    }}
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
                </button>
                
                {menuOpen === conversation.id && (
                    <div className="absolute right-0 top-12 bg-card-dark border border-white/20 rounded-lg shadow-lg z-10">
                        <button 
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                            onClick={() => alert('Mute conversation')}
                        >
                            Mute conversation
                        </button>
                        <button 
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                            }}
                        >
                            Delete conversation
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const NewConversationPopup = () => {
        const [username, setUsername] = useState('');
        const [suggestions, setSuggestions] = useState<any[]>([]);
        const [errorMessage, setErrorMessage] = useState('');

        const fetchUsers = async (search: string) => {
            try {
                const usersRef = collection(firestore, 'users');
                const q = query(usersRef, where('displayName', '>=', search), where('displayName', '<=', search + '\uf8ff'));
                const userSnapshot = await getDocs(q);

                if (!userSnapshot.empty) {
                    const usersList = userSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return { 
                            ...data, 
                            uid: doc.id,
                            displayName: data.displayName || 'Unknown User',
                            email: data.email || '',
                            photoURL: data.photoURL || ProfilePlaceholder
                        };
                    });
                    setSuggestions(usersList);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const search = e.target.value.toLowerCase();
            setUsername(search);
            setErrorMessage('');
            if (search) {
                fetchUsers(search);
            } else {
                setSuggestions([]);
            }
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (username === auth.currentUser!.displayName?.toLowerCase()) {
                setErrorMessage('You cannot create a conversation with yourself.');
                return;
            }
            await createConversation(username);
            setIsPopupOpen(false);
        };

        const handleSuggestionClick = (suggestion: any) => {
            setUsername(suggestion.displayName);
            setSuggestions([]);
        };

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card-dark border border-white/20 rounded-lg p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-medium text-white">Start New Conversation</h2>
                        <button 
                            onClick={() => setIsPopupOpen(false)}
                            className="text-white/50 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <StyledInput
                                type="text"
                                value={username}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                        required
                                className="w-full"
                            />
                        </div>
                        
                        {errorMessage && (
                            <p className="text-red-400 text-sm">{errorMessage}</p>
                        )}
                        
                        {suggestions.length > 0 && (
                            <div className="bg-card-light rounded-lg max-h-32 overflow-y-auto">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion.uid}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                    >
                                        {suggestion.displayName}
                    </button>
                                ))}
                            </div>
                        )}
                        
                        {username && suggestions.length === 0 && (
                            <div className="text-white/50 text-sm">No results</div>
                        )}
                        
                        <div className="flex gap-2">
                            <StyledButton
                                type="submit"
                                variant="outline"
                                className="flex-1"
                            >
                                Create
                            </StyledButton>
                            <StyledButton
                                type="button"
                                variant="outline"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                Cancel
                            </StyledButton>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-medium mb-4">Sign in to access messages</h2>
                                            <StyledButton variant="outline" size="large">
                        Sign In
                    </StyledButton>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-profile h-screen bg-black overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="flex flex-col bg-card-dark border-r border-white/10 h-full">
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <StyledInput
                            type="text"
                            placeholder="Search conversations"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 mr-2"
                        />
                        <StyledButton
                            size="small"
                            variant="outline"
                            onClick={() => setIsPopupOpen(true)}
                            className="rounded-full w-10 h-10 p-0"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </StyledButton>
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-white/50">
                            <FontAwesomeIcon icon={faUser} className="text-4xl mb-2" />
                            <p>No conversations yet</p>
                            <p className="text-sm">Start a new conversation to begin messaging</p>
                        </div>
                    ) : (
                        filteredConversations.map(conversation => (
                            <ConversationItem key={conversation.id} conversation={conversation} />
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col bg-card h-full">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex-shrink-0 bg-card-dark p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={selectedConversation.photoURL || ProfilePlaceholder} 
                                    alt="Profile" 
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-medium text-white">
                                        {selectedConversation.userIds.find(id => id !== user.uid) 
                                            ? selectedConversation.displayName?.[selectedConversation.userIds.find(id => id !== user.uid)!]
                                            : "Unknown User"
                                        }
                                    </h3>
                                    <p className="text-sm text-white/50">Active now</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-white/50 mt-8">
                                    <p>No messages yet</p>
                                    <p className="text-sm">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <MessageBubble key={message.id} message={message} />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="flex-shrink-0 p-4 border-t border-white/10">
                            <form onSubmit={sendMessage} className="flex items-end gap-3">
                                <div className="flex-1">
                                    {file && (
                                        <div className="mb-2 p-2 bg-card-light rounded-lg flex items-center justify-between">
                                            <span className="text-sm text-white truncate">📎 {file.name}</span>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-white/50 hover:text-white"
                                            >
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    )}
                                    <StyledInputArea
                                        value={formValue}
                                        onChange={(e) => setFormValue(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full resize-none"
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                    <label className="cursor-pointer text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <FontAwesomeIcon icon={faPaperclip} />
                                    </label>
                                    
                                    <StyledButton
                                        type="submit"
                                        variant="outline"
                                        disabled={!formValue.trim() && !file}
                                        className="rounded-full w-10 h-10 p-0"
                                    >
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </StyledButton>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-white/50">
                            <FontAwesomeIcon icon={faUser} className="text-6xl mb-4" />
                            <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                            <p>Choose a conversation from the sidebar to start messaging</p>
                </div>
                </div>
                )}
            </div>

            {/* New Conversation Popup */}
            {isPopupOpen && <NewConversationPopup />}
        </div>
    );
};

export default Messages;
