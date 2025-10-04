import React, { useEffect, useState } from 'react';
import { X, FileVideo, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
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

  useEffect(() => {
    if (!isOpen || !jobId) return;

    // Reset state when modal opens
    setJobStatus({ status: 'pending', progress: 0 });
    setStage('Initializing...');
    setPollCount(0);

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
          setJobStatus({
            status: data.status,
            progress: data.progress || 0,
            error_message: data.error_message
          });

          // Update stage description based on progress and status
          if (data.status === 'pending') {
            setStage('Queuing for processing...');
          } else if (data.status === 'processing') {
            if (data.progress < 20) {
              setStage('Analyzing file structure...');
            } else if (data.progress < 40) {
              setStage(contentType?.startsWith('video') ? 'Extracting key frames...' : 'Processing image...');
            } else if (data.progress < 60) {
              setStage('Running AI analysis...');
            } else if (data.progress < 80) {
              setStage('Generating prompts...');
            } else {
              setStage('Finalizing results...');
            }
          } else if (data.status === 'completed') {
            setStage('Analysis complete!');
            setTimeout(() => {
              onComplete();
              onClose();
            }, 2000);
          } else if (data.status === 'failed') {
            setStage('Analysis failed');
          }
        }
      } catch (error) {
        console.error('Failed to poll job status:', error);
        
        // Stop polling after too many failed attempts
        if (pollCount > 10) {
          setJobStatus(prev => ({ ...prev, status: 'failed' }));
          setStage('Too many failed attempts - please refresh and try again');
          return;
        }
        
        // Handle different types of errors
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.status === 401) {
            setJobStatus(prev => ({ ...prev, status: 'failed' }));
            setStage('Authentication error - please refresh and try again');
          } else if (axiosError.response?.status === 404) {
            setJobStatus(prev => ({ ...prev, status: 'failed' }));
            setStage('Job not found - it may have been deleted');
          } else {
            // For other errors, keep trying for a bit
            if (pollCount <= 3) {
              setStage('Retrying connection...');
            } else {
              setJobStatus(prev => ({ ...prev, status: 'failed' }));
              setStage('Error checking job status - please try again');
            }
          }
        } else {
          setJobStatus(prev => ({ ...prev, status: 'failed' }));
          setStage('Network error - please check your connection');
        }
      }
    };

    // Only start polling for real job IDs
    if (!isTempJobId) {
      const interval = setInterval(pollJob, 2000);
      pollJob(); // Initial call
      
      return () => clearInterval(interval);
    }
  }, [isOpen, jobId, onComplete, onClose, contentType]);

  // Handle transition from temp job ID to real job ID
  useEffect(() => {
    // Check if jobId changed from temp to real
    if (jobId && !jobId.startsWith('temp_') && jobStatus.status === 'processing') {
      console.log('🔄 Job ID changed from temp to real, starting polling:', jobId);
      
      // Reset state and start polling
      setJobStatus({ status: 'pending', progress: 0 });
      setStage('Connecting to analysis service...');
      setPollCount(0);
      
      const pollJob = async () => {
        try {
          setPollCount(prev => prev + 1);
          const response = await api.get(`/jobs/${jobId}`);
          
          if (response.data) {
            const data = response.data;
            setJobStatus({
              status: data.status,
              progress: data.progress || 0,
              error_message: data.error_message
            });

            // Update stage description based on progress and status
            if (data.status === 'pending') {
              setStage('Queuing for processing...');
            } else if (data.status === 'processing') {
              if (data.progress < 20) {
                setStage('Analyzing file structure...');
              } else if (data.progress < 40) {
                setStage(contentType?.startsWith('video') ? 'Extracting key frames...' : 'Processing image...');
              } else if (data.progress < 60) {
                setStage('Running AI analysis...');
              } else if (data.progress < 80) {
                setStage('Generating prompts...');
              } else {
                setStage('Finalizing results...');
              }
            } else if (data.status === 'completed') {
              setStage('Analysis complete!');
              setTimeout(() => {
                onComplete();
                onClose();
              }, 2000);
            } else if (data.status === 'failed') {
              setStage('Analysis failed');
            }
          }
        } catch (error) {
          console.error('Failed to poll job status during transition:', error);
          if (pollCount > 5) {
            setJobStatus(prev => ({ ...prev, status: 'failed' }));
            setStage('Error connecting to analysis service');
          }
        }
      };

      const interval = setInterval(pollJob, 2000);
      pollJob(); // Initial call
      
      return () => clearInterval(interval);
    }
  }, [jobId]); // Only depend on jobId to detect changes

  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
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
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Processing Analysis</h3>
          {jobStatus.status === 'completed' || jobStatus.status === 'failed' ? (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          ) : null}
        </div>

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
              className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
              style={{ width: `${jobStatus.progress}%` }}
            />
          </div>
        </div>

        {/* Processing Steps Indicator */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 mb-3">Processing Steps:</div>
          {[
            { name: 'File Upload', threshold: 0 },
            { name: 'Content Analysis', threshold: 20 },
            { name: 'AI Processing', threshold: 40 },
            { name: 'Prompt Generation', threshold: 70 },
            { name: 'Finalization', threshold: 90 }
          ].map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                jobStatus.progress > step.threshold 
                  ? jobStatus.status === 'failed' ? 'bg-red-500' : 'bg-green-500'
                  : jobStatus.progress >= step.threshold 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                jobStatus.progress >= step.threshold ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
          ))}
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

        {jobStatus.status === 'failed' && (
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
