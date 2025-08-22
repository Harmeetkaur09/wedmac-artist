import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { PlanBadge } from "./PlanBadge";
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


export function Dashboard({ phone }: { phone?: string }) {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // per-lead UI state
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [remarkingLeadId, setRemarkingLeadId] = useState<number | null>(null);
  const [remarkText, setRemarkText] = useState("");

  // claim state: currently claiming which lead (id) and per-lead errors
  const [claimingLeadId, setClaimingLeadId] = useState<number | null>(null);
  const [claimErrors, setClaimErrors] = useState<Record<number, string>>({});

  // remarks mapping: leadId -> remark text (persisted in localStorage)
  const [remarks, setRemarks] = useState<{ [key: number]: string }>({});

  // Toast state
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

  // fetch profile + leads
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const profileData = await getMyProfile();
        setProfile(profileData);

        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(
          "https://wedmac-be.onrender.com/api/leads/artist/recent-leads/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch leads");
        const data = await res.json();
        setSummary(data.summary);
        setLeads(data.leads);
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
    // clear previous error for this lead
    setClaimErrors((prev) => ({ ...prev, [leadId]: "" }));
    setClaimingLeadId(leadId);

    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(
        `https://wedmac-be.onrender.com/api/leads/${leadId}/claim/`,
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

      // update lead locally if backend returned new fields
      if (data && typeof data === "object") {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...(data as Partial<Lead>) } : l)));
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
          <p className="text-muted-foreground mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Credits Available</p>
            <p className="text-2xl font-bold text-primary">-</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Week New Leads" value={summary?.new_this_week || 0} subtitle="Since midnight" icon={TrendingUp} trend={{ value: "+12%", isPositive: true }} />
        <StatCard title="Total Leads" value={summary?.total_this_month || 0} subtitle="This month" icon={Users} trend={{ value: "+8%", isPositive: true }} />
        <StatCard title="Credits Used" value={0} subtitle="This week" icon={Coins} />
        <StatCard title="Bookings" value={0} subtitle="Confirmed this month" icon={Calendar} trend={{ value: "+15%", isPositive: true }} />
      </div>

      {/* Recent Leads */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Leads</CardTitle>
            {!loading && leads.length > 0 && (
              <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary" onClick={() => setShowAll((prev) => !prev)}>
                <Eye className="w-4 h-4 mr-2" />
                {showAll ? "Show Less" : "View All"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-6">⏳ Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No leads available.</p>
          ) : (
            <div className="space-y-4">
              {visibleLeads.map((lead) => (
                <div key={lead.id} className="relative flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{lead.client_name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${lead.status === "new" ? "bg-primary/20 text-primary" : "bg-blue-100 text-blue-700"}`}>
                        {lead.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lead.service}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{lead.booking_date}</span>
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

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lead.requirements}</span>
                    </div>

                    {/* Show saved remark if exists */}
                    {remarks[lead.id] && (
                      <div className="mt-2 text-sm text-muted-foreground italic">
                        <strong>Remark:</strong> {remarks[lead.id]}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 relative">
                    {profile?.payment_status === "pending" ? (
                      <Button variant="default" size="sm" onClick={() => navigate("/payments")}>
                        Unlock
                      </Button>
                    ) : (
                      <>
                        {/* Contact Number - triggers claim */}
                        <div
                          className={`px-3 py-1 border rounded text-sm cursor-pointer flex items-center gap-2 ${claimingLeadId === lead.id ? "opacity-70 pointer-events-none" : "hover:bg-primary/10 hover:text-primary"}`}
                          onClick={() => {
                            if (selectedContactId === lead.id) {
                              setSelectedContactId(null);
                              return;
                            }
                            claimLead(lead.id);
                          }}
                        >
                          <Phone className="w-4 h-4 inline" />
                          {claimingLeadId === lead.id ? "Claiming..." : selectedContactId === lead.id ? lead.phone : "Contact"}
                        </div>

                        {/* show inline claim error if any */}
                        {claimErrors[lead.id] && <div className="text-xs text-red-400 mt-1 max-w-xs">{claimErrors[lead.id]}</div>}

                        {/* Upgrade */}
                     <Button
  variant="outline"
  size="sm"
  className="hover:bg-primary/10 hover:text-primary"
  onClick={() => navigate("/payments")}
>
  <ClockArrowUp className="w-4 h-4 mr-1" />
  Upgrade
</Button>

                        {/* Remark toggle & popup */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            const next = remarkingLeadId === lead.id ? null : lead.id;
                            setRemarkingLeadId(next);
                            setRemarkText(next ? remarks[lead.id] || "" : "");
                          }}
                        >
                          Remark
                        </Button>

                        {remarkingLeadId === lead.id && (
                          <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded shadow px-3 py-3 z-20">
                            <input type="text" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} placeholder="Enter remark..." className="w-full border px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                            <div className="flex justify-end gap-2 mt-3">
                              <Button size="sm" onClick={() => submitRemark(lead.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setRemarkingLeadId(null); setRemarkText(""); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Update Profile</h3>
            <p className="text-sm text-muted-foreground">Keep your portfolio fresh</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Buy Credits</h3>
            <p className="text-sm text-muted-foreground">Unlock more leads</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Track your performance</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
