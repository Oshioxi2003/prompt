import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiService, type Prompt, getDifficultyColor, formatDate } from "../services/api";

// Types for AI Chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface AIModel {
  id: string;
  name: string;
  color: string;
  icon: string;
  available: boolean;
}

const PromptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  // AI Chat states
  const [selectedModel, setSelectedModel] = useState<string>('gemini');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Available AI Models
  const aiModels: AIModel[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      color: 'from-blue-500 to-cyan-500',
      icon: '🤖',
      available: true
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      color: 'from-green-500 to-emerald-500', 
      icon: '💬',
      available: true
    },
    {
      id: 'claude',
      name: 'Claude',
      color: 'from-purple-500 to-pink-500',
      icon: '🧠',
      available: true
    }
  ];

  useEffect(() => {
    if (id) {
      loadPrompt(Number(id));
    }
  }, [id]);

  const loadPrompt = async (promptId: number) => {
    try {
      setLoading(true);
      const promptData = await apiService.getPrompt(promptId);
      setPrompt(promptData);
      setError(null);
    } catch (err) {
      console.error('Failed to load prompt:', err);
      setError('Không thể tải thông tin prompt');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg className="mx-auto w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{error}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Vui lòng thử lại sau.</p>
        <div className="space-x-4">
          <button 
            onClick={() => loadPrompt(Number(id))}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
          <Link to="/prompts" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
            ← Quay lại thư viện
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <svg className="mx-auto w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.816-6.207-2.173M5.636 5.636L18.364 18.364" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Prompt không tồn tại</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Rất tiếc, chúng tôi không tìm thấy prompt này.</p>
        <Link to="/prompts" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
          ← Quay lại thư viện
        </Link>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLike = async () => {
    if (!liked) {
      try {
        const response = await apiService.likePrompt(prompt.id);
        setPrompt(prev => prev ? { ...prev, likes_count: response.likes_count } : null);
        setLiked(true);
      } catch (err) {
        console.error('Failed to like prompt:', err);
      }
    }
  };

  // AI Chat functions
  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsGenerating(true);

    try {
      // Call real AI API through backend
      const response = await callAIAPI(userInput, selectedModel);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: selectedModel
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn.',
        timestamp: new Date(),
        model: selectedModel
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const callAIAPI = async (input: string, model: string): Promise<string> => {
    try {
      const response = await apiService.chatWithAI(prompt!.id, model, input);
      return response.response;
    } catch (error: any) {
      console.error('AI API error:', error);
      
      // Handle different error types
      if (error.response?.status === 429) {
        throw new Error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
      } else if (error.response?.status === 503) {
        throw new Error('Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.');
      }
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const usePromptAsInput = () => {
    if (prompt?.prompt_text) {
      setUserInput(prompt.prompt_text);
      setShowChat(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Trang chủ</Link></li>
          <li><span>/</span></li>
          <li><Link to="/prompts" className="hover:text-indigo-600 dark:hover:text-indigo-400">Thư viện Prompt</Link></li>
          <li><span>/</span></li>
          <li className="text-gray-900 dark:text-white">{prompt.title}</li>
        </ol>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Category and Difficulty - Fixed Height */}
          <div className="flex flex-wrap items-center gap-3 mb-6 h-8">
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
              {prompt.category_name}
            </span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getDifficultyColor(prompt.difficulty_display)}`}>
              {prompt.difficulty_display}
            </span>
          </div>
          
          {/* Title - Fixed Height */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 min-h-[4rem] flex items-center">
            {prompt.title}
          </h1>
          
          {/* Description - Fixed Height */}
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 min-h-[3rem] flex items-center">
            {prompt.description}
          </p>

          {/* Meta info - Fixed Height */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8 h-6">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{formatDate(prompt.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{prompt.likes_count} lượt thích</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>{prompt.views_count} lượt xem</span>
            </div>
          </div>

          {/* Tags - Fixed Height */}
          <div className="flex flex-wrap gap-2 mb-8 min-h-[2.5rem] items-center">
            {prompt.tags_detail.map(tag => (
              <span 
                key={tag.id} 
                className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                #{tag.name}
              </span>
            ))}
          </div>

          {/* Action buttons - Fixed Height */}
          <div className="flex flex-wrap gap-3 h-10 items-center">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? "Đã sao chép!" : "Sao chép Prompt"}
            </button>
            
            <button 
              onClick={usePromptAsInput}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Test với AI
            </button>
            
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                liked 
                  ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <svg className={`w-4 h-4 ${liked ? "fill-current" : "fill-none"}`} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {liked ? "Đã thích" : "Thích"}
            </button>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nội dung Prompt</h2>
            <button 
              onClick={handleCopy}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title="Sao chép"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-mono bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            {prompt.prompt_text}
          </pre>
        </div>

        {/* AI Chat Section */}
        {showChat && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-8">
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                  Test Prompt với AI
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title="Xóa lịch sử chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title="Đóng chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* AI Model Selector */}
              <div className="flex flex-wrap gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  Chọn AI Model:
                </span>
                {aiModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={!model.available}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedModel === model.id
                        ? `bg-gradient-to-r ${model.color} text-white shadow-lg`
                        : model.available
                        ? "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="mr-2">{model.icon}</span>
                    {model.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">Bắt đầu cuộc trò chuyện</p>
                  <p className="text-sm">Nhập câu hỏi của bạn để test prompt với AI</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg text-left ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      {message.role === 'assistant' && message.model && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <span>{aiModels.find(m => m.id === message.model)?.icon}</span>
                          {aiModels.find(m => m.id === message.model)?.name}
                        </div>
                      )}
                      
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div 
                          className="ai-response"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      )}
                      
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm">AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left">
              <div className="flex items-start justify-start gap-3">
                <div className="flex-1">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Nhập câu hỏi hoặc ngữ cảnh để test prompt..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-left"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Enter để gửi, Shift+Enter để xuống dòng</span>
                    <span>{userInput.length}/1000</span>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                  {isGenerating ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link 
            to="/prompts" 
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại thư viện
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Prompt #{prompt.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailPage;
