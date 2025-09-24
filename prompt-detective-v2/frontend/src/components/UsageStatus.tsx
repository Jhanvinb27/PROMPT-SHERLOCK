import React from 'react';
import { Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useUsageTracking } from '../hooks/useUsageTracking';

interface UsageStatusProps {
  compact?: boolean;
  className?: string;
}

const UsageStatus: React.FC<UsageStatusProps> = ({ compact = false, className = '' }) => {
  const { 
    usageData, 
    isLoading, 
    canUpload, 
    getRemainingUploads, 
    getUsagePercentage, 
    getTimeUntilReset 
  } = useUsageTracking();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  const percentage = getUsagePercentage();
  const remaining = getRemainingUploads();
  const timeUntilReset = getTimeUntilReset();

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {canUpload ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <span className={canUpload ? 'text-green-600' : 'text-red-600'}>
          {remaining} left
        </span>
      </div>
    );
  }

  const getProgressColor = () => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (percentage <= 50) return 'text-green-600';
    if (percentage <= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-gray-900">Daily Usage</h3>
        </div>
        <div className={`text-sm font-medium ${getTextColor()}`}>
          {usageData.daily_usage} / {usageData.daily_limit}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">
            Rolling {usageData.rolling_window_hours || 24}h window
          </span>
          <span className="text-xs text-gray-600">{percentage}% used</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status and Reset Time */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {canUpload ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">
                {remaining} upload{remaining !== 1 ? 's' : ''} remaining
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600">Daily limit reached</span>
            </>
          )}
        </div>
        
        {timeUntilReset !== 'N/A' && (
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Resets in {timeUntilReset}</span>
          </div>
        )}
      </div>

      {/* Upgrade Notice */}
      {!canUpload && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Need more uploads? 
            <button className="font-medium text-blue-600 hover:text-blue-800 ml-1">
              Upgrade your plan
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default UsageStatus;