// post.js

const supabaseUrl = 'https://duljhawudstjxibhuenv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ';
const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey);

// Populate machine dropdown — ONLY active machines from db_mesin_b
async function populateMachines() {
  const { data, error } = await supabase
    .from('db_mesin_b')
    .select('id_mesin')
    .eq('status_aktif', true)
    .order('id_mesin', { ascending: true });

  if (error) {
    console.error('Error loading machines:', error);
    return;
  }

  const select = document.getElementById('machine-select');
  select.innerHTML = '<option value="">Pilih Mesin</option>';
  data.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id_mesin;
    opt.textContent = m.id_mesin;
    select.appendChild(opt);
  });
}

// Populate month dropdown
function populateMonths() {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const select = document.getElementById('month-select');
  const current = new Date().getMonth() + 1;
  select.innerHTML = '<option value="">Pilih Bulan</option>';
  months.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = name;
    if (i + 1 === current) opt.selected = true;
    select.appendChild(opt);
  });
}

// Populate year dropdown (±3 years)
function populateYears() {
  const current = new Date().getFullYear();
  const select = document.getElementById('year-select');
  select.innerHTML = '';
  for (let y = current - 3; y <= current + 3; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === current) opt.selected = true;
    select.appendChild(opt);
  }
}

// Clear all day cells
function clearDayCells() {
  document.querySelectorAll('.day-cell').forEach(c => c.textContent = '');
}

// Clear signatures
function clearSignatures() {
  document.getElementById('sig-pelaksana').textContent = '';
  document.getElementById('sig-koordinator').textContent = '';
  document.getElementById('sig-superintendent').textContent = '';
}

// Main data loader
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

  const monthStr = String(month).padStart(2, '0');
  const start = `${year}-${monthStr}-01`;
  const end   = `${year}-${monthStr}-31`;

  const { data: records, error } = await supabase
    .from('pelaksana_b')
    .select('*')
    .eq('nomor_mesin', machine)
    .gte('tanggal', start)
    .lte('tanggal', end)
    .order('tanggal', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    document.getElementById('status-message').textContent = 'Gagal mengambil data';
    return;
  }

  if (!records || records.length === 0) {
    document.getElementById('status-message').textContent = 'Tidak ada data untuk mesin dan periode ini';
    return;
  }

  document.getElementById('status-message').textContent = '';

  // Render symbols
  records.forEach(r => {
    const day = new Date(r.tanggal).getDate();
    let sym = '';
    if (r.kondisi_umum === 'OK') sym = 'Check mark';
    if (r.kondisi_umum === 'NG') sym = 'x';
    if (r.kondisi_umum === 'REPAIR') sym = 'o';

    document.querySelectorAll(`.day-cell[data-day="${day}"]`).forEach(c => {
      c.textContent = sym;
    });
  });

  // Latest record for signatures
  const latest = records[records.length - 1];
  document.getElementById('sig-pelaksana').textContent = latest.nama_pelaksana || '';

  if (latest.status_koordinator === 'Verified') {
    document.getElementById('sig-koordinator').textContent = latest.nama_koordinator || '';
  }
  if (latest.status_final === 'Approved') {
    document.getElementById('sig-superintendent').textContent = latest.nama_superintendent || '';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  populateMachines();
  populateMonths();
  populateYears();

  document.getElementById('machine-select').addEventListener('change', loadData);
  document.getElementById('month-select').addEventListener('change', loadData);
  document.getElementById('year-select').addEventListener('change', loadData);

  // Auto-load on startup with defaults
  setTimeout(loadData, 800);
});
