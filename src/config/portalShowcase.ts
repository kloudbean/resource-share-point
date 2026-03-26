/**
 * When true (default), the dashboard shows rich demo content + imagery for client review.
 * Set VITE_PORTAL_SHOWCASE=false in .env to use only live Supabase data.
 */
export const PORTAL_SHOWCASE = import.meta.env.VITE_PORTAL_SHOWCASE !== "false";
