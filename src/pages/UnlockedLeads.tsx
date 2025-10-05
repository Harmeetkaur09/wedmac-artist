import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Unlock, Search, Phone, Mail, Calendar, MapPin } from "lucide-react";

type ApiLead = {
  id: number;
  makeup_types?: { id: number; name: string }[];
  first_name: string;
  last_name?: string;
  phone?: string | null;
  email?: string | null;
  event_type?: string | null;

  requirements?: string | null;
  booking_date?: string | null;
  source?: string | null;
  status?: string | null;
  last_contact?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  service?: string | null;
  budget_range?: string | null;
  location?: string | null;
  assigned_to?: string | null;
  requested_artist?: string | null;
};

export default function UnlockedLeads() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // filters / UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  // fixed options
  const statusOptions = ["booked", "New"];
  const eventOptions = [
    "wedding",
    "engagement",
    "party",
    "Bridal",
    "Engagement",
    "Party",
    "Airbrush",
    "Haldi",
    "Mehandi",
    "Sangeet",
    "Reception",
    "Nude",
    "Smoky",
    "Celebrity",
    "Other",
    "modernart",
  ];

  // fetch claimed/unlocked leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          "https://api.wedmacindia.com/api/leads/artist/my-claimed-leads/",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            text || `Failed to fetch leads (status ${res.status})`
          );
        }

        const data = await res.json();
        console.log("API response:", data);

        setLeads(Array.isArray(data.leads) ? data.leads : []);
      } catch (err: any) {
        console.error("Failed to load unlocked leads:", err);
        setError(err?.message || "Failed to fetch unlocked leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "booked":
        return "bg-green-100 text-green-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contact_success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${l.first_name ?? ""} ${l.last_name ?? ""} ${
          l.email ?? ""
        } ${l.phone ?? ""} ${l.service ?? ""} ${
          l.requirements ?? ""
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (
        statusFilter !== "all" &&
        (l.status ?? "").toLowerCase() !== statusFilter.toLowerCase()
      )
        return false;
      if (
        eventFilter !== "all" &&
        (l.event_type ?? "").toLowerCase() !== eventFilter.toLowerCase()
      )
        return false;
      return true;
    });
  }, [leads, searchQuery, statusFilter, eventFilter]);

  // safe WhatsApp number builder - strips non digits and leading + if present
  const buildWhatsAppUrl = (phone?: string | null) => {
    if (!phone) return "";
    // remove non-digit characters
    let digits = phone.replace(/\D+/g, "");
    // if number is 10 digits (India), prefix with 91
    if (digits.length === 10) digits = `91${digits}`;
    return `https://wa.me/${digits}`;
  };

  return (
    <Layout title="Unlocked Leads">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {leads.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Unlocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {
                  leads.filter(
                    (l) => (l.status ?? "").toLowerCase() === "booked"
                  ).length
                }
              </div>
              <p className="text-sm text-muted-foreground">Booked</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-primary" />
              Your Unlocked Leads
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads (name, phone, email, service)..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={eventFilter}
                  onValueChange={(val) => setEventFilter(val)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {eventOptions.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e.charAt(0).toUpperCase() + e.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setEventFilter("all");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  ⏳ Loading unlocked leads…
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-400">{error}</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No leads found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Details</TableHead>
                      <TableHead>Event Info</TableHead>
                      <TableHead>Unlock Date</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const clientName = `${lead.first_name ?? ""}${
                        lead.last_name ? " " + lead.last_name : ""
                      }`;
                      const phone = lead.phone ?? "-";
                      const email = lead.email ?? "-";
                      const eventType = lead.event_type ?? lead.service ?? "-";
                      const bookingDate = lead.booking_date
                        ? new Date(lead.booking_date).toLocaleDateString()
                        : "-";
                      const budget = lead.budget_range ?? "₹25000 - ₹30000";
                      const location = lead.location ?? "-";

                      return (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{clientName}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {phone}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {email}
                              </div>
                              {lead.notes && (
                                <div className="text-xs text-muted-foreground italic mt-1">
                                  {lead.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{lead.makeup_types?.length
    ? lead.makeup_types.map((m) => m.name).join(", ")
    : "-"}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {bookingDate}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {location}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {lead.created_at && (
                              <div className="text-xs text-muted-foreground  mt-1">
                                {new Date(lead.created_at).toLocaleDateString(
                                  "en-GB"
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {budget}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status ?? "-"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              {/* Call Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (!lead.phone) return;
                                  window.location.href = `tel:${(
                                    lead.phone ?? ""
                                  ).replace(/\s+/g, "")}`;
                                }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>

                              {/* WhatsApp Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const url = buildWhatsAppUrl(lead.phone);
                                  if (!url) return;
                                  window.open(url, "_blank");
                                }}
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                WhatsApp
                              </Button>

                              {/* Book Button */}
                              <Button
                                size="sm"
                                variant="default"
                                disabled={lead.status === "booked"} // disable if already booked
                                onClick={async () => {
                                  try {
                                    const token =
                                      localStorage.getItem("accessToken");
                                    const res = await fetch(
                                      `https://api.wedmacindia.com/api/leads/${lead.id}/book/`,
                                      {
                                        method: "POST",
                                        headers: {
                                          Authorization: token
                                            ? `Bearer ${token}`
                                            : "",
                                          "Content-Type": "application/json",
                                        },
                                      }
                                    );

                                    const data = await res.json(); // response ko parse karo

                                    if (!res.ok) {
                                      // agar API error bhej rahi h to wahi dikhao
                                      throw new Error(
                                        data.error || "Failed to book lead"
                                      );
                                    }

                                    // success case
                                    setLeads((prev) =>
                                      prev.map((l) =>
                                        l.id === lead.id
                                          ? { ...l, status: "booked" }
                                          : l
                                      )
                                    );

                                    alert("Lead successfully booked!");
                                  } catch (err: any) {
                                    console.error(err);
                                    alert(err.message || "Failed to book lead");
                                  }
                                }}
                              >
                                Book
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
