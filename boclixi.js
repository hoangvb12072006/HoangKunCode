// --- CẤU HÌNH TRÒ CHƠI ---
const GIA_BOC = 20000;
const CAC_GIA_TRI = [5000, 10000, 15000, 20000, 30000, 50000, 100000, 200000, 500000];

// 1. Hàm mở bảng bốc lì xì
function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire({
        title: "Lỗi",
        text: "Vui lòng đăng nhập để bốc lì xì!",
        icon: "error",
        didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
    });
    document.getElementById('modalBocLixi').style.display = 'flex';
}

// 2. Hàm đóng bảng
function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// 3. Xử lý bốc lì xì (9 bao lixi)
async function bocLixi(el) {
    // Nếu bao này đã lật rồi thì không cho bấm nữa
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    
    // Kiểm tra số dư từ Firebase
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;

    if(currentBal < GIA_BOC) {
        return Swal.fire({
            title: "Thiếu tiền",
            text: `Bạn cần ${GIA_BOC.toLocaleString()}đ để bốc lì xì!`,
            icon: "warning",
            didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
        });
    }

    // Xác nhận trừ tiền
    const confirm = await Swal.fire({
        title: 'Xác nhận bốc?',
        text: `Hệ thống sẽ trừ ${GIA_BOC.toLocaleString()}đ trong tài khoản!`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        confirmButtonText: 'BỐC LUÔN!',
        didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
    });

    if(!confirm.isConfirmed) return;

    // Tính toán kết quả ngẫu nhiên
    let random = Math.random() * 100;
    let winAmount = 5000;
    if(random < 50) winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 3)]; // Trúng 5k-15k (50%)
    else if(random < 90) winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 4) + 3]; // Trúng 20k-50k (40%)
    else winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 2) + 7]; // Trúng 200k-500k (10%)

    // Cập nhật Database
    const newBal = currentBal - GIA_BOC + winAmount;
    await db.ref('users/' + user).update({ balance: newBal });
    
    // Lưu lịch sử vào history
    db.ref('history/' + user).push({
        product: "🧧 Bốc lì xì may mắn",
        price: GIA_BOC,
        date: new Date().toLocaleString('vi-VN'),
        link: "#",
        status: "Trúng +" + winAmount.toLocaleString() + "đ"
    });

    // Hiệu ứng lật bao tại chỗ
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = winAmount.toLocaleString() + "đ";
    lixiBack.style.display = 'flex';

    // Bắn pháo hoa nếu trúng từ huề vốn trở lên
    if(winAmount >= GIA_BOC) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // Thông báo kết quả
    setTimeout(() => {
        Swal.fire({
            title: winAmount >= GIA_BOC ? "CHÚC MỪNG!" : "TIẾC QUÁ!",
            html: `Bạn nhận được: <b style="color:red; font-size:25px;">${winAmount.toLocaleString()}đ</b>`,
            icon: winAmount >= GIA_BOC ? 'success' : 'info',
            didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
        }).then(() => {
            // Sau khi bấm OK thì đóng modal và ẩn cái giá trị cũ đi để lần sau bốc lại
            dongModalBoc();
            lixiBack.style.display = 'none';
        });
    }, 800);
}
