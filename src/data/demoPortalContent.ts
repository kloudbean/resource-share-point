/**
 * Reference: remax-portal-demo.html — sample data & visuals for stakeholder feedback.
 * Images: Unsplash (license-friendly for demos).
 */

export const DEMO_AGENT_TAGLINE = "Mississauga Office";

export const demoWelcomeStats = {
  activeCourses: 4,
  completed: 3,
  eventsThisWeek: 2,
  avgProgress: 72,
  streakDays: 7,
};

export const demoProgressCourses = [
  {
    id: "demo-p1",
    title: "Financial Literacy for Real Estate",
    provider: "Udemy",
    modules: 12,
    pct: 45,
    lastWatch: "Last watched 2 days ago",
    ringColor: "#DC2626",
    barColor: "bg-red-600",
    status: "in_progress" as const,
  },
  {
    id: "demo-p2",
    title: "Pre-Construction Sales Mastery",
    provider: "REMAX Academy",
    modules: 8,
    pct: 30,
    lastWatch: "Last watched 5 days ago",
    ringColor: "#2563EB",
    barColor: "bg-blue-600",
    status: "in_progress" as const,
  },
  {
    id: "demo-p3",
    title: "How to Create an Online Course",
    provider: "Udemy",
    modules: 10,
    pct: 76,
    lastWatch: "Last watched yesterday",
    ringColor: "#EA580C",
    barColor: "bg-orange-500",
    status: "in_progress" as const,
  },
  {
    id: "demo-p4",
    title: "Introduction to Python Programming",
    provider: "Udemy",
    modules: 15,
    pct: 0,
    lastWatch: "Not started yet",
    ringColor: "#94A3B8",
    barColor: "bg-slate-300",
    status: "not_started" as const,
  },
];

export const demoNewCourses = [
  {
    id: "demo-n1",
    provider: "Udemy",
    title: "Financial Literacy for Real Estate",
    description:
      "Budgets, interest, savings and retirement planning from the lens of real estate.",
    price: "free" as const,
    pct: 45,
    thumb: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80",
    thumbEmoji: "💰",
  },
  {
    id: "demo-n2",
    provider: "REMAX Academy",
    title: "Pre-Construction Sales Mastery",
    description: "Full workflow from builder registration to final closing for pre-con agents.",
    price: "paid" as const,
    priceLabel: "$49",
    pct: 30,
    thumb: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
    thumbEmoji: "🏗️",
  },
  {
    id: "demo-n3",
    provider: "Udemy",
    title: "How to Create an Online Course",
    description: "Best practices for designing, producing, and publishing high-quality courses.",
    price: "free" as const,
    pct: 76,
    thumb: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
    thumbEmoji: "💻",
  },
  {
    id: "demo-n4",
    provider: "Udemy",
    title: "Introduction to Python Programming",
    description: "Learn Python from scratch — ideal for agents wanting tech-powered workflows.",
    price: "free" as const,
    pct: 0,
    thumb: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80",
    thumbEmoji: "🐍",
  },
  {
    id: "demo-n5",
    provider: "REMAX Academy",
    title: "Social Media Growth for Agents",
    description: "Instagram, TikTok & Facebook strategies that generate real estate leads.",
    price: "paid" as const,
    priceLabel: "$29",
    pct: 0,
    thumb: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
    thumbEmoji: "📱",
  },
];

export const demoCompletedCourses = [
  {
    id: "demo-c1",
    provider: "REMAX Excellence",
    title: "REMAX Agent Onboarding Program",
    completed: "Feb 14, 2026",
    score: "94%",
    thumb: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
  },
  {
    id: "demo-c2",
    provider: "Udemy",
    title: "Social Media Marketing for Agents",
    completed: "Mar 1, 2026",
    score: "88%",
    thumb: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80",
  },
  {
    id: "demo-c3",
    provider: "REMAX Excellence",
    title: "MLS System Training & Certification",
    completed: "Jan 20, 2026",
    score: "97%",
    thumb: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  },
];

export const demoListings = [
  {
    id: "demo-l1",
    builder: "Caivan",
    title: "Caivan Brampton Townhomes",
    location: "Brampton, ON",
    price: "From $689,900",
    status: "Active" as const,
    isNew: true,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
  },
  {
    id: "demo-l2",
    builder: "Mattamy Homes",
    title: "Mattamy Heritage Towns",
    location: "Mississauga, ON",
    price: "From $824,000",
    status: "Coming Soon" as const,
    isNew: true,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad4ab?w=800&q=80",
  },
  {
    id: "demo-l3",
    builder: "GRC",
    title: "GRC Condominiums",
    location: "Brampton, ON",
    price: "From $548,000",
    status: "Active" as const,
    isNew: false,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  },
  {
    id: "demo-l4",
    builder: "Rathna",
    title: "Rathna Condominiums",
    location: "Brampton, ON",
    price: "From $499,900",
    status: "Active" as const,
    isNew: true,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  },
  {
    id: "demo-l5",
    builder: "Liberty Development",
    title: "Liberty Residences",
    location: "Oakville, ON",
    price: "From $1,049,000",
    status: "Coming Soon" as const,
    isNew: false,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: "demo-l6",
    builder: "Primont Homes",
    title: "Primont Heritage Collection",
    location: "Caledon, ON",
    price: "From $1,199,000",
    status: "Active" as const,
    isNew: false,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  },
];

