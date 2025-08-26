# Google Sheets Integration Service for Django
import requests
import json
import logging
from django.conf import settings
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    """Service to send contact message data to Google Sheets via Apps Script Web App"""
    
    def __init__(self):
        self.webhook_url = getattr(settings, 'GOOGLE_SHEETS_WEBHOOK_URL', None)
        self.timeout = 10  # seconds
    
    def send_contact_message(self, contact_message) -> Dict[str, Any]:
        """
        Send contact message data to Google Sheets
        
        Args:
            contact_message: ContactMessage model instance
            
        Returns:
            Dict with success status and message/error
        """
        if not self.webhook_url:
            logger.warning("Google Sheets webhook URL not configured")
            return {
                'success': False,
                'error': 'Google Sheets integration not configured'
            }
        
        try:
            # Prepare data for Google Sheets
            data = {
                'name': contact_message.name,
                'email': contact_message.email,
                'subject': contact_message.subject,
                'message': contact_message.message,
                'status': contact_message.status,
                'ip_address': contact_message.ip_address or '',
                'user_agent': contact_message.user_agent or '',
                'created_at': contact_message.created_at.isoformat(),
                'user_email': contact_message.user.email if contact_message.user else ''
            }
            
            # Send POST request to Google Apps Script
            response = requests.post(
                self.webhook_url,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=self.timeout
            )
            
            response.raise_for_status()
            result = response.json()
            
            if result.get('success'):
                logger.info(f"Successfully sent contact message {contact_message.id} to Google Sheets")
                return {
                    'success': True,
                    'message': 'Data sent to Google Sheets successfully',
                    'timestamp': result.get('timestamp')
                }
            else:
                error_msg = result.get('error', 'Unknown error from Google Sheets')
                logger.error(f"Google Sheets returned error: {error_msg}")
                return {
                    'success': False,
                    'error': error_msg
                }
                
        except requests.exceptions.Timeout:
            logger.error("Timeout sending data to Google Sheets")
            return {
                'success': False,
                'error': 'Timeout connecting to Google Sheets'
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error sending to Google Sheets: {e}")
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from Google Sheets: {e}")
            return {
                'success': False,
                'error': 'Invalid response from Google Sheets'
            }
        except Exception as e:
            logger.error(f"Unexpected error sending to Google Sheets: {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to Google Sheets webhook"""
        if not self.webhook_url:
            return {
                'success': False,
                'error': 'Google Sheets webhook URL not configured'
            }
        
        try:
            response = requests.get(self.webhook_url, timeout=5)
            response.raise_for_status()
            result = response.json()
            
            return {
                'success': True,
                'message': 'Google Sheets connection successful',
                'response': result
            }
        except Exception as e:
            logger.error(f"Google Sheets connection test failed: {e}")
            return {
                'success': False,
                'error': f'Connection test failed: {str(e)}'
            }

# Singleton instance
google_sheets_service = GoogleSheetsService()
