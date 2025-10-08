import React, { useEffect, useState, useRef } from 'react';
import { X, FileVideo, FileImage, Loader2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  filename: string;
  contentType: string;
  onComplete: () => void;
}

interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage?: string;
  message?: string;
  error_message?: string;
}

interface ProgressUpdate {
  job_id: number;
  status: string;
  progress: number;
  stage: string;
  message: string;
  error_message?: string;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  jobId,
  filename,
  contentType,
  onComplete
}) => {
  const [jobStatus, setJobStatus] = useState<JobStatus>({ status: 'pending', progress: 0 });
  const [stage, setStage] = useState<string>('Initializing...');
  const [pollCount, setPollCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || !jobId) return;

    // Reset state when modal opens
    setJobStatus({ status: 'pending', progress: 0 });
    setStage('Initializing...');
    setPollCount(0);
    setIsCancelling(false);
    setShowCancelConfirm(false);

    // Check if this is a temporary job ID (starts with 'temp_')
    const isTempJobId = jobId.startsWith('temp_');
    
    if (isTempJobId) {
      console.log('🔄 Detected temporary job ID, showing upload progress...');
      setStage('Uploading and analyzing file...');
      setJobStatus({ status: 'processing', progress: 10 });
      return; // Don't start polling for temp IDs
    }

    console.log('📊 Starting job polling for real job ID:', jobId);

    const pollJob = async () => {
      try {
        setPollCount(prev => prev + 1);
        const response = await api.get(`/jobs/${jobId}`);
        
        if (response.data) {
          const data = response.data;
          const currentProgress = data.progress || 0;
          
          console.log(`📊 Job ${jobId} - Status: ${data.status}, Progress: ${currentProgress}%`);
          
          setJobStatus({
            status: data.status,
            progress: currentProgress,
            error_message: data.error_message
          });

          // Update stage description based on EXACT backend progress ranges
          if (data.status === 'pending') {
            setStage('Queuing for processing...');
          } else if (data.status === 'processing') {
            if (currentProgress <= 10) {
              setStage('File uploaded successfully');
            } else if (currentProgress <= 20) {
              setStage('Starting content analysis...');
            } else if (currentProgress <= 40) {
              setStage(contentType?.startsWith('video') ? 'Extracting key frames from video...' : 'Analyzing image structure...');
            } else if (currentProgress <= 70) {
              setStage('Running AI processing and analysis...');
            } else if (currentProgress <= 90) {
              setStage('Generating AI prompts...');
            } else if (currentProgress < 100) {
              setStage('Finalizing results...');
            }
          } else if (data.status === 'completed') {
            setStage('Analysis complete!');
            setTimeout(() => {
              onComplete();
              onClose();
            }, 1500); // Shorter delay for better UX
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
          } else if (data.status === 'failed') {
            setStage('Analysis failed');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
          } else if (data.status === 'cancelled') {
            setStage('Cancelled by user');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll job status:', error);
        
        // Stop polling after too many failed attempts
        if (pollCount > 15) {
          setJobStatus(prev => ({ ...prev, status: 'failed' }));
          setStage('Connection lost - please refresh and try again');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          return;
        }
        
        // Handle different types of errors
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 401) {
            setJobStatus(prev => ({ ...prev, status: 'failed' }));
            setStage('Session expired - please refresh and login again');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
          } else if (axiosError.response?.status === 404) {
            // Job might not be created yet, keep trying for a bit
            if (pollCount <= 5) {
              setStage('Connecting to analysis service...');
            } else {
              setJobStatus(prev => ({ ...prev, status: 'failed' }));
              setStage('Job not found - it may have been deleted');
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
              }
            }
          } else {
            // For other errors, keep trying for a bit
            if (pollCount <= 5) {
              setStage('Retrying connection...');
            } else {
              setJobStatus(prev => ({ ...prev, status: 'failed' }));
              setStage('Error checking job status - please try again');
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
              }
            }
          }
        } else {
          setJobStatus(prev => ({ ...prev, status: 'failed' }));
          setStage('Network error - please check your connection');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      }
    };

    // Only start polling for real job IDs - FASTER POLLING (1 second) FOR SMOOTHER UPDATES
    if (!isTempJobId) {
      pollingIntervalRef.current = setInterval(pollJob, 1000); // Changed from 2000 to 1000ms
      pollJob(); // Initial call
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [isOpen, jobId, onComplete, onClose, contentType, pollCount]);

  const handleCancelJob = async () => {
    if (isCancelling) return;
    
    setIsCancelling(true);
    
    try {
      console.log('🛑 Cancelling job:', jobId);
      const response = await api.delete(`/progress/${jobId}/cancel`);
      
      if (response.data.success) {
        console.log('✅ Job cancelled successfully');
        setJobStatus({
          status: 'cancelled',
          progress: 0,
          error_message: 'Job cancelled by user'
        });
        setStage('Cancelled by user');
        
        // Clear polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        
        // Close modal after brief delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to cancel job:', error);
      setJobStatus(prev => ({
        ...prev,
        error_message: 'Failed to cancel job. Please try again.'
      }));
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-orange-500" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getProgressColor = () => {
    switch (jobStatus.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const canCancel = jobStatus.status === 'pending' || jobStatus.status === 'processing';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Processing Analysis</h3>
          <div className="flex items-center space-x-2">
            {canCancel && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
                className="text-orange-500 hover:text-orange-700 transition-colors text-sm font-medium px-3 py-1 border border-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Cancel job"
              >
                Cancel
              </button>
            )}
            {(jobStatus.status === 'completed' || jobStatus.status === 'failed' || jobStatus.status === 'cancelled') && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-900 mb-3">
              Are you sure you want to cancel this analysis? This will not count towards your daily quota.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelJob}
                disabled={isCancelling}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, Continue
              </button>
            </div>
          </div>
        )}

        {/* File Info */}
        <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
          {contentType === 'video' ? (
            <FileVideo className="w-8 h-8 text-blue-500 flex-shrink-0" />
          ) : (
            <FileImage className="w-8 h-8 text-green-500 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{filename}</p>
            <p className="text-xs text-gray-500 capitalize">{contentType} Analysis</p>
          </div>
        </div>

        {/* Status Icon and Stage */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {jobStatus.status === 'completed' ? 'Complete!' : 
             jobStatus.status === 'failed' ? 'Failed' :
             jobStatus.status === 'cancelled' ? 'Cancelled' :
             'Processing...'}
          </p>
          <p className="text-sm text-gray-600">{stage}</p>
          {jobStatus.error_message && (
            <p className="text-sm text-red-600 mt-2">{jobStatus.error_message}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{jobStatus.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
              style={{ width: `${jobStatus.progress}%` }}
            />
          </div>
        </div>

        {/* Processing Steps Indicator - SYNCED WITH BACKEND STAGES */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 mb-3">Processing Steps:</div>
          {[
            { name: 'File Upload', threshold: 0, maxThreshold: 10 },
            { name: 'Content Analysis', threshold: 10, maxThreshold: 20 },
            { name: 'Scene Detection', threshold: 20, maxThreshold: 40 },
            { name: 'AI Analysis', threshold: 40, maxThreshold: 70 },
            { name: 'Prompt Generation', threshold: 70, maxThreshold: 90 },
            { name: 'Finalization', threshold: 90, maxThreshold: 100 }
          ].map((step, index) => {
            const isActive = jobStatus.progress >= step.threshold && jobStatus.progress < step.maxThreshold;
            const isCompleted = jobStatus.progress >= step.maxThreshold;
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? (jobStatus.status === 'failed' || jobStatus.status === 'cancelled') ? 'bg-red-500' : 'bg-green-500'
                    : isActive 
                      ? 'bg-blue-500 animate-pulse ring-2 ring-blue-300' 
                      : 'bg-gray-300'
                }`} />
                <span className={`text-sm transition-colors duration-300 ${
                  isCompleted || isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {isActive && jobStatus.status === 'processing' && (
                  <span className="text-xs text-blue-600 ml-auto">In Progress...</span>
                )}
                {isCompleted && jobStatus.status !== 'failed' && jobStatus.status !== 'cancelled' && (
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {jobStatus.status === 'completed' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              View Results
            </button>
          </div>
        )}

        {(jobStatus.status === 'failed' || jobStatus.status === 'cancelled') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;
