# MySQL Database Setup Guide

## 1. Cài đặt MySQL Server

### Windows:
```bash
# Download và cài đặt MySQL từ: https://dev.mysql.com/downloads/mysql/
# Hoặc sử dụng chocolatey:
choco install mysql

# Hoặc sử dụng MySQL Installer
```

### macOS:
```bash
# Sử dụng Homebrew
brew install mysql
brew services start mysql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 2. Tạo Database và User

Đăng nhập vào MySQL:
```bash
mysql -u root -p
```

Tạo database và user:
```sql
-- Tạo database
CREATE DATABASE prompt_library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (thay đổi username và password)
CREATE USER 'prompt_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Cấp quyền
GRANT ALL PRIVILEGES ON prompt_library_db.* TO 'prompt_user'@'localhost';
FLUSH PRIVILEGES;

-- Kiểm tra
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'prompt_user';

-- Thoát
EXIT;
```

## 3. Cập nhật file .env

Chỉnh sửa file `.env` với thông tin database thực tế:

```properties
# Database Settings
DATABASE_URL=mysql://prompt_user:your_secure_password@localhost:3306/prompt_library_db
DB_ENGINE=django.db.backends.mysql
DB_NAME=prompt_library_db
DB_USER=prompt_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306
```

## 4. Cài đặt Python dependencies

```bash
# Activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

## 5. Migration Database

```bash
# Tạo migrations
python manage.py makemigrations

# Áp dụng migrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Load sample data (nếu có)
python manage.py loaddata fixtures/sample_data.json
```

## 6. Test Connection

```bash
# Test database connection
python manage.py dbshell

# Hoặc test Django
python manage.py runserver
```

## 7. Backup và Restore

### Backup:
```bash
mysqldump -u prompt_user -p prompt_library_db > backup.sql
```

### Restore:
```bash
mysql -u prompt_user -p prompt_library_db < backup.sql
```

## 8. Troubleshooting

### Lỗi mysqlclient installation:
**Windows:**
```bash
# Cài đặt Microsoft C++ Build Tools
# Download từ: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Hoặc sử dụng binary wheel:
pip install --only-binary=all mysqlclient
```

**macOS:**
```bash
# Cài đặt mysql-client
brew install mysql-client
export PATH="/usr/local/opt/mysql-client/bin:$PATH"
```

**Linux:**
```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
```

### Lỗi kết nối:
1. Kiểm tra MySQL service đang chạy
2. Kiểm tra firewall settings
3. Kiểm tra user permissions
4. Kiểm tra charset settings

## 9. Production Settings

Cho production environment, thêm vào `.env`:

```properties
# Production Database Settings
DB_ENGINE=django.db.backends.mysql
DB_NAME=prompt_library_prod
DB_USER=prod_user
DB_PASSWORD=very_secure_password
DB_HOST=your_mysql_server.com
DB_PORT=3306

# Connection pooling
DB_CONN_MAX_AGE=600
DB_OPTIONS='{"charset": "utf8mb4", "init_command": "SET sql_mode=\'STRICT_TRANS_TABLES\'", "autocommit": true}'
```

## 10. Performance Optimization

Thêm vào MySQL config (`my.cnf`):
```ini
[mysqld]
# Character set
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Performance
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
max_connections=200
query_cache_size=64M

# Security
bind-address=127.0.0.1
```

---

**Lưu ý bảo mật:**
- Không commit file `.env` vào git
- Sử dụng mật khẩu mạnh
- Thường xuyên backup database
- Monitor database performance
