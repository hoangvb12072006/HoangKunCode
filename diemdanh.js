/**
 * HOANGKUN STORE - ĐIỂM DANH HÀNG NGÀY VERSION 5.0 (PREMIUM)
 * Tính năng: Cộng tiền ngẫu nhiên, Pháo hoa Confetti, Lịch sử giao dịch, Check ngày thực tế.
 */

// 1. Cấu hình phần thưởng (Ông có thể sửa tỉ lệ tại đây)
const DIEM_DANH_CONFIG = {
    minGift: 1000,
    maxGift: 10000,
    rewards: [1000, 1000, 2000, 2000, 3000, 5000, 10000], // Tỉ lệ rớt tiền
    bonusDay7: 20000, // Thưởng thêm nếu điểm danh đủ 7 ngày (tính năng mở rộng)
};

// 2. Mở Modal Điểm Danh với hiệu ứng mượt mà
function moModalDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    if (!user) {
        return Swal.fire({
            title: "CHƯA ĐĂNG NHẬP",
            text: "Ông cần đăng nhập để hệ thống biết ai nhận quà nhé!",
            icon: "warning",
            confirmButtonColor: "#00e5ff"
        });
    }

    // Hiển thị Modal
    const modal = document.getElementById('modalDiemDanh');
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.opacity = '1'; modal.style.transition = '0.5s'; }, 10);

    // Lấy dữ liệu từ Firebase để hiển thị số dư và trạng thái
    db.ref('users/' + user).once('value').then(snap => {
        const data = snap.val() || {};
        const balance = data.balance || 0;
        const lastCheckin = data.lastCheckin || "";
        const today = new Date().toLocaleDateString('vi-VN');

        // Cập nhật số dư lên bảng
        const balanceEl = document.getElementById('dd-balance');
        if (balanceEl) {
            let count = 0;
            let target = balance;
            let speed = target / 20;
            let timer = setInterval(() => {
                count += speed;
                if (count >= target) {
                    clearInterval(timer);
                    balanceEl.innerText = target.toLocaleString() + 'đ';
                } else {
                    balanceEl.innerText = Math.floor(count).toLocaleString() + 'đ';
                }
            }, 30);
        }

        // Kiểm tra xem hôm nay đã điểm danh chưa
        const btn = document.getElementById('btn-diemdanh');
        const statusText = document.getElementById('dd-status');

        if (lastCheckin === today) {
            btn.innerHTML = '<i class="fas fa-calendar-check"></i> ĐÃ NHẬN HÔM NAY';
            btn.style.background = 'linear-gradient(90deg, #444, #222)';
            btn.style.cursor = 'not-allowed';
            btn.style.boxShadow = 'none';
            btn.disabled = true;
            if (statusText) statusText.style.display = 'block';
        } else {
            btn.innerHTML = '<i class="fas fa-gift"></i> NHẬN QUÀ NGAY';
            btn.disabled = false;
            if (statusText) statusText.style.display = 'none';
        }
    });
}

// 3. Xử lý logic Điểm Danh & Cộng Tiền
function thucHienDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    const btn = document.getElementById('btn-diemdanh');
    
    // Hiệu ứng đang xử lý
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG KHUI QUÀ...';
    btn.disabled = true;

    const today = new Date().toLocaleDateString('vi-VN');
    const nowTime = new Date().toLocaleString('vi-VN');
    const gift = DIEM_DANH_CONFIG.rewards[Math.floor(Math.random() * DIEM_DANH_CONFIG.rewards.length)];

    db.ref('users/' + user).once('value').then(snapshot => {
        const userData = snapshot.val() || {};
        const oldBalance = userData.balance || 0;

        // Chống lách luật (check đúp trên server)
        if (userData.lastCheckin === today) {
            Swal.fire("Lỗi", "Ông đã điểm danh rồi, đừng hack nhé!", "error");
            return;
        }

        const newBalance = oldBalance + gift;

        // Cập nhật Database Firebase
        db.ref('users/' + user).update({
            balance: newBalance,
            lastCheckin: today
        }).then(() => {
            
            // --- BẮT ĐẦU CHUỖI HIỆU ỨNG ĐẸP MẮT ---

            // 1. Pháo hoa Confetti 3 đợt
            var duration = 3 * 1000;
            var end = Date.now() + duration;

            (function frame() {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00e5ff', '#ffffff'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff0055', '#ffffff'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());

            // 2. Ghi lịch sử giao dịch (để hiện trong profile)
            db.ref('wallet_history/' + user).push({
                date: nowTime,
                amount: gift,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                note: "Nhận quà điểm danh hàng ngày"
            });

            // 3. Hiện thông báo SweetAlert VIP
            Swal.fire({
                title: 'ĐIỂM DANH THÀNH CÔNG!',
                html: `
                    <div style="padding: 20px;">
                        <img src="https://cdn-icons-png.flaticon.com/512/14870/14870908.png" style="width:100px; margin-bottom: 20px;">
                        <p style="font-size: 16px;">Chúc mừng ông đã nhận được:</p>
                        <h2 style="color: #00ff00; font-size: 35px; text-shadow: 0 0 10px rgba(0,255,0,0.5);">+${gift.toLocaleString()}đ</h2>
                        <p style="color: #888; font-size: 12px;">Tiền đã được cộng trực tiếp vào ví của ông.</p>
                    </div>
                `,
                background: '#111',
                color: '#fff',
                confirmButtonText: 'TUYỆT VỜI',
                confirmButtonColor: '#00e5ff',
                allowOutsideClick: false
            }).then(() => {
                // Tự động đóng modal và load lại để update số dư Navbar
                dongModalDiemDanh();
                if (document.getElementById('user-balance')) {
                    document.getElementById('user-balance').innerText = newBalance.toLocaleString() + 'đ';
                }
                localStorage.setItem('hoangBal', newBalance);
            });

        }).catch(error => {
            console.error("Lỗi:", error);
            Swal.fire("Lỗi hệ thống", "Mạng lag rồi, thử lại sau nhé ông!", "error");
            btn.innerHTML = '<i class="fas fa-gift"></i> THỬ LẠI';
            btn.disabled = false;
        });
    });
}

function dongModalDiemDanh() {
    const modal = document.getElementById('modalDiemDanh');
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}
