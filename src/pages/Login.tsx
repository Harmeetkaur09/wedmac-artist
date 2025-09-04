"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const sliderImages = [
  "/images/hero1.JPG",
  "/images/hero2.JPG",
  "/images/hero3.JPG",
  "/images/hero4.JPG",
  "/images/hero5.JPG",
];
const Login = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.length !== 10) {
      setError("Enter a valid 10‑digit phone number");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(
        "https://api.wedmacindia.com/api/users/login/request-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        }
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(
          body.message || "Failed to send OTP, Please Sign In First"
        );
      }
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError(null);
    try {
      setIsLoading(true);
      const res = await fetch(
        "https://api.wedmacindia.com/api/users/login-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Invalid OTP");

      sessionStorage.setItem("accessToken", body.access);
      sessionStorage.setItem("refreshToken", body.refresh);
      sessionStorage.setItem("userRole", body.role);
      sessionStorage.setItem("userId", String(body.user_id));
      login({
        access: body.access,
        refresh: body.refresh,
        user: {
          id: body.user_id,
          name: body.name,
          phone: body.phone,
          role: body.role,
          email: "",
        },
      });
      // Client-side redirect:
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setError(null);
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
              <a
                href="https://wed-mac-qsxz.vercel.app/"
                className="block w-[140px] h-auto relative"
              >
                <img
                  src="/images/website_logo.png"
                  alt="Website Logo"
                  width={140}
                  height={50}
                  className="object-contain"
                />
              </a>

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

      {/* Main Content */}
      <section className="relative h-[60vh] pt-32 text-center text-white block md:hidden">
        <div className="absolute inset-0">
          <img
            src={sliderImages[current]}
            alt="Hero Background"
            className="object-cover object-top -z-10 w-full h-full absolute"
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

      <div className="md:container mx-auto md:px-12 lg:px-24 md:pt-32 pt-6 md:pb-10 min-h-[30vh] md:min-h-[calc(100vh-100px)]">
        <div className="flex  md:border md:border-[#D5D5D5] rounded-lg  overflow-hidden">
          {/* Left Side - Images */}
          <div className="hidden lg:flex lg:w-[60%] bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-1 gap-4 md:p-8">
              {/* Column 3 */}
              <div className="h-[350px]  space-y-4 mt-4">
                <img
                  src="/images/login.png"
                  alt="Makeup Tools"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center md:p-8 p-4">
            <div className="w-full h-[350px] max-w-md">
              {/* Tab Navigation */}
              <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                <button className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm">
                  Log in
                </button>
                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="flex-1 py-2 px-4 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {step === "otp" && (
                  <button
                    onClick={handleBackToPhone}
                    className="flex items-center text-[#FF577F] hover:text-[#E6447A] mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to phone
                  </button>
                )}
                <p className="text-sm text-gray-600">
                  {step === "phone"
                    ? "Enter your phone number to receive an OTP."
                    : "Enter the OTP sent to your phone via call."}
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {step === "phone" ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="flex flex-col">
                      <label htmlFor="phone" className="text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="p-2 border rounded text-gray-800"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#FF577F] hover:bg-[#E6447A] text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending…" : "Send OTP"}
                    </Button>
                    <div className="text-center">
                      <span className="text-sm text-gray-600">
                        {"Don't have an account? "}
                      </span>
                      <button
                        type="button"
                        onClick={() => (window.location.href = "/signup")}
                        className="text-sm text-[#FF577F] hover:underline font-medium"
                      >
                        Sign Up
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
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
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.length !== 6 || isLoading}
                      className="w-full bg-[#FF577F] hover:bg-[#E6447A] text-white"
                    >
                      {isLoading ? "Verifying…" : "Login"}
                    </Button>
                    <div className="text-center">
                      <button
                        onClick={handleSendOTP}
                        className="text-sm text-[#FF577F] hover:underline font-medium"
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
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

export default Login;
