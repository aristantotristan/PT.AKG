/*******************************
 * SUPABASE CONFIG
 *******************************/
const SUPABASE_URL = "https://duljhawudstjxibhuenv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/*******************************
 * GLOBAL STATE
 *******************************/
const ACTIVE_MACHINE = "MESIN-001"; // nanti bisa dari query param
const ACTIVE_YEAR = new Date().getFullYear();
const ACTIVE_MONTH = new Date().getMonth() + 1;

/*******************************
 * HELPER: CLEAR TABLE
 *******************************/
function clearChecklist() {
  document.querySelectorAll(".checklist-table tbody tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    for (let i = 6; i < tds.length; i++) {
      tds[i].innerHTML = "";
    }
  });
}

/*******************************
 * HELPER: SYMBOL ISO
 *******************************/
function toSymbol(val) {
  if (val === "OK") return "√";
  if (val === "NG") return "x";
  if (val === "REPAIR") return "o";
  return "";
}

/*******************************
 * CORE: LOAD DATA FROM SUPABASE
 *******************************/
async function loadMonthlyChecklist() {
  const start = `${ACTIVE_YEAR}-${String(ACTIVE_MONTH).padStart(2, "0")}-01`;
  const end = `${ACTIVE_YEAR}-${String(ACTIVE_MONTH).padStart(2, "0")}-31`;

  const { data, error } = await supabase
    .from("pelaksana_b")
    .select("*")
    .eq("nomor_mesin", ACTIVE_MACHINE)
    .gte("tanggal", start)
    .lte("tanggal", end);

  if (error) {
    console.error("FETCH ERROR:", error);
    return;
  }

  clearChecklist();

  data.forEach(row => {
    const day = new Date(row.tanggal).getDate(); // 1-31
    const colIndex = day + 5; // td ke-6 = day 1

    document.querySelectorAll(".checklist-table tbody tr").forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if (!tds[colIndex]) return;

      tds[colIndex].innerHTML = `
        <span title="${row.keterangan_ng || ""}"
              style="font-weight:bold; color:${row.kondisi_umum === "NG" ? "red" : "black"}">
          ${toSymbol(row.kondisi_umum)}
        </span>
      `;
    });

    // === FOOTER SIGNATURE (AMBIL TERAKHIR) ===
    if (row.nama_pelaksana) {
      document.querySelector(".signature-table td:nth-child(1) div:nth-child(3)")
        .innerText = "Name: " + row.nama_pelaksana;
    }

    if (row.status_koordinator === "Verified") {
      document.querySelector(".signature-table td:nth-child(2) div:nth-child(3)")
        .innerText = "Name: " + row.nama_koordinator;
    }

    if (row.status_final === "Approved") {
      document.querySelector(".signature-table td:nth-child(3) div:nth-child(3)")
        .innerText = "Name: " + row.nama_superintendent;
    }
  });
}

/*******************************
 * AUTO LOAD WHEN PAGE READY
 *******************************/
document.addEventListener("DOMContentLoaded", () => {
  loadMonthlyChecklist();
});
