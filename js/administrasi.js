
document.addEventListener("DOMContentLoaded", function () {

    // Mengambil elemen dari halaman HTML
    const tombolJenjang = document.querySelectorAll(
        ".administrasi-tabs button"
    );

    const judulJenjang = document.getElementById(
        "judulJenjang"
    );

    const gambarAdministrasi = document.getElementById(
        "gambarAdministrasi"
    );

    const pesanKosong = document.getElementById(
        "pesanKosong"
    );

    // Lokasi gambar untuk masing-masing jenjang
    // Gambar dapat dimasukkan belakangan.
    const dataAdministrasi = {
        RA: "../images/administrasi/ra.jpg",
        SDIT: "../images/administrasi/sdit.jpg",
        SMP: "../images/administrasi/smp.jpg",
        SMK: "../images/administrasi/smk.jpg"
    };

    // Fungsi untuk mengganti jenjang
    function pilihJenjang(jenjang) {

        // Mengganti tampilan tombol aktif
        tombolJenjang.forEach(function (tombol) {

            tombol.classList.remove("active");

            if (tombol.dataset.jenjang === jenjang) {
                tombol.classList.add("active");
            }

        });

        // Mengganti judul
        judulJenjang.textContent =
            "Administrasi " + jenjang;

        // Menampilkan gambar sesuai jenjang
        const alamatGambar = dataAdministrasi[jenjang];

        gambarAdministrasi.style.display = "none";
        pesanKosong.style.display = "block";

        gambarAdministrasi.onload = function () {
            gambarAdministrasi.style.display = "block";
            pesanKosong.style.display = "none";
        };

        gambarAdministrasi.onerror = function () {
            gambarAdministrasi.style.display = "none";
            pesanKosong.style.display = "block";
        };

        gambarAdministrasi.src = alamatGambar;
    }

    // Memberikan fungsi klik pada setiap tombol
    tombolJenjang.forEach(function (tombol) {

        tombol.addEventListener("click", function () {

            const jenjang = this.dataset.jenjang;

            pilihJenjang(jenjang);

        });

    });

    // Tampilan awal ketika halaman dibuka
    pilihJenjang("RA");

});
