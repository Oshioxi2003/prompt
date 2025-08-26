from django.contrib.admin import AdminSite
from django.urls import path
from django.shortcuts import render
from django.db.models import Count
from .models import Prompt, Category, Tag, User

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

# Create custom admin site instance
admin_site = PromptLibraryAdminSite(name='prompt_library_admin')

# Context processor for admin statistics
def admin_stats_context(request):
    """Add statistics to admin context"""
    if request.path.startswith('/admin/'):
        return {
            'prompts_count': Prompt.objects.count(),
            'categories_count': Category.objects.count(),
            'tags_count': Tag.objects.count(),
            'users_count': User.objects.count(),
        }
    return {}
