from django.db.models import Count
from .models import Prompt, Category, Tag, User

def admin_stats_context(request):
    """Context processor để cung cấp thống kê cho admin dashboard"""
    if request.path.startswith('/admin/'):
        try:
            context = {
                'total_prompts': Prompt.objects.count(),
                'active_prompts': Prompt.objects.filter(is_active=True).count(),
                'total_categories': Category.objects.count(),
                'total_tags': Tag.objects.count(),
                'total_users': User.objects.count(),
                'recent_prompts': Prompt.objects.order_by('-created_at')[:5],
                'recent_users': User.objects.order_by('-created_at')[:5],
                'popular_categories': Category.objects.annotate(
                    prompt_count=Count('prompts')
                ).order_by('-prompt_count')[:5],
            }
            return context
        except Exception:
            # Tránh lỗi khi database chưa được migrate
            return {
                'total_prompts': 0,
                'active_prompts': 0,
                'total_categories': 0,
                'total_tags': 0,
                'total_users': 0,
                'recent_prompts': [],
                'recent_users': [],
                'popular_categories': [],
            }
    return {} 