import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message, UserRole } from '@/types';
import { getMessagesByLoan, sendMessage } from '@/lib/firestore';
import { MessageSquare, Send, X } from 'lucide-react';

interface LoanCardProps {
  loanId: string;
  userRole: UserRole;
}

export default function LoanCard({ loanId, userRole }: LoanCardProps) {
  const { user } = useAuth();
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMessages) {
      loadMessages();
      // Set up polling for new messages
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [showMessages, loanId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const loanMessages = await getMessagesByLoan(loanId);
      setMessages(loanMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      await sendMessage({
        loanId,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: user.role,
        content: newMessage,
      });
      
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!showMessages) {
    return (
      <button
        onClick={() => setShowMessages(true)}
        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <MessageSquare size={18} />
        Messages
        {messages.length > 0 && (
          <span className="bg-white text-blue-600 text-xs rounded-full px-2 py-0.5">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare size={18} />
          Messages
        </h3>
        <button
          onClick={() => setShowMessages(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div className="bg-gray-50 rounded-lg p-4 mb-3 max-h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {message.senderName} • {message.senderRole}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || loading}
          className={`p-2 rounded-lg transition-colors ${
            newMessage.trim() && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
