// ==========================================
// THÔNG TIN TELEGRAM BOT CỦA BẠN
// ==========================================
const TELEGRAM_BOT_TOKEN = '7952742715:AAHMTMjzMTe0BRIxefHuIDbjoDuNRxWVMW8';
const TELEGRAM_CHAT_ID = '8076487839';

// Hàm gửi thông báo ngầm qua Telegram
function sendTelegramAlert(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    }).catch(err => console.log("Lỗi Telegram:", err));
}
// ==========================================

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
const notifySound = new Audio('https://assets.mixkit.co/active_storage/sfx/236/236-preview.mp3');
let lastPingTime = Date.now(); 

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

    // 🚀 BÁO TELEGRAM CÓ KHÁCH VÀO
    sendTelegramAlert(`🟢 <b>KHÁCH HÀNG MỚI TRUY CẬP!</b>\n👤 Tên khách: <b>${currentName}</b>\n👉 Đang xem kịch bản tự động...`);

    db.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        
        if (data.sender === 'system' && data.action === 'ADMIN_END_CHAT') {
            if (typeof window.endChat === 'function') window.endChat(true); 
            return;
        }

        if (data.sender === 'admin' && data.timestamp > lastPingTime) {
            notifySound.play().catch(e => console.log("Chưa click"));
            lastPingTime = data.timestamp; 
        }

        if(data.sender === 'system') return; 
        
        const msgDiv = document.createElement('div');
        msgDiv.className = data.sender === 'admin' ? 'message msg-received' : 'message msg-sent';
        msgDiv.innerHTML = data.text; 
        
        if (chatBox) {
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const botWelcomeText = `Chào <b>${currentName}</b>! 👋 Cảm ơn bạn đã liên hệ HOANGKUN STORE.<br><br>Nguyễn Việt Hoàng sẽ trả lời bạn sớm nhất có thể ạ!<br><br>Trong lúc chờ đợi, bạn cần hỗ trợ về Source Code nào ạ? 😊`;
            
            db.ref('chats/' + currentRoomId).push({
                sender: 'admin', senderName: 'Nguyễn Việt Hoàng',
                text: botWelcomeText, timestamp: Date.now()
            });
            setTimeout(() => window.showBotOptions('main_menu'), 400);
        }, 1200); 
    }, 300);
}

