// ===============================
// SUPABASE CONFIG
// ===============================
const supabaseUrl = 'https://duljhawudstjxibhuenv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ';
const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey);

// ===============================
// FALLBACK MACHINE LIST (WAJIB)
// ===============================
const FALLBACK_MACHINES = [
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
// INIT DROPDOWNS
// ===============================
function initMachineDropdown() {
  const sel = document.getElementById('machine-select');
  sel.innerHTML = '<option value="">-- Select Machine --</option>';

  FALLBACK_MACHINES.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
}

async function overrideMachinesFromDB() {
  const { data, error } = await supabase
    .from('db_mesin_b')
    .select('id_mesin')
    .eq('status_aktif', true)
    .order('id_mesin');

  if (error || !data || data.length === 0) {
    console.warn('Using fallback machine list');
    return;
  }

  const sel = document.getElementById('machine-select');
  sel.innerHTML = '<option value="">-- Select Machine --</option>';

  data.forEach(row => {
    const opt = document.createElement('option');
    opt.value = row.id_mesin;
    opt.textContent = row.id_mesin;
    sel.appendChild(opt);
  });
}

function initMonthDropdown() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const sel = document.getElementById('month-select');
  const now = new Date().getMonth();

  sel.innerHTML = '';
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = m;
    if (i === now) opt.selected = true;
    sel.appendChild(opt);
  });
}

function initYearDropdown() {
  const sel = document.getElementById('year-select');
  const now = new Date().getFullYear();

  sel.innerHTML = '';
  for (let y = now - 3; y <= now + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === now) opt.selected = true;
    sel.appendChild(opt);
  }
}

// ===============================
// CLEAR FUNCTIONS
// ===============================
function clearChecklist() {
  document.querySelectorAll('.day-cell').forEach(c => c.textContent = '');
  document.getElementById('sig-pelaksana').textContent = '';
  document.getElementById('sig-koordinator').textContent = '';
  document.getElementById('sig-superintendent').textContent = '';
}

// ===============================
// LOAD DATA
// ===============================
async function loadChecklist() {
  const mesin = document.getElementById('machine-select').value;
  const bulan = document.getElementById('month-select').value;
  const tahun = document.getElementById('year-select').value;
  const status = document.getElementById('status-message');

  clearChecklist();
  status.textContent = '';

  if (!mesin || !bulan || !tahun) return;

  const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const end   = `${tahun}-${String(bulan).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('pelaksana_b')
    .select('*')
    .eq('nomor_mesin', mesin)
    .gte('tanggal', start)
    .lte('tanggal', end);

  if (error || !data || data.length === 0) {
    status.textContent = 'No data found for selected machine and period';
    return;
  }

  data.forEach(row => {
    const day = new Date(row.tanggal).getDate();
    let symbol = '';

    if (row.kondisi_umum === 'OK') symbol = '✓';
    if (row.kondisi_umum === 'NG') symbol = 'x';
    if (row.kondisi_umum === 'REPAIR') symbol = 'o';

    document
      .querySelectorAll(`.day-cell[data-day="${day}"]`)
      .forEach(c => c.textContent = symbol);
  });

  const last = data[data.length - 1];
  document.getElementById('sig-pelaksana').textContent = last.nama_pelaksana || '';
  if (last.status_koordinator === 'Verified') {
    document.getElementById('sig-koordinator').textContent = last.nama_koordinator || '';
  }
  if (last.status_final === 'Approved') {
    document.getElementById('sig-superintendent').textContent = last.nama_superintendent || '';
  }
}

// ===============================
// DOM READY
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  initMachineDropdown();       // HARD GUARANTEE
  initMonthDropdown();
  initYearDropdown();
  overrideMachinesFromDB();    // OPTIONAL DB OVERRIDE

  document.getElementById('machine-select').addEventListener('change', loadChecklist);
  document.getElementById('month-select').addEventListener('change', loadChecklist);
  document.getElementById('year-select').addEventListener('change', loadChecklist);
});
