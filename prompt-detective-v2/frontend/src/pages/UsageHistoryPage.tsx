import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpload } from '../hooks/useUpload';
import { 
  FileVideo, 
  FileImage, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  Copy, 
  Filter,
  Search,
  ChevronDown,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';

interface UsageHistoryItem {
  job_id: string;
  filename: string;
  content_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  main_prompt?: string;
  prompt_preview?: string;
  summary?: {
    resolution?: string;
    duration?: number;
    frames_analyzed?: number;
    analysis_method?: string;
    enhancement_features?: string[];
  };
  enhancement_features?: string[];
  created_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
  thumbnail_url?: string;
}

const UsageHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { listJobs } = useUpload();
  const [items, setItems] = useState<UsageHistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<UsageHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UsageHistoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadUsageHistory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedFilter, searchQuery]);

  const loadUsageHistory = async () => {
    try {
      setIsLoading(true);
      const response = await listJobs('', 50, 0); // Load more items for history
      setItems(response.jobs || []);
    } catch (error) {
      console.error('Failed to load usage history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Apply content type filter
    if (selectedFilter === 'image' || selectedFilter === 'video') {
      filtered = filtered.filter(item => item.content_type?.startsWith(selectedFilter));
    } else if (selectedFilter === 'completed' || selectedFilter === 'failed') {
      filtered = filtered.filter(item => item.status === selectedFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.main_prompt && item.main_prompt.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  const getThumbnailUrl = (item: UsageHistoryItem) => {
    // Return thumbnail URL if available, otherwise return placeholder
    if (item.thumbnail_url) {
      // thumbnail_url already contains the correct path like "/static/thumbnails/..."
      return item.thumbnail_url;
    }
    return item.content_type?.startsWith('video') 
      ? '/placeholder-video.jpg'
      : '/placeholder-image.jpg';
  };

  const stats = {
    total: items.length,
    completed: items.filter(item => item.status === 'completed').length,
    videos: items.filter(item => item.content_type?.startsWith('video')).length,
    images: items.filter(item => item.content_type?.startsWith('image')).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Parallax Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Usage History
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Track your AI analysis journey and revisit your generated prompts
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { label: 'Total Analyses', value: stats.total, icon: TrendingUp, color: 'bg-white/20' },
                { label: 'Completed', value: stats.completed, icon: Sparkles, color: 'bg-green-500/20' },
                { label: 'Videos', value: stats.videos, icon: FileVideo, color: 'bg-blue-500/20' },
                { label: 'Images', value: stats.images, icon: FileImage, color: 'bg-purple-500/20' }
              ].map((stat, index) => (
                <div key={index} className={`${stat.color} backdrop-blur-sm rounded-lg p-4 text-white`}>
                  <stat.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files or prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="image">Images Only</option>
                <option value="video">Videos Only</option>
                <option value="completed">Completed Only</option>
                <option value="failed">Failed Only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* History Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your history...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Start analyzing files to see your history here'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.job_id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setShowModal(true);
                }}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={getThumbnailUrl(item)}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log(`❌ Failed to load thumbnail: ${getThumbnailUrl(item)} for ${item.filename}`);
                      // Fallback to placeholder
                      e.currentTarget.src = item.content_type === 'video' 
                        ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzk5ZjZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDA3Y2M3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VmlkZW88L3RleHQ+PC9zdmc+'
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzk5ZjZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDA3Y2M3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  
                  {/* Content Type Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.content_type === 'video' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {item.content_type?.startsWith('video') ? (
                        <FileVideo className="w-3 h-3" />
                      ) : (
                        <FileImage className="w-3 h-3" />
                      )}
                      <span>{item.content_type}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Enhancement Features Badge */}
                  {item.enhancement_features && item.enhancement_features.length > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Enhanced</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 truncate mb-2">{item.filename}</h3>
                  
                  {/* Summary Info */}
                  {item.summary && (
                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                      {item.summary.resolution && (
                        <div>Resolution: {item.summary.resolution}</div>
                      )}
                      {item.summary.duration && (
                        <div>Duration: {item.summary.duration.toFixed(1)}s</div>
                      )}
                      {item.summary.frames_analyzed && (
                        <div>Frames: {item.summary.frames_analyzed}</div>
                      )}
                    </div>
                  )}

                  {/* Prompt Preview */}
                  {item.prompt_preview && (
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {item.prompt_preview}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {item.processing_time_seconds && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.processing_time_seconds}s</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    {item.main_prompt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.main_prompt!);
                        }}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        title="Copy prompt"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for detailed view */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.filename}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Full prompt display */}
              {selectedItem.main_prompt && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Generated Prompt</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedItem.main_prompt}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => copyToClipboard(selectedItem.main_prompt!)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Prompt</span>
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Additional details */}
              {selectedItem.enhancement_features && selectedItem.enhancement_features.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Enhancement Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.enhancement_features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {feature.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageHistoryPage;
