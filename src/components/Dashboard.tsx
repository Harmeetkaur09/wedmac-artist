import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import {
  TrendingUp,
  Users,
  Coins,
  Calendar,
  Eye,
  Phone,
  MapPin,
  ClockArrowUp,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, MyProfile } from "@/api/profile";
import { useNavigate } from "react-router-dom";

interface Lead {
  created_at: string | ReactNode;
  budget_range: BudgetRange;
  requirements: string;
  id: number;
  client_name: string;
  status: string;
  service: string;
  booking_date: string;
  location: string;
  phone: string;
}

interface Summary {
  new_this_week: number;
  total_this_month: number;
}

type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
type BudgetRange = {
  id: number;
  label: string;
  min_value: number;
  max_value: number;
} | null;

const claimed_STORAGE_KEY = "claimedLeads";
const CONTACT_VISIBLE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

export function Dashboard({ phone }: { phone?: string }) {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
const [isAdminCreated, setIsAdminCreated] = useState(false);

  // subscription / credits state
  const [subscriptionValid, setSubscriptionValid] = useState<boolean>(true);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<number | null>(null);
  const [planTotalLeads, setPlanTotalLeads] = useState<number | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  // per-lead UI state
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [remarkingLeadId, setRemarkingLeadId] = useState<number | null>(null);
  const [remarkText, setRemarkText] = useState("");

  // claim state
  const [claimingLeadId, setClaimingLeadId] = useState<number | null>(null);
  const [claimErrors, setClaimErrors] = useState<Record<number, string>>({});

  // remarks mapping: leadId -> remark text (persisted in localStorage)
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});

  // claimed map: { "<leadId>": timestampMs }  (kept for legacy 24h-visibility if needed)
  const [claimedMap, setclaimedMap] = useState<Record<string, number>>({});

  // Toast stateUp
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  // Adds a toast and auto-removes after 3s
  const addToast = (message: string, type: ToastType = "success") => {
    const id = toastId.current++;
    const t: Toast = { id, message, type };
    setToasts((s) => [t, ...s]);
    window.setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3000);
  };
