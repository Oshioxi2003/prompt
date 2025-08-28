# SSO Debug và Fix Script

## Tóm tắt các fix đã thực hiện:

### Backend Fixes:
1. ✅ Thêm `@csrf_exempt` cho SSOLoginView và SSOTestView
2. ✅ Cải thiện CORS settings với CORS_ALLOW_ALL_ORIGINS = DEBUG
3. ✅ Thêm CSRF_TRUSTED_ORIGINS
4. ✅ Thêm CSRFTokenView để get CSRF token
5. ✅ Allow mock-access-token cho development
6. ✅ Thêm debug logging chi tiết

### Frontend Fixes:
1. ✅ Thêm CSRF token interceptor cho axios
2. ✅ Get CSRF token trước khi SSO login
3. ✅ Cải thiện error handling
4. ✅ Thêm console logging cho debug

## Test endpoints:

```bash
# Test CSRF token
curl http://localhost:8000/api/auth/csrf/

# Test SSO test endpoint
curl http://localhost:8000/api/auth/sso/test/

# Test SSO login
curl -X POST http://localhost:8000/api/auth/sso/ \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "access_token": "mock-access-token", 
    "user_info": {
      "id": "12345",
      "email": "test@example.com",
      "given_name": "Test",
      "family_name": "User"
    }
  }'
```

## Checklist để test:

1. ✅ Restart Django server
2. ✅ Clear browser cache/cookies
3. ✅ Test từ frontend
4. ✅ Check Django console logs
5. ✅ Check browser network tab

## Nếu vẫn có lỗi 403:

1. Check Django middleware order
2. Verify CORS settings
3. Check browser console cho CSRF errors
4. Test direct API call để isolate issue

## Expected flow:
1. Frontend gọi /api/auth/csrf/ để get token
2. Axios interceptor add CSRF token vào headers
3. SSO login với @csrf_exempt should work
4. User được tạo/login thành công
