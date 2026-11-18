
function cekHasil(){

let nomor=document.getElementById("nomor").value;

let data=JSON.parse(localStorage.getItem("ppdb")) || [];

let siswa=data.find(item=>item.nomor===nomor);

let hasil=document.getElementById("hasil");

if(!siswa){

hasil.innerHTML="<p>Nomor pendaftaran tidak ditemukan.</p>";

return;

}

if(siswa.status==="Diterima"){

hasil.innerHTML=`<div class="diterima">
<h2>SELAMAT</h2>
<p>${siswa.nama} dinyatakan DITERIMA.</p>
</div>`;

}else if(siswa.status==="Ditolak"){

hasil.innerHTML=`<div class="tidak-diterima">
<h2>MOHON MAAF</h2>
<p>${siswa.nama} belum diterima.</p>
</div>`;

}else{

hasil.innerHTML=`<div class="menunggu">
<h2>SEDANG DIVERIFIKASI</h2>
<p>Data ${siswa.nama} masih diproses.</p>
</div>`;

}

}