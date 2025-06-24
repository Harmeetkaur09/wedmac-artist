
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { PlanBadge } from "./PlanBadge";
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Calendar,
  Eye,
  Phone,
  MapPin
} from "lucide-react";

export function Dashboard() {
  const recentLeads = [
    {
      id: 1,
      clientName: "Priya Sharma",
      eventType: "Bridal Makeup",
      eventDate: "2024-07-15",
      location: "Mumbai",
      status: "New",
      phone: "+91 98765 43210"
    },
    {
      id: 2,
      clientName: "Anita Patel",
      eventType: "Party Makeup",
      eventDate: "2024-07-12",
      location: "Delhi",
      status: "Contacted",
      phone: "+91 98765 43211"
    },
    {
      id: 3,
      clientName: "Riya Singh",
      eventType: "Engagement",
      eventDate: "2024-07-18",
      location: "Bangalore",
      status: "New",
      phone: "+91 98765 43212"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan="Premium" />
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Credits Available</p>
            <p className="text-2xl font-bold text-primary">42</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New Leads Today"
          value={8}
          subtitle="Since midnight"
          icon={TrendingUp}
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Total Leads"
          value={156}
          subtitle="This month"
          icon={Users}
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard
          title="Credits Used"
          value={18}
          subtitle="This week"
          icon={Coins}
        />
        <StatCard
          title="Bookings"
          value={24}
          subtitle="Confirmed this month"
          icon={Calendar}
          trend={{ value: "+15%", isPositive: true }}
        />
      </div>

      {/* Recent Leads */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Leads</CardTitle>
            <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{lead.clientName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      lead.status === 'New' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{lead.eventType}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{lead.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{lead.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Update Profile</h3>
            <p className="text-sm text-muted-foreground">Keep your portfolio fresh</p>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Buy Credits</h3>
            <p className="text-sm text-muted-foreground">Unlock more leads</p>
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Track your performance</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
