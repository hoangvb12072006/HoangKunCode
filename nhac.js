function toggleMusic() {
    let audio = document.getElementById("bg-music");
    let player = document.getElementById("music-player");
    let icon = document.getElementById("music-icon");

    if (audio.paused) {
        audio.play(); // Bật nhạc
        player.classList.add("spin-music"); // Bắt đầu xoay
        icon.className = "fas fa-compact-disc"; // Đổi icon thành đĩa than
        player.style.borderColor = "#00ff00"; // Viền xanh lá
        player.style.boxShadow = "0 0 20px #00ff00"; // Phát sáng xanh
    } else {
        audio.pause(); // Tắt nhạc
        player.classList.remove("spin-music"); // Dừng xoay
        icon.className = "fas fa-music"; // Đổi lại thành nốt nhạc
        player.style.borderColor = "#ff0000"; // Viền đỏ lại
        player.style.boxShadow = "0 0 15px rgba(255,0,0,0.5)";
    }
}
