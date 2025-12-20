const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const episodeList = document.getElementById('episodeList');

let episodes = [];
let currentIdx = 0;
let isPlaying = false;

// 1. JSON ÇEK VE SÜRELERİ HESAPLA
async function fetchEpisodes() {
    try {
        const response = await fetch(`episodes.json?t=${new Date().getTime()}`);
        episodes = await response.json();
        
        // Her dosya için gerçek süreyi al
        for (let ep of episodes) {
            if (ep.duration === "auto") {
                ep.duration = await getAudioDuration(ep.file);
            }
        }
        
        renderList(); 
    } catch (error) {
        console.error("Liste yüklenemedi:", error);
    }
}

// Dosyadan gerçek süreyi çeken yardımcı fonksiyon
function getAudioDuration(url) {
    return new Promise((resolve) => {
        const tempAudio = new Audio();
        tempAudio.src = url;
        tempAudio.addEventListener('loadedmetadata', () => {
            resolve(formatTime(tempAudio.duration));
        });
        tempAudio.addEventListener('error', () => {
            resolve("??:??"); // Dosya bulunamazsa
        });
    });
}

// 2. Listeyi Ekrana Bas
function renderList() {
    episodeList.innerHTML = "";
    episodes.forEach((ep, index) => {
        const div = document.createElement('div');
        div.className = `episode-card ${index === currentIdx ? 'active' : ''}`;
        div.onclick = () => loadTrack(index);
        div.innerHTML = `
            <div class="ep-info">
                <h3>${ep.title}</h3>
                <div class="ep-meta">📅 ${ep.date} • ⏱️ <span class="duration-text">${ep.duration}</span></div>
            </div>
            <div class="play-icon"><i class="fa-solid fa-circle-play"></i></div>
        `;
        episodeList.appendChild(div);
    });
}

// 3. Oynatıcı Fonksiyonları
function loadTrack(index) {
    currentIdx = index;
    audio.src = episodes[index].file;
    document.getElementById('currentTitle').innerText = episodes[index].title;
    document.getElementById('currentDate').innerText = episodes[index].date;
    
    renderList(); 
    playTrack();
}

function playTrack() {
    audio.play().catch(e => console.log("Oynatma başlatılamadı:", e));
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
    } else if (episodes.length > 0) {
        loadTrack(0);
    }
}

function nextTrack() {
    if (currentIdx > 0) loadTrack(currentIdx - 1);
}

function prevTrack() {
    if (currentIdx < episodes.length - 1) loadTrack(currentIdx + 1);
}

// Zaman Formatlayıcı
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Progress Bar Güncelleme
audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = percent || 0;
    currentTimeEl.innerText = formatTime(audio.currentTime);
    if (audio.duration) durationEl.innerText = formatTime(audio.duration);
});

progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value * audio.duration) / 100;
});

// Başlat
fetchEpisodes();
