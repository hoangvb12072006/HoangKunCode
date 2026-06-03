// --- main.js (BẢN TỐI ƯU - RESET KHI TẢI LẠI TRANG) ---
const firebaseConfig = {
    apiKey: "AIzaSyD9Vi39Xuj8qf_bYjtZLAjpOkEvMIhzD1Y",
    authDomain: "hoangkun-chat.firebaseapp.com",
    databaseURL: "https://hoangkun-chat-default-rtdb.firebaseio.com",
    projectId: "hoangkun-chat",
    storageBucket: "hoangkun-chat.firebasestorage.app",
    messagingSenderId: "713375578505",
    appId: "1:713375578505:web:6d7d5c2a2d9a1608998958",
    measurementId: "G-JY93M87T99"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentRoomId = '';
const chatBox = document.getElementById('chat-box');

// HIỆU ỨNG "ĐANG NHẬP..."
function showTyping() {
    if (!chatBox) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message msg-received typing-indicator';
    typingDiv.id = 'typing-effect';
    
    // 👇 Nhét 3 cái chấm tròn vào đây thay cho chữ 👇
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typing-effect');
    if (el) el.remove();
}

// KHỞI TẠO KHUNG CHAT MỚI
window.initChat = function() {
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    // Xóa nội dung chào mừng HTML mặc định
    if (chatBox) chatBox.innerHTML = ''; 

    // Luôn tạo phòng mới vì đã reset khi khách F5
    currentRoomId = "room_" + Date.now();
    localStorage.setItem('currentRoomId', currentRoomId);
    
    db.ref('chats/' + currentRoomId).push({
        sender: 'system', senderName: currentName,
        text: 'Khách hàng [' + currentName + '] đã bắt đầu phiên chat.',
        timestamp: Date.now()
    });

    // Bật bộ lắng nghe tin nhắn ngay lập tức
    db.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if(data.sender === 'system') return; 
        
        const msgDiv = document.createElement('div');
        msgDiv.className = data.sender === 'admin' ? 'message msg-received' : 'message msg-sent';
        msgDiv.innerHTML = data.text; // Đổi thành innerHTML để nhận thẻ <br> và <b>
        
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    // Gọi Bot chào mừng sau 0.3s
    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const botWelcomeText = `Chào <b>${currentName}</b>! 👋 Cảm ơn bạn đã liên hệ HOANGKUN STORE.<br><br>` +
                                  `Nguyễn Việt Hoàng sẽ trả lời bạn sớm nhất có thể ạ!<br><br>` +
                                  `Trong lúc chờ đợi, bạn cần hỗ trợ về Source Code nào ạ? 😊`;
            
            db.ref('chats/' + currentRoomId).push({
                sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                text: botWelcomeText, timestamp: Date.now()
            });
            
            // Hiện nút Menu
            setTimeout(() => window.showBotOptions('main_menu'), 400);
        }, 1200); 
    }, 300);
}

