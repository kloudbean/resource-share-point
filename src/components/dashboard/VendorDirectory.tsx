import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PORTAL_SHOWCASE } from "@/config/portalShowcase";
import VendorDirectoryShowcase from "@/components/dashboard/VendorDirectoryShowcase";
import { VendorDirectoryInner, type VendorListItem } from "@/components/dashboard/VendorDirectoryList";

const VendorDirectory = () => {
  const [vendors, setVendors] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (PORTAL_SHOWCASE) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("vendors")
          .select("id, category, business_name, contact_name, phone, email, website, sort_order")
          .eq("is_active", true)
          .order("category", { ascending: true })
          .order("sort_order", { ascending: true })
          .order("business_name", { ascending: true });

        if (error) throw error;
        setVendors((data as VendorListItem[]) || []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Could not load vendors.";
        toast({ variant: "destructive", title: "Error", description: msg });
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (PORTAL_SHOWCASE) {
    return <VendorDirectoryShowcase />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <div className="mb-2 h-1 w-8 rounded-sm bg-[hsl(4_80%_56%)]" aria-hidden />
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">Approved vendors</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Brokerage-approved trades and services — contact details for your deals
          </p>
        </div>
      </div>

      <VendorDirectoryInner
        vendors={vendors}
        loading={loading}
        emptyMessage="No vendors listed yet. Check back soon or contact the office."
      />
    </div>
  );
};

export default VendorDirectory;
