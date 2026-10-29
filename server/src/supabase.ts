import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

export const RECIPE_PHOTOS_BUCKET = "recipe-photos";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function getSupabaseStorage() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for photo uploads.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(RECIPE_PHOTOS_BUCKET);
}

export function getPhotoUrl(imagePath: string | null): string | null {
  if (!imagePath || !supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/${RECIPE_PHOTOS_BUCKET}/${imagePath}`;
}
