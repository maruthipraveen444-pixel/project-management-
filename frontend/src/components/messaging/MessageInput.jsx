import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage, onTyping, onStopTyping, disabled }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const inputRef = useRef(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle typing indicator
    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            onTyping?.();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onStopTyping?.();
        }, 2000);
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleSend = () => {
        if (!message.trim() || disabled) return;

        onSendMessage(message.trim());
        setMessage('');

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);
        onStopTyping?.();

        // Focus back to input
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="border-t border-border p-4 bg-background/50">
            <div className="flex items-end gap-3">
                {/* Message Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled}
                        rows={1}
                        className="
                            w-full px-4 py-3 pr-12
                            bg-surface border border-border rounded-xl
                            text-text-main placeholder-text-muted
                            focus:outline-none focus:border-primary-500/50
                            resize-none max-h-32
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all
                        "
                        style={{
                            minHeight: '48px',
                            height: 'auto'
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }}
                    />

                    {/* Emoji button (placeholder for future) */}
                    <button
                        type="button"
                        className="absolute right-3 bottom-3 text-text-muted hover:text-text-main transition-colors"
                        title="Emojis (coming soon)"
                    >
                        <Smile size={20} />
                    </button>
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="
                        w-12 h-12 rounded-xl
                        bg-primary-500 hover:bg-primary-600
                        disabled:bg-surface-hover disabled:cursor-not-allowed
                        flex items-center justify-center
                        text-white transition-all
                        shadow-lg shadow-primary-500/20
                        disabled:shadow-none
                    "
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
