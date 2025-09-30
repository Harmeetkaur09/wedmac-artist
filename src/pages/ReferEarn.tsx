// src/pages/ReferEarn.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Share2,
  Copy,
  MessageCircle,
  Mail,
  Gift,
  Users,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ReferEarn() {
  // Vite-friendly API base
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE ||
    (window as any).__API_BASE__ ||
    "https://api.wedmacindia.com";

  // referral code state (null = not generated)
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // sample history data (keep your demo data)
  const referralHistory = [
    {
      id: 1,
      name: "Sneha Makeup Artist",
      email: "sneha@email.com",
      joinDate: "2024-01-15",
      status: "Active",
      earnings: "₹500",
      type: "Artist",
    },
    {
      id: 2,
      name: "Priya Client",
      email: "priya@email.com",
      joinDate: "2024-01-18",
      status: "Active",
      earnings: "₹200",
      type: "Client",
    },
    {
      id: 3,
      name: "Ravi Photography",
      email: "ravi@email.com",
      joinDate: "2024-01-20",
      status: "Pending",
      earnings: "₹0",
      type: "Artist",
    },
  ];

  // robust token lookup (same pattern as Support)
  const getToken = () => {
    try {
      const anyWindow = window as any;
      if (anyWindow.localStorage && (anyWindow.localStorage as any).authData) {
        const maybe = (anyWindow.localStorage as any).authData;
        if (maybe && typeof maybe === "object" && maybe.token)
          return maybe.token;
      }
      const candidates = ["authData", "accessToken", "token"];
      for (const key of candidates) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.token) return parsed.token;
        } catch {
          return raw;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Fetch existing referral code (GET)
  const fetchReferral = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      console.warn("No token - referral fetch skipped");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/artists/referral-code/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Referral GET failed: ${res.status} ${txt}`);
      }

      const data = await res.json();
      // API returns either { referral_code: "..." } or { message: "...", referral_code: null }
      if (data?.referral_code) {
        setReferralCode(String(data.referral_code));
      } else {
        setReferralCode(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch referral code.");
      setReferralCode(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate referral code (POST) — shows generate button only when no code
  const generateReferral = async () => {
    setGenerating(true);
    const token = getToken();
    if (!token) {
      toast.error("Auth token not found. Please login.");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/artists/referral-code/generate/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // endpoint expects no body
        }
      );

      if (!res.ok && res.status !== 200 && res.status !== 201) {
        const txt = await res.text();
        throw new Error(`Generate failed: ${res.status} ${txt}`);
      }

      const data = await res.json();
      // success responses:
      // { message: "Referral code generated successfully", referral_code: "JANE9T2PQ" } (201)
      // { message: "Referral code already exists", referral_code: "JANE9T2PQ" } (200)
      if (data?.referral_code) {
        setReferralCode(String(data.referral_code));
        toast.success(data.message || "Referral code available");
      } else {
        toast.error("Failed to generate referral code.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate referral code.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchReferral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actions: copy/referral link/share
  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/signup?ref=${encodeURIComponent(
      referralCode
    )}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Referral link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const shareWhatsApp = () => {
    if (!referralCode) return;
    const message = `Join Wedmac with my referral code ${referralCode} and get exclusive benefits! Signup: ${
      window.location.origin
    }/signup?ref=${encodeURIComponent(referralCode)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const shareEmail = () => {
    if (!referralCode) return;
    const subject = encodeURIComponent("Join Wedmac — referral inside");
    const body = encodeURIComponent(
      `Hey,\n\nJoin Wedmac using my referral code ${referralCode} to get special benefits.\n\nSign up here: ${
        window.location.origin
      }/signup?ref=${encodeURIComponent(referralCode)}\n\nCheers!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Layout title="Refer & Earn">
      <Toaster />
      <div className="space-y-6">
        {/* Referral Code Section */}
        <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Code
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  value={referralCode ?? ""}
                  readOnly
                  placeholder={loading ? "Checking..." : "No referral code yet"}
                  className="text-lg font-mono text-center bg-white"
                />
              </div>

              {/* Generate button shown only when no code present */}
              {!referralCode ? (
                <Button
                  onClick={generateReferral}
                  disabled={generating || loading}
                >
                  {generating ? "Generating..." : "Generate"}
                </Button>
              ) : (
                // Copy button (visible when code exists)
                <Button variant="outline" onClick={copyReferralCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </div>

            {/* Share / Copy Link buttons - visible only after referral exists */}
            {referralCode && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={shareWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>

                <Button onClick={copyReferralLink} variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            )}

            {/* If you want, show hint when no code */}
            {!referralCode && !loading && (
              <div className="text-sm text-muted-foreground">
                You don't have a referral code yet. Click{" "}
                <strong>Generate</strong> to create one and unlock share
                options.
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Referral Program Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">Share Your Code</h3>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code with friends and colleagues
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">They Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  New users register using your code
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">You Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get free credits on each referral
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referral.name}</div>
                        <div className="text-sm text-muted-foreground">{referral.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.type === "Artist" ? "default" : "secondary"}>
                        {referral.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{referral.joinDate}</TableCell>
                    <TableCell>
                      <Badge className={referral.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{referral.earnings}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}
