// ============================================================
// 1️⃣ PHẦN CẤU HÌNH (SỬA GIÁ VÀ QUÀ TẶNG TẠI ĐÂY)
// ============================================================

// Giá vé mua lẻ (nếu hết lượt Free). Để 0 nếu muốn miễn phí.
const GIA_VE_LE = 20000; 

// Danh sách mã quà tặng (Sửa mã của bạn vào đây)
const DANH_SACH_QUA = {
    5000: "CODE5K-LIXI",
    10000: "CODE10K-MAYMAN",
    20000: "CODE20K-VUI",
    50000: "VIP50K-HELU",
    100000: "SUPERVIP-100K",
    500000: "JACKPOT-500K"
};

// ============================================================
// 2️⃣ HÀM TÍCH LŨY (GỌI KHI KHÁCH MUA HÀNG Ở NGOÀI SẢNH)
// ============================================================

/**
 * Hàm này dùng để cộng dồn tiền mua hàng.
 * Nếu đủ 100k sẽ tự động cộng lượt và hiện thông báo chúc mừng NGAY LẬP TỨC.
 * @param {string} user - Tên tài khoản người mua
 * @param {number} amount - Số tiền món hàng vừa mua
 */
async function tichLuyLuotBoc(user, amount) {
    if(!user) return;
    
    // Lấy dữ liệu cũ
    const snapshot = await db.ref('users/' + user).once('value');
    const data = snapshot.val();
    
    let daTieuTruocDo = data.totalSpent || 0; // Tổng tiền đã tiêu trước đó
    let luotFreeHienCo = data.freeTurns || 0; // Số lượt đang có

    let tongTieuMoi = daTieuTruocDo + amount; // Cộng thêm tiền vừa mua
    
    // LOGIC TÍNH TOÁN: Lấy phần nguyên của (Tổng Mới / 100k) - (Tổng Cũ / 100k)
    // Ví dụ: Cũ 90k (0), Mới 110k (1) -> 1 - 0 = Được 1 lượt
    let mocCu = Math.floor(daTieuTruocDo / 100000);
    let mocMoi = Math.floor(tongTieuMoi / 100000);
    let luotDuocTang = mocMoi - mocCu;

    // Cập nhật vào Database
    if (luotDuocTang > 0) {
        await db.ref('users/' + user).update({
            totalSpent: tongTieuMoi,
            freeTurns: luotFreeHienCo + luotDuocTang
        });

        // 🔥 HIỆN THÔNG BÁO CHÚC MỪNG NGAY LẬP TỨC (Khi đang ở ngoài sảnh)
        Swal.fire({
            title: "🎁 CHÚC MỪNG BẠN! 🎁",
            html: `
                <p>Bạn vừa mua đơn hàng tích lũy đủ mốc!</p>
                <p style="font-size: 18px; margin-top: 10px;">Bạn nhận được: <b style="color: red; font-size: 24px;">+${luotDuocTang}</b> Lượt Bốc Lì Xì</p>
                <p style="font-size: 12px; color: #888;">(Vào mục Lì Xì Free để chơi ngay)</p>
            `,
            icon: "success",
            confirmButtonText: "ĐÃ HIỂU",
            confirmButtonColor: "#d32f2f",
            backdrop: `rgba(0,0,0,0.8)` // Làm tối nền để nổi bật
        });

    } else {
        // Nếu chưa đủ mốc thì chỉ cộng dồn tiền thôi
        await db.ref('users/' + user).update({ totalSpent: tongTieuMoi });
    }
}

// ============================================================
// 3️⃣ HÀM MỞ BẢNG LÌ XÌ & KIỂM TRA LƯỢT (LOGIC GAME)
// ============================================================

async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    
    // Mở bảng
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = "2000000"; 
    }

    if(!user) return; 

    // Lấy số lượt Free mới nhất
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const freeTurns = userData.freeTurns || 0; 

    // Hiển thị thông tin lên bảng
    const infoText = document.getElementById('infoLuotBoc');
    if(infoText) {
        if(freeTurns > 0) {
            // Có lượt -> Hiện màu xanh
            infoText.innerHTML = `
                BẠN ĐANG CÓ: <b style="color:#00ff00; font-size:18px; border:1px solid #00ff00; padding:2px 10px; border-radius:5px;">${freeTurns}</b> LƯỢT
                <br><span style="font-size:11px; color:#ccc;">(Chơi miễn phí ngay!)</span>
            `;
        } else {
            // Hết lượt -> Nhắc nhở mua hàng
            infoText.innerHTML = `
                <span style="color:#ffd700; font-weight:bold;">TÍCH LŨY MUA 100K = TẶNG 1 LƯỢT</span> 
                <br>
                <span style="font-size:11px; color:#aaa;">(Hoặc mua vé lẻ: <b style="color:red">${GIA_VE_LE.toLocaleString()}đ</b>/lượt)</span>
            `;
        }
    }
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// ============================================================
// 4️⃣ HÀM XỬ LÝ BỐC THĂM (RUNG LẮC + TRỪ LƯỢT)
// ============================================================

