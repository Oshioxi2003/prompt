from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Prompt, Category, Tag, User, ContactMessage
import uuid
from django.utils import timezone
from datetime import timedelta

# Authentication Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'is_verified', 'date_joined']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError('No user found with this email address')
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # TODO: Re-enable password reset validation when models are restored
        # try:
        #     reset_token = PasswordResetToken.objects.get(
        #         token=attrs['token'],
        #         is_used=False
        #     )
        #     if reset_token.is_expired():
        #         raise serializers.ValidationError("Reset token has expired")
        #     attrs['reset_token'] = reset_token
        # except PasswordResetToken.DoesNotExist:
        #     raise serializers.ValidationError("Invalid reset token")
        
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

class SSOLoginSerializer(serializers.Serializer):
    provider = serializers.CharField()  # google, facebook, github
    access_token = serializers.CharField()
    user_info = serializers.DictField()

class CategorySerializer(serializers.ModelSerializer):
    prompts_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'image_url', 'icon_emoji', 
            'color', 'order', 'is_featured', 'prompts_count', 'created_at'
        ]

    def get_prompts_count(self, obj):
        return obj.prompts.filter(is_active=True).count()

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class TagSerializer(serializers.ModelSerializer):
    prompts_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'prompts_count', 'created_at']

    def get_prompts_count(self, obj):
        return obj.prompts.filter(is_active=True).count()

class PromptSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display_vietnamese', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    
    class Meta:
        model = Prompt
        fields = [
            'id', 'title', 'description', 'prompt_text', 'category', 'category_name',
            'tags', 'tags_detail', 'difficulty', 'difficulty_display', 'version',
            'is_active', 'views_count', 'likes_count', 'created_at', 'updated_at'
        ]

class PromptListSerializer(serializers.ModelSerializer):
    """Serializer for listing prompts with minimal data"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    difficulty_display = serializers.CharField(source='get_difficulty_display_vietnamese', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    
    class Meta:
        model = Prompt
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'tags_detail', 'difficulty', 'difficulty_display', 
            'views_count', 'likes_count', 'created_at'
        ]

class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer for contact form submissions"""
    subject_display = serializers.CharField(source='get_subject_display_with_emoji', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_display = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'name', 'email', 'subject', 'subject_display', 'message',
            'status', 'status_display', 'user', 'user_display', 'created_at',
            'updated_at', 'admin_reply', 'replied_at'
        ]
        read_only_fields = ['id', 'status', 'user', 'created_at', 'updated_at', 'admin_reply', 'replied_at']
    
    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value.lower()
    
    def validate_name(self, value):
        """Validate name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long")
        return value.strip()
    
    def validate_message(self, value):
        """Validate message"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long")
        return value.strip()

class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating contact messages"""
    
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']
    
    def validate_email(self, value):
        return value.lower()
    
    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Tên phải có ít nhất 2 ký tự")
        return value.strip()
    
    def validate_message(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Tin nhắn phải có ít nhất 10 ký tự")
        return value.strip()
