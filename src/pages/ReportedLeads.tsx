
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ReportedLeads() {
  const reportedLeads = [
    {
      id: 1,
      clientName: "John Doe",
      phone: "+91 9876543213",
      reportReason: "Fake inquiry",
      reportDate: "2024-01-20",
      status: "Under Review",
      description: "Client asked for services but provided fake contact details"
    },
    {
      id: 2,
      clientName: "Jane Smith",
      phone: "+91 9876543214",
      reportReason: "Spam",
      reportDate: "2024-01-18",
      status: "Action Taken",
      description: "Multiple fake inquiries from same number"
    },
    {
      id: 3,
      clientName: "Mike Johnson",
      phone: "+91 9876543215",
      reportReason: "Inappropriate behavior",
      reportDate: "2024-01-15",
      status: "Resolved",
      description: "Client was rude and used inappropriate language"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Under Review":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Action Taken":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Action Taken":
        return "bg-green-100 text-green-800";
      case "Resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Reported Leads">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">9</div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reported Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              Reported Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Details</TableHead>
                  <TableHead>Report Reason</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{lead.clientName}</div>
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        {lead.reportReason}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.reportDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(lead.status)}
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lead.description}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Report New Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Report a Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you encounter fake leads, spam, or inappropriate behavior, report it to help improve the platform.
            </p>
            <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
              <Flag className="w-4 h-4 mr-2" />
              Report New Lead
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
