// --- CẤU HÌNH ---
const Bốc Lì Xì Ngẫu Nhiên;
const GIFT_MAP = {
    5000: "TANTHU",
    10000: "LIXITET",
    20000: "NAMMOI",
    50000: "HOANGKUN",
    100000: "HOANGKUNVIP",
    500000: "CHUTICH"
};

// 1. Hàm mở bảng & Hiển thị số lượt Free
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập!", "error");

    // Lấy thông tin lượt Free từ Firebase
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const freeTurns = userData.freeTurns || 0;

    // Cập nhật giao diện hiển thị
    const infoText = document.getElementById('infoLuotBoc');
    if(infoText) {
        if(freeTurns > 0) {
            infoText.innerHTML = `Bạn có <b style="color:#00ff00; font-size:16px;">${freeTurns}</b> lượt MIỄN PHÍ!`;
        } else {
            infoText.innerHTML = `Phí: <b style="color:#ff0000;">20.000đ</b> / Lượt`;
        }
    }

    const modal = document.getElementById('modalBocLixi');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = "9999999"; 
    }
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// 2. Hàm Bốc Lì Xì (Xử lý ưu tiên lượt Free)
async function bocLixi(el) {
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    
    const currentBal = userData.balance || 0;
    const freeTurns = userData.freeTurns || 0; // Lấy số lượt Free

    let isFree = false;

    // --- LOGIC QUYẾT ĐỊNH TRỪ TIỀN HAY TRỪ LƯỢT ---
    if (freeTurns > 0) {
        // Nếu có lượt Free -> Hỏi dùng lượt
        const confirmFree = await Swal.fire({
            title: 'DÙNG LƯỢT MIỄN PHÍ?',
            html: `Bạn đang có <b>${freeTurns}</b> lượt bốc free.<br>Dùng ngay nhé?`,
            icon: 'star',
            showCancelButton: true,
            confirmButtonText: 'DÙNG LUÔN',
            confirmButtonColor: '#ffea00',
            cancelButtonText: 'Để dành',
            background: '#000',
            color: '#fff'
        });
        if(!confirmFree.isConfirmed) return;
        isFree = true;
    } else {
        // Nếu không có lượt Free -> Trừ tiền 20k
        if(currentBal < GIA_BOC) {
            return Swal.fire({
                title: "THIẾU TIỀN",
                text: `Cần ${GIA_BOC.toLocaleString()}đ để bốc!`,
                icon: "warning"
            });
        }
        const confirm = await Swal.fire({
            title: 'XÁC NHẬN MUA?',
            text: `Phí bốc là ${GIA_BOC.toLocaleString()}đ. Chơi không?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'CHƠI LUÔN',
            confirmButtonColor: '#d33'
        });
        if(!confirm.isConfirmed) return;
    }

    // --- CẬP NHẬT DATABASE ---
    if (isFree) {
        // Trừ 1 lượt Free
        await db.ref('users/' + user).update({ freeTurns: freeTurns - 1 });
    } else {
        // Trừ tiền
        await db.ref('users/' + user).update({ balance: currentBal - GIA_BOC });
    }

    // --- RANDOM KẾT QUẢ ---
    let random = Math.random() * 100;
    let winVal = 5000;
    if(random < 60) winVal = 5000;
    else if(random < 85) winVal = 10000;
    else if(random < 98) winVal = 50000;
    else winVal = 500000;

    let giftCode = GIFT_MAP[winVal] || "TANTHU";

    // Hiệu ứng
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex';
    if(winVal >= 50000) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Hiện quà
    setTimeout(() => {
        Swal.fire({
            title: `<span style="color:#ffd700">🎁 QUÀ CỦA BẠN 🎁</span>`,
            html: `
                <div style="background:#000; padding:15px; border-radius:10px; border:1px solid #333;">
                    <p style="color:#fff;">Giá trị: <b style="color:red; font-size:20px;">${winVal.toLocaleString()}đ</b></p>
                    <div style="margin:15px 0; padding:10px; border:2px dashed #ffd700; color:#ffd700; font-size:28px; font-weight:bold; cursor:pointer;" 
                         onclick="navigator.clipboard.writeText('${giftCode}'); alert('Đã copy mã!')">
                        ${giftCode}
                    </div>
                    <p style="font-size:12px; color:#888;">(Bạn còn: <b>${isFree ? freeTurns - 1 : freeTurns}</b> lượt free)</p>
                </div>
            `,
            backdrop: `rgba(0,0,0,0.9)`,
            confirmButtonText: "ĐÓNG",
            confirmButtonColor: "#d33"
        }).then(() => {
            dongModalBoc();
            lixiBack.style.display = 'none';
        });
    }, 500);
}

// 3. HÀM TÍCH LŨY (Gắn hàm này vào nút Mua code của bạn)
// Khi khách mua code 20k, gọi: tichLuyLuotBoc(username, 20000)
async function tichLuyLuotBoc(user, amount) {
    if(!user) return;
    const snapshot = await db.ref('users/' + user).once('value');
    const data = snapshot.val();
    
    let currentSpent = data.totalSpent || 0; // Tổng tiền đã tiêu từ trước
    let currentTurns = data.freeTurns || 0; // Số lượt free hiện có

    let newSpent = currentSpent + amount;
    
    // Logic: Cứ mỗi 100k tiêu thêm thì được 1 lượt
    // Ví dụ: Cũ 90k, mua 20k -> Mới 110k -> Đủ 100k -> Cộng 1 lượt
    let gainedTurns = Math.floor(newSpent / 100000) - Math.floor(currentSpent / 100000);

    if (gainedTurns > 0) {
        await db.ref('users/' + user).update({
            totalSpent: newSpent,
            freeTurns: currentTurns + gainedTurns
        });
        Swal.fire("QUÀ TẶNG", `Bạn nhận được ${gainedTurns} lượt bốc lì xì miễn phí do mua hàng!`, "success");
    } else {
        await db.ref('users/' + user).update({ totalSpent: newSpent });
    }
}

// --- HÀM HIỆN BẢNG THỂ LỆ ---
function xemTheLe() {
    Swal.fire({
        title: '📜 LUẬT CHƠI & QUY ĐỊNH',
        html: `
            <div style="text-align: left; font-size: 14px; color: #333;">
                <p>1️⃣ <b>CÁCH NHẬN LƯỢT FREE:</b></p>
                <ul style="margin-top:5px; margin-bottom:15px; padding-left:20px;">
                    <li>Khách hàng mua Source Code với tổng giá trị đơn hàng <b style="color:red">≥ 100.000đ</b>.</li>
                    <li>Hệ thống tự động tặng <b>1 lượt bốc</b> ngay sau khi thanh toán.</li>
                </ul>

                <hr style="border-top: 1px dashed #ccc;">

                <p>2️⃣ <b>MUA VÉ LẺ:</b></p>
                <ul style="margin-top:5px; margin-bottom:15px; padding-left:20px;">
                    <li>Nếu chưa đủ 100k, bạn có thể mua lượt chơi bằng số dư.</li>
                    <li>Giá vé: <b style="color:red">20.000đ / lượt</b>.</li>
                </ul>

                <hr style="border-top: 1px dashed #ccc;">

                <p>3️⃣ <b>GIẢI THƯỞNG:</b></p>
                <ul style="margin-top:5px; padding-left:20px;">
                    <li>100% trúng mã Giftcode tiền mặt.</li>
                    <li>Giải thưởng từ: <b>5k, 10k, 50k... đến 500k</b>.</li>
                    <li>Mã trúng dùng để nhập vào mục Giftcode đổi ra tiền thật.</li>
                </ul>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'ĐÃ HIỂU LUẬT CHƠI',
        confirmButtonColor: '#d32f2f', // Màu đỏ cho nút
        backdrop: `rgba(0,0,0,0.8)`
    });
}
