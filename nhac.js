document.addEventListener("DOMContentLoaded", function () {
    const bgMusic = document.getElementById("bg-music");
    if (!bgMusic) return;

    bgMusic.volume = 0.5; // Âm lượng 50%
    let isPlaying = false;

    // Hàm phát nhạc tốc độ cao
    const playMusicSeamlessly = () => {
        if (!isPlaying) {
            let playPromise = bgMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    // Hủy lắng nghe ngay khi nhạc đã lên để web đỡ nặng
                    ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => 
                        document.removeEventListener(evt, playMusicSeamlessly)
                    );
                }).catch(error => {
                    console.log("Trình duyệt chặn, đang đợi khách tương tác...");
                });
            }
        }
    };

    // Bắt MỌI loại tương tác của khách: Click, chạm, cuộn trang, bấm phím, rê chuột
    ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'].forEach(evt => 
        document.addEventListener(evt, playMusicSeamlessly, { once: true })
    );
});
