import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiService, type PromptListItem, type Category, getDifficultyColor } from "../services/api";

const PromptListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [prompts, setPrompts] = useState<PromptListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load data from API
  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory, searchTerm, currentPage]);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories([{ 
        id: 0, 
        name: "Tất cả", 
        description: "", 
        image_url: null,
        icon_emoji: "📁",
        color: "#6366F1",
        order: 0,
        is_featured: false,
        prompts_count: 0, 
        created_at: "" 
      }, ...categoriesData]);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Không thể tải danh mục');
    }
  };

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory !== "Tất cả") {
        params.category_name = selectedCategory;
      }

      const response = await apiService.getPrompts(params);
      setPrompts(response.results);
      setTotalCount(response.count);
      setError(null);
    } catch (err) {
      console.error('Failed to load prompts:', err);
      setError('Không thể tải danh sách prompt');
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900/20">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-gray-900/90 dark:to-indigo-900/20 backdrop-blur-xl border-b border-blue-100/50 dark:border-blue-800/30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Thư viện Prompt
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
              Khám phá Prompt AI
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Bộ sưu tập prompt được tuyển chọn kỹ lưỡng để <span className="font-semibold text-blue-600 dark:text-blue-400">tối ưu hóa hiệu suất làm việc với AI</span>
            </p>

            {/* Search and Filter */}
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm prompt..."
                      className="w-full px-6 py-4 pl-14 text-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white dark:placeholder-gray-400 shadow-xl transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`group relative px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedCategory === category.name
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <span className="relative z-10 flex items-center">
                      {category.name}
                      {category.prompts_count > 0 && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          selectedCategory === category.name 
                            ? "bg-white/20 text-white" 
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        }`}>
                          {category.prompts_count}
                        </span>
                      )}
                    </span>
                    {selectedCategory !== category.name && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={loadPrompts}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto px-6 py-12">
          {/* Results Count */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-600/50 shadow-md">
              <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Hiển thị <span className="text-blue-600 dark:text-blue-400 font-bold">{prompts.length}</span> trong số <span className="text-blue-600 dark:text-blue-400 font-bold">{totalCount}</span> prompt
              </span>
            </div>
          </div>

          {/* Prompt Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="group relative h-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden h-full flex flex-col">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header with Category and Difficulty - Fixed Height */}
                    <div className="flex justify-between items-start mb-6 h-8">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-800/50">
                          {prompt.category_name}
                        </span>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${getDifficultyColor(prompt.difficulty_display)}`}>
                        {prompt.difficulty_display}
                      </span>
                    </div>
                    
                    {/* Title - Fixed Height */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 min-h-[3rem] flex items-center">
                      <Link to={`/prompts/${prompt.id}`} className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors line-clamp-2">
                        {prompt.title}
                      </Link>
                    </h3>
                    
                    {/* Description - Fixed Height */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3 min-h-[4.5rem]">
                      {prompt.description}
                    </p>
                    
                    {/* Tags - Fixed Height */}
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[2rem]">
                      {prompt.tags_detail.slice(0, 3).map(tag => (
                        <span 
                          key={tag.id} 
                          className="px-3 py-1 text-xs font-medium rounded-full transition-transform hover:scale-105"
                          style={{ 
                            backgroundColor: `${tag.color}15`, 
                            color: tag.color,
                            border: `1px solid ${tag.color}30`
                          }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                      {prompt.tags_detail.length > 3 && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          +{prompt.tags_detail.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats - Fixed Height */}
                    <div className="flex items-center justify-between mb-6 h-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="font-medium">{prompt.views_count}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="font-medium">{prompt.likes_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button - Push to bottom */}
                    <div className="mt-auto">
                      <Link 
                        to={`/prompts/${prompt.id}`}
                        className="group/btn inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                      >
                        <span>Xem chi tiết</span>
                        <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {prompts.length === 0 && (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                  <svg className="w-16 h-16 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy prompt nào</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để khám phá thêm nhiều prompt chất lượng.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tất cả');
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold"
                >
                  Xem tất cả prompts
                </button>
                <Link 
                  to="/"
                  className="block w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-700 dark:text-gray-200 py-3 px-6 rounded-2xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 font-semibold"
                >
                  Quay về danh mục
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptListPage;
