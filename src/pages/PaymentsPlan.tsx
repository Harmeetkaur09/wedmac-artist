
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanBadge } from "@/components/PlanBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Download, Calendar, AlertCircle, Crown, Receipt, QrCode, Smartphone } from "lucide-react";
interface Plan {
  id: string;
  name: string;
  total_leads: number;
  price: string;
  duration_days: number;
  description: string;
  features: string[];
}
export default function PaymentsPlan() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
    const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");


  const currentPlan = {
    name: "Premium" as const,
    price: "₹3,999",
    validUntil: "March 15, 2024",
    credits: 30,
    autoRenewal: true
  };


useEffect(() => {
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://wedmac-be.onrender.com/api/masterdata/list/?type=subscriptions_plan");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data: Plan[] = await res.json();
      setAvailablePlans(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };
  fetchPlans();
}, []);


  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Premium Plan - Monthly",
      amount: "₹3,999",
      status: "Completed",
      invoice: "INV-2024-001",
      method: "UPI"
    },
    {
      id: 2,
      date: "2023-12-15",
      description: "Premium Plan - Monthly",
      amount: "₹3,999",
      status: "Completed",
      invoice: "INV-2023-012",
      method: "Credit Card"
    },
    {
      id: 3,
      date: "2023-11-15",
      description: "Standard Plan - Monthly",
      amount: "₹1,999",
      status: "Completed",
      invoice: "INV-2023-011",
      method: "UPI"
    },
    {
      id: 4,
      date: "2023-10-15",
      description: "Additional Credits",
      amount: "₹500",
      status: "Completed",
      invoice: "INV-2023-010",
      method: "Net Banking"
    }
  ];

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

const handlePurchasePlan = async () => {
  if (!selectedPlan) return;

  try {
    const token = sessionStorage.getItem("accessToken"); // from your auth context

    const res = await fetch(
      `https://wedmac-be.onrender.com/api/artists/plans/${selectedPlan}/purchase/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json(); // <-- response ko hamesha parse karo

    if (!res.ok) {
      // agar error aaya to API ka error message show karo
      alert(`❌ Please wait for admin approval ${data.error || "Payment initiation failed!"}`);
      return;
    }

    // Load Razorpay script dynamically
    const rzpScript = document.createElement("script");
    rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    rzpScript.async = true;
    document.body.appendChild(rzpScript);

    rzpScript.onload = () => {
      const options = {
        key: data.key, // from backend
        amount: data.amount, // amount in paise
        currency: data.currency,
        name: "Wedmac",
        description: data.plan,
        order_id: data.razorpay_order_id,
        handler: async function (response: any) {
          await fetch("https://wedmac-be.onrender.com/api/artists/payment/verify/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          alert("✅ Payment Successful!");
        },
        prefill: {
          name: "Your User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#E6447A" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
  } catch (err) {
    console.error(err);
    alert("❌ Payment initiation failed!");
  }
};



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
              Amount: {availablePlans.find(p => p.id === selectedPlan)?.price}
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
                // Simulate successful payment
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Plan</p>
                <PlanBadge plan={currentPlan.name} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monthly Cost</p>
                <p className="text-2xl font-bold text-primary">{currentPlan.price}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{currentPlan.validUntil}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Remaining Credits</p>
                <p className="text-2xl font-bold">{currentPlan.credits}</p>
              </div>
            </div>
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
                    {availablePlans.map(plan => (
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
              className="w-full bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Pay with UPI/QR Code
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
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{payment.amount}</span>
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
          
       
        </div>
      </div>
      
      <QRPaymentDialog />
    </Layout>
  );
}
