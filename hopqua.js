// Hàm xử lý mở hộp quà và cộng tiền
function moHopQua() {
    // Random số tiền từ 5000 đến 10000
    let tienThuong = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    let tienFormat = tienThuong.toLocaleString('vi-VN');

    // Bật thông báo
    alert("🎉 BÙM! CHÚC MỪNG NHÉ! 🎉\n\nBạn vừa mở Hộp Quà và nhận được:\n\n👉 " + tienFormat + " VNĐ 👈\n\nSố tiền đã được cộng trực tiếp vào số dư của bạn!");

    // TÌM VÀ CỘNG TIỀN VÀO GÓC MÀN HÌNH
    let phanHienThiTien = document.getElementById("so-du-tai-khoan");
    
    if (phanHienThiTien) {
        // Lấy số tiền hiện tại đang có (ẩn bớt dấu chấm và chữ 'đ' để làm toán)
        let tienHienTai = parseInt(phanHienThiTien.innerText.replace(/\./g, '').replace('đ', '').replace(/ /g, '')) || 0;
        
        // Cộng tiền thưởng vào số dư
        let tienMoi = tienHienTai + tienThuong;
        
        // Cập nhật lại con số mới lên màn hình
        phanHienThiTien.innerText = tienMoi.toLocaleString('vi-VN') + "đ";
    } else {
        console.log("Chưa tìm thấy chỗ hiển thị tiền để cộng.");
    }
}
