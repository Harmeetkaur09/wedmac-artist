import React, { useEffect, useRef, useState, ReactNode, useMemo } from "react";
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
  Workflow,
  PartyPopper,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, MyProfile } from "@/api/profile";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  event_type: string;
  makeup_types?: { id: number | string; name: string }[];
  booking_date: string;
  location: string;
  requirements: string;
  budget_range: {
    id: number;
    label: string;
    min_value: string;
    max_value: string;
  } | null;
  service: string | null;
  status: string;
  created_at: string;
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
const [filters, setFilters] = useState({
  location: "",
  name: "",
  makeup_type: "",
});

const [limit, setLimit] = useState(3);
const [offset, setOffset] = useState(0);
const [hasMore, setHasMore] = useState(true);

  // subscription / credits state
  const [subscriptionValid, setSubscriptionValid] = useState<boolean>(true);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<
    number | null
  >(null);
  const [planTotalLeads, setPlanTotalLeads] = useState<number | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
const [loadingMore, setLoadingMore] = useState(false);




  // per-lead UI state
  const [selectedContactId, setSelectedContactId] = useState<number | null>(
    null
  );
  const [remarkingLeadId, setRemarkingLeadId] = useState<number | null>(null);
  const [remarkText, setRemarkText] = useState("");

  // claim state
  const [claimingLeadId, setClaimingLeadId] = useState<number | null>(null);
  const [claimErrors, setClaimErrors] = useState<Record<number, string>>({});

  // remarks mapping: leadId -> remark text (persisted in localStorage)
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});

  // claimed map: { "<leadId>": timestampMs }  (kept for legacy 24h-visibility if needed)
  const [claimedMap, setclaimedMap] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

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
const fetchLeads = async (reset = false) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    const params = new URLSearchParams();

    if (filters.location) params.append("location", filters.location);
    if (filters.name) params.append("name", filters.name);
    if (filters.makeup_type) params.append("makeup_type", filters.makeup_type);

    // ✅ Only send limit (no offset)
    params.append("limit", limit.toString());

    const res = await fetch(
      `https://api.wedmacindia.com/api/leads/all-leads/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch leads");
    const data = await res.json();

    // ✅ Replace or append depending on reset flag
    if (reset) {
      setLeads(data.leads || []);
    } else {
      setLeads((prev) => [...prev, ...(data.leads || [])]);
    }

    setSummary(data.summary || null);
    // ✅ If less than limit leads are returned, stop loading more
    setHasMore((data.leads || []).length === limit);
  } catch (err) {
    console.error("Error fetching leads:", err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchLeads(true);
}, []);



  // fetch profile + leads + credits history
  useEffect(() => {
    const loadData  = async () => {
      try {
        console.log("Starting fetchAll");
        setLoading(true);
        const profileData = await getMyProfile();
        setProfile(profileData);

        if (profileData?.created_by_admin === true) {
          setIsAdminCreated(true);
          setSubscriptionValid(true);
          setCreditsAvailable(profileData.available_leads ?? 0); // ✅ leads dikha do
        } else {
          const plan = profileData.current_plan;
          const purchaseDate = profileData.plan_purchase_date
            ? new Date(profileData.plan_purchase_date).getTime()
            : null;

          const durationDays = plan?.duration_days || 0;
          // const extendedDays = plan?.extended_days || 0; // agar backend bhejta hai
          const totalDays = durationDays ;

          // 🔹 expiry calculate
          const expiryTs =
            purchaseDate && totalDays
              ? purchaseDate + totalDays * 24 * 60 * 60 * 1000
              : null;

          setSubscriptionId(plan?.id ?? null);
          setPlanTotalLeads(plan?.total_leads ?? null);
          setSubscriptionExpiresAt(expiryTs); // yaha set ho raha hai
          setCreditsAvailable(profileData.available_leads ?? 0); // ✅ leads dikha do

          const now = Date.now();
          if (plan && profileData.plan_verified && expiryTs && expiryTs > now) {
            setSubscriptionValid(true);
          } else {
            setSubscriptionValid(false);
          }
        }

        // 🔹 Leads fetch karo
        const token = localStorage.getItem("accessToken");
        const leadsRes = await fetch(
          "https://api.wedmacindia.com/api/leads/all-leads/?limit=3",
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
        setLeads(leadsData.leads || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  // Allowed cities based on plan

// useEffect(() => {
//   if (!profile) return;

//   const planName = profile?.current_plan?.name?.toLowerCase() || "";
//   const locations = profile?.preferred_locations || [];

//   let limitedCities: string[] = [];

//   if (planName.includes("basic")) {
//     limitedCities = locations.slice(0, 2);
//   } else if (planName.includes("standard")) {
//     limitedCities = locations.slice(0, 5);
//   } else if (planName.includes("premium") || planName.includes("pro")) {
//     // Premium & Pro: all cities allowed
//     limitedCities = locations;
//   }

//   setAllowedCities(limitedCities);
// }, [profile]);


const planInfoText = useMemo(() => {
  if (!profile?.current_plan) return "No active plan";

  const planName = profile.current_plan.name || "Unnamed Plan";
if (profile.current_plan && !profile.plan_purchase_date) {
    return `${planName} (Expired)`;
  }
  // ✅ Decide which date to show
  const purchaseDate = profile.plan_purchase_date
    ? new Date(profile.plan_purchase_date)
    : profile.retained_plan_date
    ? new Date(profile.retained_plan_date)
    : null;

  // ✅ Label text: Purchased vs Extended On
  const dateLabel = profile.plan_purchase_date
    ? "Purchased"
    : profile.retained_plan_date
    ? "Extended on"
    : "Purchased";

  const durationDays = profile.current_plan.duration_days || 0;
  const extendedDays = profile.extended_days || 0;
  const totalDays = durationDays + extendedDays;

  // if (!purchaseDate)
  //   return `${planName} (No ${dateLabel.toLowerCase()} date)`;

  const expiryDate = new Date(
    purchaseDate.getTime() + totalDays * 24 * 60 * 60 * 1000
  );

  const now = Date.now();
  const diff = expiryDate.getTime() - now;

  const expiryText = expiryDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (diff <= 0) {
    return `${planName} (Expired on ${expiryText})`;
  }

  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));

  return `${planName} — ${dateLabel}: ${purchaseDate.toLocaleDateString(
    "en-IN"
  )} → Ends on ${expiryText} (${daysLeft} days left)`;
}, [profile]);


const visibleLeads = leads.slice(0, limit);
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return visibleLeads;
    const q = searchQuery.toLowerCase();
    return visibleLeads.filter(
      (lead) =>
        `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(q) ||
        lead.location?.toLowerCase().includes(q) ||
        lead.event_type?.toLowerCase().includes(q)
    );
  }, [visibleLeads, searchQuery]);

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
      const msg =
        "Your subscription is expired. Purchase a plan to continue claiming leads.";
      setClaimErrors((prev) => ({ ...prev, [leadId]: msg }));
      addToast(msg, "error");
      return;
    }

    // guard: credits must be available
    // Note: we assume each lead costs 1 credit. Change requiredCreditsPerLead if different.
    const requiredCreditsPerLead = 1;
    if (
      creditsAvailable !== null &&
      creditsAvailable < requiredCreditsPerLead
    ) {
      const msg =
        "Insufficient lead credits. Purchase/renew plan to get more leads.";
      setClaimErrors((prev) => ({ ...prev, [leadId]: msg }));
      addToast(msg, "error");
      return;
    }

    // clear previous error for this lead
    setClaimErrors((prev) => ({ ...prev, [leadId]: "" }));
    setClaimingLeadId(leadId);

    try {
      const token = localStorage.getItem("accessToken");
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
          setCreditsAvailable((prev) =>
            prev !== null ? prev - requiredCreditsPerLead : prev
          );
        }
      } else {
        // decrement local creditsAvailable by requiredCreditsPerLead
        setCreditsAvailable((prev) =>
          prev !== null ? prev - requiredCreditsPerLead : prev
        );
      }

      // ✅ show success toast
      window.location.reload();
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
          <div className="mb-4 text-sm text-black">
            <div>
              <strong>Plan:</strong> {planInfoText}
            </div>
            <div>
              <strong>Leads:</strong> {creditsAvailable ?? 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* New Leads This Week */}
        <StatCard
          title="Week New Leads"
          value={
            leads.filter((lead) => {
              const createdAt = new Date(lead.created_at);
              const now = new Date();
              const weekAgo = new Date();
              weekAgo.setDate(now.getDate() - 7);
              return createdAt >= weekAgo;
            }).length
          }
          icon={TrendingUp}
        />

        {/* Total Leads (from frontend leads array) */}
        <StatCard title="Total Leads" value={leads.length} icon={Users} />
      </div>

      {/* Recent Leads / or subscription expired message */}

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Recent Leads
            </CardTitle>
            {/* {!loading && leads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
                onClick={() => setShowAll((prev) => !prev)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showAll ? "Show Less" : "View All"}
              </Button>
            )} */}
          </div>
          <div className="mb-4">
          <input
  type="text"
  placeholder="Search by name, location, or event type..."
  value={searchQuery}
  onChange={(e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setFilters((prev) => ({
      ...prev,
      name: q, // assuming backend supports ?name=
    }));
  }}
  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
