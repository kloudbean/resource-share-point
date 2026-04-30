export type ContactSharePayload = {
  v: 1;
  k: "contact";
  category: string;
  business_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
};

export type ListingPublicDocument = { title: string; url: string };

export type ListingSharePayload = {
  v: 1;
  k: "listing";
  name: string;
  developer?: string | null;
  location?: string | null;
  description?: string | null;
  price_range?: string | null;
  thumbnail_url?: string | null;
  status?: string | null;
  external_url?: string | null;
  city_label?: string | null;
  property_label?: string | null;
  commission_percent?: number | null;
  /** Extra marketing images (admin gallery + image assets). */
  gallery_urls?: string[];
  /** Floor plans, PDFs, and other files attached to the project in admin. */
  public_documents?: ListingPublicDocument[];
};

const MAX_DESC = 900;
const MAX_GALLERY = 10;
const MAX_DOCS = 12;
const MAX_URL_LEN = 450;
const MAX_PAYLOAD_CHARS = 7500;

export type PreconShareAsset = {
  project_id: string | null;
  title: string;
  file_url: string;
  category: string;
  asset_type: string;
};

export type PreconShareProject = {
  id: string;
  name: string;
  developer: string | null;
  location: string | null;
  description: string | null;
  price_range: string | null;
  thumbnail_url: string | null;
  gallery_urls?: unknown;
  status: string;
  external_url: string | null;
  property_type: string;
  commission_rate_percent: number | null;
  precon_cities?: { name: string } | null;
};

function normalizeGalleryUrlsFromProject(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0).map((u) => u.trim());
}

function isFloorAssetShare(a: PreconShareAsset): boolean {
  const c = (a.category || "").toLowerCase();
  const title = (a.title || "").toLowerCase();
  return c.includes("floor") || title.includes("floor plan") || a.asset_type === "floor_plan";
}

function isImageUrlShare(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url) || url.includes("images.unsplash.com");
}

function isGalleryAssetShare(a: PreconShareAsset): boolean {
  if (isFloorAssetShare(a)) return false;
  const c = (a.category || "").toLowerCase();
  if (c.includes("floor")) return false;
  if (c.includes("gallery") || c.includes("photo") || c.includes("rendering") || c.includes("image")) return true;
  return isImageUrlShare(a.file_url);
}

function propertyTypeShareLabel(property_type: string): string {
  if (property_type === "condo") return "Condo";
  if (property_type === "home") return "Home";
  if (property_type === "townhome") return "Townhome";
  return "Mixed";
}

/** Builds the payload agents share with WhatsApp/social — includes gallery + files the admin linked to the project. */
export function buildListingSharePayloadForPrecon(
  project: PreconShareProject,
  assets: PreconShareAsset[],
  hideCommissionRates: boolean
): Omit<ListingSharePayload, "v" | "k"> {
  const mine = assets.filter((a) => a.project_id === project.id);
  const fromProject = normalizeGalleryUrlsFromProject(project.gallery_urls);
  const fromAssets = mine.filter(isGalleryAssetShare).map((a) => a.file_url);
  const thumb = project.thumbnail_url?.trim();
  const gallerySet = new Set<string>();
  if (thumb) gallerySet.add(thumb);
  for (const u of fromProject) gallerySet.add(u);
  for (const u of fromAssets) gallerySet.add(u);
  const gallery_urls = [...gallerySet].filter((u) => u.startsWith("http://") || u.startsWith("https://")).slice(0, 12);

  const floorDocs = mine.filter(isFloorAssetShare).map((a) => ({ title: a.title, url: a.file_url }));
  const otherDocs = mine
    .filter((a) => !isGalleryAssetShare(a) && !isFloorAssetShare(a))
    .map((a) => ({ title: a.title, url: a.file_url }));
  const public_documents = [...floorDocs, ...otherDocs]
    .filter((d) => d.url.startsWith("http://") || d.url.startsWith("https://"))
    .slice(0, 16);

  return {
    name: project.name,
    developer: project.developer,
    location: project.location,
    description: project.description,
    price_range: project.price_range,
    thumbnail_url: project.thumbnail_url,
    status: project.status,
    external_url: project.external_url,
    city_label: project.precon_cities?.name ?? null,
    property_label: propertyTypeShareLabel(project.property_type),
    commission_percent:
      hideCommissionRates ||
      project.commission_rate_percent == null ||
      Number.isNaN(Number(project.commission_rate_percent))
        ? null
        : Number(project.commission_rate_percent),
    gallery_urls,
    public_documents,
  };
}

function getOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace(/\/$/, "");
}

function utf8ToBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function toBase64Url(obj: unknown): string {
  const s = JSON.stringify(obj);
  const b64 = utf8ToBase64(s);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(t: string): unknown {
  let s = t.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return JSON.parse(base64ToUtf8(s));
}

function trunc(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}

function trimListingPayload(p: ListingSharePayload): ListingSharePayload {
  const desc =
    p.description && p.description.length > MAX_DESC ? `${p.description.slice(0, MAX_DESC - 1)}…` : p.description;
  let gallery_urls = (p.gallery_urls || []).map((u) => trunc(u, MAX_URL_LEN)).slice(0, MAX_GALLERY);
  let public_documents = (p.public_documents || [])
    .map((d) => ({ title: trunc(d.title, 120), url: trunc(d.url, MAX_URL_LEN) }))
    .slice(0, MAX_DOCS);

  let out: ListingSharePayload = { ...p, description: desc, gallery_urls, public_documents };
  for (let i = 0; i < 5; i++) {
    const json = JSON.stringify(out);
    if (json.length <= MAX_PAYLOAD_CHARS) break;
    gallery_urls = gallery_urls.slice(0, Math.max(2, gallery_urls.length - 2));
    public_documents = public_documents.slice(0, Math.max(2, public_documents.length - 2));
    out = { ...out, gallery_urls, public_documents };
  }
  return out;
}

export function encodeShareHash(payload: ContactSharePayload | ListingSharePayload): string {
  if (payload.k === "listing") {
    return toBase64Url(trimListingPayload(payload));
  }
  return toBase64Url(payload);
}

function normalizeListingDocuments(raw: unknown): ListingPublicDocument[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ListingPublicDocument[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.title === "string" && typeof o.url === "string" && (o.url.startsWith("http://") || o.url.startsWith("https://"))) {
      out.push({ title: o.title, url: o.url });
    }
  }
  return out.length ? out : undefined;
}

function normalizeGalleryList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const urls = raw.filter((u): u is string => typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://")));
  return urls.length ? urls : undefined;
}

export function decodeShareHash(hash: string): ContactSharePayload | ListingSharePayload | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw.trim()) return null;
  try {
    const data = fromBase64Url(raw) as Record<string, unknown>;
    if (data?.v !== 1 || (data?.k !== "contact" && data?.k !== "listing")) return null;
    if (data.k === "contact" && typeof data.business_name === "string") {
      return data as ContactSharePayload;
    }
    if (data.k === "listing" && typeof data.name === "string") {
      const gallery_urls = normalizeGalleryList(data.gallery_urls);
      const public_documents = normalizeListingDocuments(data.public_documents);
      return {
        ...(data as ListingSharePayload),
        gallery_urls,
        public_documents,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function buildContactShareUrl(payload: Omit<ContactSharePayload, "v" | "k">): string {
  const full: ContactSharePayload = { v: 1, k: "contact", ...payload };
  return `${getOrigin()}/share/contact#${encodeShareHash(full)}`;
}

export function buildListingShareUrl(payload: Omit<ListingSharePayload, "v" | "k">): string {
  const full: ListingSharePayload = { v: 1, k: "listing", ...payload };
  return `${getOrigin()}/share/listing#${encodeShareHash(full)}`;
}
