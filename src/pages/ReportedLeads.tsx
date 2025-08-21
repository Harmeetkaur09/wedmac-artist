import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";

// NOTE: This component makes two network calls to your local APIs:
// 1) POST /api/documents/upload/  -> returns an object containing at least { id, file_name, file_url }
// 2) POST /api/leads/false-claims/ -> expects { lead: number, reason: string, proof_documents: number[] }
// Make sure your backend allows CORS from your frontend origin when testing in the browser.

type ReportedLeadItem = {
  id: number;
  clientName: string;
  phone: string;
  reportReason: string;
  reportDate: string;
  status: string;
  description: string;
};

type UploadedDoc = {
  id: number;
  file_name: string;
  file_url?: string;
  file_type?: string;
  tag?: string;
};

export default function ReportedLeads() {
  // Sample static data (you can replace this with a fetch to your leads API)
  const [reportedLeads, setReportedLeads] = useState<ReportedLeadItem[]>([
    {
      id: 1,
      clientName: "John Doe",
      phone: "+91 9876543213",
      reportReason: "Fake inquiry",
      reportDate: "2024-01-20",
      status: "Under Review",
      description: "Client asked for services but provided fake contact details",
    },
    {
      id: 2,
      clientName: "Jane Smith",
      phone: "+91 9876543214",
      reportReason: "Spam",
      reportDate: "2024-01-18",
      status: "Action Taken",
      description: "Multiple fake inquiries from same number",
    },
    {
      id: 3,
      clientName: "Mike Johnson",
      phone: "+91 9876543215",
      reportReason: "Inappropriate behavior",
      reportDate: "2024-01-15",
      status: "Resolved",
      description: "Client was rude and used inappropriate language",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [leadId, setLeadId] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileType, setFileType] = useState("pan");
  const [tag, setTag] = useState("front");
  const [selectedLeadName, setSelectedLeadName] = useState<string>("");

  // Claimed leads dropdown state
  const [claimedLeads, setClaimedLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

const [falseClaims, setFalseClaims] = useState<any[]>([]);
const [claimsLoading, setClaimsLoading] = useState(false);
const [claimsError, setClaimsError] = useState<string | null>(null);

// auto-hide toast after 3.5s
useEffect(() => {
if (!toast) return;
const t = setTimeout(() => setToast(null), 3500);
return () => clearTimeout(t);
}, [toast]);
  const getAuthHeader = () => {
    // Try a few common keys where the JWT might be stored. Adjust as needed for your app.
    const token =
      typeof window !== "undefined" &&
      (sessionStorage.getItem("accessToken") || sessionStorage.getItem("token") || localStorage.getItem("jwt") || "");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

const fetchFalseClaims = async (status = "approved") => {
try {
setClaimsLoading(true);
setClaimsError(null);
const headers = {
"Content-Type": "application/json",
...getAuthHeader(),
};
const resp = await fetch(`https://wedmac-be.onrender.com/api/leads/false-claims/my/`, {
method: "GET",
headers,
});
if (!resp.ok) {
const text = await resp.text();
throw new Error(`Failed to fetch false claims: ${resp.status} ${text}`);
}
const data = await resp.json();
setFalseClaims(Array.isArray(data) ? data : data.results || []);
} catch (err: any) {
console.error(err);
setClaimsError(err?.message || "Failed to load false claims");
} finally {
setClaimsLoading(false);
}
};

// Fetch false claims on mount
useEffect(() => {
  fetchFalseClaims(); // default status = "approved"
}, []);

  // Fetch claimed leads to populate dropdown
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLeadsLoading(true);
        setLeadsError(null);
        const headers = {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        };

        const resp = await fetch("https://wedmac-be.onrender.com/api/leads/artist/my-claimed-leads/", {
          method: "GET",
          headers,
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Failed to fetch leads: ${resp.status} ${text}`);
        }

        const data = await resp.json();
        // Support both array response or paginated { results: [] }
        const items = Array.isArray(data) ? data : (data.results || data.data || []);
        setClaimedLeads(items);
      } catch (err: any) {
        console.error(err);
        setLeadsError(err?.message || "Failed to load leads");
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Under Review":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Action Taken":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Action Taken":
        return "bg-green-100 text-green-800";
      case "Resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Upload a single file to the documents/upload endpoint
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setStatusMessage("Uploading file...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", fileType);
      formData.append("tag", tag);

      const headers = getAuthHeader();

      const resp = await fetch("https://wedmac-be.onrender.com/api/documents/upload/", {
        method: "POST",
        headers: {
          // Note: do not set Content-Type for FormData; browser will add the correct boundary
          ...headers,
        },
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Upload failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      // Expecting response like: { id: 15, file_name: "pan_card.jpg", file_url: "https://..." }
      if (!data?.document_id) throw new Error("Upload response did not include an id");

      const doc: UploadedDoc = {
        id: data.document_id,
        file_name: data.file_name || file.name,
        file_url: data.file_url,
        file_type: data.file_type || fileType,
        tag: data.tag || tag,
      };

      setUploadedDocs((prev) => [...prev, doc]);
      setStatusMessage("Upload successful");
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded doc from the local list (does not delete on server)
  const removeUploadedDoc = (id: number) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Submit false claim payload to API
  const handleSubmitReport = async () => {
    try {
      setStatusMessage(null);

      if (leadId === "" || !reason.trim()) {
        setStatusMessage("Please provide a lead ID and a reason.");
        return;
      }

      const payload = {
        lead: Number(leadId),
        reason: reason.trim(),
        proof_documents: uploadedDocs.map((d) => d.id),
      };

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      };

      setStatusMessage("Submitting report...");

      const resp = await fetch("https://wedmac-be.onrender.com/api/leads/false-claims/", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Submit failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
setStatusMessage("Report submitted successfully.");
setToast({ message: "Report submitted successfully.", type: "success" });
      // Optionally update UI - add a new item to reportedLeads locally
      setReportedLeads((prev) => [
        {
          id: data?.id || Math.floor(Math.random() * 100000),
          clientName: `Lead #${leadId}`,
          phone: "",
          reportReason: reason,
          reportDate: new Date().toISOString().slice(0, 10),
          status: "Under Review",
          description: uploadedDocs.map((d) => d.file_name).join(", ") || "",
        },
        ...prev,
      ]);

      // Reset form
      setLeadId("");
      setReason("");
      setUploadedDocs([]);
      setShowForm(false);
    }
     
    catch (err: any) {
      console.error(err);
      setStatusMessage(err?.message || "Failed to submit report");
      setToast({ message: err?.message || "Failed to submit report", type: "error" });
    }
  };

  // When user selects files via input
  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Upload them sequentially to keep UI simple
    for (let i = 0; i < files.length; i++) {
      await handleFileUpload(files[i]);
    }
    // clear the input so same file can be chosen again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout title="Reported Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reported Leads Table */}
    <Card>
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Flag className="w-5 h-5 text-primary" />
Reported Leads
</CardTitle>
</CardHeader>
<CardContent>
<Table>
<TableHeader>
<TableRow>
<TableHead>Lead Details</TableHead>
<TableHead>Report Reason</TableHead>
<TableHead>Report Date</TableHead>
<TableHead>Status</TableHead>
<TableHead>Description</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{claimsLoading ? (
<TableRow>
<TableCell colSpan={5}>Loading...</TableCell>
</TableRow>
) : claimsError ? (
<TableRow>
<TableCell colSpan={5} className="text-red-600">{claimsError}</TableCell>
</TableRow>
) : falseClaims.length === 0 ? (
<TableRow>
<TableCell colSpan={5}>No reports found.</TableCell>
</TableRow>
) : (
falseClaims.map((item: any) => (
<TableRow key={item.id}>
<TableCell>
<div className="space-y-1">
<div className="font-medium">{item.lead_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || `Lead #${item.lead_id || item.lead}`}</div>
<div className="text-sm text-muted-foreground">{item.phone || ''}</div>
</div>
</TableCell>
<TableCell>
<Badge variant="destructive" className="bg-red-100 text-red-800">{item.reason}</Badge>
</TableCell>
<TableCell>{item.created_at ? item.created_at.slice(0,10) : ''}</TableCell>
<TableCell>
<div className="flex items-center gap-2">
{getStatusIcon(item.status || 'Under Review')}
<Badge className={getStatusColor(item.status || 'Under Review')}>{item.status ? item.status : 'Under Review'}</Badge>
</div>
</TableCell>
<TableCell>
<div className="max-w-xs">
<p className="text-sm text-muted-foreground line-clamp-2">
{item.proof_documents && item.proof_documents.length > 0 ? item.proof_documents.map((d: any) => d.file_name).join(', ') : ''}
</p>
</div>
</TableCell>
</TableRow>
))
)}
</TableBody>
</Table>
</CardContent>
</Card>

        {/* Report New Lead (form) */}
        <Card>
          <CardHeader>
            <CardTitle>Report a Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you encounter fake leads, spam, or inappropriate behavior, report it to help improve the platform.
            </p>

            {!showForm ? (
              <Button
                className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
                onClick={() => setShowForm(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Report New Lead
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    {leadsLoading ? (
                      <div className="p-2">Loading leads...</div>
                    ) : leadsError ? (
                      <div className="p-2 text-sm text-red-600">{leadsError}</div>
                    ) : (
                      <select
                        value={leadId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLeadId(val === "" ? "" : Number(val));
                          setSelectedLeadName(e.target.selectedOptions?.[0]?.text || "");
                        }}
                        className="input input-bordered w-full"
                      >
                        <option value="">Select a lead</option>
                        {claimedLeads.map((l: any) => (
                          <option key={l.id} value={l.id}>
                            {l.name || l.client_name || l.event_name || `${l.first_name} ${l.last_name || ""}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <textarea
                  placeholder="Reason for reporting (required)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={4}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelection}
                      multiple
                      className=""
                    />
                    <div className="text-sm text-muted-foreground">Allowed: any file (server-side will validate)</div>
                  </div>

                  {uploading && <div className="text-sm">Uploading...</div>}

                  {uploadedDocs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {uploadedDocs.map((d) => (
                        <div key={d.id} className="p-2 border rounded flex items-center justify-between">
                          <div className="truncate">{d.file_name}</div>
                          <div className="flex items-center gap-2">
                            {d.file_url ? (
                              <a href={d.file_url} target="_blank" rel="noreferrer" className="underline text-sm">
                                view
                              </a>
                            ) : null}
                            <button onClick={() => removeUploadedDoc(d.id)} title="Remove" className="p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white" onClick={handleSubmitReport}>
                    Submit Report
                  </Button>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>

                {statusMessage && <div className="text-sm text-muted-foreground">{statusMessage}</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
