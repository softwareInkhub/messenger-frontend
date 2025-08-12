import { VALIDATION_CONSTANTS } from './constants';

// Validation utility functions
export class ValidationUtils {
  // Validate message
  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message) {
      return { isValid: false, error: 'Message is required' };
    }

    if (message.length < VALIDATION_CONSTANTS.MESSAGE.MIN_LENGTH) {
      return { isValid: false, error: `Message must be at least ${VALIDATION_CONSTANTS.MESSAGE.MIN_LENGTH} character` };
    }

    if (message.length > VALIDATION_CONSTANTS.MESSAGE.MAX_LENGTH) {
      return { isValid: false, error: `Message cannot exceed ${VALIDATION_CONSTANTS.MESSAGE.MAX_LENGTH} characters` };
    }

    return { isValid: true };
  }

  // Validate user ID
  static validateUserId(userId: string): { isValid: boolean; error?: string } {
    if (!userId) {
      return { isValid: false, error: 'User ID is required' };
    }

    if (userId.length < VALIDATION_CONSTANTS.USER_ID.MIN_LENGTH) {
      return { isValid: false, error: `User ID must be at least ${VALIDATION_CONSTANTS.USER_ID.MIN_LENGTH} character` };
    }

    if (userId.length > VALIDATION_CONSTANTS.USER_ID.MAX_LENGTH) {
      return { isValid: false, error: `User ID cannot exceed ${VALIDATION_CONSTANTS.USER_ID.MAX_LENGTH} characters` };
    }

    return { isValid: true };
  }

  // Validate email
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  // Validate API response
  static validateApiResponse(response: any): { isValid: boolean; error?: string } {
    if (!response) {
      return { isValid: false, error: 'No response received' };
    }

    if (response.error) {
      return { isValid: false, error: response.error };
    }

    return { isValid: true };
  }

  // Sanitize input
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}


