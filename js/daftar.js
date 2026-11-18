// Struktur data pendaftaran PPDB versi 2.
// Penyimpanan masih localStorage untuk tahap prototipe; nanti dipindahkan ke Supabase.
(() => {
  const form = document.getElementById('formPPDB');
  if (!form) return;

  const jenjang = document.getElementById('jenjang');
  const jenisPendaftaran = document.getElementById('jenisPendaftaran');
  const kelasWrapper = document.getElementById('kelasWrapper');
  const kelasTujuan = document.getElementById('kelasTujuan');

  const TAHUN_PENDAFTARAN = '2027';
  const JENJANG_VALID = ['RA', 'SDIT', 'SMP', 'SMK'];
  const kelasPerJenjang = {
    RA: ['Kelas A (usia 4–5 tahun)', 'Kelas B (usia 5–6 tahun)'],
    SDIT: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
    SMP: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
    SMK: ['Kelas 10', 'Kelas 11', 'Kelas 12']
  };

  function bacaPendaftar() {
    try {
      const data = JSON.parse(localStorage.getItem('ppdb') || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Data PPDB tidak dapat dibaca:', error);
      return [];
    }
  }

  function simpanPendaftar(data) {
    localStorage.setItem('ppdb', JSON.stringify(data));
  }

  // Tambahkan ID dan penanda versi pada data lama tanpa menghapus data yang sudah ada.
  function migrasiDataLama() {
    const data = bacaPendaftar();
    let berubah = false;
    data.forEach(siswa => {
      if (!siswa.id) {
        siswa.id = buatId();
        berubah = true;
      }
      if (!siswa.status) {
        siswa.status = 'Menunggu';
        berubah = true;
      }
      if (!siswa.versiData) {
        siswa.versiData = 2;
        berubah = true;
      }
    });
    if (berubah) simpanPendaftar(data);
  }

  function buatId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return `ppdb-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // Nomor dibuat berurutan secara terpisah untuk setiap jenjang.
  // Catatan: penghitung localStorage hanya untuk uji coba satu browser/perangkat.
  // Nomor final multi-perangkat harus dibuat oleh database/server Supabase.
  function buatNomorPendaftaran(kodeJenjang, semuaData) {
    const pola = new RegExp(`^${kodeJenjang}-${TAHUN_PENDAFTARAN}-(\\d+)$`);
    const nomorDariData = semuaData.reduce((maks, siswa) => {
      const cocok = String(siswa.nomor || '').match(pola);
      return cocok ? Math.max(maks, Number(cocok[1])) : maks;
    }, 0);
    const kunciCounter = `ppdbCounter_${kodeJenjang}_${TAHUN_PENDAFTARAN}`;
    const nomorTersimpan = Number(localStorage.getItem(kunciCounter) || 0);
    const nomorBerikutnya = Math.max(nomorDariData, nomorTersimpan) + 1;
    localStorage.setItem(kunciCounter, String(nomorBerikutnya));
    return `${kodeJenjang}-${TAHUN_PENDAFTARAN}-${String(nomorBerikutnya).padStart(4, '0')}`;
  }

  function updateKelas() {
    const perluKelas = jenisPendaftaran.value === 'Pindahan';
    kelasWrapper.classList.toggle('hidden-field', !perluKelas);
    kelasTujuan.required = perluKelas;
    kelasTujuan.innerHTML = '<option value="">Pilih kelas</option>';
    if (perluKelas && jenjang.value) {
      (kelasPerJenjang[jenjang.value] || []).forEach(kelas => {
        const option = document.createElement('option');
        option.value = kelas;
        option.textContent = kelas;
        kelasTujuan.appendChild(option);
      });
    }
  }

  function nilai(namaField) {
    const elemen = form.elements.namedItem(namaField);
    return elemen ? String(elemen.value || '').trim() : '';
  }

  jenjang.addEventListener('change', updateKelas);
  jenisPendaftaran.addEventListener('change', updateKelas);

  const preselected = new URLSearchParams(window.location.search).get('jenjang');
  if (preselected && JENJANG_VALID.includes(preselected.toUpperCase())) {
    jenjang.value = preselected.toUpperCase();
  }
  migrasiDataLama();
  updateKelas();

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const kodeJenjang = nilai('jenjang');
    if (!JENJANG_VALID.includes(kodeJenjang)) {
      alert('Silakan pilih jenjang pendidikan yang tersedia.');
      return;
    }

    const dataLama = bacaPendaftar();
    const nomor = buatNomorPendaftaran(kodeJenjang, dataLama);
    const tanggalDaftar = new Date().toISOString();

    const siswa = {
      id: buatId(),
      versiData: 2,
      nomor,
      tahunAjaran: '2027/2028',
      tanggalDaftar,
      nama: nilai('nama'),
      namaPanggilan: nilai('namaPanggilan'),
      nik: nilai('nik'),
      nisn: nilai('nisn'),
      jenisKelamin: nilai('jenisKelamin'),
      agama: nilai('agama'),
      tempatLahir: nilai('tempatLahir'),
      tanggalLahir: nilai('tanggalLahir'),
      anakKe: nilai('anakKe'),
      jumlahSaudara: nilai('jumlahSaudara'),
      jenisPendaftaran: nilai('jenisPendaftaran'),
      jenjang: kodeJenjang,
      kelasTujuan: nilai('jenisPendaftaran') === 'Pindahan' ? nilai('kelasTujuan') : '',
      alamat: nilai('alamat'),
      asalSekolah: nilai('asalSekolah'),
      ayah: nilai('ayah'),
      pekerjaanAyah: nilai('pekerjaanAyah'),
      pendidikanAyah: nilai('pendidikanAyah'),
      ibu: nilai('ibu'),
      pekerjaanIbu: nilai('pekerjaanIbu'),
      pendidikanIbu: nilai('pendidikanIbu'),
      penghasilanOrangTua: nilai('penghasilanOrangTua'),
      wa: nilai('wa'),
      direkomendasikanOleh: nilai('direkomendasikanOleh'),
      status: 'Menunggu',
      catatanStatus: '',
      riwayatStatus: [{ status: 'Menunggu', waktu: tanggalDaftar }]
    };

    dataLama.push(siswa);
    simpanPendaftar(dataLama);
    localStorage.setItem('nomorTerakhir', nomor); // kompatibilitas dengan halaman lama
    sessionStorage.setItem('ppdbPendaftaranTerakhir', JSON.stringify({
      id: siswa.id,
      nomor: siswa.nomor,
      nama: siswa.nama,
      jenjang: siswa.jenjang
    }));
    window.location.href = 'bukti.html';
  });
})();
