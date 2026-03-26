import { Users } from "lucide-react";
import { demoVendors } from "@/data/demoPortalContent";
import { VendorDirectoryInner, type VendorListItem } from "@/components/dashboard/VendorDirectoryList";

export default function VendorDirectoryShowcase() {
  const vendors: VendorListItem[] = demoVendors.map((v) => ({
    id: v.id,
    category: v.category,
    business_name: v.business_name,
    contact_name: v.contact_name,
    phone: v.phone,
    email: v.email,
    website: v.website,
    sort_order: v.sort_order,
  }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-100">
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
          Sample vendors
        </span>
        <span className="text-muted-foreground">
          Demo contacts for layout review — production list is managed in Admin → Approved vendors.
        </span>
      </div>

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
        loading={false}
        emptyMessage="No sample vendors."
      />
    </div>
  );
}
