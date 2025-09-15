// src/pages/WedmacPlans.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanBadge } from "@/components/PlanBadge";

type ApiPlan = {
  id: string | number;
  name?: string;
  total_leads?: number | null;
  total_credit_points?: number | null;
  price?: string | number | null;
  duration_days?: number | null;
  description?: string | null;
  features?: Array<string | { label?: string; name?: string; [k: string]: any }> | null;
  created_at?: string | null;
  slug?: string | null;
  [k: string]: any;
};

type UiPlan = {
  id: string;
  name: string;
  priceLabel: string;
  periodLabel: string;
  credits: number | null;
  features: string[]; // normalized string array
  popular?: boolean;
  description?: string | null;
  createdAt?: string | null;
  raw?: ApiPlan;
};

export default function WedmacPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<UiPlan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (p: any) => {
    if (p == null) return "—";
    const n = Number(typeof p === "string" ? p.replace(/[^\d.-]/g, "") : p);
    if (Number.isNaN(n)) return String(p);
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  };

  const normalizeFeature = (f: any) => {
    if (f == null) return "";
    if (typeof f === "string") return f.trim();
    if (typeof f === "object") {
      if (typeof f.label === "string") return f.label.trim();
      if (typeof f.name === "string") return f.name.trim();
      try {
        return JSON.stringify(f);
      } catch {
        return String(f);
      }
    }
    return String(f);
  };

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          "https://api.wedmacindia.com/api/admin/master/list/?type=subscriptions_plan",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`API error: ${resp.status} ${txt}`);
        }

        const data: ApiPlan[] = await resp.json();

   const uiPlans: UiPlan[] = (data || []).map((p) => {
  const priceLabel = formatPrice(p.price ?? p.plan_price ?? null);
  const months =
    typeof p.duration_days === "number" && !Number.isNaN(p.duration_days)
      ? Math.round(p.duration_days / 30)
      : null;
  const periodLabel = months ? `${months} ${months === 1 ? "month" : "months"}` : "—";
  const rawFeatures = Array.isArray(p.features) ? p.features : [];
  const features = rawFeatures.map(normalizeFeature).filter(Boolean);
  const credits = p.total_credit_points ?? p.total_leads ?? null;

  return {
    id: String(p.id),
    name: p.name ?? String(p.id),
    priceLabel,
    periodLabel,
    credits: typeof credits === "number" ? credits : (credits == null ? null : Number(credits)),
    features,
    popular: false,
    description: p.description ?? null,
    createdAt: p.created_at ?? null,
    raw: p,
  };
});

// ✅ sort high → low by price
const sortedPlans = [...uiPlans].sort((a, b) => {
  const priceA = Number(
    typeof a.raw?.price === "string"
      ? a.raw.price.replace(/[^\d.-]/g, "")
      : a.raw?.price ?? 0
  );
  const priceB = Number(
    typeof b.raw?.price === "string"
      ? b.raw.price.replace(/[^\d.-]/g, "")
      : b.raw?.price ?? 0
  );
  return priceB - priceA; // high to low
});