// 3. MENU KỊCH BẢN SIÊU DÀI
window.showBotOptions = function(menuType) {
    if (!chatBox) return;

    document.querySelectorAll('.quick-replies-container').forEach(el => el.remove());
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quick-replies-container';

const menus = {
        'main_menu': [
            { 
                label: '🛒 Mua Source Code / Hack Game', 
                reply: 'Mình muốn xem qua các danh mục Source Code và bản Hack Game hiện có.', 
                nextMenu: 'source_menu', 
                botText: '🔥 <b>CHÀO MỪNG BẠN ĐẾN VỚI TỔNG ĐÀI HỖ TRỢ AI TỰ ĐỘNG CỦA HOANGKUN STORE!</b> 🔥<br><br>' + 
                         'Chúng tôi tự hào là đơn vị tiên phong, uy tín và chuyên nghiệp bậc nhất trong lĩnh vực nghiên cứu, lập trình, phân tích và cung cấp các giải pháp mã nguồn (Source Code) Website đa lĩnh vực. Đồng thời, HOANGKUN STORE cũng là hệ sinh thái cung cấp kho Script/Hack Game độc quyền, chuẩn xác, an toàn & bảo mật tuyệt đối cho cộng đồng Game thủ Việt Nam và quốc tế.<br><br>' +
                         '⚠️ <b>LƯU Ý QUAN TRỌNG TỪ BAN QUẢN TRỊ:</b><br>' +
                         '- Để duy trì định hướng phát triển công nghệ cốt lõi và giữ vững vị thế thương hiệu, Store CHỈ giao dịch các sản phẩm phần mềm kỹ thuật số (Source Code Web, Script Game, Tools Hack, Auto API).<br>' +
                         '- Tuyệt đối KHÔNG kinh doanh tài khoản game, KHÔNG bán vật phẩm ingame, KHÔNG nhận cày thuê leo rank, và KHÔNG bán các loại hàng hóa vật lý linh tinh khác.<br><br>' +
                         '🌟 <b>TẠI SAO CHỌN HOANGKUN STORE?</b><br>' +
                         '1️⃣ <b>Chất lượng Đỉnh cao:</b> Code sạch, tối ưu hóa toàn diện, load cực nhanh.<br>' +
                         '2️⃣ <b>Bảo mật Tuyệt đối:</b> File sạch 100%, không backdoor, không mã độc, bypass mọi Anti-Cheat.<br>' +
                         '3️⃣ <b>Tự động hóa 4.0:</b> Tích hợp API ngân hàng, Momo, thẻ cào chạy tự động 24/7.<br>' +
                         '4️⃣ <b>Hỗ trợ Tận tâm:</b> Support cài đặt miễn phí qua Ultraviewer/AnyDesk tận răng.<br><br>' +
                         '👉 Bạn đang có nhu cầu tìm mua <b>Code Web</b> để xây dựng đế chế kinh doanh tự động, hay muốn sở hữu các bản <b>Hack Game VIP</b> cực mượt để thống trị bảng xếp hạng? Vui lòng nhấp vào tùy chọn bên dưới để tiếp tục!' 
            },
            { 
                label: '⚙️ Hỗ trợ Cài đặt & API', 
                reply: 'Mình cần hỗ trợ kỹ thuật về setup mã nguồn và tích hợp API tự động.', 
                nextMenu: 'setup_menu', 
                botText: '💻 <b>TRUNG TÂM HỖ TRỢ KỸ THUẬT VÀ GIẢI PHÁP CÔNG NGHỆ TOÀN DIỆN</b> 💻<br><br>' +
                         'HOANGKUN STORE không chỉ là nơi cung cấp mã nguồn, chúng tôi còn mang đến cho bạn các giải pháp công nghệ trọn gói từ A-Z, giúp bạn tối ưu hóa hệ thống kinh doanh mà không cần phải biết quá nhiều về kỹ thuật lập trình.<br><br>' +
                         '🛠️ <b>CÁC DỊCH VỤ KỸ THUẬT CHUYÊN SÂU CHÚNG TÔI ĐANG CUNG CẤP:</b><br>' +
                         '✔️ <b>Triển khai & Vận hành (Deploy):</b> Hỗ trợ trỏ Tên miền (Domain), setup SSL bảo mật, cấu hình đưa Website lên các nền tảng Hosting (cPanel, DirectAdmin), VPS (Linux/Windows), hoặc các nền tảng Cloud hiện đại như Firebase, Vercel, Heroku, GitHub Pages đảm bảo Uptime 99.9%.<br>' +
                         '✔️ <b>Bảo trì & Tối ưu hóa:</b> Xử lý mọi lỗi hệ thống (Fix bug), nâng cấp phiên bản (Update version), tối ưu hóa tốc độ tải trang (PageSpeed Insights đạt điểm xanh), dọn dẹp Database.<br>' +
                         '✔️ <b>Tích hợp API Thanh Toán Tự Động:</b> Nhận setup luồng thanh toán Auto Banking (SePay, MBBank, Vietcombank, ACB...), Auto Ví Điện Tử (Momo, Viettel Money), Tích hợp hệ thống Nạp thẻ cào gạch thẻ tự động không mất chiết khấu trung gian cao.<br><br>' +
                         '👉 Bạn đang cần Admin trực tiếp hỗ trợ vấn đề cài đặt hệ thống, fix lỗi source code hay kiểm tra giao dịch nạp tiền báo lỗi ạ?' 
            },
            { 
                label: 'ℹ️ Giới thiệu & Chính sách', 
                reply: 'Cho mình xem thông tin chi tiết về Store và các chính sách bảo hành hậu mãi.', 
                nextMenu: 'intro_menu', 
                botText: '💎 <b>CẢM ƠN BẠN ĐÃ TIN TƯỞNG VÀ LỰA CHỌN HOANGKUN STORE!</b> 💎<br><br>' +
                         'Đối với chúng tôi, Uy tín không chỉ là lời nói, mà là nền tảng sống còn tạo nên giá trị thương hiệu. Mọi sản phẩm khi được xuất bản và bàn giao tới tay khách hàng đều phải trải qua quy trình kiểm thử (Testing) vô cùng nghiêm ngặt.<br><br>' +
                         '📜 <b>TẦM NHÌN & SỨ MỆNH:</b><br>' +
                         'Chúng tôi hướng tới việc xây dựng một hệ sinh thái mã nguồn mở và các công cụ tiện ích số 1 thị trường, giúp người dùng tiết kiệm tối đa thời gian và chi phí vận hành.<br><br>' +
                         '🤝 <b>CAM KẾT CHẤT LƯỢNG BẰNG VĂN BẢN:</b><br>' +
                         '- Cam kết code sạch, chuẩn SEO, chuẩn UI/UX.<br>' +
                         '- Cam kết bảo mật thông tin khách hàng tuyệt đối.<br>' +
                         '- Cam kết hỗ trợ hậu mãi dài hạn, không đem con bỏ chợ.<br><br>' +
                         '👉 Bạn muốn khám phá chi tiết hơn về lịch sử hình thành hoạt động của cửa hàng, hay xem các quy định cụ thể về <b>Chính sách bảo hành mã nguồn trọn đời</b> của chúng tôi ạ?' 
            },
            { 
                label: '👤 Gặp Admin Hoàng', 
                reply: 'Bot tư vấn chưa đúng ý mình, cho mình gặp trực tiếp Admin Hoàng để trao đổi nhé.', 
                nextMenu: null, 
                botText: '🚨 <b>HỆ THỐNG ĐÃ KÍCH HOẠT QUY TRÌNH HỖ TRỢ KHẨN CẤP!</b> 🚨<br><br>' +
                         'Bot đã ghi nhận yêu cầu của bạn và ngay lập tức phát tín hiệu chuông báo "Ting Ting" ưu tiên cao nhất tới thiết bị cá nhân (Điện thoại & PC) của Admin Quản trị viên cấp cao: <b>Nguyễn Việt Hoàng</b>.<br><br>' +
                         '⏳ <b>TRẠNG THÁI HIỆN TẠI:</b> Admin đang online, đang đọc log tin nhắn của bạn và sẽ trực tiếp bước vào phòng chat để hỗ trợ ngay trong ít phút nữa!<br><br>' +
                         '💡 <b>MẸO NHỎ GIÚP ADMIN XỬ LÝ NHANH HƠN:</b><br>' +
                         'Trong thời gian vài phút chờ đợi, để tiết kiệm tối đa thời gian của đôi bên, bạn vui lòng cung cấp sẵn các thông tin sau vào khung chat bên dưới nhé:<br>' +
                         '1. Nếu mua Code/Hack: Gõ tên sản phẩm bạn muốn mua.<br>' +
                         '2. Nếu lỗi Nạp tiền: Vui lòng dán ảnh Bill chuyển khoản thành công + Tên tài khoản web của bạn.<br>' +
                         '3. Nếu lỗi Cài đặt: Vui lòng gửi ID & Pass Ultraviewer + Ảnh chụp màn hình dòng code/thông báo báo lỗi màu đỏ.<br><br>' +
                         'Admin vào đọc được sẽ bắt tay vào xử lý giải quyết cho bạn luôn và ngay!' 
            }
        ],
        
        'source_menu': [
            { 
                label: '🌐 Code Web Shop / Bán Hàng', 
                reply: 'Mình muốn tham khảo các mẫu Code Web Shop bán hàng tự động toàn diện.', 
                nextMenu: null, 
                botText: '🛒 <b>HỆ THỐNG CODE WEB SHOP KINH DOANH TỰ ĐỘNG CHUYÊN NGHIỆP</b> 🛒<br><br>' +
                         'Bạn muốn làm chủ một hệ thống kinh doanh tạo ra thu nhập thụ động ngay cả khi đang ngủ? Các nền tảng Web Shop bên mình chính là giải pháp hoàn hảo nhất! Hệ thống được lập trình cực mượt, cấu trúc code hiện đại, tối ưu chuẩn SEO Google lên top dễ dàng, và hiển thị chuẩn Responsive hiển thị mượt mà trên mọi tỷ lệ màn hình thiết bị (PC, Mobile, Tablet).<br><br>' +
                         '🔥 <b>BỘ TÍNH NĂNG ĐỘC QUYỀN ĐỈNH CAO CHỈ CÓ TẠI STORE:</b><br>' +
                         '✔️ <b>Auto Banking 24/7:</b> Tích hợp sẵn hàm API nhận diện biến động số dư cực thông minh. Khách của bạn chỉ cần quét mã QR hoặc chuyển khoản đúng nội dung, hệ thống sẽ tự động đối soát, cộng tiền vào tài khoản user và xuất đơn hàng siêu tốc chỉ trong 3 đến 5 giây. Không cần bạn duyệt tay mỏi mệt!<br>' +
                         '✔️ <b>Quản trị Admin Panel Pro:</b> Giao diện quản lý siêu chi tiết. Dễ dàng thêm, sửa, xóa sản phẩm, theo dõi thống kê doanh thu theo ngày/tháng/năm, quản lý dòng tiền, log lịch sử người dùng chặt chẽ.<br>' +
                         '✔️ <b>Bảo mật Anti-DDoS:</b> Mã nguồn được mã hóa thông minh, chống SQL Injection, XSS, bảo vệ an toàn cơ sở dữ liệu khách hàng tuyệt đối.<br><br>' +
                         '👉 Bạn muốn mở Shop bán Tạp hóa, Shop Acc Game, Shop Dịch vụ MXH (Tăng Like/Sub) hay Shop bán Code? Vui lòng để lại yêu cầu cụ thể kèm theo Zalo/SĐT để Admin chắt lọc và gửi trực tiếp Link Website Demo thực tế cho bạn test thử mọi tính năng từ A-Z nhé!' 
            },
            { 
                label: '🎨 Landing Page / Portfolio', 
                reply: 'Mình cần tìm giao diện Landing Page cá nhân thật độc lạ, nhiều hiệu ứng.', 
                nextMenu: null, 
                botText: '✨ <b>BỘ SƯU TẬP GIAO DIỆN LANDING PAGE SIÊU CẤP ĐỘC QUYỀN</b> ✨<br><br>' +
                         'Ấn tượng đầu tiên là cực kỳ quan trọng! Hãy để khách hàng/đối tác của bạn phải trầm trồ khi truy cập vào Profile của bạn. Bên mình hiện đang sở hữu kho tàng các giao diện Landing Page, Portfolio, trang Link Bio cá nhân được thiết kế kết hợp hiệu ứng GSAP, ScrollTrigger, Three.js siêu mượt, đáp ứng mọi gu thẩm mỹ khó tính nhất.<br><br>' +
                         '🎨 <b>CÁC XU HƯỚNG THIẾT KẾ ĐANG LÀM MƯA LÀM GIÓ:</b><br>' +
                         '🌌 <b>Dark Mode Minimalist:</b> Huyền bí, sang trọng, tinh tế. Tập trung vào trải nghiệm UI/UX tối giản nhưng toát lên vẻ chuyên nghiệp của một dân IT thực thụ.<br>' +
                         '⚡ <b>Cyberpunk Neon Tech:</b> Rực rỡ ánh đèn neon chớp nháy, tích hợp hiệu ứng Glitch (nhiễu sóng sọc màn hình), hiệu ứng gõ chữ Terminal Hacker cực ngầu mang đậm tính tương lai (Sci-Fi).<br>' +
                         '👾 <b>Pixel Art 8-Bit Retro:</b> Phong cách hoài cổ tái hiện lại các cỗ máy chơi game thập niên 90. Sử dụng font chữ và hình ảnh dạng ô vuông pixel độc quyền, cực kỳ sáng tạo và không lo đụng hàng.<br><br>' +
                         '👉 Các mẫu giao diện này là vũ khí tuyệt hảo để làm trang giới thiệu bản thân, bán khóa học Online, quảng bá sự kiện hoặc show Profile CV xin việc xịn sò. Bạn cảm thấy "bánh cuốn" với phong cách nào nhất để Admin lựa chọn file Demo và gửi cho bạn xem tận mắt?' 
            },
            { 
                label: '🎮 Kho Hack Game / Script', 
                reply: 'Cho mình xem danh sách các bản Hack Game và Script VIP hiện có tại hệ thống.', 
                nextMenu: 'game_menu', 
                botText: '🔥 <b>KHO VŨ KHÍ HACK GAME VÀ SCRIPT AUTO VIP NHẤT THỊ TRƯỜNG</b> 🔥<br><br>' +
                         'Chào mừng bạn bước vào vùng đất của những kẻ thống trị trò chơi! Kho lưu trữ siêu cấp của Store tự hào cung cấp đầy đủ các bản Hack siêu mượt, các Module Tool và Script Auto tối ưu cực tốt cho các dòng game eSports, Survival và RPG đang làm mưa làm gió trên thị trường hiện nay (Free Fire, Liên Quân Mobile, vũ trụ Roblox, ARK, PUBG...).<br><br>' +
                         '🛡️ <b>3 CAM KẾT VÀNG TỪ TEAM DEV HOANGKUN STORE:</b><br>' +
                         '1. <b>Sạch 100%:</b> Mọi file cài đặt (APK, OBB, IPA, EXE, LUA) đều được quét qua 5 trình diệt Virus hàng đầu, cam kết tuyệt đối không chứa mã độc (Trojan/Keylogger) gây hại cho thiết bị của bạn.<br>' +
                         '2. <b>Siêu Mượt:</b> Mã nguồn Script được tối ưu hóa rác thừa, giải phóng RAM, đảm bảo FPS luôn ổn định kể cả trên máy cấu hình yếu.<br>' +
                         '3. <b>Siêu Chống Cấm (Anti-Ban):</b> Đặc biệt tự hào với hệ thống Anti-ban / Bypass VIP vượt rào, vượt qua mọi hệ thống máy quét (Vanguard, TenProtect...) của Nhà phát hành. An toàn tuyệt đối cho tài khoản hàng chục triệu của bạn.<br><br>' +
                         '👉 Đã đến lúc leo ranh Thách Đấu mà không cần vã mồ hôi hột! Bạn vui lòng chọn thể loại game muốn xem thông tin chi tiết các chức năng Hack ở menu lựa chọn bên dưới nhé:' 
            },
            { 
                label: '🔙 Quay lại Menu Chính', 
                reply: 'Quay lại menu lựa chọn ban đầu.', 
                nextMenu: 'main_menu', 
                botText: 'Hệ thống đã nhận lệnh và đưa bạn an toàn quay trở lại Menu màn hình chính. Vui lòng chọn danh mục thông tin tổng quát mà bạn cần hệ thống AI của chúng tôi hỗ trợ tiếp tục:' 
            }
        ],

        'game_menu': [
            { 
                label: '🔥 Hack Free Fire / Liên Quân', 
                reply: 'Mình cần tư vấn chi tiết về Full chức năng của các bản Hack cho game Free Fire hoặc Liên Quân Mobile.', 
                nextMenu: null, 
                botText: '🔫 <b>ĐẾ CHẾ HACK FPS & MOBA - FREE FIRE / LIÊN QUÂN MOBILE</b> ⚔️<br><br>' +
                         'Chào đồng dâm! Các bản Hack <b>Free Fire (Lửa Chùa)</b> và <b>Liên Quân Mobile (AOV)</b> bên mình là phiên bản VIP Premium. Đội ngũ kỹ thuật (Coder) của Store luôn thức thâu đêm để cập nhật liên tục các mã bypass ngay trong vòng 24h khi nhà phát hành (Garena) vừa tung ra phiên bản cập nhật mới. Đảm bảo bạn luôn có "đồ chơi" sớm nhất sever để hành hạ đối thủ! 🔥<br><br>' +
                         '🏆 <b>BẢNG TÍNH NĂNG HACK HỦY DIỆT SERVER:</b><br><br>' +
                         '🎯 <b>Đối với Free Fire (FF):</b><br>' +
                         '- <b>Auto Headshot 100% Pro Max:</b> Ghim tâm siêu dính vào đầu địch dù địch đang chạy bo hay nhảy lầu, bắn không trượt phát nào kể cả mù mắt.<br>' +
                         '- <b>Wallhack & ESP Draw:</b> Nhìn xuyên mọi bức tường, thấu thị mọi vật cản. Hiển thị box, đường kẻ, máu, khoảng cách và tên kẻ địch cực nét.<br>' +
                         '- <b>Antenna & Teleport:</b> Định vị vị trí ăng-ten siêu xa từ đầu địch chọc lên trời. Hack bay, dịch chuyển tức thời, tự động loot sạch đồ xịn trong 1 giây.<br><br>' +
                         '🗺️ <b>Đối với Liên Quân Mobile (AOV):</b><br>' +
                         '- <b>Hack Map Vô Cực:</b> Xóa bỏ sương mù, sáng choang toàn bộ bản đồ. Rừng team địch đang ăn bùa nào, núp bụi nào nhìn thấy rõ như ban ngày.<br>' +
                         '- <b>Drone View (Cam Siêu Rộng):</b> Kéo cao góc nhìn camera bao quát toàn bộ giao tranh, né skill dễ như ăn kẹo.<br>' +
                         '- <b>ESP Cooldown:</b> Tính năng xịn sò hiển thị chi tiết thời gian hồi chiêu cuối (Ulti) và thời gian phép bổ trợ (Tốc biến) của địch. Bắt lẻ không trượt phát nào.<br><br>' +
                         '⚙️ <b>CÀI ĐẶT & BẢO MẬT:</b> File cài đặt dạng (APK/OBB cho Android, IPA cho iOS Jailbreak) cực kỳ dễ thao tác chỉ với vài cú chạm. Tích hợp sẵn module <b>Bypass xịn</b> vượt mọi rào cản tố cáo.<br><br>' +
                         '👉 Bạn đang cần bản cài trực tiếp cho máy Android (Root hay Non-Root) hay muốn chạy file trên phần mềm giả lập PC (LDPlayer, BlueStacks, Nox)?' 
            },
            { 
                label: '🤖 Hack Roblox / Blox Fruits', 
                reply: 'Mình đang tìm mua bản Script Hack Roblox VIP, đặc biệt chuyên sâu cho chế độ Blox Fruits.', 
                nextMenu: null, 
                botText: '🏴‍☠️ <b>TRÙM CUỐI ROBLOX SCRIPT - ĐỈNH CAO BLOX FRUITS</b> 🏴‍☠️<br><br>' +
                         'Bạn đã tìm đúng trùm cuối của làng Roblox rồi đó! 😎 Không cần phải cày cuốc mỏi tay đến hỏng cả chuột nữa. <b>HOANGKUN STORE</b> sở hữu nguyên một kho tàng Script Hack Roblox cực mượt, đặc biệt tối ưu hoá với các dòng lệnh mã LUA siêu nhẹ, dành riêng cho tựa game quốc dân <b>Blox Fruits</b> với các cụm chức năng VIP tự động hóa 100%:<br><br>' +
                         '🌪️ <b>1. HỆ THỐNG AUTO FARM TÀN KHỐC:</b><br>' +
                         '- <b>Auto Farm Level Siêu Tốc:</b> Từ level 1 lên Max Cấp chỉ mất 1 đêm cắm máy ngủ ngon. Bay vèo vèo không chạm đất.<br>' +
                         '- <b>Auto Farm Nguyên Liệu:</b> Tự động đánh quái cày Bone, Ectoplasm, cày Mastery Trái Ác Quỷ, Mastery Vũ khí cận chiến/Súng mượt mà không bao giờ lo kẹt góc lag địa hình.<br><br>' +
                         '🍎 <b>2. HỆ THỐNG AUTO TÍNH NĂNG ĐỈNH CAO:</b><br>' +
                         '- <b>Auto Raid (Awakening):</b> Tự động đi phụ bản thức tỉnh trái ác quỷ nhanh như chớp.<br>' +
                         '- <b>Devil Fruit Sniper (Săn Trái Ác Quỷ):</b> Radar tự động dò tìm trái ác quỷ vừa rớt trên bản đồ, bay đến nhặt trong 0.1 giây trước mặt bọn khác.<br>' +
                         '- <b>Auto Boss Huyền Thoại:</b> Tự động săn Katakuri, săn Rip Indra, săn Dough King để nhặt các vật phẩm xịn nhất game.<br><br>' +
                         '⚔️ <b>3. HỆ THỐNG PVP & BOUNTY:</b><br>' +
                         '- Aimbot tự động ngắm kỹ năng, Auto combo kết liễu đối thủ farm Bounty cực gắt.<br><br>' +
                         '🚀 <b>ĐỘ TƯƠNG THÍCH HOÀN HẢO:</b> Bản Hack siêu nhẹ, không crash game, tích hợp Bypass cực xịn. Hỗ trợ chạy mượt mà không lỗi trên mọi trình thực thi (Executor) phổ biến nhất thế giới như: Fluxus, Delta, Codex, Hydrogen, Krnl, Synapse X... Hỗ trợ đa nền tảng Mobile Android lẫn PC.<br><br>' +
                         '👉 Bạn đang nhắm tới bản VIP Full 100% chức năng để hủy diệt server, hay cần bản Script tối ưu dung lượng siêu nhẹ để treo nhiều tab clone cày cuốc 24/7 ạ?' 
            },
            { 
                label: '👾 Hack Game Mobile Khác', 
                reply: 'Mình muốn tìm bản hack, mod menu hoặc auto cho các tựa game Mobile thể loại khác.', 
                nextMenu: null, 
                botText: '🎮 <b>DỊCH VỤ CUNG CẤP HACK/MOD GAME THEO YÊU CẦU</b> 🎮<br><br>' +
                         'Ngoài các tựa game eSports quốc dân như Free Fire, Liên Quân và Roblox, Admin HOANGKUN STORE còn sở hữu một mạng lưới Database rộng lớn. Nhận tìm kiếm, cung cấp và đặc biệt là Custom (chỉnh sửa) các bản Hack, Auto, Mod Menu cho hàng ngàn tựa game Mobile khác đang lưu hành trên thị trường Google Play / App Store.<br><br>' +
                         '🌟 <b>CHÚNG TÔI ĐẶC BIỆT CÓ THẾ MẠNH CHUYÊN SÂU VỀ:</b><br>' +
                         '🦕 <b>Dòng Game Sinh Tồn Khắc Nghiệt:</b> ARK: Survival Evolved Mobile, PUBG Mobile, Call of Duty Mobile. Cung cấp ESP, Aimbot, God Mode, Vô hạn đạn.<br>' +
                         '🌍 <b>Dòng Game Thế Giới Mở / Gacha:</b> Genshin Impact, Honkai Star Rail. Cung cấp Teleport các điểm dịch chuyển, Auto đánh quái, No Cooldown skill.<br>' +
                         '⚔️ <b>Dòng Game MMORPG Cày Cuốc Tiên Hiệp/Kiếm Hiệp:</b> Cung cấp Tool Auto Click, Auto tự động treo máy đánh quái, Tự động mua máu/mana, Tự động dọn rương, nhặt đồ tự động 24/7 không cần thức đêm canh máy.<br><br>' +
                         '👉 Đừng ngần ngại! Bạn đang cần tìm bản Hack cho tựa game nào? Những tính năng bá đạo nào bạn đang khát khao sở hữu? Cứ gõ trực tiếp tên game và yêu cầu chi tiết lên đây để Admin vào check kho dữ liệu Server ngầm và báo giá ngay lập tức cho bạn nhé!' 
            },
            { 
                label: '🔙 Quay lại Menu', 
                reply: 'Quay lại danh mục trước để chọn xem các sản phẩm Code Web.', 
                nextMenu: 'source_menu', 
                botText: 'Hệ thống đã nhận lệnh và đưa bạn an toàn quay lại danh mục sản phẩm trước đó. Hiện tại hệ sinh thái của HOANGKUN STORE đang sẵn có các mặt hàng chủ lực: Code Web Shop tự động hóa, Landing Page cá nhân ấn tượng và Kho Hack Game đỉnh cao giới hacker.<br><br>Vui lòng lựa chọn loại sản phẩm mà bạn đang quan tâm nhất để hệ thống tiếp tục hiển thị thông tin chi tiết:' 
            }
        ],

       'setup_menu': [
            { 
                label: '🛠️ Cài đặt Code đã mua', 
                reply: 'Mình cần Admin hỗ trợ trực tiếp việc cài đặt, config Database và setup Source Code vừa mua trên Store lên mạng.', 
                nextMenu: null, 
                botText: '💻 <b>DỊCH VỤ HỖ TRỢ CÀI ĐẶT MÃ NGUỒN TẬN RĂNG MIỄN PHÍ 100%</b> 💻<br><br>' +
                         'Lời đầu tiên, xin chân thành cảm ơn bạn đã tin tưởng xuống tiền và ủng hộ các sản phẩm kỹ thuật số của HOANGKUN STORE! Sự thành công của dự án của bạn chính là niềm tự hào của chúng tôi. 💎<br><br>' +
                         'Để đảm bảo bạn có trải nghiệm sử dụng dịch vụ tuyệt vời nhất, loại bỏ hoàn toàn các rào cản về kỹ thuật lập trình và không tốn hàng giờ mài mò đọc Document, mọi mã nguồn khi bạn mua tại hệ thống đều được Admin HOANGKUN áp dụng đặc quyền VIP: <b>Hỗ trợ Setup cài đặt, cấu hình, và đưa Website chính thức lên mạng Internet hoàn toàn MIỄN PHÍ (Free Setup 100%).</b><br><br>' +
                         '📝 <b>QUY TRÌNH HỖ TRỢ VÔ CÙNG ĐƠN GIẢN CHỈ VỚI 3 BƯỚC:</b><br>' +
                         '<b>Bước 1:</b> Bạn vui lòng chuẩn bị sẵn các tài nguyên hạ tầng cơ bản: Domain (Tên miền) và Hosting/VPS/Cloud đã mua sẵn.<br>' +
                         '<b>Bước 2:</b> Trên máy tính cá nhân của bạn, hãy tải về và cài đặt phần mềm điều khiển màn hình từ xa <b>Ultraviewer</b> hoặc phần mềm <b>AnyDesk</b>.<br>' +
                         '<b>Bước 3:</b> Gửi <b>Mã Đơn Hàng</b> (Hoặc chụp ảnh lịch sử mua code) để Admin đối soát, kèm theo dãy số ID & Mật Khẩu (Pass) của phần mềm Ultraviewer/AnyDesk trực tiếp vào khung chat này.<br><br>' +
                         '⚡ <b>THAO TÁC THẦN TỐC:</b> Chỉ cần bạn hoàn thành 3 bước trên, Admin sẽ trực tiếp Remote (Truy cập từ xa) vào màn hình máy tính của bạn. Mọi thao tác từ upload Source lên host, tạo Database MySQL, import cấu trúc SQL, cấu hình file config.php... sẽ được Admin xử lý múa phím nhanh như chớp. Chỉ trong vòng 10 đến 15 phút, Website của bạn sẽ hoạt động trơn tru trên Internet để bạn có thể bắt đầu kinh doanh ngay lập tức!' 
            },
            { 
                label: '💳 Lỗi Nạp tiền / Mua hàng', 
                reply: 'Mình đang gặp sự cố khi nạp tiền vào tài khoản, hoặc đã thanh toán thành công nhưng chưa nhận được link tải source code.', 
                nextMenu: null, 
                botText: '💸 <b>BỘ PHẬN XỬ LÝ SỰ CỐ GIAO DỊCH VÀ ĐỐI SOÁT TÀI CHÍNH</b> 💸<br><br>' +
                         'Xin chào! Hệ thống xử lý giao dịch nạp tiền và API trả link tải tự động của Store được lập trình áp dụng các công nghệ API ngân hàng hiện đại nhất, đảm bảo tính liên tục và hoạt động trơn tru 24/7 kể cả vào ban đêm hay những ngày Lễ, Tết. Khách chuyển tiền phát, web nảy số dư liền!<br><br>' +
                         '⚠️ <b>NGUYÊN NHÂN SỰ CỐ:</b> Tuy nhiên, máy móc đôi khi không thể tránh khỏi các sự cố khách quan. Nếu bạn rơi vào các trường hợp: Lỡ tay chuyển khoản ghi sai cú pháp nội dung, chuyển khoản sai số tiền yêu cầu, quên không ghi ID tài khoản web, hoặc lúc đó API Ngân hàng quốc gia đang trong thời gian bảo trì định kỳ dẫn đến việc hệ thống web chưa kịp bắt log biến động số dư và chưa mở khóa cấp quyền link tải code cho bạn... thì bạn hãy hít một hơi thật sâu và <b>CỨ BÌNH TĨNH NHÉ!</b><br><br>' +
                         '🔒 <b>CHÚNG TÔI CAM KẾT: Danh dự của Admin được mang ra đảm bảo, tiền của bạn gửi vào hệ thống không bao giờ bị bốc hơi hoặc mất đi đâu cả dù chỉ 1 VNĐ!</b><br><br>' +
                         '🛠️ <b>CÁCH THỨC XỬ LÝ KHẨN CẤP NHANH CHÓNG NHẤT:</b><br>' +
                         '1. Bạn hãy mở ứng dụng ngân hàng (Internet Banking) của bạn lên.<br>' +
                         '2. Tải về hoặc chụp lại màn hình toàn bộ <b>Bill (Hóa đơn) chuyển khoản</b>. Lưu ý: Hình ảnh phải hiển thị RÕ RÀNG các thông tin: Số tài khoản người nhận, Tên người nhận (NGUYEN VIET HOANG), Số tiền, Nội dung chuyển khoản và đặc biệt là TRẠNG THÁI GIAO DỊCH THÀNH CÔNG.<br>' +
                         '3. Gửi bức ảnh Bill đó kèm theo <b>Tên Tài Khoản Đăng Nhập</b> trên web của bạn trực tiếp vào khung chat này.<br><br>' +
                         '⏳ <b>KẾT QUẢ:</b> Ngay khi Admin online và nhận được tin nhắn, Admin sẽ tiến hành đối soát log lịch sử giao dịch ngân hàng thực tế. Khi đã khớp lệnh, Admin sẽ tiến hành Duyệt Tay Thủ Công, lập tức bơm số dư vào tài khoản hoặc gửi trực tiếp Link Google Drive chứa mã nguồn gốc thẳng qua tin nhắn này cho bạn ngay tắp lự!' 
            },
            { 
                label: '⚠️ Báo lỗi Code / Link hỏng', 
                reply: 'Source Code mình tải về cài đặt trên Localhost/Hosting đang báo bị lỗi, hoặc link Google Drive/Fshare báo không có quyền truy cập / bị xóa.', 
                nextMenu: null, 
                botText: '🛠️ <b>BỘ PHẬN TIẾP NHẬN BÁO LỖI VÀ BẢO HÀNH CHẤT LƯỢNG MÃ NGUỒN</b> 🛠️<br><br>' +
                         'Chào bạn! HOANGKUN STORE sinh ra và phát triển vững mạnh đến ngày hôm nay là nhờ luôn đặt chữ TÍN lên hàng đầu. Chúng tôi vô cùng tự hào khi mang đến đặc quyền cam kết: <b>BẢO HÀNH LỖI KỸ THUẬT TRỌN ĐỜI CÙNG SẢN PHẨM</b> cho 100% các dòng mã nguồn (Source Code) và Script được niêm yết bán ra trên hệ thống trang chủ chính thức.<br><br>' +
                         '🚨 <b>NẾU BẠN ĐANG GẶP PHẢI CÁC VẤN ĐỀ NHỨC NHỐI SAU ĐÂY:</b><br>' +
                         '- <b>Sự cố về Link Tải:</b> Link tải Google Drive bị khóa quyền truy cập, báo lỗi 404 Not Found, hoặc file tải về bị trình duyệt báo có tệp tin đáng ngờ chặn lượt tải.<br>' +
                         '- <b>Sự cố về Lập trình (Bug):</b> Cài đặt lên Hosting bị trắng trang (White Screen of Death), lỗi kết nối Database (Error establishing a database connection), các function (chức năng) trong web không hoạt động, lỗi giao diện CSS vỡ khung trên điện thoại...<br><br>' +
                         '📌 <b>VUI LÒNG THỰC HIỆN ĐÚNG QUY TRÌNH BÁO LỖI CHUẨN ĐỂ ĐƯỢC ƯU TIÊN XỬ LÝ NHANH NHẤT:</b><br>' +
                         '<b>Bước 1:</b> Sao chép chính xác <b>Mã Đơn Hàng</b> của bạn trong phần Lịch sử giao dịch.<br>' +
                         '<b>Bước 2:</b> Chụp ảnh toàn màn hình hoặc Quay lại Video thật rõ nét hiển thị chi tiết phần cấu trúc mã nguồn đang bị lỗi đỏ, hoặc thao tác dẫn đến cái lỗi đó xuất hiện trên website của bạn.<br>' +
                         '<b>Bước 3:</b> Gửi toàn bộ tư liệu ở Bước 1 và 2 vào khung chat này để tạo Ticket Ticket bảo hành.<br><br>' +
                         '👨‍💻 Đội ngũ kỹ thuật (Developer Team) của HOANGKUN STORE sẽ lập tức tiếp nhận thông tin, tiến hành test lại trên môi trường giả lập (Local) để Debug (Bắt bệnh). Sau khi xác định nguyên nhân, chúng tôi sẽ fix lỗi thần tốc, tối ưu lại luồng code logic và đóng gói cẩn thận để gửi lại File Zip bản Update vá lỗi hoàn thiện nhất mới nhất cho bạn. Hoàn toàn KHÔNG thu thêm bất kỳ một khoản phí nào! Sự hài lòng tối đa của bạn chính là thước đo thành công của chúng tôi!' 
            },
            { 
                label: '🔙 Quay lại Menu Chính', 
                reply: 'Quay lại menu lựa chọn các mục ban đầu.', 
                nextMenu: 'main_menu', 
                botText: 'Hệ thống AI đã thực thi lệnh và đưa bạn an toàn quay lại bảng Menu điều khiển chính. Vui lòng lựa chọn các danh mục thông tin bên dưới mà bạn cần hệ thống của chúng tôi tiếp tục tư vấn và hỗ trợ chuyên sâu:' 
            }
        ],
      
        'intro_menu': [
            { 
                label: '🏢 Về HOANGKUN STORE', 
                reply: 'Mình muốn tìm hiểu phần giới thiệu chi tiết về lịch sử hình thành cửa hàng, ban quản trị và các dịch vụ cốt lõi đang cung cấp.', 
                nextMenu: null, 
                botText: '🏛️ <b>TỔNG QUAN VỀ HỆ THỐNG HOANGKUN STORE</b> 🏛️<br><br>' +
                         'Chào mừng bạn đến với trung tâm đầu não của sự sáng tạo công nghệ số! <b>HOANGKUN STORE</b> (Với địa chỉ Website tên miền chính thức, duy nhất và độc quyền trên Internet là: <i><b>hoangkunstore.id.vn</b></i>) được chính thức sáng lập, rót vốn đầu tư phát triển hệ thống quản lý, và trực tiếp vận hành bởi Lead Developer - Chuyên gia IT Admin <b>Nguyễn Việt Hoàng</b>.<br><br>' +
                         '🚀 <b>CHÚNG TÔI LÀ AI VÀ CHÚNG TÔI LÀM GÌ?</b><br>' +
                         'Chúng tôi không chỉ là một cửa hàng bán lẻ thông thường, mà là một Hệ sinh thái công nghệ độc lập và chuyên nghiệp. Với định hướng vạch ra con đường phát triển rõ ràng và chuyên sâu, HOANGKUN STORE định vị mình ở vị trí là nhà phân phối, nhà sản xuất các giải pháp phần mềm hàng đầu. Các trụ cột dịch vụ cốt lõi bao gồm:<br>' +
                         '🌐 <b>Source Code Website (Mã Nguồn Mở & Kín):</b> Kho tàng mã nguồn đa dạng thể loại (Shop Bán Hàng, Landing Page, Portfolio, Web Phim...) được thiết kế theo chuẩn UI/UX quốc tế, chất lượng cao, tối ưu siêu nhẹ và bảo mật chống Ddos toàn diện.<br>' +
                         '🔗 <b>Module & API Tự Động:</b> Các giải pháp vận hành hệ thống kiếm tiền thụ động, tích hợp cổng thanh toán ngân hàng (Auto Bank), ví điện tử, cấu hình Auto Bot xử lý data lớn.<br>' +
                         '🎮 <b>Hack/Script Game VIP:</b> Sân chơi ngầm đẳng cấp của các pháp sư. Cung cấp hàng ngàn mã Script chạy mượt mà trên Mobile/PC, các Tool Hack Bypass xuyên phá tường lửa cực kỳ uy tín và đồ sộ trên thị trường chợ đen hiện nay.<br><br>' +
                         '⚠️ <b>TUYÊN BỐ LƯU Ý ĐẶC BIỆT QUAN TRỌNG ĐẾN TOÀN THỂ KHÁCH HÀNG:</b><br>' +
                         'Nhằm mục đích duy trì tính chuyên nghiệp, đảm bảo dồn toàn lực nâng cao chất lượng chuyên môn cao nhất cho từng dòng code và giữ gìn hình ảnh hệ sinh thái phần mềm sạch sẽ. HOANGKUN STORE xin thông báo: Chúng tôi <b>CHỈ</b> thực hiện giao dịch, kinh doanh và hỗ trợ các mặt hàng cấu thành từ những dòng mã lập trình, các sản phẩm kỹ thuật số thuần túy (Bao gồm: Code Web, Script Game, Tools Hack/Auto).<br><br>' +
                         '❌ <b>NHỮNG ĐIỀU CHÚNG TÔI KHÔNG LÀM:</b><br>' +
                         'Chúng tôi tuyệt đối KHÔNG tham gia kinh doanh mua bán trao đổi tài khoản game (Acc Game), KHÔNG nhận dịch vụ nạp thẻ cào Ingame, KHÔNG nhận cày thuê/kéo ranh thuê, và đặc biệt KHÔNG bán các loại vật phẩm hàng hóa linh tinh khác để tránh làm pha loãng thương hiệu và làm suy giảm chất lượng dịch vụ cốt lõi của những sản phẩm chất xám công nghệ! 😎' 
            },
            { 
                label: '🛡️ Chính sách bảo hành', 
                reply: 'Cho mình xem bản cam kết về chính sách bảo hành, các tiêu chuẩn chất lượng và chế độ hậu mãi sau khi mua code của hệ thống ra sao?', 
                nextMenu: null, 
                botText: '📜 <b>HIẾN PHÁP BẢO HÀNH VÀ CAM KẾT CHẤT LƯỢNG HOÀNG GIA</b> 📜<br><br>' +
                         'Đối với thế giới ngầm công nghệ số, "Chất lượng là thứ tạo ra giá trị tồn tại, nhưng Uy tín mới là thứ định hình nên vương miện của một Thương hiệu!". Đó chính là tôn chỉ hoạt động bất di bất dịch, được khắc sâu vào tâm trí của từng thành viên trong đội ngũ phát triển HOANGKUN STORE. 💎<br><br>' +
                         'Chúng tôi thấu hiểu sâu sắc rằng, những rủi ro khi mua phần mềm trên mạng là rất lớn, và sự an tâm tuyệt đối của khách hàng trước và sau khi thanh toán chính là chiếc chìa khóa duy nhất để giữ chân họ. Vì lẽ đó, HOANGKUN STORE tự tin ban hành chính sách: Mọi Source Code Website, Tools Auto và Script Game khi quý khách tiến hành thanh toán mua thành công tại hệ thống chính chủ đều được thiết lập hợp đồng tự động áp dụng chính sách <b>BẢO HÀNH LỖI KỸ THUẬT VÀ BẢO TRÌ TRỌN ĐỜI CÙNG VÒNG ĐỜI SẢN PHẨM</b>.<br><br>' +
                         '👑 <b>KHI CHÍNH THỨC TRỞ THÀNH KHÁCH HÀNG VIP CỦA STORE, BẠN SẼ NẮM TRONG TAY 3 ĐẶC QUYỀN TỐI THƯỢNG SAU:</b><br><br>' +
                         '1️⃣ <b>Bảo Hành Code Lỗi Triệt Để (Zero Bugs Warranty):</b> Không có phần mềm nào hoàn hảo 100% ngay từ lúc sinh ra. Nếu trong quá trình vận hành kinh doanh, mã nguồn do chính chúng tôi cung cấp phát sinh các lỗi hỏng hóc do sai lệch cấu trúc vòng lặp, lỗi Database, hoặc thủng bảo mật (lỗi do người viết code). Đội ngũ Developer của chúng tôi cam kết sẽ nhảy vào phân tích Debug và Fix lỗi triệt để tận gốc hoàn toàn MIỄN PHÍ.<br><br>' +
                         '2️⃣ <b>Cập Nhật Phiên Bản Miễn Phí Trọn Đời (Lifetime Free Updates):</b> Giới công nghệ phát triển từng ngày, thư viện code luôn bị lỗi thời. Nhưng đừng lo! Mỗi khi Store phát hành các bản Update phiên bản mới nâng cấp thêm tính năng xịn sò hơn, tối ưu lại giao diện đẹp hơn, hoặc tung ra các bản vá bảo mật (Security Patch) chống Hacker... Bạn sẽ được quyền tải xuống các bản nâng cấp đó mà KHÔNG bị thu thêm dù chỉ một cắc phụ phí nào.<br><br>' +
                         '3️⃣ <b>Dịch Vụ Hỗ Trợ Cài Đặt Tận Tâm (Setup Support A-Z):</b> Chúng tôi sẽ không vứt cho bạn một đống File Zip mã hóa rối rắm rồi bỏ chạy. Admin sẽ cung cấp hướng dẫn Document chi tiết nhất, kèm theo dịch vụ cài đặt tận tình từ A-Z, support kết nối Database trực tiếp qua phần mềm điều khiển từ xa Ultraviewer/AnyDesk ngay tại thời điểm bàn giao mã nguồn. Chúng tôi chỉ thực hiện nghiệm thu dự án khi và chỉ khi Website của bạn đã được đưa lên mạng hoạt động mượt mà 100% không tì vết!' 
            },
            { 
                label: '🔙 Quay lại Menu Chính', 
                reply: 'Trở về trang lựa chọn danh mục tổng quan lúc nãy.', 
                nextMenu: 'main_menu', 
                botText: 'Quá trình trích xuất dữ liệu hoàn tất! Hệ thống đã tự động điều hướng và đưa bạn quay trở lại khu vực Menu điều khiển chính. Vui lòng nhấp vào các nút tùy chọn bên dưới tương ứng với những thông tin chuyên sâu tiếp theo mà bạn cần hệ thống tự động của chúng tôi tiến hành tư vấn và hỗ trợ xử lý:' 
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
