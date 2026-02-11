// --- CẤU HÌNH ---
const GIA_BOC = 0; // Giá = 0đ (Miễn phí)

// Danh sách mã Code (Bạn hãy sửa lại mã của bạn vào đây)
const GIFT_MAP = {
    5000: "LIXIFREE5K",
    10000: "LIXIFREE10K",
    20000: "LIXIFREE20K",
    50000: "LIXIVIP50K",
    100000: "HOANGKUNVIP",
    500000: "SUPERVIP"
};

// 1. HÀM MỞ BẢNG
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    
    // Hiện bảng
    const modal = document.getElementById('modalBocLixi');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = "9999999"; 
    } 

    // Nếu đã đăng nhập thì hiện thông báo Free
    if(user) {
        const infoText = document.getElementById('infoLuotBoc');
        if(infoText) {
            infoText.innerHTML = `
                <span style="color:#00ff00; font-weight:bold; font-size: 16px;">✨ LÌ XÌ MIỄN PHÍ 100% ✨</span> 
                <br>
                <span style="font-size:11px; color:#ccc;">(Không giới hạn lượt chơi)</span>
            `;
        }
    }
}

// 2. HÀM ĐÓNG BẢNG
function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// 3. HÀM XỬ LÝ BỐC (Có rung lắc + hiện code)
async function bocLixi(el) {
    // Nếu bao này đã mở rồi thì không bấm được nữa
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Yêu cầu", "Vui lòng đăng nhập để nhận quà!", "warning");

    // --- GIAI ĐOẠN 1: RUNG LẮC (0.8 giây) ---
    el.classList.add('lixi-shaking'); // Thêm rung
    await new Promise(resolve => setTimeout(resolve, 800)); // Đợi
    el.classList.remove('lixi-shaking'); // Hết rung

    // --- GIAI ĐOẠN 2: TÍNH KẾT QUẢ ---
    let random = Math.random() * 100;
    let winVal = 5000;
    
    // Tỉ lệ trúng (Chỉnh ở đây)
    if(random < 60) winVal = 5000;
    else if(random < 85) winVal = 10000;
    else if(random < 95) winVal = 20000;
    else if(random < 99) winVal = 50000;
    else winVal = 500000;

    let giftCode = GIFT_MAP[winVal] || "LIXIFREE";

    // --- GIAI ĐOẠN 3: HIỆN QUÀ ---
    
    // Đổi giao diện bao lì xì thành chữ GIFT
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex'; 
    
    // Bắn pháo hoa nếu trúng to
    if(winVal >= 50000 && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // Hiện bảng CHÚC MỪNG to đẹp
    Swal.fire({
        title: `<span style="color:#ffd700; text-transform:uppercase;">🎉 CHÚC MỪNG BẠN 🎉</span>`,
        html: `
            <div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:20px; border-radius:15px; border:1px solid #ffea00;">
                
                <div style="margin-bottom:15px;">
                    <i class="fas fa-gift" style="font-size:50px; color:#ff0000; text-shadow:0 0 10px #ffea00;"></i>
                </div>

                <p style="color:#fff; font-size:16px;">Bạn vừa nhận được Giftcode trị giá:</p>
                <p style="color:#00ff00; font-size:28px; font-weight:bold; margin: 10px 0;">${winVal.toLocaleString()}đ</p>
                
                <div style="margin:20px 0;">
                    <p style="color:#aaa; font-size:12px; margin-bottom:5px;">Mã quà tặng của bạn:</p>
                    <div onclick="navigator.clipboard.writeText('${giftCode}'); Swal.showValidationMessage('Đã sao chép mã!');" 
                         style="background:#333; padding:12px; border:2px dashed #ffd700; border-radius:8px; color:#ffd700; font-size:24px; font-weight:bold; cursor:pointer; letter-spacing: 1px;">
                        ${giftCode} <i class="fas fa-copy" style="font-size:16px; margin-left:10px; color:#fff;"></i>
                    </div>
                    <p style="font-size:11px; color:#666; margin-top:5px;">(Bấm vào ô trên để Copy mã)</p>
                </div>

            </div>
        `,
        background: 'transparent',
        showConfirmButton: true,
        confirmButtonText: "NHẬN TIẾP",
        confirmButtonColor: "#d32f2f"
    });
}

// HÀM XEM THỂ LỆ
function xemTheLe() {
    Swal.fire({
        title: '📜 LUẬT CHƠI',
        html: `<p>Bốc thăm trúng thưởng miễn phí 100% dành cho tất cả thành viên shop!</p>`,
        icon: 'info',
        confirmButtonColor: '#d32f2f'
    });
}
