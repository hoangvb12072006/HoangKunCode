// HÀM 1: DÙNG ĐỂ BẬT/TẮT NHẠC KHI BẤM VÀO NÚT TRÒN
function toggleMusic() {
    let audio = document.getElementById("bg-music");
    let player = document.getElementById("music-player");
    let icon = document.getElementById("music-icon");

    if (audio.paused) {
        audio.play(); // Bật nhạc
        player.classList.add("spin-music");
        icon.className = "fas fa-compact-disc";
        player.style.borderColor = "#00ff00";
        player.style.boxShadow = "0 0 20px #00ff00";
    } else {
        audio.pause(); // Tắt nhạc
        player.classList.remove("spin-music");
        icon.className = "fas fa-music";
        player.style.borderColor = "#ff0000";
        player.style.boxShadow = "0 0 15px rgba(255,0,0,0.5)";
    }
}

// HÀM 2: MẸO LÁCH LUẬT - TỰ ĐỘNG PHÁT NHẠC KHI KHÁCH CLICK VÀO WEB LẦN ĐẦU
document.body.addEventListener('click', function() {
    let audio = document.getElementById("bg-music");
    let player = document.getElementById("music-player");
    let icon = document.getElementById("music-icon");

    // Chỉ bật nếu nhạc đang tắt
    if (audio.paused) {
        audio.play().then(() => {
            player.classList.add("spin-music");
            icon.className = "fas fa-compact-disc";
            player.style.borderColor = "#00ff00";
            player.style.boxShadow = "0 0 20px #00ff00";
        }).catch(error => {
            console.log("Trình duyệt chưa cho phép phát nhạc");
        });
    }
}, { once: true }); // Lệnh này đảm bảo chỉ chạy đúng 1 lần đầu tiên khách bấm vào web
