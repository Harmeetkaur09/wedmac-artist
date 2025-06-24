
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Unlock, Search, Phone, Mail, Calendar, MapPin } from "lucide-react";

export default function UnlockedLeads() {
  const leads = [
    {
      id: 1,
      clientName: "Priya Sharma",
      phone: "+91 9876543210",
      email: "priya@email.com",
      eventDate: "2024-02-15",
      eventType: "Wedding",
      location: "Mumbai",
      budget: "₹20,000",
      status: "Contacted",
      unlockedDate: "2024-01-15"
    },
    {
      id: 2,
      clientName: "Ankita Patel",
      phone: "+91 9876543211",
      email: "ankita@email.com",
      eventDate: "2024-03-20",
      eventType: "Engagement",
      location: "Delhi",
      budget: "₹15,000",
      status: "Booked",
      unlockedDate: "2024-01-16"
    },
    {
      id: 3,
      clientName: "Ritu Singh",
      phone: "+91 9876543212",
      email: "ritu@email.com",
      eventDate: "2024-04-10",
      eventType: "Party",
      location: "Bangalore",
      budget: "₹8,000",
      status: "Pending",
      unlockedDate: "2024-01-17"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Booked":
        return "bg-green-100 text-green-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Unlocked Leads">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">24</div>
              <p className="text-sm text-muted-foreground">Total Unlocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">8</div>
              <p className="text-sm text-muted-foreground">Booked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-sm text-muted-foreground">Contacted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">4</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-primary" />
              Your Unlocked Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search leads..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Details</TableHead>
                    <TableHead>Event Info</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{lead.clientName}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{lead.eventType}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {lead.eventDate}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {lead.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">{lead.budget}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        </div>
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
