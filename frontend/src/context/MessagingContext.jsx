import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const MessagingContext = createContext();

export const useMessaging = () => useContext(MessagingContext);

const SOCKET_URL = 'http://localhost:5000';

export const MessagingProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagingSettings, setMessagingSettings] = useState({ onlyAdminCanMessage: false });
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});

    // Roles that can create new conversations (strict enforcement)
    const CONVERSATION_CREATOR_ROLES = ['Super Admin', 'Project Admin'];

    // Admin roles for messaging features
    const MESSAGING_ADMIN_ROLES = ['Super Admin', 'Project Admin'];

    // Check if current user can start new chats - STRICT ROLE CHECK
    // Only Admin and Project Manager can create conversations
    const canStartChat = useCallback(() => {
        if (!user) return false;
        return CONVERSATION_CREATOR_ROLES.includes(user.role);
    }, [user]);

    // Check if user can send messages in current conversation
    const canSendMessage = useCallback(() => {
        if (!user || !currentConversation) return false;
        // If admin-only message is enabled for this conversation
        if (currentConversation.adminOnlyMessage) {
            return MESSAGING_ADMIN_ROLES.includes(user.role);
        }
        return true;
    }, [user, currentConversation]);

    // Check if user is admin
    const isAdmin = useCallback(() => {
        return user && MESSAGING_ADMIN_ROLES.includes(user.role);
    }, [user]);

    // Initialize socket connection
    useEffect(() => {
        if (isAuthenticated && user) {
            const newSocket = io(SOCKET_URL, {
                withCredentials: true
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [isAuthenticated, user]);

    // Listen for new messages
    useEffect(() => {
        if (socket) {
            socket.on('newMessage', (message) => {
                // Add message to current conversation if it matches
                if (currentConversation && message.conversationId === currentConversation._id) {
                    setMessages(prev => [...prev, message]);
                }

                // Update conversation list
                setConversations(prev =>
                    prev.map(conv =>
                        conv._id === message.conversationId
                            ? {
                                ...conv,
                                lastMessage: message,
                                lastActivityAt: new Date(),
                                unreadCount: currentConversation?._id === conv._id ? conv.unreadCount : (conv.unreadCount || 0) + 1
                            }
                            : conv
                    ).sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))
                );
            });

            socket.on('userTyping', ({ conversationId, user: typingUser }) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [conversationId]: typingUser
                }));
            });

            socket.on('userStoppedTyping', ({ conversationId }) => {
                setTypingUsers(prev => {
                    const updated = { ...prev };
                    delete updated[conversationId];
                    return updated;
                });
            });

            // Message action events
            socket.on('messageEdited', ({ message }) => {
                setMessages(prev => prev.map(m =>
                    m._id === message._id ? message : m
                ));
            });

            socket.on('messageDeleted', ({ messageId }) => {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            });

            socket.on('messagePinned', ({ message }) => {
                setMessages(prev => prev.map(m =>
                    m._id === message._id ? message : m
                ));
            });

            socket.on('messageStarred', ({ message }) => {
                setMessages(prev => prev.map(m =>
                    m._id === message._id ? message : m
                ));
            });

            return () => {
                socket.off('newMessage');
                socket.off('userTyping');
                socket.off('userStoppedTyping');
                socket.off('messageEdited');
                socket.off('messageDeleted');
                socket.off('messagePinned');
                socket.off('messageStarred');
            };
        }
    }, [socket, currentConversation]);

    // Fetch messaging settings
    const fetchMessagingSettings = useCallback(async () => {
        try {
            const { data } = await api.get('/settings/messaging');
            if (data.success) {
                setMessagingSettings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messaging settings:', error);
        }
    }, []);

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/messages/conversations');
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async (conversationId) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/messages/${conversationId}`);
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Join conversation room
    const joinConversation = useCallback((conversation) => {
        setCurrentConversation(conversation);
        fetchMessages(conversation._id);

        if (socket) {
            socket.emit('joinConversation', conversation._id);
        }

        // Reset unread count
        setConversations(prev =>
            prev.map(conv =>
                conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
            )
        );
    }, [socket, fetchMessages]);

    // Leave conversation room
    const leaveConversation = useCallback(() => {
        if (socket && currentConversation) {
            socket.emit('leaveConversation', currentConversation._id);
        }
        setCurrentConversation(null);
        setMessages([]);
    }, [socket, currentConversation]);

    // Start a new conversation
    const startConversation = useCallback(async (participantIds, title = null) => {
        try {
            const { data } = await api.post('/messages/start', {
                participantIds,
                title
            });

            if (data.success) {
                // Add to conversations if new
                if (!conversations.find(c => c._id === data.data._id)) {
                    setConversations(prev => [data.data, ...prev]);
                }
                return data.data;
            }
        } catch (error) {
            console.error('Failed to start conversation:', error);
            throw error;
        }
    }, [conversations]);

    // Send a message
    const sendMessage = useCallback(async (text) => {
        if (!currentConversation) return;

        try {
            const { data } = await api.post('/messages/send', {
                conversationId: currentConversation._id,
                text
            });

            if (data.success) {
                // Add to local messages
                setMessages(prev => [...prev, data.data]);

                // Update conversation list
                setConversations(prev =>
                    prev.map(conv =>
                        conv._id === currentConversation._id
                            ? { ...conv, lastMessage: data.data, lastActivityAt: new Date() }
                            : conv
                    ).sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt))
                );

                // Emit to socket
                if (socket) {
                    socket.emit('sendMessage', {
                        conversationId: currentConversation._id,
                        message: data.data
                    });
                }

                return data.data;
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, [currentConversation, socket]);

    // Update messaging settings (admin only)
    const updateMessagingSettings = useCallback(async (onlyAdminCanMessage) => {
        try {
            const { data } = await api.put('/settings/messaging', {
                onlyAdminCanMessage
            });

            if (data.success) {
                setMessagingSettings(data.data);
                return true;
            }
        } catch (error) {
            console.error('Failed to update messaging settings:', error);
            throw error;
        }
    }, []);

    // Update a conversation (after settings change)
    const updateConversation = useCallback((updatedConversation) => {
        // Update in conversations list
        setConversations(prev =>
            prev.map(conv =>
                conv._id === updatedConversation._id ? updatedConversation : conv
            )
        );

        // Update current conversation if it's the same
        if (currentConversation && currentConversation._id === updatedConversation._id) {
            setCurrentConversation(updatedConversation);
        }
    }, [currentConversation]);

    // Remove a conversation (after deletion)
    const removeConversation = useCallback((conversationId) => {
        // Remove from conversations list
        setConversations(prev => prev.filter(conv => conv._id !== conversationId));

        // Clear current conversation if it's the deleted one
        if (currentConversation && currentConversation._id === conversationId) {
            setCurrentConversation(null);
            setMessages([]);
        }
    }, [currentConversation]);

    // Send typing indicator
    const sendTyping = useCallback(() => {
        if (socket && currentConversation && user) {
            socket.emit('typing', {
                conversationId: currentConversation._id,
                user: { _id: user._id, name: user.name }
            });
        }
    }, [socket, currentConversation, user]);

    // Stop typing indicator
    const stopTyping = useCallback(() => {
        if (socket && currentConversation && user) {
            socket.emit('stopTyping', {
                conversationId: currentConversation._id,
                user: { _id: user._id, name: user.name }
            });
        }
    }, [socket, currentConversation, user]);

    // Load settings and conversations on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchMessagingSettings();
            fetchConversations();
        }
    }, [isAuthenticated, fetchMessagingSettings, fetchConversations]);

    return (
        <MessagingContext.Provider value={{
            socket,
            conversations,
            currentConversation,
            messages,
            messagingSettings,
            loading,
            typingUsers,
            canStartChat,
            canSendMessage,
            isAdmin,
            fetchConversations,
            fetchMessages,
            joinConversation,
            leaveConversation,
            startConversation,
            sendMessage,
            updateMessagingSettings,
            updateConversation,
            removeConversation,
            sendTyping,
            stopTyping
        }}>
            {children}
        </MessagingContext.Provider>
    );
};
