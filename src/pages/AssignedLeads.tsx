"use client";
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
import {
  Lock,
  Search,
  Phone,
  Mail,
  Calendar,
  MapPin,
  MessageSquare,
} from "lucide-react";

type ApiLead = {
  id: number;
  first_name: string;
  last_name?: string;
  phone?: string | null;
  email?: string | null;
  makeup_types?: { id: number; name: string }[] | null;
  event_type?: string | null;
  requirements?: string | null;
  booking_date?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  budget_range?: { min_value: string; max_value: string } | null;
  location?: string | null;
  claimed_artists?:
    | { id: number; first_name: string; last_name: string }[]
    | null; // 👈 array
  booked_artists?:
    | { id: number; first_name: string; last_name: string }[]
    | null; // 👈 array
  assigned_to?: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
  requested_artist?: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
};

export default function AssignedLeads() {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");

  const statusOptions = ["assigned", "booked", "contacted", "pending"];
  const eventOptions = [
    "wedding",
    "engagement",
    "party",
    "reception",
    "haldi",
    "sangeet",
    "mehendi",
    "other",
  ];
  const [uiStatus, setUiStatus] = useState<{ [id: number]: string }>({});
  const currentArtistId = Number(localStorage.getItem("user_Id") || 0);
  const isAlreadyClaimedByMe = (lead: ApiLead, artistId: number) => {
    return (
      lead.claimed_artists?.some((a) => Number(a.id) === Number(artistId)) ??
      false
    );
  };

  const isAlreadyBookedByMe = (lead: ApiLead, artistId: number) => {
    return (
      lead.booked_artists?.some((a) => Number(a.id) === Number(artistId)) ??
      false
    );
  };

  // inside fetchLeads

  // safe renderer for values that may be string | number | object | null
  const renderValue = (v: unknown) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "string" || typeof v === "number") return String(v);

    // if it's an object, try common keys we might want:
    if (typeof v === "object") {
      if ("label" in v && typeof (v as any).label === "string")
        return (v as any).label;

      if ("name" in v && typeof (v as any).name === "string")
        return (v as any).name;

      if ("price" in v && (v as any).price != null)
        return `₹${(v as any).price}`;
      // fallback: try JSON (short)

      try {
        return JSON.stringify(v);
      } catch {
        return "[object]";
      }
    }

    return String(v);
  };

  // fetch assigned leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          "https://api.wedmacindia.com/api/leads/artist/my-assigned-leads/",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`Failed (status ${res.status})`);

        const data = await res.json();
        setLeads(Array.isArray(data.leads) ? data.leads : []);
        setLeads(data.leads);
        const statusMap: { [id: number]: string } = {};
        data.leads.forEach((l: ApiLead) => {
          statusMap[l.id] = l.status ?? "pending";
        });
        setUiStatus(statusMap);
      } catch (err: unknown) {
        console.error(err);
        setError((err as Error)?.message || "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // status badge colors
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status.toLowerCase()) {
      case "booked":
        return "bg-green-100 text-green-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // filtering
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${l.first_name ?? ""} ${l.last_name ?? ""} ${
          l.email ?? ""
        } ${l.phone ?? ""} ${l.event_type ?? ""}`.toLowerCase();
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

  // WhatsApp link
  const buildWhatsAppUrl = (phone?: string | null) => {
    if (!phone) return "";
    let digits = phone.replace(/\D+/g, "");
    if (digits.length === 10) digits = `91${digits}`;
    return `https://wa.me/${digits}`;
  };

  return (
    <Layout title="Assigned Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {leads.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Assigned</p>
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
    <Card>
  <CardContent className="p-4">
    <div className="text-2xl font-bold text-blue-600">
      {
        leads.filter((l) =>
          l.claimed_artists?.some(
            (a) => Number(a.id) === Number(currentArtistId)
          )
        ).length
      }
    </div>
    <p className="text-sm text-muted-foreground">Claimed</p>
  </CardContent>
</Card>

      
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Your Assigned Leads
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* filter inputs */}
            <div className="flex flex-wrap gap-4 mb-6 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads (name, phone, email, event)..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

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

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  ⏳ Loading assigned leads…
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
                      <TableHead>Requested Artist</TableHead> {/* 👈 new */}
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const clientName = `${lead.first_name ?? ""}${
                        lead.last_name ? " " + lead.last_name : ""
                      }`;
                      const bookingDate = lead.booking_date
                        ? new Date(lead.booking_date).toLocaleDateString()
                        : "-";
                      const assignedDate = lead.created_at
                        ? new Date(lead.created_at).toLocaleDateString("en-GB")
                        : "-";

                      const requestedArtistName = lead.requested_artist
                        ? `${lead.requested_artist.first_name} ${
                            lead.requested_artist.last_name ?? ""
                          }`
                        : "-";
                      const requestedArtistPhone =
                        lead.requested_artist?.phone ?? "-";

                      return (
                        <TableRow key={lead.id}>
                          {/* Client Details */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{clientName}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Phone className="w-3 h-3" />
      {isAlreadyClaimedByMe(lead, currentArtistId) ? (
        lead.phone ?? "-"
      ) : (
        <span className="text-gray-400 italic flex items-center gap-1">
          <Lock className="w-3 h-3" /> Hidden
        </span>
      )}
    </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" /> {lead.email ?? "-"}
                              </div>
                                  {lead.requirements && (
                                <div className="text-xs text-muted-foreground break-all italic mt-1">
                                  {lead.requirements}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Event Info */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {renderValue(lead.makeup_types?.length
    ? lead.makeup_types.map((m) => m.name).join(", ")
    : "-")}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" /> {bookingDate}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />{" "}
                                {renderValue(lead.location)}
                              </div>
                            </div>
                          </TableCell>

                          {/* Requested Artist 👇 */}
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {requestedArtistName}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />{" "}
                                {requestedArtistPhone}
                              </div>
                            </div>
                          </TableCell>

                          {/* Assigned Date */}
                          <TableCell>{assignedDate}</TableCell>

                          {/* Budget */}
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {renderValue(lead.budget_range.min_value)}?? -{" "}
                            </span>
                          </TableCell>

                          {/* Status */}

                          {/* Actions */}
                          <TableCell>
                            <div className="flex gap-2">
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (
                                      lead.phone &&
                                      lead.requested_artist?.phone
                                    ) {
                                      window.location.href = `tel:${lead.requested_artist.phone}`;
                                    }
                                  }}
                                >
                                  <Phone className="w-3 h-3 mr-1" /> Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const url = buildWhatsAppUrl(
                                      lead.requested_artist?.phone
                                    );
                                    if (url) window.open(url, "_blank");
                                  }}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />{" "}
                                  WhatsApp
                                </Button>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={isAlreadyClaimedByMe(
                                    lead,
                                    currentArtistId
                                  )}
                                  onClick={async () => {
                                    console.log(
                                      "CurrentArtistId:",
                                      currentArtistId,
                                      "Lead:",
                                      lead.id,
                                      "Claimed:",
                                      lead.claimed_artists
                                    );

                                    try {
                                      const token =
                                        localStorage.getItem("accessToken");
                                      const res = await fetch(
                                        `https://api.wedmacindia.com/api/leads/${lead.id}/claim/`,
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

                                      if (!res.ok)
                                        throw new Error("Failed to claim lead");

                                      setLeads((prev) =>
                                        prev.map((l) =>
                                          l.id === lead.id
                                            ? {
                                                ...l,
                                                status: "claimed",
                                                claimed_artists: [
                                                  ...(l.claimed_artists ?? []),
                                                  {
                                                    id: currentArtistId,
                                                    first_name: "You",
                                                    last_name: "",
                                                  },
                                                ],
                                              }
                                            : l
                                        )
                                      );

                                      alert("Lead successfully claimed!");
                                    } catch (err: unknown) {
                                      console.error(err);
                                      alert(
                                        (err as Error).message ||
                                          "Failed to claim lead"
                                      );
                                    }
                                  }}
                                >
                                  Claim
                                </Button>

                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={isAlreadyBookedByMe(
                                    lead,
                                    currentArtistId
                                  )}
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

                                      const data = await res.json(); // parse JSON always

                                      if (!res.ok) {
                                        // backend ka exact error msg show karo
                                        throw new Error(
                                          data.error ||
                                            `Failed to book lead: ${res.status}`
                                        );
                                      }

                                      setLeads((prev) =>
                                        prev.map((l) =>
                                          l.id === lead.id
                                            ? {
                                                ...l,
                                                status: "booked",
                                                booked_artists: [
                                                  ...(l.booked_artists ?? []),
                                                  {
                                                    id: currentArtistId,
                                                    first_name: "You",
                                                    last_name: "",
                                                  },
                                                ],
                                              }
                                            : l
                                        )
                                      );

                                      alert("Lead successfully booked!");
                                    } catch (err: unknown) {
                                      console.error(err);
                                      alert(
                                        (err as Error).message ||
                                          "Failed to book lead"
                                      );
                                    }
                                  }}
                                >
                                  Book
                                </Button>
                              </div>
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
