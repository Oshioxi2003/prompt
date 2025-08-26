# Giao diện Admin Tùy chỉnh với Tailwind CSS

## Tổng quan

Dự án này đã được cập nhật với giao diện admin tùy chỉnh sử dụng Tailwind CSS thay vì template mặc định của Django. Giao diện mới cung cấp:

- **Dashboard hiện đại** với thống kê và hoạt động gần đây
- **Giao diện responsive** hoạt động tốt trên mọi thiết bị
- **Thiết kế đẹp mắt** với Tailwind CSS và Font Awesome icons
- **Trải nghiệm người dùng tốt hơn** với các thành phần UI hiện đại

## Các tính năng chính

### 1. Dashboard Dashboard
- Thống kê tổng quan (Prompts, Categories, Users, Tags)
- Hoạt động gần đây (Prompts và Users mới)
- Categories phổ biến
- Thao tác nhanh để thêm mới

### 2. Giao diện Danh sách (Change List)
- Bảng dữ liệu đẹp mắt với hover effects
- Tìm kiếm và lọc nâng cao
- Phân trang hiện đại
- Thao tác hàng loạt

### 3. Giao diện Form (Change Form)
- Form fields được style với Tailwind CSS
- Validation errors đẹp mắt
- Buttons và actions hiện đại
- Responsive design

### 4. Trang Đăng nhập
- Giao diện đăng nhập đẹp mắt
- Error handling tốt
- Responsive design

## Cấu trúc Files

```
backend/
├── templates/
│   └── admin/
│       ├── base_site.html          # Template base chính
│       ├── index.html              # Dashboard
│       ├── change_list.html        # Danh sách
│       ├── change_form.html        # Form chỉnh sửa
│       ├── login.html              # Trang đăng nhập
│       ├── result_list.html        # Bảng kết quả
│       ├── pagination.html         # Phân trang
│       └── includes/
│           └── fieldset.html       # Fieldset template
├── static/
│   └── admin/
│       └── css/
│           └── custom.css          # CSS tùy chỉnh
└── prompts/
    ├── admin.py                    # Admin configuration
    └── context_processors.py       # Context processor cho stats
```

## Cài đặt và Sử dụng

### 1. Chạy Server
```bash
cd backend
python manage.py runserver
```

### 2. Truy cập Admin
- URL: `http://localhost:8000/admin/`
- Đăng nhập với tài khoản superuser

### 3. Tạo Superuser (nếu chưa có)
```bash
python manage.py createsuperuser
```

## Tùy chỉnh

### Thêm CSS tùy chỉnh
Chỉnh sửa file `backend/static/admin/css/custom.css` để thêm styles mới.

### Thay đổi màu sắc
Cập nhật cấu hình Tailwind trong `base_site.html`:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    // Thay đổi màu primary ở đây
                    500: '#your-color',
                }
            }
        }
    }
}
```

### Thêm tính năng mới
1. Tạo template mới trong `templates/admin/`
2. Cập nhật `admin.py` để sử dụng template
3. Thêm CSS tương ứng trong `custom.css`

## Responsive Design

Giao diện được thiết kế responsive với các breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## Browser Support

- Chrome (khuyến nghị)
- Firefox
- Safari
- Edge

## Troubleshooting

### 1. CSS không load
- Kiểm tra `STATIC_URL` trong settings.py
- Chạy `python manage.py collectstatic`

### 2. Template không hiển thị
- Kiểm tra đường dẫn template trong `TEMPLATES` setting
- Đảm bảo file template tồn tại

### 3. Context processor không hoạt động
- Kiểm tra `context_processors` trong settings.py
- Restart server sau khi thay đổi

## Tính năng nâng cao

### 1. Thêm Widgets tùy chỉnh
Tạo custom widgets trong `admin.py`:

```python
class CustomWidget(forms.Widget):
    template_name = 'admin/widgets/custom_widget.html'
```

### 2. Thêm Actions tùy chỉnh
```python
def custom_action(modeladmin, request, queryset):
    # Logic xử lý
    pass

custom_action.short_description = "Custom Action"
```

### 3. Thêm Filters tùy chỉnh
```python
class CustomFilter(admin.SimpleListFilter):
    title = 'Custom Filter'
    parameter_name = 'custom'
    
    def lookups(self, request, model_admin):
        return [('value', 'Label')]
```

## Performance

- Sử dụng CDN cho Tailwind CSS và Font Awesome
- CSS được minify và optimize
- Images được lazy load
- Caching được enable

## Security

- CSRF protection được enable
- XSS protection
- Content Security Policy (CSP) headers
- Secure authentication

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.
