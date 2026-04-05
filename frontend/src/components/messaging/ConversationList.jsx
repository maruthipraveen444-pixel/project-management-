import { format, isToday, isYesterday } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import MemberAvatar from './MemberAvatar';

const ConversationList = ({ conversations, currentConversation, onSelectConversation, currentUser }) => {

    // Get the other participant(s) for display
    const getConversationTitle = (conversation) => {
        if (conversation.title) return conversation.title;

        const others = conversation.participants.filter(
            p => p._id !== currentUser?._id
        );

        if (others.length === 1) {
            return others[0].name;
        }

        return others.map(p => p.name.split(' ')[0]).join(', ');
    };

    // Get first other participant for avatar
    const getFirstOther = (conversation) => {
        const others = conversation.participants.filter(
            p => p._id !== currentUser?._id
        );
        return others[0] || null;
    };

    // Format timestamp
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);

        if (isToday(d)) {
            return format(d, 'HH:mm');
        } else if (isYesterday(d)) {
            return 'Yesterday';
        }
        return format(d, 'dd/MM/yy');
    };

    // Get last message preview
    const getLastMessagePreview = (conversation) => {
        if (!conversation.lastMessage) return 'No messages yet';

        const msg = conversation.lastMessage;
        const isMine = msg.senderId === currentUser?._id || msg.senderId?._id === currentUser?._id;
        const prefix = isMine ? 'You: ' : '';
        const text = msg.text || '';

        return prefix + (text.length > 30 ? text.substring(0, 30) + '...' : text);
    };

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare size={48} className="text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text-main mb-2">No conversations yet</h3>
                <p className="text-text-muted text-sm">
                    Start a new chat to begin messaging
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {conversations.map((conversation) => {
                const isSelected = currentConversation?._id === conversation._id;
                const firstOther = getFirstOther(conversation);

                return (
                    <div
                        key={conversation._id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`
                            flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-border
                            ${isSelected
                                ? 'bg-primary-500/10 border-l-2 border-l-primary-500'
                                : 'hover:bg-surface-hover/50'
                            }
                        `}
                    >
                        {/* Avatar - Using MemberAvatar with initials */}
                        <MemberAvatar
                            name={getConversationTitle(conversation)}
                            role={firstOther?.role || 'Team Member'}
                            size="md"
                            showOnline={true}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-text-main truncate">
                                    {getConversationTitle(conversation)}
                                </h4>
                                <span className="text-xs text-text-muted flex-shrink-0 ml-2">
                                    {formatTime(conversation.lastActivityAt || conversation.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-text-muted truncate">
                                    {getLastMessagePreview(conversation)}
                                </p>
                                {conversation.unreadCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full flex-shrink-0">
                                        {conversation.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
