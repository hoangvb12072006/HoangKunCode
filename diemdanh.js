// File: diemdanh.js - Tính năng Điểm danh cộng tiền

// 1. Mở Modal và check xem nay đã điểm danh chưa
function moModalDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    if (!user) {
        return typeof showAuth === 'function' ? showAuth(false) : Swal.fire("Lỗi", "Vui lòng đăng nhập để điểm danh!", "warning");
    }

    document.getElementById('modalDiemDanh').style.display = 'flex';
    
    // Check trên Firebase
    db.ref('users/' + user).once('value').then(snap => {
        const data = snap.val() || {};
        const balance = data.balance || 0;
        document.getElementById('dd-balance').innerText = balance.toLocaleString() + 'đ';
        
        const today = new Date().toLocaleDateString('vi-VN');
        const btn = document.getElementById('btn-diemdanh');
        const status = document.getElementById('dd-status');
        
        // Trạng thái đã điểm danh
        if (data.lastCheckin === today) {
            btn.style.background = '#333';
            btn.style.color = '#777';
            btn.style.boxShadow = 'none';
            btn.style.cursor = 'not-allowed';
            btn.innerText = "ĐÃ ĐIỂM DANH HÔM NAY";
            btn.disabled = true;
            status.style.display = 'block';
        } else {
            // Trạng thái chưa điểm danh
            btn.style.background = '#00e5ff';
            btn.style.color = '#000';
            btn.style.boxShadow = '0 0 15px #00e5ff';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '<i class="fas fa-check-circle"></i> NHẬN QUÀ NGAY';
            btn.disabled = false;
            status.style.display = 'none';
        }
    });
}

// 2. Tắt Modal
function dongModalDiemDanh() {
    document.getElementById('modalDiemDanh').style.display = 'none';
}

// 3. Xử lý cộng tiền vào tài khoản
function thucHienDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    if (!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập!", "error");

    const btn = document.getElementById('btn-diemdanh');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
    btn.disabled = true;

    const today = new Date().toLocaleDateString('vi-VN');
    const nowTime = new Date().toLocaleString('vi-VN');

    // Tỉ lệ rớt tiền: Ra nhiều 1k, 2k, hiếm ra 5k, siêu hiếm ra 10k cho đỡ lỗ vốn
    const rewards = [1000, 1000, 1000, 1000, 2000, 2000, 3000, 5000, 10000];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];

    db.ref('users/' + user).once('value').then(snapshot => {
        let userData = snapshot.val() || {};
        let oldBalance = userData.balance || 0;

        // Check đúp để chống khách dùng tool spam click
        if (userData.lastCheckin === today) {
            Swal.fire("Ô kìa!", "Bạn đã điểm danh rồi, không spam nha!", "warning");
            dongModalDiemDanh();
            return;
        }

        let newBalance = oldBalance + randomReward;

        // Cập nhật Firebase
        db.ref('users/' + user).update({
            balance: newBalance,
            lastCheckin: today // Cắm mốc ngày hôm nay vào data
        }).then(() => {
            // Ghi vào lịch sử giao dịch (Phần Hồ Sơ cá nhân ông đã làm ấy)
            db.ref('wallet_history/' + user).push({
                date: nowTime,
                amount: randomReward,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                note: "Điểm danh hàng ngày"
            });

            // Nếu web ông có cài hiệu ứng pháo hoa thì bắn tung tóe cho sướng
            if(typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            }

            Swal.fire({
                title: "THÀNH CÔNG!",
                html: `Chúc mừng bạn nhận được <b style="color:#ff0000; font-size: 22px;">+${randomReward.toLocaleString()}đ</b>`,
                icon: "success",
                confirmButtonText: "TUYỆT VỜI",
                confirmButtonColor: "#00e5ff"
            }).then(() => {
                dongModalDiemDanh();
                // Cập nhật ví tiền trên thanh Navbar ngay lập tức
                const balEl = document.getElementById('user-balance');
                if(balEl) balEl.innerText = newBalance.toLocaleString() + 'đ';
                localStorage.setItem('hoangBal', newBalance);
            });
        }).catch(err => {
            Swal.fire("Lỗi", "Lỗi mạng, vui lòng thử lại!", "error");
            btn.innerHTML = '<i class="fas fa-check-circle"></i> NHẬN QUÀ NGAY';
            btn.disabled = false;
        });
    });
}
