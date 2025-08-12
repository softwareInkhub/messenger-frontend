import { useState, useEffect, useCallback } from 'react';
import { apiService, MessageData, SendMessageRequest } from '../../../services/api';
import { Message } from '../chat-room-page/components/messages-list/data/get-messages';

// Convert backend message to frontend message format
const convertToFrontendMessage = (backendMsg: MessageData, currentUserId: string): Message => {
  const date = new Date(backendMsg.createdAt);
  const isOpponent = backendMsg.senderId !== currentUserId;
  
  console.log('🔍 Message alignment check:', {
    messageId: backendMsg.id,
    messageText: backendMsg.message,
    senderId: backendMsg.senderId,
    currentUserId: currentUserId,
    isOpponent: isOpponent,
    willShowOn: isOpponent ? 'LEFT (gray bubble)' : 'RIGHT (green bubble)'
  });
  
  return {
    id: backendMsg.id,
    body: backendMsg.message,
    date: date.toLocaleDateString('en-GB'),
    timestamp: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    messageStatus: backendMsg.status.toUpperCase() as any,
    isOpponent: isOpponent,
  };
};

// Convert frontend message to backend format
const convertToBackendMessage = (message: string, senderId: string, receiverId: string): SendMessageRequest => ({
  senderId,
  receiverId,
  message,
});

export interface UseMessagingReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  isConnected: boolean;
}

export const useMessaging = (currentUserId: string, selectedContactId: string): UseMessagingReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Always connected

  // Fetch messages for the current conversation
  const refreshMessages = useCallback(async () => {
    console.log('🔄 refreshMessages called with:', { currentUserId, selectedContactId });
    
    if (!currentUserId || !selectedContactId) {
      console.log('❌ Missing user IDs, skipping refresh');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching messages from backend...');
      const backendMessages = await apiService.getConversationMessages(currentUserId, selectedContactId);
      console.log('📝 Backend messages received:', backendMessages);
      
      const frontendMessages = backendMessages.map(msg => convertToFrontendMessage(msg, currentUserId));
      console.log('🎨 Converted to frontend format:', frontendMessages);
      
      setMessages(frontendMessages);
      console.log('✅ Refreshed messages:', frontendMessages.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
      console.error('❌ Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, selectedContactId]);

  // Send a new message
  const sendMessage = useCallback(async (messageText: string) => {
    console.log('🚀 Starting sendMessage:', { messageText, currentUserId, selectedContactId });
    
    if (!messageText.trim() || !currentUserId || !selectedContactId) {
      console.log('❌ Missing required data:', { messageText, currentUserId, selectedContactId });
      return;
    }

    setError(null);
    
    try {
      const messageData = convertToBackendMessage(messageText.trim(), currentUserId, selectedContactId);
      console.log('📤 Sending message data:', messageData);
      
      const response = await apiService.sendMessage(messageData);
      console.log('📥 Received response:', response);
      
      if (response.data) {
        // Add the new message to the local state immediately for instant feedback
        const newMessage = convertToFrontendMessage(response.data, currentUserId);
        console.log('✅ Converting to frontend message:', newMessage);
        setMessages(prev => {
          const updated = [...prev, newMessage];
          console.log('📝 Updated messages array:', updated);
          return updated;
        });
        console.log('✅ Message sent successfully:', newMessage);
      }

      // Refresh messages after a short delay to ensure consistency
      setTimeout(() => {
        console.log('🔄 Refreshing messages...');
        refreshMessages();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('❌ Error sending message:', err);
      throw err; // Re-throw so the UI can handle it
    }
  }, [currentUserId, selectedContactId, refreshMessages]);

  // Load messages when the conversation changes
  useEffect(() => {
    if (currentUserId && selectedContactId) {
      refreshMessages();
    }
  }, [currentUserId, selectedContactId, refreshMessages]);

  // Auto-refresh messages every 3 seconds for real-time updates
  useEffect(() => {
    if (!currentUserId || !selectedContactId) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 3000); // Refresh every 3 seconds for real-time updates

    return () => clearInterval(interval);
  }, [currentUserId, selectedContactId, refreshMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages,
    isConnected: true, // Always connected
  };
};