const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const episodeList = document.getElementById('episodeList');
const searchInput = document.getElementById('searchInput');

let episodes = [];
let currentIdx = 0;
let isPlaying = false;

// 1. Veriyi Çek ve Başlat
async function fetchEpisodes() {
    try {
        const response = await fetch(`episodes.json?t=${new Date().getTime()}`);
        episodes = await response.json();
        
        // Otomatik Süre Hesaplama
        for (let ep of episodes) {
            if (ep.duration === "auto") {
                ep.duration = await getAudioDuration(ep.file);
            }
        }
        renderList(episodes); 
    } catch (error) {
        console.error("Hata:", error);
    }
}

// 2. Arama Filtreleme Fonksiyonu
function filterEpisodes() {
    const term = searchInput.value.toLowerCase();
    const filtered = episodes.filter(ep => 
        ep.title.toLowerCase().includes(term)
    );
    renderList(filtered);
}

// 3. Listeyi Ekrana Bas
function renderList(listToRender) {
    episodeList.innerHTML = "";
    listToRender.forEach((ep, index) => {
        const originalIndex = episodes.findIndex(e => e.file === ep.file);
        const div = document.createElement('div');
        div.className = `episode-card ${originalIndex === currentIdx ? 'active' : ''}`;
        div.onclick = () => loadTrack(originalIndex);
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

// --- OYNATICI FONKSİYONLARI ---
function getAudioDuration(url) {
    return new Promise((resolve) => {
        const tempAudio = new Audio();
        tempAudio.src = url;
        tempAudio.onloadedmetadata = () => resolve(formatTime(tempAudio.duration));
        tempAudio.onerror = () => resolve("??:??");
    });
}

function loadTrack(index) {
    currentIdx = index;
    audio.src = episodes[index].file;
    document.getElementById('currentTitle').innerText = episodes[index].title;
    document.getElementById('currentDate').innerText = episodes[index].date;
    filterEpisodes(); // Listeyi güncelle (active class için)
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
    if (audio.src) isPlaying ? pauseTrack() : playTrack();
    else if (episodes.length > 0) loadTrack(0);
}

function nextTrack() { if (currentIdx > 0) loadTrack(currentIdx - 1); }
function prevTrack() { if (currentIdx < episodes.length - 1) loadTrack(currentIdx + 1); }

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = percent || 0;
    currentTimeEl.innerText = formatTime(audio.currentTime);
    if (audio.duration) durationEl.innerText = formatTime(audio.duration);
});

progressBar.addEventListener('input', () => {
    audio.currentTime = (progressBar.value * audio.duration) / 100;
});

fetchEpisodes();
