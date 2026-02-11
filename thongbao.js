// --- CẤU HÌNH NỘI DUNG TẾT (Sửa lời chúc ở đây) ---
const tetConfig = {
    tieuDe: "🎉 CHÚC MỪNG NĂM MỚI 2026 🎉",
    loiChuc1: "Nhân dịp năm mới, HOANGKUN STORE chúc anh em:",
    loiChuc2: "AN KHANG THỊNH VƯỢNG - VẠN SỰ NHƯ Ý",
    uuDaiTitle: "🧧 LÌ XÌ ĐẦU XUÂN CỰC KHỦNG 🧧",
    dong1: "🌸 X2 Giá trị nạp tiền cho đơn đầu tiên",
    dong2: "🌸 Giảm giá 50% toàn bộ Source Code",
    dong3: "🌸 Tặng thêm lượt quay Free mỗi ngày",
    nutTat: "Đóng thông báo (Tắt trong 2h)"
};

// ---------------------------------------------------------
// CODE XỬ LÝ GIAO DIỆN TẾT + HIỆU ỨNG HOA RƠI
// ---------------------------------------------------------

// 1. CSS (Giao diện Tết + Animation Hoa Rơi)
const styleTet = document.createElement('style');
styleTet.innerHTML = `
    /* Khung nền mờ */
    .tet-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        opacity: 0; visibility: hidden; transition: 0.4s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Hộp thông báo */
    .tet-box {
        background: #fff url('https://i.pinimg.com/originals/78/e8/26/78e826ca1b9351214dfdd5e47f7e2024.png') no-repeat bottom right; /* Hình cành đào góc (nếu có) */
        background-size: 150px;
        width: 95%; max-width: 500px;
        border-radius: 15px;
        border: 2px solid #d32f2f;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); /* Viền vàng sáng */
        transform: scale(0.8); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-align: center; position: relative;
        overflow: hidden;
    }

    .tet-overlay.active { opacity: 1; visibility: visible; }
    .tet-overlay.active .tet-box { transform: scale(1); }

    /* Header Đỏ rực */
    .tet-header {
        background: linear-gradient(to right, #d32f2f, #b71c1c);
        color: #ffd700; /* Chữ vàng kim */
        padding: 15px;
        font-size: 20px; font-weight: 900;
        text-transform: uppercase;
        border-bottom: 3px solid #ffd700;
    }

    /* Nội dung bên trong */
    .tet-body { padding: 20px; color: #333; font-size: 15px; line-height: 1.6; }
    .tet-wish { color: #d32f2f; font-weight: bold; font-size: 18px; margin: 10px 0; text-shadow: 1px 1px 0 #ffd700; }
    .tet-promo-title { background: #ffebee; color: #d32f2f; display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-bottom: 10px; border: 1px dashed #d32f2f; }
    .tet-list { text-align: left; margin-left: 10%; font-weight: 600; color: #555; }

    /* Nút đóng */
    .tet-close-btn {
        background: #d32f2f; color: #fff; border: none;
        padding: 10px 20px; border-radius: 5px;
        font-weight: bold; cursor: pointer; margin-bottom: 20px;
        transition: 0.3s; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    .tet-close-btn:hover { background: #b71c1c; transform: scale(1.05); }

    /* Nút X nhỏ */
    .tet-x { position: absolute; top: 10px; right: 15px; color: #ffd700; font-size: 24px; cursor: pointer; font-weight: bold; }
    .tet-x:hover { color: #fff; }

    /* Hiệu ứng hoa rơi */
    .flower {
        position: fixed; top: -10vh;
        z-index: 99998; /* Nằm dưới popup 1 chút */
        pointer-events: none;
        animation: fall linear forwards;
    }
    @keyframes fall {
        to { transform: translateY(110vh) rotate(360deg); }
    }
`;
document.head.appendChild(styleTet);

// 2. Tạo HTML Popup
const htmlTet = `
    <div class="tet-overlay" id="tetPopup">
        <div class="tet-box">
            <span class="tet-x" onclick="dongTet(false)">&times;</span>
            
            <div class="tet-header">
                ${tetConfig.tieuDe}
            </div>

            <div class="tet-body">
                <div>${tetConfig.loiChuc1}</div>
                <div class="tet-wish">${tetConfig.loiChuc2}</div>
                
                <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                
                <div class="tet-promo-title">${tetConfig.uuDaiTitle}</div>
                <div class="tet-list">
                    <div>${tetConfig.dong1}</div>
                    <div>${tetConfig.dong2}</div>
                    <div>${tetConfig.dong3}</div>
                </div>
            </div>

            <button class="tet-close-btn" onclick="dongTet(true)">${tetConfig.nutTat}</button>
        </div>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', htmlTet);

// 3. Logic: Tắt trong 2 giờ
function checkHienThiTet() {
    const timeClose = localStorage.getItem('tetPopupTime');
    const now = new Date().getTime();

    // Nếu chưa tắt hoặc đã qua 2 tiếng
    if (!timeClose || (now - timeClose > 2 * 60 * 60 * 1000)) {
        setTimeout(() => {
            document.getElementById('tetPopup').classList.add('active');
            taoHieuUngHoaRoi(); // Kích hoạt hoa rơi khi hiện popup
        }, 1000);
    } else {
        // Kể cả không hiện popup thì vẫn cho hoa rơi cho đẹp (nếu thích)
        // taoHieuUngHoaRoi(); 
    }
}

function dongTet(luuTime) {
    document.getElementById('tetPopup').classList.remove('active');
    if (luuTime) {
        localStorage.setItem('tetPopupTime', new Date().getTime());
    }
}

// 4. Hàm tạo hiệu ứng Hoa Đào / Hoa Mai rơi
function taoHieuUngHoaRoi() {
    const symbols = ['🌸', '🌼', '🧧', '✨']; // Hoa đào, hoa mai, bao lì xì
    
    setInterval(() => {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Random vị trí và kích thước
        flower.style.left = Math.random() * 100 + 'vw';
        flower.style.fontSize = Math.random() * 15 + 15 + 'px'; // Kích thước 15px - 30px
        flower.style.animationDuration = Math.random() * 3 + 4 + 's'; // Rơi trong 4-7s
        flower.style.opacity = Math.random();
        
        document.body.appendChild(flower);

        // Xóa bớt khi rơi xong để nhẹ máy
        setTimeout(() => { flower.remove(); }, 7000);
    }, 400); // Cứ 0.4s rơi 1 bông
}

// Chạy luôn
checkHienThiTet();
