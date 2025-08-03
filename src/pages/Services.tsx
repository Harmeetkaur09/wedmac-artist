
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Scissors, Plus, Edit, Trash2, MapPin, Clock } from "lucide-react";

export default function Services() {
  const services = [
    {
      id: 1,
      name: "Bridal Makeup",
      price: "₹15,000",
      duration: "3-4 hours",
      trialAvailable: true,
      travelCharges: "₹500/km"
    },
    {
      id: 2,
      name: "Party Makeup",
      price: "₹5,000",
      duration: "1-2 hours",
      trialAvailable: true,
      travelCharges: "₹300/km"
    },
    {
      id: 3,
      name: "Airbrush Makeup",
      price: "₹8,000",
      duration: "2-3 hours",
      trialAvailable: false,
      travelCharges: "₹400/km"
    }
  ];

  return (
    <Layout title="Services">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Makeup Services</h2>
            <p className="text-muted-foreground">Manage your service offerings and pricing</p>
          </div>
          <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-semibold text-primary">{service.price}</span>
                  </div>
               
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm">Trial Available</span>
                  <Badge variant={service.trialAvailable ? "default" : "secondary"}>
                    {service.trialAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Service Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Add New Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input id="serviceName" placeholder="e.g., Bridal Makeup" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" placeholder="15000" />
              </div>
          
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="trial" />
              <Label htmlFor="trial">Trial Available</Label>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">Cancel</Button>
              <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
                Add Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
