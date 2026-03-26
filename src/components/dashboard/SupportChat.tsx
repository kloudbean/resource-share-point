import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Plus, Headphones, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportChatProps {
  agentId: string | undefined;
  userId: string | undefined;
}

const SupportChat = ({ agentId, userId }: SupportChatProps) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (agentId) fetchTickets();
  }, [agentId]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      const channel = supabase
        .channel(`messages-${selectedTicket.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selectedTicket.id}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("agent_id", agentId!)
      .order("created_at", { ascending: false });
    setTickets((data as Ticket[]) || []);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
  };

  const createTicket = async () => {
    if (!agentId || !newSubject.trim()) return;
    const { data } = await supabase
      .from("support_tickets")
      .insert({ agent_id: agentId, subject: newSubject, category: newCategory })
      .select()
      .single();
    if (data) {
      setTickets((prev) => [data as Ticket, ...prev]);
      setSelectedTicket(data as Ticket);
      setShowNewTicket(false);
      setNewSubject("");
      toast({ title: "Ticket created!" });
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !userId || !newMessage.trim()) return;
    await supabase.from("support_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      message: newMessage,
      is_admin: false,
    });
    setNewMessage("");
  };

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    resolved: "bg-muted text-muted-foreground",
    closed: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Headphones className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Marketing & Tech Support</h2>
            <p className="text-sm text-muted-foreground">Get help from our support team</p>
          </div>
        </div>
        <Button onClick={() => setShowNewTicket(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket List */}
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Your Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id ? "border-accent bg-accent/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className={statusColors[ticket.status] || ""}>
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), "MMM d")}</span>
                </div>
                <p className="text-sm font-medium truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">{ticket.category}</p>
              </div>
            ))}
            {tickets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No support tickets yet</p>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="border-border lg:col-span-2">
          <CardContent className="p-0">
            {selectedTicket ? (
              <div className="flex flex-col h-96">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">{selectedTicket.subject}</h3>
                  <Badge variant="outline" className={statusColors[selectedTicket.status] || ""}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        msg.is_admin
                          ? "bg-muted text-foreground rounded-bl-sm"
                          : "bg-accent text-accent-foreground rounded-br-sm"
                      }`}>
                        <p>{msg.message}</p>
                        <p className="text-[10px] opacity-60 mt-1">{format(new Date(msg.created_at), "h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a ticket or create a new one</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} />
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="tech">Tech Support</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createTicket} className="w-full">Create Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportChat;
