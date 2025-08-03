
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HelpCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, AlertCircle, Crown, Calendar } from "lucide-react";
import { PlanBadge } from "@/components/PlanBadge";

export default function Support() {
  const supportTickets = [
    {
      id: "#SUP-001",
      title: "Payment issue with Premium plan",
      status: "Open",
      priority: "High",
      date: "2024-01-20",
      lastUpdate: "2024-01-21"
    },
    {
      id: "#SUP-002",
      title: "Unable to unlock leads",
      status: "In Progress",
      priority: "Medium",
      date: "2024-01-18",
      lastUpdate: "2024-01-19"
    },
    {
      id: "#SUP-003",
      title: "Profile not showing in search",
      status: "Resolved",
      priority: "Low",
      date: "2024-01-15",
      lastUpdate: "2024-01-16"
    }
  ];
    const currentPlan = {
    name: "Premium" as const,
    price: "₹3,999",
    validUntil: "March 15, 2024",
    credits: 30,
    autoRenewal: true
  };

  const faqs = [
    {
      question: "How do I unlock leads?",
      answer: "To unlock leads, go to the dashboard and click on any lead card. You'll need sufficient credits in your account to unlock lead contact details."
    },
    {
      question: "What happens when my plan expires?",
      answer: "When your plan expires, you'll lose access to premium features and your profile visibility will be reduced. You can renew your plan anytime to restore full access."
    },
    {
      question: "How can I get more credits?",
      answer: "You can get more credits by upgrading your plan or purchasing additional credit packs from the Credit History section."
    },
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan anytime. Changes will take effect immediately, and billing will be prorated accordingly."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout title="Support & Help">
      <div className="space-y-6">
        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* Raise New Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Raise a Support Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment Issues</SelectItem>
                    <SelectItem value="leads">Lead Related</SelectItem>
                    <SelectItem value="profile">Profile Issues</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Detailed Description</Label>
              <Textarea 
                id="message" 
                placeholder="Please provide detailed information about your issue..." 
                className="min-h-[120px]"
              />
            </div>
            
            <Button className="bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white">
              Submit Ticket
            </Button>
          </CardContent>
        </Card>

        {/* Your Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell>{ticket.lastUpdate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
