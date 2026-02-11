// --- CẤU HÌNH NỘI DUNG THÔNG BÁO TẾT (Sửa thông tin liên hệ ở đây) ---
const tetConfig = {
    tieuDe: "🎉 CHÚC MỪNG NĂM MỚI 2026 🎉",
    
    // Phần lời chúc & Ưu đãi
    loiChuc: "Nhân dịp Xuân 2026, <b>HOANGKUN STORE</b> kính chúc quý khách hàng một năm mới <b>AN KHANG - THỊNH VƯỢNG - VẠN SỰ NHƯ Ý</b>.",
    uuDai1: "🌸 <b>X2 GIÁ TRỊ NẠP</b> cho thẻ cào đầu tiên.",
    uuDai2: "🌸 Giảm giá <b>50%</b> toàn bộ Source Code tại shop.",
    uuDai3: "🌸 Tặng Code <b>LÌ XÌ 20K</b> khi mua đơn trên 100k.",

    // Phần thông tin liên hệ (Quan trọng)
    hotline: "0788.265.513",
    zalo: "0788.265.513 (Hoàng Kun)",
    facebook: "Nguyễn Việt Hoàng",
    linkFacebook: "https://facebook.com/nvh12072006", // Thay link FB của bạn
    linkZalo: "https://zalo.me/0788265513", // Thay link Zalo của bạn

    nutTat: "Đã hiểu (Tắt trong 2h)"
};

// ---------------------------------------------------------
// CODE XỬ LÝ GIAO DIỆN (KHÔNG CẦN SỬA)
// ---------------------------------------------------------

// 1. CSS (Giao diện dài, đẹp, chuẩn Shop Game)
const styleTet = document.createElement('style');
styleTet.innerHTML = `
    .tet-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.75); z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: 0.4s ease;
        backdrop-filter: blur(3px); font-family: 'Segoe UI', sans-serif;
    }
    
    .tet-box {
        background: #fff; 
        width: 95%; max-width: 550px; /* Làm rộng hơn chút */
        border-radius: 12px;
        border: 3px solid #d32f2f; /* Viền đỏ Tết */
        box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
        transform: scale(0.8); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-align: center; position: relative; overflow: hidden;
        max-height: 90vh; overflow-y: auto; /* Nếu dài quá thì cuộn */
    }

    .tet-overlay.active { opacity: 1; visibility: visible; }
    .tet-overlay.active .tet-box { transform: scale(1); }

    /* Header */
    .tet-header {
        background: linear-gradient(135deg, #b71c1c, #d32f2f);
        color: #ffd700; padding: 15px;
        font-size: 22px; font-weight: 900; text-transform: uppercase;
        border-bottom: 3px solid #ffd700;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    /* Body */
    .tet-body { padding: 20px; color: #333; font-size: 15px; line-height: 1.6; text-align: left; }
    
    /* Khung ưu đãi */
    .tet-promo-box {
        background: #fff8e1; border: 1px dashed #ffd700;
        padding: 15px; border-radius: 8px; margin: 15px 0;
    }
    .tet-promo-item { margin-bottom: 5px; color: #d32f2f; }

    /* Khung liên hệ (Cái mới thêm) */
    .tet-contact-box {
        background: #e3f2fd; border-left: 4px solid #2196f3;
        padding: 15px; border-radius: 4px; margin-bottom: 15px;
    }
    .tet-contact-row { margin-bottom: 8px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    .tet-contact-row i { width: 20px; text-align: center; }
    
    .c-zalo { color: #0068ff; }
    .c-fb { color: #1877f2; }
    .c-hotline { color: #d32f2f; }

    /* Nút tắt */
    .tet-btn-close {
        background: #d32f2f; color: white; border: none;
        padding: 12px 40px; border-radius: 50px;
        font-weight: bold; font-size: 16px; cursor: pointer;
        margin-bottom: 20px; transition: 0.3s;
        box-shadow: 0 4px 10px rgba(211, 47, 47, 0.4);
    }
    .tet-btn-close:hover { background: #b71c1c; transform: translateY(-2px); }

    .tet-x { position: absolute; top: 10px; right: 15px; color: #ffd700; font-size: 26px; cursor: pointer; font-weight: bold; }
    
    /* Hoa rơi */
    .flower { position: fixed; top: -10vh; z-index: 99998; pointer-events: none; animation: fall linear forwards; }
    @keyframes fall { to { transform: translateY(110vh) rotate(360deg); } }
`;
document.head.appendChild(styleTet);

