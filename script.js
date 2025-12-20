// 🎙️ PODCAST BÖLÜMLERİNİ BURAYA GİR
const episodes = [
    {
        title: "Bölüm 3: Geleceğin Teknolojileri",
        date: "20 Ekim 2023",
        duration: "14:20",
        file: "assets/mp3/bolum3.mp3" // Dosya yoluna dikkat et
    },
    {
        title: "Bölüm 2: Yazılım Dünyasına Giriş",
        date: "15 Ekim 2023",
        duration: "08:45",
        file: "assets/mp3/bolum2.mp3"
    },
    {
        title: "Bölüm 1: Merhaba Dünya",
        date: "10 Ekim 2023",
        duration: "05:12",
        file: "assets/mp3/bolum1.mp3"
    }
];

// --- AŞAĞISINA DOKUNMANA GEREK YOK --- //

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const episodeList = document.getElementById('episodeList');
let currentIdx = 0;
let isPlaying = false;

// Listeyi Oluştur
function loadList() {
    episodeList.innerHTML = "";
    episodes.forEach((ep, index) => {
        const div = document.createElement('div');
        div.className = `episode-card ${index === currentIdx ? 'active' : ''}`;
        div.onclick = () => loadTrack(index);
        div.innerHTML = `
            <div class="ep-info">
                <h3>${ep.title}</h3>
                <div class="ep-meta">📅 ${ep.date} • ⏱️ ${ep.duration}</div>
            </div>
            <div class="play-icon"><i class="fa-solid fa-circle-play"></i></div>
        `;
        episodeList.appendChild(div);
    });
}

// Şarkıyı Yükle
function loadTrack(index) {
    currentIdx = index;
    audio.src = episodes[index].file;
    document.getElementById('currentTitle').innerText = episodes[index].title;
    document.getElementById('currentDate').innerText = episodes[index].date;
    
    loadList(); // Aktif sınıfını güncelle
    playTrack();
}

function playTrack() {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
}

function togglePlay() {
    if (audio.src) {
        isPlaying ? pauseTrack() : playTrack();
    } else {
        loadTrack(0);
    }
}

function nextTrack() {
    if (currentIdx > 0) loadTrack(currentIdx - 1);
}

function prevTrack() {
    if (currentIdx < episodes.length - 1) loadTrack(currentIdx + 1);
}

// Progress Bar
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.value = progressPercent;
    
    // Süre Formatı
    currentTimeEl.innerText = formatTime(currentTime);
    if(duration) durationEl.innerText = formatTime(duration);
});

progressBar.addEventListener('input', () => {
    const duration = audio.duration;
    audio.currentTime = (progressBar.value * duration) / 100;
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Sayfa açılınca listeyi yükle
loadList();
