import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlanBadge } from "@/components/PlanBadge";
import { Crown, Check, Zap, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WedmacPlans() {
    const navigate = useNavigate();
  
  const plans = [
    {
      name: "Basic" as const,
      price: "₹999",
      period: "/month",
      credits: 10,
      features: [
        "10 Lead Credits per month",
        "Basic profile listing",
        "Email support",
        "Mobile app access",
      ],
      popular: false,
    },
    {
      name: "Standard" as const,
      price: "₹1,999",
      period: "/month",
      credits: 25,
      features: [
        "25 Lead Credits per month",
        "Priority profile listing",
        "Phone & Email support",
        "Advanced analytics",
        "Custom portfolio gallery",
      ],
      popular: false,
    },
    {
      name: "Premium" as const,
      price: "₹3,999",
      period: "/month",
      credits: 60,
      features: [
        "60 Lead Credits per month",
        "Top profile ranking",
        "24/7 Priority support",
        "Advanced lead filters",
        "Custom branding",
        "Marketing tools",
      ],
      popular: false,
    },
    {
      name: "Pro" as const,
      price: "₹6,999",
      period: "/month",
      credits: 120,
      features: [
        "120 Lead Credits per month",
        "VIP profile status",
        "Dedicated account manager",
        "Custom lead matching",
        "White-label solutions",
        "API access",
        "Exclusive events",
      ],
      popular: false,
    },
  ];

  return (
    <Layout title="Wedmac Plans">
      <div className="space-y-6">
        {/* Current Plan Status */}
        {/* <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Current Plan: Premium
                  </h3>
                  <p className="text-muted-foreground">
                    Valid until March 15, 2024
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">30</div>
                <p className="text-sm text-muted-foreground">
                  Credits remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "ring-2 ring-primary shadow-lg" : ""
              }`}
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
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-muted-foreground">{plan.period}</div>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{plan.credits} Credits</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

<Button
  className={`w-full ${
    plan.name === "Premium"
      ? "bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white hover:shadow-lg"
      : "bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white hover:shadow-lg"
  }`}
  onClick={() => navigate("/payments")}
>
  {plan.name === "Premium" ? "Purchase plan" : "Purchase plan"}
</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Feature Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Features</th>
                    <th className="text-center py-2">Basic</th>
                    <th className="text-center py-2">Standard</th>
                    <th className="text-center py-2">Premium</th>
                    <th className="text-center py-2">Pro</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b">
                    <td className="py-2">Monthly Credits</td>
                    <td className="text-center">10</td>
                    <td className="text-center">25</td>
                    <td className="text-center">60</td>
                    <td className="text-center">120</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Profile Priority</td>
                    <td className="text-center">Basic</td>
                    <td className="text-center">High</td>
                    <td className="text-center">Top</td>
                    <td className="text-center">VIP</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Support</td>
                    <td className="text-center">Email</td>
                    <td className="text-center">Phone + Email</td>
                    <td className="text-center">24/7 Priority</td>
                    <td className="text-center">Dedicated Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
