"""
AI Services for integrating with different AI providers (Gemini, OpenAI, Claude)
"""

import json
import requests
import time
import re
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging

try:
    import markdown
    from markdown.extensions import codehilite, fenced_code, tables
    MARKDOWN_AVAILABLE = True
except ImportError:
    MARKDOWN_AVAILABLE = False

logger = logging.getLogger(__name__)

class RateLimitExceeded(Exception):
    """Exception raised when rate limit is exceeded"""
    pass

class AIServiceError(Exception):
    """Exception raised when AI service returns an error"""
    pass

class AIServiceManager:
    """Manager class for AI services with rate limiting and error handling"""
    
    def __init__(self):
        self.providers = settings.AI_PROVIDERS
        self.rate_limits = settings.AI_RATE_LIMITS
    
    def _check_rate_limit(self, user_id: str, provider: str) -> bool:
        """Check if user has exceeded rate limits"""
        now = timezone.now()
        
        # Check per minute limit
        minute_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d%H%M')}"
        minute_count = cache.get(minute_key, 0)
        if minute_count >= self.rate_limits['requests_per_minute']:
            return False
        
        # Check per hour limit
        hour_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d%H')}"
        hour_count = cache.get(hour_key, 0)
        if hour_count >= self.rate_limits['requests_per_hour']:
            return False
        
        # Check per day limit
        day_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d')}"
        day_count = cache.get(day_key, 0)
        if day_count >= self.rate_limits['requests_per_day']:
            return False
        
        return True
    
    def _increment_rate_limit(self, user_id: str, provider: str):
        """Increment rate limit counters"""
        now = timezone.now()
        
        # Increment minute counter
        minute_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d%H%M')}"
        cache.set(minute_key, cache.get(minute_key, 0) + 1, 60)
        
        # Increment hour counter
        hour_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d%H')}"
        cache.set(hour_key, cache.get(hour_key, 0) + 1, 3600)
        
        # Increment day counter
        day_key = f"ai_rate_{user_id}_{provider}_{now.strftime('%Y%m%d')}"
        cache.set(day_key, cache.get(day_key, 0) + 1, 86400)
    
    def _convert_markdown_to_html(self, text: str) -> Dict[str, str]:
        """Convert markdown text to HTML"""
        if not MARKDOWN_AVAILABLE:
            return {
                'raw_text': text,
                'html': self._simple_markdown_to_html(text),
                'has_markdown': self._detect_markdown(text)
            }
        
        # Use markdown library with extensions
        md = markdown.Markdown(extensions=[
            'fenced_code',
            'tables', 
            'nl2br',
            'codehilite'
        ])
        
        html = md.convert(text)
        
        return {
            'raw_text': text,
            'html': html,
            'has_markdown': self._detect_markdown(text)
        }
    
    def _simple_markdown_to_html(self, text: str) -> str:
        """Simple markdown to HTML converter without external library"""
        # Convert basic markdown patterns
        html = text
        
        # Headers
        html = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        
        # Bold and italic
        html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
        html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
        
        # Code blocks
        html = re.sub(r'```(.*?)```', r'<pre><code>\1</code></pre>', html, flags=re.DOTALL)
        html = re.sub(r'`(.*?)`', r'<code>\1</code>', html)
        
        # Lists
        html = re.sub(r'^- (.*$)', r'<li>\1</li>', html, flags=re.MULTILINE)
        html = re.sub(r'^(\d+)\. (.*$)', r'<li>\2</li>', html, flags=re.MULTILINE)
        
        # Line breaks
        html = html.replace('\n', '<br>')
        
        # Wrap lists
        html = re.sub(r'(<li>.*?</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
        
        return html
    
    def _detect_markdown(self, text: str) -> bool:
        """Detect if text contains markdown formatting"""
        markdown_patterns = [
            r'^#{1,6}\s',  # Headers
            r'\*\*.*?\*\*',  # Bold
            r'\*.*?\*',  # Italic
            r'```.*?```',  # Code blocks
            r'`.*?`',  # Inline code
            r'^-\s',  # Lists
            r'^\d+\.\s',  # Numbered lists
        ]
        
        for pattern in markdown_patterns:
            if re.search(pattern, text, re.MULTILINE):
                return True
        return False

    def generate_response(self, provider: str, prompt: str, user_input: str, user_id: str = "anonymous") -> Dict[str, Any]:
        """Generate AI response with rate limiting and error handling"""
        
        # Check rate limits
        if not self._check_rate_limit(user_id, provider):
            raise RateLimitExceeded(f"Rate limit exceeded for provider {provider}")
        
        # Get provider config
        if provider not in self.providers:
            raise AIServiceError(f"Provider {provider} not supported")
        
        config = self.providers[provider]
        api_key = config.get('api_key')
        
        if not api_key:
            raise AIServiceError(f"API key not configured for provider {provider}")
        
        try:
            # Combine prompt and user input
            full_prompt = f"{prompt}\n\n{user_input}" if prompt else user_input
            
            # Call the appropriate AI service
            if provider == 'gemini':
                raw_response = self._call_gemini(full_prompt, config)
            elif provider == 'openai':
                raw_response = self._call_openai(full_prompt, config)
            elif provider == 'claude':
                raw_response = self._call_claude(full_prompt, config)
            else:
                raise AIServiceError(f"Provider {provider} not implemented")
            
            # Convert markdown to HTML
            processed_response = self._convert_markdown_to_html(raw_response)
            
            # Increment rate limit counters
            self._increment_rate_limit(user_id, provider)
            
            return {
                'success': True,
                'response': processed_response['html'],
                'raw_response': processed_response['raw_text'],
                'has_markdown': processed_response['has_markdown'],
                'provider': provider,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"AI service error for provider {provider}: {str(e)}")
            raise AIServiceError(f"Failed to generate response: {str(e)}")
    
    def _call_gemini(self, prompt: str, config: Dict[str, Any]) -> str:
        """Call Google Gemini API"""
        url = f"https://generativelanguage.googleapis.com/v1/models/{config['model']}:generateContent"
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            'contents': [{
                'parts': [{
                    'text': prompt
                }]
            }],
            'generationConfig': {
                'temperature': config.get('temperature', 0.7),
                'maxOutputTokens': config.get('max_tokens', 2048),
            }
        }
        
        params = {'key': config['api_key']}
        
        response = requests.post(url, headers=headers, json=data, params=params, timeout=30)
        
        if response.status_code != 200:
            raise AIServiceError(f"Gemini API error: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if 'candidates' not in result or not result['candidates']:
            raise AIServiceError("Gemini API returned no candidates")
        
        candidate = result['candidates'][0]
        if 'content' not in candidate or 'parts' not in candidate['content']:
            raise AIServiceError("Invalid response format from Gemini API")
        
        return candidate['content']['parts'][0]['text']
    
    def _call_openai(self, prompt: str, config: Dict[str, Any]) -> str:
        """Call OpenAI ChatGPT API"""
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            'Authorization': f"Bearer {config['api_key']}",
            'Content-Type': 'application/json',
        }
        
        data = {
            'model': config['model'],
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': config.get('max_tokens', 2048),
            'temperature': config.get('temperature', 0.7),
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code != 200:
            raise AIServiceError(f"OpenAI API error: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if 'choices' not in result or not result['choices']:
            raise AIServiceError("OpenAI API returned no choices")
        
        return result['choices'][0]['message']['content']
    
    def _call_claude(self, prompt: str, config: Dict[str, Any]) -> str:
        """Call Anthropic Claude API"""
        url = "https://api.anthropic.com/v1/messages"
        
        headers = {
            'x-api-key': config['api_key'],
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        data = {
            'model': config['model'],
            'max_tokens': config.get('max_tokens', 2048),
            'temperature': config.get('temperature', 0.7),
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code != 200:
            raise AIServiceError(f"Claude API error: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if 'content' not in result or not result['content']:
            raise AIServiceError("Claude API returned no content")
        
        return result['content'][0]['text']
    
    def get_available_providers(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available AI providers"""
        available = {}
        
        for provider, config in self.providers.items():
            api_key = config.get('api_key')
            available[provider] = {
                'name': provider.title(),
                'available': bool(api_key),
                'model': config.get('model', 'Unknown'),
                'configured': bool(api_key)
            }
        
        return available

# Global instance
ai_service = AIServiceManager()
