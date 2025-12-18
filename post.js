/* ===============================
   POST.JS – FINAL VERCEL SAFE
   =============================== */

console.log("post.js loaded");

// ===============================
// 1. IMPORT SUPABASE (V2 - ESM)
// ===============================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ===============================
// 2. SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://duljhawudstjxibhuenv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// 3. ELEMENT SELECTOR (HARUS ADA)
// ===============================
const machineSelect = document.getElementById("machine-select");
const monthSelect   = document.getElementById("month-select");
const yearSelect    = document.getElementById("year-select");
const statusMessage = document.getElementById("status-message");

if (!machineSelect || !monthSelect || !yearSelect) {
  console.error("Selector not found in HTML");
  alert("ERROR: selector missing in HTML");
}

// ===============================
// 4. STATIC MACHINE LIST
// (sesuai permintaan kamu)
// ===============================
const MACHINE_LIST = [
  "LIANXIN 80 T (TOAD)",
  "WIBA 270 T (NEBULA)",
  "WIBA 240 T (SPIDERMAN)",
  "WIBA 210 T (THOR)",
  "WIBA 350 T (IRON MAN)",
  "ARBURG 320 T (STAR LORD)",
  "WIBA 500 T (STEVE ROGERS)",
  "WIBA 500 T (THANOS)",
  "FCS 220 T (BLACKWIDOW)",
  "ENGEL 220 T (DEADPOOL)",
  "ARBURG 200 T (WOLVERINE)",
  "FCS 380 T (LOKI)",
  "ENGEL 380 T (INHUMANS)",
  "ENGEL 380 T (HULK)",
  "NPC 400 T (WANDA)",
  "ENGEL 280 T (DOCTOR STRANGE)",
  "FCS 100 T (ANTMAN)",
  "NPC 160 T (WASP)",
  "NPC 160 T (WONG)",
  "FCS 150 T (ROCKET)",
  "FCS 150 T (MANTIS)",
  "NPC 160 T (SHANGCHI)",
  "NPC 260 T (VISION)",
  "NPC 200 T (MAGNETO)",
  "FCS 100 T (NICK FURY)",
  "FCS 250 T (CYCLOPS)",
  "NPC 260 T (HAWKEYE)",
  "EXTRUDER"
];

// ===============================
// 5. INIT DROPDOWNS
// ===============================
function initSelectors() {
  // Mesin
  machineSelect.innerHTML = `<option value="">-- Select Machine --</option>`;
  MACHINE_LIST.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    machineSelect.appendChild(opt);
  });

  // Bulan
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthSelect.innerHTML = "";
  months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  // Tahun (±5 tahun)
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = "";
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  // Default ke sekarang
  monthSelect.value = new Date().getMonth() + 1;
  yearSelect.value = currentYear;
}

initSelectors();

// ===============================
// 6. EVENT LISTENER
// ===============================
machineSelect.addEventListener("change", loadChecklist);
monthSelect.addEventListener("change", loadChecklist);
yearSelect.addEventListener("change", loadChecklist);

// ===============================
// 7. LOAD CHECKLIST DATA
// ===============================
async function loadChecklist() {
  const machine = machineSelect.value;
  const month   = monthSelect.value;
  const year    = yearSelect.value;

  if (!machine || !month || !year) return;

  statusMessage.textContent = "Loading data...";

  console.log("Request:", { machine, month, year });

  try {
    const { data, error } = await supabase
      .from("pelaksana_b")
      .select("*")
      .eq("nomor_mesin", machine)
      .gte("tanggal", `${year}-${month}-01`)
      .lte("tanggal", `${year}-${month}-31`);

    if (error) throw error;

    console.log("DB result:", data);

    clearChecklist();

    if (!data || data.length === 0) {
      statusMessage.textContent = "No data found.";
      return;
    }

    fillChecklist(data);
    statusMessage.textContent = "";

  } catch (err) {
    console.error(err);
    statusMessage.textContent = "ERROR loading data";
  }
}

// ===============================
// 8. CLEAR TABLE
// ===============================
function clearChecklist() {
  document.querySelectorAll(".day-cell").forEach(td => {
    td.textContent = "";
  });
}

// ===============================
// 9. FILL TABLE (BASIC)
// ===============================
function fillChecklist(rows) {
  rows.forEach(row => {
    const day = new Date(row.tanggal).getDate();
    document
      .querySelectorAll(`.day-cell[data-day="${day}"]`)
      .forEach(td => {
        td.textContent = "√";
      });
  });
}

// ===============================
// 10. AUTO LOAD FIRST TIME
// ===============================
loadChecklist();
