// post.js
const supabaseUrl = 'https://duljhawudstjxibhuenv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ';
const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey);

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

// Populate machine dropdown with fallback
function populateMachinesFallback() {
  const select = document.getElementById('machine-select');
  select.innerHTML = '<option value="">Pilih Mesin</option>';
  FALLBACK_MACHINES.sort().forEach(machine => {
    const opt = document.createElement('option');
    opt.value = machine;
    opt.textContent = machine;
    select.appendChild(opt);
  });
}

// Override with Supabase data if available
async function loadMachinesFromSupabase() {
  const { data, error } = await supabase
    .from('db_mesin_b')
    .select('id_mesin')
    .eq('status_aktif', true)
    .order('id_mesin', { ascending: true });

  if (error) {
    console.warn('Failed to load machines from Supabase, using fallback:', error);
    return;
  }

  if (data && data.length > 0) {
    const select = document.getElementById('machine-select');
    select.innerHTML = '<option value="">Pilih Mesin</option>';
    data.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id_mesin;
      opt.textContent = m.id_mesin;
      select.appendChild(opt);
    });
  }
}

// Populate month dropdown
function populateMonths() {
  const select = document.getElementById('month-select');
  select.innerHTML = '<option value="">Pilih Bulan</option>';
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  monthNames.forEach((name, index) => {
    const opt = document.createElement('option');
    opt.value = index + 1;
    opt.textContent = name;
    if (index + 1 === new Date().getMonth() + 1) opt.selected = true;
    select.appendChild(opt);
  });
}

// Populate year dropdown
function populateYears() {
  const select = document.getElementById('year-select');
  const currentYear = new Date().getFullYear();
  select.innerHTML = '';
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    select.appendChild(opt);
  });
}

// Clear day cells
function clearDayCells() {
  document.querySelectorAll('.day-cell').forEach(cell => cell.textContent = '');
}

// Clear signatures
function clearSignatures() {
  document.getElementById('sig-pelaksana').textContent = '';
  document.getElementById('sig-koordinator').textContent = '';
  document.getElementById('sig-superintendent').textContent = '';
}

// Load data
async function loadData() {
  const machine = document.getElementById('machine-select').value;
  const month = document.getElementById('month-select').value;
  const year = document.getElementById('year-select').value;

  if (!machine || !month || !year) {
    clearDayCells();
    clearSignatures();
    document.getElementById('status-message').textContent = '';
    return;
  }

  clearDayCells();
  clearSignatures();
  document.getElementById('status-message').textContent = '';

  const monthPadded = String(month).padStart(2, '0');
  const startDate = `${year}-${monthPadded}-01`;
  const endDate = `${year}-${monthPadded}-31`;

  const { data: records, error } = await supabase
    .from('pelaksana_b')
    .select('*')
    .eq('nomor_mesin', machine)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)
    .order('tanggal', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    document.getElementById('status-message').textContent = 'Error loading data';
    return;
  }

  if (!records || records.length === 0) {
    document.getElementById('status-message').textContent = 'No data available for selected machine and period';
    return;
  }

  records.forEach(record => {
    const day = new Date(record.tanggal).getDate();
    let symbol = '';
    if (record.kondisi_umum === 'OK') symbol = '✓';
    if (record.kondisi_umum === 'NG') symbol = 'x';
    if (record.kondisi_umum === 'REPAIR') symbol = 'o';

    document.querySelectorAll(`.day-cell[data-day="${day}"]`).forEach(cell => {
      cell.textContent = symbol;
    });
  });

  const latest = records[records.length - 1];
  document.getElementById('sig-pelaksana').textContent = latest.nama_pelaksana || '';

  if (latest.status_koordinator === 'Verified') {
    document.getElementById('sig-koordinator').textContent = latest.nama_koordinator || '';
  }

  if (latest.status_final === 'Approved') {
    document.getElementById('sig-superintendent').textContent = latest.nama_superintendent || '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateMachinesFallback();
  loadMachinesFromSupabase();
  populateMonths();
  populateYears();

  document.getElementById('machine-select').addEventListener('change', loadData);
  document.getElementById('month-select').addEventListener('change', loadData);
  document.getElementById('year-select').addEventListener('change', loadData);

  loadData();
});
