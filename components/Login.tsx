
import React from 'react';
import { useState } from 'react';
import { sendOtp, verifyOtp } from '../api';
import { SpinnerIcon } from './icons';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 6) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await sendOtp(phone);
      if (response.success) {
        setStep('otp');
      }
    } catch (e) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyOtp(phone, otp);
      if (response.success) {
        onLogin();
      } else {
        setError(response.error || "An unknown error occurred.");
      }
    } catch (e) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">+880</span>
        <input
          type="tel"
          placeholder="1XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="w-full pl-14 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-green focus:outline-none text-brand-dark dark:text-white"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={phone.length < 6 || isLoading}
      >
        {isLoading ? <SpinnerIcon /> : 'Send OTP'}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter the 6-digit code sent to +880 {phone}.
      </p>
      <input
        type="text"
        placeholder="123456"
        value={otp}
        maxLength={6}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className="w-full text-center tracking-[0.5em] font-bold text-xl px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-green focus:outline-none text-brand-dark dark:text-white"
        required
        autoFocus
      />
      <button
        type="submit"
        className="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={otp.length < 6 || isLoading}
      >
        {isLoading ? <SpinnerIcon /> : 'Verify & Continue'}
      </button>
      <button onClick={() => { setStep('phone'); setError(null); }} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
        Change phone number
      </button>
    </form>
  );


  return (
    <div className="flex flex-col items-center justify-center h-full bg-brand-light dark:bg-brand-dark p-8 text-brand-dark dark:text-white">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-5xl font-bold text-brand-green mb-2">BikeGo</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Your E-Bike Ride in Bangladesh</p>

        {step === 'phone' ? renderPhoneStep() : renderOtpStep()}
        
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>.</p>
           {step === 'otp' && <p className="mt-2">(For this demo, use OTP: 123456)</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;