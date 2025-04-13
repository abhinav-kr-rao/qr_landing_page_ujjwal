import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMethod = 'select' | 'email' | 'phone' | 'otp';
type ApiError = Error & { message: string };

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('select');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setMessage('Check your email for the login link!');
      setAuthMethod('otp');
    } catch (err: unknown) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      setMessage('Check your phone for the OTP!');
      setAuthMethod('otp');
    } catch (err: unknown) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // For phone verification
      if (phone) {
        const { error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms',
        });
        if (error) throw error;
      }
      // For email verification
      else if (email) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup',
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: unknown) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const { error } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: window.location.origin
  //       }
  //     });
  //     if (error) throw error;
  //     onSuccess();
  //   } catch (err: unknown) {
  //     setError((err as ApiError).message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLoginSuccess = () => {
    onSuccess();
  };

  const handleGoogleLoginError = () => {
    setError("Google login failed");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
          title="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="space-y-4">
          {authMethod === 'select' && (
            <>
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>Continue with Email</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setAuthMethod('phone')}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>Continue with Phone</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                  <span>Continue with Google (via Supabase)</span>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button> */}
            </>
          )}

          {authMethod === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 border"
                  required
                  placeholder="your@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white rounded-md py-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('select')}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Back to options
              </button>
            </form>
          )}

          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneSignIn} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 border"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white rounded-md py-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('select')}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Back to options
              </button>
            </form>
          )}

          {authMethod === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 p-2 border"
                  required
                  placeholder="Enter your verification code"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white rounded-md py-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('select')}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Back to options
              </button>
            </form>
          )}
        </div>
      </div>
    </div >
  );
}