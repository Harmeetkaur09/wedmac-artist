
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: '',
    email: '',
    type_of_makeup: '',
    phone: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to OTP verification with phone data
    navigate('/otp-verification', { state: { phone: formData.phone, type: 'signup' } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#FF577F]">Create Account</CardTitle>
          <CardDescription>Join Wedmac Artist Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Gender</Label>
              <Select onValueChange={(value) => handleInputChange('gender', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Type of Makeup</Label>
              <Select onValueChange={(value) => handleInputChange('type_of_makeup', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select makeup type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural Makeup</SelectItem>
                  <SelectItem value="party">Party Makeup</SelectItem>
                  <SelectItem value="bridal">Bridal Makeup</SelectItem>
                  <SelectItem value="haldi">Haldi Makeup</SelectItem>
                  <SelectItem value="mehendi">Mehendi Makeup</SelectItem>
                  <SelectItem value="engagement">Engagement Makeup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                pattern="[0-9]{6}"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#FF577F] hover:bg-[#E6447A]">
              Send OTP
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Already have account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-[#FF577F] hover:underline"
              >
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
