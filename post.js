// post.js (FINAL - VERCEL SAFE)

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

console.log("post.js loaded");

const SUPABASE_URL = "https://duljhawudstjxibhuenv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== TEST KONEKSI ======
async function testConnection() {
  const { data, error } = await supabase
    .from("pelaksana_b")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase ERROR:", error);
  } else {
    console.log("Supabase OK:", data);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  testConnection();
});
