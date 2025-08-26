# Hướng dẫn tích hợp Google Sheets cho Contact Messages

## Tổng quan
Hệ thống này sẽ tự động gửi tất cả tin nhắn liên hệ từ website vào Google Sheets để quản lý dễ dàng hơn.

## Bước 1: Tạo Google Sheet

1. Tạo một Google Sheet mới tại [sheets.google.com](https://sheets.google.com)
2. Đặt tên sheet là "Contact Messages"
3. Tạo header row với các cột sau:
   - A1: Timestamp
   - B1: Name
   - C1: Email
   - D1: Subject
   - E1: Message
   - F1: Status
   - G1: IP Address
   - H1: User Agent

4. Copy Sheet ID từ URL (phần giữa /d/ và /edit):
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

## Bước 2: Tạo Google Apps Script

1. Truy cập [script.google.com](https://script.google.com)
2. Tạo project mới
3. Thay code mặc định bằng nội dung file `Code.js` trong thư mục `google-apps-script`
4. Thay `YOUR_GOOGLE_SHEET_ID_HERE` bằng Sheet ID thực của bạn
5. Lưu project (Ctrl+S)

## Bước 3: Deploy Google Apps Script

1. Nhấp "Deploy" > "New deployment"
2. Chọn type: "Web app"
3. Description: "Contact Messages to Google Sheets"
4. Execute as: "Me"
5. Who has access: "Anyone" (quan trọng!)
6. Nhấp "Deploy"
7. Copy Web app URL được tạo ra

## Bước 4: Cấu hình Backend (Django)

1. Thêm vào file `.env`:
   ```
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. Restart Django server

## Bước 5: Cấu hình Frontend (React) - Optional

Nếu muốn gửi trực tiếp từ frontend:

1. Thêm vào file `.env`:
   ```
   VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. Restart development server

## Bước 6: Test tích hợp

### Test từ admin:
1. Đăng nhập với tài khoản admin
2. Truy cập: `http://localhost:8000/api/contact/test-sheets/`
3. Kiểm tra response JSON

### Test từ website:
1. Điền form liên hệ và gửi
2. Kiểm tra Google Sheet để xem dữ liệu có được thêm không

## Troubleshooting

### Lỗi thường gặp:

1. **"Google Sheets integration not configured"**
   - Kiểm tra GOOGLE_SHEETS_WEBHOOK_URL trong .env
   - Restart server sau khi thêm environment variable

2. **"Network error"**
   - Kiểm tra URL Google Apps Script
   - Đảm bảo đã deploy với access "Anyone"

3. **"Missing required fields"**
   - Kiểm tra dữ liệu được gửi có đầy đủ name, email, subject, message

4. **"Permission denied"**
   - Kiểm tra Google Apps Script execution permissions
   - Redeploy với "Execute as: Me" và "Who has access: Anyone"

## Cấu trúc dữ liệu trong Google Sheets

| Timestamp | Name | Email | Subject | Message | Status | IP Address | User Agent |
|-----------|------|-------|---------|---------|--------|------------|------------|
| 26/08/2025 10:30:00 | John Doe | john@email.com | 💬 Câu hỏi chung | Test message | new | 192.168.1.1 | Mozilla/5.0... |

## Tính năng bổ sung

- Tự động format dữ liệu với emoji cho subject
- Timestamp theo múi giờ Việt Nam
- Auto-resize columns
- Header formatting
- Error handling và logging

## Bảo mật

- Không lưu thông tin nhạy cảm trong Google Sheets
- Chỉ gửi dữ liệu cần thiết
- Log tất cả requests để debugging
- Không fail main process nếu Google Sheets error
