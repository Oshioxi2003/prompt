# Environment Variables Setup

## Cách thiết lập biến môi trường

### 1. Tạo file .env
File `.env` đã được tạo từ template. Bạn cần cập nhật các giá trị thực tế:

```bash
# Copy template
cp env_template.txt .env
```

### 2. Cập nhật các giá trị trong file .env

#### Django Settings
```env
SECRET_KEY=your-actual-secret-key
DEBUG=True
```

#### Email Settings
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-actual-email@gmail.com
EMAIL_HOST_PASSWORD=your-actual-app-password
DEFAULT_FROM_EMAIL=your-actual-email@gmail.com
```

#### SSO Settings
```env
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
FACEBOOK_APP_ID=your-actual-facebook-app-id
FACEBOOK_APP_SECRET=your-actual-facebook-app-secret
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret
```

### 3. Bảo mật
- File `.env` đã được thêm vào `.gitignore` để không bị commit lên git
- Không bao giờ commit file `.env` chứa thông tin thực tế
- Chỉ commit file `env_template.txt` làm mẫu

### 4. Cài đặt dependencies
```bash
pip install python-dotenv
```

### 5. Sử dụng trong production
Trong môi trường production, hãy đặt các biến môi trường trực tiếp trên server thay vì sử dụng file `.env`.

## Các biến môi trường đã được chuyển:

1. **SECRET_KEY** - Khóa bí mật của Django
2. **DEBUG** - Chế độ debug
3. **EMAIL_HOST** - SMTP server
4. **EMAIL_PORT** - Port SMTP
5. **EMAIL_USE_TLS** - Sử dụng TLS
6. **EMAIL_HOST_USER** - Email người dùng
7. **EMAIL_HOST_PASSWORD** - Mật khẩu ứng dụng
8. **DEFAULT_FROM_EMAIL** - Email mặc định
9. **FRONTEND_URL** - URL frontend
10. **SSO Provider Keys** - Các khóa API cho SSO (Google, Facebook, GitHub)
