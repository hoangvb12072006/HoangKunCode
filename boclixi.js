// --- CẤU HÌNH MÃ QUÀ TẶNG (Phải khớp với file giftcode.js) ---
const GIA_BOC = 20000;
const GIFT_MAP = {
    5000: "TANTHU",
    10000: "LIXITET",
    20000: "NAMMOI",
    50000: "HOANGKUN",
    100000: "HOANGKUNVIP",
    500000: "CHUTICH"
};

function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire({
        title: "Lỗi",
        text: "Vui lòng đăng nhập để bốc lì xì!",
        icon: "error",
        didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
    });
    document.getElementById('modalBocLixi').style.display = 'flex';
}

function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

async function bocLixi(el) {
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;

    if(currentBal < GIA_BOC) {
        return Swal.fire({
            title: "THIẾU TIỀN",
            text: `Bạn cần ${GIA_BOC.toLocaleString()}đ để bốc lì xì!`,
            icon: "warning",
            confirmButtonColor: "#ff0000",
            didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
        });
    }

    const confirm = await Swal.fire({
        title: 'XÁC NHẬN BỐC?',
        html: `Phí bốc là <b style="color:#ff0000">${GIA_BOC.toLocaleString()}đ</b>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ff0000',
        confirmButtonText: 'BỐC NGAY',
        cancelButtonText: 'HỦY',
        didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
    });

    if(!confirm.isConfirmed) return;

    // 1. Trừ tiền tham gia
    await db.ref('users/' + user).update({ balance: currentBal - GIA_BOC });

    // 2. Tính toán tỷ lệ rơi mã (Hơi khó trúng 500k cho uy tín)
    let random = Math.random() * 100;
    let winValue = 5000;
    if(random < 50) winValue = 5000; 
    else if(random < 85) winValue = 10000;
    else if(random < 97) winValue = 50000;
    else winValue = 500000;

    let giftCode = GIFT_MAP[winValue] || "TANTHU";

    // 3. Hiệu ứng lật bao tại chỗ
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerHTML = `<i class="fas fa-gift"></i>`;
    lixiBack.style.display = 'flex';

    // Bắn pháo hoa nếu trúng mã từ 50k trở lên
    if(winValue >= 50000) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ff0000', '#ffd700'] });
    }

    // 4. Thông báo hiện mã Code siêu đẹp
    setTimeout(() => {
        Swal.fire({
            title: `<span style="color:#ffd700; font-weight:900;">🧧 KẾT QUẢ BỐC LÌ XÌ 🧧</span>`,
            html: `
                <div style="padding: 15px; background: #111; border-radius: 10px; border: 1px solid #333;">
                    <p style="color:#fff; margin-bottom:10px;">Chúc mừng! Bạn đã bốc được gói quà:</p>
                    <h2 style="color:#ff0000; margin: 5px 0;">${winValue.toLocaleString()}đ</h2>
                    <div style="margin: 20px 0; padding: 15px; border: 2px dashed #ffd700; background: #000; color: #ffd700; font-size: 28px; font-weight: 900; letter-spacing: 2px; cursor: pointer;" onclick="navigator.clipboard.writeText('${giftCode}'); alert('Đã copy mã!')">
                        ${giftCode}
                    </div>
                    <p style="font-size: 12px; color: #888;">(Bấm vào mã để Copy nhanh)</p>
                    <p style="font-size: 14px; color: #00ff00; margin-top: 15px; font-weight: bold;">HÃY NHẬP MÃ TẠI MỤC GIFTCODE ĐỂ NHẬN TIỀN!</p>
                </div>
            `,
            confirmButtonColor: "#ff0000",
            confirmButtonText: "ĐÃ HIỂU",
            backdrop: `rgba(0,0,0,0.9)`,
            didOpen: () => { Swal.getContainer().style.zIndex = "1000000"; }
        }).then(() => {
            dongModalBoc();
            lixiBack.style.display = 'none';
        });
    }, 800);
}
