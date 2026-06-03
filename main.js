// --- main.js (KHO KHÁCH HOANGKUNCODE) ---
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let currentRoomId = localStorage.getItem('currentRoomId') || '';
const chatBox = document.getElementById('chat-box');

window.initChat = function() {
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    // NẾU LÀ KHÁCH MỚI -> TẠO PHÒNG & KÍCH HOẠT BOT
    if (!currentRoomId) {
        currentRoomId = "room_" + Date.now();
        localStorage.setItem('currentRoomId', currentRoomId);
        
        // 1. Báo cáo ngầm cho Admin
        db.ref('chats/' + currentRoomId).push({
            sender: 'system',
            senderName: currentName,
            text: 'Khách hàng [' + currentName + '] đã bắt đầu phiên chat.',
            timestamp: Date.now()
        });

        // 2. Bot tự động chào
        const botWelcomeText = `Chào ${currentName}! 👋 Cảm ơn bạn đã liên hệ HOANGKUN STORE.\n\n` +
                              `Nguyễn Việt Hoàng sẽ trả lời bạn sớm nhất có thể ạ!\n\n` +
                              `Trong lúc chờ đợi, bạn cần hỗ trợ về Source Code nào ạ? 😊`;

        db.ref('chats/' + currentRoomId).push({
            sender: 'admin', 
            senderName: 'Nguyễn Việt Hoàng', 
            text: botWelcomeText,
            timestamp: Date.now()
        });

        // 3. Gọi dàn nút bấm Menu Chính sau 0.5 giây
        setTimeout(() => {
            window.showBotOptions('main_menu');
        }, 500);
    }

    if (chatBox) chatBox.innerHTML = ''; 
    db.ref('chats/' + currentRoomId).off();

    // NHẬN TIN NHẮN TỪ FIREBASE HIỂN THỊ LÊN MÀN HÌNH
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
}

// ==================================================
// HỆ THỐNG KỊCH BẢN BOT ĐA TẦNG (QUICK REPLIES)
// ==================================================
window.showBotOptions = function(menuType) {
    if (!chatBox) return;

    // Xóa bộ nút cũ nếu có để không bị rối màn hình
    const oldBtns = document.querySelectorAll('.quick-replies-container');
    oldBtns.forEach(btn => btn.remove());

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-replies-container';

    let buttons = [];

    // --- KỊCH BẢN 1: MENU CHÍNH ---
    if (menuType === 'main_menu') {
        buttons = [
            { label: '🛒 Mua Source Code', reply: 'Mình muốn xem qua các loại Source Code.', nextMenu: 'source_menu', botText: 'Cửa hàng có sẵn mã nguồn Web Bán Hàng tự động, API Thanh Toán và Web Game. Bạn đang tìm loại nào?' },
            { label: '⚙️ Hỗ trợ Cài đặt', reply: 'Mình cần hỗ trợ setup mã nguồn.', nextMenu: 'setup_menu', botText: 'Bạn cần hỗ trợ up code lên Hosting (iNET, Hostinger) hay các nền tảng đám mây như Firebase, Vercel?' },
            { label: '👤 Gặp Admin Hoàng', reply: 'Cho mình gặp Admin Hoàng nhé.', nextMenu: null, botText: 'Hệ thống đã báo thông báo tới điện thoại của Admin. Bạn đợi một lát nhé, Admin sẽ rep ngay bây giờ!' }
        ];
    } 
    // --- KỊCH BẢN 2: CHỌN MUA SOURCE CODE ---
    else if (menuType === 'source_menu') {
        buttons = [
            { label: '🌐 Web Bán Hàng/Shop', reply: 'Mình muốn tham khảo Code Web Bán Hàng.', nextMenu: null, botText: 'Dạ, Web bán hàng bên mình tích hợp sẵn API ngân hàng tự động 24/7. Bạn để lại số điện thoại hoặc Zalo để mình gửi Demo nhé!' },
            { label: '🎮 Code Web Game', reply: 'Mình xem Code Web Game.', nextMenu: null, botText: 'Các bản Source Game bên mình (Survival, Free Fire...) đều tối ưu dung lượng và chống DDOS. Tên game bạn đang làm là gì ạ?' },
            { label: '🔙 Menu Chính', reply: 'Quay lại menu chính.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ];
    }
    // --- KỊCH BẢN 3: HỖ TRỢ SETUP ---
    else if (menuType === 'setup_menu') {
        buttons = [
            { label: '☁️ Lên Hosting / Tên miền', reply: 'Hỗ trợ mình trỏ Tên miền và up lên Hosting.', nextMenu: null, botText: 'Ok bạn, chuẩn bị sẵn tài khoản quản lý Tên Miền nhé, Admin sẽ vào Ultraviewer làm cho bạn luôn.' },
            { label: '🔥 Up lên Firebase/Vercel', reply: 'Cài đặt project lên Firebase/Vercel.', nextMenu: null, botText: 'Lên Firebase thì cấu hình hơi phức tạp ở file JSON. Bạn ném file qua đây Admin kiểm tra cho nhé.' },
            { label: '🔙 Menu Chính', reply: 'Quay lại.', nextMenu: 'main_menu', botText: 'Vui lòng chọn thông tin bạn cần hỗ trợ:' }
        ];
    }

    // Đổ nút ra màn hình
    buttons.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.innerHTML = opt.label;
        btn.onclick = () => {
            const currentName = window.guestName || localStorage.getItem('guestName') || 'Khách';
            
            // Khách tự động nhắn câu trả lời lên
            db.ref('chats/' + currentRoomId).push({
                sender: 'user', senderName: currentName,
                text: opt.reply, timestamp: Date.now()
            });

            optionsDiv.remove(); // Bấm xong nút tự biến mất

            // Bot suy nghĩ 0.6 giây rồi rep lại
            setTimeout(() => {
                db.ref('chats/' + currentRoomId).push({
                    sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                    text: opt.botText, timestamp: Date.now()
                });

                // Nếu có kịch bản tiếp theo thì móc ra
                if (opt.nextMenu) {
                    setTimeout(() => window.showBotOptions(opt.nextMenu), 500);
                }
            }, 600);
        };
        optionsDiv.appendChild(btn);
    });

    chatBox.appendChild(optionsDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 4. GỬI TIN NHẮN THỦ CÔNG TỪ THANH CHAT
window.sendMessage = function() {
    const input = document.getElementById('msg-input');
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    if(input && input.value.trim() !== '') {
        db.ref('chats/' + currentRoomId).push({ 
            sender: 'user',
            senderName: currentName,
            text: input.value, 
            timestamp: Date.now() 
        });
        input.value = '';
    }
}
