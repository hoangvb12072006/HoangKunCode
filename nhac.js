// File: nhac.js
// Tính năng: Tự động phát nhạc nền khi người dùng tương tác với trang web (Vượt rào chặn Autoplay)

document.addEventListener("DOMContentLoaded", function () {
    const bgMusic = document.getElementById("bg-music");
    
    if (bgMusic) {
        bgMusic.volume = 0.6; // Chỉnh âm lượng 60% cho vừa tai, khách không bị giật mình
        
        let isPlaying = false;

        // Hàm kích hoạt nhạc
        const playAudio = () => {
            if (!isPlaying) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    // Khi nhạc đã phát thì gỡ bỏ các sự kiện lắng nghe cho nhẹ web
                    document.removeEventListener("click", playAudio);
                    document.removeEventListener("touchstart", playAudio);
                    document.removeEventListener("scroll", playAudio);
                    window.removeEventListener("keydown", playAudio);
                }).catch((error) => {
                    console.log("Đang chờ khách tương tác để phát nhạc...");
                });
            }
        };

        // Bắt mọi hành động của khách: click, lướt màn hình điện thoại, cuộn chuột, bấm phím
        document.addEventListener("click", playAudio);
        document.addEventListener("touchstart", playAudio);
        document.addEventListener("scroll", playAudio);
        window.addEventListener("keydown", playAudio);
    }
});
