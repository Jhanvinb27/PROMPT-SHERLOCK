import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface WarmupIndicatorProps {
  apiBaseUrl: string;
}

export const WarmupIndicator: React.FC<WarmupIndicatorProps> = ({ apiBaseUrl }) => {
  const [status, setStatus] = useState<'checking' | 'warming' | 'ready' | 'error'>('checking');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(() => {
      if (startTime > 0) {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const checkBackendStatus = async () => {
    setStatus('checking');
    setStartTime(Date.now());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(`${apiBaseUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('ready');
      } else {
        setStatus('warming');
        // Retry after a delay
        setTimeout(checkBackendStatus, 3000);
      }
    } catch (error) {
      console.log('Backend warming up...', error);
      setStatus('warming');
      // Retry after a delay
      setTimeout(checkBackendStatus, 3000);
    }
  };

  if (status === 'ready') {
    return null; // Don't show anything when ready
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {(status === 'checking' || status === 'warming') ? (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {status === 'checking' && 'Checking Backend...'}
              {status === 'warming' && 'Warming Up Backend'}
              {status === 'error' && 'Connection Error'}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {status === 'warming' && (
                <>
                  The free tier server is waking up. This usually takes 30-60 seconds.
                  {elapsedTime > 0 && ` (${elapsedTime}s)`}
                </>
              )}
              {status === 'checking' && 'Please wait...'}
              {status === 'error' && 'Unable to connect to backend. Please refresh.'}
            </p>
            {status === 'warming' && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((elapsedTime / 60) * 100, 95)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
