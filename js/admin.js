// Pengelolaan data pada prototipe lokal PPDB.
// Saat Supabase dihubungkan, fungsi baca/simpan akan dipindahkan ke database online.
const tabel = document.getElementById('tabelPendaftar');
let dataPendaftar = [];

function aman(teks) {
  return String(teks ?? '').replace(/[&<>"']/g, karakter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[karakter]));
}

function ambilData() {
  try {
    const data = JSON.parse(localStorage.getItem('ppdb') || '[]');
    dataPendaftar = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Data PPDB tidak dapat dibaca:', error);
    dataPendaftar = [];
  }
}

function simpan() {
  localStorage.setItem('ppdb', JSON.stringify(dataPendaftar));
}

function hitungStatistik(data) {
  const total = data.length;
  const diterima = data.filter(s => s.status === 'Diterima').length;
  const ditolak = data.filter(s => s.status === 'Ditolak').length;
  const menunggu = data.filter(s => !s.status || s.status === 'Menunggu').length;
  document.getElementById('totalSiswa').textContent = total;
  document.getElementById('diterima').textContent = diterima;
  document.getElementById('menunggu').textContent = menunggu;
  document.getElementById('ditolak').textContent = ditolak;
}

function barisSiswa(siswa, index) {
  return `<tr>
    <td>${index + 1}</td>
    <td>${aman(siswa.nomor || '-')}</td>
    <td>${aman(siswa.nama || '-')}</td>
    <td>${aman(siswa.nisn || '-')}</td>
    <td>${aman(siswa.jenjang || '-')}</td>
    <td>${aman(siswa.status || 'Menunggu')}</td>
    <td>
      <button class="btn-detail" onclick="detail(${index})">Detail</button>
      <button class="btn-terima" onclick="terima(${index})">Terima</button>
      <button class="btn-tolak" onclick="tolak(${index})">Tolak</button>
    </td>
  </tr>`;
}

function tampilkanData() {
  ambilData();
  if (!tabel) return;
  hitungStatistik(dataPendaftar);
  tabel.innerHTML = dataPendaftar.map((siswa, index) => barisSiswa(siswa, index)).join('');
}

function ubahStatus(index, statusBaru) {
  ambilData();
  if (!dataPendaftar[index]) return;
  const siswa = dataPendaftar[index];
  siswa.status = statusBaru;
  siswa.catatanStatus = '';
  siswa.riwayatStatus = Array.isArray(siswa.riwayatStatus) ? siswa.riwayatStatus : [];
  siswa.riwayatStatus.push({ status: statusBaru, waktu: new Date().toISOString() });
  siswa.diperbaruiPada = new Date().toISOString();
  simpan();
  tampilkanData();
}

function terima(index) {
  if (!confirm('Terima pendaftaran siswa ini?')) return;
  ubahStatus(index, 'Diterima');
}

function tolak(index) {
  if (!confirm('Tolak pendaftaran siswa ini?')) return;
  ubahStatus(index, 'Ditolak');
}

function detail(index) {
  ambilData();
  const s = dataPendaftar[index];
  if (!s) return;
  const rincian = [
    ['Nomor Pendaftaran', s.nomor], ['Nama Lengkap', s.nama],
    ['Nama Panggilan', s.namaPanggilan], ['NIK', s.nik], ['NISN', s.nisn],
    ['Jenis Kelamin', s.jenisKelamin], ['Agama', s.agama],
    ['Tempat Lahir', s.tempatLahir], ['Tanggal Lahir', s.tanggalLahir],
    ['Anak Ke-', s.anakKe], ['Jumlah Bersaudara', s.jumlahSaudara],
    ['Jenis Pendaftaran', s.jenisPendaftaran], ['Jenjang', s.jenjang],
    ['Kelas Tujuan', s.kelasTujuan], ['Alamat', s.alamat], ['Asal Sekolah', s.asalSekolah],
    ['Nama Ayah/Wali', s.ayah], ['Pekerjaan Ayah/Wali', s.pekerjaanAyah],
    ['Pendidikan Ayah/Wali', s.pendidikanAyah], ['Nama Ibu/Wali', s.ibu],
    ['Pekerjaan Ibu/Wali', s.pekerjaanIbu], ['Pendidikan Ibu/Wali', s.pendidikanIbu],
    ['Penghasilan Orang Tua', s.penghasilanOrangTua], ['Nomor WhatsApp', s.wa],
    ['Direkomendasikan Oleh', s.direkomendasikanOleh], ['Status', s.status || 'Menunggu']
  ];
  document.getElementById('isiDetail').innerHTML = rincian.map(([label, value]) =>
    `<div class="detail-item"><strong>${aman(label)}</strong><br>${aman(value || '-')}</div>`
  ).join('');
  const modal = document.getElementById('modalDetail');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function tutupModal() {
  const modal = document.getElementById('modalDetail');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function filterData() {
  ambilData();
  const keyword = (document.getElementById('cariSiswa')?.value || '').toLowerCase().trim();
  const jenjang = document.getElementById('filterJenjang')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  const hasil = dataPendaftar
    .map((siswa, index) => ({ siswa, index }))
    .filter(({ siswa }) => {
      const cocokKata = [siswa.nomor, siswa.nama, siswa.nisn]
        .some(nilai => String(nilai || '').toLowerCase().includes(keyword));
      const cocokJenjang = !jenjang || siswa.jenjang === jenjang;
      const cocokStatus = !status || (siswa.status || 'Menunggu') === status;
      return cocokKata && cocokJenjang && cocokStatus;
    });
  tabel.innerHTML = hasil.map(({ siswa, index }) => barisSiswa(siswa, index)).join('');
  hitungStatistik(dataPendaftar);
}

// Ekspor CSV sementara dengan susunan kolom tetap. Pada tahap berikutnya akan dibuat .xlsx.
function downloadExcel() {
  ambilData();
  const kolom = [
    ['Nomor Pendaftaran', 'nomor'], ['Tahun Ajaran', 'tahunAjaran'],
    ['Tanggal Daftar', 'tanggalDaftar'], ['Nama Lengkap', 'nama'],
    ['Nama Panggilan', 'namaPanggilan'], ['NIK', 'nik'], ['NISN', 'nisn'],
    ['Jenis Kelamin', 'jenisKelamin'], ['Agama', 'agama'],
    ['Tempat Lahir', 'tempatLahir'], ['Tanggal Lahir', 'tanggalLahir'],
    ['Anak Ke-', 'anakKe'], ['Jumlah Bersaudara', 'jumlahSaudara'],
    ['Jenis Pendaftaran', 'jenisPendaftaran'], ['Jenjang', 'jenjang'],
    ['Kelas Tujuan', 'kelasTujuan'], ['Alamat', 'alamat'], ['Asal Sekolah', 'asalSekolah'],
    ['Nama Ayah/Wali', 'ayah'], ['Pekerjaan Ayah/Wali', 'pekerjaanAyah'],
    ['Pendidikan Ayah/Wali', 'pendidikanAyah'], ['Nama Ibu/Wali', 'ibu'],
    ['Pekerjaan Ibu/Wali', 'pekerjaanIbu'], ['Pendidikan Ibu/Wali', 'pendidikanIbu'],
    ['Penghasilan Orang Tua', 'penghasilanOrangTua'], ['Nomor WhatsApp', 'wa'],
    ['Direkomendasikan Oleh', 'direkomendasikanOleh'], ['Status', 'status']
  ];
  const kutipCSV = nilai => `"${String(nilai ?? '').replace(/"/g, '""')}"`;
  const baris = [
    kolom.map(([judul]) => kutipCSV(judul)).join(';'),
    ...dataPendaftar.map(siswa => kolom.map(([, key]) => kutipCSV(siswa[key])).join(';'))
  ];
  const isi = '\uFEFF' + baris.join('\r\n');
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Rekap_Data_PPDB.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

window.tampilkanData = tampilkanData;
window.filterData = filterData;
window.terima = terima;
window.tolak = tolak;
window.detail = detail;
window.tutupModal = tutupModal;
window.downloadExcel = downloadExcel;

if (tabel) tampilkanData();
window.addEventListener('click', event => {
  const modal = document.getElementById('modalDetail');
  if (modal && event.target === modal) tutupModal();
});
 