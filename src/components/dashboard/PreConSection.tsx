import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ExternalLink, Image, FileText, Share2, MapPin } from "lucide-react";

interface PreconProject {
  id: string;
  name: string;
  developer: string | null;
  location: string | null;
  description: string | null;
  price_range: string | null;
  thumbnail_url: string | null;
  status: string;
  external_url: string | null;
}

interface PreconAsset {
  id: string;
  project_id: string | null;
  title: string;
  asset_type: string;
  file_url: string;
  file_name: string;
  category: string;
}

const PreConSection = () => {
  const [projects, setProjects] = useState<PreconProject[]>([]);
  const [assets, setAssets] = useState<PreconAsset[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: projData } = await supabase.from("precon_projects").select("*").eq("is_active", true);
    setProjects((projData as PreconProject[]) || []);
    const { data: assetData } = await supabase.from("precon_assets").select("*").eq("is_active", true);
    setAssets((assetData as PreconAsset[]) || []);
  };

  const statusColors: Record<string, string> = {
    selling: "bg-green-100 text-green-800",
    "coming soon": "bg-blue-100 text-blue-800",
    "sold out": "bg-red-100 text-red-800",
  };

  const assetTypeIcons: Record<string, typeof Image> = {
    social_media: Share2,
    floorplan: MapPin,
    document: FileText,
    general: Image,
  };

  const assetCategories = [...new Set(assets.map((a) => a.category))];

  return (
    <div className="space-y-8">
      {/* Hot Selling Pre-Con Projects */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Hot Selling Pre-Con Projects</h2>
            <p className="text-sm text-muted-foreground">Latest pre-construction opportunities for your clients</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="border-border hover:shadow-lg transition-all overflow-hidden group">
              <div className="h-40 bg-gradient-to-br from-primary/60 to-primary/90 flex items-center justify-center relative">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-14 w-14 text-primary-foreground/40" />
                )}
                <Badge className={`absolute top-3 left-3 ${statusColors[project.status] || "bg-muted"}`}>
                  {project.status}
                </Badge>
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-foreground text-lg group-hover:text-accent transition-colors">{project.name}</h3>
                {project.developer && <p className="text-sm text-muted-foreground">by {project.developer}</p>}
                {project.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {project.location}
                  </p>
                )}
                {project.price_range && (
                  <p className="text-sm font-semibold text-accent mt-2">{project.price_range}</p>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{project.description}</p>
                {project.external_url && (
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" /> View Details
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pre-construction projects listed yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Con Assets */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="h-6 w-6 text-accent" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Pre-Con Assets</h2>
            <p className="text-sm text-muted-foreground">Social media posts, floor plans, brochures and more</p>
          </div>
        </div>

        {assetCategories.length > 0 ? (
          <Tabs defaultValue={assetCategories[0]} className="w-full">
            <TabsList className="mb-4">
              {assetCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
              ))}
            </TabsList>
            {assetCategories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {assets
                    .filter((a) => a.category === cat)
                    .map((asset) => {
                      const Icon = assetTypeIcons[asset.asset_type] || Image;
                      return (
                        <Card key={asset.id} className="border-border hover:shadow-md transition-all">
                          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-accent" />
                            </div>
                            <p className="text-sm font-medium text-foreground line-clamp-2">{asset.title}</p>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={asset.file_url} target="_blank" rel="noopener noreferrer" download>
                                Download
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No assets available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreConSection;
