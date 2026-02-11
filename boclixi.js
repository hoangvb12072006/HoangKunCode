/**
 * ============================================================
 * 🧧 HỆ THỐNG BỐC LÌ XÌ PREMIUM - HOANGKUN STORE
 * 🛠️ Version: 5.0.0 (Full Features & Fixed)
 * 📅 Update: 2026
 * ============================================================
 */

// --- 1. CẤU HÌNH HỆ THỐNG ---
const LIXI_CONFIG = {
    GIA_VE_LE: 20000,
    MOC_TICH_LUY: 100000, // Cứ tiêu 100k tặng 1 lượt
    COOLDOWN_TIME: 2000,  // Chống click nhanh (2 giây)
    ANIMATION_SHAKE: 1200 // Thời gian rung lắc (ms)
};

// --- 2. DANH SÁCH MÃ QUÀ TẶNG ---
const GIFT_DATA = {
    5000:   { code: "KUN5K-HETLOC",   label: "Lì Xì Khởi Nghiệp" },
    10000:  { code: "KUN10K-MAYMAN",  label: "Lộc Phát Đầu Năm" },
    20000:  { code: "KUN20K-THANHTAI", label: "Thần Tài Gõ Cửa" },
    50000:  { code: "KUNVIP-50K",      label: "Đại Gia Tới Chơi" },
    100000: { code: "KUNVIP-100K",     label: "Nổ Hũ Cực Mạnh" },
    500000: { code: "JACKPOT-999K",    label: "Chúa Tể Của Những Chiếc Lì Xì" }
};

let isProcessing = false; // Biến trạng thái chống spam

/**
 * ============================================================
 * 3. HÀM TÍCH LŨY TIÊU DÙNG (GỌI KHI MUA HÀNG)
 * ============================================================
 */
async function tichLuyLuotBoc(user, amount) {
    if (!user || isNaN(amount)) {
        console.error("❌ Dữ liệu tích lũy không hợp lệ!");
        return;
    }

    console.log(`[Hệ thống] Đang tích lũy ${amount}đ cho user: ${user}`);

    try {
        const snapshot = await db.ref('users/' + user).once('value');
        const data = snapshot.val() || {};
        
        let totalSpent = data.totalSpent || 0;
        let freeTurns = data.freeTurns || 0;
        let newSpent = totalSpent + amount;

        // Tính số lượt được tặng dựa trên mốc 100k
        let oldMoc = Math.floor(totalSpent / LIXI_CONFIG.MOC_TICH_LUY);
        let newMoc = Math.floor(newSpent / LIXI_CONFIG.MOC_TICH_LUY);
        let bonus = newMoc - oldMoc;

        if (bonus > 0) {
            await db.ref('users/' + user).update({
                totalSpent: newSpent,
                freeTurns: freeTurns + bonus
            });

            // Hiện thông báo chúc mừng ngay sảnh
            Swal.fire({
                title: '🎁 QUÀ TẶNG TRI ÂN 🎁',
                html: `Tổng tiêu dùng đạt mốc <b>${newMoc * 100}k</b>!<br>Bạn nhận được <b style="color:#ff0000; font-size:25px;">+${bonus}</b> lượt Lì Xì Free.`,
                icon: 'success',
                confirmButtonText: 'NHẬN NGAY',
                confirmButtonColor: '#d33',
                timer: 5000
            });
        } else {
            await db.ref('users/' + user).update({ totalSpent: newSpent });
        }
    } catch (error) {
        console.error("❌ Lỗi Database khi tích lũy:", error);
    }
}

