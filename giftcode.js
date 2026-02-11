// --- DANH SÁCH MÃ GIFTCODE (Update 2026) ---
const validCodes = {
    // === NHÓM CODE TẾT (Số lượng lớn) ===
    "LIXI20K": 20000,
    "TET2026": 10000,
    "LIXITET": 15000,
    "NAMMOI": 20000,
    "KHAISUAN": 50000,
    "PHATLOC": 88000,
    "DAI_CAT": 33333,

    // === NHÓM CODE THƯƠNG HIỆU ===
    "HOANGKUN": 50000,
    "HOANGKUNVIP": 100000,
    "HOANGDEPTRAI": 20000,
    "SHOPUYTI": 10000,
    "ADMIN_KUN": 50000,

    // === NHÓM CODE TÂN THỦ & MIỄN PHÍ ===
    "TANTHU": 5000,
    "CODEFREE": 5000,
    "TESTNV": 10000,
    "KHOINGHIEP": 15000,
    "CHAO_MUNG": 10000,

    // === NHÓM CODE VIP (Mệnh giá cao) ===
    "VIPMEMBER": 50000,
    "SUPERVIP": 200000,
    "TRIAN": 30000,
    "LOVEHOANGKUN": 25000,
    "KHACHHANGTHANTHIET": 70000,
    "GIAM_GIA_99K": 99000,
    "CHUTICH": 500000, // Code siêu VIP cho khách nạp nhiều

    // === NHÓM CODE BỔ SUNG ===
    "LIXI30K": 30000,
    "GIFT88K": 88000,
    "MAYMAN": 12000,
    "UP_TOP": 40000
};

// --- LOGIC XỬ LÝ (GIỮ NGUYÊN) ---
function moModalCode() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập để nhập Code!", "error");
    const modal = document.getElementById('modalGiftcode');
    if(modal) modal.style.display = 'flex';
}

function dongModalCode() {
    const modal = document.getElementById('modalGiftcode');
    if(modal) modal.style.display = 'none';
}

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

                db.ref('history/' + user).push({
                    product: "🎁 Giftcode: " + code,
                    price: 0,
                    date: new Date().toLocaleString('vi-VN'),
                    link: "#",
                    status: "Đã nhận +" + rewardAmount.toLocaleString() + "đ"
                });

                dongModalCode();
                codeInput.value = "";
                Swal.fire({
                    title: "NHẬN THƯỞNG THÀNH CÔNG!",
                    html: `Bạn vừa nhập mã <b>${code}</b><br>Nhận được: <b style="color:red; font-size:20px;">+${rewardAmount.toLocaleString()}đ</b>`,
                    icon: "success"
                });
            });
        }
    });
}
