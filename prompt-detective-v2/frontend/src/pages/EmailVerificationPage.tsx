import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import OTPInput from '../components/OTPInput';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    
    // Auto-send OTP on page load
    handleResendOTP();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-submit when OTP is complete
    if (otp.length === 6 && !loading) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email-verification/verify`, {
        email,
        otp_code: otp
      });

      if (response.data.message) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { message: 'Email verified successfully! Welcome to Prompt Detective 🎉' }
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;

    setLoading(true);
    setError('');
    setOtp('');

    try {
      await axios.post(`${API_BASE_URL}/auth/email-verification/request`, {
        email
      });

      setResendDisabled(true);
      setCountdown(120); // 2 minutes cooldown
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Email Verified! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Your account is now active. Redirecting to dashboard...
          </p>
          <div className="animate-pulse flex justify-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-purple-600 font-semibold mt-1">
            {email}
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            disabled={loading}
            error={!!error}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center text-purple-600">
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              <span>Verifying...</span>
            </div>
          </div>
        )}

        {/* Resend Button */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={resendDisabled || loading}
            className={`text-sm font-semibold ${
              resendDisabled || loading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            {resendDisabled ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <span className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend Code
              </span>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📧 Check Your Email
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Code expires in 10 minutes</li>
            <li>• Check spam/junk folder if not received</li>
            <li>• Make sure {email} is correct</li>
          </ul>
        </div>

        {/* Change Email Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/signup')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Wrong email? Sign up again
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
