// --- KHÁCH: TỰ ĐỘNG TẠO PHÒNG CHAT KÍN ---
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

// Tìm kiếm mã phòng cũ, nếu chưa có thì để rỗng chờ khởi tạo
let currentRoomId = localStorage.getItem('currentRoomId') || '';
const chatBox = document.getElementById('chat-box');

window.initChat = function() {
    const currentName = window.guestName || localStorage.getItem('guestName');
    
    // 1. NẾU LÀ KHÁCH MỚI HOÀN TOÀN -> TẠO MÃ PHÒNG RIÊNG
    if (!currentRoomId) {
        currentRoomId = "room_" + Date.now();
        localStorage.setItem('currentRoomId', currentRoomId);
        
      // Bản tin báo hệ thống ngầm cho Admin biết có khách mới
        db.ref('chats/' + currentRoomId).push({
            sender: 'system',
            senderName: currentName,
            text: 'Khách hàng [' + currentName + '] đã bắt đầu phiên chat.',
            timestamp: Date.now()
        });

        // ==========================================
        // BOT TỰ ĐỘNG GỬI TIN NHẮN CHÀO MỪNG
        // ==========================================
        const botWelcomeText = `Chào ${currentName}! 👋 Cảm ơn bạn đã liên hệ HOANGKUN STORE.\n\n` +
                              `Yêu cầu của bạn đã được chuyển đến Nguyễn Việt Hoàng.\n` +
                              `Nguyễn Việt Hoàng sẽ trả lời bạn sớm nhất có thể ạ!\n\n` +
                              `Trong lúc chờ đợi, bạn cần hỗ trợ về Source Code nào ạ? 😊`;

        db.ref('chats/' + currentRoomId).push({
            sender: 'admin', 
            senderName: 'Nguyễn Việt Hoàng', 
            text: botWelcomeText,
            timestamp: Date.now()
        });
    }

    if (chatBox) chatBox.innerHTML = ''; 
    db.ref('chats/' + currentRoomId).off();

    // 2. NHẬN TIN NHẮN TỪ PHÒNG KÍN NÀY
    db.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if(data.sender === 'system') return; // Ẩn tin nhắn hệ thống đi không cho khách thấy
        
        const msgDiv = document.createElement('div');
        msgDiv.className = data.sender === 'admin' ? 'message msg-received' : 'message msg-sent';
        msgDiv.textContent = data.text;
        
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}

// 3. GỬI TIN NHẮN
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