/**
 * ============================================================
 * 4. HÀM MỞ BẢNG LÌ XÌ & KIỂM TRA LƯỢT
 * ============================================================
 */
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    
    if (!modal) return console.error("❌ Không tìm thấy Modal Lì Xì!");
    
    modal.style.display = 'flex';
    modal.style.zIndex = "2000000";

    if (!user) {
        document.getElementById('infoLuotBoc').innerHTML = `<span style="color:#ff0000">Vui lòng đăng nhập để xem lượt!</span>`;
        return;
    }

    try {
        // Lấy dữ liệu thời gian thực từ Firebase
        db.ref('users/' + user).on('value', (snap) => {
            const data = snap.val() || {};
            const turns = data.freeTurns || 0;
            const infoText = document.getElementById('infoLuotBoc');
            
            if (infoText) {
                if (turns > 0) {
                    infoText.innerHTML = `BẠN CÓ: <b style="color:#00ff00; font-size:18px; text-shadow: 0 0 5px #00ff00;">${turns} LƯỢT FREE</b>`;
                } else {
                    infoText.innerHTML = `TIÊU 100K TẶNG 1 LƯỢT FREE <br> <small>(Hoặc bốc lẻ: ${LIXI_CONFIG.GIA_VE_LE.toLocaleString()}đ)</small>`;
                }
            }
        });
    } catch (e) { console.error("❌ Lỗi lấy lượt:", e); }
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

/**
 * ============================================================
 * 5. LOGIC BỐC LÌ XÌ (RUNG LẮC - TỈ LỆ - POPUP)
 * ============================================================
 */
async function bocLixi(el) {
    if (isProcessing) return; // Chống spam click
    
    const lixiBack = el.querySelector('.lixi-back');
    if (lixiBack.style.display === 'flex') return; // Bao này đã mở

    const user = localStorage.getItem('hoangUser');
    if (!user) return Swal.fire("THÔNG BÁO", "Bạn cần đăng nhập để bốc lì xì!", "warning");

    try {
        isProcessing = true;
        const snapshot = await db.ref('users/' + user).once('value');
        const data = snapshot.val() || {};
        const currentBal = data.balance || 0;
        const freeTurns = data.freeTurns || 0;

        let useFree = false;

        // Kiểm tra điều kiện chơi
        if (freeTurns > 0) {
            const res = await Swal.fire({
                title: 'DÙNG LƯỢT FREE?',
                text: `Bạn đang có ${freeTurns} lượt miễn phí. Bốc ngay chứ?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'BỐC LUÔN',
                cancelButtonText: 'ĐỂ DÀNH'
            });
            if (!res.isConfirmed) { isProcessing = false; return; }
            useFree = true;
        } else {
            if (currentBal < LIXI_CONFIG.GIA_VE_LE) {
                isProcessing = false;
                return Swal.fire("HẾT TIỀN", "Bạn cần tối thiểu 20.000đ để mua vé lẻ!", "error");
            }
            const res = await Swal.fire({
                title: 'MUA VÉ LẺ?',
                html: `Bạn sẽ bị trừ <b>${LIXI_CONFIG.GIA_VE_LE.toLocaleString()}đ</b> để bốc. Chơi không?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ĐỒNG Ý',
                cancelButtonText: 'HỦY'
            });
            if (!res.isConfirmed) { isProcessing = false; return; }
        }

        // --- BẮT ĐẦU QUY TRÌNH BỐC ---
        
        // 1. Trừ tiền/lượt trên Database trước để tránh bug
        if (useFree) {
            await db.ref('users/' + user).update({ freeTurns: freeTurns - 1 });
        } else {
            await db.ref('users/' + user).update({ balance: currentBal - LIXI_CONFIG.GIA_VE_LE });
        }

        // 2. Hiệu ứng rung lắc hồi hộp
        el.classList.add('lixi-shaking');
        // Bạn có thể thêm âm thanh tại đây: new Audio('assets/shake.mp3').play();
        
        await new Promise(r => setTimeout(r, LIXI_CONFIG.ANIMATION_SHAKE));
        el.classList.remove('lixi-shaking');

        // 3. Tính toán tỉ lệ quà tặng (ĐÃ SỬA LẠI CÔNG BẰNG)
        let rand = Math.random() * 100;
        let winVal = 5000;

        if (rand < 30) winVal = 5000;        // 30% ra 5k
        else if (rand < 65) winVal = 10000;  // 35% ra 10k
        else if (rand < 85) winVal = 20000;  // 20% ra 20k
        else if (rand < 95) winVal = 50000;  // 10% ra 50k
        else if (rand < 99) winVal = 100000; // 4% ra 100k
        else winVal = 500000;                // 1% nổ hũ 500k

        let gift = GIFT_DATA[winVal];

        // 4. Hiển thị kết quả trên bao
        lixiBack.innerText = "GIFT";
        lixiBack.style.display = 'flex';
        lixiBack.style.animation = "fadeIn 0.5s forwards";

        // 5. Hiệu ứng pháo hoa tung tóe
        if (winVal >= 20000) {
            confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        }

        // 6. POPUP KẾT QUẢ CỰC ĐẸP
        Swal.fire({
            title: `<span style="color:#ffd700; text-shadow: 0 0 10px red;">🎊 CHÚC MỪNG 🎊</span>`,
            html: `
                <div style="background: #000; padding: 25px; border-radius: 20px; border: 2px solid #ffea00; box-shadow: 0 0 20px rgba(255,234,0,0.5);">
                    <div style="font-size: 50px; margin-bottom: 10px;">🧧</div>
                    <p style="color:#fff; margin:0;">Bạn đã nhận được bao lì xì:</p>
                    <p style="color:#00ff00; font-size: 30px; font-weight: 900; margin: 10px 0;">${winVal.toLocaleString()}đ</p>
                    <p style="color:#aaa; font-size: 13px;">Loại: ${gift.label}</p>
                    
                    <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px;">
                        <p style="color: #ffd700; font-size: 12px; margin-bottom: 5px;">MÃ GIFTCODE CỦA BẠN:</p>
                        <div onclick="navigator.clipboard.writeText('${gift.code}'); Swal.showValidationMessage('Đã sao chép!');"
                             style="background: #222; color: #ffea00; padding: 15px; border: 2px dashed #ffea00; font-family: monospace; font-size: 20px; font-weight: bold; cursor: pointer; border-radius: 10px;">
                            ${gift.code}
                        </div>
                        <small style="color:#666; display:block; margin-top:5px;">(Bấm vào mã để sao chép nhanh)</small>
                    </div>
                </div>
            `,
            background: 'transparent',
            showConfirmButton: true,
            confirmButtonText: 'TIẾP TỤC BỐC',
            confirmButtonColor: '#ff0000',
            allowOutsideClick: false
        }).then(() => {
            isProcessing = false;
            // Tự động mở lại modal nếu muốn chơi tiếp
            moModalBoc();
        });

    } catch (err) {
        console.error("❌ Lỗi nghiêm trọng:", err);
        isProcessing = false;
        Swal.fire("LỖI", "Không thể kết nối Database, vui lòng thử lại!", "error");
    }
}

