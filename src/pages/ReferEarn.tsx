
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Share2, Copy, WhatsApp, Mail, Gift, Users, TrendingUp, ExternalLink } from "lucide-react";

export default function ReferEarn() {
  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: "₹2,400",
    pendingEarnings: "₹600"
  };

  const referralHistory = [
    {
      id: 1,
      name: "Sneha Makeup Artist",
      email: "sneha@email.com",
      joinDate: "2024-01-15",
      status: "Active",
      earnings: "₹500",
      type: "Artist"
    },
    {
      id: 2,
      name: "Priya Client",
      email: "priya@email.com",
      joinDate: "2024-01-18",
      status: "Active",
      earnings: "₹200",
      type: "Client"
    },
    {
      id: 3,
      name: "Ravi Photography",
      email: "ravi@email.com",
      joinDate: "2024-01-20",
      status: "Pending",
      earnings: "₹0",
      type: "Artist"
    }
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText("WEDMAC-SA2024");
    // You could add a toast notification here
  };

  const shareWhatsApp = () => {
    const message = "Join Wedmac with my referral code WEDMAC-SA2024 and get exclusive benefits!";
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Layout title="Refer & Earn">
      <div className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{referralStats.activeReferrals}</div>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{referralStats.totalEarnings}</div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{referralStats.pendingEarnings}</div>
              <p className="text-sm text-muted-foreground">Pending Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input 
                  value="WEDMAC-SA2024" 
                  readOnly 
                  className="text-lg font-mono text-center bg-white"
                />
              </div>
              <Button variant="outline" onClick={copyReferralCode}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                <WhatsApp className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Referral Program Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">Share Your Code</h3>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code with friends and colleagues
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">They Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  New users register using your code and get special benefits
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">You Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get cashback, free credits, or exclusive gifts for each referral
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referral.name}</div>
                        <div className="text-sm text-muted-foreground">{referral.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={referral.type === 'Artist' ? 'default' : 'secondary'}>
                        {referral.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{referral.joinDate}</TableCell>
                    <TableCell>
                      <Badge 
                        className={referral.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{referral.earnings}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card>
          <CardHeader>
            <CardTitle>Reward Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Artist Referrals</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>• Successful signup:</span>
                    <span className="font-semibold">₹200</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• First plan purchase:</span>
                    <span className="font-semibold">₹300</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• 6-month milestone:</span>
                    <span className="font-semibold">₹500</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Client Referrals</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>• Successful signup:</span>
                    <span className="font-semibold">₹100</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• First booking:</span>
                    <span className="font-semibold">₹200</span>
                  </li>
                  <li className="flex justify-between">
                    <span>• Repeat bookings:</span>
                    <span className="font-semibold">₹50 each</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
