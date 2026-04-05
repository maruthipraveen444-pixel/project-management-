import { useState, useEffect } from 'react';
import { MessageSquare, Plus, ArrowLeft, Settings, Loader2, Lock, Shield } from 'lucide-react';
import { useMessaging } from '../context/MessagingContext';
import { useAuth } from '../context/AuthContext';
import ConversationList from '../components/messaging/ConversationList';
import ChatWindow from '../components/messaging/ChatWindow';
import MessageInput from '../components/messaging/MessageInput';
import NewChatModal from '../components/messaging/NewChatModal';
import ChatSettingsModal from '../components/messaging/ChatSettingsModal';
import MemberAvatar from '../components/messaging/MemberAvatar';

const Messages = () => {
    const { user } = useAuth();
    const {
        conversations,
        currentConversation,
        messages,
        messagingSettings,
        loading,
        typingUsers,
        canStartChat,
        canSendMessage,
        joinConversation,
        leaveConversation,
        startConversation,
        sendMessage,
        sendTyping,
        stopTyping,
        updateConversation,
        removeConversation
    } = useMessaging();

    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get conversation title for header
    const getConversationTitle = () => {
        if (!currentConversation) return '';

        if (currentConversation.title) return currentConversation.title;

        const others = currentConversation.participants?.filter(
            p => p._id !== user?._id
        ) || [];

        if (others.length === 1) {
            return others[0]?.name || 'Unknown';
        }

        return others.map(p => p.name?.split(' ')[0]).join(', ');
    };

    // Get other participant's role for header
    const getOtherParticipantRole = () => {
        if (!currentConversation) return '';

        const others = currentConversation.participants?.filter(
            p => p._id !== user?._id
        ) || [];

        if (others.length === 1) {
            return others[0]?.role || '';
        }

        return `${others.length + 1} members`;
    };

    // Handle starting a new chat
    const handleStartChat = async (participantIds) => {
        const conversation = await startConversation(participantIds);
        if (conversation) {
            joinConversation(conversation);
        }
    };

    // Handle sending a message
    const handleSendMessage = async (text) => {
        await sendMessage(text);
    };

    // Handle selecting a conversation
    const handleSelectConversation = (conversation) => {
        joinConversation(conversation);
    };

    // Handle going back (mobile)
    const handleBack = () => {
        leaveConversation();
    };

    // Handle conversation update from settings modal
    const handleConversationUpdate = (updatedConversation) => {
        updateConversation(updatedConversation);
    };

    // Handle conversation delete from settings modal
    const handleConversationDelete = (conversationId) => {
        removeConversation(conversationId);
    };

    // Determine if we should show conversation list or chat
    const showConversationList = !isMobileView || !currentConversation;
    const showChat = !isMobileView || currentConversation;

    // Check if current user can send messages
    const canSend = canSendMessage ? canSendMessage() : true;

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Messages</h1>
                    <p className="text-text-muted">Team communication and chat</p>
                </div>

                {/* New Chat Button - Only visible for Admin and Project Manager */}
                {canStartChat() && (
                    <button
                        onClick={() => setShowNewChatModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                    >
                        <Plus size={18} />
                        New Chat
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden rounded-xl border border-border bg-background/50">
                {/* Conversation List */}
                {showConversationList && (
                    <div className={`
                        ${isMobileView ? 'w-full' : 'w-80 border-r border-border'}
                        flex flex-col bg-background/30
                    `}>
                        {/* List Header */}
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-text-main">Conversations</h3>
                            <p className="text-xs text-text-muted">{conversations.length} chats</p>
                        </div>

                        {/* Conversation List */}
                        {loading && conversations.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                            </div>
                        ) : (
                            <ConversationList
                                conversations={conversations}
                                currentConversation={currentConversation}
                                onSelectConversation={handleSelectConversation}
                                currentUser={user}
                            />
                        )}
                    </div>
                )}

                {/* Chat Area */}
                {showChat && (
                    <div className="flex-1 flex flex-col">
                        {currentConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="flex items-center gap-3 p-4 border-b border-border bg-background/50">
                                    {/* Back button (mobile) */}
                                    {isMobileView && (
                                        <button
                                            onClick={handleBack}
                                            className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                    )}

                                    {/* Avatar with MemberAvatar component */}
                                    <MemberAvatar
                                        name={getConversationTitle()}
                                        role={getOtherParticipantRole().includes('members') ? 'Team Member' : getOtherParticipantRole()}
                                        size="md"
                                        showOnline={true}
                                    />

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-text-main">
                                                {getConversationTitle()}
                                            </h3>
                                            {currentConversation.adminOnlyMessage && (
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                                    <Shield size={10} className="text-yellow-400" />
                                                    <span className="text-xs text-yellow-400">Admin Only</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            {getOtherParticipantRole()}
                                        </p>
                                    </div>

                                    {/* Settings Button */}
                                    <button
                                        onClick={() => setShowSettingsModal(true)}
                                        className="p-2.5 rounded-xl hover:bg-surface-hover text-text-muted hover:text-text-main transition-all hover:rotate-45 duration-300"
                                    >
                                        <Settings size={20} />
                                    </button>
                                </div>

                                {/* Chat Window */}
                                <ChatWindow
                                    messages={messages}
                                    currentUser={user}
                                    typingUser={typingUsers[currentConversation._id]}
                                    conversationTitle={getConversationTitle()}
                                    onReplyMessage={(msg) => console.log('Reply to:', msg)}
                                    onEditMessage={(msg) => console.log('Edit:', msg)}
                                    onMessagesUpdate={(updatedMsg) => console.log('Update:', updatedMsg)}
                                />

                                {/* Message Input */}
                                {canSend ? (
                                    <MessageInput
                                        onSendMessage={handleSendMessage}
                                        onTyping={sendTyping}
                                        onStopTyping={stopTyping}
                                    />
                                ) : (
                                    <div className="p-4 border-t border-border bg-background/50">
                                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                            <Shield size={16} className="text-yellow-400" />
                                            <span className="text-sm text-yellow-400">
                                                Only administrators can send messages in this conversation
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Empty State */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-surface-hover flex items-center justify-center mb-6 shadow-lg shadow-background/50">
                                    <MessageSquare size={48} className="text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-text-main mb-2">
                                    Select a conversation
                                </h3>
                                {canStartChat() ? (
                                    <>
                                        <p className="text-text-muted max-w-sm mb-6">
                                            Choose an existing conversation from the list or start a new chat to begin messaging.
                                        </p>
                                        <button
                                            onClick={() => setShowNewChatModal(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20"
                                        >
                                            <Plus size={20} />
                                            Start a new conversation
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-text-muted max-w-sm mb-4">
                                            Choose an existing conversation from the list to reply.
                                        </p>
                                        <div className="flex items-center gap-2 px-4 py-3 bg-surface/80 border border-border rounded-xl">
                                            <Lock size={16} className="text-yellow-400" />
                                            <span className="text-sm text-text-muted">
                                                Only Admin and Project Manager can start new chats.
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            <NewChatModal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                onStartChat={handleStartChat}
                currentUser={user}
            />

            {/* Chat Settings Modal */}
            <ChatSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                conversation={currentConversation}
                currentUser={user}
                onUpdate={handleConversationUpdate}
                onDelete={handleConversationDelete}
            />
        </div>
    );
};

export default Messages;
