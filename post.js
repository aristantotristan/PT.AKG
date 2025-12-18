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

// Load fallback machines first
function loadFallbackMachines() {
  const select = document.getElementById('machine-select');
  select.innerHTML = '<option value="">Pilih Mesin</option>';
  FALLBACK_MACHINES.sort().forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// Try to load from Supabase, replace if successful
async function loadMachinesFromSupabase() {
  const { data, error } = await supabase
    .from('db_mesin_b')
    .select('id_mesin')
    .eq('status_aktif', true)
    .order('id_mesin', { ascending: true });

  if (error) {
    console.warn('Supabase unreachable, using fallback machines:', error);
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

function populateMonthsAndYears() {
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const monthSelect = document.getElementById('month-select');
  const yearSelect = document.getElementById('year-select');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  monthSelect.innerHTML = '<option value="">Pilih Bulan</option>';
  monthNames.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = name;
    if (i + 1 === currentMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  });

  yearSelect.innerHTML = '';
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === currentYear) opt.selected = true;
    yearSelect.appendChild(opt);
  });
}

function clearAll() {
  document.querySelectorAll('.day-cell').forEach(c => c.textContent = '');
  document.getElementById('sig-pelaksana').textContent = '';
  document.getElementById('sig-koordinator').textContent = '';
  document.getElementById('sig-superintendent').textContent = '';
  document.getElementById('status-message').textContent = '';
}

async function loadData() {
  const machine = document.getElementById('machine-select').value;
  const month = document.getElementById('month-select').value;
  const year = document.getElementById('year-select').value;

  if (!machine || !month || !year) {
    clearAll();
    return;
  }

  clearAll();

  const monthStr = String(month).padStart(2, '0');
  const start = `${year}-${monthStr}-01`;
  const end = `${year}-${monthStr}-31`;

  const { data: records, error } = await supabase
    .from('pelaksana_b')
    .select('*')
    .eq('nomor_mesin', machine)
    .gte('tanggal', start)
    .lte('tanggal', end)
    .order('tanggal', { ascending: true });

  if (error) {
    console.error('Error loading data:', error);
    document.getElementById('status-message').textContent = 'Gagal mengambil data dari server';
    return;
  }

  if (!records || records.length === 0) {
    document.getElementById('status-message').textContent = 'Tidak ada data untuk mesin dan periode ini';
    return;
  }

  document.getElementById('status-message').textContent = '';

  records.forEach(r => {
    const day = new Date(r.tanggal).getDate();
    let symbol = '';
    if (r.kondisi_umum === 'OK') symbol = 'Check mark';
    if (r.kondisi_umum === 'NG') symbol = 'x';
    if (r.kondisi_umum === 'REPAIR') symbol = 'o';

    document.querySelectorAll(`.day-cell[data-day="${day}"]`).forEach(c => {
      c.textContent = symbol;
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
  loadFallbackMachines();
  loadMachinesFromSupabase();
  populateMonthsAndYears();

  document.getElementById('machine-select').addEventListener('change', loadData);
  document.getElementById('month-select').addEventListener('change', loadData);
  document.getElementById('year-select').addEventListener('change', loadData);

  setTimeout(loadData, 800);
});
