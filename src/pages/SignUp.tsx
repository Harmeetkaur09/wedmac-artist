"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  })
    const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
 const [menuOpen, setMenuOpen] = useState(false);
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

 const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.phone.length !== 10) {
      return setError("Enter a valid 10-digit phone number");
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://wedmac-services.onrender.com/api/users/request-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            location: {
              city: formData.city,
              state: formData.state,
            },
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to send OTP");
      }
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        "https://wedmac-services.onrender.com/api/users/verify-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone, otp }),
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message || "Invalid OTP");
      }

      // store tokens & user
      sessionStorage.setItem("accessToken", body.access);
      sessionStorage.setItem("refreshToken", body.refresh);
      sessionStorage.setItem("user", JSON.stringify(body.user));

      // update context & redirect
      login({ access: body.access, refresh: body.refresh, user: body.user });
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
     <div className="bg-[#FF577F] fixed left-0 right-0 z-50 text-white text-center py-2 text-sm">
            Get $20 Off Your First Purchase - Shop Now & Save!
          </div>
    
          {/* Main Header */}
          <header className="bg-white shadow-sm">
            <nav className="fixed top-9 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <Link to="/" className="block w-[140px] h-auto relative">
                    <img
                      src="/website_logo.png"
                      alt="Website Logo"
                      width={140}
                      height={50}
                      className="object-contain"
                    />
                  </Link>
    
                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-700 hover:text-rose-500">Home</Link>
                    <Link to="/makeup-artist" className="text-gray-700 hover:text-rose-500">
                      Wedmac Makeup Artist
                    </Link>
                    <Link to="/about" className="text-gray-700 hover:text-rose-500">About Us</Link>
                    <Link to="/blog" className="text-gray-700 hover:text-rose-500">Blog</Link>
                    <Link to="/faq" className="text-gray-700 hover:text-rose-500">FAQ</Link>
                    <Link to="/contact" className="text-gray-700 hover:text-rose-500">Contact</Link>
    
                    <div className="flex items-center space-x-4">
                      <Link
                        to="/login"
                        className="bg-[#FF577F] h-8 px-6 hover:bg-rose-600 text-white rounded flex items-center justify-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-[#FF577F] h-8 px-6 hover:bg-rose-600 text-white rounded flex items-center justify-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
    
                  {/* Mobile Menu Button */}
                  <button
                    className="md:hidden text-gray-700"
                    onClick={() => setMenuOpen((o) => !o)}
                  >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
    
              {/* Mobile Menu Dropdown */}
              {menuOpen && (
                <div className="md:hidden px-4 pt-4 pb-6 space-y-3 bg-white shadow-lg border-t border-gray-200">
                  <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-rose-500">
                    Home
                  </Link>
                  <Link
                    to="/makeup-artist"
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-700 hover:text-rose-500"
                  >
                    Wedmac Makeup Artist
                  </Link>
                  <Link to="/about" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-rose-500">
                    About Us
                  </Link>
                  <Link to="/blog" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-rose-500">
                    Blog
                  </Link>
                  <Link to="/faq" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-rose-500">
                    FAQ
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="block text-gray-700 hover:text-rose-500"
                  >
                    Contact
                  </Link>
    
                  <div className="pt-4 flex flex-col space-y-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      <button className="w-full bg-[#FF577F] hover:bg-rose-600 text-white py-2 rounded">
                        Login
                      </button>
                    </Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                      <button className="w-full bg-[#FF577F] hover:bg-rose-600 text-white py-2 rounded">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </header>

      {/* Main Content */}
<div className="container mx-auto pt-32 pb-10 min-h-[calc(100vh-100px)]">

  <div className="flex  border border-[#D5D5D5] rounded-lg  overflow-hidden">
        {/* Left Side - Images */}
       <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 gap-4 p-8">
          

            {/* Column 3 */}
          <div className="h-[500px] space-y-4 mt-4">
    <img
      src="/signup.png"
      alt="Makeup Tools"
      className="w-full h-full object-cover"
    />
  
</div>

          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full h-[500px] max-w-md">
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Log in
              </button>
              <button className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm">
                Sign in
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-6">
          

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

      {step === "phone" ? (
    
 <form onSubmit={sendOTP} className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="first_name" className="text-gray-700">First Name</Label>
      <input
        id="first_name"
        placeholder="Enter your first name"
        value={formData.first_name}
        onChange={(e) => handleInputChange("first_name", e.target.value)}
        className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
        required
      />
    </div>
    <div>
      <Label htmlFor="last_name" className="text-gray-700">Last Name</Label>
      <input
        id="last_name"
        placeholder="Enter your last name"
        value={formData.last_name}
        onChange={(e) => handleInputChange("last_name", e.target.value)}
        className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
        required
      />
    </div>
  </div>

  <div>
    <Label className="text-gray-700">Gender</Label>
  <Select onValueChange={(value) => handleInputChange("gender", value)} required>
  <SelectTrigger
    className={`mt-1 px-3 py-2 rounded-md border border-[#00000033] text-sm
                focus:outline-none focus:ring-2 focus:ring-[#FF577F]
                ${!formData.gender ? "text-[#FF577F]" : "text-black"}`}
  >
    <SelectValue placeholder="Select gender" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="female">Female</SelectItem>
    <SelectItem value="male">Male</SelectItem>
    <SelectItem value="other">Other</SelectItem>
  </SelectContent>
</Select>

  </div>
  <div className="grid grid-cols-2 gap-4">

  <div>
    <Label htmlFor="email" className="text-gray-700">Email</Label>
    <input
      id="email"
      type="email"
      placeholder="Enter your email address"
      value={formData.email}
      onChange={(e) => handleInputChange("email", e.target.value)}
      className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
      required
    />
  </div>
  <div>
    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
    <input
      id="phone"
      type="tel"
      placeholder="10-digit mobile number"
      value={formData.phone}
      onChange={(e) => handleInputChange("phone", e.target.value)}
      className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
      required
    />
  </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="city" className="text-gray-700">City</Label>
      <input
        id="city"
        placeholder="Enter your city"
        value={formData.city}
        onChange={(e) => handleInputChange("city", e.target.value)}
        className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
        required
      />
    </div>
    <div>
      <Label htmlFor="state" className="text-gray-700">State</Label>
      <input
        id="state"
        placeholder="Enter your state"
        value={formData.state}
        onChange={(e) => handleInputChange("state", e.target.value)}
        className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm placeholder-[#FF577F] focus:outline-none focus:ring-2 focus:ring-[#FF577F]"
        required
      />
    </div>
  </div>

  <Button
    type="submit"
    className="w-full bg-[#FF577F] hover:bg-[#E6447A] text-white"
    disabled={loading}
  >
    {loading ? "Sending OTP…" : "Send OTP"}
  </Button>

 
</form>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Enter OTP</h2>
          {error && <p className="text-red-600">{error}</p>}
           <button onClick={() => setStep("phone")} className="flex items-center text-[#FF577F] hover:text-[#E6447A] mb-4">     
                         <ArrowLeft className="h-4 w-4 mr-2" />
           
            Back to form
          </button>

          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button onClick={verifyOTP} disabled={loading || otp.length < 6} className="w-full">
            {loading ? "Verifying…" : "Verify & Continue"}
          </Button>

         
        </div>
      )}

      <div className="text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[#FF577F] hover:underline">
          Log in
        </Link>
      </div>



          
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#FF577F] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm">
                <p>619-393-4981 Ext. 101</p>
                <p>Invest@AtlasLPS.Com</p>
                <p>
                  501 West Broadway, Suite 800,
                  <br />
                  San Diego, CA 92101
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <div className="space-y-2 text-sm">
                <p>FAQs</p>
                <p>Disclosures</p>
                <p>Terms And Conditions</p>
                <p>Privacy Policy</p>
                <p>Submit Deals</p>
                <p>Media Kit</p>
              </div>
            </div>

            {/* Investment Disclosure */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Investment Disclosure</h3>
              <p className="text-sm">
                When you invest with Atlas, you are more than a number; you are a partner. As a partner with us, you can
                access opportunities usually reserved only for the largest institutional investors. You can access a
                team driven only by excellence and results. You can access real estate investment opportunities designed
                with you in mind.
              </p>
            </div>
          </div>

          <div className="border-t border-pink-400 mt-8 pt-8 text-center">
            <p className="text-sm">ATLAS 2022 © All Right Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SignUp
