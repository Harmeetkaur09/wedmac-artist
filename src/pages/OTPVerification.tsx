
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, type } = location.state || {};
  
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = () => {
    setTimeLeft(300);
    setCanResend(false);
    setOtp('');
    // Here you would make API call to resend OTP
    console.log('Resending OTP to:', phone);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard after successful verification
      navigate('/');
    }, 1500);
  };

  if (!phone) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-6 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <CardTitle className="text-2xl font-bold text-[#FF577F]">Verify OTP</CardTitle>
          </div>
          <CardDescription>
            Enter the 4-digit code sent to<br />
            <strong>+91 {phone}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={4}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-mono text-[#FF577F]">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="text-sm text-[#FF577F] hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 4 || isLoading}
            className="w-full bg-[#FF577F] hover:bg-[#E6447A]"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </Button>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-[#FF577F]"
            >
              Change phone number?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
