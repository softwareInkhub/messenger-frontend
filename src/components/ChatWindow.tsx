import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Types
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: number;
}

interface ChatWindowProps {
  currentUserId: string;
  selectedUserId: string;
  chatId: string;
  websocketUrl: string;
}

interface SendMessageRequest {
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
}

// API Service
const apiService = {
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(messageData: SendMessageRequest): Promise<Message> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: Message;
  isOwnMessage: boolean;
}> = React.memo(({ message, isOwnMessage }) => {
  const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs rounded-lg px-3 py-2 ${
        isOwnMessage 
          ? 'bg-green-500 text-white rounded-br-md' 
          : 'bg-gray-200 text-gray-800 rounded-bl-md'
      }`}>
        <div className="text-sm">{message.text}</div>
        <div className={`text-xs mt-1 ${
          isOwnMessage ? 'text-green-100' : 'text-gray-500'
        }`}>
          {timestamp}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// Main ChatWindow Component
const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  selectedUserId,
  chatId,
  websocketUrl,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      
      setIsLoading(true);
      try {
        const fetchedMessages = await apiService.getMessages(chatId);
        // Sort by createdAt ascending
        const sortedMessages = fetchedMessages.sort((a, b) => a.createdAt - b.createdAt);
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // WebSocket setup
  useEffect(() => {
    if (!websocketUrl || !chatId) return;

    const ws = new WebSocket(websocketUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      // Subscribe to chat room
      ws.send(JSON.stringify({
        action: 'subscribe',
        chatId: chatId,
        userId: currentUserId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message' && data.chatId === chatId) {
          const newMessage: Message = data.message;
          
          // Check for duplicates
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            
            // Insert message in correct position (sorted by createdAt)
            const newMessages = [...prev, newMessage];
            return newMessages.sort((a, b) => a.createdAt - b.createdAt);
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWebsocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [websocketUrl, chatId, currentUserId]);

  // Send message function
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatId || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: currentUserId,
      receiverId: selectedUserId,
      text: messageText,
      createdAt: Date.now(),
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send to API
      const sentMessage = await apiService.sendMessage({
        chatId,
        senderId: currentUserId,
        receiverId: selectedUserId,
        text: messageText,
      });

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // Send through WebSocket for real-time broadcast
      if (websocket && isConnected) {
        websocket.send(JSON.stringify({
          action: 'sendMessage',
          message: sentMessage,
          chatId: chatId
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      // Restore message text
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, chatId, currentUserId, selectedUserId, isSending, websocket, isConnected]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Memoized messages to prevent unnecessary re-renders
  const sortedMessages = useMemo(() => {
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="text-yellow-800 text-sm">
            🔌 Connecting to real-time chat...
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-center">
              <div className="text-lg mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation!</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
