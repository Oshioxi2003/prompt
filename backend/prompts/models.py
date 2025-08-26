import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


def category_image_path(instance, filename):
    """Generate upload path for category images"""
    return f'category/{instance.id}/{filename}'

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to=category_image_path, 
        blank=True, 
        null=True,
        help_text="Upload category icon/image"
    )
    icon_emoji = models.CharField(
        max_length=10, 
        blank=True, 
        help_text="Alternative emoji icon if no image"
    )
    color = models.CharField(
        max_length=7, 
        default='#6366F1', 
        help_text="Hex color code for category theme"
    )
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    is_featured = models.BooleanField(default=False, help_text="Show in featured categories")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    @property
    def image_url(self):
        """Get the full URL of the category image"""
        if self.image:
            return self.image.url
        return None

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#6B7280')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Prompt(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Dễ'),
        ('medium', 'Trung bình'),
        ('hard', 'Khó'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Mô tả ngắn gọn về prompt")
    prompt_text = models.TextField(help_text="Nội dung chi tiết của prompt")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='prompts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='prompts')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} (v{self.version})'

    def get_difficulty_display_vietnamese(self):
        """Return Vietnamese difficulty display"""
        difficulty_map = {
            'easy': 'Dễ',
            'medium': 'Trung bình',
            'hard': 'Khó'
        }
        return difficulty_map.get(self.difficulty, self.difficulty)

class User(AbstractUser):
    """Custom User model with additional fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # SSO fields
    sso_provider = models.CharField(max_length=20, blank=True)  # google, facebook, github
    sso_id = models.CharField(max_length=255, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email

class ContactMessage(models.Model):
    """Model for storing contact form submissions"""
    STATUS_CHOICES = [
        ('new', 'Mới'),
        ('in_progress', 'Đang xử lý'),
        ('resolved', 'Đã xử lý'),
        ('closed', 'Đã đóng'),
    ]
    
    SUBJECT_CHOICES = [
        ('general', 'Câu hỏi chung'),
        ('prompt-request', 'Đề xuất prompt mới'),
        ('bug-report', 'Báo lỗi'),
        ('partnership', 'Hợp tác'),
        ('feedback', 'Phản hồi'),
        ('support', 'Hỗ trợ kỹ thuật'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Họ và tên")
    email = models.EmailField(verbose_name="Email")
    subject = models.CharField(
        max_length=20, 
        choices=SUBJECT_CHOICES, 
        verbose_name="Chủ đề"
    )
    message = models.TextField(verbose_name="Tin nhắn")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='new',
        verbose_name="Trạng thái"
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Người dùng",
        help_text="Người dùng đã đăng nhập (nếu có)"
    )
    ip_address = models.GenericIPAddressField(
        null=True, 
        blank=True,
        verbose_name="Địa chỉ IP"
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name="User Agent"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Ngày cập nhật")
    admin_reply = models.TextField(
        blank=True,
        verbose_name="Phản hồi từ admin",
        help_text="Phản hồi từ quản trị viên"
    )
    replied_at = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Ngày phản hồi"
    )
    
    class Meta:
        verbose_name = "Tin nhắn liên hệ"
        verbose_name_plural = "Tin nhắn liên hệ"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_subject_display()} ({self.created_at.strftime('%d/%m/%Y')})"
    
    def get_subject_display_with_emoji(self):
        """Return subject with emoji"""
        emoji_map = {
            'general': '💬 Câu hỏi chung',
            'prompt-request': '✨ Đề xuất prompt mới',
            'bug-report': '🐛 Báo lỗi',
            'partnership': '🤝 Hợp tác',
            'feedback': '📝 Phản hồi',
            'support': '🛠️ Hỗ trợ kỹ thuật',
        }
        return emoji_map.get(self.subject, self.get_subject_display())

# class PasswordResetToken(models.Model):
#     """Token for password reset functionality"""
#     user = models.ForeignKey('User', on_delete=models.CASCADE)
#     token = models.CharField(max_length=100, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()
#     is_used = models.BooleanField(default=False)
#     
#     def is_expired(self):
#         return timezone.now() > self.expires_at
#     
#     def __str__(self):
#         return f"Reset token for {self.user.email}"

# class EmailVerificationToken(models.Model):
#     """Token for email verification"""
#     user = models.ForeignKey('User', on_delete=models.CASCADE)
#     token = models.CharField(max_length=100, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()
#     is_used = models.BooleanField(default=False)
#     
#     def is_expired(self):
#         return timezone.now() > self.expires_at
#     
#     def __str__(self):
#         return f"Verification token for {self.user.email}"