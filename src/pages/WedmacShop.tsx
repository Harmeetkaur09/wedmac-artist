
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Clock, Bell } from "lucide-react";

export default function WedmacShop() {
  return (
    <Layout title="Wedmac Shop">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full text-center">
          <CardContent className="p-12">
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-6 bg-gradient-to-r from-[#FF577F]/10 to-[#E6447A]/10 rounded-full">
                  <ShoppingBag className="w-16 h-16 text-primary" />
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground">
                  Wedmac Shop Coming Soon!
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  We're preparing an exclusive collection of premium makeup products, 
                  tools, and accessories specially curated for professional makeup artists.
                </p>
              </div>
              
              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Premium Products</h3>
                  <p className="text-sm text-muted-foreground">
                    High-quality makeup products from top brands
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Professional Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Essential tools and brushes for every artist
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Exclusive Deals</h3>
                  <p className="text-sm text-muted-foreground">
                    Special discounts for Wedmac artists
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick delivery to your doorstep
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me When Available
                </Button>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  View Launch Timeline
                </Button>
              </div>
              
              {/* Launch Timeline */}
           
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
