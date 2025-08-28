# Hướng dẫn cài đặt SSO (Single Sign-On) cho PromptHub

## Tổng quan

Dự án PromptHub đã tích hợp sẵn hệ thống SSO hỗ trợ 3 providers:
- **Google OAuth 2.0**
- **Facebook Login**
- **GitHub OAuth**

## Cấu trúc files SSO

### Backend Files

1. **Models** (`backend/prompts/models.py`)
   ```python
   class User(AbstractUser):
       # SSO fields
       sso_provider = models.CharField(max_length=20, blank=True)  # google, facebook, github
       sso_id = models.CharField(max_length=255, blank=True)
   ```

2. **Views** (`backend/prompts/views.py`)
   - `SSOLoginView` - Xử lý đăng nhập SSO
   - `verify_sso_token()` - Verify token với provider
   - `get_or_create_sso_user()` - Tạo hoặc link tài khoản SSO

3. **Serializers** (`backend/prompts/serializers.py`)
   ```python
   class SSOLoginSerializer(serializers.Serializer):
       provider = serializers.CharField()  # google, facebook, github
       access_token = serializers.CharField()
       user_info = serializers.DictField()
   ```

4. **Settings** (`backend/prompt_library/settings.py`)
   ```python
   SSO_PROVIDERS = {
       'google': {
           'client_id': os.getenv('GOOGLE_CLIENT_ID'),
           'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
       },
       'facebook': {
           'app_id': os.getenv('FACEBOOK_APP_ID'),
           'app_secret': os.getenv('FACEBOOK_APP_SECRET'),
       },
       'github': {
           'client_id': os.getenv('GITHUB_CLIENT_ID'),
           'client_secret': os.getenv('GITHUB_CLIENT_SECRET'),
       }
   }
   ```

### Frontend Files

1. **API Service** (`frontend/src/services/api.ts`)
   ```typescript
   ssoLogin: async (provider: string, accessToken: string, userInfo: any) => {
     const response = await axios.post(`${API_BASE_URL}/auth/sso/`, {
       provider,
       access_token: accessToken,
       user_info: userInfo,
     });
     return response.data;
   }
   ```

2. **Auth Context** (`frontend/src/contexts/AuthContext.tsx`)
   ```typescript
   const ssoLogin = async (provider: string, accessToken: string, userInfo: any) => {
     const response = await apiService.ssoLogin(provider, accessToken, userInfo);
     setUser(response.user);
   };
   ```

3. **Login Page** (`frontend/src/pages/LoginPage.tsx`)
   - Buttons cho Google, Facebook, GitHub login
   - Handle SSO login flow

## Cài đặt từng Provider

### 1. Google OAuth 2.0

#### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project existing
3. Enable Google+ API và Google OAuth2 API

#### Bước 2: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Nhấp **Create Credentials** > **OAuth client ID**
3. Chọn **Web application**
4. Thêm authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
5. Copy **Client ID** và **Client Secret**

#### Bước 3: Cấu hình Environment
```bash
# Backend .env
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend .env (if needed)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
```

### 2. Facebook Login

#### Bước 1: Tạo Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo **New App** > **Consumer**
3. Thêm **Facebook Login** product

#### Bước 2: Cấu hình Facebook Login
1. Vào **Facebook Login** > **Settings**
2. Thêm **Valid OAuth Redirect URIs**:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)

#### Bước 3: Cấu hình Environment
```bash
# Backend .env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Frontend .env (if needed)
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

### 3. GitHub OAuth

#### Bước 1: Tạo GitHub OAuth App
1. Truy cập GitHub > **Settings** > **Developer settings** > **OAuth Apps**
2. Nhấp **New OAuth App**
3. Điền thông tin:
   - **Application name**: PromptHub
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `http://localhost:5173/auth/callback` (dev)

