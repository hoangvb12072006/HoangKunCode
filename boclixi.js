/**
 * ============================================================
 * 🧧 HỆ THỐNG BỐC LÌ XÌ PREMIUM - HOANGKUN STORE
 * 🛠️ Version: 5.5.0 (Full Features & Fixed & Beauty)
 * 📅 Update: 2026
 * ============================================================
 */

// --- 1. CẤU HÌNH HỆ THỐNG ---
const LIXI_CONFIG = {
    GIA_VE_LE: 20000,
    MOC_TICH_LUY: 100000, 
    COOLDOWN_TIME: 2000,  
    ANIMATION_SHAKE: 1200 
};

// --- 2. DANH SÁCH MÃ QUÀ TẶNG ---
const GIFT_DATA = {
    5000:   { code: "KUN5K-HETLOC",   label: "Lì Xì Khởi Nghiệp" },
    10000:  { code: "KUN10K-MAYMAN",  label: "Lộc Phát Đầu Năm" },
    20000:  { code: "KUN20K-THANHTAI", label: "Thần Tài Gõ Cửa" },
    50000:  { code: "KUNVIP-50K",      label: "Đại Gia Tới Chơi" },
    100000: { code: "KUNVIP-100K",     label: "Nổ Hũ Cực Mạnh" },
    500000: { code: "JACKPOT-999K",    label: "Chúa Tể Lì Xì" }
};

let isProcessing = false;

/**
 * 3. HÀM TÍCH LŨY TIÊU DÙNG (GỌI KHI MUA HÀNG)
 */
async function tichLuyLuotBoc(user, amount) {
    if (!user || isNaN(amount)) return;
    try {
        const snapshot = await db.ref('users/' + user).once('value');
        const data = snapshot.val() || {};
        let totalSpent = data.totalSpent || 0;
        let freeTurns = data.freeTurns || 0;
        let newSpent = totalSpent + amount;

        let oldMoc = Math.floor(totalSpent / LIXI_CONFIG.MOC_TICH_LUY);
        let newMoc = Math.floor(newSpent / LIXI_CONFIG.MOC_TICH_LUY);
        let bonus = newMoc - oldMoc;

        if (bonus > 0) {
            await db.ref('users/' + user).update({
                totalSpent: newSpent,
                freeTurns: freeTurns + bonus
            });
            Swal.fire({
                title: '🎁 QUÀ TẶNG TRI ÂN 🎁',
                html: `Tổng tiêu dùng đạt mốc <b>${newMoc * 100}k</b>!<br>Bạn nhận được <b style="color:#ff0000; font-size:25px;">+${bonus}</b> lượt Lì Xì Free.`,
                icon: 'success',
                confirmButtonColor: '#d33'
            });
        } else {
            await db.ref('users/' + user).update({ totalSpent: newSpent });
        }
    } catch (error) { console.error("❌ Lỗi tích lũy:", error); }
}

/**
 * 4. HÀM MỞ BẢNG LÌ XÌ & KIỂM TRA LƯỢT (REALTIME)
 */
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    if (!modal) return;
    
    modal.style.display = 'flex';
    modal.style.zIndex = "2000000";

    if (!user) {
        document.getElementById('infoLuotBoc').innerHTML = `<span style="color:#ffea00">Vui lòng đăng nhập!</span>`;
        return;
    }

    // Lắng nghe realtime để cập nhật số dư/lượt ngay trong modal
    db.ref('users/' + user).on('value', (snap) => {
        const data = snap.val() || {};
        const turns = data.freeTurns || 0;
        const balance = data.balance || 0;
        const infoText = document.getElementById('infoLuotBoc');
        
        if (infoText) {
            infoText.innerHTML = `
                <div style="color: #fff; font-size: 14px;">
                    💰 Ví: <b style="color: #00ff00">${balance.toLocaleString()}đ</b> | 
                    🎁 Lượt: <b style="color: #ffea00">${turns}</b>
                </div>
            `;
        }
    });
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

/**
 * 5. LOGIC BỐC LÌ XÌ (SỬA LỖI POPUP Ở SẢNH)
 */
