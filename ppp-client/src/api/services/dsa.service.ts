// api/services/dsa.service.ts
import axios, { AxiosResponse } from 'axios';

// Types matching your backend response
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  status: number;
  data: T;
}

interface LeetCodeProfile {
  username: string;
  profile: {
    realName: string;
    reputation: number;
    ranking: number;
  };
}

interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  reputation: number;
}

interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
  runtime: string;
  memory: string;
  url: string;
}

interface CompleteLeetCodeData {
  profile: LeetCodeProfile;
  statistics: LeetCodeStats;
  recentSubmissions: LeetCodeSubmission[];
}

class DSAService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  // Get complete LeetCode profile data
  async getLeetCodeProfile(username: string): Promise<ApiResponse<CompleteLeetCodeData>> {
    try {
      if (!username || username.trim() === '') {
        return {
          success: false,
          message: 'Username is required',
          status: 400,
          data: null
        };
      }

      const response: AxiosResponse<ApiResponse<CompleteLeetCodeData>> = await axios.get(
        `${this.baseURL}/dsa/profile/${encodeURIComponent(username.trim())}`,
        {
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error fetching LeetCode profile:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          // Backend returned structured error
          return error.response.data;
        }
        
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'LeetCode user not found',
            status: 404,
            data: null
          };
        }
        
        if (error.response?.status === 400) {
          return {
            success: false,
            message: 'Invalid username provided',
            status: 400,
            data: null
          };
        }
        
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            message: 'Request timed out. Please try again.',
            status: 408,
            data: null
          };
        }
        
        if (!error.response) {
          return {
            success: false,
            message: 'Network error. Please check your connection.',
            status: 0,
            data: null
          };
        }
      }

      return {
        success: false,
        message: 'Failed to fetch LeetCode profile. Please try again.',
        status: 500,
        data: null
      };
    }
  }

  // Get basic profile only (lighter call)
  async getLeetCodeBasicProfile(username: string): Promise<ApiResponse<LeetCodeProfile>> {
    try {
      if (!username || username.trim() === '') {
        return {
          success: false,
          message: 'Username is required',
          status: 400,
          data: null
        };
      }

      const response: AxiosResponse<ApiResponse<LeetCodeProfile>> = await axios.get(
        `${this.baseURL}/dsa/user/${encodeURIComponent(username.trim())}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error fetching basic LeetCode profile:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          return error.response.data;
        }
        
        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'LeetCode user not found',
            status: 404,
            data: null
          };
        }
      }

      return {
        success: false,
        message: 'Failed to fetch profile. Please try again.',
        status: 500,
        data: null
      };
    }
  }

  // Check if user exists
  async checkLeetCodeUser(username: string): Promise<ApiResponse<{ exists: boolean; username: string }>> {
    try {
      if (!username || username.trim() === '') {
        return {
          success: false,
          message: 'Username is required',
          status: 400,
          data: null
        };
      }

      const response: AxiosResponse<ApiResponse<{ exists: boolean; username: string }>> = await axios.get(
        `${this.baseURL}/dsa/check/${encodeURIComponent(username.trim())}`,
        {
          timeout: 8000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error checking LeetCode user:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          return error.response.data;
        }
      }

      return {
        success: false,
        message: 'Failed to check user existence. Please try again.',
        status: 500,
        data: null
      };
    }
  }

  // Validate username format (client-side validation)
  validateUsername(username: string): { valid: boolean; message?: string } {
    if (!username || username.trim() === '') {
      return { valid: false, message: 'Username is required' };
    }

    const trimmed = username.trim();
    
    if (trimmed.length < 1 || trimmed.length > 20) {
      return { valid: false, message: 'Username must be between 1 and 20 characters' };
    }

    // LeetCode usernames are alphanumeric with underscores and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
      return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    return { valid: true };
  }
}

// Export singleton instance
const dsaService = new DSAService();
export default dsaService;