import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpload } from '../hooks/useUpload';
import { UploadComponent } from '../components/UploadComponent';
import ProgressModal from '../components/ProgressModal';
import TutorialModal from '../components/TutorialModal';
import UsageStatus from '../components/UsageStatus';
import JobResultModal from '../components/JobResultModal';
import { useNavigate } from 'react-router-dom';
import { History, Eye, Copy, Download, Check } from 'lucide-react';

interface JobResult {
  job_id: string;
  filename: string;
  content_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  main_prompt?: string;
  prompt_preview?: string;
  summary?: {
    content_type: string;
    duration?: number;
    resolution?: string;
    fps?: number;
    frames_analyzed?: number;
    analysis_method?: string;
    enhancement_features?: string[];
  };
  enhancement_features?: string[];
  has_full_prompt?: boolean;
  analysis_quality?: {
    has_enhancement_features: boolean;
    has_detailed_analysis: boolean;
    analysis_timestamp: string;
    processing_successful: boolean;
  };
  error?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
  thumbnail_url?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { uploadFile, listJobs } = useUpload();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<JobResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobInfo, setActiveJobInfo] = useState<{
    filename: string;
    contentType: string;
  } | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  // Tutorial system initialization
  useEffect(() => {
    // Check for tutorial when user is available and component is mounted
    if (user && user.id) {
      const tutorialKey = `hasSeenTutorial_${user.id}`;
      const hasSeenTutorial = localStorage.getItem(tutorialKey);
      
      console.log('Tutorial check:', { userId: user.id, hasSeenTutorial, tutorialKey });
      
      if (!hasSeenTutorial) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          setShowTutorial(true);
        }, 500);
      }
    }
  }, [user]);

  const handleTutorialComplete = () => {
    if (user && user.id) {
      const tutorialKey = `hasSeenTutorial_${user.id}`;
      localStorage.setItem(tutorialKey, 'true');
      console.log('Tutorial completed for user:', user.id);
    }
    setShowTutorial(false);
  };

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const loadRecentJobs = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await listJobs('', 5, 0);
      if (response.jobs) {
        setRecentAnalyses(response.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      console.log('🚀 Starting upload for file:', file.name);
      
      // Generate a temporary job ID to show modal immediately
      const tempJobId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Immediately show progress modal with initial state
      setActiveJobInfo({
        filename: file.name,
        contentType: file.type
      });
      setActiveJobId(tempJobId);
      console.log('✅ Progress modal triggered immediately with temp ID:', tempJobId);
      
      const response = await uploadFile(file, (progress) => {
        console.log('📤 Upload progress:', progress);
      });
      
      console.log('📡 Upload response received:', response);
      
      // Set real job ID from response - handle different response formats
      const realJobId = response.job_id || (response as any).id || (response as any).jobId;
      if (realJobId) {
        console.log('🔄 Updating to real job ID:', realJobId);
        setActiveJobId(String(realJobId)); // Update with real job ID
        
        // Refresh recent jobs after upload
        setTimeout(() => {
          loadRecentJobs();
        }, 1000);
      } else {
        console.error('❌ No job ID in upload response:', response);
        // Clear the modal if no job ID received
        setActiveJobId(null);
        setActiveJobInfo(null);
      }
    } catch (error) {
      console.error('💥 Upload failed:', error);
      // Clear the modal on error
      setActiveJobId(null);
      setActiveJobInfo(null);
    }
  };

  const handleJobComplete = () => {
    setActiveJobId(null);
    setActiveJobInfo(null);
    loadRecentJobs();
  };

  const handleViewJob = (job: JobResult) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleCopyPrompt = async (prompt: string, jobId: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(jobId);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const handleDownloadPrompt = (job: JobResult) => {
    if (!job.main_prompt) return;
    
    const blob = new Blob([job.main_prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.filename}_prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDashboardStats = () => {
    const completedJobs = recentAnalyses.filter(job => job.status === 'completed').length;
    const processingJobs = recentAnalyses.filter(job => job.status === 'processing' || job.status === 'pending').length;
    const avgProcessingTime = recentAnalyses
      .filter(job => job.processing_time_seconds)
      .reduce((acc, job) => acc + (job.processing_time_seconds || 0), 0) / 
      Math.max(1, recentAnalyses.filter(job => job.processing_time_seconds).length);

    return {
      completedJobs,
      processingJobs,
      avgProcessingTime: Math.round(avgProcessingTime)
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Usage Status */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.full_name || user?.email}! 🎬
                </h1>
                <p className="text-blue-100 text-lg">
                  Transform any video or image into powerful AI prompts with advanced reverse engineering
                </p>
              </div>
              <div className="ml-8 flex items-center space-x-3">
                <UsageStatus compact={true} />
                <button
                  onClick={() => setShowTutorial(true)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                  title="Show Tutorial"
                >
                  Help
                </button>
              </div>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide">Completed Jobs</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.completedJobs}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide">Processing</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.processingJobs}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-100 uppercase tracking-wide">Avg Time (s)</h3>
                <p className="text-3xl font-bold text-white mt-2">{stats.avgProcessingTime || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Status Full Display */}
        <div className="mb-8">
          <UsageStatus compact={false} />
        </div>

        {/* Upload Section */}
        <div className="bg-white shadow-xl rounded-2xl mb-8 border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900">
              🚀 Upload New File
            </h2>
            <p className="mt-2 text-gray-600">
              Drop your video or image to unlock its AI prompt secrets
            </p>
          </div>
          <div className="p-8">
            <UploadComponent
              onUpload={handleUpload}
              maxFileSize={100 * 1024 * 1024}
              acceptedTypes={['image/*', 'video/*']}
              disabled={false}
            />
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📊 Recent Analysis Jobs
                </h2>
                <p className="mt-2 text-gray-600">
                  Track your reverse engineering progress and results
                </p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <History className="w-4 h-4 mr-2" />
                View All History
              </button>
            </div>
          </div>
          <div className="p-8">
            {isLoadingHistory ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-500">Loading recent jobs...</p>
              </div>
            ) : recentAnalyses.length > 0 ? (
              <div className="space-y-6">
                {recentAnalyses.map((job) => (
                  <div key={job.job_id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        {job.thumbnail_url ? (
                          <img 
                            src={job.thumbnail_url} 
                            alt={job.filename}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              console.log(`❌ Failed to load thumbnail: ${job.thumbnail_url}`);
                              const target = e.currentTarget as HTMLImageElement;
                              const fallback = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`text-center ${job.thumbnail_url ? 'hidden' : 'flex'}`} style={{ display: job.thumbnail_url ? 'none' : 'flex' }}>
                          {job.content_type?.startsWith('video') ? (
                            <div className="w-8 h-8 bg-blue-500 rounded text-white flex items-center justify-center text-sm font-bold">
                              🎬
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-500 rounded text-white flex items-center justify-center text-sm font-bold">
                              🖼️
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate mr-4">{job.filename}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              job.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                          {job.processing_time_seconds && (
                            <span>{job.processing_time_seconds}s processing</span>
                          )}
                          {job.summary?.resolution && (
                            <span>{job.summary.resolution}</span>
                          )}
                        </div>

                        {/* Prompt Preview */}
                        {job.prompt_preview && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 line-clamp-2 bg-gray-50 p-3 rounded-lg border">
                              {job.prompt_preview}
                            </p>
                          </div>
                        )}

                        {/* Enhancement Features */}
                        {job.enhancement_features && job.enhancement_features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.enhancement_features.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                              >
                                {feature}
                              </span>
                            ))}
                            {job.enhancement_features.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{job.enhancement_features.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewJob(job)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>

                          {job.main_prompt && (
                            <>
                              <button
                                onClick={() => handleCopyPrompt(job.main_prompt!, job.job_id)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                              >
                                {copiedPrompt === job.job_id ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span>Copy Prompt</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDownloadPrompt(job)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            </>
                          )}

                          {job.status === 'processing' && (
                            <div className="flex items-center space-x-2 text-yellow-600">
                              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎬</span>
                </div>
                <p className="text-gray-500 text-lg font-medium">No analysis jobs yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first file to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={handleTutorialComplete}
          onComplete={handleTutorialComplete}
        />
      )}

      {/* Progress Modal */}
      {activeJobId && activeJobInfo && (
        <ProgressModal
          jobId={activeJobId}
          filename={activeJobInfo.filename}
          contentType={activeJobInfo.contentType}
          isOpen={!!activeJobId}
          onClose={() => {
            setActiveJobId(null);
            setActiveJobInfo(null);
          }}
          onComplete={handleJobComplete}
        />
      )}

      {/* Job Result Modal */}
      {selectedJob && (
        <JobResultModal
          isOpen={showJobModal}
          onClose={() => {
            setShowJobModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}
    </div>
  );
};

export default DashboardPage;
