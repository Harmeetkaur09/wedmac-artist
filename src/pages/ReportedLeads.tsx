import React, { useEffect, useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  Trash2,
} from "lucide-react";

type UploadedDoc = {
  id: number;
  file_name: string;
  file_url?: string;
  file_type?: string;
  tag?: string;
};

const getAuthHeader = () => {
  try {
    const token =
      typeof window !== "undefined" &&
      (sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token") ||
        "");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const normalize = (s?: any) => (s ? String(s).toLowerCase() : "");

export default function ReportedLeads() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // NEW
  const [reportedLeads, setReportedLeads] = useState<any[]>([]);
  const [falseClaims, setFalseClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  const [claimedLeads, setClaimedLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);

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

  // Fetch false-claims (reports)
  useEffect(() => {
    const fetchFalseClaims = async () => {
      setClaimsLoading(true);
      setClaimsError(null);
      try {
        const resp = await fetch(
          "https://api.wedmacindia.com/api/leads/false-claims/my/",
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          }
        );
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`${resp.status} ${text}`);
        }
        const data = await resp.json();
        console.log("False Claims API Response:", data);
        const items = Array.isArray(data)
          ? data
          : // flexible extraction: check common keys
            data.results || data.data || data.false_claims || [];
        setFalseClaims(items);
      } catch (err: any) {
        console.error(err);
        setClaimsError(err?.message || "Failed to load false claims");
      } finally {
        setClaimsLoading(false);
      }
    };
    fetchFalseClaims();
  }, []);

  // Fetch claimed leads for dropdown
  useEffect(() => {
    const fetchLeads = async () => {
      setLeadsLoading(true);
      setLeadsError(null);
      try {
        const resp = await fetch(
          "https://api.wedmacindia.com/api/leads/artist/my-claimed-leads/",
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          }
        );
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`${resp.status} ${text}`);
        }
        const data = await resp.json();
        console.log("Claimed Leads API Response:", data);
        // <-- FIX: include `leads` key from your API response
        const items = Array.isArray(data)
          ? data
          : data.leads || data.results || data.data || [];
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
    if (normalize(status).includes("review"))
      return <Clock className="w-4 h-4 text-yellow-500" />;
    if (normalize(status).includes("action") || normalize(status).includes("resolved"))
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    if (normalize(status).includes("review")) return "bg-yellow-100 text-yellow-800";
    if (normalize(status).includes("action") || normalize(status).includes("resolved"))
      return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  // file upload handler (unchanged)
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...arr]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // SUBMIT: send multipart/form-data with files appended as 'proof_documents'
  const handleSubmitReport = async () => {
    try {
      setStatusMessage(null);
      if (leadId === "" || !reason.trim()) {
        setStatusMessage("Please provide a lead and a reason.");
        return;
      }
      if (selectedFiles.length === 0) {
        setStatusMessage("Please attach at least one proof document.");
        return;
      }

      setUploading(true);
      setStatusMessage("Submitting report...");

      const formData = new FormData();
      formData.append("lead", String(leadId));
      formData.append("reason", reason.trim());
      // Append each file with the same field name the backend expects
      selectedFiles.forEach((file) => {
        formData.append("proof_documents", file); // <--- matches curl: -F "proof_documents=@file"
      });

      // build headers but DO NOT set Content-Type
      const headers = {
        ...getAuthHeader(),
        // don't set "Content-Type": browser will add the correct multipart boundary
      };

      const resp = await fetch("https://api.wedmacindia.com/api/leads/false-claims/", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Submit failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      setStatusMessage("Report submitted successfully.");
      // optionally prepend new item to falseClaims (best-effort)
      setFalseClaims((prev) => [{ id: data.id ?? Date.now(), reason: reason.trim(), status: data.status ?? "Under Review", lead: leadId, created_at: data.created_at ?? new Date().toISOString() }, ...prev]);

      // reset
      setLeadId("");
      setReason("");
      setSelectedFiles([]);
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err?.message || "Failed to submit report");
    } finally {
      setUploading(false);
    }
  };

  // stats from falseClaims (or fallback reportedLeads)
  const dataSource = falseClaims && falseClaims.length > 0 ? falseClaims : reportedLeads;
  const totalReports = dataSource.length;
  const underReviewCount = dataSource.filter((it) => normalize(it.status).includes("review")).length;
  const resolvedCount = dataSource.filter((it) => normalize(it.status).includes("resolved")).length;

  return (
    <Layout title="Reported Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><Flag className="w-5 h-5 text-red-600" /></div>
              <div>
                <div className="text-2xl font-bold">{claimsLoading ? "..." : totalReports}</div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <div className="text-2xl font-bold">{claimsLoading ? "..." : underReviewCount}</div>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <div className="text-2xl font-bold">{claimsLoading ? "..." : resolvedCount}</div>
                <p className="text-sm text-muted-foreground">Resolved / Action Taken</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report New Lead Form */}
        <Card>
          <CardHeader>
            <CardTitle>Report a Lead</CardTitle>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white" onClick={() => setShowForm(true)}>
                <Flag className="w-4 h-4 mr-2" /> Report New Lead
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
                            {`${(l.first_name || "")} ${(l.last_name || "")}`.trim() || `Lead #${l.id}`} {l.phone ? `(${l.phone})` : ""}
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
                  className="textarea textarea-bordered p-4 w-full"
                  rows={4}
                />

                <div className="space-y-2">
                 <div className="flex items-center gap-2">
      <input ref={fileInputRef} type="file" onChange={handleFileSelection} multiple />
      <div className="text-sm text-muted-foreground">Allowed: any file (server-side will validate)</div>
    </div>

                  {uploading && <div className="text-sm">Uploading...</div>}

                {selectedFiles.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {selectedFiles.map((f, i) => (
          <div key={i} className="p-2 border rounded flex items-center justify-between">
            <div className="truncate">{f.name}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => removeSelectedFile(i)} title="Remove" className="p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
          </div>
    )}
                </div>

                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white" onClick={handleSubmitReport}>Submit Report</Button>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>

                {statusMessage && <div className="text-sm text-muted-foreground">{statusMessage}</div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reported Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-primary" /> Reported Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Details</TableHead>
                  <TableHead>Report Reason</TableHead>
                  <TableHead>Proof Document</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4}><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell>
                  </TableRow>
                ) : claimsError ? (
                  <TableRow><TableCell colSpan={4} className="text-red-600">{claimsError}</TableCell></TableRow>
                ) : falseClaims.length === 0 ? (
                  <TableRow><TableCell colSpan={4}>No reports found.</TableCell></TableRow>
                ) : (
                  falseClaims.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1 flex">
                          <div className="font-medium">
                            {
                              `${item.lead_first_name || ""} ${item.lead_last_name || ""}`.trim() ||
                           
                              "N/A"
                            }
                            <div className="text-sm text-muted-foreground">{item.lead_email || ""}</div>

                          <div className="text-sm text-muted-foreground">{item.lead_phone || ""}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          {item.reason || item.reportReason}
                        </Badge>
                      </TableCell>
<TableCell>
  {item.proof_documents?.length > 0 ? (
    <img
      src={item.proof_documents[0].file_url}
      alt={item.proof_documents[0].file_name || "Proof Document"}
      className="h-16 w-16 object-cover rounded"
    />
  ) : (
    "N/A"
  )}
</TableCell>

                      <TableCell>{(item.created_at || item.reportDate || "").slice(0, 10)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status || "Under Review")}
                          <Badge className={getStatusColor(item.status )}>{item.status}</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
