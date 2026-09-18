/* ============================================================
   ⚙️ KONFIGURASI - GANTI URL DI BAWAH DENGAN URL APPS SCRIPT ANDA
   ============================================================ */
var URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfyc.../exec";
/* ============================================================ */

/* ========== MENU MOBILE ========== */
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if(menuBtn && navMenu){
  menuBtn.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    if (open) {
      navMenu.style.cssText = "display:flex;position:absolute;top:66px;left:0;right:0;padding:18px 4%;flex-direction:column;background:rgba(255,255,255,.98);border-bottom:1px solid #dce8f7";
    } else {
      navMenu.removeAttribute("style");
    }
  });

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        navMenu.classList.remove("open");
        navMenu.removeAttribute("style");
      }
    });
  });
}

/* ========== SCROLL REVEAL ========== */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
}, {threshold: .12});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

/* ========== NAVBAR SHADOW ========== */
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if(navbar){
    navbar.style.boxShadow = window.scrollY > 10 ? "0 5px 25px rgba(7,88,201,.08)" : "none";
  }
});

/* ========== FORM LOGIC ========== */
var paketTerpilih = "";
var ppnTerpilih = "";

function selectPaket(namaPaket, element){
  var cards = document.querySelectorAll('.paket-card-form');
  for(var i=0;i<cards.length;i++){cards[i].classList.remove('selected');}
  element.classList.add('selected');
  paketTerpilih = namaPaket;

  var priceEl = element.querySelector('.pc-price');
  var match = priceEl.textContent.match(/Rp ([\d.]+)/);
  if(match){
    var harga = parseInt(match[1].replace(/\./g,''));
    var ppn = Math.round(harga * 0.11);
    var total = harga + ppn;
    ppnTerpilih = 'Rp ' + harga.toLocaleString('id-ID') + ' + PPN 11% (Rp ' + ppn.toLocaleString('id-ID') + ') = Rp ' + total.toLocaleString('id-ID') + '/bln';
  }

  document.getElementById('tampil_paket').textContent = namaPaket;
  document.getElementById('tampil_ppn').textContent = ppnTerpilih;
  document.getElementById('errorPaket').classList.remove('show');
}

function goToStep(step){
  if(step === 2 && paketTerpilih === ""){
    document.getElementById('errorPaket').classList.add('show');
    return;
  }

  var steps = document.querySelectorAll('.form-step');
  for(var i=0;i<steps.length;i++){steps[i].classList.remove('active');}
  document.getElementById('formStep' + step).classList.add('active');

  var indicators = document.querySelectorAll('.step');
  for(var i=0;i<indicators.length;i++){
    indicators[i].classList.remove('active','done');
    if(i+1 < step) indicators[i].classList.add('done');
    if(i+1 === step) indicators[i].classList.add('active');
  }
  window.scrollTo({top: document.querySelector('.daftar-section').offsetTop - 80, behavior: 'smooth'});
}

function showStatus(msg, type){
  var el = document.getElementById('statusMsg');
  if(!el) return;
  el.textContent = msg;
  el.className = 'status-msg ' + type;
}

function kirimData(e){
  e.preventDefault();

  if(paketTerpilih === ""){
    document.getElementById('errorPaket').classList.add('show');
    goToStep(1);
    return;
  }

  var btnSubmit = document.getElementById('btnSubmit');
  var btnText = document.getElementById('btnText');
  var spinner = document.getElementById('spinner');

  var data = {
    nama: document.getElementById('nama').value.trim(),
    alamat: document.getElementById('alamat').value.trim(),
    no_rumah: document.getElementById('no_rumah').value.trim(),
    kelurahan: document.getElementById('kelurahan').value.trim(),
    kecamatan: document.getElementById('kecamatan').value.trim(),
    kota: document.getElementById('kota').value.trim(),
    hp1: document.getElementById('hp1').value.trim(),
    hp2: document.getElementById('hp2').value.trim() || '-',
    email: document.getElementById('email').value.trim() || '-',
    paket: paketTerpilih,
    ppn: ppnTerpilih,
    refCode: 'MV-' + Date.now().toString().slice(-8),
    waktu: new Date().toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  };

  var wajib = ['nama','alamat','no_rumah','kelurahan','kecamatan','kota','hp1'];
  for(var i=0;i<wajib.length;i++){
    if(!data[wajib[i]]){
      alert('⚠️ Mohon lengkapi semua data yang wajib diisi.');
      document.getElementById(wajib[i]).focus();
      return;
    }
  }

  btnSubmit.disabled = true;
  btnText.textContent = "Mengirim...";
  spinner.style.display = "inline-block";
  showStatus('📤 Mengirim data ke admin...', 'info');

  fetch(URL_APPS_SCRIPT, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'text/plain;charset=utf-8'}
  })
  .then(function(res){ return res.json(); })
  .then(function(result){
    if(result.success){
      document.getElementById('formStep2').classList.remove('active');
      document.getElementById('formStep3').classList.add('active');
      document.getElementById('successName').textContent = data.nama;
      document.getElementById('refCode').textContent = 'REF: ' + data.refCode;

      var indicators = document.querySelectorAll('.step');
      for(var i=0;i<indicators.length;i++){
        indicators[i].classList.remove('active');
        indicators[i].classList.add('done');
      }
      window.scrollTo({top: document.querySelector('.daftar-section').offsetTop - 80, behavior: 'smooth'});
    } else {
      throw new Error(result.message || 'Gagal kirim');
    }
  })
  .catch(function(err){
    console.error(err);
    showStatus('❌ Gagal: ' + err.message + '. Silakan coba lagi.', 'error');
    btnSubmit.disabled = false;
    btnText.textContent = "🚀 KIRIM PENDAFTARAN";
    spinner.style.display = "none";
  });
}
