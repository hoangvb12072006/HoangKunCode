// Hàm xử lý mở hộp quà
function moHopQua() {
    // Random số tiền từ 5000 đến 10000
    let tienThuong = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    
    // Định dạng số tiền cho đẹp (VD: 5.500đ)
    let tienFormat = tienThuong.toLocaleString('vi-VN');

    // Hiện thông báo chúc mừng
    alert("🎉 BÙM! CHÚC MỪNG NHÉ! 🎉\n\nBạn vừa mở Hộp Quà Bí Mật và nhận được số tiền ngẫu nhiên là:\n\n👉 " + tienFormat + " VNĐ 👈\n\n(Lưu ý: Tiền ảo thôi, nạp thật mới mua được code nha =)) )");
}
