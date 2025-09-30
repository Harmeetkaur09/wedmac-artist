// src/pages/Support.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HelpCircle, Crown, Calendar } from "lucide-react";
import { PlanBadge } from "@/components/PlanBadge";
import toast, { Toaster } from "react-hot-toast";

type Ticket = {
  id: number;
  subject: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  created_at: string; // ISO date
  artist: number;
};

type CreditsHistoryItem = {
  id: number;
  transaction_type: string;
  credit_type: string;
  credits_before: number;
  credits_amount: number;
  credits_after: number;
  description: string;
  reference_id: string;
  subscription_plan?: string | null;
  plan_details?: {
    id: string;
    name: string;
    total_leads: number;
    price: string;
    duration_days: number;
    description?: string;
    features?: string[];
    created_at?: string;
  } | null;
  created_at: string;
  is_positive: boolean;
  is_negative: boolean;
};

export default function Support() {
  // Vite-friendly API base
  const API_BASE =
    (import.meta as any).env?.VITE_API_BASE ||
    (window as any).__API_BASE__ ||
    "https://api.wedmacindia.com";

  // current plan state (will be filled from API)
  const [currentPlan, setCurrentPlan] = useState({
    name: "—",
    price: "—",
    validUntil: "—",
    credits: 0,
    raw: null as CreditsHistoryItem | null,
  });

  const faqs = [
    {
      question: "How do I unlock leads?",
      answer:
        "To unlock leads, go to the dashboard and click on any lead card. You'll need sufficient credits in your account to unlock lead contact details.",
    },
    {
      question: "What happens when my plan expires?",
      answer:
        "When your plan expires, you'll lose access to premium features and your profile visibility will be reduced. You can renew your plan anytime to restore full access.",
    },
    {
      question: "How can I get more credits?",
      answer:
        "You can get more credits by upgrading your plan or purchasing additional credit packs from the Credit History section.",
    },
    {
      question: "Can I change my plan anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan anytime. Changes will take effect immediately, and billing will be prorated accordingly.",
    },
  ];

  // ticket form / list state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>("medium");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [profile, setProfile] = useState<{
    plan_name?: string;
    plan_price?: string;
    plan_valid_until?: string;
    available_leads?: number;
  }>({});

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/artists/my-profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Profile fetch failed");
      const data = await res.json();

      const plan = data.current_plan;

      setProfile({
        plan_name: plan?.name || "—",
        plan_price: plan?.price
          ? `₹${Number(plan.price).toLocaleString()}`
          : "—",
        available_leads: data?.available_leads ?? 0,
        plan_valid_until: plan
          ? new Date(
              new Date(data.plan_purchase_date).setDate(
                new Date(data.plan_purchase_date).getDate() +
                  plan.duration_days +
                  data.extended_days || 0
              )
            ).toLocaleDateString()
          : undefined,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // helper: robust token detection
  const getToken = () => {
    try {
      const anyWindow = window as any;
      // localstorage.authData (object)
      if (anyWindow.localstorage && (anyWindow.localstorage as any).authData) {
        const maybe = (anyWindow.localstorage as any).authData;
        if (maybe && typeof maybe === "object" && maybe.token)
          return maybe.token;
      }
      // common keys
      const candidates = ["authData", "accessToken", "token"];
      for (const key of candidates) {
        const raw = window.localstorage.getItem(key);
        if (!raw) continue;
        // try parse JSON
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.token) return parsed.token;
        } catch {
          // not JSON — assume raw is token string
          return raw;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  // fetch credits history and set currentPlan using latest entry (results[0])
  const fetchCreditsHistory = async () => {
    const token = getToken();
    if (!token) {
      // don't spam user with toast on mount if they aren't logged in, but show once when explicit call required
      console.warn("No token for credits history");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/credits/history/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Credits history fetch failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      // data.results expected (paginated)
      const results: CreditsHistoryItem[] = Array.isArray(data)
        ? data
        : data.results || [];
      if (results.length === 0) {
        // no history — keep defaults
        return;
      }
      // assuming results[0] is the most recent purchase
      const latest = results[0];

      // compute validUntil: created_at + duration_days (if plan_details.duration_days present)
      let validUntil = "—";
      const createdAt = latest.created_at || latest.plan_details?.created_at;
      const durationDays = latest.plan_details?.duration_days ?? null;
      if (
        createdAt &&
        durationDays != null &&
        !Number.isNaN(Number(durationDays))
      ) {
        try {
          const base = new Date(createdAt);
          base.setDate(base.getDate() + Number(durationDays));
          validUntil = base.toLocaleDateString();
        } catch {
          validUntil = "—";
        }
      }

      // format price (prefix ₹ if numeric string)
      let priceLabel = latest.plan_details?.price ?? "—";
      if (typeof priceLabel === "string") {
        const cleaned = priceLabel.replace(/[^0-9.]/g, "");
        if (cleaned && !isNaN(Number(cleaned)))
          priceLabel = `₹${Number(cleaned).toLocaleString()}`;
      }

      setCurrentPlan({
        name: latest.plan_details?.name ?? latest.description ?? "—",
        price: priceLabel,
        validUntil,
        credits: latest.plan_details?.total_leads ?? latest.credits_after ?? 0,
        raw: latest,
      });
    } catch (err) {
      console.error("Failed to load credits history", err);
      // don't throw toast on mount, but you can enable it if you want:
      // toast.error("Could not load subscription data.");
    }
  };

  // fetch tickets (same as before)
  const fetchTickets = async (status = "open") => {
    setLoadingTickets(true);
    const token = getToken();
    if (!token) {
      toast.error("Auth token not found. Please login.");
      setLoadingTickets(false);
      return;
    }
    try {
      const url = `${API_BASE}/api/support/artist/tickets/?status=${encodeURIComponent(
        status
      )}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch tickets: ${res.status} ${text}`);
      }
      const data = await res.json();
      const list: Ticket[] = Array.isArray(data)
        ? data
        : data.results || data.items || [];
      setTickets(list);
    } catch (err) {
      console.error(err);
      toast.error("Could not load tickets.");
    } finally {
      setLoadingTickets(false);
    }
  };

  // initial load: tickets + credits
  useEffect(() => {
    fetchTickets(statusFilter);
    fetchCreditsHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // create ticket (re-fetch tickets on success)
  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (!priority) {
      toast.error("Please select a priority.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a description.");
      return;
    }

    setCreating(true);
    const token = getToken();
    if (!token) {
      toast.error("Auth token not found. Please login.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/support/artist/tickets/create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, category, priority, description }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Create failed: ${res.status} ${errText}`);
      }

      await res.json(); // created object not used directly
      toast.success("Ticket created successfully.");

      // re-fetch ticket list (keeps source-of-truth from server)
      await fetchTickets(statusFilter);

      // clear form
      setSubject("");
      setCategory(undefined);
      setPriority("medium");
      setDescription("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in progress":
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      case "urgent":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Support & Help">
      <Toaster />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <PlanBadge plan={profile.plan_name || "—"} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">
                    {profile.plan_price}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {profile.plan_valid_until}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">
                    {profile.available_leads}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Raise New Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Raise a Support Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(v) => setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="payment">Payment Issues</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="profile">Profile Related</SelectItem>
                    <SelectItem value="content">Content Related</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                onValueChange={(v) => setPriority(v)}
                defaultValue={priority}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Detailed Description</Label>
              <Textarea
                id="message"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about your issue..."
                className="min-h-[120px]"
              />
            </div>

            <Button
              className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
              onClick={handleCreateTicket}
              disabled={creating}
            >
              {creating ? "Submitting..." : "Submit Ticket"}
            </Button>

            {/* Company Info Section */}
            <div className="pt-6 border-t mt-6 text-sm text-muted-foreground">
              <p className="font-semibold">
                Company:
                <span> Wedmac India</span>
              </p>

              <p className="font-semibold mt-2">
                Website:
                <span>
                  <a
                    href="https://www.wedmacindia.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    {" "}
                    https://wed-mac-qsxz.vercel.app/
                  </a>
                </span>
              </p>

              <p className="font-semibold mt-2">
                Email:
                <span>
                  <a
                    href="mailto:support@wedmacindia.com"
                    className="text-primary underline"
                  >
                    {" "}
                    support@wedmacindia.com
                  </a>
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Tickets list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Your Support Tickets</CardTitle>
              <div className="flex items-center gap-3">
                <Label className="text-sm">Filter</Label>
                <Select
                  onValueChange={(v) => setStatusFilter(v || "open")}
                  defaultValue={statusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="all">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Artist ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTickets ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm">
                        #{ticket.id}
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.created_at)}</TableCell>
                      <TableCell>{ticket.artist}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
