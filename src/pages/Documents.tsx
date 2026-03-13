import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Download, FileText, Upload, Loader2, Search, Trash2, Plus,
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface SharedDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  category: string;
  created_at: string;
}

const docCategories = ["General", "Contracts", "Forms", "Training", "Marketing", "Policies"];

const Documents = () => {
  const navigate = useNavigate();
  const { user, agent, loading, isAdmin, isActive, signOut } = useAuth();
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: "", description: "", category: "General" });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("shared_documents")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
    setLoadingDocs(false);
  };

  const handleUpload = async () => {
    if (!file || !newDoc.title) { toast({ variant: "destructive", title: "Missing fields" }); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);

      await supabase.from("shared_documents").insert({
        title: newDoc.title,
        description: newDoc.description || null,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        category: newDoc.category,
        uploaded_by: user!.id,
      });

      toast({ title: "Document uploaded successfully" });
      setShowUpload(false);
      setNewDoc({ title: "", description: "", category: "General" });
      setFile(null);
      fetchDocs();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload failed", description: e.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: SharedDocument) => {
    const path = doc.file_url.split("/documents/")[1];
    await supabase.storage.from("documents").remove([path]);
    await supabase.from("shared_documents").update({ is_active: false }).eq("id", doc.id);
    toast({ title: "Document removed" });
    fetchDocs();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.title.toLowerCase().includes(q) || d.file_name.toLowerCase().includes(q);
    const matchCategory = selectedCategory === "all" || d.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const getInitials = (name: string | null) => {
    if (!name) return "AG";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const agentName = agent?.full_name || `Agent ${agent?.reco_number || ""}`;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        agentName={agentName}
        fullName={agent?.full_name || null}
        recoNumber={agent?.reco_number || null}
        avatarUrl={agent?.avatar_url || null}
        initials={getInitials(agent?.full_name)}
        isAdmin={isAdmin}
        onLogout={async () => { await signOut(); navigate("/auth"); }}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground">Documents</h2>
              <p className="text-muted-foreground">Shared files and resources</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowUpload(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Upload Document
            </Button>
          )}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {docCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loadingDocs ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No documents found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <Card key={doc.id} className="border-border/50 hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground truncate">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.file_name}</span>
                      {doc.file_size && <span className="text-xs text-muted-foreground">• {formatSize(doc.file_size)}</span>}
                    </div>
                    {doc.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{doc.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <Download className="h-4 w-4" /> Download
                      </a>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={newDoc.description} onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })} /></div>
            <div>
              <Label>Category</Label>
              <Select value={newDoc.category} onValueChange={(v) => setNewDoc({ ...newDoc, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{docCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4 text-center">
          <img src={remaxLogo} alt="REMAX Excellence" className="h-8 mx-auto mb-3 brightness-0 invert opacity-80" />
          <p className="text-sm text-primary-foreground/70">© 2024 REMAX Excellence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Documents;