// ✅ popular flag
if (sortedPlans.length > 0) {
  let best = sortedPlans[0];
  for (const pl of sortedPlans) {
    if ((pl.features?.length ?? 0) > (best.features?.length ?? 0)) best = pl;
  }
  const withFlag = sortedPlans.map((pl) => ({
    ...pl,
    popular: pl.id === best.id,
  }));
  if (mounted) setPlans(withFlag);
} else {
  if (mounted) setPlans(sortedPlans);
}

      } catch (err: any) {
        console.error("Fetch plans error:", err);
        if (mounted) setError(err?.message || "Failed to load plans");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlans();

    return () => {
      mounted = false;
    };
  }, []);

  const onPurchase = (plan: UiPlan) => {
    navigate("/payments", {
      state: {
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.priceLabel,
      },
    });
  };

  // Feature union & sorting (same as before)
  const allFeatures = useMemo(() => {
    if (!plans) return [];
    const s = new Set<string>();
    for (const p of plans) {
      for (const f of p.features || []) s.add(f);
    }
    const arr = Array.from(s);
    arr.sort((a, b) => {
      const score = (str: string) => {
        const s = str.toLowerCase();
        if (s.includes("verified lead") || s.includes("leads")) return -100;
        if (s.includes("valid") || s.includes("month")) return -90;
        if (s.includes("city")) return -80;
        if (s.includes("budget")) return -70;
        if (s.includes("story") || s.includes("post") || s.includes("reel")) return -60;
        if (s.includes("relationship") || s.includes("manager")) return -50;
        if (s.includes("profile") || s.includes("recommend")) return -40;
        if (s.includes("email support") || s.includes("support")) return -30;
        return 0;
      };
      const sa = score(a), sb = score(b);
      if (sa !== sb) return sa - sb;
      return a.localeCompare(b);
    });
    return arr;
  }, [plans]);

  // group features
  const groupedFeatures = useMemo(() => {
    const groups: { [k: string]: string[] } = {
      Core: [],
      Coverage: [],
      Marketing: [],
      Policies: [],
      Support: [],
      Extras: [],
      Other: [],
    };

    const rules: [string[], string][] = [
      [["verified lead", "leads", "credit"], "Core"],
      [["valid", "month", "validity", "duration"], "Core"],
      [["city access", "city"], "Coverage"],
      [["budget"], "Core"],
      [["story", "post", "reel", "webinar"], "Marketing"],
      [["profile", "recommend", "pin best", "top list", "popular tag"], "Marketing"],
      [["relationship manager", "manager"], "Support"],
      [["email support", "support", "follow up", "management"], "Support"],
      [["reversal", "extension", "policy"], "Policies"],
      [["guidance", "webinar", "expert"], "Extras"],
    ];

    for (const f of allFeatures) {
      const fl = f.toLowerCase();
      let placed = false;
      for (const [keys, group] of rules) {
        for (const k of keys) {
          if (fl.includes(k)) {
            groups[group].push(f);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) groups.Other.push(f);
    }

    const ordered: { group: string; features: string[] }[] = [];
    // const order = ["Core", "Coverage", "Marketing", "Policies", "Support", "Extras", "Other"];
    // for (const g of order) {
    //   if (groups[g] && groups[g].length > 0) {
    //     ordered.push({ group: g, features: groups[g] });
    //   }
    // }
    return ordered;
  }, [allFeatures]);

  const renderFeatureCell = (plan: UiPlan, feature: string) => {
    if (!plan || !feature) return "—";
    const has = plan.features.some((f) => f === feature);
    return has ? (
      <div className="flex items-center justify-center">
        <Check className="w-4 h-4 text-green-600" />
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  };

  // ---------- NEW: helpers to extract plan-specific attribute strings ----------
  const findFeatureByKeywords = (plan: UiPlan | null, keywords: string[]) => {
    if (!plan) return null;
    const low = plan.features.map((f) => (f || "").toLowerCase());
    for (const k of keywords) {
      for (const f of low) {
        if (f.includes(k)) return f; // return first matching feature string (lowercased)
      }
    }
    return null;
  };

  const extractCity = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["city access", "city"]);

  const extractBudget = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["budget", "leads budget", "higher leads budget", "higer leads budget", "max budget", "below"]);

  const extractSocial = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["story", "post", "reel", "social", "webinar"]);

  const extractCoverage = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["unlimited city", "city access", "city"]);

  const extractSupport = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["relationship manager", "manager", "email support", "support", "follow up", "management"]);

  const extractExtras = (plan: UiPlan | null) =>
    findFeatureByKeywords(plan, ["profile", "pin best", "recommend", "follow up", "inbound", "pin best review", "dedicated", "profile management", "guidance"]);

  // Which index is the 4th plan? JS index: 3
  const highlightIndex = 3;

  return (
    <Layout title="Wedmac Plans">
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="p-6 text-center">Loading plans…</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-600">{error}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans &&
                plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? "ring-2 ring-primary shadow-lg" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-2">
                        <PlanBadge plan={plan.name} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">{plan.priceLabel}</div>
                        <div className="text-muted-foreground">{plan.periodLabel}</div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{plan.credits ?? "—"} Leads</span>
                      </div>
                      {plan.description && <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-2 h-full pr-2">
                        {plan.features.length > 0 ? (
                          plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">No features listed</li>
                        )}
                      </ul>

                      <Button
                        className="w-full bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white hover:shadow-lg"
                        onClick={() => onPurchase(plan)}
                      >
                        Purchase plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Feature Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Feature Comparison
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="mb-3 text-sm text-muted-foreground">
                  <strong>Legend:</strong>{" "}
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-600" /> Available
                  </span>{" "}
                  — Not included
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="text-left py-3 px-4 border-r">Feature</th>
                        {plans?.map((p) => (
                          <th key={p.id} className="text-center py-3 px-4 border-r">
                            <div className="flex flex-col items-center">
                              <div className="font-semibold">{p.name}</div>
                              <div className="text-xs text-muted-foreground">{p.priceLabel}</div>
                              <div className="text-xs text-muted-foreground">{p.periodLabel}</div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* ---------- NEW: Sample Lead rows (City, Budget, Social Media, Coverage, Support, Extras) ---------- */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Sample Lead (City)</td>
                        {plans?.map((p, i) => (
                          <td
                            key={p.id}
                            className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}
                          >
                            {extractCity(p) ? extractCity(p) : "—"}
                            {i === highlightIndex && <div className="text-xs text-muted-foreground mt-1">← 4th plan</div>}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Sample Lead (Budget)</td>
                        {plans?.map((p, i) => (
                          <td key={p.id} className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}>
                            {extractBudget(p) ? extractBudget(p) : "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Social Media (story/post/reel)</td>
                        {plans?.map((p, i) => (
                          <td key={p.id} className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}>
                            {extractSocial(p) ? extractSocial(p) : "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Coverage</td>
                        {plans?.map((p, i) => (
                          <td key={p.id} className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}>
                            {extractCoverage(p) ? extractCoverage(p) : "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Support</td>
                        {plans?.map((p, i) => (
                          <td key={p.id} className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}>
                            {extractSupport(p) ? extractSupport(p) : "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Extras</td>
                        {plans?.map((p, i) => (
                          <td key={p.id} className={`text-center py-3 px-4 border-r ${i === highlightIndex ? "bg-yellow-50" : ""}`}>
                            {extractExtras(p) ? extractExtras(p) : "—"}
                          </td>
                        ))}
                      </tr>

                      {/* ---------- Quick metadata: Credits / Duration / Price (kept below sample) ---------- */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Leads (credits)</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="text-center py-3 px-4 border-r">
                            {p.credits ?? "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Duration</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="text-center py-3 px-4 border-r">
                            {p.periodLabel}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Price</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="text-center py-3 px-4 border-r">
                            {p.priceLabel}
                          </td>
                        ))}
                      </tr>

                      {/* grouped features (as before) */}
                      {groupedFeatures.map((grp) => (
                        <React.Fragment key={grp.group}>
                          <tr className="bg-gray-50">
                            <td colSpan={plans ? plans.length + 1 : 1} className="py-2 px-4 text-sm font-semibold border-t">
                              {grp.group}
                            </td>
                          </tr>

                          {grp.features.map((feat) => (
                            <tr key={feat} className="bg-white">
                              <td className="py-3 px-4 border-r">{feat}</td>
                              {plans?.map((p) => (
                                <td key={p.id} className="text-center py-3 px-4 border-r">
                                  {renderFeatureCell(p, feat)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}

                      {/* Descriptions row */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r">Description</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="py-3 px-4 border-r text-sm text-muted-foreground">
                            {p.description ?? "—"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
