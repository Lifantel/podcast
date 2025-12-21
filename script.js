const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const episodeList = document.getElementById('episodeList');
const searchInput = document.getElementById('searchInput');

let episodes = [];
let currentIdx = -1;
let isPlaying = false;

/* -------------------- VERİYİ ÇEK -------------------- */
async function fetchEpisodes() {
    try {
        // Cache sorununu önlemek için timestamp eklendi
        const response = await fetch(`episodes.json?t=${Date.now()}`);
        episodes = await response.json();
        
        // BURADAKİ DÖNGÜYÜ KALDIRDIK. 
        // Artık site açılırken dosyalar inmeyecek.
        
        renderList(episodes);
    } catch (err) {
        console.error("Episode yükleme hatası:", err);
    }
}

/* -------------------- ARAMA -------------------- */
function filterEpisodes() {
    const term = searchInput.value.toLowerCase();
    const filtered = episodes.filter(ep =>
        ep.title.toLowerCase().includes(term)
    );
    renderList(filtered);
}

/* -------------------- LİSTEYİ BAS -------------------- */
function renderList(list) {
    episodeList.innerHTML = "";

    list.forEach(ep => {
        // Orijinal listedeki indexi buluyoruz (arama yapıldığında kaybolmasın diye)
        const originalIndex = episodes.findIndex(e => e.file === ep.file);

        const div = document.createElement("div");
        div.className = `episode-card ${originalIndex === currentIdx ? "active" : ""}`;

        div.onclick = () => {
            if (currentIdx === originalIndex && isPlaying) {
                pauseTrack();
            } else {
                loadTrack(originalIndex, true);
            }
        };

        // Eğer süre "auto" ise henüz hesaplanmamıştır, "--:--" gösteririz.
        // Hesaplandıysa gerçek süreyi gösteririz.
        const displayDuration = ep.duration === "auto" ? "--:--" : ep.duration;

        div.innerHTML = `
            <div class="ep-info">
                <h3>${ep.title}</h3>
                <div class="ep-meta">📅 ${ep.date} • ⏱️ ${displayDuration}</div>
            </div>
            <div class="play-icon">
                <i class="fa-solid ${currentIdx === originalIndex && isPlaying ? "fa-circle-pause" : "fa-circle-play"}"></i>
            </div>
        `;
        episodeList.appendChild(div);
    });
}

/* -------------------- PLAYER -------------------- */

// getAudioDuration fonksiyonunu sildik çünkü artık manuel çağrılmıyor.

function loadTrack(index, autoplay = false) {
    currentIdx = index;
    audio.src = episodes[index].file;
    audio.load();

    document.getElementById("currentTitle").innerText = episodes[index].title;
    document.getElementById("currentDate").innerText = episodes[index].date;

    renderList(episodes); // Aktif olanı boyamak için listeyi yenile
    
    // Arama yapılıyorsa filtrelenmiş listeyi koru
    if(searchInput.value.length > 0) filterEpisodes();

    if (autoplay) playTrack();
}

function playTrack() {
    if (!audio.src) return;

    audio.play().catch(() => {});
    isPlaying = true;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    
    // Sadece ikonları güncellemek için renderList çağırmak yerine class manipüle edilebilir
    // ama basitlik için renderList'i çağırıyoruz.
    if(searchInput.value.length > 0) filterEpisodes(); else renderList(episodes);
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    if(searchInput.value.length > 0) filterEpisodes(); else renderList(episodes);
}

function togglePlay() {
    if (!audio.src && episodes.length > 0) {
        loadTrack(0, true);
        return;
    }
    isPlaying ? pauseTrack() : playTrack();
}

/* -------------------- NEXT / PREV -------------------- */
function nextTrack() {
    if (currentIdx < episodes.length - 1) {
        loadTrack(currentIdx + 1, true);
    }
}

function prevTrack() {
    if (currentIdx > 0) {
        loadTrack(currentIdx - 1, true);
    }
}

/* -------------------- PROGRESS & METADATA -------------------- */

// Şarkı yüklendiğinde SÜREYİ OTOMATİK KAP ve Kaydet
audio.addEventListener("loadedmetadata", () => {
    durationEl.innerText = formatTime(audio.duration);
    
    // Eğer şu an çalan şarkının süresi listede "auto" olarak görünüyorsa
    if (currentIdx !== -1 && episodes[currentIdx].duration === "auto") {
        // Süreyi hesapla ve listeye kaydet (böylece bir daha hesaplamaz)
        episodes[currentIdx].duration = formatTime(audio.duration);
        
        // Listeyi güncelle ki kullanıcı süreyi görsün
        if(searchInput.value.length > 0) filterEpisodes(); else renderList(episodes);
    }
});

audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.innerText = formatTime(audio.currentTime);
});

progressBar.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (progressBar.value * audio.duration) / 100;
});

/* -------------------- UTIL -------------------- */
function formatTime(sec) {
    if(isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/* -------------------- BAŞLAT -------------------- */
fetchEpisodes();