// HỆ THỐNG MENU ĐA TẦNG
window.showBotOptions = function(menuType) {
    if (!chatBox) return;

    // Dọn dẹp nút cũ
    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-replies-container';

   // CẤU TRÚC MENU ĐA TẦNG (BẢN MỞ RỘNG FULL TÍNH NĂNG)
    const menus = {
        'main_menu': [
            { label: '🛒 Mua Source Code', reply: 'Mình muốn xem qua các loại Source Code.', nextMenu: 'source_menu', botText: 'HOANGKUN STORE chuyên cung cấp mã nguồn chuẩn, an toàn & bảo mật.<br>Bạn đang tìm Code Web hay Script Game?' },
            { label: '⚙️ Hỗ trợ Cài đặt & API', reply: 'Mình cần hỗ trợ setup mã nguồn và API.', nextMenu: 'setup_menu', botText: 'Bạn cần hỗ trợ up code lên Hosting/Cloud hay tích hợp API thanh toán tự động?' },
            { label: 'ℹ️ Giới thiệu & Chính sách', reply: 'Cho mình xem thông tin về Store.', nextMenu: 'intro_menu', botText: 'Dạ, bạn muốn tìm hiểu về thông tin cửa hàng hay chính sách bảo hành Code ạ?' },
            { label: '👤 Gặp Admin Hoàng', reply: 'Cho mình gặp trực tiếp Admin Hoàng nhé.', nextMenu: null, botText: 'Hệ thống đã gửi thông báo tới điện thoại của Admin.<br>Bạn đợi một lát nhé, Admin sẽ rep ngay bây giờ!' }
        ],
        
        // --- NHÁNH 1: MUA SOURCE CODE ---
        'source_menu': [
            { label: '🌐 Web Bán Hàng / Shop', reply: 'Mình muốn tham khảo Code Web Bán Hàng.', nextMenu: null, botText: 'Dạ, Web bán hàng bên mình tích hợp sẵn API ngân hàng tự động 24/7.<br>Bạn để lại số điện thoại hoặc Zalo để mình gửi Demo nhé!' },
            { label: '🎨 Landing Page / Portfolio', reply: 'Mình cần giao diện Landing Page cá nhân.', nextMenu: null, botText: 'Bên mình có sẵn các mẫu giao diện Dark Mode, Cyberpunk và Pixel Art cực chất.<br>Bạn muốn làm chủ đề gì?' },
            { label: '🎮 Code Web Game / Script', reply: 'Mình xem Code Web Game & Script.', nextMenu: 'game_menu', botText: 'Store có đủ các thể loại tối ưu dung lượng và chống DDOS.<br>Bạn chọn thể loại game bên dưới nhé:' },
            { label: '🔙 Menu Chính', reply: 'Quay lại menu chính.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ],

        // --- NHÁNH 1.1: CHI TIẾT SCRIPT GAME ---
        'game_menu': [
            { label: '🦖 Script ARK / Free Fire', reply: 'Mình cần Script cho ARK Mobile hoặc Free Fire.', nextMenu: null, botText: 'Các bản Script APK/OBB bên mình đều được update chống ban mới nhất.<br>Bạn đang dùng Android hay giả lập?' },
            { label: '👾 Game Pixel Survival', reply: 'Mình quan tâm source game Pixel Survival.', nextMenu: null, botText: 'Source game Pixel Survival viết bằng Phaser.js cực mượt, dễ dàng build lên web.<br>Bạn cần tích hợp quảng cáo luôn không?' },
            { label: '🔙 Quay lại Menu Code', reply: 'Quay lại chọn code khác.', nextMenu: 'source_menu', botText: 'Cửa hàng có sẵn mã nguồn Web và Game.<br>Bạn đang tìm loại nào?' }
        ],

        // --- NHÁNH 2: HỖ TRỢ SETUP & API ---
        'setup_menu': [
            { label: '☁️ Lên Hosting / Tên miền', reply: 'Hỗ trợ mình trỏ Tên miền và up lên Hosting.', nextMenu: null, botText: 'Ok bạn, chuẩn bị sẵn tài khoản quản lý Tên Miền nhé, Admin sẽ vào Ultraviewer làm cho bạn luôn.' },
            { label: '🔥 Up lên Firebase / Vercel', reply: 'Cài đặt project lên Firebase/Vercel.', nextMenu: null, botText: 'Lên Firebase thì cấu hình hơi phức tạp ở file JSON.<br>Bạn ném file qua đây Admin kiểm tra cho nhé.' },
            { label: '🔗 Tích hợp API SePay / Link4M', reply: 'Hỗ trợ mình tích hợp API SePay và Link4M.', nextMenu: null, botText: 'Bên mình nhận setup API Banking SePay tự động và kịch bản rút gọn link Link4M kiếm tiền.<br>Bạn gửi mã nguồn để Admin check nhé.' },
            { label: '🔙 Menu Chính', reply: 'Quay lại.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ],

        // --- NHÁNH 3: GIỚI THIỆU & CHÍNH SÁCH ---
        'intro_menu': [
            { label: '🏢 Về HOANGKUN STORE', reply: 'Giới thiệu về cửa hàng.', nextMenu: null, botText: '<b>HOANGKUN STORE</b> là hệ thống độc quyền chuyên cung cấp <b>Source Code</b> và <b>Script Game</b> chuẩn xác.<br><i>Lưu ý: Store chỉ bán code/script, không bán đồ linh tinh nhé!</i> 😎' },
            { label: '🛡️ Chính sách bảo hành', reply: 'Chính sách bảo hành code thế nào?', nextMenu: null, botText: 'Mọi Source Code bán ra đều được bảo hành trọn đời.<br>Hỗ trợ fix bug, cập nhật bản vá và hướng dẫn cài đặt từ A-Z.' },
            { label: '🔙 Menu Chính', reply: 'Quay lại.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ]
    };

    if(menus[menuType]) {
        menus[menuType].forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.innerHTML = opt.label;
            
            btn.onclick = () => {
                const currentName = window.guestName || localStorage.getItem('guestName') || 'Khách';
                
                db.ref('chats/' + currentRoomId).push({
                    sender: 'user', senderName: currentName,
                    text: opt.reply, timestamp: Date.now()
                });

                optionsDiv.remove(); 
                
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    db.ref('chats/' + currentRoomId).push({
                        sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                        text: opt.botText, timestamp: Date.now()
                    });

                    if (opt.nextMenu) {
                        setTimeout(() => window.showBotOptions(opt.nextMenu), 500);
                    }
                }, 1000);
            };
            optionsDiv.appendChild(btn);
        });
        chatBox.appendChild(optionsDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// GỬI TIN NHẮN TỪ Ô NHẬP TEXT
window.sendMessage = function() {
    const input = document.getElementById('msg-input');
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    if(input && input.value.trim() !== '') {
        db.ref('chats/' + currentRoomId).push({ 
            sender: 'user', senderName: currentName,
            text: input.value, timestamp: Date.now() 
        });
        input.value = '';
    }
}

// ==========================================
// TÍNH NĂNG KẾT THÚC CHAT & ĐÁNH GIÁ (FEEDBACK)
// ==========================================

window.endChat = function() {
    if(!currentRoomId) return;

    // 1. Gửi thông báo ngầm cho Admin biết khách đã dừng chat
    db.ref('chats/' + currentRoomId).push({
        sender: 'system', senderName: window.guestName,
        text: 'Khách hàng [' + window.guestName + '] đã chủ động kết thúc phiên chat.',
        timestamp: Date.now()
    });

    // 2. Ẩn thanh nhập tin nhắn & giấu nút kết thúc đi
    const inputArea = document.getElementById('bottom-input-area');
    if (inputArea) inputArea.style.display = 'none';
    const endBtn = document.querySelector('.end-chat-btn');
    if (endBtn) endBtn.style.display = 'none';

    // 3. Xóa các bộ nút tự động nếu còn đang hiện
    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());

    // 4. Hiển thị form Đánh Giá 5 sao
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-box';
    reviewDiv.innerHTML = `
        <div class="review-title">Phiên chat đã kết thúc</div>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Vui lòng đánh giá chất lượng hỗ trợ của Admin</p>
        
        <div class="stars">
            <input type="radio" id="star5" name="rating" value="5" /><label for="star5">★</label>
            <input type="radio" id="star4" name="rating" value="4" /><label for="star4">★</label>
            <input type="radio" id="star3" name="rating" value="3" /><label for="star3">★</label>
            <input type="radio" id="star2" name="rating" value="2" /><label for="star2">★</label>
            <input type="radio" id="star1" name="rating" value="1" /><label for="star1">★</label>
        </div>
        
        <textarea id="review-comment" class="review-input" rows="3" placeholder="Nhận xét của bạn về HOANGKUN STORE... (Không bắt buộc)"></textarea>
        <button class="submit-review-btn" onclick="submitReview()">Gửi Đánh Giá</button>
    `;
    
    chatBox.appendChild(reviewDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.submitReview = function() {
    const ratingEle = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById('review-comment').value.trim();
    const rating = ratingEle ? ratingEle.value : 5; // Nếu lười ko bấm sao thì mặc định cho 5 sao luôn =))

    // Lưu Đánh giá lên Firebase (Tạo riêng một thư mục 'reviews' trên Database)
    db.ref('reviews/' + currentRoomId).set({
        guestName: window.guestName,
        rating: rating + ' Sao',
        comment: comment || 'Không có nhận xét',
        timestamp: Date.now()
    });

    // Xóa trí nhớ để lần sau F5 là thành khách mới
    localStorage.removeItem('guestName');
    localStorage.removeItem('currentRoomId');

    // Đổi giao diện Cảm ơn
    const reviewBox = document.querySelector('.review-box');
    if(reviewBox) {
        reviewBox.innerHTML = `
            <div style="font-size: 45px; margin-bottom: 10px;">💖</div>
            <div class="review-title">Cảm ơn bạn đã đánh giá!</div>
            <p style="font-size: 13px; color: #64748b;">Đánh giá <b>${rating} Sao</b> của bạn sẽ giúp hệ thống phục vụ tốt hơn.</p>
            <button class="submit-review-btn" style="margin-top: 15px;" onclick="location.reload()">Quay Về Trang Chủ</button>
        `;
    }
}
