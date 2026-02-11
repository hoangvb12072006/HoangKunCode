// --- CẤU HÌNH TRÒ CHƠI ---
const GIA_BOC = 20000;
const CAC_GIA_TRI = [5000, 10000, 15000, 20000, 30000, 50000, 100000, 200000, 500000];

// Hàm mở bảng bốc lì xì
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

// Hàm đóng bảng
function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// Xử lý bốc lì xì
async function bocLixi(el) {
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    
    // 1. Kiểm tra tiền
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

    // 2. Xác nhận
    const confirm = await Swal.fire({
        title: 'Xác nhận bốc?',
        text: `Trừ ${GIA_BOC.toLocaleString()}đ trong tài khoản!`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        confirmButtonText: 'BỐC LUÔN!',
        didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
    });

    if(!confirm.isConfirmed) return;

    // 3. Tính kết quả (Tỉ lệ 500k hiếm)
    let random = Math.random() * 100;
    let winAmount = 5000;
    if(random < 50) winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 3)]; // 5k-15k
    else if(random < 90) winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 4) + 3]; // 20k-50k
    else winAmount = CAC_GIA_TRI[Math.floor(Math.random() * 2) + 7]; // 200k-500k

    // 4. Update Database
    const newBal = currentBal - GIA_BOC + winAmount;
    await db.ref('users/' + user).update({ balance: newBal });
    
    db.ref('history/' + user).push({
        product: "🧧 Bốc lì xì may mắn",
        price: GIA_BOC,
        date: new Date().toLocaleString('vi-VN'),
        status: "Trúng +" + winAmount.toLocaleString() + "đ"
    });

    // 5. Hiệu ứng lật
    el.querySelector('.lixi-back').innerText = winAmount.toLocaleString() + "đ";
    el.querySelector('.lixi-back').style.display = 'flex';

    if(winAmount >= 50000) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    setTimeout(() => {
        Swal.fire({
            title: winAmount >= GIA_BOC ? "CHÚC MỪNG!" : "TIẾC QUÁ!",
            html: `Bạn nhận được: <b style="color:red; font-size:25px;">${winAmount.toLocaleString()}đ</b>`,
            icon: winAmount >= GIA_BOC ? 'success' : 'info',
            didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
        }).then(() => {
            dongModalBoc();
            // Reset lại để lần sau bốc tiếp
            el.querySelector('.lixi-back').style.display = 'none';
        });
    }, 800);
}
