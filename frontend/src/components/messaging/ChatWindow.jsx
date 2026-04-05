import { useState, useEffect, useRef, useCallback } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { MessageSquare, Pin, Pencil, Star } from 'lucide-react';
import MessageContextMenu from './MessageContextMenu';
import MemberAvatar from './MemberAvatar';
import api from '../../utils/api';

const ChatWindow = ({
    messages,
    currentUser,
    typingUser,
    conversationTitle,
    onReplyMessage,
    onEditMessage,
    onMessagesUpdate
}) => {
    const messagesEndRef = useRef(null);
    const longPressTimer = useRef(null);

    // Context menu state
    const [contextMenu, setContextMenu] = useState({
        isOpen: false,
        position: { x: 0, y: 0 },
        message: null
    });

    // Edit mode state
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState('');

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Format message time
    const formatTime = (date) => {
        return format(new Date(date), 'HH:mm');
    };

    // Format date separator
    const formatDateSeparator = (date) => {
        const d = new Date(date);
        if (isToday(d)) return 'Today';
        if (isYesterday(d)) return 'Yesterday';
        return format(d, 'EEEE, MMMM d');
    };

    // Check if date separator is needed
    const needsDateSeparator = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;
        return !isSameDay(new Date(currentMsg.createdAt), new Date(prevMsg.createdAt));
    };

    // Handle context menu
    const handleContextMenu = useCallback((e, message) => {
        e.preventDefault();
        setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            message
        });
    }, []);

    // Handle long press for mobile
    const handleTouchStart = useCallback((message) => {
        longPressTimer.current = setTimeout(() => {
            setContextMenu({
                isOpen: true,
                position: { x: window.innerWidth / 2 - 90, y: window.innerHeight / 2 - 150 },
                message
            });
        }, 500);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    }, []);

    // Close context menu
    const closeContextMenu = useCallback(() => {
        setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, message: null });
    }, []);

    // Message Actions
    const handleReply = useCallback((message) => {
        onReplyMessage?.(message);
    }, [onReplyMessage]);

    const handleCopy = useCallback(async (message) => {
        try {
            await navigator.clipboard.writeText(message.text);
            // Could show a toast here
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    }, []);

    const handleForward = useCallback((message) => {
        // For now, just log - would need a ForwardModal
        console.log('Forward message:', message._id);
    }, []);

    const handlePin = useCallback(async (message) => {
        try {
            const { data } = await api.post(`/messages/${message._id}/pin`);
            if (data.success) {
                onMessagesUpdate?.(data.data);
            }
        } catch (error) {
            console.error('Failed to pin message:', error);
        }
    }, [onMessagesUpdate]);

    const handleStar = useCallback(async (message) => {
        try {
            const { data } = await api.post(`/messages/${message._id}/star`);
            if (data.success) {
                onMessagesUpdate?.(data.data);
            }
        } catch (error) {
            console.error('Failed to star message:', error);
        }
    }, [onMessagesUpdate]);

    const handleEdit = useCallback((message) => {
        setEditingMessage(message._id);
        setEditText(message.text);
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingMessage || !editText.trim()) return;

        try {
            const { data } = await api.put(`/messages/${editingMessage}/edit`, {
                text: editText.trim()
            });
            if (data.success) {
                onMessagesUpdate?.(data.data);
                setEditingMessage(null);
                setEditText('');
            }
        } catch (error) {
            console.error('Failed to edit message:', error);
        }
    }, [editingMessage, editText, onMessagesUpdate]);

    const handleCancelEdit = useCallback(() => {
        setEditingMessage(null);
        setEditText('');
    }, []);

    const handleSelect = useCallback((message) => {
        // For now, just log - would need multi-select mode
        console.log('Select message:', message._id);
    }, []);

    const handleDelete = useCallback(async (message) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const { data } = await api.delete(`/messages/${message._id}`);
            if (data.success) {
                onMessagesUpdate?.({ _id: message._id, isDeleted: true });
            }
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert(error.response?.data?.message || 'Failed to delete message');
        }
    }, [onMessagesUpdate]);

    const handleInfo = useCallback((message) => {
        // Could show a MessageInfoModal
        console.log('Message info:', message);
    }, []);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center mb-4 shadow-lg shadow-background/50">
                    <MessageSquare size={40} className="text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-main mb-2">
                    {conversationTitle ? `Chat with ${conversationTitle}` : 'Start the conversation'}
                </h3>
                <p className="text-text-muted text-sm max-w-sm">
                    Send a message to begin the conversation
                </p>
            </div>
        );
    }

    // Get pinned messages
    const pinnedMessages = messages.filter(m => m.isPinned);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Pinned Messages Bar */}
            {pinnedMessages.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2 bg-primary-500/10 border-b border-primary-500/20">
                    <div className="flex items-center gap-2 text-sm">
                        <Pin size={14} className="text-primary-400" />
                        <span className="text-primary-400 font-medium">
                            Pinned: {pinnedMessages[pinnedMessages.length - 1]?.text?.substring(0, 50)}
                            {pinnedMessages[pinnedMessages.length - 1]?.text?.length > 50 ? '...' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const isMine = message.senderId?._id === currentUser?._id || message.senderId === currentUser?._id;
                    const showDateSeparator = needsDateSeparator(message, prevMessage);
                    const sender = message.senderId;
                    const isEditing = editingMessage === message._id;
                    const isStarred = message.isStarredBy?.includes(currentUser?._id);

                    return (
                        <div key={message._id}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="flex items-center justify-center my-6">
                                    <div className="flex-1 h-px bg-border/50"></div>
                                    <div className="px-4 py-1.5 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-full mx-4">
                                        <span className="text-xs text-text-muted font-medium">
                                            {formatDateSeparator(message.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex-1 h-px bg-border/50"></div>
                                </div>
                            )}

                            {/* Message */}
                            <div
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                onContextMenu={(e) => handleContextMenu(e, message)}
                                onTouchStart={() => handleTouchStart(message)}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className={`flex items-end gap-3 max-w-[70%] ${isMine ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar for other users */}
                                    {!isMine && (
                                        <MemberAvatar
                                            name={sender?.name}
                                            role={sender?.role}
                                            size="sm"
                                            showOnline={false}
                                        />
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`
                                        relative group px-4 py-3 rounded-2xl shadow-sm cursor-pointer select-none
                                        ${isMine
                                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm shadow-primary-500/20'
                                            : 'bg-surface/80 backdrop-blur-sm border border-border/50 text-text-main rounded-bl-sm shadow-sm'
                                        }
                                        ${message.isPinned ? 'ring-2 ring-primary-400/50' : ''}
                                    `}>
                                        {/* Pin indicator */}
                                        {message.isPinned && (
                                            <Pin size={12} className="absolute -top-1 -right-1 text-primary-400 bg-background rounded-full p-0.5" />
                                        )}

                                        {/* Star indicator */}
                                        {isStarred && (
                                            <Star size={12} className="absolute -top-1 -left-1 text-yellow-400 fill-yellow-400 bg-background rounded-full p-0.5" />
                                        )}

                                        {/* Sender name */}
                                        {!isMine && sender?.name && (
                                            <p className="text-xs text-primary-400 font-semibold mb-1">
                                                {sender.name}
                                            </p>
                                        )}

                                        {/* Reply preview */}
                                        {message.replyTo && (
                                            <div className="mb-2 pl-2 border-l-2 border-primary-400/50 bg-background/30 rounded p-1">
                                                <p className="text-xs text-text-muted">
                                                    {message.replyTo.senderId?.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-text-muted/80 truncate">
                                                    {message.replyTo.text}
                                                </p>
                                            </div>
                                        )}

                                        {/* Message text or edit mode */}
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full px-2 py-1 bg-dark-900/50 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit();
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                />
                                                <div className="flex gap-2 text-xs">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="px-2 py-1 bg-primary-500 rounded hover:bg-primary-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2 py-1 bg-dark-600 rounded hover:bg-dark-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                                                {message.text}
                                            </p>
                                        )}

                                        {/* Timestamp + edited indicator */}
                                        <div className={`flex items-center gap-1 mt-1.5 ${isMine ? 'text-white/60' : 'text-text-muted'} justify-end`}>
                                            {message.isEdited && (
                                                <span className="text-xs flex items-center gap-0.5">
                                                    <Pencil size={10} />
                                                    edited
                                                </span>
                                            )}
                                            <span className="text-xs">
                                                {formatTime(message.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {typingUser && (
                    <div className="flex justify-start">
                        <div className="flex items-end gap-3">
                            <MemberAvatar
                                name={typingUser.name}
                                role={typingUser.role}
                                size="sm"
                                showOnline={false}
                            />
                            <div className="flex items-center gap-2 px-4 py-3 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-bl-sm">
                                <span className="text-sm text-text-muted">{typingUser.name} is typing</span>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            <MessageContextMenu
                isOpen={contextMenu.isOpen}
                position={contextMenu.position}
                message={contextMenu.message}
                currentUser={currentUser}
                onClose={closeContextMenu}
                onReply={handleReply}
                onCopy={handleCopy}
                onForward={handleForward}
                onPin={handlePin}
                onStar={handleStar}
                onEdit={handleEdit}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onInfo={handleInfo}
            />
        </div>
    );
};

export default ChatWindow;
