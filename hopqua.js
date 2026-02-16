// Hàm xử lý mở hộp quà và cộng tiền THẬT vào Database
function moHopQua() {
    // 1. Kiểm tra xem khách đã đăng nhập chưa
    const user = localStorage.getItem('hoangUser');
    
    // Nếu chưa đăng nhập thì bắt đăng nhập mới cho mở quà
    if (!user) {
        Swal.fire({
            title: 'Khoan đã!',
            text: 'Bạn phải Đăng Nhập tài khoản thì mới nhận được tiền thưởng nhé!',
            icon: 'warning',
            confirmButtonText: 'Đăng Nhập Ngay',
            confirmButtonColor: '#ff0000'
        }).then(() => {
            // Gọi hàm mở bảng đăng nhập bên index.html
            if(typeof showAuth === 'function') showAuth(false);
        });
        return; // Dừng lại, không cho mở hộp
    }

    // 2. Hiệu ứng bắn pháo hoa
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ffd700', '#ffffff']
        });
    }

    // 3. Random số tiền thưởng
    let tienThuong = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    let tienFormat = tienThuong.toLocaleString('vi-VN');

    // 4. Hiện thông báo XỊN
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
                Tiền đã được chuyển thẳng vào tài khoản của bạn!
            </div>
        `,
        imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/gift-box-4993386-4159599.png', 
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: 'Hộp Quà 3D',
        confirmButtonText: 'BỎ TÚI NGAY',
        confirmButtonColor: '#ff0000'
    });

    // 5. CỘNG TIỀN THẬT VÀO FIREBASE
    // Lấy số dư hiện tại trong máy (do hàm checkLogin của ông đã lưu sẵn)
    let tienHienTai = parseInt(localStorage.getItem('hoangBal')) || 0;
    let tienMoi = tienHienTai + tienThuong;

    // Bắn lệnh cập nhật lên Firebase (Cái "db" này nó tự lấy từ file index.html qua)
    db.ref('users/' + user).update({
        balance: tienMoi
    }).then(() => {
        console.log("Đã cộng tiền thật vào DB!");
        // Tiền tự động nhảy trên góc phải màn hình luôn, vì ông đã có hàm lắng nghe dữ liệu ở index
    }).catch(err => {
        console.error("Lỗi cộng tiền: ", err);
    });
}
