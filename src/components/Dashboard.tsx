import React, { useEffect, useState } from "react";
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
  Plane,
  Badge,
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeftRightIcon,
  ClockArrowUp,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, MyProfile } from "@/api/profile";
import { useNavigate } from "react-router-dom";
interface Lead {
  budget_range: string;
  requirements: string;
  id: number;
  client_name: string;
  status: string;
  service: string;
  booking_date: string;
  location: string;
}

interface Summary {
  new_this_week: number;
  total_this_month: number;
}

export function Dashboard({ phoneNumber }) {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // 👈 new state
  const [showNumber, setShowNumber] = useState(false);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // profile
        const profileData = await getMyProfile();
        setProfile(profileData);

        // leads
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
      }
       finally {
        setLoading(false); // stop loading
      }
    };

    fetchAll();
  }, []);
  const visibleLeads = showAll ? leads : leads.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <PlanBadge plan="Premium" /> */}
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              Credits Available
            </p>
            <p className="text-2xl font-bold text-primary">-</p>
          </div>
        </div>
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
          title="Credits Used"
          value={0}
          subtitle="This week"
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

      {/* Recent Leads */}
            <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              Recent Leads
            </CardTitle>
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
              {visibleLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">
                        {lead.client_name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          lead.status === "new"
                            ? "bg-primary/20 text-primary"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
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
                        <span>{lead.budget_range}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{lead.location}</span>
                      </div>
                    </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lead.requirements}</span>

                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {profile?.payment_status === "pending" ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate("/payments")}
                      >
                        Unlock
                      </Button>
                    ) : (
                      <>
                         <Button
        variant="outline"
        size="sm"
        className="hover:bg-primary/10 hover:text-primary"
        onClick={() => setShowNumber((prev) => !prev)}
      >
        <Phone className="w-4 h-4 mr-1" />
        Contact
      </Button>
      {showNumber && (
        <div className="absolute left-0 mt-2 w-max bg-white border text-black rounded shadow px-4 py-2 z-20">
          {phoneNumber}
        </div>
      )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <ClockArrowUp className="w-4 h-4 mr-1" />
                          Upgrade
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          Remark
                        </Button>
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
            <p className="text-sm text-muted-foreground">
              Keep your portfolio fresh
            </p>
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
            <p className="text-sm text-muted-foreground">
              Track your performance
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
