// --- main.js (KHO KHÁCH HOANGKUNCODE - BẢN TỐI ƯU SIÊU MƯỢT) ---
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

let currentRoomId = localStorage.getItem('currentRoomId') || '';
const chatBox = document.getElementById('chat-box');

// 1. HÀM GIA HẠN 5 PHÚT (Chống văng khi đang chat)
function extendSession() { 
    localStorage.setItem('chatStartTime', Date.now()); 
}

// 2. HIỆU ỨNG "ĐANG NHẬP..." (Tạo cảm giác thật, chống lag)
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

// 3. KHỞI TẠO KHUNG CHAT
window.initChat = function() {
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    // NẾU LÀ KHÁCH MỚI
    if (!currentRoomId) {
        currentRoomId = "room_" + Date.now();
        localStorage.setItem('currentRoomId', currentRoomId);
        extendSession();
        
        // Báo cáo cho Admin
        db.ref('chats/' + currentRoomId).push({
            sender: 'system', senderName: currentName,
            text: 'Khách hàng [' + currentName + '] đã bắt đầu phiên chat.',
            timestamp: Date.now()
        });

        // Bot chào mừng (Có delay tạo hiệu ứng đang gõ)
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                const botWelcomeText = `Chào ${currentName}! 👋 Cảm ơn bạn đã liên hệ HOANGKUN STORE.\n\n` +
                                      `Nguyễn Việt Hoàng sẽ trả lời bạn sớm nhất có thể ạ!\n\n` +
                                      `Trong lúc chờ đợi, bạn cần hỗ trợ về Source Code nào ạ? 😊`;
                
                db.ref('chats/' + currentRoomId).push({
                    sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                    text: botWelcomeText, timestamp: Date.now()
                });
                
                // Gọi dàn nút bấm ra sau khi chào xong
                setTimeout(() => window.showBotOptions('main_menu'), 400);
            }, 1200); // Giả vờ gõ chữ mất 1.2s
        }, 300);
    }

    if (chatBox) chatBox.innerHTML = ''; 
    db.ref('chats/' + currentRoomId).off();

    // NHẬN TIN NHẮN TỪ FIREBASE
    db.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if(data.sender === 'system') return; 
        
        const msgDiv = document.createElement('div');
        msgDiv.className = data.sender === 'admin' ? 'message msg-received' : 'message msg-sent';
        msgDiv.textContent = data.text;
        
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
} // CHÚ Ý: Dấu đóng ngoặc này cực quan trọng để kết thúc hàm initChat!

// 4. HỆ THỐNG KỊCH BẢN BOT ĐA TẦNG (QUICK REPLIES)
window.showBotOptions = function(menuType) {
    if (!chatBox) return;

    // Dọn dẹp nút cũ
    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-replies-container';

    // CẤU TRÚC MENU (Viết kiểu này siêu gọn, dễ thêm bớt)
    const menus = {
        'main_menu': [
            { label: '🛒 Mua Source Code', reply: 'Mình muốn xem qua các loại Source Code.', nextMenu: 'source_menu', botText: 'Cửa hàng có sẵn mã nguồn Web Bán Hàng tự động, API Thanh Toán và Web Game. Bạn đang tìm loại nào?' },
            { label: '⚙️ Hỗ trợ Cài đặt', reply: 'Mình cần hỗ trợ setup mã nguồn.', nextMenu: 'setup_menu', botText: 'Bạn cần hỗ trợ up code lên Hosting (iNET, Hostinger) hay các nền tảng đám mây như Firebase, Vercel?' },
            { label: '👤 Gặp Admin Hoàng', reply: 'Cho mình gặp Admin Hoàng nhé.', nextMenu: null, botText: 'Hệ thống đã báo thông báo tới điện thoại của Admin. Bạn đợi một lát nhé, Admin sẽ rep ngay bây giờ!' }
        ],
        'source_menu': [
            { label: '🌐 Web Bán Hàng/Shop', reply: 'Mình muốn tham khảo Code Web Bán Hàng.', nextMenu: null, botText: 'Dạ, Web bán hàng bên mình tích hợp sẵn API ngân hàng tự động 24/7. Bạn để lại số điện thoại hoặc Zalo để mình gửi Demo nhé!' },
            { label: '🎮 Code Web Game', reply: 'Mình xem Code Web Game.', nextMenu: null, botText: 'Các bản Source Game bên mình (Survival, Free Fire...) đều tối ưu dung lượng và chống DDOS. Tên game bạn đang làm là gì ạ?' },
            { label: '🔙 Menu Chính', reply: 'Quay lại menu chính.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ],
        'setup_menu': [
            { label: '☁️ Lên Hosting / Tên miền', reply: 'Hỗ trợ mình trỏ Tên miền và up lên Hosting.', nextMenu: null, botText: 'Ok bạn, chuẩn bị sẵn tài khoản quản lý Tên Miền nhé, Admin sẽ vào Ultraviewer làm cho bạn luôn.' },
            { label: '🔥 Up lên Firebase/Vercel', reply: 'Cài đặt project lên Firebase/Vercel.', nextMenu: null, botText: 'Lên Firebase thì cấu hình hơi phức tạp ở file JSON. Bạn ném file qua đây Admin kiểm tra cho nhé.' },
            { label: '🔙 Menu Chính', reply: 'Quay lại.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ]
    };

    // Tạo các nút hiển thị ra màn hình
    if(menus[menuType]) {
        menus[menuType].forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.innerHTML = opt.label;
            
            btn.onclick = () => {
                const currentName = window.guestName || localStorage.getItem('guestName') || 'Khách';
                extendSession(); // Khách bấm nút là auto gia hạn thời gian
                
                // Khách tự nhắn
                db.ref('chats/' + currentRoomId).push({
                    sender: 'user', senderName: currentName,
                    text: opt.reply, timestamp: Date.now()
                });

                optionsDiv.remove(); // Nút biến mất
                
                // Hiệu ứng Bot đang gõ chữ trả lời
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    db.ref('chats/' + currentRoomId).push({
                        sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                        text: opt.botText, timestamp: Date.now()
                    });

                    // Hiện menu tiếp theo (nếu có)
                    if (opt.nextMenu) {
                        setTimeout(() => window.showBotOptions(opt.nextMenu), 500);
                    }
                }, 1000); // Chờ 1 giây giả vờ gõ phím
            };
            optionsDiv.appendChild(btn);
        });
        chatBox.appendChild(optionsDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 5. GỬI TIN NHẮN TỪ Ô NHẬP TEXT
window.sendMessage = function() {
    const input = document.getElementById('msg-input');
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    if(input && input.value.trim() !== '') {
        extendSession(); // Nhắn tin xong là auto gia hạn 5 phút
        
        db.ref('chats/' + currentRoomId).push({ 
            sender: 'user', senderName: currentName,
            text: input.value, timestamp: Date.now() 
        });
        input.value = '';
    }
}
