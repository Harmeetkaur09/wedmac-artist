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
    price: "₹6,999",
    period: "/2 months",
    credits: 30, // Verified Leads count in PDF
    features: [
      "For MUA with 1 or 1.5 years of experience with normal portfolio",
      "Access in 2 cities",
      "Leads with budget below ₹15,000",
      "Leads reversal and extension available",
      "Email support",
      "2 Story features on profile",
    ],
    popular: false,
  },
  {
    name: "Standard" as const,
    price: "₹12,999",
    period: "/3 months",
    credits: 70,
    features: [
      "For MUA with 3 to 5 years of experience with average portfolio",
      "Access in 5 cities",
      "Leads with budget below ₹40,000",
      "Leads reversal and extension available",
      "Email support with guidance for your social media",
      "2 Story & Post features on profile",
      "1 webinar with expert",
      "Dedicated relationship manager",
    ],
    popular: false,
  },
  {
    name: "Premium" as const,
    price: "₹18,999",
    period: "/3 months",
    credits: 70,
    features: [
      "For confident MUA looking for bookings across India with higher budget clients",
      "Access in 5 cities",
      "Leads with higher budget",
      "Leads reversal and extension available",
      "Email support and guidance for your social media",
      "2 Story & Post features on profile",
      "1 webinar with expert",
      "Relationship manager assigned",
    ],
    popular: true,
  },
  {
    name: "Pro" as const,
    price: "₹32,999",
    period: "/6 months",
    credits: 150,
    features: [
      "For professional MUA seeking best returns on seasonal bookings",
      "Unlimited city access across India",
      "Higher leads budget",
      "Leads reversal and extension policies",
      "5 Story, Post & 6 Reel features on profile",
      "Special guidance for your profile",
      "Inbound leads: 25 (1 lead per artist)",
      "Dedicated relationship manager and profile recommendations",
      "Wedmac follow-up assistance",
      "Lead details via Google Sheets",
      "Pin best review to top of your profile",
      "Dedicated profile & management support",
      "Email support",
      "Your profile featured in top list",
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
      {[
        ["Validity Period", "2 Months", "3 Months", "3 Months", "6 Months"],
        ["Verified Leads", "30", "70", "70", "150"],
        ["City Access", "2 Cities", "5 Cities", "5 Cities", "Unlimited"],
        ["Leads Budget Range", "Below ₹15k", "Below ₹40k", "Higher Budget", "Higher Budget"],
        ["Leads Reversal", "Yes", "Yes", "Yes", "Policy Applies"],
        ["Leads Extension", "Yes", "Yes", "Yes", "Policy Applies"],
        ["Support", "Email", "Email + Social Media Guidance", "Email + Social Media + Relationship Manager", "Email + Dedicated Manager & Profile Support"],
        ["Story/Post Features", "2 Stories", "2 Stories & Post", "2 Stories & Post", "5 Stories, Posts & 6 Reels"],
        ["Webinars", "-", "1 Webinar with Expert", "1 Webinar with Expert", "Special Profile Guidance"],
        [
          "Additional Benefits", 
          "-",
          "Relationship Manager",
          "Relationship Manager",
          <ul className="list-disc list-inside text-left text-xs space-y-0.5">
            <li>Inbound Leads: 25 (1 Lead / Artist)</li>
            <li>Wedmac Follow-up Assistance</li>
            <li>Lead Details on Google Sheets</li>
            <li>Pin Best Review to Top of Profile</li>
            <li>Profile Recommendations & Partner</li>
            <li>Your Profile Featured in Top List</li>
          </ul>
        ],
      ].map(([feature, basic, standard, premium, pro], i) => (
        <tr
          key={feature.toString()}
          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <td className="py-3 px-4 font-medium border-r border-gray-300">{feature}</td>
          <td className="text-center py-3 px-4 border-r border-gray-300 align-top">{basic}</td>
          <td className="text-center py-3 px-4 border-r border-gray-300 align-top">{standard}</td>
          <td className="text-center py-3 px-4 border-r border-gray-300 align-top">{premium}</td>
          <td className="text-center py-3 px-4 align-top">{pro}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
