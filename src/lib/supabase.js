import { createClient } from "@supabase/supabase-js";

const cleanEnvVar = (val) => {
  if (!val) return val;
  return val.replace(/^["']|["']$/g, "").trim();
};

const supabaseUrl = cleanEnvVar(
  (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_URL) || 
  "https://frkozebieculaklazetj.supabase.co"
);

const supabaseAnonKey = cleanEnvVar(
  (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== "undefined" && process.env && process.env.SUPABASE_ANON_KEY) || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZya296ZWJpZWN1bGFrbGF6ZXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjY3MDMsImV4cCI6MjA5Nzg0MjcwM30.fywyZGuaJVV0w-allEpn0Ru6D4pdrZ8zPzUHNHqUrrU"
);

console.log("[Supabase Lib Client Init] URL:", supabaseUrl);
console.log("[Supabase Lib Client Init] Key Length:", supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log("[Supabase Lib Client Init] Key (first 10/last 10):", supabaseAnonKey ? `${supabaseAnonKey.slice(0, 10)}...${supabaseAnonKey.slice(-10)}` : "undefined");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
