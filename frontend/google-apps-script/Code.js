/**
 * Google Apps Script để nhận và lưu dữ liệu ContactMessage vào Google Sheets
 * 
 * Hướng dẫn setup:
 * 1. Tạo Google Sheet mới với tên "Contact Messages"
 * 2. Tạo header row với các cột: Timestamp, Name, Email, Subject, Message, Status, IP Address, User Agent
 * 3. Copy code này vào Google Apps Script
 * 4. Deploy as Web App và copy URL
 * 5. Thêm URL vào backend Django
 */

// ID của Google Sheet (lấy từ URL của sheet)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Thay bằng ID thực của sheet
const SHEET_NAME = 'Contact Messages'; // Tên sheet tab

function doPost(e) {
  try {
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Missing required fields'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it with headers
    if (!sheet) {
      const newSheet = SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);
      newSheet.getRange(1, 1, 1, 8).setValues([
        ['Timestamp', 'Name', 'Email', 'Subject', 'Message', 'Status', 'IP Address', 'User Agent']
      ]);
      
      // Format header row
      newSheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
      newSheet.setFrozenRows(1);
    }
    
    // Get current sheet
    const currentSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Prepare row data
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const rowData = [
      timestamp,
      data.name || '',
      data.email || '',
      getSubjectDisplay(data.subject) || '',
      data.message || '',
      data.status || 'new',
      data.ip_address || '',
      data.user_agent || ''
    ];
    
    // Add new row
    currentSheet.appendRow(rowData);
    
    // Auto-resize columns
    currentSheet.autoResizeColumns(1, 8);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Contact Message Google Sheets Integration is working!',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSubjectDisplay(subject) {
  const subjectMap = {
    'general': '💬 Câu hỏi chung',
    'prompt-request': '✨ Đề xuất prompt mới',
    'bug-report': '🐛 Báo lỗi',
    'partnership': '🤝 Hợp tác',
    'feedback': '📝 Phản hồi',
    'support': '🛠️ Hỗ trợ kỹ thuật'
  };
  
  return subjectMap[subject] || subject;
}

// Test function để test script
function testScript() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'general',
    message: 'This is a test message',
    status: 'new',
    ip_address: '127.0.0.1',
    user_agent: 'Test Browser'
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(e);
  console.log(result.getContent());
}
