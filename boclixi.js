// ============================================================
// 🛠️ PHẦN CẤU HÌNH (SỬA GIÁ VÀ CHỮ Ở ĐÂY)
// ============================================================

// 1. GIÁ VÉ KHI HẾT LƯỢT FREE (Để 0 nếu muốn free hoàn toàn)
const GIA_VE = 20000; 

// 2. CÂU THÔNG BÁO KHI KHÁCH "HẾT LƯỢT FREE"
// (Bạn sửa chữ trong dấu `` thoải mái nhé)
const THONG_BAO_HET_LUOT = `
    <span style="color:#ffd700; font-weight:bold;">MUA ĐƠN 100K = TẶNG 1 LƯỢT</span> 
    <br>
    <span style="font-size:11px; color:#aaa;">(Hoặc mua vé lẻ: <b style="color:red">${GIA_VE.toLocaleString()}đ</b>/lượt)</span>
`;

// 3. DANH SÁCH QUÀ (Sửa mã code của bạn ở đây)
const GIFT_MAP = {
    5000: "CODE5K-LIXI",
    10000: "CODE10K-MAYMAN",
    20000: "CODE20K-VUI",
    50000: "VIP50K-HELU",
    100000: "SUPERVIP-100K",
    500000: "JACKPOT-500K"
};

// ============================================================
// ⛔ CODE XỬ LÝ (KHÔNG CẦN SỬA DƯỚI NÀY)
// ============================================================

// 1. HÀM MỞ BẢNG & HIỂN THỊ SỐ LƯỢT
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = "2000000"; 
    }

    if(!user) return; 

    // Kiểm tra số lượt Free hiện có
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const freeTurns = userData.freeTurns || 0; 

    const infoText = document.getElementById('infoLuotBoc');
    if(infoText) {
        if(freeTurns > 0) {
            // NẾU CÒN LƯỢT FREE -> Hiện màu xanh
            infoText.innerHTML = `
                BẠN CÓ <b style="color:#00ff00; font-size:16px; border:1px solid #00ff00; padding:2px 8px; border-radius:5px;">${freeTurns}</b> LƯỢT FREE
                <br><span style="font-size:11px; color:#ccc;">(Ưu tiên dùng lượt này trước)</span>
            `;
        } else {
            // NẾU HẾT LƯỢT -> Hiện câu thông báo mua hàng/mua vé
            infoText.innerHTML = THONG_BAO_HET_LUOT;
        }
    }
}