async function bocLixi(el) {
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Yêu cầu", "Vui lòng đăng nhập!", "warning");

    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;
    const freeTurns = userData.freeTurns || 0;

    let useFreeTurn = false;

    // --- CHECK: Ưu tiên dùng lượt Free ---
    if (freeTurns > 0) {
        const confirm = await Swal.fire({
            title: 'DÙNG LƯỢT FREE?',
            text: `Bạn muốn dùng 1 lượt miễn phí để bốc chứ?`,
            icon: 'question',
            showCancelButton: true, confirmButtonText: 'CHƠI LUÔN', confirmButtonColor: '#00ff00',
            background: '#000', color: '#fff'
        });
        if(!confirm.isConfirmed) return;
        useFreeTurn = true;
    } else {
        // Hết lượt Free -> Check tiền mua vé lẻ
        if (GIA_VE_LE > 0) {
            if(currentBal < GIA_VE_LE) return Swal.fire("THIẾU TIỀN", "Bạn không đủ tiền mua vé lẻ!", "error");
            
            const confirm = await Swal.fire({
                title: 'MUA VÉ LẺ?',
                html: `Hết lượt Free. Dùng <b style="color:red">${GIA_VE_LE.toLocaleString()}đ</b> để bốc nhé?`,
                icon: 'question',
                showCancelButton: true, confirmButtonText: 'MUA & CHƠI', confirmButtonColor: '#d33',
                background: '#000', color: '#fff'
            });
            if(!confirm.isConfirmed) return;
        }
    }

    // --- CẬP NHẬT TRỪ LƯỢT/TIỀN ---
    if(useFreeTurn) {
        await db.ref('users/' + user).update({ freeTurns: freeTurns - 1 });
    } else {
        if(GIA_VE_LE > 0) await db.ref('users/' + user).update({ balance: currentBal - GIA_VE_LE });
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

    let giftCode = DANH_SACH_QUA[winVal] || "LIXI-MAYMAN";

    // --- HIỂN THỊ QUÀ ---
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex'; 
    dongModalBoc(); // Đóng bảng chọn

    if(winVal >= 20000 && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // Hiện Popup Chúc Mừng
    Swal.fire({
        title: `<span style="color:#ffd700; text-transform:uppercase; font-size:24px;">🎉 CHÚC MỪNG 🎉</span>`,
        html: `
            <div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:20px; border-radius:15px; border:1px solid #ffea00; box-shadow: 0 0 15px #ffea00;">
                <div style="margin-bottom:15px; animation: bounce 2s infinite;">
                    <i class="fas fa-gift" style="font-size:60px; color:#ff0000; text-shadow:0 0 10px #ffea00;"></i>
                </div>
                <p style="color:#fff;">Bạn nhận được Giftcode:</p>
                <p style="color:#00ff00; font-size:32px; font-weight:bold; margin:10px 0;">${winVal.toLocaleString()}đ</p>
                
                <div onclick="navigator.clipboard.writeText('${giftCode}'); Swal.showValidationMessage('Đã sao chép!');" 
                     style="background:#333; padding:15px; border:2px dashed #ffd700; border-radius:10px; color:#ffd700; font-size:20px; font-weight:bold; cursor:pointer; margin-top:15px; display:flex; justify-content:center; gap:10px;">
                    <span>${giftCode}</span> <i class="fas fa-copy" style="color:#fff;"></i>
                </div>
                
                <p style="font-size:11px; color:#666; margin-top:10px;">(Còn lại: <b>${useFreeTurn ? freeTurns - 1 : freeTurns}</b> lượt Free)</p>
            </div>
        `,
        background: 'transparent',
        showConfirmButton: true, confirmButtonText: "BỐC TIẾP", confirmButtonColor: "#d32f2f",
        allowOutsideClick: false,
        didOpen: () => { Swal.getContainer().style.zIndex = "99999999"; }
    }).then((res) => {
        if(res.isConfirmed) moModalBoc();
    });
}

// 5. Xem Thể Lệ
function xemTheLe() {
    Swal.fire({
        title: '📜 LUẬT CHƠI',
        html: `
            <div style="text-align:left; font-size:14px;">
                <p>1️⃣ Mua sản phẩm ở Shop tổng <b>100k</b> nhận ngay <b>1 lượt Free</b>.</p>
                <p>2️⃣ Hoặc mua vé lẻ giá <b>${GIA_VE_LE.toLocaleString()}đ</b>.</p>
                <p>3️⃣ 100% trúng thưởng Code tiền mặt.</p>
            </div>
        `,
        icon: 'info', confirmButtonColor: '#d32f2f',
        didOpen: () => { Swal.getContainer().style.zIndex = "99999999"; }
    });
}
