
const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e){

e.preventDefault();

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;
let pesan = document.getElementById("pesanError");

// Username dan Password Admin
const adminUser = "admin";
const adminPass = "PPDB2027";

if(username === adminUser && password === adminPass){

    window.location.href = "dashboard-admin.html";

}else{

    pesan.innerHTML = "Username atau Password salah!";
    pesan.style.color = "red";

}

});