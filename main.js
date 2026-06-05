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

// 🌟 THÊM ÂM THANH CHO KHÁCH TẠI ĐÂY
const notifySound = new Audio('https://assets.mixkit.co/active_storage/sfx/236/236-preview.mp3');
let lastPingTime = Date.now(); // Lưu mốc thời gian để không kêu lại tin cũ lúc tải trang

// 1. HIỆU ỨNG ĐANG GÕ
function showTyping() {
    if (!chatBox) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message msg-received typing-indicator';
    typingDiv.id = 'typing-effect';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typing-effect');
    if (el) el.remove();
}

// 2. KHỞI TẠO KHUNG CHAT MỚI
window.initChat = function() {
    const currentName = window.guestName || localStorage.getItem('guestName');
    if (chatBox) chatBox.innerHTML = ''; 

    currentRoomId = "room_" + Date.now();
    localStorage.setItem('currentRoomId', currentRoomId);
    
    db.ref('chats/' + currentRoomId).push({
        sender: 'system', senderName: currentName,
        text: 'Khách hàng [' + currentName + '] đã bắt đầu phiên chat.',
        timestamp: Date.now()
    });

    // LẮNG NGHE TIN NHẮN TỪ FIREBASE
    db.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        
        // --- NẾU NHẬN ĐƯỢC LỆNH KẾT THÚC TỪ ADMIN ---
        if (data.sender === 'system' && data.action === 'ADMIN_END_CHAT') {
            if (typeof window.endChat === 'function') {
                window.endChat(true); // Gửi cờ "true" để biết Admin tự khóa
            }
            return;
        }

        // 🌟 NẾU ADMIN GỬI TIN NHẮN MỚI -> PHÁT ÂM THANH
        if (data.sender === 'admin' && data.timestamp > lastPingTime) {
            notifySound.play().catch(e => console.log("Trình duyệt chặn âm thanh vì khách chưa tương tác."));
            lastPingTime = data.timestamp; // Cập nhật lại thời gian
        }

        // Bỏ qua các tin nhắn hệ thống khác (không hiển thị lên màn hình)
        if(data.sender === 'system') return; 
        
        const msgDiv = document.createElement('div');
        msgDiv.className = data.sender === 'admin' ? 'message msg-received' : 'message msg-sent';
        msgDiv.innerHTML = data.text; 
        
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    // Gọi Bot chào mừng
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
            
            setTimeout(() => window.showBotOptions('main_menu'), 400);
        }, 1200); 
    }, 300);
}

