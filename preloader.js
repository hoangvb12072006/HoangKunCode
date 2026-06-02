/* --- LOGIC ẨN MÀN HÌNH CHỜ --- */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    // Delay 1.2s rồi ẩn đi
    setTimeout(() => {
        if(preloader) {
            preloader.classList.add('preloader-hidden');
        }
    }, 1200); 
});