/** FullCalendar-compatible extended props */
export const demoCalendarEvents = [
  { id: "de1", title: "Pre-Con Launch", start: "2026-03-31T10:00:00", type: "precon" },
  { id: "de2", title: "Course Deadline", start: "2026-04-02T09:00:00", type: "deadline" },
  { id: "de3", title: "Open House", start: "2026-04-05T14:00:00", type: "office" },
  { id: "de4", title: "Marketing Workshop", start: "2026-04-08T14:00:00", type: "training" },
  { id: "de5", title: "Docs Review", start: "2026-04-10T11:00:00", type: "precon" },
  { id: "de6", title: "Awards Night", start: "2026-04-15T18:00:00", type: "event" },
  { id: "de7", title: "Python Course Live", start: "2026-04-18T10:00:00", type: "training" },
  { id: "de8", title: "Team Meeting", start: "2026-04-22T09:30:00", type: "office" },
  { id: "de9", title: "Q2 Planning", start: "2026-04-28T13:00:00", type: "deadline" },
];

export const demoSupportTickets = [
  {
    id: "demo-t1",
    shortId: "TKT-1042",
    subject: "Email signature not displaying",
    category: "Marketing",
    status: "open" as const,
    time: "2 hours ago",
  },
  {
    id: "demo-t2",
    shortId: "TKT-1038",
    subject: "Social post needed for Caivan listing",
    category: "Marketing",
    status: "in-progress" as const,
    time: "1 day ago",
  },
  {
    id: "demo-t3",
    shortId: "TKT-1031",
    subject: "Portal login issue on mobile Safari",
    category: "Tech",
    status: "resolved" as const,
    time: "3 days ago",
  },
];

export const demoChatMessages = [
  {
    id: "m1",
    from: "support" as const,
    initials: "MR",
    text: "Hi Sarah! I can see your ticket. Can you tell me which email client you're using — Outlook or Gmail?",
    time: "10:14 AM",
  },
  {
    id: "m2",
    from: "agent" as const,
    initials: "SJ",
    text: "Hi Mike! I'm using Outlook 365 on Windows 11. The image in the signature just shows a broken link icon.",
    time: "10:17 AM",
  },
  {
    id: "m3",
    from: "support" as const,
    initials: "MR",
    text: "Got it. That's usually a cached image issue. Try File → Options → Mail → Signatures, delete and re-add the image.",
    time: "10:21 AM",
  },
  {
    id: "m4",
    from: "agent" as const,
    initials: "SJ",
    text: "Thank you, trying that now! 🙏",
    time: "10:22 AM",
  },
];

export const demoOffices = [
  {
    id: "demo-o1",
    name: "Mississauga Office",
    address: "100 Milverton Dr #610\nMississauga, ON L6R 4H1",
    phone: "(905) 507-4436",
    mapQuery: "100 Milverton Dr Mississauga ON",
    hours: ["Mon–Fri: 9:00 AM – 6:00 PM", "Sat: 10:00 AM – 4:00 PM", "Sun: Closed"],
  },
  {
    id: "demo-o2",
    name: "Brampton Office",
    address: "456 Vodden St E #21b\nBrampton, ON L6S 5Y7",
    phone: "519-342-1961",
    mapQuery: "456 Vodden St E Brampton ON",
    hours: ["Mon–Fri: 9:00 AM – 6:00 PM", "Sat: 10:00 AM – 3:00 PM", "Sun: Closed"],
  },
];

export const demoVendors = [
  {
    id: "demo-v1",
    category: "Plumber",
    business_name: "GTA Pro Plumbing",
    contact_name: "Mike Torres",
    phone: "(416) 555-0100",
    email: "info@gta-pro.example",
    website: "https://example.com",
    sort_order: 0,
  },
  {
    id: "demo-v2",
    category: "Electrician",
    business_name: "BrightWire Electric",
    contact_name: "Sarah Chen",
    phone: "(905) 555-0200",
    email: "hello@brightwire.example",
    website: null as string | null,
    sort_order: 0,
  },
  {
    id: "demo-v3",
    category: "HVAC",
    business_name: "Comfort First Heating",
    contact_name: "James Okonkwo",
    phone: "(647) 555-0300",
    email: "service@comfortfirst.example",
    website: "https://example.com/hvac",
    sort_order: 0,
  },
];

export const demoAssetTiles: Array<{
  id: string;
  icon: string;
  title: string;
  sub: string;
  href?: string;
  action?: "hst" | "toast";
}> = [
  { id: "a1", icon: "🏗️", title: "Pre-Con Projects", sub: "Browse all active pre-construction listings", href: "#listings" },
  { id: "a2", icon: "🧮", title: "HST Rebate Calculator", sub: "Estimate new housing rebates", action: "hst" },
  { id: "a3", icon: "🗺️", title: "Floor Maps Gallery", sub: "Zoomable floor plans per project", action: "toast" },
  { id: "a4", icon: "📲", title: "Social Media Posts", sub: "Branded content per project", action: "toast" },
  { id: "a5", icon: "📋", title: "Pre-Con Worksheet", sub: "Deal tracking spreadsheet", action: "toast" },
  { id: "a6", icon: "🎯", title: "Buyer Presentation Kit", sub: "Templates for buyer consultations", action: "toast" },
];

export const demoDocuments = [
  { id: "d1", icon: "📄", name: "Showing Instructions" },
  { id: "d2", icon: "📋", name: "Offer Data Sheet" },
  { id: "d3", icon: "📝", name: "Clauses" },
  { id: "d4", icon: "📑", name: "Schedule B" },
  { id: "d5", icon: "🗂️", name: "Deal Sheet" },
  { id: "d6", icon: "💼", name: "Commission Schedule" },
];
