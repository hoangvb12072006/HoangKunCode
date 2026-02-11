// --- CẤU HÌNH TRÒ CHƠI ---
const GIA_BOC = 20000;
const GIFT_MAP = {
    5000: "TANTHU",
    10000: "LIXITET",
    20000: "NAMMOI",
    50000: "HOANGKUN",
    100000: "HOANGKUNVIP",
    500000: "CHUTICH"
};

// 1. Hàm mở bảng (Đã thêm lệnh ép hiện lên trên cùng)
function moModalBoc() {
    console.log("Đang mở bảng bốc lì xì...");
    const modal = document.getElementById('modalBocLixi');
    
    if (modal) {
        modal.style.display = 'flex';
        // Ép z-index lên cao nhất để đè lên Kênh Thế Giới
        modal.style.zIndex = "9999999"; 
    } else {
        alert("Lỗi: Không tìm thấy ID 'modalBocLixi' trong file index.html!");
    }
}

// 2. Hàm đóng bảng
function dongModalBoc() {
    const modal = document.getElementById('modalBocLixi');
    if (modal) modal.style.display = 'none';
}

// 3. Hàm xử lý bốc lì xì
async function bocLixi(el) {
    // Nếu bao này đã mở rồi thì thôi
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Lỗi", "Vui lòng đăng nhập!", "error");

    const snapshot = await db.ref('users/' + user).once('value');
    const userData = snapshot.val();
    const currentBal = userData.balance || 0;

    // Kiểm tra tiền
    if(currentBal < GIA_BOC) {
        return Swal.fire({
            title: "THIẾU TIỀN",
            text: `Cần ${GIA_BOC.toLocaleString()}đ để bốc!`,
            icon: "warning"
        });
    }

    // Hỏi xác nhận
    const confirm = await Swal.fire({
        title: 'XÁC NHẬN',
        text: `Phí bốc là ${GIA_BOC.toLocaleString()}đ. Chơi không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'CHƠI LUÔN',
        confirmButtonColor: '#ff0000'
    });

    if(!confirm.isConfirmed) return;

    // Trừ tiền
    await db.ref('users/' + user).update({ balance: currentBal - GIA_BOC });

    // Random kết quả
    let random = Math.random() * 100;
    let winVal = 5000;
    if(random < 60) winVal = 5000;
    else if(random < 85) winVal = 10000;
    else if(random < 98) winVal = 50000;
    else winVal = 500000;

    let giftCode = GIFT_MAP[winVal] || "TANTHU";

    // Hiệu ứng lật bao tại chỗ
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex';

    // Bắn pháo hoa nếu trúng to
    if(winVal >= 50000) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Hiện bảng mã Giftcode
    setTimeout(() => {
        Swal.fire({
            title: `<span style="color:#ffd700">🎁 QUÀ CỦA BẠN 🎁</span>`,
            html: `
                <div style="background:#000; padding:15px; border-radius:10px; border:1px solid #333;">
                    <p style="color:#fff;">Giá trị gói quà: <b style="color:red; font-size:20px;">${winVal.toLocaleString()}đ</b></p>
                    <div style="margin:15px 0; padding:10px; border:2px dashed #ffd700; color:#ffd700; font-size:28px; font-weight:bold; cursor:pointer;" 
                         onclick="navigator.clipboard.writeText('${giftCode}'); alert('Đã copy mã!')">
                        ${giftCode}
                    </div>
                    <p style="font-size:12px; color:#888;">(Bấm vào mã để Copy nhanh)</p>
                </div>
            `,
            backdrop: `rgba(0,0,0,0.9)`,
            confirmButtonText: "ĐÓNG",
            confirmButtonColor: "#d33"
        }).then(() => {
            dongModalBoc(); // Đóng bảng 9 ô
            lixiBack.style.display = 'none'; // Reset bao lì xì
        });
    }, 500);
}
