
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setStep('otp');
      // Here you would make API call to send OTP
      console.log('Sending OTP to:', phone);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) return;
    
    setIsLoading(true);
    // Simulate API call - for demo, accept any 4-digit OTP
    setTimeout(() => {
      setIsLoading(false);
      login(); // Set authentication state
      navigate('/'); // Navigate to dashboard
    }, 1500);
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {step === 'otp' && (
              <button
                onClick={handleBackToPhone}
                className="absolute left-6 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <CardTitle className="text-2xl font-bold text-[#FF577F]">
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </CardTitle>
          </div>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your phone number to continue'
              : `Enter the 4-digit code sent to +91 ${phone}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#FF577F] hover:bg-[#E6447A]">
                Send OTP
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-sm text-[#FF577F] hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
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

              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 4 || isLoading}
                className="w-full bg-[#FF577F] hover:bg-[#E6447A]"
              >
                {isLoading ? 'Verifying...' : 'Login'}
              </Button>

              <div className="text-center">
                <button
                  onClick={() => {
                    // Resend OTP logic
                    console.log('Resending OTP to:', phone);
                  }}
                  className="text-sm text-[#FF577F] hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
