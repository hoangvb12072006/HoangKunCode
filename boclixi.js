const GIFT_CODES = {
    5000: ["TANTHU", "CODEFREE", "NHAN_PHAM", "CHAO_MUNG"],
    10000: ["TET2026", "LIXI_MAY_MAN", "SHOPUYTI", "ID_VN_FREE", "LIXITET"],
    20000: ["LIXI20K", "NAMMOI", "HOANGDEPTRAI", "QUAY_LAI_SHOP", "FOLLOW_FB"],
    50000: ["KHAISUAN", "HOANGKUN", "ADMIN_KUN"],
    100000: ["HOANGKUNVIP", "CHAMPION"],
    250000: ["DAI_GIA_NAP_THE"],
    300000: ["TRUM_GIFTCODE"],
    500000: ["CHUTICH"]
};

let isRunning = false;

// Hàm mở bảng bốc lì xì
function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    if (!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập!", "error");
    document.getElementById('modalBocLixi').style.display = 'flex';
    
    // Đồng bộ tiền và lượt từ Firebase
    db.ref('users/' + user).on('value', (snap) => {
        const data = snap.val() || {};
        document.getElementById('lx-balance').innerText = (data.balance || 0).toLocaleString() + 'đ';
        document.getElementById('lx-turns').innerText = data.freeTurns || 0;
    });
}

function closeLixi() { document.getElementById('modalBocLixi').style.display = 'none'; }

// Hàm xử lý khi khách bấm vào bao lì xì
async function startBocLixi(el) {
    if (isRunning) return;
    const user = localStorage.getItem('hoangUser');
    const snap = await db.ref('users/' + user).once('value');
    const data = snap.val() || {};
    
    let turns = data.freeTurns || 0;
    if (turns <= 0 && data.balance < 20000) return Swal.fire("Hết lượt", "Bạn cần 20k để bốc lẻ!", "warning");

    isRunning = true;
    el.classList.add('shaking');
    
    // Trừ lượt hoặc trừ tiền
    if (turns > 0) await db.ref('users/' + user).update({ freeTurns: turns - 1 });
    else await db.ref('users/' + user).update({ balance: data.balance - 20000 });

    setTimeout(() => {
        el.classList.remove('shaking');
        // Tỷ lệ trúng (Ví dụ: 50% trúng 5k, 1% trúng 500k...)
        let rand = Math.random() * 100;
        let winVal = 5000;
        if (rand > 99) winVal = 500000;
        else if (rand > 95) winVal = 100000;
        else if (rand > 80) winVal = 20000;
        else if (rand > 50) winVal = 10000;

        let code = GIFT_CODES[winVal][Math.floor(Math.random() * GIFT_CODES[winVal].length)];
        
        // Hiệu ứng pháo hoa
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        Swal.fire({
            title: '🎉 CHÚC MỪNG!',
            html: `Bạn nhận được lì xì <b>${winVal.toLocaleString()}đ</b><br><br>Mã code: <b style="color:red; font-size:20px;">${code}</b><br><br><small>Bấm copy và nạp tại mục Nạp Code nhé!</small>`,
            confirmButtonText: 'SAO CHÉP MÃ'
        }).then(() => {
            navigator.clipboard.writeText(code);
            alert("Đã copy mã!");
        });

        // Lưu lịch sử
        db.ref('lixi_history/' + user).push({ amount: winVal, code: code, time: new Date().toLocaleString() });
        isRunning = false;
    }, 1500);
}

function showTheLe() {
    Swal.fire("Thể lệ", "Tiêu 100k tặng 1 lượt bốc. Bốc lẻ 20k/lượt. Mã code dùng để nạp tiền vào tài khoản.", "info");
}

async function showLichSu() {
    const user = localStorage.getItem('hoangUser');
    const snap = await db.ref('lixi_history/' + user).limitToLast(5).once('value');
    let txt = "5 lần gần nhất:\n";
    snap.forEach(item => { txt += `- ${item.val().amount}đ: ${item.val().code}\n`; });
    Swal.fire("Lịch sử", txt || "Chưa có dữ liệu", "info");
}
