import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-lg flex items-center justify-center shadow-theme">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-indigo bg-clip-text text-transparent">
              PromptHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-text-secondary hover:text-brand-blue transition-colors font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/categories"
              className="text-text-secondary hover:text-brand-blue transition-colors font-medium"
            >
              Danh mục
            </Link>
            <Link
              to="/prompts"
              className="text-text-secondary hover:text-brand-blue transition-colors font-medium"
            >
              Thư viện
            </Link>
            <Link
              to="/contact"
              className="text-text-secondary hover:text-brand-blue transition-colors font-medium"
            >
              Liên hệ
            </Link>
          </nav>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-4">
            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg glass hover:bg-surface-100 transition-colors shadow-theme"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.first_name?.[0] || user.username[0]}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-text-secondary">
                    {user.first_name || user.username}
                  </span>
                  <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-theme-lg border border-surface-200/50 py-2">
                    <div className="px-4 py-2 border-b border-surface-200/50">
                      <p className="text-sm font-medium text-text-primary">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-text-tertiary">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Cài đặt
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-surface-100 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-brand-blue transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-brand-blue to-brand-indigo text-white rounded-lg hover:from-brand-blue/90 hover:to-brand-indigo/90 transition-all duration-300 transform hover:scale-105 shadow-theme"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg glass hover:bg-surface-100 transition-colors shadow-theme"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-surface-200/50">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-text-secondary hover:text-brand-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/categories"
                className="px-4 py-2 text-text-secondary hover:text-brand-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Danh mục
              </Link>
              <Link
                to="/prompts"
                className="px-4 py-2 text-text-secondary hover:text-brand-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Thư viện
              </Link>
              <Link
                to="/contact"
                className="px-4 py-2 text-text-secondary hover:text-brand-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
