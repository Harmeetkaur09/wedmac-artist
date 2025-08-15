"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    phone: "",
    city: "",
    state: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.phone.length !== 10) {
      return setError("Enter a valid 10-digit phone number");
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://wedmac-be.onrender.com/api/users/request-otp/",
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
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
        "https://wedmac-be.onrender.com/api/users/verify-otp/",
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
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
                  src="/images/website_logo.png"
                  alt="Website Logo"
                  width={140}
                  height={50}
                  className="object-contain"
                />
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a
                  href="https://wed-mac-qsxz.vercel.app/"
                  className="text-gray-700 hover:text-rose-500"
                >
                  Home
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/makeup-artist"
                  className="text-gray-700 hover:text-rose-500"
                >
                  Wedmac Makeup Artist
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/about"
                  className="text-gray-700 hover:text-rose-500"
                >
                  About Us
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/blog"
                  className="text-gray-700 hover:text-rose-500"
                >
                  Blog
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/faq"
                  className="text-gray-700 hover:text-rose-500"
                >
                  FAQ
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/contact"
                  className="text-gray-700 hover:text-rose-500"
                >
                  Contact
                </a>

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
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="md:hidden px-4 pt-4 pb-6 space-y-3 bg-white shadow-lg border-t border-gray-200">
              <a
                href="https://wed-mac-qsxz.vercel.app/"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                Home
              </a>
              <a
                href="/makeup-artist"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                Wedmac Makeup Artist
              </a>
              <a
                href="https://wed-mac-qsxz.vercel.app/about"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                About Us
              </a>
              <a
                href="https://wed-mac-qsxz.vercel.app/blog"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                Blog
              </a>
              <a
                href="https://wed-mac-qsxz.vercel.app/faq"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                FAQ
              </a>
              <a
                href="https://wed-mac-qsxz.vercel.app/contact"
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-rose-500"
              >
                Contact
              </a>

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
      <section className="relative h-[50vh] pt-32 text-center text-white block md:hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero2.JPG"
            alt="Hero Background"
            className="object-cover object-[center_bottom_20%] -z-10 w-full h-full absolute"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/30 to-black/0" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center justify-center h-full">
          <h1 className="text-5xl md:text-7xl font-gilroy-bold mb-6">
            Style That Turns Heads <br />
            Every Special Day
          </h1>
          <p className="text-md md:text-xl font-gilroy font-400 opacity-90">
            Make your presence unforgettable with premium beauty and fashion
            services
            <br />
            designed for life’s most special moments
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="md:container mx-auto md:px-12 lg:px-24 md:pt-32 pt-6 md:pb-10 pb-8 md:min-h-[calc(100vh-100px)]">
        <div className="flex md:border md:border-[#D5D5D5] rounded-lg  overflow-hidden">
          {/* Left Side - Images */}
          <div className="hidden lg:flex lg:w-[60%] bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-1 gap-4 md:p-8">
              {/* Column 3 */}
              <div className="h-[350px] space-y-4 mt-4">
                <img
                  src="/images/signup.png"
                  alt="Makeup Tools"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center md:p-8 p-4">
            <div className="w-full max-w-md">
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
              <p className="text-sm text-gray-600">
                {step === "phone"
                  ? "Enter your phone number to receive an OTP."
                  : "Enter the OTP sent to your phone via call."}
              </p>

              {/* Form Content */}
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {step === "phone" ? (
                  <form onSubmit={sendOTP} className="space-y-4">
                    <div className="grid md:grid-cols-2  gap-4">
                      <div>
                        <input
                          id="first_name"
                          placeholder="Enter your first name"
                          value={formData.first_name}
                          onChange={(e) =>
                            handleInputChange("first_name", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                      <div>
                        <input
                          id="last_name"
                          placeholder="Enter your last name"
                          value={formData.last_name}
                          onChange={(e) =>
                            handleInputChange("last_name", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Select
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                        required
                      >
                        <SelectTrigger
                          className={`mt-1 px-3 py-2 rounded-md border border-[#00000033] text-sm
                focus:outline-none focus:ring-2 focus:ring-[#FF577F]
                ${!formData.gender ? "text-gray-400" : "text-black"}`}
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                      <div>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <input
                          id="city"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                      <div>
                        <input
                          id="state"
                          placeholder="Enter your state"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          className="mt-1 px-3 py-2 rounded border border-[#00000033] placeholder:text-sm  focus:outline-none focus:ring-2 focus:ring-[#FF577F] w-full md:w-auto"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required className="mt-1" />
                      <label htmlFor="terms" className="text-sm text-black">
                        I Accept the{" "}
                        <a
                          href="https://wed-mac-qsxz.vercel.app/terms"
                          target="_blank"
                          className="text-[#FF577F] hover:underline"
                        >
                          Terms of Use
                        </a>{" "}
                        &{" "}
                        <a
                          href="https://wed-mac-qsxz.vercel.app/privacy"
                          target="_blank"
                          className="text-[#FF577F] hover:underline"
                        >
                          Privacy Policy
                        </a>
                      </label>
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
                    <button
                      onClick={() => setStep("phone")}
                      className="flex items-center text-[#FF577F] hover:text-[#E6447A] mb-4"
                    >
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

                    <Button
                      onClick={verifyOTP}
                      disabled={loading || otp.length < 6}
                      className="w-full"
                    >
                      {loading ? "Verifying…" : "Verify & Continue"}
                    </Button>
                  </div>
                )}

                <div className="text-center mt-6 text-sm ">
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
        <div className="container mx-auto px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Contact Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Contact</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <span>+91 9669426549</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>wedmacofficial@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>
                    27 Vaishali Enclave Phase 2, Baltana Zirakpur, Punjab 140604
                  </span>
                </div>
              </div>

              <div className="flex space-x-8 mb-6">
                <a
                  href="https://www.facebook.com/people/WedMac-India/61564828839583"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-6 h-6 hover:text-gray-200" />
                </a>
                <a
                  href="https://www.instagram.com/wedmac.india"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="w-6 h-6 hover:text-gray-200" />
                </a>
                <a
                  href="https://x.com/wedmacindia?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-6 h-6 hover:text-gray-200" />
                </a>
              </div>
            </div>

            {/* Links Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">Links</h3>
              <div className="space-y-3">
                <a
                  href="https://wed-mac-qsxz.vercel.app/faq"
                  className="block hover:underline"
                >
                  FAQs
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/blog"
                  className="block hover:underline"
                >
                  Blog
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/privacy"
                  className="block hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="https://wed-mac-qsxz.vercel.app/terms"
                  className="block hover:underline"
                >
                  Terms &amp; Conditions
                </a>
              </div>
            </div>

            {/* Investment Disclosure Section */}
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Investment Disclosure
              </h3>
              <p className="text-sm leading-relaxed">
                We offer bespoke makeup services designed to complement your
                unique beauty and style, ensuring you look and feel confident,
                radiant, and unforgettable on your special day.
              </p>
            </div>

            {/* Payment Partners */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                100% Secure Payment
              </h3>
              <div className="grid grid-cols-2 gap-2 items-center">
                <img
                  src="/images/master.png"
                  alt="Mastercard"
                  width={80}
                  height={30}
                />
                <img
                  src="/images/paytm.png"
                  alt="Paytm"
                  width={60}
                  height={30}
                />
                <img src="/images/visa.png" alt="Visa" width={60} height={30} />
                <img
                  src="/images/rupay.png"
                  alt="RuPay"
                  width={60}
                  height={30}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-pink-400 mt-8 pt-8 text-center">
            <p className="text-sm">Wedmac India 2022 © All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