// 3. MENU KỊCH BẢN ĐA TẦNG
window.showBotOptions = function(menuType) {
    if (!chatBox) return;

    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-replies-container';

  const menus = {
        'main_menu': [
            { 
                label: '🛒 Mua Source Code / Script', 
                reply: 'Mình muốn xem qua các loại Source Code và Script Game.', 
                nextMenu: 'source_menu', 
                botText: 'Chào mừng bạn đến với hệ thống CSKH tự động của <b>HOANGKUN STORE</b>! 🚀<br><br>Store chuyên cung cấp mã nguồn chuẩn, an toàn & bảo mật (Lưu ý: Bên mình CHỈ bán Source Code và Script, không bán vật phẩm hay đồ linh tinh).<br><br>Bạn đang cần tìm Code Web, Script Game hay cần hỗ trợ kỹ thuật cài đặt ạ?' 
            },
            { 
                label: '⚙️ Hỗ trợ Cài đặt & API', 
                reply: 'Mình cần hỗ trợ setup mã nguồn, Hosting và API tự động.', 
                nextMenu: 'setup_menu', 
                botText: 'Dạ, bên mình nhận hỗ trợ kỹ thuật toàn diện từ A-Z.<br><br>Bạn cần hỗ trợ cấu hình đưa web lên Hosting/Cloud (Firebase, Vercel), hay cần tích hợp API thanh toán tự động (SePay) cho shop của mình?' 
            },
            { 
                label: 'ℹ️ Giới thiệu & Chính sách', 
                reply: 'Cho mình xem thông tin về Store và chính sách bảo hành.', 
                nextMenu: 'intro_menu', 
                botText: 'Cảm ơn bạn đã quan tâm đến HOANGKUN STORE! 💎<br><br>Bạn muốn tìm hiểu về thông tin hoạt động của cửa hàng hay xem chi tiết về chính sách bảo hành mã nguồn ạ?' 
            },
            { 
                label: '👤 Gặp Admin Hoàng', 
                reply: 'Bot trả lời chưa đúng ý, cho mình gặp trực tiếp Admin Hoàng nhé.', 
                nextMenu: null, 
                botText: 'Hệ thống đã phát tín hiệu "Ting Ting" tới điện thoại của Admin Nguyễn Việt Hoàng. 🔔<br><br>Bạn vui lòng đợi một lát nhé, Admin đang mở máy và sẽ vào hỗ trợ bạn ngay bây giờ!' 
            }
        ],
        
        'source_menu': [
            { 
                label: '🌐 Code Web Bán Hàng / Shop', 
                reply: 'Mình muốn tham khảo Code Web Shop bán hàng tự động.', 
                nextMenu: null, 
                botText: 'Tuyệt vời! Hệ thống Web Shop bên mình được lập trình cực mượt bằng HTML/CSS/JS thuần hoặc Framework hiện đại. Đặc biệt đã được tích hợp sẵn <b>API Banking tự động 24/7</b> xử lý đơn hàng trong 3s.<br><br>Bạn để lại số điện thoại hoặc Zalo để Admin gửi link Demo thực tế cho bạn test thử nhé!' 
            },
            { 
                label: '🎨 Landing Page / Portfolio', 
                reply: 'Mình cần giao diện Landing Page cá nhân thật độc lạ.', 
                nextMenu: null, 
                botText: 'Bên mình đang có sẵn bộ sưu tập giao diện siêu chất, nổi bật với các phong cách: <b>Dark Mode</b> huyền bí, <b>Cyberpunk</b> neon rực rỡ, và <b>Pixel Art 8-bit</b> hoài cổ.<br><br>Bạn muốn cá nhân hóa web theo phong cách nào để Admin gửi mẫu phù hợp nhất?' 
            },
            { 
                label: '🎮 Code Web Game / Script', 
                reply: 'Cho mình xem danh sách Code Web Game & Script Mod.', 
                nextMenu: 'game_menu', 
                botText: 'Kho lưu trữ của Store có đủ các thể loại Web Game siêu nhẹ và Script tối ưu chống DDOS cực tốt.<br><br>Bạn quan tâm đến Script Mobile hay Web Game, vui lòng chọn thể loại bên dưới nhé:' 
            },
            { 
                label: '🔙 Menu Chính', 
                reply: 'Quay lại menu chính.', 
                nextMenu: 'main_menu', 
                botText: 'Đã quay lại Menu chính. Vui lòng chọn thông tin bạn cần hỗ trợ:' 
            }
        ],

      'game_menu': [
            { 
                label: '🔥 Hack Free Fire / Liên Quân', 
                reply: 'Mình cần tìm các bản Hack cho game Free Fire hoặc Liên Quân Mobile.', 
                nextMenu: null, 
                botText: 'Chào bạn! Các bản Hack <b>Free Fire</b> và <b>Liên Quân Mobile</b> bên mình luôn được cập nhật liên tục theo từng phiên bản mới nhất của nhà phát hành. 🔥<br><br><b>Các chức năng Hack đỉnh cao:</b><br>- Free Fire: Auto Headshot 100%, Nhìn xuyên tường (Wallhack), Định vị anten, Khóa mục tiêu (Aimbot).<br>- Liên Quân: Hack Map sáng toàn bản đồ, Hiện Cam siêu rộng, Hiện thời gian hồi chiêu của địch, Cấm chọn ẩn.<br><br>File cài đặt cực dễ, cam kết an toàn và tích hợp sẵn <b>Anti-ban/Bypass chống khóa acc</b> cực kỳ xịn sò cho acc chính.<br><br>Bạn đang cần bản cài cho Android hay chạy trên PC?' 
            },
            { 
                label: '🤖 Hack Roblox / Blox Fruits', 
                reply: 'Mình đang tìm mua bản Hack Roblox, đặc biệt là Blox Fruits.', 
                nextMenu: null, 
                botText: 'Chuẩn luôn bạn ơi! 😎<br><br><b>HOANGKUN STORE</b> sở hữu kho Hack Roblox cực mượt, đặc biệt tối ưu cho <b>Blox Fruits</b> với các chức năng VIP:<br>- Auto Farm Level siêu tốc, Auto Farm Bone, Mastery.<br>- Auto Raid, săn Trái Ác Quỷ (Devil Fruit Sniper).<br>- Tự động hạ Boss, nhặt item huyền thoại không tốn sức.<br><br>Bản Hack siêu nhẹ, chống giật lag, chạy mượt trên các Client (Fluxus, Delta, Codex, Hydrogen...) cả Mobile lẫn PC.<br><br>Bạn cần mua bản VIP Full chức năng hay bản treo máy nhẹ nhàng ạ?' 
            },
            { 
                label: '👾 Hack Game Khác', 
                reply: 'Mình muốn tìm bản hack cho các tựa game khác.', 
                nextMenu: null, 
                botText: 'Ngoài Free Fire, Liên Quân và Roblox, Admin còn nhận cung cấp các bản Hack, Auto cho nhiều tựa game Mobile khác nữa. Đặc biệt là các dòng game sinh tồn, cày cuốc.<br><br>Bạn đang cần Hack cho game nào, cứ nhắn tên game lên đây để Admin check kho và báo lại luôn nhé!' 
            },
            { 
                label: '🔙 Quay lại Menu', 
                reply: 'Quay lại danh mục trước.', 
                nextMenu: 'source_menu', 
                botText: 'Đã quay lại danh mục trước. Hiện tại HOANGKUN STORE đang sẵn có Code Web Shop, Landing Page và Hack Game.<br><br>Vui lòng chọn loại bạn quan tâm:' 
            }
        ],

       'setup_menu': [
            { 
                label: '🛠️ Cài đặt Code đã mua', 
                reply: 'Mình cần hỗ trợ cài đặt Source Code vừa mua trên Store.', 
                nextMenu: null, 
                botText: 'Cảm ơn bạn đã ủng hộ HOANGKUN STORE! 💎<br><br>Mọi mã nguồn mua tại hệ thống đều được Admin hỗ trợ cài đặt hoàn toàn miễn phí.<br><br>Bạn vui lòng gửi <b>Mã đơn hàng</b> hoặc <b>Tên code</b> vừa mua kèm theo Ultraviewer/AnyDesk để Admin vào setup trực tiếp cho bạn luôn nhé!' 
            },
            { 
                label: '💳 Lỗi Nạp tiền / Mua hàng', 
                reply: 'Mình gặp vấn đề khi nạp tiền hoặc thanh toán mua code.', 
                nextMenu: null, 
                botText: 'Hệ thống nạp tiền và giao dịch của Store hoạt động hoàn toàn tự động. Tuy nhiên, nếu bạn lỡ chuyển khoản sai nội dung hoặc web chưa cộng tiền/trả link tải thì đừng lo nhé.<br><br>Bạn gửi <b>Ảnh bill chuyển khoản</b> qua đây, Admin sẽ check hệ thống và duyệt thủ công cấp link tải code cho bạn ngay lập tức!' 
            },
            { 
                label: '⚠️ Báo lỗi Code / Link tải', 
                reply: 'Code mình tải về bị lỗi hoặc link Google Drive không truy cập được.', 
                nextMenu: null, 
                botText: 'Store luôn cam kết bảo hành trọn đời cho mọi mã nguồn được bán ra.<br><br>Bạn vui lòng gửi <b>Mã đơn hàng</b> và <b>Ảnh chụp màn hình phần code bị lỗi</b> để Admin kiểm tra, fix lỗi và gửi lại bản update mới nhất cho bạn nhé.' 
            },
            { 
                label: '🔙 Quay lại Menu Chính', 
                reply: 'Quay lại menu trước.', 
                nextMenu: 'main_menu', 
                botText: 'Đã quay lại Menu chính. Vui lòng chọn thông tin bạn cần hỗ trợ:' 
            }
        ],
      
        'intro_menu': [
            { 
                label: '🏢 Về HOANGKUN STORE', 
                reply: 'Giới thiệu chi tiết về cửa hàng và các dịch vụ.', 
                nextMenu: null, 
                botText: '<b>HOANGKUN STORE</b> (Website chính thức: <i>hoangkunstore.id.vn</i>) được quản lý và vận hành trực tiếp bởi Admin <b>Nguyễn Việt Hoàng</b>.<br><br>Đây là hệ thống độc quyền chuyên lập trình, cung cấp <b>Source Code Website</b> và <b>Script Game</b> chất lượng cao.<br><br>⚠️ <b>LƯU Ý QUAN TRỌNG:</b> Store chỉ giao dịch mã nguồn kỹ thuật số (Code/Script), tuyệt đối KHÔNG bán tài khoản game, nạp game hay bán các đồ linh tinh khác để tránh loãng dịch vụ nhé! 😎' 
            },
            { 
                label: '🛡️ Chính sách bảo hành', 
                reply: 'Chính sách bảo hành và hậu mãi của code như thế nào?', 
                nextMenu: null, 
                botText: 'Uy tín tạo nên thương hiệu! 💎<br><br>Mọi Source Code và Script mua tại HOANGKUN STORE đều được <b>bảo hành lỗi trọn đời</b>. Hệ thống cam kết hỗ trợ fix bug, cập nhật các bản vá bảo mật hoàn toàn miễn phí và hướng dẫn cài đặt tận tình từ A-Z ngay lúc bàn giao mã nguồn.' 
            },
            { 
                label: '🔙 Menu Chính', 
                reply: 'Quay lại.', 
                nextMenu: 'main_menu', 
                botText: 'Đã quay lại Menu chính. Vui lòng chọn thông tin bạn cần hỗ trợ:' 
            }
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
                    if (opt.nextMenu) setTimeout(() => window.showBotOptions(opt.nextMenu), 500);
                }, 1000);
            };
            optionsDiv.appendChild(btn);
        });
        chatBox.appendChild(optionsDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 4. GỬI TIN NHẮN TỪ KHUNG NHẬP
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

// 5. TÍNH NĂNG KẾT THÚC CHAT & ĐÁNH GIÁ (FEEDBACK)
window.endChat = function(isFromAdmin = false) {
    if(!currentRoomId) return;

    // Báo cáo nếu khách tự bấm
    if (!isFromAdmin) {
        db.ref('chats/' + currentRoomId).push({
            sender: 'system', senderName: window.guestName,
            text: 'Khách hàng [' + window.guestName + '] đã chủ động kết thúc phiên chat.',
            timestamp: Date.now()
        });
    }

    // Ẩn thanh nhập & giấu nút kết thúc
    const inputArea = document.getElementById('bottom-input-area');
    if (inputArea) inputArea.style.display = 'none';
    const endBtn = document.querySelector('.end-chat-btn');
    if (endBtn) endBtn.style.display = 'none';
    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());

    // HIỆN FORM ĐÁNH GIÁ 5 SAO
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-box';
    reviewDiv.innerHTML = `
        <div class="review-title">Phiên chat đã hoàn tất</div>
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
    const rating = ratingEle ? ratingEle.value : 5;

    db.ref('reviews/' + currentRoomId).set({
        guestName: window.guestName || 'Khách',
        rating: rating + ' Sao',
        comment: comment || 'Không có nhận xét',
        timestamp: Date.now()
    });

    localStorage.removeItem('guestName');
    localStorage.removeItem('currentRoomId');

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