// in artist app page component (client-side)
useEffect(() => {
  if (typeof window === "undefined") return;
  const hash = window.location.hash; // like #access=...&refresh=...
  if (!hash) return;

  try {
    const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleaned);
    const access = params.get("access");
    const refresh = params.get("refresh");
    const userId = params.get("user_id");
    const role = params.get("role") || "artist";

    if (access) {
      sessionStorage.setItem("accessToken", access);
      if (refresh) sessionStorage.setItem("refreshToken", refresh);
      if (userId) sessionStorage.setItem("user_id", userId);
      sessionStorage.setItem("role", role);
      // optionally notify user
      // toast.success("Signed in via admin switch");
    }
  } catch (e) {
    console.error("Failed to parse token from hash", e);
  } finally {
    // remove hash from URL to keep clean (won't reload page)
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}, []);

  // load saved remarks from localStorage once
  useEffect(() => {
    try {
      const stored = localStorage.getItem("leadRemarks");
      if (stored) setRemarks(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to load remarks from localStorage:", err);
    }
  }, []);

  // load claimedMap from localStorage once (kept - optional)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(claimed_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, number>;
        setclaimedMap(parsed || {});
      }
    } catch (err) {
      console.error("Failed to load claimedMap:", err);
    }
  }, []);

  // helper to persist claimedMap
  const persistclaimedMap = (map: Record<string, number>) => {
    try {
      localStorage.setItem(claimed_STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to save claimedMap:", err);
    }
  };

  // fetch profile + leads + credits history
  useEffect(() => {
   const fetchAll = async () => {
  try {
    setLoading(true);
    const profileData = await getMyProfile();
    setProfile(profileData);

    if (profileData?.created_by_admin === true) {
      setIsAdminCreated(true);
      // agar admin created hai → subscription always valid, credits irrelevant
      setSubscriptionValid(true);
      setCreditsAvailable(null);
    }

    const token = sessionStorage.getItem("accessToken");

    // 1) fetch recent leads (✅ admin ke liye bhi chalega)
    const leadsRes = await fetch(
      "https://api.wedmacindia.com/api/leads/artist/recent-leads/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!leadsRes.ok) throw new Error("Failed to fetch leads");
    const leadsData = await leadsRes.json();
    setSummary(leadsData.summary);
    setLeads(leadsData.leads);

    // 2) fetch credits/history (❌ admin ke liye skip karo)
    if (!profileData?.created_by_admin) {
      const creditsRes = await fetch(
        "https://api.wedmacindia.com/api/credits/history/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!creditsRes.ok) {
        console.warn("Failed to fetch credits history");
        return;
      }

      const creditsData = await creditsRes.json();
      const results = Array.isArray(creditsData.results)
        ? creditsData.results
        : [];

      const purchases = results
        .filter(
          (r: any) =>
            r.transaction_type === "purchase" &&
            r.credit_type === "lead_credit"
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

      if (purchases.length === 0) {
        setSubscriptionValid(false);
        setCreditsAvailable(0);
        setLeads([]);
        return;
      }

      const latest = purchases[0];
      const plan = latest.plan_details || null;
      const createdAt = new Date(latest.created_at).getTime();
      const durationDays = plan?.duration_days
        ? Number(plan.duration_days)
        : 0;
      const expiryTs =
        createdAt + durationDays * 24 * 60 * 60 * 1000;

      const creditsAfter =
        typeof latest.credits_after === "number"
          ? latest.credits_after
          : null;

      setSubscriptionExpiresAt(expiryTs);
      setCreditsAvailable(creditsAfter);
      setPlanTotalLeads(plan?.total_leads ?? null);
      setSubscriptionId(latest.subscription_plan ?? null);

      const now = Date.now();
      if (expiryTs && expiryTs > now) {
        setSubscriptionValid(true);
      } else {
        setSubscriptionValid(false);
        setLeads([]);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


    fetchAll();
  }, []);

  const visibleLeads = showAll ? leads : leads.slice(0, 3);

  // Save remark locally (localStorage)
  const submitRemark = (leadId: number) => {
    try {
      const trimmed = remarkText.trim();
      const updated = { ...remarks };

      if (trimmed === "") {
        // remove remark if empty
        delete updated[leadId];
      } else {
        updated[leadId] = trimmed;
      }

      setRemarks(updated);
      localStorage.setItem("leadRemarks", JSON.stringify(updated));
      addToast("Remark saved locally", "success");
      setRemarkText("");
      setRemarkingLeadId(null);
    } catch (err) {
      console.error("Error saving remark:", err);
      addToast("Error saving remark", "error");
    }
  };

  // ----- claimLead: POST to /api/leads/{id}/claim/ -----
  const claimLead = async (leadId: number) => {
    // guard: subscription must be valid
    if (!subscriptionValid) {
      const msg = "Your subscription is expired. Purchase a plan to continue claiming leads.";
      setClaimErrors((prev) => ({ ...prev, [leadId]: msg }));
      addToast(msg, "error");
      return;
    }

    // guard: credits must be available
    // Note: we assume each lead costs 1 credit. Change requiredCreditsPerLead if different.
    const requiredCreditsPerLead = 1;
    if (creditsAvailable !== null && creditsAvailable < requiredCreditsPerLead) {
      const msg = "Insufficient lead credits. Purchase/renew plan to get more leads.";
      setClaimErrors((prev) => ({ ...prev, [leadId]: msg }));
      addToast(msg, "error");
      return;
    }

    // clear previous error for this lead
    setClaimErrors((prev) => ({ ...prev, [leadId]: "" }));
    setClaimingLeadId(leadId);

    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(
        `https://api.wedmacindia.com/api/leads/${leadId}/claim/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // If not ok, read server message (JSON or text) and show inline error + toast
      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Claim failed (status ${res.status})`;
        try {
          const json = JSON.parse(text);
          errMsg = json.detail || json.message || JSON.stringify(json);
        } catch {
          if (text) errMsg = text;
        }
        setClaimErrors((prev) => ({ ...prev, [leadId]: errMsg }));
        addToast(errMsg, "error");
        return;
      }

      // success: response may include data — optional parse
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      // mark this lead as selected (reveal phone)
      setSelectedContactId(leadId);

      // Save contact timestamp (kept for local visibility fallback)
      const now = Date.now();
      const updatedMap = { ...claimedMap, [String(leadId)]: now };
      setclaimedMap(updatedMap);
      persistclaimedMap(updatedMap);

      // update lead locally if backend returned new fields
      if (data && typeof data === "object") {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, ...(data as Partial<Lead>) } : l
          )
        );
        // if backend returned updated credits, use them
        if ((data as any).credits_after !== undefined) {
          setCreditsAvailable((data as any).credits_after);
        } else {
          // otherwise decrement local creditsAvailable by requiredCreditsPerLead
          setCreditsAvailable((prev) => (prev !== null ? prev - requiredCreditsPerLead : prev));
        }
      } else {
        // decrement local creditsAvailable by requiredCreditsPerLead
        setCreditsAvailable((prev) => (prev !== null ? prev - requiredCreditsPerLead : prev));
      }

      // ✅ show success toast
      addToast("Lead contact successfully", "success");
    } catch (err: any) {
      console.error("Claim error:", err);
      const message = err?.message || "Claim failed";
      setClaimErrors((prev) => ({ ...prev, [leadId]: message }));
      addToast(message, "error");
    } finally {
      setClaimingLeadId(null);
    }
  };

  // helper: whether contact for a lead should be visible (selected OR claimed within last 24h)
  const isContactVisible = (lead: Lead) => {
    // if currently selected (just clicked) show
    if (selectedContactId === lead.id) return true;
    const ts = claimedMap[String(lead.id)];
    if (!ts) return false;
    return Date.now() - ts < CONTACT_VISIBLE_TTL;
  };

  // ----------------- NEW: disable based on API status -----------------
  // check API status first (case-insensitive). If API says "claimed", disable claim button.
  const isLeadContactDisabled = (lead: Lead) => {
    const status = lead.status ? String(lead.status).toLowerCase() : "";
    if (status === "claimed") return true;
    return false;
  };
  // -------------------------------------------------------------------

  // compute totals from API 'leads' (count status === 'claimed')
  const claimedFromApiCount = leads.filter(
    (l) => String(l.status || "").toLowerCase() === "claimed"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-xs px-3 py-2 rounded shadow ${
              t.type === "success"
                ? "bg-green-600 text-white"
                : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your overview
          </p>
        </div>
        <div className="flex items-center gap-3"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Week New Leads"
          value={summary?.new_this_week || 0}
          subtitle="Since midnight"
          icon={TrendingUp}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Total Leads"
          value={summary?.total_this_month || 0}
          subtitle="This month"
          icon={Users}
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard
          title="Claimed Leads"
          value={claimedFromApiCount}
          subtitle="From API (status: claimed)"
          icon={Coins}
        />
        <StatCard
          title="Bookings"
          value={0}
          subtitle="Confirmed this month"
          icon={Calendar}
          trend={{ value: "+15%", isPositive: true }}
        />
      </div>

      {/* Recent Leads / or subscription expired message */}
      {!subscriptionValid ? (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">No Active Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center">
              <p className="mb-3 text-muted-foreground">
                Your lead subscription has expired or no purchase found. Purchase/renew a plan to get leads.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => navigate("/payments")}>Purchase Plan</Button>
                <Button variant="outline" onClick={() => navigate("/pricing")}>View Plans</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Leads</CardTitle>
              {!loading && leads.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary/10 hover:text-primary"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showAll ? "Show Less" : "View All"}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-6">
                ⏳ Loading leads...
              </p>
            ) : leads.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No leads available.
              </p>
            ) : (
              <div className="space-y-4">
                {visibleLeads.map((lead) => {
                  const phoneVisible = isContactVisible(lead);
                  const contactDisabled = isLeadContactDisabled(lead);
                  return (
                    <div
                      key={lead.id}
                      className="relative block md:flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-foreground">
                            {lead.client_name}
                          </h3>
                        </div>

                        <div className="block md:flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{lead.service}</span>

                          {/* Booking Date */}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Booking: {lead.booking_date}</span>
                          </div>

                          {/* Created At */}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {lead.created_at}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            <span>{lead.budget_range?.label ?? "N/A"}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{lead.location}</span>
                          </div>
                        </div>
<div className="flex items-center w-80 gap-4 text-sm text-muted-foreground">
  <span className="break-words whitespace-normal min-w-0">
    {lead.requirements}
  </span>
</div>


                        {/* Show saved remark if exists */}
                        {remarks[lead.id] && (
                          <div className="mt-2 text-sm text-muted-foreground italic">
                            <strong>Remark:</strong> {remarks[lead.id]}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 relative">
                     {subscriptionValid ? (
  <>
    {/* Claim / Call Button */}
    <Button
      size="sm"
      disabled={contactDisabled || claimingLeadId === lead.id}
      onClick={() => {
        if (contactDisabled) return;
        claimLead(lead.id);
      }}
      className={`px-3 py-1 bg-white text-black border rounded text-sm flex items-center gap-2 ${
        contactDisabled
          ? "cursor-not-allowed"
          : "hover:bg-primary/10 hover:text-primary"
      }`}
    >
      <Phone className="w-4 h-4 inline" />
      {claimingLeadId === lead.id
        ? "Claiming..."
        : contactDisabled
        ? "Claimed"
        : "Claim"}
    </Button>

    {/* Upgrade Button */}
    <Button
      variant="outline"
      size="sm"
      className="hover:bg-primary/10 hover:text-primary"
      onClick={() => navigate("/payments")}
    >
      <ClockArrowUp className="w-4 h-4 mr-1" />
      Upgrade
    </Button>
  </>
) : (
  profile?.payment_status === "pending" && (
    <Button
      variant="default"
      size="sm"
      onClick={() => navigate("/payments")}
    >
      Unlock
    </Button>
  )
)}

                      
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
    </div>
  );
}