/>

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
              {filteredLeads.map((lead) => {
                const phoneVisible = isContactVisible(lead);
                const contactDisabled = isLeadContactDisabled(lead);

                return (
                  <div
                    key={lead.id}
                    className="relative block md:flex items-center justify-between p-4 bg-white shadow-md md:shadow-none md:bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors duration-200"
                  >
                    {subscriptionValid ? (
                      // ✅ Subscription Active: Full Lead Details
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center text-xl justify-between"> {/* increased gap from 3 → 4 */}
  <h3 className="font-medium text-foreground">
    {lead.first_name} {lead.last_name}
  </h3>

  <div className="md:hidden shadow-md flex items-center gap-2 relative ml-2"> {/* added margin-left */}
    {(() => {
      const planName = profile?.current_plan?.name?.toLowerCase() || "";
      const leadMinBudget = Number(lead.budget_range?.min_value || 0);

      let maxAllowedBudget = 0;
      if (planName.includes("trial")) maxAllowedBudget = 12000;
      else if (planName.includes("basic")) maxAllowedBudget = 15000;
      else if (planName.includes("standard")) maxAllowedBudget = 40000;
      else if (planName.includes("premium") || planName.includes("pro"))
        maxAllowedBudget = Infinity;

      const budgetAllowed = leadMinBudget <= maxAllowedBudget;

      return budgetAllowed ? (
        <Button
          size="sm"
          onClick={() => claimLead(lead.id)}
          disabled={claimingLeadId === lead.id}
          className="px-3 py-1 bg-white text-black border rounded text-sm flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
        >
          {claimingLeadId === lead.id ? "Claiming..." : "Claim"}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => navigate("/payments")}
          className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-2 hover:bg-primary/80"
        >
          Upgrade Plan to Claim
        </Button>
      );
    })()}
  </div>
</div>


                          <div className="block md:flex items-center gap-4 text-sm text-muted-foreground">
                         

                            {/* Booking Date */}
                            <div className="flex items-center  gap-6 md:gap-2 mb-1 md:mb-0">
                              <Calendar className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-sm md:ml-0 mr-[45px] md:mr-0 ml-1">Booking:</p>
                              <span className="text-black text-lg md:text-sm  md:ml-0">{new Date(lead.booking_date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "numeric",
                                    year: "numeric",
                                  }
                                )}</span>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center gap-6 md:gap-2 mb-1 md:mb-0">
                              <Calendar className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-sm md:ml-0 mr-[48px] md:mr-0 ml-1">Created:</p>
                              <span className="text-black text-lg md:text-sm md:ml-0">{new Date(lead.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-6 md:gap-1 mb-1 md:mb-0">
                              <IndianRupee className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-base md:hidden mr-[53px] md:mr-0 ml-1">Budget:</p>
  <span className="text-black text-lg md:text-sm md:ml-0">
                                    {lead.budget_range?.min_value ?? "N/A"}
                              </span>
                            </div>

                           <div className="flex items-center gap-6 mb-1 md:gap-1 md:mb-0">
<MapPin className="hidden md:block w-3 h-3" />  <p className="text-black text-lg md:text-md md:hidden mr-[45px] md:mr-0 ml-1">Location:</p>
  <span className="text-black text-lg md:text-sm  md:ml-0">{lead.location}</span>
</div>


                            <div className="flex items-center gap-6 md:gap-1 mb-1 md:mb-0">
                              <PartyPopper className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-base md:hidden ml-1 mr-[53px] md:mr-0">Service:</p>
                              <span className="text-black text-lg md:text-sm  md:ml-0">{lead.makeup_types?.length
    ? lead.makeup_types.map((m) => m.name).join(", ")
    : "-"}</span>
                            </div>
                          </div>

                          <div className="flex  w-80 gap-6 text-sm text-muted-foreground ">
                            <p className="text-black text-lg md:text-base md:hidden ml-1">Requirements:</p>
                            <span className="break-words text-black text-lg md:text-sm  md:ml-0 whitespace-normal min-w-0 mb-1 md:mb-0">
                              {lead.requirements}
                            </span>
                          </div>

                          {/* Saved Remark */}
                          {remarks[lead.id] && (
                            <div className="mt-2 text-sm text-muted-foreground italic">
                              <strong>Remark:</strong> {remarks[lead.id]}
                            </div>
                          )}
                        </div>

                        {/* Claim Button */}
 
 <div className="hidden md:flex items-center gap-2 relative ml-2">
    {(() => {
      const planName = profile?.current_plan?.name?.toLowerCase() || "";
      const leadMinBudget = Number(lead.budget_range?.min_value || 0);

      let maxAllowedBudget = 0;
      if (planName.includes("trial")) maxAllowedBudget = 12000;
      else if (planName.includes("basic")) maxAllowedBudget = 15000;
      else if (planName.includes("standard")) maxAllowedBudget = 40000;
      else if (planName.includes("premium") || planName.includes("pro"))
        maxAllowedBudget = Infinity;

      const budgetAllowed = leadMinBudget <= maxAllowedBudget;

      return budgetAllowed ? (
        <Button
          size="sm"
          onClick={() => claimLead(lead.id)}
          disabled={claimingLeadId === lead.id}
          className="px-3 py-1 bg-white text-black border rounded text-sm flex items-center gap-2 hover:bg-primary/10 hover:text-primary"
        >
          {claimingLeadId === lead.id ? "Claiming..." : "Claim"}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => navigate("/payments")}
          className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-2 hover:bg-primary/80"
        >
          Upgrade Plan to Claim
        </Button>
      );
    })()}
  </div>

                      </>
                    ) : (
                      // ❌ Subscription Inactive: Limited Details

                      <div className="flex items-center justify-between gap-4 w-full">
                        {/* Left Side (details) */}
                        <div className="flex flex-col gap-2 ">
                          <div className="flex items-center text-xl justify-between mb-4 md:mb-0"> {/* increased gap from 3 → 4 */}

                          {/* First row: Name, Booking, Location */}
                            <h3 className="font-medium text-lg text-foreground">
                              {lead.first_name} {lead.last_name}
                            </h3>
                             <div className="md:hidden flex items-center mt-4 md:mt-0">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate("/payments")}
                            className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80"
                          >
                            Buy Plan to Claim
                          </Button>
                        </div>
                        </div>
                          <div className="flex flex-wrap items-center gap-4">

                            <div className="flex items-center gap-6 md:gap-2 mb-1 md:mb-0">
                              <Calendar className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-sm md:ml-0  mr-[45px] md:mr-0 ml-1">Booking:</p>
                            <span className="text-black text-lg md:text-sm ml-2 md:ml-0"> {new Date(lead.booking_date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "numeric",
                                    year: "numeric",
                                  }
                                )}</span>
                            </div>
                                    <div className="flex items-center gap-6 md:gap-2  mb-1 md:mb-0">
                              <Calendar className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-sm md:ml-0 mr-[48px] md:mr-0  ml-1">Created:</p>
                             <span className="text-black text-lg md:text-sm ml-2 md:ml-0">
                                {new Date(lead.created_at).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>

                                             <div className="flex items-center gap-6 mb-1 md:gap-1 md:mb-0">
<MapPin className="hidden md:block w-3 h-3" />  <p className="text-black text-lg md:text-md md:hidden mr-[53px] md:mr-0  ml-1">Location:</p>
  <span className="text-black text-lg md:text-sm  md:ml-0">{lead.location}</span>
</div>
                           <div className="flex items-center gap-6 mb-1 md:gap-1 md:mb-0">
                              <PartyPopper className="hidden md:block w-3 h-3" />
                              <p className="text-black text-lg md:text-base md:hidden mr-[53px] md:mr-0  ml-1">Service:</p>
                              <span className="text-black text-lg md:text-sm ml-2 md:ml-0">{lead.makeup_types?.length
    ? lead.makeup_types.map((m) => m.name).join(", ")
    : "-"}</span>
                            </div>
                          </div>

                          {/* Second row: Requirements */}
                <div className="flex  w-80 gap-6 text-sm text-muted-foreground ">
                            <p className="text-black text-lg md:text-base md:hidden ml-1">Requirements:</p>
                            <span className="break-words text-black text-lg md:text-sm ml-2 md:ml-0 whitespace-normal min-w-0 mb-1 md:mb-0">
                              {lead.requirements}
                            </span>
                          </div>
                        </div>

                        {/* Right Side (button) */}
                     <div className="hidden md:flex items-center mt-4 md:mt-0">
  <Button
    variant="default"
    size="sm"
    onClick={() => navigate("/payments")}
    className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80"
  >
    Buy Plan to Claim
  </Button>
</div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
{hasMore && (
  <div className="text-center mt-4">
<Button
  variant="outline"
  onClick={async () => {
    setLoadingMore(true);
    try {
      const newLimit = limit + 3;
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams();
      params.append("limit", newLimit.toString());
      const res = await fetch(`https://api.wedmacindia.com/api/leads/all-leads/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLeads(data.leads || []);
      setHasMore((data.leads || []).length === newLimit);
      setLimit(newLimit); // update limit only after fetch
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false); // ✅ stop button loading
    }
  }}
  disabled={loadingMore}
>
  {loadingMore ? "Loading..." : "Load More"}
</Button>

  </div>
)}



      {/* Quick Actions */}
    </div>
  );
}
