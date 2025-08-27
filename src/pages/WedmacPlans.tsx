import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PlanBadge } from "@/components/PlanBadge";

type ApiPlan = {
  id: string;
  name: string;
  total_leads: number | null;
  total_credit_points: number | null;
  price: string | number | null;
  duration_days: number | null;
  description?: string | null;
  features?: string[] | null;
  created_at?: string | null;
};

type UiPlan = {
  id: string;
  name: string;
  priceLabel: string;
  periodLabel: string;
  credits: number | null;
  features: string[];
  popular?: boolean;
  description?: string | null;
  createdAt?: string | null;
};

export default function WedmacPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<UiPlan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          "https://wedmac-be.onrender.com/api/admin/master/list/?type=subscriptions_plan",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // If endpoint requires auth, add your auth header here:
              // ...getAuthHeader(),
            },
          }
        );

        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`API error: ${resp.status} ${txt}`);
        }

        const data: ApiPlan[] = await resp.json();

        // map API data into UI-friendly shape
        const uiPlans: UiPlan[] = (data || []).map((p) => {
          const priceNumber =
            p.price == null ? null : Number(typeof p.price === "string" ? p.price : p.price);
          const priceLabel =
            priceNumber == null || Number.isNaN(priceNumber)
              ? "—"
              : priceNumber.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                });

          // convert days to months (rounded)
          const months =
            typeof p.duration_days === "number" && !Number.isNaN(p.duration_days)
              ? Math.round(p.duration_days / 30)
              : null;
          const periodLabel = months ? `/${months} ${months === 1 ? "month" : "months"}` : "/—";

          return {
            id: p.id,
            name: p.name,
            priceLabel,
            periodLabel,
            credits: p.total_credit_points ?? p.total_leads ?? null,
            features: p.features ?? [],
            popular: false, // you can set logic here to mark a plan 'popular'
            description: p.description ?? null,
            createdAt: p.created_at ?? null,
          };
        });

        if (mounted) {
          setPlans(uiPlans);
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
    // navigate to payments and pass plan id and minimal metadata
    navigate("/payments", {
      state: {
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.priceLabel,
      },
    });
  };

  return (
    <Layout title="Wedmac Plans">
      <div className="space-y-6">
        {/*
          You can show current plan status here if you need.
        */}

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
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-muted-foreground">No features listed</li>
                        )}
                      </ul>

                      <Button
                        className={`w-full bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white hover:shadow-lg`}
                        onClick={() => onPurchase(plan)}
                      >
                        Purchase plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Feature Comparison (keeps the earlier static table — you can optionally generate it from API too) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Feature Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* You can generate this table dynamically from plans if preferred.
                    For now I left your original static table markup so the UI remains similar. */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="text-left py-3 px-4 border-r border-gray-300">Features</th>
                        <th className="text-center py-3 px-4 border-r border-gray-300">Basic</th>
                        <th className="text-center py-3 px-4 border-r border-gray-300">Standard</th>
                        <th className="text-center py-3 px-4 border-r border-gray-300">Premium</th>
                        <th className="text-center py-3 px-4">Pro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* keep your existing rows here — or map from `plans` */}
                      <tr className="bg-white">
                        <td className="py-3 px-4 font-medium border-r border-gray-300">Validity Period</td>
                        <td className="text-center py-3 px-4 border-r border-gray-300">2 Months</td>
                        <td className="text-center py-3 px-4 border-r border-gray-300">3 Months</td>
                        <td className="text-center py-3 px-4 border-r border-gray-300">3 Months</td>
                        <td className="text-center py-3 px-4">6 Months</td>
                      </tr>
                      {/* ... rest of your static rows */}
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
