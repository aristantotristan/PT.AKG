// post.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://duljhawudstjxibhuenv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bGpoYXd1ZHN0anhpYmh1ZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODI2NDksImV4cCI6MjA4MTM1ODY0OX0.R9s6oNlJjF_K89frPmWkXxcOBlO1IJL6nXwxqNV1jiQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ganti sesuai kebutuhan (bisa dibaca dari input mesin nanti)
const NOMOR_MESIN = "MESIN-001";   // ubah sesuai mesin yang dipilih

window.tampilkanData = async function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const startDate = `${year}-${month}-01`;
    const endDate   = `${year}-${month}-31`;

    const { data: records, error } = await supabase
        .from("pelaksana_b")
        .select("tanggal, kondisi_umum, nama_pelaksana, nama_koordinator, nama_superintendent")
        .eq("nomor_mesin", NOMOR_MESIN)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate)
        .order("tanggal", { ascending: true });

    if (error) {
        alert("Gagal mengambil data dari Supabase");
        console.error(error);
        return;
    }

    if (!records || records.length === 0) {
        alert(`Tidak ada data untuk mesin ${NOMOR_MESIN} di bulan ini.`);
        return;
    }

    // Reset semua kolom tanggal
    document.querySelectorAll(".checklist tbody td").forEach(td => {
        if (td.cellIndex >= 6) td.textContent = "";
    });

    // Isi simbol
    records.forEach(rec => {
        const day = new Date(rec.tanggal).getDate();
        const colIndex = 5 + day;

        let simbol = "";
        if (rec.kondisi_umum === "OK")     simbol = "Check mark";
        if (rec.kondisi_umum === "NG")     simbol = "x";
        if (rec.kondisi_umum === "REPAIR") simbol = "o";

        document.querySelectorAll(".checklist tbody tr").forEach(row => {
            const cell = row.cells[colIndex];
            if (cell) {
                cell.textContent = simbol;
                cell.style.fontWeight = "bold";
                cell.style.color = rec.kondisi_umum === "NG" ? "red" : "black";
            }
        });
    });

    // Isi tanda tangan (data terbaru di bulan ini)
    const latest = records[records.length - 1];
    if (latest) {
        const setName = (className, nama) => {
            const el = document.querySelector(`.sig-${className}`);
            if (el) el.textContent = `Nama : ${nama || ""}`;
        };
        setName("pelaksana", latest.nama_pelaksana);
        setName("koordinator", latest.nama_koordinator);
        setName("superintendent", latest.nama_superintendent);
    }

    alert("Data berhasil ditampilkan!");
};
