from datetime import timedelta
import uuid
import requests

from django.conf import settings
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ai_services import ai_service, RateLimitExceeded, AIServiceError
from .google_sheets_service import google_sheets_service
from .models import Prompt, Category, Tag, User, ContactMessage
from .serializers import (
    PromptSerializer, PromptListSerializer, CategorySerializer, TagSerializer,
    UserSerializer, RegisterSerializer, LoginSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, ChangePasswordSerializer, SSOLoginSerializer,
    ContactMessageSerializer, ContactMessageCreateSerializer
)

class CSRFTokenView(APIView):
    """Get CSRF token for frontend"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Return CSRF token"""
        token = get_token(request)
        return Response({'csrfToken': token})

# Authentication Views
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # TODO: Re-enable email verification when models are restored
            # # Create email verification token
            # token = EmailVerificationToken.objects.create(
            #     user=user,
            #     token=str(uuid.uuid4()),
            #     expires_at=timezone.now() + timedelta(hours=24)
            # )
            
            # # Send verification email (in production, use Celery for async)
            # try:
            #     send_mail(
            #         'Verify your email - PromptHub',
            #         f'Click this link to verify your email: {settings.FRONTEND_URL}/verify-email/{token.token}',
            #         settings.DEFAULT_FROM_EMAIL,
            #         [user.email],
            #         fail_silently=False,
            #     )
            # except Exception as e:
            #     print(f"Email sending failed: {e}")
            
            return Response({
                'message': 'User registered successfully.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # TODO: Re-enable password reset when models are restored
            # # Create reset token
            # token = PasswordResetToken.objects.create(
            #     user=user,
            #     token=str(uuid.uuid4()),
            #     expires_at=timezone.now() + timedelta(hours=1)
            # )
            
            # # Send reset email
            # try:
            #     send_mail(
            #         'Reset your password - PromptHub',
            #         f'Click this link to reset your password: {settings.FRONTEND_URL}/reset-password/{token.token}',
            #         settings.DEFAULT_FROM_EMAIL,
            #         [email],
            #         fail_silently=False,
            #     )
            # except Exception as e:
            #     print(f"Email sending failed: {e}")
            
            return Response({'message': 'Password reset functionality temporarily disabled'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            # TODO: Re-enable password reset when models are restored
            # reset_token = serializer.validated_data['reset_token']
            # new_password = serializer.validated_data['new_password']
            
            # # Update password
            # user = reset_token.user
            # user.set_password(new_password)
            # user.save()
            
            # # Mark token as used
            # reset_token.is_used = True
            # reset_token.save()
            
            return Response({'message': 'Password reset functionality temporarily disabled'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class SSOLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            serializer = SSOLoginSerializer(data=request.data)
            if serializer.is_valid():
                provider = serializer.validated_data['provider']
                access_token = serializer.validated_data['access_token']
                user_info = serializer.validated_data['user_info']
                
                # Verify token with provider
                if not self.verify_sso_token(provider, access_token, user_info):
                    return Response({'error': 'Invalid SSO token'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get or create user
                user, created = self.get_or_create_sso_user(provider, user_info)
                
                if created:
                    user.is_verified = True
                    user.save()
                
                login(request, user)
                return Response({
                    'message': 'SSO login successful',
                    'user': UserSerializer(user).data,
                    'created': created
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Internal server error during SSO login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def verify_sso_token(self, provider, access_token, user_info):
        """Verify SSO token with provider"""
        # For development/demo purposes, allow mock tokens
        if access_token == 'mock-access-token':
            return True
            
        try:
            if provider == 'google':
                response = requests.get(
                    f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}'
                )
                return response.status_code == 200
            elif provider == 'facebook':
                response = requests.get(
                    f'https://graph.facebook.com/me?access_token={access_token}'
                )
                return response.status_code == 200
            elif provider == 'github':
                headers = {'Authorization': f'token {access_token}'}
                response = requests.get('https://api.github.com/user', headers=headers)
                return response.status_code == 200
            return False
        except:
            return False
    
    def get_or_create_sso_user(self, provider, user_info):
        """Get or create user from SSO information"""
        email = user_info.get('email')
        sso_id = user_info.get('id') or user_info.get('sub')
        
        if not email or not sso_id:
            raise ValueError("Email and ID are required for SSO authentication")
        
        # Try to find existing SSO user
        try:
            user = User.objects.get(sso_provider=provider, sso_id=sso_id)
            return user, False
        except User.DoesNotExist:
            pass
        
        # Try to find by email
        try:
            user = User.objects.get(email=email)
            # Link SSO to existing account
            user.sso_provider = provider
            user.sso_id = sso_id
            user.save()
            return user, False
        except User.DoesNotExist:
            pass
        
        # Create new user
        try:
            username = f"{provider}_{sso_id}"
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', ''),
                sso_provider=provider,
                sso_id=sso_id,
                is_verified=True
            )
            return user, True
        except Exception as e:
            raise ValueError(f"Error creating SSO user: {e}")

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, token):
        # TODO: Re-enable email verification when models are restored
        # try:
        #     verification_token = EmailVerificationToken.objects.get(
        #         token=token,
        #         is_used=False
        #     )
        
        #     if verification_token.is_expired():
        #         return Response({'error': 'Verification token has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        #     user = verification_token.user
        #     user.is_verified = True
        #     user.save()
        
        #     verification_token.is_used = True
        #     verification_token.save()
        
        #     return Response({'message': 'Email verified successfully'})
        # except EmailVerificationToken.DoesNotExist:
        #     return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Email verification functionality temporarily disabled'})

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured categories for homepage"""
        featured_categories = Category.objects.filter(is_featured=True).order_by('order')
        serializer = self.get_serializer(featured_categories, many=True)
        return Response(serializer.data)

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class PromptViewSet(viewsets.ModelViewSet):
    queryset = Prompt.objects.filter(is_active=True)
    serializer_class = PromptSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'tags']
    search_fields = ['title', 'description', 'prompt_text', 'tags__name']
    ordering_fields = ['created_at', 'views_count', 'likes_count', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for list vs detail views"""
        if self.action == 'list':
            return PromptListSerializer
        return PromptSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering
        category = self.request.query_params.get('category_name', None)
        if category and category != 'Tất cả':
            queryset = queryset.filter(category__name=category)
            
        difficulty = self.request.query_params.get('difficulty_name', None)
        if difficulty:
            difficulty_map = {'Dễ': 'easy', 'Trung bình': 'medium', 'Khó': 'hard'}
            difficulty_key = difficulty_map.get(difficulty)
            if difficulty_key:
                queryset = queryset.filter(difficulty=difficulty_key)
        
        return queryset.select_related('category').prefetch_related('tags')

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about prompts"""
        total_prompts = self.get_queryset().count()
        categories_count = Category.objects.count()
        tags_count = Tag.objects.count()
        
        # Most popular prompts
        popular_prompts = self.get_queryset().order_by('-views_count')[:5]
        popular_serializer = PromptListSerializer(popular_prompts, many=True)
        
        return Response({
            'total_prompts': total_prompts,
            'categories_count': categories_count,
            'tags_count': tags_count,
            'popular_prompts': popular_serializer.data
        })

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a prompt"""
        prompt = self.get_object()
        prompt.likes_count += 1
        prompt.save(update_fields=['likes_count'])
        return Response({'likes_count': prompt.likes_count})

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    @method_decorator(csrf_exempt)
    def chat(self, request, pk=None):
        """Chat with AI using this prompt"""
        prompt = self.get_object()
        
        # Get request data
        provider = request.data.get('provider', 'gemini')
        user_input = request.data.get('message', '')
        
        if not user_input.strip():
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user ID for rate limiting (use session key for anonymous users)
        user_id = str(request.user.id) if request.user.is_authenticated else request.session.session_key
        if not user_id:
            # Create session if it doesn't exist
            request.session.create()
            user_id = request.session.session_key
        
        try:
            # Generate AI response
            result = ai_service.generate_response(
                provider=provider,
                prompt=prompt.prompt_text,
                user_input=user_input,
                user_id=user_id
            )
            
            return Response({
                'success': True,
                'response': result['response'],
                'provider': provider,
                'prompt_id': prompt.id,
                'timestamp': result['timestamp']
            })
            
        except RateLimitExceeded as e:
            return Response(
                {'error': 'Rate limit exceeded. Please try again later.', 'type': 'rate_limit'}, 
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except AIServiceError as e:
            return Response(
                {'error': str(e), 'type': 'ai_service'}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'error': 'An unexpected error occurred', 'type': 'unknown'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AIProvidersView(APIView):
    """Get available AI providers and their status"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            providers = ai_service.get_available_providers()
            return Response({
                'providers': providers,
                'rate_limits': settings.AI_RATE_LIMITS
            })
        except Exception as e:
            return Response(
                {'error': 'Failed to get providers'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ContactMessageView(APIView):
    """Handle contact form submissions"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Create a new contact message"""
        serializer = ContactMessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Get client IP address
            def get_client_ip(request):
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0]
                else:
                    ip = request.META.get('REMOTE_ADDR')
                return ip
            
            # Create contact message
            contact_message = serializer.save(
                user=request.user if request.user.is_authenticated else None,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Send notification email to admins (optional)
            try:
                subject = f"Tin nhắn liên hệ mới: {contact_message.get_subject_display_with_emoji()}"
                message = f"""
Tin nhắn liên hệ mới từ website:

Tên: {contact_message.name}
Email: {contact_message.email}
Chủ đề: {contact_message.get_subject_display_with_emoji()}

Tin nhắn:
{contact_message.message}

---
Thời gian: {contact_message.created_at.strftime('%d/%m/%Y %H:%M:%S')}
Người dùng: {contact_message.user.email if contact_message.user else 'Khách'}
IP: {contact_message.ip_address}
                """
                
                # Only send email if ADMIN_EMAIL is configured
                admin_emails = getattr(settings, 'ADMIN_EMAILS', [])
                if admin_emails:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        admin_emails,
                        fail_silently=True,
                    )
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send admin notification email: {e}")
            
            # Send data to Google Sheets (async, don't fail if it errors)
            try:
                sheets_result = google_sheets_service.send_contact_message(contact_message)
                if sheets_result['success']:
                    print(f"Successfully sent contact message {contact_message.id} to Google Sheets")
                else:
                    print(f"Failed to send to Google Sheets: {sheets_result.get('error')}")
            except Exception as e:
                # Log error but don't fail the request
                print(f"Error sending to Google Sheets: {e}")
            
            # Return success response
            return Response({
                'message': 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
                'id': contact_message.id,
                'created_at': contact_message.created_at
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContactMessageListView(APIView):
    """List contact messages (admin only)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get contact messages for admin users"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = ContactMessage.objects.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            messages = messages.filter(status=status_filter)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = messages.count()
        messages = messages[start:end]
        
        serializer = ContactMessageSerializer(messages, many=True)
        
        return Response({
            'count': total_count,
            'results': serializer.data,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })

    def patch(self, request, pk=None):
        """Update contact message status (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            message = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response(
                {'error': 'Message not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Update allowed fields
        allowed_fields = ['status', 'admin_reply']
        for field in allowed_fields:
            if field in request.data:
                setattr(message, field, request.data[field])
        
        if 'admin_reply' in request.data and request.data['admin_reply']:
            message.replied_at = timezone.now()
        
        message.save()
        
        serializer = ContactMessageSerializer(message)
        return Response(serializer.data)

class GoogleSheetsTestView(APIView):
    """Test Google Sheets integration (admin only)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Test connection to Google Sheets"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            result = google_sheets_service.test_connection()
            return Response(result)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class SSOTestView(APIView):
    """Test SSO endpoint for debugging"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Test SSO with mock data"""
        return Response({
            'message': 'SSO test endpoint working',
            'received_data': request.data,
            'timestamp': timezone.now().isoformat()
        })
    
    def get(self, request):
        """Get SSO test info"""
        return Response({
            'message': 'SSO test endpoint ready',
            'supported_providers': ['google', 'facebook', 'github'],
            'sample_request': {
                'provider': 'google',
                'access_token': 'mock-access-token',
                'user_info': {
                    'id': '12345',
                    'email': 'test@example.com',
                    'given_name': 'Test',
                    'family_name': 'User'
                }
            }
        })