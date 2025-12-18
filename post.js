/* ===============================
   SUPABASE CONFIG
================================ */
const SUPABASE_URL = "https://duljhawudstjxibhuenv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* ===============================
   DOM ELEMENTS
================================ */
const machineSelect = document.getElementById("machine-select");
const monthSelect = document.getElementById("month-select");

/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  await loadMachines();
  initMonthSelector();

  machineSelect.addEventListener("change", loadChecklist);
  monthSelect.addEventListener("change", loadChecklist);
});

/* ===============================
   LOAD MACHINE LIST
================================ */
async function loadMachines() {
  const { data, error } = await supabase
    .from("db_mesin_b")
    .select("id_mesin")
    .eq("status_aktif", true)
    .order("id_mesin");

  if (error) {
    console.error("Machine load error:", error);
    return;
  }

  data.forEach(row => {
    const opt = document.createElement("option");
    opt.value = row.id_mesin;
    opt.textContent = row.id_mesin;
    machineSelect.appendChild(opt);
  });
}

/* ===============================
   MONTH DROPDOWN
================================ */
function initMonthSelector() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const now = new Date();
  months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = m;
    if (i === now.getMonth()) opt.selected = true;
    monthSelect.appendChild(opt);
  });
}

/* ===============================
   MAIN LOAD CHECKLIST
================================ */
async function loadChecklist() {
  const mesin = machineSelect.value;
  const bulan = monthSelect.value;
  const tahun = new Date().getFullYear();

  if (!mesin || !bulan) return;

  clearTable();

  const startDate = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
  const endDate = `${tahun}-${String(bulan).padStart(2, "0")}-31`;

  const { data, error } = await supabase
    .from("pelaksana_b")
    .select("*")
    .eq("nomor_mesin", mesin)
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal");

  if (error) {
    console.error("Checklist load error:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.warn("No data for this machine & month");
    return;
  }

  renderChecklist(data);
}

/* ===============================
   CLEAR TABLE CELLS
================================ */
function clearTable() {
  document.querySelectorAll(".day-cell").forEach(td => {
    td.textContent = "";
    td.style.color = "black";
  });
}

/* ===============================
   RENDER DATA TO MATRIX
================================ */
function renderChecklist(rows) {
  rows.forEach(row => {
    const day = new Date(row.tanggal).getDate();

    const symbol = mapStatus(row.kondisi_umum);

    document.querySelectorAll(`.day-cell[data-day="${day}"]`)
      .forEach(cell => {
        cell.textContent = symbol;
        if (symbol === "x") cell.style.color = "red";
      });
  });

  // Ambil data terakhir untuk tanda tangan
  const last = rows[rows.length - 1];
  fillSignatures(last);
}

/* ===============================
   STATUS MAPPING
================================ */
function mapStatus(value) {
  if (!value) return "";
  const v = value.toUpperCase();
  if (v === "OK") return "√";
  if (v === "NG") return "x";
  if (v === "REPAIR") return "o";
  return "";
}

/* ===============================
   SIGNATURE SECTION
================================ */
function fillSignatures(row) {
  if (row.nama_pelaksana) {
    document.getElementById("sig-pelaksana").textContent =
      row.nama_pelaksana;
  }

  if (row.status_koordinator === "Verified") {
    document.getElementById("sig-koordinator").textContent =
      row.nama_koordinator || "";
  }

  if (row.status_final === "Approved") {
    document.getElementById("sig-superintendent").textContent =
      row.nama_superintendent || "";
  }
}
