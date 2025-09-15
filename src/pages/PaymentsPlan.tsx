// src/pages/PaymentsPlan.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlanBadge } from "@/components/PlanBadge";
import { getMyProfile, MyProfile } from "@/api/profile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Calendar, Crown, QrCode, Smartphone } from "lucide-react";

/**
 * Allow referencing Razorpay injected global without TS errors.
 */
declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Plan {
  id: string;
  name: string;
  total_leads: number;
  price: string;
  duration_days: number;
  description: string;
  features: string[];
}

interface Payment {
  id: number;
  date: string;
  description: string;
  amount: string;
  status: string;
  invoice?: string;
  method?: string;
}

interface CurrentPlan {
  name?: string;
  price?: string;
  validUntil?: string;
  credits?: number;
}

/** API shapes */
interface PaymentApiItem {
  id: number;
  dates?: {
    created_at?: string;
    end_date?: string;
  };
  plan?: {
    name?: string;
    price?: number;
  };
  payment?: {
    status?: string;
  };
  usage?: {
    remaining_leads?: number;
  };
}

interface PurchaseInitResponse {
  key: string;
  amount: number;
  currency: string;
  plan?: string;
  razorpay_order_id: string;
  // other optional fields may exist
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function PaymentsPlan(): JSX.Element {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);

  const [loadingPayments, setLoadingPayments] = useState(true);
  const [errorPayments, setErrorPayments] = useState<string | null>(null);

  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);

  // queuing/purchase state
  const [pendingPurchase, setPendingPurchase] = useState<boolean>(false);
  const [isInitiating, setIsInitiating] = useState<boolean>(false);

  // find selected plan object (if any)
  const selectedPlanData = availablePlans.find((p) => p.id === selectedPlan);

  // is the API data visible/ready for the selected plan?
  const isApiDataVisible =
    !loading &&
    Boolean(selectedPlanData && Object.keys(selectedPlanData).length > 0);

    useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile();

        const plan = profile?.current_plan;
    if (plan) {
  const purchaseDate = profile.plan_purchase_date
    ? new Date(profile.plan_purchase_date).getTime()
    : null;

  const durationDays = plan.duration_days ?? 0;
  const extendedDays = profile.extended_days ?? 0;
  const totalDays = durationDays + extendedDays;

  const expiryTs =
    purchaseDate && totalDays
      ? purchaseDate + totalDays * 24 * 60 * 60 * 1000
      : null;

  console.log("🟢 purchase_date:", profile.plan_purchase_date);
  console.log("🟢 duration_days:", durationDays);
  console.log("🟢 extended_days:", extendedDays);
  console.log("🟢 expiry date:", expiryTs ? new Date(expiryTs) : null);

  setCurrentPlan({
    name: plan.name,
    price: plan.price ? `₹${plan.price}` : undefined,
    validUntil: expiryTs
      ? new Date(expiryTs).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined,
    credits: profile.available_leads ?? 0,
  });
}

      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);


