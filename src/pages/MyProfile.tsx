
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Camera, MapPin, Calendar, Award, Instagram, CreditCard, Car, Palette, Package, Upload, X } from "lucide-react";
import { useState } from "react";

export default function MyProfile() {
  const [selectedMakeupTypes, setSelectedMakeupTypes] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [workPhotos, setWorkPhotos] = useState<string[]>([]);

  const makeupTypes = [
    "Natural Makeup", "Party Makeup", "Bridal Makeup", "Haldi Makeup", 
    "Mehendi Makeup", "Reception Makeup", "Engagement Makeup", "Traditional Makeup",
    "HD Makeup", "Airbrush Makeup", "Editorial Makeup", "Fashion Makeup"
  ];

  const productBrands = [
    "MAC", "Huda Beauty", "Nykaa", "Lakme", "Maybelline", "L'Oreal", 
    "Urban Decay", "Too Faced", "Charlotte Tilbury", "Fenty Beauty",
    "Rare Beauty", "Morphe", "Anastasia Beverly Hills", "Other"
  ];

  const paymentMethods = [
    "Cash", "Credit Card", "Debit Card", "UPI", "Net Banking", 
    "PayPal", "Paytm", "PhonePe", "Google Pay", "Bank Transfer"
  ];

  const toggleSelection = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const addWorkPhoto = () => {
    if (workPhotos.length < 8) {
      setWorkPhotos([...workPhotos, `/placeholder.svg?${Date.now()}`]);
    }
  };

  const removeWorkPhoto = (index: number) => {
    setWorkPhotos(workPhotos.filter((_, i) => i !== index));
  };

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

        {/* Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Methods Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>Select payment methods you accept:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {paymentMethods.map((method) => (
                  <div 
                    key={method}
                    onClick={() => toggleSelection(method, selectedPaymentMethods, setSelectedPaymentMethods)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethods.includes(method) 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{method}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPaymentMethods.map((method) => (
                  <Badge key={method} variant="secondary" className="bg-primary/10 text-primary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Travel Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Select your travel preference:</Label>
              <RadioGroup defaultValue="local">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local">Local Only - Within my city</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everywhere" id="everywhere" />
                  <Label htmlFor="everywhere">Everywhere - I can travel anywhere</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="travel-charges">Travel Charges (if applicable)</Label>
              <Input id="travel-charges" placeholder="e.g., ₹500 per 10km" />
            </div>
          </CardContent>
        </Card>

        {/* Makeup Types & Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Makeup Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Select makeup types you specialize in:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {makeupTypes.map((type) => (
                  <div 
                    key={type}
                    onClick={() => toggleSelection(type, selectedMakeupTypes, setSelectedMakeupTypes)}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedMakeupTypes.includes(type) 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMakeupTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Products Used
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Select brands you use:</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {productBrands.map((brand) => (
                  <div 
                    key={brand}
                    onClick={() => toggleSelection(brand, selectedProducts, setSelectedProducts)}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
                      selectedProducts.includes(brand) 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm">{brand}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedProducts.map((brand) => (
                  <Badge key={brand} variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {brand}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Work Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Upload your best work photos (Max 8 photos)</Label>
              <Button 
                onClick={addWorkPhoto} 
                disabled={workPhotos.length >= 8}
                variant="outline" 
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {workPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Work ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    onClick={() => removeWorkPhoto(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {workPhotos.length < 8 && (
                <div 
                  onClick={addWorkPhoto}
                  className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Photo</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {workPhotos.length}/8 photos uploaded. JPG, PNG up to 2MB each.
            </p>
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
