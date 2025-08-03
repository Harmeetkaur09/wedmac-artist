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
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // countdown timer
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

  const resendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      // you may need to send payload per your API; here we only send phone
      const res = await fetch('https://wedmac-services.onrender.com/api/users/request-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Failed to resend OTP');
      }
      setTimeLeft(300);
      setCanResend(false);
      setOtp('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const verifyOTP = async () => {
  if (otp.length !== 6) return;
  setLoading(true);
  setError(null);

  try {
    const res = await fetch(
      'https://wedmac-services.onrender.com/api/users/verify-otp/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      }
    );

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message || 'Invalid OTP');
    }

    // parse the JSON payload
    const { access, refresh, role, user_id } = await res.json();

    // persist into sessionStorage
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
   

    // now you’re authenticated—go home (or dashboard)
    navigate('/');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  if (!phone) {
    navigate('/signup');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 top-6 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <CardTitle className="text-2xl font-bold text-[#FF577F]">Verify OTP</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to<br />
            <strong>+91 {phone}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />

              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-600">
                Resend OTP in <span className="font-mono text-[#FF577F]">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={resendOTP}
                className="text-sm text-[#FF577F] hover:underline"
                disabled={loading}
              >
                {loading ? 'Resending…' : 'Resend OTP'}
              </button>
            )}
          </div>

          <Button
            onClick={verifyOTP}
            disabled={otp.length !== 6 || loading}
            className="w-full bg-[#FF577F] hover:bg-[#E6447A]"
          >
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </Button>

        
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
