// Fungsi halaman untuk prototipe PPDB. Data masih berada di localStorage browser.
function bacaDataPendaftar() {
  try { return JSON.parse(localStorage.getItem('ppdb') || '[]'); }
  catch (error) { return []; }
}

function loginAdmin() {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;
  const error = document.getElementById('error');
  // Kredensial demo lama dipertahankan sementara; wajib diganti dengan autentikasi server sebelum rilis.
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem('adminLogin', 'true');
    window.location.href = 'admin.html';
  } else if (error) {
    error.textContent = 'Username atau password salah.';
  }
}

function loginSiswa() {
  const nomor = document.getElementById('nomor')?.value.trim();
  const tanggal = document.getElementById('tglLahir')?.value;
  const siswa = bacaDataPendaftar().find(item => item.nomor === nomor && item.tanggalLahir === tanggal);
  const error = document.getElementById('errorSiswa');
  if (siswa) {
    localStorage.setItem('siswaLogin', JSON.stringify(siswa));
    window.location.href = 'siswa.html';
  } else if (error) {
    error.textContent = 'Nomor pendaftaran atau tanggal lahir tidak cocok pada browser ini.';
  }
}

function logoutSiswa() {
  localStorage.removeItem('siswaLogin');
  window.location.href = 'login-siswa.html';
}

function aman(teks) {
  return String(teks ?? '').replace(/[&<>"']/g, karakter => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[karakter]));
}

document.addEventListener('DOMContentLoaded', () => {
  const profil = document.getElementById('profilSiswa');
  if (profil) {
    const login = JSON.parse(localStorage.getItem('siswaLogin') || 'null');
    if (!login) { window.location.href = 'login-siswa.html'; return; }
    const siswa = bacaDataPendaftar().find(item => item.nomor === login.nomor);
    if (!siswa) { localStorage.removeItem('siswaLogin'); window.location.href = 'login-siswa.html'; return; }
    localStorage.setItem('siswaLogin', JSON.stringify(siswa));
    profil.innerHTML = `<p><strong>Nama:</strong> ${aman(siswa.nama)}</p><p><strong>Nomor pendaftaran:</strong> ${aman(siswa.nomor)}</p><p><strong>NISN:</strong> ${aman(siswa.nisn || '-')}</p><p><strong>Jenjang:</strong> ${aman(siswa.jenjang)}</p><p><strong>Asal sekolah:</strong> ${aman(siswa.asalSekolah || '-')}</p>`;
    const status = document.getElementById('statusSiswa');
    if (status) {
      status.textContent = siswa.status || 'Menunggu';
      status.style.color = siswa.status === 'Diterima' ? 'green' : siswa.status === 'Ditolak' ? 'red' : '#b7791f';
    }
  }

  const areaBukti = document.getElementById('buktiSiswa');
  if (areaBukti) {
    const terbaru = JSON.parse(sessionStorage.getItem('ppdbPendaftaranTerakhir') || 'null');
    const login = JSON.parse(localStorage.getItem('siswaLogin') || 'null');
    const semua = bacaDataPendaftar();
    const siswa = (terbaru && semua.find(item => item.nomor === terbaru.nomor)) || (login && semua.find(item => item.nomor === login.nomor));
    if (!siswa) {
      areaBukti.innerHTML = '<p>Bukti pendaftaran belum tersedia pada browser ini. Silakan daftar terlebih dahulu atau masuk sebagai siswa.</p>';
      const status = document.getElementById('statusBukti'); if (status) status.textContent = '-';
      return;
    }
    areaBukti.innerHTML = `<p><b>Nomor pendaftaran:</b> ${aman(siswa.nomor)}</p><p><b>Nama:</b> ${aman(siswa.nama)}</p><p><b>Jenjang:</b> ${aman(siswa.jenjang)}</p><p><b>Jenis pendaftaran:</b> ${aman(siswa.jenisPendaftaran || '-')}</p><p><b>Kelas tujuan:</b> ${aman(siswa.kelasTujuan || (siswa.jenisPendaftaran === 'Siswa baru' ? 'Kelas awal jenjang' : '-'))}</p><p><b>Tanggal pendaftaran:</b> ${aman(siswa.tanggalDaftar ? new Date(siswa.tanggalDaftar).toLocaleString('id-ID') : '-')}</p><p><b>Nomor WhatsApp orang tua:</b> ${aman(siswa.wa)}</p>`;
    const status = document.getElementById('statusBukti'); if (status) status.textContent = siswa.status || 'Menunggu';
  }
});
