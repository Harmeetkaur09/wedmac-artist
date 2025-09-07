// src/pages/WedmacPlans.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown } from "lucide-react";
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

  // helper: safe formatter for currency / numbers
  const formatPrice = (p: any) => {
    if (p == null) return "—";
    const n = Number(typeof p === "string" ? p.replace(/[^\d.-]/g, "") : p);
    if (Number.isNaN(n)) return String(p);
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  };

  // normalize feature value into string
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
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`API error: ${resp.status} ${txt}`);
        }

        const data: ApiPlan[] = await resp.json();

        // map API data into UI-friendly shape and normalize features
        const uiPlans: UiPlan[] = (data || []).map((p) => {
          const priceLabel = formatPrice(p.price ?? p.plan_price ?? null);
          const months =
            typeof p.duration_days === "number" && !Number.isNaN(p.duration_days)
              ? Math.round(p.duration_days / 30)
              : null;
          const periodLabel = months ? `/${months} ${months === 1 ? "month" : "months"}` : "/—";

          // features might be array of strings or objects; normalize to strings
          const rawFeatures = Array.isArray(p.features) ? p.features : [];
          const features = rawFeatures.map(normalizeFeature).filter(Boolean);

          // credits prefer total_credit_points, then total_leads
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

        // optional: mark most expensive or most-featured as popular
        if (uiPlans.length > 0) {
          // simple heuristic: plan with most features = popular
          let best = uiPlans[0];
          for (const pl of uiPlans) {
            if ((pl.features?.length ?? 0) > (best.features?.length ?? 0)) best = pl;
          }
          const withFlag = uiPlans.map((pl) => ({ ...pl, popular: pl.id === best.id }));
          if (mounted) setPlans(withFlag);
        } else {
          if (mounted) setPlans(uiPlans);
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

  // build feature union (unique set) from plans
  const allFeatures = useMemo(() => {
    if (!plans) return [];
    const s = new Set<string>();
    for (const p of plans) {
      for (const f of p.features || []) s.add(f);
    }
    return Array.from(s);
  }, [plans]);

  // helper to render check or value
  const renderFeatureCell = (plan: UiPlan, feature: string) => {
    if (!plan || !feature) return "-";
    return plan.features.includes(feature) ? (
      <div className="flex items-center justify-center">
        <Check className="w-4 h-4 text-green-500" />
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  };

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
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{plan.credits ?? "—"} Credits</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
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

                      {plan.description && <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>}
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Dynamic Feature Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Feature Comparison
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="text-left py-3 px-4 border-r border-gray-300">Feature</th>
                        {plans?.map((p) => (
                          <th key={p.id} className="text-center py-3 px-4 border-r border-gray-300">
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
                      {/* Quick metadata rows: Credits and Duration */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r border-gray-300">Credits (leads)</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="text-center py-3 px-4 border-r border-gray-300">
                            {p.credits ?? "—"}
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r border-gray-300">Duration</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="text-center py-3 px-4 border-r border-gray-300">
                            {p.periodLabel}
                          </td>
                        ))}
                      </tr>

                      {/* Feature rows generated from union */}
                      {allFeatures.length === 0 ? (
                        <tr className="bg-white">
                          <td colSpan={plans ? plans.length + 1 : 1} className="py-3 px-4 text-center text-muted-foreground">
                            No features available
                          </td>
                        </tr>
                      ) : (
                        allFeatures.map((feat, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="py-3 px-4 font-medium border-r border-gray-300">{feat}</td>
                            {plans?.map((p) => (
                              <td key={p.id} className="text-center py-3 px-4 border-r border-gray-300">
                                {renderFeatureCell(p, feat)}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}

                      {/* Optionally show descriptions per plan at bottom */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r border-gray-300">Description</td>
                        {plans?.map((p) => (
                          <td key={p.id} className="py-3 px-4 border-r border-gray-300 text-sm text-muted-foreground">
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
