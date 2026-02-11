// --- DANH SÁCH MÃ GIFTCODE (Update 2026) ---
const validCodes = {
    "LIXI20K": 20000, "TET2026": 10000, "LIXITET": 15000, "NAMMOI": 20000,
    "KHAISUAN": 50000, "PHATLOC": 88000, "DAI_CAT": 33333, "AN_KHANG": 22000,
    "THINH_VUONG": 22000, "VAN_SU_NHU_Y": 45000, "LIXI_MAY_MAN": 10000,
    "BAO_LIXI_DO": 15000, "HOANGKUN": 50000, "HOANGKUNVIP": 100000,
    "HOANGDEPTRAI": 20000, "SHOPUYTI": 10000, "ADMIN_KUN": 50000,
    "HOANGKUNCODE": 30000, "ID_VN_FREE": 10000, "KUN_MMO": 25000,
    "SUPERSALE": 99000, "GIFT_TRI_AN": 35000, "MA_VIP_PRO": 150000,
    "CHUTICH": 500000, "DAI_GIA_NAP_THE": 250000, "TRUM_GIFTCODE": 300000,
    "FREE_MONEY_99": 99999, "MAYMAN": 12000, "NHAN_PHAM": 5000,
    "XUI_GHE": 1000, "GIAU_SANG": 77000, "PHAT_TAI_ROI": 88888,
    "TANTHU": 5000, "CODEFREE": 5000, "TESTNV": 10000, "KHOINGHIEP": 15000,
    "CHAO_MUNG": 10000, "QUAY_LAI_SHOP": 20000, "FOLLOW_FB": 10000,
    "THU_THACH": 30000, "CHAMPION": 100000, "FAN_CUNG": 40000,
    "LIXI30K": 30000, "UP_TOP": 40000
};

// --- 1. HIỆU ỨNG CHÚC MỪNG (PHÁO HOA & MƯA TIỀN) ---
function banPhaoHoa() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000000 };

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        // Bắn pháo hoa hai bên
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
    }, 250);
}

// --- 2. LOGIC MỞ/ĐÓNG MODAL (Đã sửa lỗi viết hoa) ---
// Đổi chữ m thành M ở tên hàm moModalCode
function moModalCode() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập để nhập Code!", "error");
    
    const modal = document.getElementById('modalGiftcode');
    if(modal) {
        modal.style.display = 'flex';
    }
}

function dongModalCode() {
    const modal = document.getElementById('modalGiftcode');
    if(modal) modal.style.display = 'none';
}

// --- 3. XỬ LÝ NHẬP CODE ---
function xulyNhapCode() {
    const codeInput = document.getElementById('inputGiftCode');
    const code = codeInput.value.trim().toUpperCase();
    const user = localStorage.getItem('hoangUser');

    if (!code) return Swal.fire("Lỗi", "Vui lòng nhập mã Code!", "warning");
    if (!validCodes[code]) return Swal.fire("Thất bại", "Mã không đúng hoặc đã hết hạn!", "error");

    const rewardAmount = validCodes[code];
    const codeRef = db.ref('users/' + user + '/used_codes/' + code);
    
    codeRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            Swal.fire("Tiếc quá", "Bạn đã sử dụng mã này rồi!", "info");
        } else {
            db.ref('users/' + user).once('value').then(userSnap => {
                const currentBal = userSnap.val().balance || 0;
                db.ref('users/' + user).update({ balance: currentBal + rewardAmount });
                codeRef.set(true); 

                // Lưu lịch sử
                db.ref('history/' + user).push({
                    product: "🎁 Giftcode: " + code,
                    price: 0,
                    date: new Date().toLocaleString('vi-VN'),
                    link: "#",
                    status: "Đã nhận +" + rewardAmount.toLocaleString() + "đ"
                });

                dongModalCode();
                codeInput.value = "";
                
                // KÍCH HOẠT PHÁO HOA
                banPhaoHoa();

                Swal.fire({
                    title: "NHẬN THƯỞNG THÀNH CÔNG!",
                    html: `Bạn vừa nhập mã <b>${code}</b><br>Nhận được: <b style="color:red; font-size:24px;">+${rewardAmount.toLocaleString()}đ</b>`,
                    icon: "success",
                    backdrop: `rgba(0,0,123,0.4) url("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueW9ueXN6bm9ueXN6bm9ueXN6bm9ueXN6bm9ueXN6bm9ueXN6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/26tOZ4GO9G4v9n9S0/giphy.gif") center top no-repeat`
                });
            });
        }
    });
}
