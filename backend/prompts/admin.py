from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Prompt, Category, Tag, User, ContactMessage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_featured', 'order', 'prompts_count', 'created_at']
    list_filter = ['is_featured', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'image_preview']
    list_editable = ['is_featured', 'order']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('name', 'description')
        }),
        ('Hình ảnh & Hiển thị', {
            'fields': ('image', 'image_preview', 'icon_emoji', 'color')
        }),
        ('Sắp xếp & Tính năng', {
            'fields': ('order', 'is_featured')
        }),
        ('Thời gian', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<div class="image-preview"><img src="{}" style="max-height: 100px; max-width: 100px; border-radius: 8px;" /></div>',
                obj.image.url
            )
        return format_html('<span style="color: #6b7280;">Chưa có hình ảnh</span>')
    image_preview.short_description = "Xem trước hình ảnh"
    image_preview.allow_tags = True

    def prompts_count(self, obj):
        return obj.prompts.filter(is_active=True).count()
    prompts_count.short_description = "Số prompts"

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at']
    search_fields = ['name']
    list_filter = ['created_at']
    readonly_fields = ['created_at']

@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'difficulty_badge', 'status_badge', 'views_count', 'likes_count', 'created_at']
    list_filter = ['category', 'difficulty', 'is_active', 'created_at', 'tags']
    search_fields = ['title', 'description', 'prompt_text']
    filter_horizontal = ['tags']
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('title', 'description', 'prompt_text')
        }),
        ('Phân loại', {
            'fields': ('category', 'tags', 'difficulty')
        }),
        ('Trạng thái', {
            'fields': ('is_active', 'version')
        }),
        ('Thống kê', {
            'fields': ('views_count', 'likes_count'),
            'classes': ('collapse',)
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def difficulty_badge(self, obj):
        colors = {
            'easy': '#10b981',
            'medium': '#f59e0b', 
            'hard': '#ef4444'
        }
        color = colors.get(obj.difficulty, '#6b7280')
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">{}</span>',
            color, obj.get_difficulty_display()
        )
    difficulty_badge.short_description = "Độ khó"
    difficulty_badge.admin_order_field = 'difficulty'
    
    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Hoạt động</span>'
            )
        else:
            return format_html(
                '<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Không hoạt động</span>'
            )
    status_badge.short_description = "Trạng thái"
    status_badge.admin_order_field = 'is_active'

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'full_name', 'is_active', 'is_verified', 'created_at']
    list_filter = ['is_active', 'is_verified', 'is_staff', 'is_superuser', 'created_at', 'sso_provider']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    list_per_page = 25
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'avatar')
        }),
        ('Thông tin cá nhân', {
            'fields': ('bio', 'date_of_birth', 'phone'),
            'classes': ('collapse',)
        }),
        ('Quyền hạn', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')
        }),
        ('SSO', {
            'fields': ('sso_provider', 'sso_id'),
            'classes': ('collapse',)
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    def full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username
    full_name.short_description = "Họ tên"
    full_name.admin_order_field = 'first_name'

# Custom Admin Site
class PromptLibraryAdminSite(AdminSite):
    site_header = "Prompt Library Administration"
    site_title = "Prompt Library Admin"
    index_title = "Welcome to Prompt Library Administration"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        # Get statistics
        total_prompts = Prompt.objects.count()
        active_prompts = Prompt.objects.filter(is_active=True).count()
        total_categories = Category.objects.count()
        total_tags = Tag.objects.count()
        total_users = User.objects.count()
        
        # Recent activity
        recent_prompts = Prompt.objects.order_by('-created_at')[:5]
        recent_users = User.objects.order_by('-created_at')[:5]
        
        # Popular categories
        popular_categories = Category.objects.annotate(
            prompt_count=Count('prompts')
        ).order_by('-prompt_count')[:5]
        
        context = {
            'total_prompts': total_prompts,
            'active_prompts': active_prompts,
            'total_categories': total_categories,
            'total_tags': total_tags,
            'total_users': total_users,
            'recent_prompts': recent_prompts,
            'recent_users': recent_users,
            'popular_categories': popular_categories,
        }
        
        return render(request, 'admin/dashboard.html', context)

# Register custom admin site
admin_site = PromptLibraryAdminSite(name='prompt_library_admin')

# Register models with custom admin site
admin_site.register(Category, CategoryAdmin)
admin_site.register(Tag, TagAdmin)
admin_site.register(Prompt, PromptAdmin)
admin_site.register(User, UserAdmin)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'email', 'subject_display', 'status', 
        'created_at', 'user', 'is_replied'
    ]
    list_filter = ['status', 'subject', 'created_at', 'replied_at']
    search_fields = ['name', 'email', 'message', 'user__email']
    readonly_fields = [
        'created_at', 'updated_at', 'ip_address', 'user_agent', 
        'user', 'name', 'email', 'subject', 'message'
    ]
    list_editable = ['status']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Thông tin liên hệ', {
            'fields': ('name', 'email', 'user', 'subject', 'message')
        }),
        ('Trạng thái & Phản hồi', {
            'fields': ('status', 'admin_reply', 'replied_at')
        }),
        ('Thông tin kỹ thuật', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def subject_display(self, obj):
        return obj.get_subject_display_with_emoji()
    subject_display.short_description = "Chủ đề"
    
    def is_replied(self, obj):
        if obj.replied_at:
            return format_html(
                '<span style="color: #10b981; font-weight: bold;">✓ Đã phản hồi</span>'
            )
        return format_html(
            '<span style="color: #ef4444;">✗ Chưa phản hồi</span>'
        )
    is_replied.short_description = "Phản hồi"
    is_replied.allow_tags = True
    
    def save_model(self, request, obj, form, change):
        if change and 'admin_reply' in form.changed_data and obj.admin_reply:
            # Set replied_at when admin_reply is added
            if not obj.replied_at:
                obj.replied_at = timezone.now()
        super().save_model(request, obj, form, change)

# Register ContactMessage with custom admin site as well
admin_site.register(ContactMessage, ContactMessageAdmin)