useEffect(() => {
  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);

      const token = sessionStorage.getItem("accessToken") ?? "";
      const res = await fetch(
        "https://api.wedmacindia.com/api/artists/payments/history/",
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch payment history");
      const data = await res.json();

      const results = (data.results || []) as PaymentApiItem[];

      const transformed: Payment[] = results.map((item) => ({
        id: item.id,
        date: item.dates?.created_at ?? "",
        description: item.plan?.name ?? "N/A",
        amount: item.plan?.price ? `₹${item.plan.price}` : "-",
        status: item.payment?.status === "success" ? "Completed" : "Pending",
        method: "Razorpay",
      }));

      setPaymentHistory(transformed);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorPayments(err.message);
      else setErrorPayments(String(err));
    } finally {
      setLoadingPayments(false);
    }
  };

  fetchPayments();
}, []);



  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.wedmacindia.com/api/admin/master/list/?type=subscriptions_plan"
        );
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = (await res.json()) as Plan[];
        setAvailablePlans(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * initiatePurchase - wrapped in useCallback so it can be safely added to deps
   */
  const initiatePurchase = useCallback(
    async (planId: string) => {
      if (!planId) return;
      if (isInitiating) return;
      setIsInitiating(true);

      let rzpInstance: any = null;
      let rzpScript: HTMLScriptElement | null = null;

      try {
        const token = sessionStorage.getItem("accessToken") ?? "";

        const res = await fetch(
          `https://api.wedmacindia.com/api/artists/plans/${planId}/purchase/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const raw = await res.text().catch(() => "");
        let data: PurchaseInitResponse | Record<string, unknown> | null = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          data = raw ? { message: raw } : null;
        }

        if (!res.ok) {
          // safely extract backend error message if present
          const backendErr =
            data && typeof data === "object"
              ? (data as Record<string, unknown>).error ??
                (data as Record<string, unknown>).message
              : null;
          alert(
            `❌ ${String(
              backendErr ??
                "Payment initiation failed! Please wait for admin approval."
            )}`
          );
          return;
        }

        // load razorpay script
        rzpScript = document.createElement("script");
        rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
        rzpScript.async = true;
        document.body.appendChild(rzpScript);

        await new Promise<void>((resolve, reject) => {
          if (!rzpScript) return reject(new Error("Script missing"));
          rzpScript.onload = () => resolve();
          rzpScript.onerror = () =>
            reject(new Error("Failed to load Razorpay script"));
        });

        const payload = data as PurchaseInitResponse;

        const options = {
          key: payload!.key,
          amount: payload!.amount,
          currency: payload!.currency,
          name: "Wedmac India",
          description: payload!.plan,
          order_id: payload!.razorpay_order_id,
          handler: async (response: RazorpaySuccess) => {
            try {
              await fetch(
                "https://api.wedmacindia.com/api/artists/payment/verify/",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                }
              );
              // alert("Payment Successful!");
              window.location.reload();
            } catch (err) {
              console.error("Verification failed:", err);
              alert(
                "⚠️ Payment succeeded but verification failed. Contact support."
              );
            }
          },
          prefill: {
            name: "Your User Name",
            email: "user@example.com",
            contact: "9999999999",
          },
          theme: { color: "#E6447A" },
          modal: {
            ondismiss: () => {
              // called when user closes the popup (click cross)
              console.log("Razorpay checkout dismissed by user.");
              alert("Payment cancelled.");
            },
          },
        };

        // instantiate Razorpay using the injected global
        if (!window.Razorpay) {
          throw new Error("Razorpay script did not initialize correctly");
        }

        rzpInstance = new window.Razorpay(options);

        // attach failed handler safely
        if (typeof rzpInstance.on === "function") {
          rzpInstance.on("payment.failed", (resp: unknown) => {
            console.error("Payment failed:", resp);
            alert("Payment failed. Please try again.");
          });
        }

        rzpInstance.open();
      } catch (err: unknown) {
        console.error("Purchase/init error:", err);
        alert("❌ Payment initiation failed!");
      } finally {
        setIsInitiating(false);
        // optionally remove the script if desired to force fresh load next time:
        // if (rzpScript && rzpScript.parentNode) rzpScript.parentNode.removeChild(rzpScript);
      }
    },
    [isInitiating]
  );

  // handle click: either queue or start immediately
  const handlePurchasePlan = async () => {
    if (!selectedPlan) {
      alert("Please select a plan first.");
      return;
    }

    if (!isApiDataVisible) {
      setPendingPurchase(true);
      // small UX feedback — replace with your toast system if available
      alert(
        "Plan details are loading. We'll continue payment automatically when ready."
      );
      return;
    }

    await initiatePurchase(selectedPlan);
  };

  // watcher: if user queued purchase and API becomes visible, start it automatically
  useEffect(() => {
    if (pendingPurchase && isApiDataVisible && selectedPlan) {
      setPendingPurchase(false);
      setTimeout(() => {
        initiatePurchase(selectedPlan);
      }, 150);
    }
  }, [pendingPurchase, isApiDataVisible, selectedPlan, initiatePurchase]);

  // Map currentPlan.name into allowed PlanBadge values (fallback to 'Standard')
  const allowedPlanNames = ["Basic", "Standard", "Premium", "Pro"] as const;
  const planBadgeName = ((): (typeof allowedPlanNames)[number] => {
    const n = currentPlan?.name;
    if (
      typeof n === "string" &&
      (allowedPlanNames as readonly string[]).includes(n)
    ) {
      return n as (typeof allowedPlanNames)[number];
    }
    // fallback
    return "Standard";
  })();

  // QR dialog component (kept as inner component)
  const QRPaymentDialog = () => (
    <Dialog open={showQR} onOpenChange={setShowQR}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Scan QR code with any UPI app to pay
            </p>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            </div>
            <p className="font-semibold text-lg">
              Amount: {selectedPlanData?.price ?? "-"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4" />
              <span>Open any UPI app (GPay, PhonePe, Paytm, etc.)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <QrCode className="w-4 h-4" />
              <span>Scan the QR code above</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>Enter UPI PIN to complete payment</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQR(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowQR(false);
                alert("Payment completed successfully!");

              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Payment Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Layout title="Payments & Plan">
      <div className="space-y-6">
        {/* Current Plan Status */}
        <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <PlanBadge plan={planBadgeName} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold text-primary">
                    {currentPlan.price}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {currentPlan.validUntil}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Remaining Credits
                  </p>
                  <p className="text-2xl font-bold">{currentPlan.credits}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active subscription found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Purchase Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading plans...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Plan</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a plan to purchase" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ₹{plan.price} ({plan.total_leads} leads)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handlePurchasePlan}
              disabled={!selectedPlan}
              aria-disabled={!selectedPlan}
              className={`w-full flex items-center justify-center gap-2
                ${
                  !isApiDataVisible && !pendingPurchase
                    ? "opacity-90 bg-gray-100 text-gray-600"
                    : "bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
                }
              `}
            >
              <QrCode className="w-4 h-4" />
              {!selectedPlan
                ? "Select Plan"
                : pendingPurchase && !isApiDataVisible
                ? "Waiting..."
                : !isApiDataVisible
                ? "Proceed"
                : isInitiating
                ? "Opening..."
                : "Pay"}
            </Button>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <p className="text-center text-gray-500">
                ⏳ Loading payments...
              </p>
            ) : errorPayments ? (
              <p className="text-center text-red-500">{errorPayments}</p>
            ) : paymentHistory.length === 0 ? (
              <p className="text-center text-gray-500">
                No payment history found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.date
                          ? new Date(payment.date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {payment.amount}
                        </span>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
  {payment.status === "Pending" ? "Failed" : payment.status}
</Badge>

                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions — placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" />
      </div>

      <QRPaymentDialog />
    </Layout>
  );
}
