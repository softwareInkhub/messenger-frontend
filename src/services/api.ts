import { environment } from '../config/environment';
import { API_CONSTANTS, ERROR_MESSAGES } from '../utils/constants';
import { Logger } from '../utils/logger';

// API Configuration - Using environment variables
const API_BASE_URL = environment.apiBaseUrl;

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  count?: number;
}

export interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  message: string;
}

// API Service Class
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic fetch wrapper with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      Logger.logApiRequest(config.method || 'GET', url, config.body ? JSON.parse(config.body as string) : {});

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      Logger.logApiResponse(config.method || 'GET', url, response.status, data);
      return data;
    } catch (error) {
      Logger.logApiError(options.method || 'GET', `${this.baseURL}${endpoint}`, error);
      throw error;
    }
  }

  // Send a message to backend
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<MessageData>> {
    return this.request<MessageData>(API_CONSTANTS.ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Get all messages from backend
  async getMessages(limit: number = 50): Promise<ApiResponse<MessageData[]>> {
    return this.request<MessageData[]>(`${API_CONSTANTS.ENDPOINTS.GET_MESSAGES}?limit=${limit}`);
  }

  // Get messages for a specific user conversation
  async getConversationMessages(senderId: string, receiverId: string, limit: number = 50): Promise<MessageData[]> {
    try {
      console.log('🔍 Fetching conversation messages for:', { senderId, receiverId });
      const response = await this.getMessages(limit);
      const allMessages = response.data || [];
      console.log('📝 Total messages received:', allMessages.length);
      
      // Filter messages for this specific conversation
      const conversationMessages = allMessages.filter(msg => 
        (msg.senderId === senderId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === senderId)
      );

      console.log('📝 Conversation messages found:', conversationMessages.length);
      console.log('📝 Messages:', conversationMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        senderId: msg.senderId,
        receiverId: msg.receiverId
      })));

      // Sort by creation date (oldest first for chat display)
      return conversationMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      // Return empty array if API fails
      return [];
    }
  }

  // Test connection to backend
  async testConnection(): Promise<boolean> {
    try {
      await this.getMessages(1);
      Logger.info('🟢 Backend connection successful');
      return true;
    } catch (error) {
      Logger.error('🔴 Backend connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for easy access
export default apiService;