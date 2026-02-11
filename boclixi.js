// --- CẤU HÌNH MÃ QUÀ TẶNG ---
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
    console.log("Đang mở modal bốc lì xì...");
    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire({
        title: "Lỗi",
        text: "Vui lòng đăng nhập để bốc lì xì!",
        icon: "error",
        didOpen: () => { Swal.getContainer().style.zIndex = "10000000"; }
    });
    
    const modal = document.getElementById('modalBocLixi');
    if(modal) {
        modal.style.display = 'flex';
    } else {
        console.error("Không tìm thấy ID modalBocLixi trong HTML!");
    }
}

function dongModalBoc() {
    const modal = document.getElementById('modalBocLixi');
    if(modal) modal.style.display = 'none';
}

async function bocLixi(el) {
    const user = localStorage.getItem('hoangUser');
    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;

    if(currentBal < GIA_BOC) {
        return Swal.fire({
            title: "THIẾU TIỀN",
            text: "Bạn cần 20.000đ để bốc!",
            icon: "warning",
            didOpen: () => { Swal.getContainer().style.zIndex = "10000000"; }
        });
    }

    const confirm = await Swal.fire({
        title: 'XÁC NHẬN BỐC?',
        text: "Phí bốc là 20.000đ",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'BỐC LUÔN',
        didOpen: () => { Swal.getContainer().style.zIndex = "10000000"; }
    });

    if(!confirm.isConfirmed) return;

    // Trừ tiền
    await db.ref('users/' + user).update({ balance: currentBal - GIA_BOC });

    // Tính tỷ lệ trúng mã
    let random = Math.random() * 100;
    let winVal = 5000;
    if(random < 60) winVal = 5000;
    else if(random < 90) winVal = 10000;
    else if(random < 99) winVal = 50000;
    else winVal = 500000;

    let code = GIFT_MAP[winVal] || "TANTHU";

    // Hiệu ứng pháo hoa
    if(winVal >= 50000) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Hiện mã Code cực đẹp
    Swal.fire({
        title: `<span style="color:#ffd700">🧧 QUÀ CỦA BẠN 🧧</span>`,
        html: `
            <div style="background:#000; padding:20px; border:2px dashed #ffd700; border-radius:10px;">
                <p style="color:#fff;">Bạn trúng gói: <b style="color:red">${winVal.toLocaleString()}đ</b></p>
                <div style="font-size:30px; font-weight:bold; color:#ffd700; margin:15px 0; cursor:pointer;" onclick="navigator.clipboard.writeText('${code}'); alert('Đã copy mã!')">
                    ${code}
                </div>
                <p style="font-size:12px; color:#888;">(Bấm vào mã để Copy và nhập vào mục Giftcode)</p>
            </div>
        `,
        backdrop: `rgba(0,0,0,0.9)`,
        didOpen: () => { Swal.getContainer().style.zIndex = "10000000"; }
    }).then(() => {
        dongModalBoc();
    });
}
