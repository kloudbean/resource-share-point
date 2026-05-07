export type PreconDocSectionId = "project_details" | "pricelist" | "floorplans" | "incentives" | "other";

export type PreconAssetLike = {
  id: string;
  title: string;
  category: string;
  asset_type: string;
  file_url: string;
  file_name: string;
};

export const PRECON_DOC_SECTION_ORDER: { id: PreconDocSectionId; label: string }[] = [
  { id: "project_details", label: "Project details" },
  { id: "pricelist", label: "Pricelist" },
  { id: "floorplans", label: "Floor plans" },
  { id: "incentives", label: "Incentives" },
  { id: "other", label: "Other documents" },
];

function isFloorLike(a: PreconAssetLike): boolean {
  const c = (a.category || "").toLowerCase();
  const title = (a.title || "").toLowerCase();
  return c.includes("floor") || title.includes("floor plan") || a.asset_type === "floor_plan";
}

/** Classify admin-uploaded assets for agent download sections (category + title heuristics). */
export function classifyPreconDocAsset(a: PreconAssetLike): PreconDocSectionId {
  if (isFloorLike(a)) return "floorplans";
  const blob = `${a.category} ${a.title}`.toLowerCase();
  if (/(incentive|bonus|promo|promotion)/i.test(blob)) return "incentives";
  if (/(price|pricelist|pricing|price list)/i.test(blob)) return "pricelist";
  if (/(project|detail|brochure|overview|presentation|kit)/i.test(blob)) return "project_details";
  return "other";
}
