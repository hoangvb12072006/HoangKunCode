// Hàm xử lý mở hộp quà và cộng tiền hiển thị
function moHopQua() {
    // 1. Hiệu ứng bắn pháo hoa tung tóe
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ffd700', '#ffffff']
        });
    }

    // 2. Random số tiền từ 5000 đến 10000
    let tienThuong = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    let tienFormat = tienThuong.toLocaleString('vi-VN');

    // 3. Bật thông báo XỊN SÒ bằng SweetAlert2
    Swal.fire({
        title: 'BÙM! TRÚNG MÁNH RỒI!',
        html: `
            <div style="font-size: 16px; color: #333; margin-top: 10px;">
                Bạn vừa mở Hộp Quà và nhận được:
            </div>
            <div style="font-size: 40px; font-weight: 900; color: #ff0000; margin: 15px 0; text-shadow: 0 4px 10px rgba(255,0,0,0.2);">
                +${tienFormat}đ
            </div>
            <div style="font-size: 13px; color: #888; font-style: italic;">
                Tiền thưởng đã được tự động cộng vào ví!
            </div>
        `,
        imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/gift-box-4993386-4159599.png', // Ảnh hộp quà 3D cực đẹp
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: 'Hộp Quà 3D',
        confirmButtonText: 'BỎ TÚI NGAY',
        confirmButtonColor: '#ff0000',
        background: '#fff',
        backdrop: `rgba(0,0,0,0.85)` // Nền đen mờ phía sau
    });

    // 4. TÌM CÁI VÍ CỦA KHÁCH ĐỂ CỘNG TIỀN (Vẫn giữ nguyên như cũ)
    let phanHienThiTien = document.getElementById("user-balance");
    
    if (phanHienThiTien) {
        // Lấy số tiền hiện tại (Xóa dấu chấm và chữ đ đi để làm toán)
        let tienHienTai = parseInt(phanHienThiTien.innerText.replace(/\./g, '').replace('đ', '').replace(/ /g, '')) || 0;
        
        // Cộng tiền
        let tienMoi = tienHienTai + tienThuong;
        
        // Ghi đè lại lên màn hình
        phanHienThiTien.innerText = tienMoi.toLocaleString('vi-VN') + "đ";
        
        // Chớp đèn xanh lá cây ở góc phải báo hiệu cộng tiền
        phanHienThiTien.style.color = "#fff";
        phanHienThiTien.style.background = "#28a745";
        phanHienThiTien.style.transition = "0.5s";
        setTimeout(() => {
            phanHienThiTien.style.color = "#00ff00";
            phanHienThiTien.style.background = "transparent";
        }, 1500);
    }
}
