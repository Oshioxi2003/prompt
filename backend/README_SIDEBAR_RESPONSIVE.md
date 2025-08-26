# Sidebar Responsive với Tương tác Thu gọn/Mở rộng

## 🎯 Tính năng chính

### 1. **Sidebar Responsive**
- **Mobile (< 768px)**: Sidebar ẩn, có thể mở bằng nút hamburger
- **Tablet (768px - 1023px)**: Sidebar ẩn, có thể mở bằng nút hamburger
- **Desktop (≥ 1024px)**: Sidebar hiển thị, có thể thu gọn/mở rộng
- **Large screens (≥ 1280px)**: Tối ưu cho màn hình lớn
- **TV/Ultra-wide (≥ 1920px)**: Tối ưu cho màn hình siêu rộng

### 2. **Tương tác Sidebar**
- **Thu gọn/Mở rộng**: Nút toggle ở footer sidebar (desktop)
- **Mobile menu**: Nút hamburger và overlay
- **Keyboard support**: ESC để đóng mobile menu
- **State persistence**: Lưu trạng thái thu gọn trong localStorage

### 3. **Responsive Breakpoints**
```css
/* Mobile First */
@media (min-width: 640px)   /* sm */   { /* Small devices */ }
@media (min-width: 768px)   /* md */   { /* Medium devices */ }
@media (min-width: 1024px)  /* lg */   { /* Large devices */ }
@media (min-width: 1280px)  /* xl */   { /* Extra large */ }
@media (min-width: 1920px)  /* 2xl */  { /* TV/Ultra-wide */ }
```

## 📱 Hỗ trợ thiết bị

### **Điện thoại (Mobile)**
- **Màn hình**: 320px - 767px
- **Sidebar**: Ẩn mặc định, slide từ trái
- **Navigation**: Nút hamburger ở top bar
- **Overlay**: Nền tối khi mở sidebar
- **Touch**: Swipe để đóng sidebar

### **Máy tính bảng (Tablet)**
- **Màn hình**: 768px - 1023px
- **Sidebar**: Ẩn mặc định, slide từ trái
- **Navigation**: Nút hamburger ở top bar
- **Layout**: Tối ưu cho màn hình cảm ứng

### **Máy tính (Desktop)**
- **Màn hình**: ≥ 1024px
- **Sidebar**: Hiển thị mặc định
- **Thu gọn**: Nút toggle ở footer
- **Collapsed width**: 64px (chỉ hiển thị icons)
- **Expanded width**: 256px (hiển thị đầy đủ)

### **Màn hình lớn (Large Desktop)**
- **Màn hình**: ≥ 1280px
- **Layout**: Tối ưu cho không gian rộng
- **Content**: Tự động điều chỉnh margin

### **TV/Màn hình siêu rộng**
- **Màn hình**: ≥ 1920px
- **Content**: Giới hạn chiều rộng tối đa
- **Centering**: Căn giữa nội dung

## 🎮 Tương tác người dùng

### **Mobile/Tablet**
```javascript
// Mở/đóng sidebar
function toggleSidebar() {
    // Slide animation
    // Overlay background
    // Touch gestures
}

// Đóng bằng ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleSidebar();
});
```

### **Desktop**
```javascript
// Thu gọn/mở rộng sidebar
function toggleSidebarCollapse() {
    // Width animation
    // Icon/text visibility
    // Content margin adjustment
}

// Lưu trạng thái
localStorage.setItem('sidebarCollapsed', state);
```

## 🎨 CSS Classes

### **Sidebar States**
```css
/* Mobile sidebar */
.sidebar {
    @apply fixed inset-y-0 left-0 z-50 w-64 
           transform -translate-x-full 
           transition-transform duration-300 ease-in-out;
}

/* Desktop sidebar */
.sidebar {
    @apply lg:static lg:translate-x-0;
}

/* Collapsed state */
.sidebar-collapsed {
    @apply lg:w-16;
}

/* Expanded state */
.sidebar {
    @apply lg:w-64;
}
```

### **Responsive Utilities**
```css
/* Mobile only */
.lg:hidden { /* Ẩn trên desktop */ }

/* Desktop only */
.hidden.lg:block { /* Hiển thị trên desktop */ }

/* Responsive spacing */
.space-y-4.sm:space-y-6 { /* Spacing tăng theo màn hình */ }

/* Responsive text */
.text-2xl.sm:text-3xl { /* Font size tăng theo màn hình */ }
```

## 🔧 Cấu hình

### **Tailwind Config**
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    // ... more shades
                    900: '#1e3a8a',
                }
            }
        }
    }
}
```

### **Breakpoints**
```css
/* Custom breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1920px) { /* 2xl */ }
```

## 📊 Performance

### **Optimizations**
- **CSS Transitions**: Hardware accelerated
- **JavaScript**: Debounced resize events
- **Images**: Lazy loading
- **Fonts**: CDN loading
- **State**: LocalStorage caching

### **Accessibility**
- **Keyboard navigation**: Tab, ESC, Enter
- **Screen readers**: ARIA labels
- **Focus management**: Proper focus trapping
- **Color contrast**: WCAG compliant

## 🚀 Sử dụng

### **1. Chạy server**
```bash
cd backend
python manage.py runserver
```

### **2. Truy cập admin**
- URL: `http://localhost:8000/admin/`
- Responsive trên mọi thiết bị

### **3. Tương tác**
- **Mobile**: Tap hamburger menu
- **Desktop**: Click toggle button
- **Keyboard**: ESC để đóng mobile menu

## 🛠️ Tùy chỉnh

### **Thay đổi màu sắc**
```css
/* Trong custom.css */
.sidebar-link.active {
    @apply bg-primary-50 text-primary-700;
}
```

### **Thay đổi kích thước**
```css
/* Sidebar width */
.sidebar { @apply w-64; }
.sidebar-collapsed { @apply w-16; }
```

### **Thêm menu items**
```html
<!-- Trong base_site.html -->
<a href="{% url 'admin:your_url' %}" class="sidebar-link">
    <i class="fas fa-icon"></i>
    <span class="sidebar-text">Menu Item</span>
</a>
```

## 🔍 Troubleshooting

### **Sidebar không hiển thị**
- Kiểm tra JavaScript console
- Kiểm tra CSS loading
- Kiểm tra Tailwind CDN

### **Animation không mượt**
- Kiểm tra hardware acceleration
- Kiểm tra CSS transitions
- Kiểm tra browser support

### **Mobile menu không hoạt động**
- Kiểm tra touch events
- Kiểm tra z-index
- Kiểm tra overlay positioning

## 📈 Analytics

### **User Behavior**
- Sidebar collapse frequency
- Mobile vs desktop usage
- Menu item popularity
- Session duration

### **Performance Metrics**
- Page load time
- Animation frame rate
- Memory usage
- Battery impact

## 🔮 Roadmap

### **Future Features**
- [ ] Dark mode support
- [ ] Custom themes
- [ ] Advanced animations
- [ ] Voice navigation
- [ ] Gesture controls
- [ ] PWA support

### **Enhancements**
- [ ] Better touch feedback
- [ ] Improved accessibility
- [ ] Performance optimizations
- [ ] Cross-browser compatibility
