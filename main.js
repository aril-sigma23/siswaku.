// Siswaku (versi Firebase): login lewat Firebase Authentication, data di Firestore.
// Isi konfigurasi proyek di file firebase-config.js

// Pilihan kelas: XII-A sampai XII-H, XI-A sampai XI-H, X-A sampai X-H
const DAFTAR_KELAS = [];
['XII', 'XI', 'X'].forEach(tingkat => {
    'ABCDEFGH'.split('').forEach(huruf => DAFTAR_KELAS.push(tingkat + '-' + huruf));
});

// "XII-A" -> "XII" (juga tetap bisa membaca format lama seperti "XII IPA 1")
function tingkatDari(kelas) {
    const m = String(kelas).trim().toUpperCase().match(/^(XII|XI|X)(?![A-Z])/);
    return m ? m[1] : '';
}
// Angkatan otomatis dari tingkat (acuan: kelas XII = angkatan 2026)
function angkatanDari(kelas) {
    const peta = { 'XII': 2026, 'XI': 2027, 'X': 2028 };
    return String(peta[tingkatDari(kelas)] || new Date().getFullYear());
}
function kunciKelas(kelas) { return String(kelas).trim().toUpperCase(); }

// ===================== ORGANISASI & EKSTRAKULIKULER (dropdown berwarna) =====================
const OPSI_ORGANISASI = [
    { nama: 'Pramuka',          warna: '#b45309' },
    { nama: 'OSIS',             warna: '#2563eb' },
    { nama: 'Remaja Masjid',    warna: '#16a34a' },
    { nama: 'Koperasi Siswa',   warna: '#ea580c' },
    { nama: 'Kesehatan',        warna: '#0d9488' },
    { nama: 'Pasukan Pengibar', warna: '#dc2626' }
];
const OPSI_EKSKUL = [
    { nama: 'MA Plus Keterampilan', warna: '#7c3aed' },
    { nama: 'Atletik',              warna: '#0891b2' }
];
const WARNA_LAINNYA = '#64748b'; // untuk nilai lama hasil ketikan yang tidak ada di daftar

// Data lama berupa teks ("OSIS") diubah jadi daftar (["OSIS"])
function normalisasiDaftar(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim()) return [v.trim()];
    return [];
}

// Satu label berbingkai warna
function chipHTML(nama, opsi) {
    const o = opsi.find(x => x.nama === nama);
    const w = o ? o.warna : WARNA_LAINNYA;
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold chip-warna" style="border:2px solid ${w}; background:${w}1a; color:${w}">${esc(nama)}</span>`;
}
function renderChips(idElemen, daftar, opsi) {
    const el = document.getElementById(idElemen);
    const list = daftar || [];
    el.innerHTML = list.length
        ? list.map(n => chipHTML(n, opsi)).join('')
        : '<span class="text-sm font-semibold text-slate-400">-</span>';
}

// Dropdown pilihan ganda: tiap opsi punya bingkai warna sendiri
const pilihanForm = { org: [], ekskul: [] };
const daftarOpsiAktif = { org: [], ekskul: [] };
const DD_CONFIG = {
    org:    { id: 'dd-org',    opsi: OPSI_ORGANISASI, placeholder: 'Pilih organisasi' },
    ekskul: { id: 'dd-ekskul', opsi: OPSI_EKSKUL,     placeholder: 'Pilih ekstrakulikuler' }
};

function renderDropdown(kunci) {
    const cfg = DD_CONFIG[kunci];
    const box = document.getElementById(cfg.id);
    const terpilih = pilihanForm[kunci];
    const tambahan = terpilih.filter(n => !cfg.opsi.some(o => o.nama === n)).map(n => ({ nama: n, warna: WARNA_LAINNYA }));
    const semua = [...cfg.opsi, ...tambahan];
    daftarOpsiAktif[kunci] = semua;
    const buka = box.dataset.buka === '1';

    box.innerHTML = `
        <button type="button" onclick="toggleDropdown('${kunci}')" class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-left min-h-[42px] hover:border-indigo-300 transition">
            <span class="flex flex-wrap gap-1.5">${
                terpilih.length ? terpilih.map(n => chipHTML(n, semua)).join('') : `<span class="text-sm text-slate-400">${cfg.placeholder}</span>`
            }</span>
            <i class="fa-solid fa-chevron-${buka ? 'up' : 'down'} text-xs text-slate-400 shrink-0"></i>
        </button>
        <div class="${buka ? '' : 'hidden'} mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            ${semua.map((o, i) => {
                const aktif = terpilih.includes(o.nama);
                return `<button type="button" onclick="pilihOpsi('${kunci}', ${i})" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition" style="border:2px solid ${o.warna}; background:${aktif ? o.warna : 'var(--chip-bg)'}; color:${aktif ? '#ffffff' : o.warna}">
                    <span>${esc(o.nama)}</span>
                    ${aktif ? '<i class="fa-solid fa-check"></i>' : ''}
                </button>`;
            }).join('')}
        </div>`;
}
function toggleDropdown(kunci) {
    const box = document.getElementById(DD_CONFIG[kunci].id);
    box.dataset.buka = box.dataset.buka === '1' ? '0' : '1';
    renderDropdown(kunci);
}
function pilihOpsi(kunci, idx) {
    const nama = daftarOpsiAktif[kunci][idx].nama;
    const list = pilihanForm[kunci];
    pilihanForm[kunci] = list.includes(nama) ? list.filter(n => n !== nama) : [...list, nama];
    renderDropdown(kunci);
}

