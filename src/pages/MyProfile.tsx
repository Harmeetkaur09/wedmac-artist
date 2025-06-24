
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, MapPin, Calendar, Award, Instagram } from "lucide-react";

export default function MyProfile() {
  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">SA</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground">JPG, PNG up to 2MB</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Your city" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea id="bio" placeholder="Tell us about your expertise..." className="min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        {/* Experience & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input placeholder="e.g., 5 years" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">MAC Professional</Badge>
                <Badge variant="secondary">Airbrush Certified</Badge>
              </div>
              <Button variant="outline" size="sm">Add Certification</Button>
            </CardContent>
          </Card>
        </div>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-primary" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input id="instagram" placeholder="@yourusername" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website/Portfolio</Label>
              <Input id="website" placeholder="https://yourportfolio.com" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
