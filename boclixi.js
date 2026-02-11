// --- CẤU HÌNH GIẢI THƯỞNG ---
const GIA_BOC = 0; // Miễn phí 0đ

// DANH SÁCH MÃ CODE (Bạn sửa mã thật của bạn vào đây)
const GIFT_MAP = {
    5000: "CODE5K-FREE",       // Mã cho giải 5k
    10000: "CODE10K-LIXI",     // Mã cho giải 10k
    20000: "CODE20K-MAYMAN",   // Mã cho giải 20k
    50000: "VIP50K-HELU",      // Mã cho giải 50k
    100000: "SUPERVIP-100K",   // Mã cho giải 100k
    500000: "JACKPOT-500K"     // Mã giải đặc biệt
};

// 1. HÀM MỞ BẢNG 9 Ô
async function moModalBoc() {
    const user = localStorage.getItem('hoangUser');
    const modal = document.getElementById('modalBocLixi');
    
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = "2000000"; // Hiện lên trên cùng
    } else {
        alert("Lỗi: Không tìm thấy bảng modalBocLixi trong HTML");
        return;
    }

    // Nếu đã đăng nhập thì hiện dòng chữ mời gọi
    if(user) {
        const infoText = document.getElementById('infoLuotBoc');
        if(infoText) {
            infoText.innerHTML = `
                <span style="color:#00ff00; font-weight:bold; font-size: 16px;">✨ LÌ XÌ MIỄN PHÍ 100% ✨</span> 
                <br>
                <span style="font-size:11px; color:#ccc;">(Bốc thoải mái - Không giới hạn)</span>
            `;
        }
    }
}

// 2. HÀM ĐÓNG BẢNG
function dongModalBoc() {
    document.getElementById('modalBocLixi').style.display = 'none';
}

// 3. HÀM XỬ LÝ KHI BẤM VÀO BAO (Logic chính)
async function bocLixi(el) {
    // Nếu bao này đã mở rồi thì không cho bấm nữa
    if(el.querySelector('.lixi-back').style.display === 'flex') return;

    const user = localStorage.getItem('hoangUser');
    if(!user) return Swal.fire("Yêu cầu", "Vui lòng đăng nhập để nhận quà!", "warning");

    // --- BƯỚC 1: HIỆU ỨNG RUNG LẮC (Hồi hộp) ---
    el.classList.add('lixi-shaking'); 
    await new Promise(resolve => setTimeout(resolve, 800)); // Đợi 0.8 giây
    el.classList.remove('lixi-shaking');

    // --- BƯỚC 2: TÍNH TOÁN KẾT QUẢ ---
    let random = Math.random() * 100;
    let winVal = 5000; // Mặc định trúng 5k
    
    // Tỉ lệ trúng (Chỉnh ở đây)
    if(random < 60) winVal = 5000;        // 60% trúng 5k
    else if(random < 85) winVal = 10000;  // 25% trúng 10k
    else if(random < 95) winVal = 20000;  // 10% trúng 20k
    else if(random < 99) winVal = 50000;  // 4% trúng 50k
    else winVal = 500000;                 // 1% trúng 500k

    // LẤY MÃ CODE TƯƠNG ỨNG TỪ DANH SÁCH TRÊN
    let giftCode = GIFT_MAP[winVal] || "LIXIFREE-DEFAULT";


    // --- BƯỚC 3: HIỂN THỊ RA MÀN HÌNH ---
    
    // 1. Lật bao lì xì hiện chữ GIFT
    const lixiBack = el.querySelector('.lixi-back');
    lixiBack.innerText = "GIFT";
    lixiBack.style.display = 'flex'; 
    
    // 2. Ẩn bảng 9 ô đi để hiện bảng chúc mừng cho rõ (Tránh bị che)
    dongModalBoc();

    // 3. Bắn pháo hoa (Nếu trúng >= 20k)
    if(winVal >= 20000 && typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }

    // 4. HIỆN BẢNG CHÚC MỪNG + MÃ CODE (Phần bạn cần nhất)
    Swal.fire({
        title: `<span style="color:#ffd700; text-transform:uppercase; font-size: 24px;">🎉 CHÚC MỪNG BẠN 🎉</span>`,
        html: `
            <div style="background: linear-gradient(135deg, #1a1a1a, #000); padding:20px; border-radius:15px; border:1px solid #ffea00; box-shadow: 0 0 15px #ffea00;">
                
                <div style="margin-bottom:15px; animation: bounce 2s infinite;">
                    <i class="fas fa-gift" style="font-size:60px; color:#ff0000; text-shadow:0 0 10px #ffea00;"></i>
                </div>

                <p style="color:#fff; font-size:16px;">Bạn vừa nhận được Giftcode trị giá:</p>
                <p style="color:#00ff00; font-size:32px; font-weight:bold; margin: 10px 0; text-shadow: 0 0 10px #00ff00;">${winVal.toLocaleString()}đ</p>
                
                <hr style="border-color: #333; margin: 15px 0;">

                <div style="margin:10px 0; position:relative;">
                    <p style="color:#aaa; font-size:12px; margin-bottom:8px;">Đây là mã quà tặng của bạn:</p>
                    
                    <div onclick="navigator.clipboard.writeText('${giftCode}'); Swal.showValidationMessage('✅ Đã sao chép mã thành công!');" 
                         style="background:#333; padding:15px; border:2px dashed #ffd700; border-radius:10px; color:#ffd700; font-size:20px; font-weight:bold; cursor:pointer; letter-spacing: 1px; display:flex; align-items:center; justify-content:center; gap:10px; transition: 0.3s;"
                         onmouseover="this.style.background='#444'" onmouseout="this.style.background='#333'">
                        
                        <span>${giftCode}</span> 
                        <i class="fas fa-copy" style="font-size:18px; color:#fff;"></i>
                    </div>
                    
                    <p style="font-size:11px; color:#666; margin-top:8px;">(Bấm vào khung trên để Copy mã)</p>
                </div>

            </div>
        `,
        background: 'transparent', // Nền trong suốt
        showConfirmButton: true,
        confirmButtonText: "BỐC TIẾP",
        confirmButtonColor: "#d32f2f",
        allowOutsideClick: false, // Bắt buộc bấm nút mới tắt được
        didOpen: () => {
            // ÉP BẢNG NÀY HIỆN LÊN TRÊN CÙNG (Z-INDEX CAO NHẤT)
            const container = Swal.getContainer();
            if(container) container.style.zIndex = "99999999";
        }
    }).then((result) => {
        // Sau khi bấm nút "BỐC TIẾP" thì mở lại bảng 9 ô
        if (result.isConfirmed) {
            moModalBoc();
        }
    });
}

// 4. HÀM XEM THỂ LỆ
function xemTheLe() {
    Swal.fire({
        title: '📜 LUẬT CHƠI',
        html: `
            <div style="text-align:left; font-size:14px;">
                <p>✅ <b>Miễn phí 100%:</b> Không mất tiền, không cần nạp.</p>
                <p>✅ <b>Quà tặng:</b> Các mã Giftcode giá trị từ 5k - 500k.</p>
                <p>✅ <b>Cách dùng:</b> Copy mã trúng thưởng và nhập vào mục Nạp Tiền/Giftcode để đổi ra số dư.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonColor: '#d32f2f',
        didOpen: () => {
             Swal.getContainer().style.zIndex = "99999999";
        }
    });
}
