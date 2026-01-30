import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  CheckCircle2,
  Users,
  Shield,
  BarChart3,
  Upload,
  Link,
  Key,
  Smartphone,
  Settings,
  Database,
  Lock,
} from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

const Quote = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const features = [
    {
      category: "Authentication & Security",
      icon: Lock,
      items: [
        { name: "Secure Login System", description: "RECO Number-based authentication with encrypted passwords" },
        { name: "User Registration", description: "Self-service signup with email verification" },
        { name: "Admin Password Reset", description: "Administrators can securely reset agent passwords" },
        { name: "Role-Based Access Control", description: "Separate admin and agent permission levels" },
        { name: "Session Management", description: "Automatic session handling and secure logout" },
      ],
    },
    {
      category: "Agent Management",
      icon: Users,
      items: [
        { name: "Agent Profiles", description: "Complete profile management with personal details" },
        { name: "Profile Photo Upload", description: "Agents can upload and update their avatar" },
        { name: "Account Activation", description: "Admin approval workflow for new registrations" },
        { name: "Agent Deactivation", description: "Temporarily disable agent access without deletion" },
        { name: "Agent Deletion", description: "Permanently remove agents from the system" },
        { name: "Admin Privilege Management", description: "Grant or revoke admin access to agents" },
      ],
    },
    {
      category: "Resource Dashboard",
      icon: Link,
      items: [
        { name: "18 Resource Categories", description: "Organized buttons for all agent resources" },
        { name: "Dynamic Link Management", description: "Admin can update Google Drive URLs anytime" },
        { name: "Category Organization", description: "Resources grouped by: Resources, Marketing, Communications, Support, Office" },
        { name: "Resource Visibility Control", description: "Hide/show individual resources from the dashboard" },
        { name: "Direct Google Drive Access", description: "One-click access to training materials and documents" },
      ],
    },
    {
      category: "Analytics & Tracking",
      icon: BarChart3,
      items: [
        { name: "Content View Tracking", description: "Track every resource click by every agent" },
        { name: "Per-Agent Analytics", description: "See total views, unique resources, and last active date per agent" },
        { name: "Popular Resources Report", description: "Identify most accessed content across all agents" },
        { name: "Date Range Filtering", description: "View analytics for 7, 30, 90 days or full year" },
        { name: "Activity Breakdown", description: "See which specific resources each agent accesses most" },
        { name: "Engagement Metrics", description: "Average views per agent, active agent counts" },
      ],
    },
    {
      category: "Admin Dashboard",
      icon: Shield,
      items: [
        { name: "Centralized Agent Management", description: "View, search, and manage all agents from one screen" },
        { name: "Quick Actions", description: "Activate, deactivate, reset password, or delete with one click" },
        { name: "Search & Filter", description: "Find agents by name, RECO number, or email" },
        { name: "Status Overview", description: "See activation status for all agents at a glance" },
        { name: "Link Management Portal", description: "Update all Google Drive URLs without code changes" },
        { name: "Analytics Access", description: "Full visibility into agent engagement and usage" },
      ],
    },
    {
      category: "Technical Features",
      icon: Database,
      items: [
        { name: "Cloud Database", description: "Secure PostgreSQL database with automatic backups" },
        { name: "Row-Level Security", description: "Data isolation ensures agents only see their own data" },
        { name: "Responsive Design", description: "Works perfectly on desktop, tablet, and mobile" },
        { name: "Real-Time Updates", description: "Changes reflect immediately across all users" },
        { name: "Scalable Architecture", description: "Built to handle growing team sizes" },
        { name: "HTTPS Encryption", description: "All data transmitted securely" },
      ],
    },
  ];

  const deliverables = [
    "Fully functional Agent Portal web application",
    "Admin dashboard with complete management capabilities",
    "Analytics dashboard with engagement tracking",
    "18 configurable resource buttons with Google Drive integration",
    "User authentication system with RECO Number login",
    "Profile management with avatar upload",
    "Link management system for easy updates",
    "Mobile-responsive design",
    "Cloud hosting and database setup",
    "Initial admin account configuration",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Print Button - Hidden in print */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button onClick={handlePrint} className="gap-2 shadow-lg">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef} className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src={remaxLogo}
            alt="REMAX Excellence"
            className="h-16 mx-auto mb-6"
          />
          <h1 className="font-display text-4xl font-bold text-primary mb-2">
            Agent Portal Development
          </h1>
          <p className="text-xl text-muted-foreground">
            Project Proposal & Feature Specification
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Prepared: {new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4">Executive Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              A comprehensive, custom-built Agent Portal designed specifically for REMAX Excellence. 
              This cloud-based solution centralizes all agent resources, training materials, and marketing 
              assets in one secure, branded platform. The portal includes advanced analytics to track 
              agent engagement, a powerful admin dashboard for team management, and seamless integration 
              with your existing Google Drive resources.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">
            Complete Feature Breakdown
          </h2>

          <div className="space-y-6">
            {features.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card key={section.category} className="overflow-hidden">
                  <div className="bg-primary/5 px-6 py-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{section.category}</h3>
                  </div>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {section.items.map((item) => (
                        <li key={item.name} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground"> — {item.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Deliverables */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4">Project Deliverables</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deliverables.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Investment */}
        <Card className="mb-8 border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4 text-center">Investment</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">$4,500 CAD</div>
              <p className="text-muted-foreground">One-time development fee</p>
            </div>
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold">Development</div>
                <p className="text-sm text-muted-foreground">Full custom build</p>
              </div>
              <div>
                <div className="font-semibold">Deployment</div>
                <p className="text-sm text-muted-foreground">Cloud hosting setup</p>
              </div>
              <div>
                <div className="font-semibold">Training</div>
                <p className="text-sm text-muted-foreground">Admin walkthrough</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Development & Setup
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete portal development</li>
                  <li>• Database configuration</li>
                  <li>• Authentication system setup</li>
                  <li>• Admin account creation</li>
                  <li>• Initial resource configuration</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Platform Support
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Desktop browsers (Chrome, Safari, Edge, Firefox)</li>
                  <li>• Tablet optimization</li>
                  <li>• Mobile-responsive design</li>
                  <li>• iOS and Android web access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Add-ons */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4">Optional Add-ons</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Custom Domain Setup</div>
                  <p className="text-sm text-muted-foreground">portal.yourcompany.com</p>
                </div>
                <div className="font-semibold">$200 CAD</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Extended Training Session</div>
                  <p className="text-sm text-muted-foreground">1-hour video call walkthrough</p>
                </div>
                <div className="font-semibold">$150 CAD</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Monthly Maintenance Package</div>
                  <p className="text-sm text-muted-foreground">Updates, support, and minor modifications</p>
                </div>
                <div className="font-semibold">$100 CAD/month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl font-bold mb-4">Estimated Timeline</h2>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div className="font-medium">Kickoff</div>
                <p className="text-xs text-muted-foreground">Requirements review</p>
              </div>
              <div className="h-0.5 bg-primary/20 flex-1" />
              <div className="text-center flex-1">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div className="font-medium">Development</div>
                <p className="text-xs text-muted-foreground">1-2 weeks</p>
              </div>
              <div className="h-0.5 bg-primary/20 flex-1" />
              <div className="text-center flex-1">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div className="font-medium">Testing</div>
                <p className="text-xs text-muted-foreground">Quality assurance</p>
              </div>
              <div className="h-0.5 bg-primary/20 flex-1" />
              <div className="text-center flex-1">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="font-medium">Launch</div>
                <p className="text-xs text-muted-foreground">Go live</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 pb-8">
          <p>This proposal is valid for 30 days from the date of issue.</p>
          <p className="mt-2">Questions? Contact us to discuss your requirements.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default Quote;
