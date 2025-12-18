// post.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase initialization
const supabaseUrl = 'https://duljhawudstjxibhuenv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to populate active machines in dropdown
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
  select.innerHTML = '<option value="">Pilih Mesin</option>'; // Reset
  data.forEach(machine => {
    const option = document.createElement('option');
    option.value = machine.id_mesin;
    option.textContent = machine.id_mesin;
    select.appendChild(option);
  });
}

// Function to populate months (last 12 months including current)
function populateMonths() {
  const select = document.getElementById('month-select');
  select.innerHTML = '<option value="">Pilih Bulan</option>'; // Reset
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthValue = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const option = document.createElement('option');
    option.value = monthValue;
    option.textContent = monthLabel;
    select.appendChild(option);
  }
}

// Function to clear all day cells
function clearDayCells() {
  const cells = document.querySelectorAll('.day-cell');
  cells.forEach(cell => {
    cell.textContent = '';
  });
}

// Function to clear signatures
function clearSignatures() {
  const pelaksanaName = document.querySelector('.sig-pelaksana');
  const koordinatorName = document.querySelector('.sig-koordinator');
  const superintendentName = document.querySelector('.sig-superintendent');

  if (pelaksanaName) pelaksanaName.textContent = 'Nama : ________________________';
  if (koordinatorName) koordinatorName.textContent = 'Nama : ________________________';
  if (superintendentName) superintendentName.textContent = 'Nama : ________________________';
}

// Function to fetch and display data
async function tampilkanData() {
  const machineSelect = document.getElementById('machine-select');
  const monthSelect = document.getElementById('month-select');

  const selectedMachine = machineSelect.value;
  const selectedMonth = monthSelect.value;

  if (!selectedMachine || !selectedMonth) {
    console.warn('Pilih mesin dan bulan terlebih dahulu.');
    return;
  }

  // Clear previous data
  clearDayCells();
  clearSignatures();

  const [year, month] = selectedMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of month

  const { data: records, error } = await supabase
    .from('pelaksana_b')
    .select('*')
    .eq('nomor_mesin', selectedMachine)
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)
    .order('tanggal', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (!records || records.length === 0) {
    console.warn('No data found for the selected machine and month.');
    return;
  }

  // Map symbols to all rows for each day
  records.forEach(record => {
    const day = new Date(record.tanggal).getDate();
    let symbol = '';
    switch (record.kondisi_umum) {
      case 'OK':
        symbol = '√';
        break;
      case 'NG':
        symbol = 'x';
        break;
      case 'REPAIR':
        symbol = 'o';
        break;
      default:
        symbol = '';
    }

    // Inject into all rows' day cells
    const dayCells = document.querySelectorAll(`.day-cell[data-day="${day}"]`);
    dayCells.forEach(cell => {
      cell.textContent = symbol;
    });
  });

  // Use the latest record for signatures
  const latestRecord = records[records.length - 1];

  const pelaksanaName = document.querySelector('.sig-pelaksana');
  const koordinatorName = document.querySelector('.sig-koordinator');
  const superintendentName = document.querySelector('.sig-superintendent');

  if (pelaksanaName) {
    pelaksanaName.textContent = `Nama : ${latestRecord.nama_pelaksana || '________________________'}`;
  }

  if (koordinatorName && latestRecord.status_koordinator === 'Verified') {
    koordinatorName.textContent = `Nama : ${latestRecord.nama_koordinator || '________________________'}`;
  }

  if (superintendentName && latestRecord.status_final === 'Approved') {
    superintendentName.textContent = `Nama : ${latestRecord.nama_superintendent || '________________________'}`;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  populateMachines();
  populateMonths();
  const button = document.getElementById('btnTampilkan');
  if (button) {
    button.addEventListener('click', tampilkanData);
  }
});
