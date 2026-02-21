// File: diemdanh.js - Bản Premium Fix lỗi treo trình duyệt

function moModalDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    if (!user) {
        return Swal.fire("Lỗi", "Vui lòng đăng nhập để điểm danh!", "warning");
    }

    // Hiện Modal
    document.getElementById('modalDiemDanh').style.display = 'flex';
    document.getElementById('modalDiemDanh').style.opacity = '1';
    
    // Lấy dữ liệu từ Firebase
    db.ref('users/' + user).once('value').then(snap => {
        const data = snap.val() || {};
        const balance = data.balance || 0;
        
        // Hiển thị số dư (Ghi đè trực tiếp để tránh vòng lặp gây đơ)
        document.getElementById('dd-balance').innerText = balance.toLocaleString() + 'đ';
        
        const today = new Date().toLocaleDateString('vi-VN');
        const btn = document.getElementById('btn-diemdanh');
        const status = document.getElementById('dd-status');
        
        if (data.lastCheckin === today) {
            btn.innerHTML = '<i class="fas fa-calendar-check"></i> ĐÃ NHẬN HÔM NAY';
            btn.style.background = '#444';
            btn.style.cursor = 'not-allowed';
            btn.disabled = true;
            if (status) status.style.display = 'block';
        } else {
            btn.innerHTML = '<i class="fas fa-gift"></i> NHẬN QUÀ NGAY';
            btn.style.background = 'linear-gradient(90deg, #00e5ff, #007bff)';
            btn.disabled = false;
            if (status) status.style.display = 'none';
        }
    });
}

function dongModalDiemDanh() {
    document.getElementById('modalDiemDanh').style.display = 'none';
}

function thucHienDiemDanh() {
    const user = localStorage.getItem('hoangUser');
    const btn = document.getElementById('btn-diemdanh');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
    btn.disabled = true;

    const today = new Date().toLocaleDateString('vi-VN');
    const rewards = [1000, 2000, 3000, 5000, 10000];
    const gift = rewards[Math.floor(Math.random() * rewards.length)];

    db.ref('users/' + user).once('value').then(snap => {
        const userData = snap.val() || {};
        if (userData.lastCheckin === today) {
            Swal.fire("Lỗi", "Bạn đã điểm danh rồi!", "error");
            return;
        }

        const newBal = (userData.balance || 0) + gift;
        db.ref('users/' + user).update({
            balance: newBal,
            lastCheckin: today
        }).then(() => {
            // Hiệu ứng pháo hoa (Confetti)
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }

            Swal.fire({
                title: "THÀNH CÔNG!",
                html: `Chúc mừng ông nhận được <b style="color: #00ff00; font-size: 25px;">+${gift.toLocaleString()}đ</b>`,
                icon: "success",
                confirmButtonColor: "#00e5ff",
                confirmButtonText: "TUYỆT VỜI",
                // Thêm dòng này để nó không bị mờ đằng sau
                didOpen: () => {
                    const swalContainer = document.querySelector('.swal2-container');
                    if (swalContainer) swalContainer.style.zIndex = "100000"; // Ép z-index cao hơn modal
                }
            }).then(() => {
                dongModalDiemDanh();
                location.reload();
            });
        });
    });
}