// Amankan teks ketikan user sebelum dimasukkan ke HTML
function esc(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function tglSekarang() {
    return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function tglIndo(iso) {
    if (!iso) return '-';
    return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Isi <select> dengan pilihan kelas
function isiPilihanKelas(idSelect, nilai) {
    const sel = document.getElementById(idSelect);
    let html = '<option value="">Pilih kelas</option>';
    ['XII', 'XI', 'X'].forEach(t => {
        html += `<optgroup label="Kelas ${t}">`;
        DAFTAR_KELAS.filter(k => k.startsWith(t + '-')).forEach(k => {
            html += `<option value="${k}">${k}</option>`;
        });
        html += '</optgroup>';
    });
    // Kelas format lama (hasil ketikan) tetap ditampilkan supaya tidak hilang
    if (nilai && !DAFTAR_KELAS.includes(nilai)) {
        html += `<option value="${nilai}">${nilai} (format lama)</option>`;
    }
    sel.innerHTML = html;
    sel.value = nilai || '';
}

let mainStudent = null; // data siswa dari akun yang sedang login

// ===================== FIREBASE =====================
const CONFIG_BELUM_DIISI = (typeof firebaseConfig === 'undefined') || !firebaseConfig.apiKey || String(firebaseConfig.apiKey).startsWith('ISI_');
let auth = null;
let db = null;
let FieldValue = null;
if (!CONFIG_BELUM_DIISI) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    FieldValue = firebase.firestore.FieldValue;
}

// Login memakai username, jadi di belakang layar diubah jadi email palsu
const DOMAIN_EMAIL = '@siswaku.app';
function usernameKeEmail(username) { return username + DOMAIN_EMAIL; }

let uidAktif = null;      // id akun Firebase yang sedang login
let sedangDaftar = false; // mencegah proses ganda saat akun baru dibuat
let cacheSiswa = [];      // data siswa lain, dimuat untuk ranking dan jelajah portofolio

function pesanError(e) {
    switch (e && e.code) {
        case 'auth/email-already-in-use': return 'Username sudah dipakai. Coba username lain.';
        case 'auth/weak-password': return 'Password minimal 6 karakter.';
        case 'auth/invalid-email': return 'Username tidak valid. Coba username lain.';
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
        case 'auth/wrong-password':
        case 'auth/user-not-found': return 'Username atau password salah.';
        case 'auth/too-many-requests': return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
        case 'auth/network-request-failed': return 'Tidak ada koneksi internet.';
        case 'auth/operation-not-allowed': return 'Login Email/Password belum diaktifkan di Firebase Authentication.';
        case 'ukuran-besar': return 'Data terlalu besar. Hapus beberapa foto prestasi lama atau pilih foto yang lebih kecil.';
        case 'permission-denied': return 'Akses ditolak oleh aturan Firestore. Cek tab Rules.';
        default: return 'Terjadi kesalahan' + (e && e.code ? ' (' + e.code + ')' : '') + '.';
    }
}

function setAuthBusy(sibuk) {
    document.querySelectorAll('#form-login button[type="submit"], #form-daftar button[type="submit"]').forEach(b => {
        b.disabled = sibuk;
        b.classList.toggle('opacity-60', sibuk);
    });
}

function firebaseSiap() {
    if (CONFIG_BELUM_DIISI) {
        tampilkanErrorAuth('Firebase belum disambungkan. Isi dulu file firebase-config.js.');
        return false;
    }
    return true;
}

const bersih = obj => JSON.parse(JSON.stringify(obj)); // buang nilai undefined

// Dipakai SEKALI saat daftar: membuat dokumen siswa baru
async function buatDokumenSiswa() {
    const { dispen, laporan, pembelian, notes, ...publik } = mainStudent;
    const ref = db.collection('siswa').doc(uidAktif);
    await ref.set(bersih(publik));
    await ref.collection('privat').doc('data').set(bersih({ pembelian, notes: notes || '' }));
}

// Dipakai setiap ada perubahan: HANYA menulis field milik siswa.
// Koin, nilai, dan skor pelanggaran sengaja tidak ditulis di sini karena hanya guru yang boleh mengubahnya.
async function tulisStudent() {
    if (!uidAktif || !mainStudent) return;
    const dataPublik = bersih({
        name: mainStudent.name,
        nis: mainStudent.nis,
        grade: mainStudent.grade,
        angkatan: mainStudent.angkatan,
        avatarUrl: mainStudent.avatarUrl,
        extracurricular: mainStudent.extracurricular,
        organization: mainStudent.organization,
        achievements: mainStudent.achievements
    });
    // Batas ukuran dokumen Firestore sekitar 1 MB
    if (JSON.stringify(dataPublik).length > 900000) {
        const err = new Error('ukuran');
        err.code = 'ukuran-besar';
        throw err;
    }
    const ref = db.collection('siswa').doc(uidAktif);
    await ref.update(dataPublik);
    await ref.collection('privat').doc('data').set(bersih({ pembelian: mainStudent.pembelian, notes: mainStudent.notes || '' }));
}

// Dipanggil setiap ada perubahan data (tidak perlu ditunggu)
async function simpanStudent() {
    try {
        await tulisStudent();
    } catch (e) {
        console.error(e);
        showNotification('Gagal menyimpan ke server: ' + pesanError(e), false);
    }
}

// Pantau koin, nilai, dan skor pelanggaran milik sendiri (diubah guru, tampil langsung)
let lepasPantau = null;
function pantauDataSaya(uid) {
    if (lepasPantau) lepasPantau();
    lepasPantau = db.collection('siswa').doc(uid).onSnapshot(snap => {
        if (!snap.exists || !mainStudent) return;
        const d = snap.data();
        const koinLama = mainStudent.coins;
        mainStudent.coins = Number(d.coins) || 0;
        mainStudent.score = d.score ?? 80;
        mainStudent.violationScore = Number(d.violationScore) || 0;
        perbaruiAngkaSaya();
        const selisih = mainStudent.coins - koinLama;
        if (selisih > 0) showNotification('Koinmu bertambah ' + selisih + ' dari guru.');
    }, err => console.error(err));
}
function perbaruiAngkaSaya() {
    document.getElementById('card-coins').textContent = mainStudent.coins + " Koin";
    document.getElementById('card-violation').textContent = mainStudent.violationScore + " Skor Pelanggaran";
    document.getElementById('toko-saldo').textContent = mainStudent.coins + " Koin";
}

// Muat data semua siswa untuk ranking dan jelajah portofolio
async function muatSemuaSiswa() {
    try {
        const snap = await db.collection('siswa').get();
        cacheSiswa = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (e) {
        console.error(e);
        showNotification('Gagal memuat data siswa lain: ' + pesanError(e), false);
    }
}

function buatAvatar(nama) {
    const inisial = nama.split(' ').filter(Boolean).slice(0, 2).map(k => k[0].toUpperCase()).join('') || 'S';
    return 'https://placehold.co/120x120/6366f1/ffffff?text=' + encodeURIComponent(inisial);
}

// Data awal untuk akun baru
function buatSiswaBaru({ nama, kelas, nis, angkatan }) {
    return {
        id: 's_' + Date.now(),
        name: nama,
        nis: nis,
        grade: kelas,
        angkatan: angkatan,
        coins: 0,
        violationScore: 0,
        extracurricular: [],
        organization: [],
        avatarUrl: buatAvatar(nama),
        score: 80, // skor awal (nilai sementara, normalnya diisi sekolah)
        achievements: [],
        dispen: [],
        laporan: [],
        pembelian: [],
        notes: ''
    };
}

// ===================== DAFTAR / LOGIN / LOGOUT =====================
function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('form-login').classList.toggle('hidden', !isLogin);
    document.getElementById('form-daftar').classList.toggle('hidden', isLogin);
    document.getElementById('tab-login').className = isLogin
        ? "flex-1 py-2 text-xs font-bold rounded-xl transition bg-white text-indigo-600 shadow-2xs"
        : "flex-1 py-2 text-xs font-bold rounded-xl transition text-slate-500 hover:text-slate-800";
    document.getElementById('tab-daftar').className = !isLogin
        ? "flex-1 py-2 text-xs font-bold rounded-xl transition bg-white text-indigo-600 shadow-2xs"
        : "flex-1 py-2 text-xs font-bold rounded-xl transition text-slate-500 hover:text-slate-800";
    document.getElementById('auth-error').textContent = '';
}

function tampilkanErrorAuth(pesan) {
    document.getElementById('auth-error').textContent = pesan;
}

async function handleDaftar(e) {
    e.preventDefault();
    if (!firebaseSiap()) return;
    const form = e.target;
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const nama = document.getElementById('reg-nama').value.trim();
    const kelas = document.getElementById('reg-kelas').value.trim();
    const nis = document.getElementById('reg-nis').value.trim();

    if (!kelas) return tampilkanErrorAuth('Pilih kelas dulu.');
    if (username.length < 3) return tampilkanErrorAuth('Username minimal 3 karakter.');
    if (!/^[a-z0-9_.]+$/.test(username)) return tampilkanErrorAuth('Username hanya boleh huruf, angka, titik, dan garis bawah (tanpa spasi).');
    if (password.length < 6) return tampilkanErrorAuth('Password minimal 6 karakter.');

    setAuthBusy(true);
    sedangDaftar = true;
    let cred = null;
    let berhasil = false;
    try {
        cred = await auth.createUserWithEmailAndPassword(usernameKeEmail(username), password);
        uidAktif = cred.user.uid;
        mainStudent = buatSiswaBaru({ nama, kelas, nis, angkatan: angkatanDari(kelas) });
        mainStudent.id = uidAktif;
        mainStudent.username = username;
        await buatDokumenSiswa();
        berhasil = true;
    } catch (err) {
        console.error(err);
        // Kalau akun terbentuk tapi datanya gagal tersimpan, batalkan supaya username tidak "nyangkut"
        if (cred) { try { await cred.user.delete(); } catch (x) { console.error(x); } }
        uidAktif = null;
        mainStudent = null;
        tampilkanErrorAuth(pesanError(err));
    }
    sedangDaftar = false;
    if (berhasil) {
        form.reset();
        if (await mulaiSesi(uidAktif)) showNotification('Akun berhasil dibuat. Selamat datang!');
    }
    setAuthBusy(false);
}

async function handleLogin(e) {
    e.preventDefault();
    if (!firebaseSiap()) return;
    const form = e.target;
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    if (!username || !password) return tampilkanErrorAuth('Isi username dan password.');

    setAuthBusy(true);
    try {
        const cred = await auth.signInWithEmailAndPassword(usernameKeEmail(username), password);
        form.reset();
        if (await mulaiSesi(cred.user.uid)) showNotification('Berhasil masuk. Halo, ' + namaPengguna() + '!');
    } catch (err) {
        console.error(err);
        tampilkanErrorAuth(pesanError(err));
    }
    setAuthBusy(false);
}

let adalahGuru = false;
let namaGuru = '';
function namaPengguna() { return adalahGuru ? namaGuru : (mainStudent ? mainStudent.name : ''); }

// Muat data akun dari Firestore lalu tampilkan aplikasi (halaman guru atau siswa)
async function mulaiSesi(uid) {
    // 1. Apakah akun ini guru? (penanda dibuat manual di koleksi "guru")
    let guruDoc = null;
    try {
        guruDoc = await db.collection('guru').doc(uid).get();
    } catch (err) {
        console.error(err); // aturan belum terpasang -> anggap bukan guru
    }
    if (guruDoc && guruDoc.exists) {
        uidAktif = uid;
        adalahGuru = true;
        namaGuru = (guruDoc.data().nama) || 'Guru';
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('auth-error').textContent = '';
        document.getElementById('guru-nama').textContent = namaGuru;
        document.getElementById('guru-page').classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        await muatDataGuru();
        return true;
    }

    // 2. Akun siswa
    try {
        const ref = db.collection('siswa').doc(uid);
        const [pub, priv] = await Promise.all([ref.get(), ref.collection('privat').doc('data').get()]);
        if (!pub.exists) {
            await auth.signOut();
            tampilkanErrorAuth('Data akun tidak ditemukan. Coba daftar dengan username lain.');
            return false;
        }
        adalahGuru = false;
        uidAktif = uid;
        mainStudent = { ...pub.data(), ...(priv.exists ? priv.data() : {}) };
        mainStudent.id = uid;
        lengkapiData(mainStudent);
    } catch (err) {
        console.error(err);
        tampilkanErrorAuth(pesanError(err));
        return false;
    }
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-error').textContent = '';
    updateUI();
    pantauDataSaya(uid);
    return true;
}

// Pastikan semua field baru ada (untuk akun yang dibuat sebelum fitur ini)
function lengkapiData(s) {
    s.organization = normalisasiDaftar(s.organization);
    s.extracurricular = normalisasiDaftar(s.extracurricular);
    s.achievements = s.achievements || [];
    s.dispen = s.dispen || [];
    s.laporan = s.laporan || [];
    s.pembelian = s.pembelian || [];
    s.coins = Number(s.coins) || 0;
}

async function logout() {
    if (lepasPantau) { lepasPantau(); lepasPantau = null; }
    try { if (auth) await auth.signOut(); } catch (err) { console.error(err); }
    uidAktif = null;
    mainStudent = null;
    adalahGuru = false;
    cacheSiswa = [];
    targetLaporPrestasi = null;
    sudahDilaporkan.clear();
    if (resolverKonfirmasi) jawabKonfirmasi(false);
    ['profile-modal', 'add-achievement-modal', 'view-achievement-modal', 'ranking-modal',
     'public-portfolio-modal', 'explore-modal', 'feature-modal', 'feedback-modal', 'settings-modal',
     'dispen-modal', 'laporan-modal', 'toko-modal', 'riwayat-modal', 'kelola-modal', 'foto-modal', 'lapor-prestasi-modal', 'guru-page']
        .forEach(id => document.getElementById(id).classList.add('hidden'));
    document.body.classList.remove('overflow-hidden');
    switchAuthTab('login');
    document.getElementById('auth-modal').classList.remove('hidden');
}

        // Siswa lain: semua akun di Firestore (selain yang sedang login), dimuat lewat muatSemuaSiswa()
        function daftarSiswaLain() {
            return cacheSiswa
                .filter(s => s.id !== uidAktif)
                .map(s => ({
                    id: s.id,
                    name: s.name || '-',
                    nis: s.nis,
                    grade: s.grade || '',
                    angkatan: s.angkatan,
                    score: s.score ?? 80,
                    coins: s.coins || 0,
                    avatarUrl: s.avatarUrl || buatAvatar(s.name || 'S'),
                    extracurricular: normalisasiDaftar(s.extracurricular),
                    organization: normalisasiDaftar(s.organization),
                    achievements: s.achievements || []
                }));
        }

        // Hitung ranking otomatis dari skor (angkatan & per kelas)
        // Ranking SEMENTARA berdasarkan koin (untuk demo). Untuk memakai nilai, ganti ke 'nilai'.
        const DASAR_RANKING = 'koin';
        function urutanRanking(a, b) {
            const koin = (b.coins || 0) - (a.coins || 0);
            const nilai = (b.score ?? 80) - (a.score ?? 80);
            return DASAR_RANKING === 'koin' ? (koin || nilai) : (nilai || koin);
        }
        function hitungRank(list) {
            const urut = [...list].sort(urutanRanking);
            const hitungKelas = {};
            const hitungTingkat = {};
            urut.forEach(s => {
                const tk = tingkatDari(s.grade);
                hitungTingkat[tk] = (hitungTingkat[tk] || 0) + 1;
                s.rankAngkatan = hitungTingkat[tk]; // dibandingkan dengan sesama tingkat (XII dengan XII)

                const kk = kunciKelas(s.grade);
                hitungKelas[kk] = (hitungKelas[kk] || 0) + 1;
                s.rankKelas = hitungKelas[kk]; // dibandingkan dengan sesama kelas
            });
            return list;
        }

        // Semua siswa + diri sendiri, lengkap dengan ranking
        function daftarSiswaLengkap() {
            const diriSendiri = {
                id: mainStudent.id,
                name: mainStudent.name + " (Kamu)",
                nis: mainStudent.nis,
                grade: mainStudent.grade,
                score: mainStudent.score ?? 80,
                coins: mainStudent.coins,
                avatarUrl: mainStudent.avatarUrl,
                isSelf: true
            };
            return hitungRank([...daftarSiswaLain(), diriSendiri]);
        }

        // Hamburger Menu Drawer Controller
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const drawerMenu = document.getElementById('drawer-menu');
        const drawerBackdrop = document.getElementById('drawer-backdrop');
        const closeDrawerBtn = document.getElementById('close-drawer');

        function openDrawer() {
            drawerBackdrop.classList.remove('hidden');
            setTimeout(() => {
                drawerBackdrop.classList.remove('opacity-0');
                drawerMenu.classList.remove('translate-x-full');
            }, 10);
        }
        function closeDrawer() {
            drawerBackdrop.classList.add('opacity-0');
            drawerMenu.classList.add('translate-x-full');
            setTimeout(() => drawerBackdrop.classList.add('hidden'), 300);
        }

        hamburgerBtn.addEventListener('click', openDrawer);
        closeDrawerBtn.addEventListener('click', closeDrawer);
        drawerBackdrop.addEventListener('click', closeDrawer);

        // Toast Notification System
        function showNotification(message, isSuccess = true) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-message').textContent = message;
            document.getElementById('toast-icon').className = isSuccess ? "fa-solid fa-circle-check text-emerald-400" : "fa-solid fa-circle-exclamation text-rose-400";
            toast.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3200);
        }

        // Render Portfolio UI
        function updateUI() {
            document.getElementById('nav-username').textContent = mainStudent.name;
            document.getElementById('card-name').textContent = mainStudent.name;
            document.getElementById('card-nis').textContent = mainStudent.nis;
            document.getElementById('card-grade').textContent = mainStudent.grade;
            document.getElementById('card-angkatan').textContent = mainStudent.angkatan;
            document.getElementById('card-coins').textContent = mainStudent.coins + " Koin";
            document.getElementById('card-violation').textContent = mainStudent.violationScore + " Skor Pelanggaran";
            renderChips('card-extracurricular', mainStudent.extracurricular, OPSI_EKSKUL);
            renderChips('card-organization', mainStudent.organization, OPSI_ORGANISASI);
            document.getElementById('card-avatar').src = mainStudent.avatarUrl;
            document.getElementById('nav-avatar').src = mainStudent.avatarUrl;
            document.getElementById('nav-info').textContent = mainStudent.grade + " • Angkatan " + mainStudent.angkatan;
            document.getElementById('tab-rank-kelas').textContent = "Rank Kelas (" + mainStudent.grade + ")";
            document.getElementById('tab-rank-angkatan').textContent = "Rank Angkatan (Seluruh " + (tingkatDari(mainStudent.grade) || '-') + ")";
            document.getElementById('reminder-notes').value = mainStudent.notes || "";

            renderAchievements();
        }

        // Render Prestasi (Dynamic Grid layout based on count)
        function renderAchievements() {
            const grid = document.getElementById('achievement-grid');
            grid.innerHTML = '';

            if (mainStudent.achievements.length === 0) {
                grid.innerHTML = `<div class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl w-full border border-slate-100">Belum ada prestasi terdaftar. Klik 'Tambah Prestasi' untuk menambahkan.</div>`;
                return;
            }

            mainStudent.achievements.forEach((ach) => {
                let cardStyle = "default-card";
                let badgeStyle = "bg-slate-100 text-slate-700";
                let icon = "fa-trophy text-slate-400";

                if (ach.rank === "Juara 1") {
                    cardStyle = "gold-card shadow-sm";
                    badgeStyle = "bg-amber-500 text-white";
                    icon = "fa-trophy text-amber-500";
                } else if (ach.rank === "Juara 2") {
                    cardStyle = "silver-card shadow-xs";
                    badgeStyle = "bg-slate-400 text-white";
                    icon = "fa-medal text-slate-400";
                } else if (ach.rank === "Juara 3") {
                    cardStyle = "bronze-card shadow-xs";
                    badgeStyle = "bg-orange-500 text-white";
                    icon = "fa-award text-orange-500";
                }

                const cardHTML = `
                    <div onclick="viewAchievementDetail('${ach.id}')" class="${cardStyle} border rounded-2xl p-3.5 cursor-pointer hover:shadow-md transition flex-1 min-w-[220px] max-w-[280px]">
                        <div class="flex items-center justify-between mb-2">
                            <i class="fa-solid ${icon} text-base"></i>
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${badgeStyle}">${esc(ach.rank)}</span>
                        </div>
                        <h4 class="text-xs font-bold text-slate-800 line-clamp-2 mb-1">${esc(ach.title)}</h4>
                        <p class="text-[10px] text-slate-500">${esc(ach.date)} • Klik detail${punyaBukti(ach) ? '' : ' • <span class="text-rose-500 font-semibold">Belum ada bukti</span>'}</p>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });
        }

        // Modal Handlers: Profile Update
        function openProfileModal() {
            document.getElementById('input-name').value = mainStudent.name;
            fotoProfilBaru = null;
            document.getElementById('input-avatar-file').value = '';
            tampilPreview('preview-avatar', mainStudent.avatarUrl || buatAvatar(mainStudent.name));
            isiPilihanKelas('input-grade', mainStudent.grade);
            document.getElementById('input-angkatan').value = angkatanDari(mainStudent.grade);
            document.getElementById('input-coins-disabled').value = mainStudent.coins + " Koin";
            pilihanForm.ekskul = [...mainStudent.extracurricular];
            pilihanForm.org = [...mainStudent.organization];
            document.getElementById('dd-ekskul').dataset.buka = '0';
            document.getElementById('dd-org').dataset.buka = '0';
            renderDropdown('ekskul');
            renderDropdown('org');
            document.getElementById('profile-modal').classList.remove('hidden');
        }
        function closeProfileModal() { document.getElementById('profile-modal').classList.add('hidden'); }
        function handleProfileUpdate(e) {
            e.preventDefault();
            mainStudent.name = document.getElementById('input-name').value;
            mainStudent.avatarUrl = fotoProfilBaru || mainStudent.avatarUrl || buatAvatar(mainStudent.name);
            mainStudent.grade = document.getElementById('input-grade').value;
            mainStudent.angkatan = angkatanDari(mainStudent.grade);
            mainStudent.extracurricular = [...pilihanForm.ekskul];
            mainStudent.organization = [...pilihanForm.org];
            simpanStudent(); // simpan ke JSON
            updateUI();
            closeProfileModal();
            showNotification("Portfolio berhasil diperbarui!");
        }

        // Modal Handlers: Add Achievement
        let achEditId = null;   // id prestasi yang sedang diedit (null = tambah baru)
        let achLihatId = null;  // id prestasi yang sedang dilihat detailnya

        function openAddAchievementModal() {
            achEditId = null;
            fotoPrestasiBaru = null;
            sembunyiPreview('preview-ach');
            document.querySelector('#add-achievement-modal form').reset();
            document.getElementById('ach-modal-title').textContent = 'Tambah Prestasi Baru';
            document.getElementById('ach-submit-btn').textContent = 'Simpan Prestasi';
            document.getElementById('add-achievement-modal').classList.remove('hidden');
        }
        function editAchievement() {
            const ach = mainStudent.achievements.find(a => a.id === achLihatId);
            if (!ach) return;
            achEditId = ach.id;
            document.getElementById('input-ach-title').value = ach.title;
            document.getElementById('input-ach-rank').value = ach.rank;
            document.getElementById('input-ach-date').value = ach.date;
            document.getElementById('input-ach-team').value = ach.team === 'Individu' ? '' : ach.team;
            fotoPrestasiBaru = null;
            document.getElementById('input-ach-photo-file').value = '';
            if (ach.photo) tampilPreview('preview-ach', ach.photo);
            document.getElementById('ach-modal-title').textContent = 'Edit Prestasi';
            document.getElementById('ach-submit-btn').textContent = 'Simpan Perubahan';
            closeViewAchievementModal();
            document.getElementById('add-achievement-modal').classList.remove('hidden');
        }
        async function hapusPrestasi() {
            const ach = mainStudent.achievements.find(a => a.id === achLihatId);
            if (!ach) return;
            if (!(await konfirmasi('Prestasi "' + ach.title + '" akan dihapus dari portofoliomu.', { judul: 'Hapus prestasi?', tombolYa: 'Hapus' }))) return;
            mainStudent.achievements = mainStudent.achievements.filter(a => a.id !== achLihatId);
            simpanStudent();
            renderAchievements();
            closeViewAchievementModal();
            showNotification('Prestasi dihapus.');
        }
        function closeAddAchievementModal() { document.getElementById('add-achievement-modal').classList.add('hidden'); }
        function handleSaveAchievement(e) {
            e.preventDefault();
            const title = document.getElementById('input-ach-title').value.trim();
            const rank = document.getElementById('input-ach-rank').value;
            const date = document.getElementById('input-ach-date').value.trim();
            const team = document.getElementById('input-ach-team').value.trim() || "Individu";
            const fotoLama = achEditId ? (mainStudent.achievements.find(a => a.id === achEditId) || {}).photo : null;
            const photo = fotoPrestasiBaru || fotoLama || "https://placehold.co/500x300/6366f1/ffffff?text=Bukti+Prestasi";

            if (achEditId) {
                const ach = mainStudent.achievements.find(a => a.id === achEditId);
                if (ach) Object.assign(ach, { title, rank, date, team, photo });
                showNotification("Prestasi berhasil diperbarui!");
            } else {
                mainStudent.achievements.push({ id: 'ach_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), title, rank, date, team, photo });
                showNotification("Prestasi baru berhasil ditambahkan!");
            }
            achEditId = null;
            fotoPrestasiBaru = null;

            simpanStudent(); // simpan ke JSON
            renderAchievements();
            e.target.reset();
            closeAddAchievementModal();
        }

        // Modal Handlers: View Achievement Detail
        function viewAchievementDetail(id) {
            const ach = mainStudent.achievements.find(a => a.id === id);
            if (!ach) return;
            achLihatId = id;
            document.getElementById('view-ach-img').src = ach.photo;
            document.getElementById('view-ach-title').textContent = ach.title;
            document.getElementById('view-ach-badge').textContent = ach.rank;
            document.getElementById('view-ach-date').textContent = "Tahun: " + ach.date;
            document.getElementById('view-ach-team').textContent = ach.team;
            document.getElementById('view-achievement-modal').classList.remove('hidden');
        }
        function closeViewAchievementModal() { document.getElementById('view-achievement-modal').classList.add('hidden'); }

        // Ranking Controller (Rank Kelas & Rank Angkatan)
        let currentRankTab = 'kelas';

        async function openRankingModal() {
            document.getElementById('ranking-modal').classList.remove('hidden');
            document.getElementById('ranking-list').innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Memuat data...</p>';
            await muatSemuaSiswa();
            switchRankTab('kelas');
        }
        function closeRankingModal() { document.getElementById('ranking-modal').classList.add('hidden'); }

        function switchRankTab(tab) {
            currentRankTab = tab;
            const btnKelas = document.getElementById('tab-rank-kelas');
            const btnAngkatan = document.getElementById('tab-rank-angkatan');

            if (tab === 'kelas') {
                btnKelas.className = "flex-1 py-2 text-xs font-bold rounded-xl transition bg-white text-indigo-600 shadow-2xs";
                btnAngkatan.className = "flex-1 py-2 text-xs font-bold rounded-xl transition text-slate-500 hover:text-slate-800";
            } else {
                btnAngkatan.className = "flex-1 py-2 text-xs font-bold rounded-xl transition bg-white text-indigo-600 shadow-2xs";
                btnKelas.className = "flex-1 py-2 text-xs font-bold rounded-xl transition text-slate-500 hover:text-slate-800";
            }
            filterRankings();
        }

        function filterRankings() {
            const search = document.getElementById('search-student-rank').value.toLowerCase();
            const container = document.getElementById('ranking-list');
            container.innerHTML = '';

            // Gabungkan semua akun terdaftar + data contoh + diri sendiri
            let fullList = daftarSiswaLengkap();

            // Sort according to tab selection
            if (currentRankTab === 'kelas') {
                fullList = fullList.filter(s => kunciKelas(s.grade) === kunciKelas(mainStudent.grade));
                fullList.sort((a, b) => a.rankKelas - b.rankKelas);
            } else {
                fullList = fullList.filter(s => tingkatDari(s.grade) === tingkatDari(mainStudent.grade));
                fullList.sort((a, b) => a.rankAngkatan - b.rankAngkatan);
            }

            // Filter by search query
            const filtered = fullList.filter(s => s.name.toLowerCase().includes(search));

            if (filtered.length === 0) {
                container.innerHTML = `<p class="text-xs text-center text-slate-400 py-6">Siswa tidak ditemukan.</p>`;
                return;
            }

            filtered.forEach((s) => {
                const rankNum = currentRankTab === 'kelas' ? s.rankKelas : s.rankAngkatan;
                let rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">${rankNum}</span>`;

                if (rankNum === 1) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-2xs">1</span>`;
                if (rankNum === 2) rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-400 text-white text-xs font-bold flex items-center justify-center shadow-2xs">2</span>`;
                if (rankNum === 3) rankBadge = `<span class="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shadow-2xs">3</span>`;

                const bgHighlight = s.isSelf ? "bg-indigo-50/80 border-indigo-200" : "bg-white border-slate-100 hover:bg-slate-50";

                const html = `
                    <div class="flex items-center justify-between p-3 rounded-2xl border ${bgHighlight} transition">
                        <div class="flex items-center space-x-3">
                            ${rankBadge}
                            <img src="${esc(s.avatarUrl)}" alt="User" class="w-8 h-8 rounded-full object-cover">
                            <div>
                                <h4 class="text-xs font-bold text-slate-800">${esc(s.name)}</h4>
                                <p class="text-[10px] text-slate-500">${esc(s.grade)} • ${s.coins} Koin</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${!s.isSelf ? `
                                <button onclick="inspectPublicPortfolio('${s.id}')" class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition flex items-center space-x-1">
                                    <i class="fa-solid fa-eye"></i>
                                    <span>Lihat Portfolio</span>
                                </button>
                            ` : `<span class="text-[10px] text-indigo-600 font-bold px-2 py-0.5 bg-indigo-100 rounded-md">Profil Anda</span>`}
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }

        // Public Portfolio Inspector Controller
        function inspectPublicPortfolio(studentId) {
            const target = daftarSiswaLengkap().find(s => s.id === studentId);
            if (!target) return;

            document.getElementById('pub-avatar').src = target.avatarUrl;
            document.getElementById('pub-name').textContent = target.name;
            document.getElementById('pub-info').textContent = `${target.grade} • NIS ${target.nis}`;
            document.getElementById('pub-coins').textContent = `${target.coins} Koin`;
            document.getElementById('pub-rank').textContent = `Rank #${target.rankAngkatan} Angkatan`;
            renderChips('pub-extra', target.extracurricular, OPSI_EKSKUL);
            renderChips('pub-org', target.organization, OPSI_ORGANISASI);

            const achBox = document.getElementById('pub-achievements');
            const daftarPrestasi = target.achievements || [];
            if (daftarPrestasi.length === 0) {
                achBox.innerHTML = '<p class="text-xs text-slate-400 py-2">Belum ada prestasi terdaftar.</p>';
            } else {
                achBox.innerHTML = daftarPrestasi.map(a => kartuPrestasiPublik(target, a)).join('');
            }

            document.getElementById('public-portfolio-modal').classList.remove('hidden');
        }
        function closePublicPortfolioModal() { document.getElementById('public-portfolio-modal').classList.add('hidden'); }

        // Explore All Portfolios Modal
        async function openExploreModal() {
            document.getElementById('explore-modal').classList.remove('hidden');
            document.getElementById('explore-list').innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Memuat data...</p>';
            await muatSemuaSiswa();
            renderExploreList();
        }
        function closeExploreModal() { document.getElementById('explore-modal').classList.add('hidden'); }

        function renderExploreList() {
            const query = document.getElementById('search-explore').value.toLowerCase();
            const list = document.getElementById('explore-list');
            list.innerHTML = '';

            const filtered = daftarSiswaLain().filter(s => s.name.toLowerCase().includes(query) || String(s.grade).toLowerCase().includes(query));

            if(filtered.length === 0) {
                list.innerHTML = `<p class="text-xs text-center text-slate-400 py-6">Siswa tidak ditemukan.</p>`;
                return;
            }

            filtered.forEach(s => {
                list.insertAdjacentHTML('beforeend', `
                    <div class="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                        <div class="flex items-center space-x-3">
                            <img src="${esc(s.avatarUrl)}" class="w-9 h-9 rounded-full object-cover">
                            <div>
                                <h4 class="text-xs font-bold text-slate-800">${esc(s.name)}</h4>
                                <p class="text-[10px] text-slate-400">${esc(s.grade)} • NIS ${esc(s.nis)}</p>
                            </div>
                        </div>
                        <button onclick="closeExploreModal(); inspectPublicPortfolio('${s.id}')" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
                            Lihat Portfolio
                        </button>
                    </div>
                `);
            });
        }

        // Generic Feature & Settings Controller
        function openFeatureModal(title, desc) {
            document.getElementById('feature-modal-title').textContent = title;
            document.getElementById('feature-modal-desc').textContent = desc;
            document.getElementById('feature-modal').classList.remove('hidden');
        }
        function closeFeatureModal() { document.getElementById('feature-modal').classList.add('hidden'); }

        function openFeedbackModal() { document.getElementById('feedback-modal').classList.remove('hidden'); }
        function closeFeedbackModal() { document.getElementById('feedback-modal').classList.add('hidden'); }
        function submitFeedback() {
            closeFeedbackModal();
            showNotification("Kritik & saran berhasil dikirim!");
        }

        function openSettingsModal() { document.getElementById('settings-modal').classList.remove('hidden'); }
        function closeSettingsModal() { document.getElementById('settings-modal').classList.add('hidden'); }

        function saveNotes() {
            mainStudent.notes = document.getElementById('reminder-notes').value;
            simpanStudent();
            showNotification("Catatan pengingat tersimpan!");
        }


        // ===================== FOTO (input file, dikompres lalu disimpan di Firestore) =====================
        let fotoProfilBaru = null;
        let fotoPrestasiBaru = null;
        let fotoLaporanBaru = null;

        // Foto dikecilkan dulu supaya muat di database (batas dokumen sekitar 1 MB)
        function kompresGambar(file, maksSisi, kualitas, persegi) {
            return new Promise((resolve, reject) => {
                if (!file || !file.type || !file.type.startsWith('image/')) return reject(new Error('File harus berupa gambar (JPG atau PNG).'));
                if (file.size > 15 * 1024 * 1024) return reject(new Error('Ukuran foto maksimal 15 MB.'));
                const reader = new FileReader();
                reader.onerror = () => reject(new Error('Gagal membaca file.'));
                reader.onload = () => {
                    const img = new Image();
                    img.onerror = () => reject(new Error('File gambar tidak bisa dibuka.'));
                    img.onload = () => {
                        let sx = 0, sy = 0, sw = img.width, sh = img.height;
                        if (persegi) { // potong tengah jadi persegi
                            const sisi = Math.min(sw, sh);
                            sx = (sw - sisi) / 2; sy = (sh - sisi) / 2; sw = sisi; sh = sisi;
                        }
                        const skala = Math.min(1, maksSisi / Math.max(sw, sh));
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.max(1, Math.round(sw * skala));
                        canvas.height = Math.max(1, Math.round(sh * skala));
                        const c = canvas.getContext('2d');
                        c.fillStyle = '#ffffff'; // latar putih untuk PNG transparan
                        c.fillRect(0, 0, canvas.width, canvas.height);
                        c.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', kualitas));
                    };
                    img.src = reader.result;
                };
                reader.readAsDataURL(file);
            });
        }
        function tampilPreview(id, src) { const el = document.getElementById(id); el.src = src; el.classList.remove('hidden'); }
        function sembunyiPreview(id) { const el = document.getElementById(id); el.removeAttribute('src'); el.classList.add('hidden'); }

        async function ambilFoto(input, maksSisi, kualitas, persegi, idPreview) {
            const file = input.files && input.files[0];
            if (!file) return null;
            try {
                const hasil = await kompresGambar(file, maksSisi, kualitas, persegi);
                if (idPreview) tampilPreview(idPreview, hasil);
                return hasil;
            } catch (err) {
                showNotification(err.message, false);
                input.value = '';
                return null;
            }
        }
        async function pilihFotoProfil(input) { const f = await ambilFoto(input, 256, 0.8, true, 'preview-avatar'); if (f) fotoProfilBaru = f; }
        async function pilihFotoPrestasi(input) { const f = await ambilFoto(input, 600, 0.6, false, 'preview-ach'); if (f) fotoPrestasiBaru = f; }
        async function pilihFotoLaporan(input) { const f = await ambilFoto(input, 800, 0.6, false, 'preview-laporan'); if (f) fotoLaporanBaru = f; }
        function pakaiFotoInisial() {
            fotoProfilBaru = buatAvatar(document.getElementById('input-name').value || mainStudent.name);
            tampilPreview('preview-avatar', fotoProfilBaru);
        }

        // Layar penuh untuk melihat foto
        function bukaFoto(src) {
            if (!src) return;
            document.getElementById('foto-besar').src = src;
            document.getElementById('foto-modal').classList.remove('hidden');
        }
        function tutupFoto() { document.getElementById('foto-modal').classList.add('hidden'); }

        const LOADING_HTML = '<p class="text-xs text-slate-400 text-center py-4">Memuat...</p>';
        const WARNA_STATUS = {
            'Menunggu persetujuan': 'bg-amber-100 text-amber-800',
            'Disetujui': 'bg-emerald-100 text-emerald-800',
            'Ditolak': 'bg-rose-100 text-rose-800',
            'Diterima BK': 'bg-slate-200 text-slate-700',
            'Diproses': 'bg-sky-100 text-sky-800',
            'Selesai': 'bg-emerald-100 text-emerald-800'
        };
        function badgeStatus(status) {
            return `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${WARNA_STATUS[status] || 'bg-slate-100 text-slate-600'}">${esc(status)}</span>`;
        }

        // ===================== DISPEN DIGITAL (siswa) =====================
        // Disimpan di koleksi "dispen" supaya guru bisa melihat dan memprosesnya.
        async function muatDispenSaya() {
            try {
                const snap = await db.collection('dispen').where('uid', '==', uidAktif).get();
                mainStudent.dispen = snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (b.dibuatTs || 0) - (a.dibuatTs || 0));
            } catch (e) {
                console.error(e);
                showNotification('Gagal memuat dispen: ' + pesanError(e), false);
            }
        }
        async function openDispenModal() {
            document.getElementById('dispen-modal').classList.remove('hidden');
            document.getElementById('dispen-list').innerHTML = LOADING_HTML;
            await muatDispenSaya();
            renderDispen();
        }
        function closeDispenModal() { document.getElementById('dispen-modal').classList.add('hidden'); }

        async function handleSimpanDispen(e) {
            e.preventDefault();
            const form = e.target;
            const mulai = document.getElementById('dispen-mulai').value;
            const selesai = document.getElementById('dispen-selesai').value;
            if (selesai < mulai) {
                showNotification('Tanggal selesai tidak boleh sebelum tanggal mulai.', false);
                return;
            }
            try {
                await db.collection('dispen').add({
                    uid: uidAktif,
                    nama: mainStudent.name,
                    kelas: mainStudent.grade,
                    jenis: document.getElementById('dispen-jenis').value,
                    kegiatan: document.getElementById('dispen-kegiatan').value.trim(),
                    mulai: mulai,
                    selesai: selesai,
                    keterangan: document.getElementById('dispen-ket').value.trim(),
                    status: 'Menunggu persetujuan',
                    catatanGuru: '',
                    dibuat: tglSekarang(),
                    dibuatTs: Date.now()
                });
                form.reset();
                showNotification('Pengajuan dispen terkirim ke guru.');
                await muatDispenSaya();
                renderDispen();
            } catch (err) {
                console.error(err);
                showNotification('Gagal mengirim dispen: ' + pesanError(err), false);
            }
        }
        async function hapusDispen(id) {
            if (!(await konfirmasi('Pengajuan dispen ini akan dibatalkan dan dihapus.', { judul: 'Batalkan pengajuan?', tombolYa: 'Ya, batalkan', tombolTidak: 'Tidak' }))) return;
            try {
                await db.collection('dispen').doc(id).delete();
                await muatDispenSaya();
                renderDispen();
            } catch (err) {
                console.error(err);
                showNotification('Gagal membatalkan: ' + pesanError(err), false);
            }
        }
        function renderDispen() {
            const box = document.getElementById('dispen-list');
            if (mainStudent.dispen.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Belum ada pengajuan dispen.</p>';
                return;
            }
            box.innerHTML = mainStudent.dispen.map(d => `
                <div class="p-3 rounded-2xl border border-slate-100 bg-slate-50">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${esc(d.kegiatan)}</p>
                            <p class="text-[10px] text-slate-500">${esc(d.jenis)} • ${tglIndo(d.mulai)} s/d ${tglIndo(d.selesai)}</p>
                        </div>
                        ${badgeStatus(d.status)}
                    </div>
                    ${d.keterangan ? `<p class="text-[11px] text-slate-600 mt-1.5">${esc(d.keterangan)}</p>` : ''}
                    ${d.catatanGuru ? `<p class="text-[11px] text-slate-700 mt-1.5 p-2 rounded-lg bg-white border border-slate-100"><b>Catatan guru:</b> ${esc(d.catatanGuru)}</p>` : ''}
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-[10px] text-slate-400">Diajukan ${esc(d.dibuat)}${d.diprosesTgl ? ' • Diproses ' + esc(d.diprosesTgl) : ''}</span>
                        ${d.status === 'Menunggu persetujuan' ? `<button onclick="hapusDispen('${d.id}')" class="text-[10px] font-bold text-rose-600 hover:underline">Batalkan</button>` : ''}
                    </div>
                </div>`).join('');
        }

        // ===================== LAPORKAN PELANGGARAN (siswa) =====================
        async function muatLaporanSaya() {
            try {
                const snap = await db.collection('laporan').where('uid', '==', uidAktif).get();
                mainStudent.laporan = snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (b.dibuatTs || 0) - (a.dibuatTs || 0));
            } catch (e) {
                console.error(e);
                showNotification('Gagal memuat laporan: ' + pesanError(e), false);
            }
        }
        async function openLaporanModal() {
            document.getElementById('laporan-modal').classList.remove('hidden');
            document.getElementById('laporan-list').innerHTML = LOADING_HTML;
            await muatLaporanSaya();
            renderLaporan();
        }
        function closeLaporanModal() { document.getElementById('laporan-modal').classList.add('hidden'); }

        async function handleSimpanLaporan(e) {
            e.preventDefault();
            const form = e.target;
            const anonim = document.getElementById('laporan-anonim').checked;
            try {
                await db.collection('laporan').add({
                    uid: uidAktif,
                    pelaporNama: anonim ? '' : mainStudent.name,
                    anonim: anonim,
                    jenis: document.getElementById('laporan-jenis').value,
                    tanggal: document.getElementById('laporan-tanggal').value,
                    lokasi: document.getElementById('laporan-lokasi').value.trim(),
                    terlibat: document.getElementById('laporan-terlibat').value.trim(),
                    kronologi: document.getElementById('laporan-kronologi').value.trim(),
                    foto: fotoLaporanBaru || '',
                    status: 'Diterima BK',
                    dibuat: tglSekarang(),
                    dibuatTs: Date.now()
                });
                form.reset();
                fotoLaporanBaru = null;
                sembunyiPreview('preview-laporan');
                showNotification('Laporan terkirim ke BK.');
                await muatLaporanSaya();
                renderLaporan();
            } catch (err) {
                console.error(err);
                showNotification('Gagal mengirim laporan: ' + pesanError(err), false);
            }
        }
        async function hapusLaporan(id) {
            if (!(await konfirmasi('Laporan ini akan dihapus. Hal ini hanya bisa dilakukan selama laporan belum diproses.', { judul: 'Hapus laporan?', tombolYa: 'Hapus' }))) return;
            try {
                await db.collection('laporan').doc(id).delete();
                await muatLaporanSaya();
                renderLaporan();
            } catch (err) {
                console.error(err);
                showNotification('Gagal menghapus: ' + pesanError(err), false);
            }
        }
        function bukaFotoLaporanSaya(id) {
            const l = mainStudent.laporan.find(x => x.id === id);
            if (l) bukaFoto(l.foto);
        }
        function renderLaporan() {
            const box = document.getElementById('laporan-list');
            if (mainStudent.laporan.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Belum ada laporan.</p>';
                return;
            }
            box.innerHTML = mainStudent.laporan.map(l => `
                <div class="p-3 rounded-2xl border border-slate-100 bg-slate-50">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${esc(l.jenis)}</p>
                            <p class="text-[10px] text-slate-500">${tglIndo(l.tanggal)} • ${esc(l.lokasi)}${l.anonim ? ' • Anonim' : ''}</p>
                        </div>
                        ${badgeStatus(l.status)}
                    </div>
                    ${l.terlibat ? `<p class="text-[11px] text-slate-600 mt-1.5"><b>Terlibat:</b> ${esc(l.terlibat)}</p>` : ''}
                    <p class="text-[11px] text-slate-600 mt-1.5">${esc(l.kronologi)}</p>
                    ${l.foto ? `<button type="button" onclick="bukaFotoLaporanSaya('${l.id}')" class="mt-2 text-[10px] font-bold text-indigo-600 hover:underline"><i class="fa-solid fa-image mr-1"></i>Lihat foto bukti</button>` : ''}
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-[10px] text-slate-400">Dikirim ${esc(l.dibuat)}</span>
                        ${l.status === 'Diterima BK' ? `<button onclick="hapusLaporan('${l.id}')" class="text-[10px] font-bold text-rose-600 hover:underline">Hapus</button>` : ''}
                    </div>
                </div>`).join('');
        }

        // ===================== RIWAYAT DARI GURU (koin, nilai, pelanggaran) =====================
        const LABEL_RIWAYAT = { koin: 'Koin', nilai: 'Nilai', pelanggaran: 'Skor pelanggaran' };
        function barisRiwayat(r) {
            const tanda = r.tipe === 'nilai' ? '→ ' + r.jumlah : (r.jumlah > 0 ? '+' + r.jumlah : String(r.jumlah));
            const warna = r.tipe === 'pelanggaran' ? 'text-rose-600' : (r.tipe === 'koin' ? 'text-amber-600' : 'text-emerald-600');
            return `
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-700">${LABEL_RIWAYAT[r.tipe] || esc(r.tipe)}</span>
                        <span class="text-xs font-bold ${warna}">${esc(tanda)}</span>
                    </div>
                    ${r.catatan ? `<p class="text-[11px] text-slate-600 mt-0.5">${esc(r.catatan)}</p>` : ''}
                    <p class="text-[10px] text-slate-400 mt-0.5">${esc(r.tgl || '')}${r.oleh ? ' • ' + esc(r.oleh) : ''}</p>
                </div>`;
        }
        async function muatRiwayat(uid) {
            const snap = await db.collection('siswa').doc(uid).collection('riwayat').get();
            return snap.docs.map(d => d.data()).sort((a, b) => (b.waktu || 0) - (a.waktu || 0));
        }
        async function openRiwayatModal() {
            const box = document.getElementById('riwayat-list');
            document.getElementById('riwayat-modal').classList.remove('hidden');
            box.innerHTML = LOADING_HTML;
            try {
                const daftar = await muatRiwayat(uidAktif);
                box.innerHTML = daftar.length ? daftar.map(barisRiwayat).join('') : '<p class="text-xs text-slate-400 text-center py-4">Belum ada riwayat dari guru.</p>';
            } catch (err) {
                console.error(err);
                box.innerHTML = '<p class="text-xs text-rose-600 text-center py-4">Gagal memuat: ' + esc(pesanError(err)) + '</p>';
            }
        }
        function closeRiwayatModal() { document.getElementById('riwayat-modal').classList.add('hidden'); }

        // ===================== TOKO KOIN =====================
        const TOKO_ITEMS = [
            { id: 'kupon-kantin', nama: 'Kupon Kantin', desc: 'Potongan jajan di kantin sekolah', harga: 50, icon: 'fa-utensils' },
            { id: 'voucher-fotokopi', nama: 'Voucher Fotokopi', desc: 'Gratis fotokopi 20 lembar', harga: 30, icon: 'fa-print' },
            { id: 'stiker', nama: 'Stiker Siswaku', desc: 'Paket stiker eksklusif', harga: 25, icon: 'fa-star' },
            { id: 'alat-tulis', nama: 'Set Alat Tulis', desc: 'Pulpen dan buku tulis', harga: 80, icon: 'fa-pen' },
            { id: 'tumbler', nama: 'Tumbler Sekolah', desc: 'Tumbler berlogo sekolah', harga: 200, icon: 'fa-bottle-water' },
            { id: 'kaos', nama: 'Kaos Eksklusif', desc: 'Kaos angkatan edisi terbatas', harga: 400, icon: 'fa-shirt' }
        ];

        function openTokoModal() { renderToko(); document.getElementById('toko-modal').classList.remove('hidden'); }
        function closeTokoModal() { document.getElementById('toko-modal').classList.add('hidden'); }

        async function beliItem(id) {
            const item = TOKO_ITEMS.find(i => i.id === id);
            if (!item) return;
            if (mainStudent.coins < item.harga) {
                showNotification('Koin kamu belum cukup.', false);
                return;
            }
            const koinBaru = mainStudent.coins - item.harga;
            try {
                // increment: aman walau guru sedang menambah koin di saat yang sama
                await db.collection('siswa').doc(uidAktif).update({ coins: FieldValue.increment(-item.harga) });
            } catch (err) {
                console.error(err);
                showNotification('Penukaran gagal: ' + pesanError(err), false);
                return;
            }
            mainStudent.coins = koinBaru;
            mainStudent.pembelian.unshift({ id: 'pb_' + Date.now(), item: item.nama, harga: item.harga, dibuat: tglSekarang() });
            simpanStudent();
            updateUI();
            renderToko();
            showNotification(item.nama + ' berhasil ditukar!');
        }
        function renderToko() {
            document.getElementById('toko-saldo').textContent = mainStudent.coins + ' Koin';
            document.getElementById('toko-items').innerHTML = TOKO_ITEMS.map(i => {
                const cukup = mainStudent.coins >= i.harga;
                return `
                <div class="p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><i class="fa-solid ${i.icon}"></i></div>
                        <div>
                            <p class="text-xs font-bold text-slate-800">${i.nama}</p>
                            <p class="text-[10px] text-slate-500">${i.desc}</p>
                        </div>
                    </div>
                    <button onclick="beliItem('${i.id}')" ${cukup ? '' : 'disabled'} class="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${cukup ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}">${i.harga} Koin</button>
                </div>`;
            }).join('');

            const r = document.getElementById('toko-riwayat');
            r.innerHTML = mainStudent.pembelian.length === 0
                ? '<p class="text-xs text-slate-400 text-center py-4">Belum ada penukaran.</p>'
                : mainStudent.pembelian.map(p => `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span class="text-xs font-semibold text-slate-700">${esc(p.item)}</span>
                        <span class="text-[10px] text-slate-400">-${p.harga} Koin • ${esc(p.dibuat)}</span>
                    </div>`).join('');
        }

        // ===================== HALAMAN GURU =====================
        // Akun guru = akun biasa yang punya dokumen di koleksi "guru" (dibuat manual di Firebase Console).
        let tabGuru = 'siswa';
        let filterDispenGuru = 'Menunggu persetujuan';
        let dispenGuru = [];
        let laporanGuru = [];
        let siswaKelolaId = null;

        async function muatDataGuru() {
            try {
                const [s, d, l] = await Promise.all([
                    db.collection('siswa').get(),
                    db.collection('dispen').get(),
                    db.collection('laporan').get()
                ]);
                cacheSiswa = s.docs.map(x => ({ ...x.data(), id: x.id }));
                dispenGuru = d.docs.map(x => ({ ...x.data(), id: x.id })).sort((a, b) => (b.dibuatTs || 0) - (a.dibuatTs || 0));
                laporanGuru = l.docs.map(x => ({ ...x.data(), id: x.id })).sort((a, b) => (b.dibuatTs || 0) - (a.dibuatTs || 0));
            } catch (e) {
                console.error(e);
                showNotification('Gagal memuat data: ' + pesanError(e), false);
            }
            renderGuru();
        }

        function renderGuru() {
            const menunggu = dispenGuru.filter(d => d.status === 'Menunggu persetujuan').length;
            const baru = laporanGuru.filter(l => l.status === 'Diterima BK').length;
            document.getElementById('guru-hitung-siswa').textContent = cacheSiswa.length;
            document.getElementById('guru-hitung-dispen').textContent = menunggu;
            document.getElementById('guru-hitung-laporan').textContent = baru;
            renderGuruSiswa();
            renderGuruDispen();
            renderGuruLaporan();
            setTabGuru(tabGuru);
        }

        function setTabGuru(tab) {
            tabGuru = tab;
            ['siswa', 'dispen', 'laporan'].forEach(t => {
                document.getElementById('guru-' + t).classList.toggle('hidden', t !== tab);
                document.getElementById('guru-tabbtn-' + t).className = t === tab
                    ? 'flex-1 py-2 px-3 text-xs font-bold rounded-xl transition bg-emerald-600 text-white shadow-2xs'
                    : 'flex-1 py-2 px-3 text-xs font-bold rounded-xl transition text-slate-500 hover:text-slate-800';
            });
        }

        function renderGuruSiswa() {
            const box = document.getElementById('guru-siswa-list');
            const cari = (document.getElementById('guru-cari').value || '').trim().toLowerCase();
            const daftar = cacheSiswa
                .filter(s => !cari || String(s.name || '').toLowerCase().includes(cari) || String(s.grade || '').toLowerCase().includes(cari) || String(s.nis || '').includes(cari))
                .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            if (daftar.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Belum ada siswa.</p>';
                return;
            }
            box.innerHTML = daftar.map(s => `
                <div class="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-100">
                    <div class="flex items-center space-x-3 min-w-0">
                        <img src="${esc(s.avatarUrl || buatAvatar(s.name || 'S'))}" alt="" class="w-10 h-10 rounded-full object-cover shrink-0">
                        <div class="min-w-0">
                            <p class="text-xs font-bold text-slate-800 truncate">${esc(s.name)}</p>
                            <p class="text-[10px] text-slate-500">${esc(s.grade)} • NIS ${esc(s.nis)}</p>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">${s.coins || 0} Koin</span>
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Pelanggaran ${s.violationScore || 0}</span>
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">${(s.achievements || []).length} prestasi</span>
                                ${jumlahLaporanPrestasi(s.id) ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800"><i class="fa-solid fa-flag mr-1"></i>${jumlahLaporanPrestasi(s.id)} dilaporkan</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <button onclick="openKelolaSiswa('${s.id}')" class="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition">Kelola</button>
                </div>`).join('');
        }

        // ---- Kelola satu siswa: koin, nilai, skor pelanggaran ----
        async function openKelolaSiswa(id) {
            const s = cacheSiswa.find(x => x.id === id);
            if (!s) return;
            siswaKelolaId = id;
            ['kelola-koin', 'kelola-koin-cat', 'kelola-pel', 'kelola-pel-cat'].forEach(i => document.getElementById(i).value = '');
            document.getElementById('kelola-modal').classList.remove('hidden');
            tampilkanKelola();
            const box = document.getElementById('kelola-riwayat');
            box.innerHTML = LOADING_HTML;
            try {
                const daftar = await muatRiwayat(id);
                box.innerHTML = daftar.length ? daftar.map(barisRiwayat).join('') : '<p class="text-xs text-slate-400 text-center py-3">Belum ada riwayat.</p>';
            } catch (err) {
                console.error(err);
                box.innerHTML = '<p class="text-xs text-rose-600 text-center py-3">Gagal memuat riwayat: ' + esc(pesanError(err)) + '</p>';
            }
        }
        function closeKelolaModal() { document.getElementById('kelola-modal').classList.add('hidden'); }
        function tampilkanKelola() {
            const s = cacheSiswa.find(x => x.id === siswaKelolaId);
            if (!s) return;
            document.getElementById('kelola-nama').textContent = s.name;
            document.getElementById('kelola-info').textContent = s.grade + ' • NIS ' + s.nis;
            document.getElementById('kelola-koin-now').textContent = (s.coins || 0) + ' Koin';
            document.getElementById('kelola-pel-now').textContent = s.violationScore || 0;
            renderKelolaPortofolio(s);
        }

        // Portofolio siswa untuk guru: acuan sebelum menambah koin
        function jumlahLaporanPrestasi(uid, idPrestasi) {
            return laporanGuru.filter(l => l.target && l.target.uid === uid && (!idPrestasi || l.target.prestasiId === idPrestasi)).length;
        }
        function renderKelolaPortofolio(s) {
            const chipsBox = document.getElementById('kelola-chips');
            const ekskul = normalisasiDaftar(s.extracurricular).map(n => chipHTML(n, OPSI_EKSKUL));
            const org = normalisasiDaftar(s.organization).map(n => chipHTML(n, OPSI_ORGANISASI));
            const semua = [...ekskul, ...org];
            chipsBox.innerHTML = semua.length ? semua.join('') : '<span class="text-xs text-slate-400">Belum ada ekstrakulikuler atau organisasi.</span>';

            const box = document.getElementById('kelola-prestasi');
            const daftar = s.achievements || [];
            if (daftar.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 py-2">Belum ada prestasi terdaftar.</p>';
                return;
            }
            box.innerHTML = daftar.map(a => {
                const bukti = punyaBukti(a);
                const lapor = jumlahLaporanPrestasi(s.id, a.id);
                const foto = bukti
                    ? `<img src="${esc(a.photo)}" alt="Bukti" onclick="bukaFotoPrestasi('${s.id}', '${a.id}')" class="w-14 h-14 rounded-lg object-cover border border-slate-200 cursor-zoom-in shrink-0">`
                    : `<div class="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0"><i class="fa-regular fa-image"></i></div>`;
                return `
                    <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        ${foto}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <p class="text-xs font-bold text-slate-800">${esc(a.title)}</p>
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">${esc(a.rank)}</span>
                            </div>
                            <p class="text-[10px] text-slate-400">Tahun ${esc(a.date)}${a.team ? ' • ' + esc(a.team) : ''}</p>
                            <div class="flex flex-wrap gap-1.5 mt-1">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${bukti ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${bukti ? 'Ada bukti foto' : 'Belum ada bukti'}</span>
                                ${lapor ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800"><i class="fa-solid fa-flag mr-1"></i>${lapor} laporan</span>` : ''}
                            </div>
                        </div>
                    </div>`;
            }).join('');
        }

        async function ubahDataSiswa(jenis) {
            const s = cacheSiswa.find(x => x.id === siswaKelolaId);
            if (!s) return;
            const ambil = id => document.getElementById(id).value.trim();
            let perubahan = {}, jumlah, catatan, lokal = {};

            if (jenis === 'koin') {
                jumlah = parseInt(ambil('kelola-koin'), 10);
                catatan = ambil('kelola-koin-cat');
                if (!jumlah) return showNotification('Isi jumlah koin (angka, boleh minus).', false);
                if ((s.coins || 0) + jumlah < 0) return showNotification('Koin siswa tidak boleh kurang dari 0.', false);
                perubahan = { coins: FieldValue.increment(jumlah) };
                lokal = { coins: (s.coins || 0) + jumlah };
            } else {
                jumlah = parseInt(ambil('kelola-pel'), 10);
                catatan = ambil('kelola-pel-cat');
                if (!jumlah) return showNotification('Isi jumlah skor pelanggaran (angka, boleh minus untuk mengurangi).', false);
                if (jumlah > 0 && !catatan) return showNotification('Isi alasan pelanggaran.', false);
                if ((s.violationScore || 0) + jumlah < 0) return showNotification('Skor pelanggaran tidak boleh kurang dari 0.', false);
                perubahan = { violationScore: FieldValue.increment(jumlah) };
                lokal = { violationScore: (s.violationScore || 0) + jumlah };
            }

            try {
                const ref = db.collection('siswa').doc(siswaKelolaId);
                const batch = db.batch();
                batch.update(ref, perubahan);
                batch.set(ref.collection('riwayat').doc(), {
                    tipe: jenis, jumlah: jumlah, catatan: catatan, oleh: namaGuru, waktu: Date.now(), tgl: tglSekarang()
                });
                await batch.commit();
            } catch (err) {
                console.error(err);
                return showNotification('Gagal menyimpan: ' + pesanError(err), false);
            }
            Object.assign(s, lokal);
            renderGuru();
            showNotification('Tersimpan untuk ' + s.name + '.');
            openKelolaSiswa(siswaKelolaId);
        }
        function terapkanKoin() { return ubahDataSiswa('koin'); }
        function terapkanPelanggaran() { return ubahDataSiswa('pelanggaran'); }

        // ---- Persetujuan dispen ----
        function setFilterDispen(f) { filterDispenGuru = f; renderGuruDispen(); }
        function renderGuruDispen() {
            const filters = ['Menunggu persetujuan', 'Disetujui', 'Ditolak', 'Semua'];
            document.getElementById('guru-filter-dispen').innerHTML = filters.map(f => `
                <button onclick="setFilterDispen('${f}')" class="px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${f === filterDispenGuru ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">${f === 'Semua' ? 'Semua (riwayat)' : f}</button>`).join('');

            const box = document.getElementById('guru-dispen-list');
            const daftar = dispenGuru.filter(d => filterDispenGuru === 'Semua' || d.status === filterDispenGuru);
            if (daftar.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Tidak ada pengajuan.</p>';
                return;
            }
            box.innerHTML = daftar.map(d => `
                <div class="p-4 rounded-2xl bg-white border border-slate-100">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-xs font-bold text-slate-800">${esc(d.nama)} <span class="font-normal text-slate-500">• ${esc(d.kelas)}</span></p>
                            <p class="text-sm font-bold text-slate-900 mt-1">${esc(d.kegiatan)}</p>
                            <p class="text-[11px] text-slate-500">${esc(d.jenis)} • ${tglIndo(d.mulai)} s/d ${tglIndo(d.selesai)}</p>
                        </div>
                        ${badgeStatus(d.status)}
                    </div>
                    ${d.keterangan ? `<p class="text-[11px] text-slate-600 mt-2">${esc(d.keterangan)}</p>` : ''}
                    <p class="text-[10px] text-slate-400 mt-1">Diajukan ${esc(d.dibuat)}${d.diprosesTgl ? ' • Diproses ' + esc(d.diprosesTgl) + (d.diprosesOleh ? ' oleh ' + esc(d.diprosesOleh) : '') : ''}</p>
                    <div class="mt-3 flex flex-col sm:flex-row gap-2">
                        <input type="text" id="cat-dispen-${d.id}" value="${esc(d.catatanGuru || '')}" placeholder="Catatan untuk siswa (opsional)" class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                        <button onclick="prosesDispen('${d.id}', 'Disetujui')" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition">Setujui</button>
                        <button onclick="prosesDispen('${d.id}', 'Ditolak')" class="px-3 py-2 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition">Tolak</button>
                    </div>
                </div>`).join('');
        }
        async function prosesDispen(id, status) {
            const d = dispenGuru.find(x => x.id === id);
            if (!d) return;
            const catatan = (document.getElementById('cat-dispen-' + id).value || '').trim();
            const data = { status: status, catatanGuru: catatan, diprosesOleh: namaGuru, diprosesTgl: tglSekarang() };
            try {
                await db.collection('dispen').doc(id).update(data);
            } catch (err) {
                console.error(err);
                return showNotification('Gagal memproses: ' + pesanError(err), false);
            }
            Object.assign(d, data);
            renderGuru();
            showNotification('Dispen ' + d.nama + ': ' + status + '.');
        }

        // ---- Laporan pelanggaran ----
        function bukaFotoLaporanGuru(id) {
            const l = laporanGuru.find(x => x.id === id);
            if (l) bukaFoto(l.foto);
        }
        function renderGuruLaporan() {
            const box = document.getElementById('guru-laporan-list');
            if (laporanGuru.length === 0) {
                box.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Belum ada laporan.</p>';
                return;
            }
            box.innerHTML = laporanGuru.map(l => `
                <div class="p-4 rounded-2xl bg-white border border-slate-100">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-sm font-bold text-slate-900">${esc(l.jenis)}</p>
                            <p class="text-[11px] text-slate-500">${tglIndo(l.tanggal)} • ${esc(l.lokasi)}</p>
                            <p class="text-[11px] text-slate-500">Pelapor: ${l.anonim ? 'Anonim' : esc(l.pelaporNama)}</p>
                        </div>
                        ${badgeStatus(l.status)}
                    </div>
                    ${l.terlibat ? `<p class="text-[11px] text-slate-700 mt-2"><b>Siswa terlibat:</b> ${esc(l.terlibat)}</p>` : ''}
                    <p class="text-[11px] text-slate-600 mt-1.5">${esc(l.kronologi)}</p>
                    ${l.target ? `<div class="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                        <p class="text-[11px] text-amber-800"><b>Prestasi dilaporkan:</b> ${esc(l.target.judul)} milik ${esc(l.target.nama)}</p>
                        <button onclick="openKelolaSiswa('${l.target.uid}')" class="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition">Lihat portofolio</button>
                    </div>` : ''}
                    ${l.foto ? `<img src="${esc(l.foto)}" alt="Foto bukti" onclick="bukaFotoLaporanGuru('${l.id}')" class="mt-2 h-28 rounded-xl object-cover border border-slate-200 cursor-pointer">` : ''}
                    <div class="mt-3 flex items-center gap-2">
                        <span class="text-[10px] text-slate-400">Dikirim ${esc(l.dibuat)} • Ubah status:</span>
                        ${['Diterima BK', 'Diproses', 'Selesai'].map(st => `<button onclick="ubahStatusLaporan('${l.id}', '${st}')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${l.status === st ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">${st}</button>`).join('')}
                    </div>
                </div>`).join('');
        }
        async function ubahStatusLaporan(id, status) {
            const l = laporanGuru.find(x => x.id === id);
            if (!l) return;
            try {
                await db.collection('laporan').doc(id).update({ status: status });
            } catch (err) {
                console.error(err);
                return showNotification('Gagal mengubah status: ' + pesanError(err), false);
            }
            l.status = status;
            renderGuru();
        }


        // ===================== BUKTI & LAPORAN PRESTASI =====================
        // Prestasi dianggap punya bukti kalau fotonya bukan gambar bawaan
        function punyaBukti(a) {
            return !!(a && a.photo && !String(a.photo).includes('placehold.co'));
        }
        function cariPrestasi(uid, idPrestasi) {
            const s = (mainStudent && mainStudent.id === uid) ? mainStudent : cacheSiswa.find(x => x.id === uid);
            return s ? (s.achievements || []).find(a => a.id === idPrestasi) : null;
        }
        function bukaFotoPrestasi(uid, idPrestasi) {
            const a = cariPrestasi(uid, idPrestasi);
            if (a) bukaFoto(a.photo);
        }

        // Satu kartu prestasi di portofolio orang lain
        function kartuPrestasiPublik(pemilik, a) {
            const bukti = punyaBukti(a);
            const milikSendiri = mainStudent && pemilik.id === mainStudent.id;
            const sudah = sudahDilaporkan.has(pemilik.id + ':' + a.id);
            const foto = bukti
                ? `<img src="${esc(a.photo)}" alt="Bukti" onclick="bukaFotoPrestasi('${pemilik.id}', '${a.id}')" class="w-14 h-14 rounded-lg object-cover border border-slate-200 cursor-zoom-in shrink-0">`
                : `<div class="w-14 h-14 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0"><i class="fa-regular fa-image"></i></div>`;
            const tombol = milikSendiri ? '' : (sudah
                ? '<span class="text-[10px] font-semibold text-slate-400"><i class="fa-solid fa-check mr-1"></i>Sudah dilaporkan</span>'
                : `<button type="button" onclick="bukaLaporPrestasi('${pemilik.id}', '${a.id}')" class="text-[10px] font-bold text-rose-600 hover:underline"><i class="fa-solid fa-flag mr-1"></i>Laporkan ke guru</button>`);
            return `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div class="flex items-start gap-3">
                        ${foto}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <p class="text-xs font-bold text-slate-800">${esc(a.title)}</p>
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">${esc(a.rank)}</span>
                            </div>
                            <p class="text-[10px] text-slate-400">Tahun ${esc(a.date)}${a.team ? ' • ' + esc(a.team) : ''}</p>
                            <span class="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${bukti ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">${bukti ? 'Ada bukti foto' : 'Belum ada bukti'}</span>
                        </div>
                    </div>
                    ${tombol ? `<div class="flex justify-end mt-2">${tombol}</div>` : ''}
                </div>`;
        }

        let targetLaporPrestasi = null;
        const sudahDilaporkan = new Set(); // mencegah laporan ganda dalam satu sesi

        function bukaLaporPrestasi(uidPemilik, idPrestasi) {
            targetLaporPrestasi = null; // bersihkan sisa laporan sebelumnya
            const pemilik = cacheSiswa.find(x => x.id === uidPemilik);
            const a = cariPrestasi(uidPemilik, idPrestasi);
            if (!pemilik || !a) return;
            if (uidPemilik === uidAktif) return showNotification('Kamu tidak bisa melaporkan prestasimu sendiri.', false);
            targetLaporPrestasi = { uid: uidPemilik, nama: pemilik.name, prestasiId: idPrestasi, judul: a.title, rank: a.rank, tahun: a.date };
            document.getElementById('lapor-prestasi-info').innerHTML =
                `<p class="font-bold text-slate-800">${esc(a.title)} <span class="font-normal text-slate-500">(${esc(a.rank)}, ${esc(a.date)})</span></p>
                 <p class="text-slate-500 mt-0.5">Milik ${esc(pemilik.name)} • ${esc(pemilik.grade)}</p>`;
            document.getElementById('lapor-prestasi-ket').value = '';
            document.getElementById('lapor-prestasi-anonim').checked = false;
            document.getElementById('lapor-prestasi-modal').classList.remove('hidden');
        }
        function tutupLaporPrestasi() {
            document.getElementById('lapor-prestasi-modal').classList.add('hidden');
            targetLaporPrestasi = null;
        }

        // Laporan prestasi masuk ke koleksi "laporan" yang sama, supaya guru melihatnya di tab Laporan
        async function handleLaporPrestasi(e) {
            e.preventDefault();
            const t = targetLaporPrestasi;
            if (!t) return;
            if (t.uid === uidAktif) return showNotification('Kamu tidak bisa melaporkan prestasimu sendiri.', false);
            const kunci = t.uid + ':' + t.prestasiId;
            if (sudahDilaporkan.has(kunci)) return showNotification('Kamu sudah melaporkan prestasi ini.', false);
            const alasan = document.getElementById('lapor-prestasi-alasan').value;
            const ket = document.getElementById('lapor-prestasi-ket').value.trim();
            const anonim = document.getElementById('lapor-prestasi-anonim').checked;
            try {
                await db.collection('laporan').add({
                    uid: uidAktif,
                    pelaporNama: anonim ? '' : mainStudent.name,
                    anonim: anonim,
                    jenis: 'Prestasi dicurigai tidak valid',
                    tanggal: new Date().toISOString().slice(0, 10),
                    lokasi: 'Portofolio siswa',
                    terlibat: t.nama,
                    kronologi: 'Prestasi "' + t.judul + '" (' + t.rank + ', ' + t.tahun + '). Alasan: ' + alasan + '.' + (ket ? ' ' + ket : ''),
                    foto: '',
                    target: { uid: t.uid, nama: t.nama, prestasiId: t.prestasiId, judul: t.judul },
                    status: 'Diterima BK',
                    dibuat: tglSekarang(),
                    dibuatTs: Date.now()
                });
            } catch (err) {
                console.error(err);
                return showNotification('Gagal mengirim laporan: ' + pesanError(err), false);
            }
            sudahDilaporkan.add(kunci);
            tutupLaporPrestasi();
            showNotification('Laporan terkirim ke guru. Terima kasih sudah peduli.');
            inspectPublicPortfolio(t.uid);
        }

        // ===================== TEMA (TERANG / GELAP) =====================
        const KUNCI_TEMA = 'siswaku_tema';
        function temaGelap() { return document.documentElement.classList.contains('dark'); }
        function perbaruiIkonTema() {
            const gelap = temaGelap();
            document.querySelectorAll('.ikon-tema').forEach(i => {
                i.classList.toggle('fa-moon', !gelap);
                i.classList.toggle('fa-sun', gelap);
            });
            const sw = document.getElementById('switch-tema');
            if (sw) sw.checked = gelap;
        }
        function terapkanTema(gelap) {
            document.documentElement.classList.toggle('dark', gelap);
            try { localStorage.setItem(KUNCI_TEMA, gelap ? 'dark' : 'light'); } catch (e) { /* abaikan */ }
            perbaruiIkonTema();
        }
        function toggleTema() { terapkanTema(!temaGelap()); }


        // ===================== DIALOG KONFIRMASI (pengganti confirm bawaan browser) =====================
        let resolverKonfirmasi = null;
        function konfirmasi(pesan, opsi) {
            const o = Object.assign({ judul: 'Yakin?', tombolYa: 'Ya', tombolTidak: 'Batal', bahaya: true }, opsi || {});
            return new Promise(resolve => {
                if (resolverKonfirmasi) resolverKonfirmasi(false); // tutup dialog sebelumnya kalau masih terbuka
                resolverKonfirmasi = resolve;
                document.getElementById('konfirmasi-judul').textContent = o.judul;
                document.getElementById('konfirmasi-pesan').textContent = pesan;
                const ya = document.getElementById('konfirmasi-ya');
                ya.textContent = o.tombolYa;
                ya.className = 'flex-1 py-2.5 rounded-xl text-white text-xs font-semibold transition ' + (o.bahaya ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700');
                const tidak = document.getElementById('konfirmasi-tidak');
                tidak.textContent = o.tombolTidak;
                document.getElementById('konfirmasi-modal').classList.remove('hidden');
                tidak.focus(); // fokus ke tombol aman supaya tidak terhapus tanpa sengaja
            });
        }
        function jawabKonfirmasi(ya) {
            document.getElementById('konfirmasi-modal').classList.add('hidden');
            const r = resolverKonfirmasi;
            resolverKonfirmasi = null;
            if (r) r(ya);
        }

        // Gambar rusak (misalnya URL foto salah): ganti otomatis dengan gambar cadangan
        document.addEventListener('error', (e) => {
            const t = e.target;
            if (t && t.tagName === 'IMG' && !t.dataset.fallback) {
                t.dataset.fallback = '1';
                t.src = 'https://placehold.co/500x300/94a3b8/ffffff?text=Gambar+tidak+tersedia';
            }
        }, true);

        // Init App
        let sesiAwalDicek = false;
        function initApp() {
            isiPilihanKelas('reg-kelas', '');
            perbaruiIkonTema();
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && resolverKonfirmasi) jawabKonfirmasi(false); });
            if (CONFIG_BELUM_DIISI) {
                tampilkanErrorAuth('Firebase belum disambungkan. Isi dulu file firebase-config.js.');
                return;
            }
            // Kalau sebelumnya sudah login, Firebase mengingatnya: langsung masuk
            auth.onAuthStateChanged(async (user) => {
                if (sesiAwalDicek) return;
                sesiAwalDicek = true;
                if (user && !sedangDaftar) await mulaiSesi(user.uid);
            });
        }
        window.addEventListener('DOMContentLoaded', initApp);