/**
 * ============================================================
 * 🧧 HỆ THỐNG BỐC LÌ XÌ PREMIUM - HOANGKUN STORE
 * 🛠️ Version: 6.5.0 (Mã Chẵn - Full Features)
 * 📅 Update: 2026
 * ============================================================
 */

// --- 1. DANH SÁCH MÃ GIFTCODE THEO MỐC CHẴN ---
const FIX_GIFTCODES = {
    5000: ["TANTHU", "CODEFREE", "NHAN_PHAM", "CHAO_MUNG"],
    10000: ["TET2026", "LIXI_MAY_MAN", "SHOPUYTI", "ID_VN_FREE", "LIXITET"],
    20000: ["LIXI20K", "NAMMOI", "HOANGDEPTRAI", "QUAY_LAI_SHOP", "FOLLOW_FB"],
    50000: ["KHAISUAN", "HOANGKUN", "ADMIN_KUN"],
    100000: ["HOANGKUNVIP", "CHAMPION"],
    250000: ["DAI_GIA_NAP_THE"],
    300000: ["TRUM_GIFTCODE"],
    500000: ["CHUTICH"]
};

const LIXI_CONFIG = {
    GIA_VE_LE: 20000,
    MOC_TICH_LUY: 100000,
    ANIMATION_SHAKE: 1500
};

let isProcessing = false;

/**
 * 2. HÀM MỞ MODAL & CẬP NHẬT TRẠNG THÁI
 */
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    if (!modal) return;
    
    modal.style.display = 'flex';
    modal.style.zIndex = "2000000";

    if (!user) {
        document.getElementById('infoLuotBoc').innerHTML = `<b style="color:red">VUI LÒNG ĐĂNG NHẬP</b>`;
        return;
    }

    db.ref('users/' + user).on('value', (snap) => {
        const data = snap.val() || {};
        const infoText = document.getElementById('infoLuotBoc');
        if (infoText) {
            infoText.innerHTML = `
                <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px; border: 1px solid gold; color: #fff;">
                    💰 Ví: <b style="color: #00ff00">${(data.balance || 0).toLocaleString()}đ</b> | 
                    🎁 Lượt: <b style="color: #ffea00">${data.freeTurns || 0}</b>
                </div>
            `;
        }
    });
}

/**
 * 3. LOGIC BỐC LÌ XÌ (TỈ LỆ MỐC CHẴN)
 */
async function bocLixi(el) {
    if (isProcessing) return;
    const user = localStorage.getItem('hoangUser');
    if (!user) return Swal.fire("LỖI", "Bạn cần đăng nhập!", "error");

    try {
        const snapshot = await db.ref('users/' + user).once('value');
        const data = snapshot.val() || {};
        let turns = data.freeTurns || 0;
        let bal = data.balance || 0;

        let useFree = turns > 0;

        if (!useFree) {
            if (bal < LIXI_CONFIG.GIA_VE_LE) return Swal.fire("HẾT TIỀN", "Bạn cần 20k để bốc lẻ!", "error");
            const res = await Swal.fire({
                title: 'BỐC VÉ LẺ?',
                text: "Bạn sẽ dùng 20.000đ trong tài khoản.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ĐỒNG Ý',
                cancelButtonText: 'HỦY',
                confirmButtonColor: '#d33'
            });
            if (!res.isConfirmed) return;
        }

        isProcessing = true;
        el.classList.add('lixi-shaking');

        // Trừ tiền/lượt
        if (useFree) await db.ref('users/' + user).update({ freeTurns: turns - 1 });
        else await db.ref('users/' + user).update({ balance: bal - LIXI_CONFIG.GIA_VE_LE });

        await new Promise(r => setTimeout(r, LIXI_CONFIG.ANIMATION_SHAKE));
        el.classList.remove('lixi-shaking');

        // --- TÍNH TOÁN KẾT QUẢ THEO TỈ LỆ ---
        let rand = Math.random() * 100;
        let winVal = 5000;

        if (rand < 45) winVal = 5000;           // 45% ra 5k
        else if (rand < 75) winVal = 10000;      // 30% ra 10k
        else if (rand < 90) winVal = 20000;      // 15% ra 20k
        else if (rand < 96) winVal = 50000;      // 6% ra 50k
        else if (rand < 98.5) winVal = 100000;   // 2.5% ra 100k
        else if (rand < 99.3) winVal = 250000;   // 0.8% ra 250k
        else if (rand < 99.8) winVal = 300000;   // 0.5% ra 300k
        else winVal = 500000;                    // 0.2% ra 500k (Jackpot)

        // Bốc ngẫu nhiên 1 mã trong mốc tiền trúng
        let codesForValue = FIX_GIFTCODES[winVal];
        let finalCode = codesForValue[Math.floor(Math.random() * codesForValue.length)];

        // Hiệu ứng pháo hoa cho quà từ 20k
        if (winVal >= 20000) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        // HIỂN THỊ KẾT QUẢ
        Swal.fire({
            title: `<span style="color:gold; font-weight:bold;">🎊 CHÚC MỪNG 🎊</span>`,
            html: `
                <div style="background: #111; padding: 20px; border-radius: 15px; border: 2px solid gold;">
                    <p style="color:#fff; margin:0">Bạn đã bốc được bao lì xì:</p>
                    <h2 style="color:#00ff00; font-size: 35px; margin: 10px 0;">${winVal.toLocaleString()}đ</h2>
                    <p style="color:#ffd700; font-size: 12px; margin-bottom: 5px;">MÃ GIFTCODE CỦA BẠN:</p>
                    <div onclick="navigator.clipboard.writeText('${finalCode}'); alert('Đã sao chép!');"
                         style="background: #333; color: gold; padding: 15px; border: 2px dashed gold; font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; cursor: pointer; border-radius: 10px;">
                        ${finalCode}
                    </div>
                    <small style="color:#666; margin-top:10px; display:block;">(Bấm vào mã để copy nhanh)</small>
                </div>`,
            background: 'transparent',
            confirmButtonText: 'BỐC TIẾP',
            confirmButtonColor: '#ff0000',
            allowOutsideClick: false
        });

        // Lưu lịch sử vào Firebase
        db.ref('lixi_history/' + user).push({
            amount: winVal,
            code: finalCode,
            time: new Date().toLocaleString()
        });

        isProcessing = false;

    } catch (e) {
        isProcessing = false;
        console.error(e);
        Swal.fire("LỖI", "Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

function xemTheLe() {
    Swal.fire({
        title: '📜 THỂ LỆ SỰ KIỆN',
        html: `<div style="text-align:left; font-size:14px; line-height:1.6;">
            - Tiêu mỗi <b>100.000đ</b> tặng <b>1 lượt</b> miễn phí.<br>
            - Bốc lẻ: <b>20.000đ/lượt</b> (trừ vào ví).<br>
            - Quà tặng là Giftcode mệnh giá chẵn lên đến 500k.<br>
            - Copy mã và nạp tại mục "Nạp Code" để nhận tiền.
        </div>`,
        icon: 'info'
    });
}
