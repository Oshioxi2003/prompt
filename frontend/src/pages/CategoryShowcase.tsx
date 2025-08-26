import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService, type Category } from '../services/api';

const CategoryShowcase: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFeaturedCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-blue-950/20 to-indigo-950/20">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-indigo/10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-6 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-brand-blue/20 rounded-full text-brand-blue/90 text-sm font-medium mb-6 glass">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Prompt AI Library
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-text-primary via-brand-blue/90 to-brand-indigo/90 bg-clip-text text-transparent mb-6">
              Thư Viện Prompt AI
            </h1>
            
            <p className="text-xl lg:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              Khám phá những Prompt AI chuyên sâu được thiết kế, tổng hợp và điều chỉnh từ các chuyên gia trong ngành, 
              <span className="font-semibold text-brand-blue/90"> giúp tăng tốc và nâng cao hiệu suất làm việc</span> của bạn.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-indigo rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    className="w-full px-6 py-5 pl-14 text-lg glass border border-surface-700/50 rounded-2xl focus:ring-2 focus:ring-brand-blue focus:border-transparent text-text-primary placeholder:text-text-tertiary shadow-theme transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <svg className="w-6 h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-text-secondary text-lg">Đang tải danh mục...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-brand-red/20 border border-brand-red/30 rounded-xl p-8 max-w-md mx-auto glass">
              <svg className="w-16 h-16 text-brand-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-brand-red/90 text-lg mb-4">{error}</p>
              <button 
                onClick={loadCategories}
                className="btn-primary"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-6 pb-16">
          {/* Categories Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredCategories.map((category) => (
                <Link 
                  key={category.id}
                  to={`/prompts?category=${encodeURIComponent(category.name)}`}
                  className="group block h-full"
                >
                  <div className="relative h-full">
                    {/* Glow effect */}
                    <div 
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"
                      style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}80)` }}
                    ></div>
                    
                    <div className="relative glass rounded-3xl p-8 shadow-theme hover:shadow-theme-lg transition-all duration-500 transform hover:-translate-y-3 border border-surface-700/50 overflow-hidden group h-full flex flex-col">
                      {/* Subtle pattern overlay */}
                      <div 
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                          backgroundImage: `radial-gradient(circle at 1px 1px, ${category.color} 1px, transparent 0)`,
                          backgroundSize: '24px 24px'
                        }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Header with Icon and Arrow - Fixed Height */}
                        <div className="flex items-start justify-between mb-8 h-20">
                          <div className="flex items-center space-x-4">
                            {/* Icon Container */}
                            <div 
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme group-hover:scale-110 transition-all duration-300 glass"
                              style={{ 
                                background: `linear-gradient(135deg, ${category.color}15, ${category.color}25)`,
                                border: `1px solid ${category.color}20`
                              }}
                            >
                              {category.image_url ? (
                                <img 
                                  src={category.image_url} 
                                  alt={category.name}
                                  className="w-10 h-10 object-contain filter drop-shadow-sm"
                                />
                              ) : (
                                <span className="text-2xl filter drop-shadow-sm">{category.icon_emoji || '📁'}</span>
                              )}
                              
                              {/* Pulse effect */}
                              <div 
                                className="absolute inset-0 rounded-2xl opacity-30 animate-pulse"
                                style={{ background: `linear-gradient(135deg, ${category.color}10, transparent)` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Arrow with enhanced styling */}
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-theme glass"
                            style={{ 
                              background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
                              border: `1px solid ${category.color}30`
                            }}
                          >
                            <svg 
                              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                              style={{ color: category.color }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Title with gradient - Fixed Height */}
                        <h3 className="text-2xl font-bold mb-6 group-hover:scale-[1.02] transition-transform duration-300 min-h-[3rem] flex items-center">
                          <span 
                            className="bg-gradient-to-r bg-clip-text text-transparent"
                            style={{ 
                              backgroundImage: `linear-gradient(135deg, ${category.color}, ${category.color}CC)` 
                            }}
                          >
                            {category.name}
                          </span>
                        </h3>

                        {/* Description - Fixed Height */}
                        <p className="text-text-secondary mb-6 leading-relaxed text-sm flex-1 min-h-[4rem] flex items-center">
                          {category.description}
                        </p>

                        {/* Stats and Badge - Fixed Height */}
                        <div className="flex items-center justify-between h-8">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full glass"
                              style={{ 
                                background: `${category.color}10`,
                                color: category.color,
                                border: `1px solid ${category.color}20`
                              }}
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {category.prompts_count} prompts
                            </div>
                          </div>

                          {/* Featured Badge */}
                          {category.is_featured && (
                            <div 
                              className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-theme"
                              style={{ 
                                background: `linear-gradient(135deg, ${category.color}, ${category.color}DD)`
                              }}
                            >
                              ⭐ Nổi bật
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* No Results */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto w-24 h-24 text-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Không tìm thấy danh mục nào</h3>
            <p className="text-text-secondary mb-6">Hãy thử thay đổi từ khóa tìm kiếm.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="btn-primary"
            >
              Xem tất cả danh mục
            </button>
          </div>
        )}

      {/* CTA Section */}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="mt-24">
          <div className="relative container mx-auto px-6">
            <div className="relative bg-gradient-to-br from-surface-800 via-brand-blue/10 to-brand-indigo/10 rounded-3xl p-12 lg:p-16 shadow-theme-lg border border-surface-700/50 overflow-hidden glass">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-brand-indigo/10 to-brand-blue/10 rounded-full blur-2xl"></div>
              
              <div className="relative text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center px-4 py-2 bg-brand-blue/20 rounded-full text-brand-blue/90 text-sm font-medium mb-6 glass">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Khám phá thêm
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-text-primary via-brand-blue/90 to-brand-indigo/90 bg-clip-text text-transparent">
                    Không tìm thấy đúng thể loại?
                  </span>
                </h2>
                
                <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
                  Khám phá thêm nhiều prompt chất lượng cao trong thư viện của chúng tôi hoặc đề xuất danh mục mới
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/prompts"
                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r from-brand-blue to-brand-indigo text-white hover:from-brand-blue/90 hover:to-brand-indigo/90 shadow-theme hover:shadow-theme-lg transform hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Xem tất cả Prompts
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-indigo/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link 
                    to="/contact"
                    className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 glass text-text-primary border-2 border-surface-700 hover:border-brand-blue/50 shadow-theme hover:shadow-theme-lg transform hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Đề xuất danh mục mới
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryShowcase;