#### Bước 2: Cấu hình Environment
```bash
# Backend .env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend .env (if needed)
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

## Triển khai Frontend SSO

### Cài đặt dependencies

```bash
cd frontend
npm install @google-cloud/oauth2 facebook-login-for-react react-github-login
```

### Tạo SSO Components

1. **Google Login Component**:
```typescript
// components/GoogleLoginButton.tsx
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
  const { ssoLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      // Decode JWT token
      const userInfo = jwt_decode(credentialResponse.credential);
      await ssoLogin('google', credentialResponse.credential, userInfo);
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
};
```

2. **Facebook Login Component**:
```typescript
// components/FacebookLoginButton.tsx
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const FacebookLoginButton = () => {
  const { ssoLogin } = useAuth();

  const handleFacebookResponse = async (response: any) => {
    if (response.accessToken) {
      try {
        await ssoLogin('facebook', response.accessToken, response);
      } catch (error) {
        console.error('Facebook login failed:', error);
      }
    }
  };

  return (
    <FacebookLogin
      appId={import.meta.env.VITE_FACEBOOK_APP_ID}
      callback={handleFacebookResponse}
      render={(renderProps: any) => (
        <button onClick={renderProps.onClick}>
          Login with Facebook
        </button>
      )}
    />
  );
};
```

3. **GitHub Login Component**:
```typescript
// components/GitHubLoginButton.tsx
import GitHubLogin from 'react-github-login';

const GitHubLoginButton = () => {
  const { ssoLogin } = useAuth();

  const handleGitHubSuccess = async (response: any) => {
    try {
      // Get user info from GitHub API
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${response.code}`,
        },
      });
      const userInfo = await userResponse.json();
      
      await ssoLogin('github', response.code, userInfo);
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };

  return (
    <GitHubLogin
      clientId={import.meta.env.VITE_GITHUB_CLIENT_ID}
      onSuccess={handleGitHubSuccess}
      onFailure={(error: any) => console.error('GitHub login failed:', error)}
    />
  );
};
```

## API Endpoints

### POST `/api/auth/sso/`
Đăng nhập bằng SSO

**Request Body:**
```json
{
  "provider": "google|facebook|github",
  "access_token": "provider-access-token",
  "user_info": {
    "id": "provider-user-id",
    "email": "user@example.com",
    "given_name": "John",
    "family_name": "Doe"
  }
}
```

**Response:**
```json
{
  "message": "SSO login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "google_12345",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": true
  },
  "created": false
}
```

## Flow hoạt động

1. **User click SSO button** → Frontend gọi provider OAuth
2. **Provider returns token** → Frontend nhận access token + user info
3. **Frontend calls backend** → POST `/api/auth/sso/` với token và user info
4. **Backend verifies token** → Gọi provider API để verify token
5. **Backend creates/links user** → Tạo user mới hoặc link với account existing
6. **Backend returns session** → User được đăng nhập và redirect

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid SSO token"**
   - Kiểm tra token expiry
   - Verify client ID/secret đúng
   - Ensure redirect URI match

2. **"Email already exists"**
   - System sẽ tự động link SSO với account existing
   - User có thể đăng nhập bằng password hoặc SSO

3. **CORS errors**
   - Thêm domain vào authorized origins
   - Check redirect URIs configuration

4. **Provider API errors**
   - Verify API permissions enabled
   - Check rate limits
   - Ensure app is not in sandbox mode (for Facebook)

## Bảo mật

- **Token verification**: Luôn verify token với provider trước khi tạo session
- **Email verification**: SSO users được mark verified automatically
- **Account linking**: Tự động link SSO với existing email accounts
- **Rate limiting**: Apply rate limiting cho SSO endpoints
- **Secure storage**: Không store sensitive SSO data trong database

## Testing

```bash
# Test SSO endpoints
curl -X POST http://localhost:8000/api/auth/sso/ \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "access_token": "test-token",
    "user_info": {
      "id": "12345",
      "email": "test@example.com",
      "given_name": "Test",
      "family_name": "User"
    }
  }'
```