// 2. Tạo HTML
const htmlTet = `
    <div class="tet-overlay" id="tetPopup">
        <div class="tet-box">
            <span class="tet-x" onclick="dongTet(false)">&times;</span>
            
            <div class="tet-header">
                <i class="fas fa-dragon"></i> ${tetConfig.tieuDe} <i class="fas fa-dragon"></i>
            </div>

            <div class="tet-body">
                <div style="text-align: center; margin-bottom: 15px;">
                    ${tetConfig.loiChuc}
                </div>

                <div class="tet-promo-box">
                    <div style="font-weight:bold; color:#d32f2f; text-align:center; margin-bottom:10px; text-transform:uppercase">🧧 LÌ XÌ ĐẦU XUÂN 🧧</div>
                    <div class="tet-promo-item">${tetConfig.uuDai1}</div>
                    <div class="tet-promo-item">${tetConfig.uuDai2}</div>
                    <div class="tet-promo-item">${tetConfig.uuDai3}</div>
                </div>

                <div class="tet-contact-box">
                    <div style="font-weight:bold; color:#333; margin-bottom:10px; text-transform:uppercase">☎️ THÔNG TIN HỖ TRỢ 24/7:</div>
                    
                    <div class="tet-contact-row c-hotline">
                        <i class="fas fa-phone-alt"></i> Hotline: ${tetConfig.hotline}
                    </div>
                    
                    <div class="tet-contact-row c-zalo">
                        <i class="fas fa-comment-dots"></i> Zalo: <a href="${tetConfig.linkZalo}" target="_blank" style="color:inherit; text-decoration:none">${tetConfig.zalo}</a>
                    </div>
                    
                    <div class="tet-contact-row c-fb">
                        <i class="fab fa-facebook-square"></i> FB Admin: <a href="${tetConfig.linkFacebook}" target="_blank" style="color:inherit; text-decoration:none">${tetConfig.facebook}</a>
                    </div>
                </div>

                <div style="font-size: 13px; color: #777; font-style: italic; text-align: center;">
                    ⚠️ Lưu ý: Shop chỉ giao dịch qua các kênh trên. Tuyệt đối không giao dịch với các tài khoản giả mạo!
                </div>
            </div>

            <button class="tet-btn-close" onclick="dongTet(true)">${tetConfig.nutTat}</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', htmlTet);

// 3. Logic hiển thị
function checkHienThiTet() {
    const timeClose = localStorage.getItem('tetPopupTime2026');
    const now = new Date().getTime();

    // CHỖ CẦN SỬA: Đưa hàm này ra ngoài if để luôn luôn chạy hoa rơi
    taoHieuUngHoaRoi(); 

    if (!timeClose || (now - timeClose > 2 * 60 * 60 * 1000)) {
        setTimeout(() => {
            const popup = document.getElementById('tetPopup');
            if (popup) popup.classList.add('active');
        }, 1000);
    }
}

function dongTet(luuTime) {
    const popup = document.getElementById('tetPopup');
    if (popup) popup.classList.remove('active');
    if (luuTime) {
        localStorage.setItem('tetPopupTime2026', new Date().getTime());
    }
}

// 4. Hiệu ứng hoa rơi (Giữ nguyên phần này)
function taoHieuUngHoaRoi() {
    const symbols = ['🌸', '🌼', '🧧', '💰']; 
    setInterval(() => {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        flower.style.left = Math.random() * 100 + 'vw';
        flower.style.fontSize = Math.random() * 20 + 10 + 'px';
        flower.style.animationDuration = Math.random() * 3 + 5 + 's';
        flower.style.opacity = Math.random();
        document.body.appendChild(flower);
        setTimeout(() => { flower.remove(); }, 8000);
    }, 300);
}

// Chạy hàm khởi tạo
checkHienThiTet();
