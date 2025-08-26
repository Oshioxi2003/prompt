# PromptHub - AI Prompt Library with Authentication

A modern web application for managing and sharing AI prompts with a complete authentication system including SSO integration.

## Features

### 🔐 Authentication System
- **User Registration & Login**: Secure user registration with email verification
- **Password Reset**: Forgot password functionality with email-based reset
- **SSO Integration**: Single Sign-On with Google, Facebook, and GitHub
- **Session Management**: Secure session-based authentication
- **User Profiles**: User profile management with avatar support

### 🎨 UI/UX Features
- **Dark/Light Theme**: Beautiful theme switching with smooth transitions
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Glass morphism effects, gradients, and animations
- **Professional Layout**: Perfectly aligned components and cards

### 📚 Prompt Management
- **Category System**: Organized prompt categories with images and colors
- **Search & Filter**: Advanced search and filtering capabilities
- **Like System**: User interaction with like functionality
- **Tag System**: Flexible tagging system with custom colors

## Tech Stack

### Backend
- **Django 5.2**: Modern Python web framework
- **Django REST Framework**: Powerful API framework
- **Custom User Model**: Extended user model with additional fields
- **Session Authentication**: Secure session-based auth
- **Email Integration**: SMTP email for verification and password reset

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Latest Tailwind with modern syntax
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: State management for theme and auth

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn
- MySQL/PostgreSQL (optional, SQLite for development)

### Backend Setup

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Load sample data**
```bash
python manage.py load_sample_data
```

8. **Start the server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Install additional dependencies**
```bash
npm install axios
```

4. **Start the development server**
```bash
npm run dev
```

## Configuration

### Email Setup
For email functionality (verification, password reset), configure your email settings in `backend/prompt_library/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'your-email@gmail.com'
```

### SSO Configuration
To enable SSO, add your provider credentials in `backend/prompt_library/settings.py`:

```python
SSO_PROVIDERS = {
    'google': {
        'client_id': 'your-google-client-id',
        'client_secret': 'your-google-client-secret',
    },
    'facebook': {
        'app_id': 'your-facebook-app-id',
        'app_secret': 'your-facebook-app-secret',
    },
    'github': {
        'client_id': 'your-github-client-id',
        'client_secret': 'your-github-client-secret',
    },
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/password-reset/confirm/` - Confirm password reset
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/sso/` - SSO login
- `GET /api/auth/verify-email/<token>/` - Verify email
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Prompts
- `GET /api/prompts/` - List prompts with pagination
- `GET /api/prompts/<id>/` - Get prompt details
- `POST /api/prompts/<id>/like/` - Like a prompt
- `GET /api/prompts/stats/` - Get prompt statistics

### Categories
- `GET /api/categories/` - List categories
- `GET /api/categories/<id>/` - Get category details
- `GET /api/categories/featured/` - Get featured categories

### Tags
- `GET /api/tags/` - List tags

## Usage

### User Registration
1. Navigate to `/register`
2. Fill in the registration form
3. Check your email for verification link
4. Click the verification link to activate your account

### User Login
1. Navigate to `/login`
2. Enter your email and password
3. Or use SSO buttons for quick login

### Password Reset
1. Navigate to `/forgot-password`
2. Enter your email address
3. Check your email for reset link
4. Click the link and set a new password

### SSO Login
1. Click on any SSO provider button (Google, Facebook, GitHub)
2. Complete the OAuth flow
3. Your account will be created automatically if it doesn't exist

## File Structure

```
promt/
├── backend/
│   ├── prompt_library/
│   │   ├── settings.py          # Django settings
│   │   └── urls.py              # Main URL configuration
│   ├── prompts/
│   │   ├── models.py            # Database models
│   │   ├── serializers.py       # API serializers
│   │   ├── views.py             # API views
│   │   └── urls.py              # API URLs
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   └── App.tsx              # Main app component
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
