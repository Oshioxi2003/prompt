# 🔄 Chuyển đổi từ SQLite sang MySQL - Hướng dẫn nhanh

## ✅ Đã hoàn thành:

1. **Cập nhật file .env** - Đã thay đổi cấu hình database từ SQLite sang MySQL
2. **Cập nhật settings.py** - Đã cấu hình Django sử dụng MySQL
3. **Tạo requirements.txt** - Đã thêm mysqlclient dependency
4. **Tạo .env.example** - Template cho cấu hình môi trường

## 🚀 Các bước thực hiện:

### 1. Cài đặt MySQL Server
```bash
# Windows (chocolatey)
choco install mysql

# macOS (homebrew) 
brew install mysql

# Linux (Ubuntu)
sudo apt install mysql-server
```

### 2. Tạo database và user MySQL
```sql
mysql -u root -p

CREATE DATABASE prompt_library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'prompt_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON prompt_library_db.* TO 'prompt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Cập nhật thông tin trong file .env
Chỉnh sửa các dòng sau trong `.env`:
```properties
DB_NAME=prompt_library_db
DB_USER=prompt_user  
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306
```

### 4. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 5. Chạy migration (Tự động)
```bash
# Sử dụng script migration tự động
python migrate_sqlite_to_mysql.py
```

### 6. Hoặc migration thủ công
```bash
# Backup dữ liệu SQLite (nếu có)
python manage.py dumpdata > backup_data.json

# Chạy migrations cho MySQL
python manage.py makemigrations
python manage.py migrate

# Restore dữ liệu (nếu có)
python manage.py loaddata backup_data.json

# Tạo superuser
python manage.py createsuperuser
```

### 7. Test ứng dụng
```bash
python manage.py runserver
```

## 🔒 Bảo mật:

- ✅ File `.env` đã được thêm vào `.gitignore`
- ✅ Thông tin nhạy cảm được lưu trong biến môi trường
- ✅ Template `.env.example` không chứa thông tin thật

## 📁 Files đã tạo/sửa:

- ✅ `.env` - Cập nhật cấu hình MySQL
- ✅ `.env.example` - Template cấu hình
- ✅ `settings.py` - Cấu hình Django MySQL
- ✅ `requirements.txt` - Dependencies
- ✅ `MYSQL_SETUP_GUIDE.md` - Hướng dẫn chi tiết
- ✅ `migrate_sqlite_to_mysql.py` - Script migration tự động

## ⚡ Troubleshooting:

### Lỗi mysqlclient:
```bash
# Windows
pip install --only-binary=all mysqlclient

# macOS
brew install mysql-client

# Linux  
sudo apt-get install python3-dev default-libmysqlclient-dev
```

### Lỗi kết nối:
1. Kiểm tra MySQL service đang chạy
2. Kiểm tra thông tin user/password trong .env
3. Kiểm tra firewall/port 3306

---

**🎉 Database của bạn đã sẵn sàng chuyển sang MySQL!**