async function bocLixi(el) {
    if (isProcessing) return;
    const user = localStorage.getItem('hoangUser');
    if (!user) return Swal.fire("THÔNG BÁO", "Bạn cần đăng nhập!", "warning");

    try {
        isProcessing = true;
        const snapshot = await db.ref('users/' + user).once('value');
        const data = snapshot.val() || {};
        const currentBal = data.balance || 0;
        const freeTurns = data.freeTurns || 0;

        let useFree = false;

        // KIỂM TRA ĐIỀU KIỆN (Hiển thị popup xác nhận đè lên Modal)
        if (freeTurns > 0) {
            useFree = true; // Ưu tiên dùng lượt free luôn cho mượt
        } else {
            if (currentBal < LIXI_CONFIG.GIA_VE_LE) {
                isProcessing = false;
                return Swal.fire({
                    title: "HẾT TIỀN",
                    text: `Bạn cần ${LIXI_CONFIG.GIA_VE_LE.toLocaleString()}đ để bốc lẻ.`,
                    icon: "error",
                    confirmButtonColor: '#d33'
                });
            }
            const res = await Swal.fire({
                title: 'XÁC NHẬN',
                text: `Dùng 20.000đ để bốc bao này?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'BỐC LUÔN',
                cancelButtonText: 'HỦY',
                confirmButtonColor: '#d33'
            });
            if (!res.isConfirmed) { isProcessing = false; return; }
        }

        // --- BẮT ĐẦU HIỆU ỨNG ---
        if (useFree) {
            await db.ref('users/' + user).update({ freeTurns: freeTurns - 1 });
        } else {
            await db.ref('users/' + user).update({ balance: currentBal - LIXI_CONFIG.GIA_VE_LE });
        }

        el.classList.add('lixi-shaking');
        await new Promise(r => setTimeout(r, LIXI_CONFIG.ANIMATION_SHAKE));
        el.classList.remove('lixi-shaking');

        // TÍNH QUÀ
        let rand = Math.random() * 100;
        let winVal = rand < 35 ? 5000 : rand < 70 ? 10000 : rand < 85 ? 20000 : rand < 95 ? 50000 : rand < 99 ? 100000 : 500000;
        let gift = GIFT_DATA[winVal];

        // LƯU LỊCH SỬ (Tính năng mới)
        db.ref('lixi_history/' + user).push({
            giftName: gift.label,
            amount: winVal,
            code: gift.code,
            time: new Date().toLocaleString()
        });

        // HIỆU ỨNG TRÚNG THƯỞNG
        if (winVal >= 20000) confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });

        Swal.fire({
            title: `<span style="color:#ffd700; text-shadow: 0 0 10px red;">🎊 CHÚC MỪNG 🎊</span>`,
            html: `
                <div style="background: #000; padding: 20px; border-radius: 20px; border: 2px solid #ffea00;">
                    <p style="color:#fff;">Bạn nhận được Lì Xì:</p>
                    <p style="color:#00ff00; font-size: 30px; font-weight: 900;">${winVal.toLocaleString()}đ</p>
                    <div onclick="navigator.clipboard.writeText('${gift.code}'); alert('Đã copy mã!');"
                         style="background: #222; color: #ffea00; padding: 12px; border: 2px dashed #ffea00; font-family: monospace; font-size: 18px; cursor: pointer;">
                        ${gift.code}
                    </div>
                    <small style="color:#888; margin-top:10px; display:block;">(Ấn vào mã để copy)</small>
                </div>`,
            background: 'transparent',
            confirmButtonText: 'BỐC TIẾP',
            confirmButtonColor: '#ff0000'
        }).then(() => { isProcessing = false; });

    } catch (err) {
        isProcessing = false;
        Swal.fire("LỖI", "Kết nối thất bại!", "error");
    }
}

/**
 * 6. TIỆN ÍCH: THỂ LỆ & LỊCH SỬ
 */
function xemTheLe() {
    Swal.fire({
        title: '📜 THỂ LỆ SỰ KIỆN',
        html: `<div style="text-align: left; font-size: 14px;">
                <p>• <b>Lượt Free:</b> Tiêu đủ 100k nhận 1 lượt.</p>
                <p>• <b>Vé Lẻ:</b> 20k/lượt bốc trực tiếp.</p>
                <p>• <b>Sử dụng:</b> Copy Giftcode và nhập vào mục 'Nạp Code'.</p>
               </div>`,
        icon: 'info'
    });
}

async function xemLichSu() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return;
    const snap = await db.ref('lixi_history/' + user).limitToLast(5).once('value');
    let html = '<div style="text-align:left; max-height:200px; overflow-y:auto; color:#333;">';
    if(!snap.exists()) html += "Bạn chưa bốc lần nào!";
    snap.forEach(child => {
        const item = child.val();
        html += `<p style="border-bottom:1px solid #eee; padding:5px 0;">🧧 <b>${item.amount.toLocaleString()}đ</b> <br> <small>${item.time}</small></p>`;
    });
    html += '</div>';
    Swal.fire({ title: '🕒 LỊCH SỬ CỦA BẠN', html: html });
}

// Đóng modal bằng ESC
window.addEventListener('keydown', (e) => { if (e.key === "Escape") dongModalBoc(); });
