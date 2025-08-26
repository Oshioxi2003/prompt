from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PromptViewSet, CategoryViewSet, TagViewSet,
    RegisterView, LoginView, LogoutView, PasswordResetRequestView,
    PasswordResetConfirmView, ChangePasswordView, SSOLoginView,
    VerifyEmailView, UserProfileView, AIProvidersView,
    ContactMessageView, ContactMessageListView, GoogleSheetsTestView, SSOTestView,
    CSRFTokenView
)

router = DefaultRouter()
router.register(r'prompts', PromptViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication URLs
    path('auth/csrf/', CSRFTokenView.as_view(), name='csrf-token'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/sso/', SSOLoginView.as_view(), name='sso-login'),
    path('auth/sso/test/', SSOTestView.as_view(), name='sso-test'),
    path('auth/verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # AI APIs
    path('ai/providers/', AIProvidersView.as_view(), name='ai-providers'),
    
    # Contact APIs
    path('contact/', ContactMessageView.as_view(), name='contact-message'),
    path('contact/messages/', ContactMessageListView.as_view(), name='contact-messages-list'),
    path('contact/messages/<int:pk>/', ContactMessageListView.as_view(), name='contact-message-detail'),
    path('contact/test-sheets/', GoogleSheetsTestView.as_view(), name='test-google-sheets'),
]
