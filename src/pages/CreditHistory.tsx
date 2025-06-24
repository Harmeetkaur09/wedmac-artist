
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, TrendingUp, Search, Plus, Download } from "lucide-react";

export default function CreditHistory() {
  const creditHistory = [
    {
      id: 1,
      date: "2024-01-20",
      type: "Lead Unlock",
      leadName: "Priya Sharma - Wedding",
      credits: -3,
      balance: 27,
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-19",
      type: "Lead Unlock",
      leadName: "Ankita Patel - Engagement",
      credits: -2,
      balance: 30,
      status: "completed"
    },
    {
      id: 3,
      date: "2024-01-15",
      type: "Credit Purchase",
      leadName: "Monthly Plan Renewal",
      credits: +60,
      balance: 32,
      status: "completed"
    },
    {
      id: 4,
      date: "2024-01-14",
      type: "Lead Unlock",
      leadName: "Ritu Singh - Party",
      credits: -1,
      balance: -28,
      status: "completed"
    },
    {
      id: 5,
      date: "2024-01-12",
      type: "Refund",
      leadName: "Invalid Lead Report",
      credits: +2,
      balance: 29,
      status: "processed"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lead Unlock":
        return "bg-red-100 text-red-800";
      case "Credit Purchase":
        return "bg-green-100 text-green-800";
      case "Refund":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Credit History">
      <div className="space-y-6">
        {/* Credit Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">30</div>
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">45</div>
              <p className="text-sm text-muted-foreground">Credits Used</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">180</div>
              <p className="text-sm text-muted-foreground">Total Purchased</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <div className="text-2xl font-bold">75%</div>
              </div>
              <p className="text-sm text-muted-foreground">Usage Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Buy More Credits */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Need More Credits?</h3>
                <p className="text-muted-foreground">Purchase additional credits or upgrade your plan</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy Credits
                </Button>
                <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit History Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary" />
                Credit Transaction History
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search transactions..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="unlock">Lead Unlock</SelectItem>
                  <SelectItem value="purchase">Credit Purchase</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.leadName}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          transaction.credits > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.credits > 0 ? '+' : ''}{transaction.credits}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{Math.abs(transaction.balance)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
