# Custom Admin Interface

## Tổng quan

Dự án Prompt Library đã được tùy chỉnh với giao diện admin hiện đại và đẹp mắt, bao gồm:

- **Giao diện hiện đại** với gradient colors và animations
- **Dashboard tùy chỉnh** với thống kê và biểu đồ
- **Badges và indicators** cho trạng thái và độ khó
- **Responsive design** cho mobile và tablet
- **Font Awesome icons** cho trải nghiệm tốt hơn

## Tính năng chính

### 1. Giao diện tùy chỉnh
- Header gradient với logo magic
- Font Inter cho typography hiện đại
- Color scheme nhất quán
- Hover effects và transitions

### 2. Dashboard thống kê
- **Stat cards** hiển thị:
  - Total Prompts
  - Active Prompts  
  - Categories
  - Users
- **Recent Activity** với prompts và users mới
- **Popular Categories** với số lượng prompts
- **Quick Stats** với các chỉ số quan trọng

### 3. Admin Models được tùy chỉnh

#### Category Admin
- Image preview với styling đẹp
- Prompts count display
- Featured và order controls
- Color picker cho theme

#### Prompt Admin
- Difficulty badges với màu sắc
- Status badges (Active/Inactive)
- Enhanced list display
- Date hierarchy navigation

#### User Admin
- Full name display
- Verification status
- SSO provider information
- Avatar preview

#### Tag Admin
- Color display
- Simple và clean interface

### 4. Responsive Design
- Mobile-friendly layout
- Flexible grid system
- Touch-friendly buttons
- Optimized for tablets

## Cấu trúc files

```
backend/
├── templates/
│   └── admin/
│       ├── base_site.html      # Custom admin base
│       ├── index.html          # Dashboard với stats
│       └── dashboard.html      # Detailed dashboard
├── static/
│   └── admin/
│       └── css/
│           └── custom_admin.css # Custom styles
├── prompts/
│   ├── admin.py               # Admin models
│   └── admin_config.py        # Custom admin site
└── prompt_library/
    └── settings.py            # Template và static config
```

## Cách sử dụng

### 1. Truy cập Admin
```bash
python manage.py runserver
# Truy cập: http://localhost:8000/admin/
```

### 2. Dashboard
- Trang chủ admin hiển thị thống kê tổng quan
- Truy cập `/admin/dashboard/` cho dashboard chi tiết

### 3. Quản lý Content
- **Prompts**: Thêm, sửa, xóa prompts với difficulty badges
- **Categories**: Quản lý categories với image preview
- **Tags**: Quản lý tags với color coding
- **Users**: Quản lý users với verification status

## Customization

### Thêm model mới vào admin
```python
@admin.register(YourModel)
class YourModelAdmin(admin.ModelAdmin):
    list_display = ['field1', 'field2', 'custom_badge']
    
    def custom_badge(self, obj):
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 8px; border-radius: 12px;">{}</span>',
            color, text
        )
```

### Thêm custom CSS
```css
/* Thêm vào static/admin/css/custom_admin.css */
.your-custom-class {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    padding: 12px;
}
```

### Thêm custom template
```html
<!-- Tạo file templates/admin/your_model/change_form.html -->
{% extends "admin/change_form.html" %}
{% block extrahead %}
{{ block.super }}
<style>
    /* Custom styles */
</style>
{% endblock %}
```

## Best Practices

### 1. Performance
- Sử dụng `select_related()` và `prefetch_related()` cho queries
- Cache statistics nếu cần thiết
- Optimize images cho admin preview

### 2. Security
- Validate tất cả user inputs
- Sử dụng proper permissions
- Sanitize HTML output với `format_html()`

### 3. UX
- Consistent color scheme
- Clear visual hierarchy
- Intuitive navigation
- Helpful error messages

## Troubleshooting

### Static files không load
```bash
python manage.py collectstatic
```

### Template không được tìm thấy
- Kiểm tra `TEMPLATES` setting
- Đảm bảo file template đúng vị trí

### CSS không apply
- Clear browser cache
- Kiểm tra `STATICFILES_DIRS` setting
- Verify file path trong template

## Future Enhancements

### Planned Features
- [ ] Chart.js integration cho biểu đồ
- [ ] Real-time notifications
- [ ] Bulk actions với progress bar
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] Dark mode toggle

### Custom Actions
- [ ] Bulk publish/unpublish prompts
- [ ] Category reordering
- [ ] User verification workflow
- [ ] Content moderation tools

## Support

Nếu gặp vấn đề với admin interface:
1. Kiểm tra console errors
2. Verify Django version compatibility
3. Review template syntax
4. Check static files configuration
