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
    typingDiv.innerHTML = '<i>Nguyễn Việt Hoàng đang nhập...</i>';
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

    // CẤU TRÚC MENU DÙNG THẺ <br> ĐỂ XUỐNG DÒNG
    const menus = {
        'main_menu': [
            { label: '🛒 Mua Source Code', reply: 'Mình muốn xem qua các loại Source Code.', nextMenu: 'source_menu', botText: 'Cửa hàng có sẵn mã nguồn Web Bán Hàng tự động, API Thanh Toán và Web Game.<br>Bạn đang tìm loại nào?' },
            { label: '⚙️ Hỗ trợ Cài đặt', reply: 'Mình cần hỗ trợ setup mã nguồn.', nextMenu: 'setup_menu', botText: 'Bạn cần hỗ trợ up code lên Hosting (iNET, Hostinger) hay các nền tảng đám mây như Firebase, Vercel?' },
            { label: '👤 Gặp Admin Hoàng', reply: 'Cho mình gặp Admin Hoàng nhé.', nextMenu: null, botText: 'Hệ thống đã gửi thông báo tới điện thoại của Admin.<br>Bạn đợi một lát nhé, Admin sẽ rep ngay bây giờ!' }
        ],
        'source_menu': [
            { label: '🌐 Web Bán Hàng/Shop', reply: 'Mình muốn tham khảo Code Web Bán Hàng.', nextMenu: null, botText: 'Dạ, Web bán hàng bên mình tích hợp sẵn API ngân hàng tự động 24/7.<br>Bạn để lại số điện thoại hoặc Zalo để mình gửi Demo nhé!' },
            { label: '🎮 Code Web Game', reply: 'Mình xem Code Web Game.', nextMenu: null, botText: 'Các bản Source Game bên mình (Survival, Free Fire...) đều tối ưu dung lượng và chống DDOS.<br>Tên game bạn đang làm là gì ạ?' },
            { label: '🔙 Menu Chính', reply: 'Quay lại menu chính.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ],
        'setup_menu': [
            { label: '☁️ Lên Hosting / Tên miền', reply: 'Hỗ trợ mình trỏ Tên miền và up lên Hosting.', nextMenu: null, botText: 'Ok bạn, chuẩn bị sẵn tài khoản quản lý Tên Miền nhé, Admin sẽ vào Ultraviewer làm cho bạn luôn.' },
            { label: '🔥 Up lên Firebase/Vercel', reply: 'Cài đặt project lên Firebase/Vercel.', nextMenu: null, botText: 'Lên Firebase thì cấu hình hơi phức tạp ở file JSON.<br>Bạn ném file qua đây Admin kiểm tra cho nhé.' },
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
