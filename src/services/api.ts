import { environment } from '../config/environment';
import { API_CONSTANTS } from '../utils/constants';
import { Logger } from '../utils/logger';

// API Configuration - Using environment variables
const react_app_api_base_url = environment.apiBaseUrl;

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
  public baseURL: string;

  constructor(baseURL: string = react_app_api_base_url) {
    this.baseURL = baseURL;
  }

  // Generic fetch wrapper with error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 Making API request to:', url);
      
      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      Logger.logApiRequest(config.method || 'GET', url, config.body ? JSON.parse(config.body as string) : {});

      const response = await fetch(url, config);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Response data:', data);

      Logger.logApiResponse(config.method || 'GET', url, response.status, data);
      return data;
    } catch (error) {
      console.error('💥 Network error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        baseURL: this.baseURL,
        endpoint: endpoint
      });
      Logger.logApiError(options.method || 'GET', `${this.baseURL}${endpoint}`, error);
      throw error;
    }
  }

  // Send a message to backend
  async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<MessageData>> {
    console.log('📤 Sending message to backend:', messageData);
    console.log('📤 Backend URL:', this.baseURL);
    console.log('📤 Endpoint:', API_CONSTANTS.ENDPOINTS.SEND_MESSAGE);
    
    try {
      const response = await this.request<MessageData>(API_CONSTANTS.ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
      
      console.log('✅ Send message response:', response);
      return response;
    } catch (error) {
      console.error('❌ Send message failed:', error);
      throw error;
    }
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
      console.log('🧪 Testing backend connection to:', this.baseURL);
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Backend health check successful');
        return true;
      } else {
        console.log('⚠️ Backend health check failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
      return false;
    }
  }

  // Test basic connectivity
  async testBasicConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 Testing basic connectivity to:', this.baseURL);
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        mode: 'cors',
      });
      console.log('📡 Basic connectivity response:', response.status);
      return true;
    } catch (error) {
      console.error('❌ Basic connectivity failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for easy access
export default apiService;