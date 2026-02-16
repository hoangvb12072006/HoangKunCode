// Hàm xử lý mở hộp quà - Giới hạn 1 lần/1 tài khoản
function moHopQua() {
    const user = localStorage.getItem('hoangUser');
    
    // 1. Bắt đăng nhập mới cho chơi
    if (!user) {
        Swal.fire({
            title: 'Khoan đã!',
            text: 'Bạn phải Đăng Nhập thì mới mở được Hộp Quà Bí Mật này nhé!',
            icon: 'warning',
            confirmButtonText: 'Đăng Nhập Ngay',
            confirmButtonColor: '#ff0000'
        }).then(() => {
            if(typeof showAuth === 'function') showAuth(false);
        });
        return;
    }

    // 2. Kiểm tra xem tài khoản này đã bốc chưa
    db.ref('users/' + user + '/hasOpenedGift').once('value').then(snapshot => {
        if (snapshot.val() === true) {
            // Nếu đã bốc rồi thì hiện thông báo từ chối
            Swal.fire({
                title: 'Hết lượt rồi sếp ơi!',
                text: 'Mỗi tài khoản chỉ được nhận quà một lần duy nhất thôi. Đừng tham lam quá nha! 😉',
                icon: 'error',
                confirmButtonText: 'Đã hiểu',
                confirmButtonColor: '#333'
            });
        } else {
            // 3. Nếu chưa bốc -> Tiến hành bốc quà
            xuLyNhanQua(user);
        }
    });
}

// Hàm xử lý logic nhận quà và lưu trạng thái vào DB
function xuLyNhanQua(user) {
    // Hiệu ứng pháo hoa
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    let tienThuong = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
    let tienFormat = tienThuong.toLocaleString('vi-VN');

    // Hiện thông báo đẹp như ông muốn
    Swal.fire({
        title: 'BÙM! TRÚNG MÁNH RỒI!',
        html: `
            <div style="font-size: 16px; color: #333; margin-top: 10px;">Bạn vừa mở Hộp Quà và nhận được:</div>
            <div style="font-size: 40px; font-weight: 900; color: #ff0000; margin: 15px 0;">+${tienFormat}đ</div>
            <div style="font-size: 13px; color: #888;">Tiền đã được chuyển thẳng vào tài khoản của bạn!</div>
        `,
        imageUrl: 'https://cdn3d.iconscout.com/3d/premium/thumb/gift-box-4993386-4159599.png',
        imageWidth: 120,
        confirmButtonText: 'BỎ TÚI NGAY',
        confirmButtonColor: '#ff0000'
    });

    // 4. Cập nhật tiền và ĐÁNH DẤU đã bốc vào Database
    let tienHienTai = parseInt(localStorage.getItem('hoangBal')) || 0;
    let tienMoi = tienHienTai + tienThuong;

    db.ref('users/' + user).update({
        balance: tienMoi,
        hasOpenedGift: true // Đánh dấu "đã bốc" để lần sau không bấm được nữa
    });
}
