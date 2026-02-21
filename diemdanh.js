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
    if (turns <= 0 && data.balance < 20000) return ("Hết lượt", "Bạn cần 20k để bốc lẻ!", "warning");

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
    html: `Bạn nhận được lì xì <b>${winVal.toLocaleString()}đ</b>...`,
    confirmButtonText: 'SAO CHÉP MÃ',
    // THÊM DÒNG NÀY:
    target: document.getElementById('modalBocLixi'), 
    allowOutsideClick: false,
   }).then(() => {
            navigator.clipboard.writeText(code);
            alert("Đã copy mã!");
        });

        // Lưu lịch sử
        db.ref('lixi_history/' + user).push({ amount: winVal, code: code, time: new Date().toLocaleString() });
        isRunning = false;
    }, 1500);
}

// --- HÀM HIỂN THỊ THỂ LỆ ---
function showTheLe() {
    Swal.fire({
        title: '<span style="color: #d32f2f;">📜 THỂ LỆ SỰ KIỆN</span>',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #333;">
                <p>🧧 <b>Lượt miễn phí:</b> Mỗi khi mua hàng 100.000đ được tặng 1 lượt bốc.</p>
                <p>💰 <b>Bốc lẻ:</b> Nếu hết lượt, bạn có thể dùng 20.000đ tiền ví/lượt bốc.</p>
                <p>🎁 <b>Phần quà:</b> 100% trúng mã Giftcode trị giá từ 5.000đ đến 500.000đ.</p>
                <p>📝 <b>Sử dụng:</b> Sao chép mã code và nhập vào mục <b style="color:red;">NẠP CODE</b> để nhận tiền vào ví.</p>
            </div>
        `,
        icon: "info",
        confirmButtonText: 'ĐÃ HIỂU',
        confirmButtonColor: '#d32f2f',
        target: document.getElementById('modalBocLixi')
    });
}

// --- HÀM HIỂN THỊ LỊCH SỬ ---
async function showLichSu() {
    const user = localStorage.getItem('hoangUser');
    if (!user) return;

    const snap = await db.ref('lixi_history/' + user).limitToLast(10).once('value');
    
    let htmlContent = `
        <div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 10px; background: #fdfdfd; border-radius: 10px; border: 1px solid #eee;">
    `;

    if (!snap.exists()) {
        htmlContent += `<p style="text-align:center; color:#888; padding: 20px;">Bạn chưa bốc lì xì lần nào!</p>`;
    } else {
        let historyArray = [];
        snap.forEach(child => {
            historyArray.unshift(child.val()); // Đưa cái mới nhất lên đầu
        });

        historyArray.forEach(item => {
            htmlContent += `
                <div style="border-bottom: 1px solid #f0f0f0; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="color: #d32f2f; font-weight: bold; font-size: 15px;">🧧 +${(item.amount || 0).toLocaleString()}đ</span><br>
                        <small style="color: #999; font-size: 11px;">🕒 ${item.time || 'Vừa xong'}</small>
                    </div>
                    <div style="text-align: right;">
                        <code style="background: #333; color: gold; padding: 4px 8px; border-radius: 5px; font-weight: bold; cursor: pointer; font-family: monospace; border: 1px solid gold;" 
                              onclick="navigator.clipboard.writeText('${item.code}'); alert('Đã copy mã: ${item.code}')" title="Bấm để copy">
                            ${item.code}
                        </code>
                        <div style="font-size: 9px; color: #888; margin-top: 3px;">Click mã để Copy</div>
                    </div>
                </div>
            `;
        });
    }
    
    htmlContent += `</div>`;

    Swal.fire({
        title: '<span style="color: #d32f2f;">🕒 LỊCH SỬ NHẬN QUÀ</span>',
        html: htmlContent,
        confirmButtonText: 'ĐÓNG',
        confirmButtonColor: '#d32f2f',
        target: document.getElementById('modalBocLixi')
    });
}