// 2. ĐÓNG BẢNG
function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// 3. XỬ LÝ BỐC (QUẢN LÝ TRỪ LƯỢT/TRỪ TIỀN)
async function bocLixi(el) {
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Yêu cầu", "Vui lòng đăng nhập!", "warning");

    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;
    const freeTurns = userData.freeTurns || 0;

    let useFreeTurn = false;

    // --- LOGIC KIỂM TRA LƯỢT ---
    if (freeTurns > 0) {
        // Có lượt Free -> Hỏi dùng
        const confirm = await Swal.fire({
            title: 'DÙNG LƯỢT FREE?',
            html: `Bạn đang có <b>${freeTurns}</b> lượt miễn phí.<br>Dùng ngay nhé?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'DÙNG LUÔN',
            confirmButtonColor: '#00ff00',
            background: '#000', color: '#fff'
        });
        if(!confirm.isConfirmed) return;
        useFreeTurn = true;

    } else {
        // Hết lượt Free -> Check tiền (Nếu giá vé > 0)
        if (GIA_VE > 0) {
            if(currentBal < GIA_VE) {
                return Swal.fire({
                    title: "KHÔNG ĐỦ TIỀN",
                    text: `Vé bốc giá ${GIA_VE.toLocaleString()}đ. Bạn còn thiếu tiền!`,
                    icon: "error"
                });
            }
            const confirm = await Swal.fire({
                title: 'MUA VÉ BỐC?',
                html: `Hết lượt Free rồi. Bạn có muốn dùng <b style="color:red">${GIA_VE.toLocaleString()}đ</b> để bốc không?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'CHƠI LUÔN',
                confirmButtonColor: '#d33',
                background: '#000', color: '#fff'
            });
            if(!confirm.isConfirmed) return;
        }
    }

    // --- CẬP NHẬT DATABASE (TRỪ LƯỢT/TIỀN) ---
    if(useFreeTurn) {
        await db.ref('users/' + user).update({ freeTurns: freeTurns - 1 });
    } else {
        if(GIA_VE > 0) {
            await db.ref('users/' + user).update({ balance: currentBal - GIA_VE });
        }
    }

    // --- HIỆU ỨNG RUNG LẮC (0.8s) ---
    el.classList.add('lixi-shaking');
    await new Promise(resolve => setTimeout(resolve, 800)); 
    el.classList.remove('lixi-shaking');

    // --- RANDOM KẾT QUẢ ---
    let random = Math.random() * 100;
    let winVal = 5000;
    
    // Tỉ lệ trúng
    if(random < 60) winVal = 5000;
    else if(random < 85) winVal = 10000;
    else if(random < 95) winVal = 20000;
    else if(random < 99) winVal = 50000;
    else winVal = 500000;

    let giftCode = GIFT_MAP[winVal] || "LIXI-MAYMAN";

    // --- HIỂN THỊ KẾT QUẢ ---
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex'; 
    dongModalBoc(); // Ẩn bảng 9 ô đi

    // Bắn pháo hoa
    if(winVal >= 20000 && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // Hiện bảng Chúc Mừng + Mã Code
    Swal.fire({
        title: `<span style="color:#ffd700; text-transform:uppercase; font-size:24px;">🎉 CHÚC MỪNG 🎉</span>`,
        html: `
            <div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:20px; border-radius:15px; border:1px solid #ffea00; box-shadow: 0 0 15px #ffea00;">
                <div style="margin-bottom:15px; animation: bounce 2s infinite;">
                    <i class="fas fa-gift" style="font-size:60px; color:#ff0000; text-shadow:0 0 10px #ffea00;"></i>
                </div>
                <p style="color:#fff;">Giá trị phần thưởng:</p>
                <p style="color:#00ff00; font-size:32px; font-weight:bold; margin:10px 0;">${winVal.toLocaleString()}đ</p>
                
                <div style="margin:20px 0;">
                    <p style="color:#aaa; font-size:12px; margin-bottom:5px;">Mã quà tặng của bạn:</p>
                    <div onclick="navigator.clipboard.writeText('${giftCode}'); Swal.showValidationMessage('Đã sao chép!');" 
                         style="background:#333; padding:15px; border:2px dashed #ffd700; border-radius:10px; color:#ffd700; font-size:20px; font-weight:bold; cursor:pointer; display:flex; justify-content:center; gap:10px;">
                        <span>${giftCode}</span> <i class="fas fa-copy" style="color:#fff;"></i>
                    </div>
                </div>
                
                <p style="font-size:11px; color:#666;">(Còn lại: <b>${useFreeTurn ? freeTurns - 1 : freeTurns}</b> lượt Free)</p>
            </div>
        `,
        background: 'transparent',
        showConfirmButton: true,
        confirmButtonText: "BỐC TIẾP",
        confirmButtonColor: "#d32f2f",
        allowOutsideClick: false,
        didOpen: () => { Swal.getContainer().style.zIndex = "99999999"; }
    }).then((res) => {
        if(res.isConfirmed) moModalBoc();
    });
}

// 4. HÀM TÍCH LŨY (CẦN GẮN VÀO NÚT MUA HÀNG)
// Cứ mua 100k là được cộng 1 lượt
async function tichLuyLuotBoc(user, amount) {
    if(!user) return;
    const snapshot = await db.ref('users/' + user).once('value');
    const data = snapshot.val();
    let currentSpent = data.totalSpent || 0; 
    let currentTurns = data.freeTurns || 0; 
    let newSpent = currentSpent + amount;
    
    // Logic: Chia cho 100000 lấy phần nguyên
    let oldLevel = Math.floor(currentSpent / 100000);
    let newLevel = Math.floor(newSpent / 100000);
    let gainedTurns = newLevel - oldLevel;

    if (gainedTurns > 0) {
        await db.ref('users/' + user).update({
            totalSpent: newSpent,
            freeTurns: currentTurns + gainedTurns
        });
        Swal.fire({
            title: "QUÀ TẶNG 🎁",
            text: `Bạn nhận được ${gainedTurns} lượt bốc Lì Xì Free do mua đơn hàng > 100k!`,
            icon: "success",
            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
        });
    } else {
        await db.ref('users/' + user).update({ totalSpent: newSpent });
    }
}

// 5. XEM THỂ LỆ
function xemTheLe() {
    Swal.fire({
        title: '📜 LUẬT CHƠI',
        html: `
            <div style="text-align:left; font-size:14px;">
                <p>1️⃣ <b>Nhận lượt Free:</b> Mua source code tích lũy đủ <b>100k</b> tặng <b>1 lượt</b>.</p>
                <p>2️⃣ <b>Mua vé lẻ:</b> Hết lượt Free có thể mua vé giá <b>${GIA_VE.toLocaleString()}đ</b>.</p>
                <p>3️⃣ <b>Giải thưởng:</b> 100% trúng Giftcode giá trị cao.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonColor: '#d32f2f',
        didOpen: () => { Swal.getContainer().style.zIndex = "99999999"; }
    });
}
