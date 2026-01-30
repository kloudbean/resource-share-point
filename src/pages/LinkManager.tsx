import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
  Save,
  Search,
} from "lucide-react";
import remaxLogo from "@/assets/remax-excellence-logo.png";

interface ResourceLink {
  id: string;
  resource_key: string;
  title: string;
  description: string | null;
  category: string;
  drive_url: string | null;
  is_active: boolean;
}

const LinkManager = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<ResourceLink | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    drive_url: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/dashboard");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to manage links.",
        });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchResources();
    }
  }, [isAdmin]);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const { data, error } = await supabase
        .from("resource_links")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch resources.",
      });
    } finally {
      setLoadingResources(false);
    }
  };

  const handleEdit = (resource: ResourceLink) => {
    setSelectedResource(resource);
    setEditForm({
      title: resource.title,
      description: resource.description || "",
      drive_url: resource.drive_url || "",
      is_active: resource.is_active,
    });
  };

  const handleSave = async () => {
    if (!selectedResource) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("resource_links")
        .update({
          title: editForm.title,
          description: editForm.description || null,
          drive_url: editForm.drive_url || null,
          is_active: editForm.is_active,
        })
        .eq("id", selectedResource.id);

      if (error) throw error;

      await fetchResources();
      setSelectedResource(null);
      toast({
        title: "Link Updated",
        description: `${editForm.title} has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update link.",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.resource_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(resources.map((r) => r.category))];

  if (loading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src={remaxLogo}
              alt="REMAX Excellence"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="font-display text-xl font-semibold">Manage Links</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Resource Links
            </CardTitle>
            <CardDescription>
              Manage Google Drive URLs for each dashboard resource
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, category, or key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingResources ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              categories.map((category) => {
                const categoryResources = filteredResources.filter(
                  (r) => r.category === category
                );
                if (categoryResources.length === 0) return null;

                return (
                  <div key={category} className="mb-8">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="h-1 w-4 bg-accent rounded-full" />
                      {category}
                    </h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Resource</TableHead>
                            <TableHead>Drive URL</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryResources.map((resource) => (
                            <TableRow key={resource.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{resource.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {resource.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {resource.drive_url ? (
                                  <a
                                    href={resource.drive_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View Link
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Not configured
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant={resource.is_active ? "default" : "secondary"}>
                                  {resource.is_active ? "Active" : "Hidden"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(resource)}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={!!selectedResource}
        onOpenChange={(open) => !open && setSelectedResource(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resource Link</DialogTitle>
            <DialogDescription>
              Update the details and Google Drive URL for this resource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Resource title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive_url">Google Drive URL</Label>
              <Input
                id="drive_url"
                value={editForm.drive_url}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, drive_url: e.target.value }))
                }
                placeholder="https://drive.google.com/drive/folders/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste the full Google Drive folder or file URL
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden resources won't appear on the dashboard
                </p>
              </div>
              <Switch
                checked={editForm.is_active}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedResource(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkManager;
