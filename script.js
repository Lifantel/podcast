const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const episodeList = document.getElementById('episodeList');

let episodes = []; // Veriler JSON'dan gelecek
let currentIdx = 0;
let isPlaying = false;

// 1. JSON VERİSİNİ ÇEK (Cache Kırıcı Dahil)
async function fetchEpisodes() {
    try {
        // Sonuna eklenen timestamp sayesinde tarayıcı her zaman en güncel JSON'ı çeker
        const response = await fetch(`episodes.json?t=${new Date().getTime()}`);
        episodes = await response.json();
        loadList(); 
    } catch (error) {
        console.error("Podcast listesi yüklenemedi:", error);
    }
}

// 2. Listeyi Oluştur
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

// 3. Şarkıyı Yükle
function loadTrack(index) {
    currentIdx = index;
    audio.src = episodes[index].file;
    document.getElementById('currentTitle').innerText = episodes[index].title;
    document.getElementById('currentDate').innerText = episodes[index].date;
    
    loadList(); 
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
        if(episodes.length > 0) loadTrack(0);
    }
}

function nextTrack() {
    if (currentIdx > 0) loadTrack(currentIdx - 1);
}

function prevTrack() {
    if (currentIdx < episodes.length - 1) loadTrack(currentIdx + 1);
}

// Progress Bar İşlemleri
audio.addEventListener('timeupdate', (e) => {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.value = progressPercent || 0;
    
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

// BAŞLAT: Sayfa açılınca JSON'ı çek
fetchEpisodes();
