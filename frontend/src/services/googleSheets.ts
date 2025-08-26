import axios from 'axios';

// Google Sheets service để gửi dữ liệu contact message
class GoogleSheetsService {
  private webAppUrl: string;

  constructor() {
    // URL của Google Apps Script Web App
    // Thay bằng URL thực sau khi deploy Google Apps Script
    this.webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';
  }

  async sendContactMessage(data: ContactMessageForSheets): Promise<GoogleSheetsResponse> {
    if (!this.webAppUrl) {
      console.warn('Google Sheets webhook URL not configured');
      return { success: false, error: 'Google Sheets not configured' };
    }

    try {
      const response = await axios.post(this.webAppUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });

      return response.data;
    } catch (error: any) {
      console.error('Error sending to Google Sheets:', error);
      
      if (error.response) {
        return {
          success: false,
          error: `HTTP ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error - could not reach Google Sheets'
        };
      } else {
        return {
          success: false,
          error: error.message || 'Unknown error'
        };
      }
    }
  }

  async testConnection(): Promise<GoogleSheetsResponse> {
    if (!this.webAppUrl) {
      return { success: false, error: 'Google Sheets not configured' };
    }

    try {
      const response = await axios.get(this.webAppUrl, { timeout: 5000 });
      return response.data;
    } catch (error: any) {
      console.error('Error testing Google Sheets connection:', error);
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }
}

// Interfaces
export interface ContactMessageForSheets {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface GoogleSheetsResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();

// Helper function để format dữ liệu cho Google Sheets
export const formatContactMessageForSheets = (
  contactData: any,
  request?: any
): ContactMessageForSheets => {
  return {
    name: contactData.name,
    email: contactData.email,
    subject: contactData.subject,
    message: contactData.message,
    status: 'new',
    ip_address: request?.ip_address || '',
    user_agent: request?.user_agent || '',
  };
};
