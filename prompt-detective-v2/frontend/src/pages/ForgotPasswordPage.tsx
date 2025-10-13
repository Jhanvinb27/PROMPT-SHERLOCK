import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import OTPInput from '../components/OTPInput';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-submit OTP when complete
    if (step === 'otp' && otp.length === 6 && !loading) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/password-reset/request`, {
        email
      });

      setStep('otp');
      setResendDisabled(true);
      setCountdown(120); // 2 minutes
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset code');
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
      await axios.post(`${API_BASE_URL}/auth/password-reset/request`, {
        email
      });

      setResendDisabled(true);
      setCountdown(120);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/password-reset/verify-otp`, {
        email,
        otp_code: otp
      });

      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/password-reset/confirm`, {
        email,
        otp_code: otp,
        new_password: password
      });

      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
                  <KeyRound className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                No worries! We'll send you a reset code via email
              </p>
            </div>

            <form onSubmit={handleRequestOTP}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          </div>
        );

      case 'otp':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
                  <Mail className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enter Reset Code
              </h2>
              <p className="text-gray-600">
                We've sent a 6-digit code to
              </p>
              <p className="text-purple-600 font-semibold mt-1">
                {email}
              </p>
            </div>

            <div className="mb-6">
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                error={!!error}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center text-purple-600">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  <span>Verifying...</span>
                </div>
              </div>
            )}

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

            <button
              onClick={() => setStep('email')}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Change email
            </button>
          </div>
        );

      case 'password':
        return (
          <div>
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-full">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Password
              </h2>
              <p className="text-gray-600">
                Choose a strong password to secure your account
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600 font-semibold' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600 font-semibold' : ''}>
                    • Mix of uppercase and lowercase
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600 font-semibold' : ''}>
                    • Include numbers
                  </li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Password Reset Successful! 🎉
            </h2>
            <p className="text-gray-600 mb-8">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Go to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {renderStep()}

        {/* Back to Login Link */}
        {step !== 'success' && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