/**
 * ============================================================
 * 6. CÁC HÀM TIỆN ÍCH KHÁC
 * ============================================================
 */
function xemTheLe() {
    Swal.fire({
        title: '📜 THỂ LỆ SỰ KIỆN',
        html: `
            <div style="text-align: left; font-size: 14px; color: #333;">
                <p>1️⃣ <b>Lượt Free:</b> Cứ tiêu đủ 100k mua hàng sẽ nhận 1 lượt bốc MIỄN PHÍ.</p>
                <p>2️⃣ <b>Vé Lẻ:</b> Dùng tiền trong tài khoản mua vé bốc giá 20k/lượt.</p>
                <p>3️⃣ <b>Quà Tặng:</b> 100% trúng mã Giftcode mệnh giá từ 5k đến 500k.</p>
                <p>4️⃣ <b>Sử dụng:</b> Copy mã quà tặng và nhập vào mục 'NHẬP CODE' để lấy tiền vào tài khoản.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'ĐÃ HIỂU',
        confirmButtonColor: '#d33'
    });
}

// Lắng nghe phím ESC để đóng modal
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") dongModalBoc();
});

console.log("%c🧧 Hệ Thống Lì Xì HoangKun Store Đã Sẵn Sàng!", "color: red; font-size: 20px; font-weight: bold;");
