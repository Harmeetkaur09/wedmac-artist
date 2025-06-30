
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanBadge } from "@/components/PlanBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Download, Calendar, AlertCircle, Crown, Receipt, QrCode, Smartphone } from "lucide-react";

export default function PaymentsPlan() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showQR, setShowQR] = useState(false);

  const currentPlan = {
    name: "Premium" as const,
    price: "₹3,999",
    validUntil: "March 15, 2024",
    credits: 30,
    autoRenewal: true
  };

  const availablePlans = [
    { id: "basic", name: "Basic", price: "₹999", credits: 10 },
    { id: "standard", name: "Standard", price: "₹1,999", credits: 25 },
    { id: "premium", name: "Premium", price: "₹3,999", credits: 60 },
    { id: "pro", name: "Pro", price: "₹6,999", credits: 120 }
  ];

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

  const handlePurchasePlan = () => {
    if (selectedPlan) {
      setShowQR(true);
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

        {/* Purchase New Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Purchase Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan to purchase" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} ({plan.credits} credits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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

        {/* Auto-renewal Status */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Auto-Renewal Active</h3>
                  <p className="text-sm text-muted-foreground">
                    Your plan will automatically renew on {currentPlan.validUntil}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage Auto-Renewal
              </Button>
            </div>
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
                  <TableHead>Invoice</TableHead>
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
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Receipt className="w-3 h-3 mr-1" />
                        {payment.invoice}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Need More Credits?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Purchase additional credits without changing your plan
              </p>
              <Button variant="outline" className="w-full">
                Buy Credits
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Update Payment Method</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Change your default payment method for future transactions
              </p>
              <Button variant="outline" className="w-full">
                Update Payment
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Billing Address</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update your billing information and address
              </p>
              <Button variant="outline" className="w-full">
                Update Address
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <QRPaymentDialog />
    </Layout>
  );
}
