"use client";

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
  Search,
  ArrowLeftCircle,
  ArrowRightCircle,
  Download,
  Clock,
  FileText,
} from "lucide-react";

/** ---------- helper: auth header (same pattern as your file) ---------- */
const getAuthHeader = () => {
  try {
    const token =
      typeof window !== "undefined" &&
      (localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        "");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

type LogItem = {
  id: number;
  activity_type: string;
  timestamp: string;
  leads_before?: number;
  leads_after?: number;
  details?: Record<string, any>;
  artist_name?: string;
  artist_phone?: string;
  // fallback keys
  plan_name?: string;
  created_at?: string;
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filters & pagination
  const [activityType, setActivityType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // modal for JSON/details view
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchLogs();
    // cancel on unmount or when deps change
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityType, startDate, endDate, page, pageSize]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (activityType) params.append("activity_type", activityType);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (page) params.append("page", String(page));
    if (pageSize) params.append("page_size", String(pageSize));
    return params.toString() ? `?${params.toString()}` : "";
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const query = buildQuery();
      const resp = await fetch(`https://api.wedmacindia.com/api/artists/activity-logs/${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        signal: controller.signal,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`${resp.status} ${text}`);
      }

      const data = await resp.json();

      // Attempt flexible extraction:
      // prefer data.logs, else data.results or data.data or data
      const items: LogItem[] =
        Array.isArray(data.logs) ? data.logs :
        Array.isArray(data.results) ? data.results :
        Array.isArray(data.data) ? data.data :
        Array.isArray(data) ? data :
        [];

      setLogs(items);

      // pagination helpers (if available)
      if (typeof data.total === "number") setTotalCount(data.total);
      else if (typeof data.count === "number") setTotalCount(data.count);
      else if (typeof data.total_count === "number") setTotalCount(data.total_count);
      else setTotalCount((prev) => prev ?? null); // leave as-is/null

    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("ActivityLogs fetch error:", err);
      setError(err?.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso.slice ? iso.slice(0, 19).replace("T", " ") : iso;
    }
  };

  const badgeForType = (t?: string) => {
    const s = (t || "").toLowerCase();
    if (s.includes("purchase")) return <Badge className="bg-blue-100 text-blue-800">Purchase</Badge>;
    if (s.includes("claim")) return <Badge className="bg-purple-100 text-purple-800">Claim</Badge>;
    if (s.includes("expiry")) return <Badge className="bg-yellow-100 text-yellow-800">Expiry</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">{t || "Unknown"}</Badge>;
  };

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : (logs.length ? page + 1 : 1);

  const onClearFilters = () => {
    setActivityType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const exportCsv = () => {
    if (!logs || logs.length === 0) return;
    const header = ["id", "activity_type", "timestamp", "artist_name", "artist_phone", "leads_before", "leads_after", "details"];
    const rows = logs.map((l) => [
      l.id ?? "",
      l.activity_type ?? "",
      l.timestamp ?? l.created_at ?? "",
      l.artist_name ?? "",
      l.artist_phone ?? "",
      l.leads_before ?? "",
      l.leads_after ?? "",
      JSON.stringify(l.details ?? { plan_name: l.plan_name ?? null })
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Artist Activity Logs">
      <div className="space-y-6">
        {/* Header + Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm">Activity type</label>
                <select
                  className="input input-bordered w-full"
                  value={activityType}
                  onChange={(e) => { setActivityType(e.target.value); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="purchase">Purchase</option>
                  <option value="claim">Claim</option>
                  <option value="expiry">Expiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm">Start date</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                />
              </div>

              <div>
                <label className="block text-sm">End date</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                />
              </div>

              <div className="flex items-end gap-4">
                <Button onClick={() => { setPage(1); fetchLogs(); }}>
                  <Search className="w-4 h-4 mr-2" /> Filter
                </Button>
                <Button variant="secondary" onClick={onClearFilters}>Clear</Button>
                {/* <Button variant="ghost" onClick={exportCsv} title="Export CSV">
                  <Download className="w-4 h-4" />
                </Button> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>Logs</span>
                <span className="text-sm text-muted-foreground"> {loading ? "(loading...)" : logs.length ? `(${logs.length}${totalCount ? ` of ${totalCount}` : ""})` : ""}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm">Per page:</div>
                <select
                  className="input input-bordered"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Leads (before → after)</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No logs found.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{formatDate(l.timestamp || l.created_at)}</TableCell>
                      <TableCell>{badgeForType(l.activity_type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{l.artist_name || "-"}</div>
                        <div className="text-sm text-muted-foreground">{l.artist_phone || "-"}</div>
                      </TableCell>
                      <TableCell>{(l.leads_before ?? "-") + " → " + (l.leads_after ?? "-")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedDetails(l.details ?? { plan_name: l.plan_name })}>
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} {totalCount ? `of ${Math.ceil(totalCount / pageSize)}` : ""}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ArrowLeftCircle className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={totalCount ? page >= Math.ceil(totalCount / pageSize) : logs.length < pageSize}
                >
                  <ArrowRightCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Modal (simple) */}
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedDetails(null)} />
            <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Details</h3>
                <Button variant="ghost" onClick={() => setSelectedDetails(null)}>Close</Button>
              </div>
              <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded">
                {JSON.stringify(selectedDetails, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
