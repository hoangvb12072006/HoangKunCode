// ===== CHAT WIDGET - TMKAA (Firebase Firestore) =====
(function () {
  const ADMIN_REPLY_LABEL = 'TMKAA';
  let sessionId = localStorage.getItem('tmkaa_chat_session');
  let visitorName = localStorage.getItem('tmkaa_chat_name') || '';
  let unsubscribe = null;

  // Inject HTML
  const widget = document.createElement('div');
  widget.id = 'chat-widget';
  widget.innerHTML = `
    <button id="chat-toggle" onclick="toggleChat()" title="Chat với TMKAA">
      💬
      <span id="chat-badge"></span>
    </button>
    <div id="chat-box">
      <div id="chat-header">
        <div class="chat-avatar">🧑‍💼</div>
        <div class="chat-header-info">
          <h4>Hỗ Trợ TMKAA</h4>
          <div class="chat-status"><span class="chat-dot"></span> Trực tuyến</div>
        </div>
      </div>
      <div id="chat-start" style="display:none">
        <p>Xin chào! Nhập tên để bắt đầu chat với chúng tôi 👋</p>
        <input type="text" id="visitor-name-input" placeholder="Họ và tên của bạn..." maxlength="40">
        <button onclick="startChat()">Bắt Đầu Chat</button>
      </div>
      <div id="chat-messages" style="display:none"></div>
      <div class="chat-typing" id="chat-typing">TMKAA đang soạn tin...</div>
      <div id="chat-input-area" style="display:none">
        <input type="text" id="chat-input" placeholder="Nhập tin nhắn..." onkeydown="if(event.key==='Enter')sendMsg()">
        <button id="chat-send" onclick="sendMsg()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  window.toggleChat = function () {
    const box = document.getElementById('chat-box');
    const isOpen = box.classList.toggle('open');
    document.getElementById('chat-toggle').innerHTML = isOpen
      ? '✕ <span id="chat-badge"></span>'
      : '💬 <span id="chat-badge"></span>';
    if (isOpen) {
      document.getElementById('chat-badge').className = '';
      if (sessionId && visitorName) {
        showChatUI();
        listenMessages();
      } else {
        document.getElementById('chat-start').style.display = 'flex';
        document.getElementById('chat-messages').style.display = 'none';
        document.getElementById('chat-input-area').style.display = 'none';
      }
    }
  };

  window.startChat = function () {
    const nameInput = document.getElementById('visitor-name-input');
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    visitorName = name;
    localStorage.setItem('tmkaa_chat_name', name);
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('tmkaa_chat_session', sessionId);
      db.collection('chats').doc(sessionId).set({
        visitorName: name,
        page: window.location.pathname,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastMessage: '',
        unread: 0
      });
    }
    showChatUI();
    listenMessages();
    // Welcome message
    appendSystemMsg('👋 Xin chào ' + name + '! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  function showChatUI() {
    document.getElementById('chat-start').style.display = 'none';
    document.getElementById('chat-messages').style.display = 'flex';
    document.getElementById('chat-input-area').style.display = 'flex';
  }

  function appendSystemMsg(text) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg admin';
    div.innerHTML = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function listenMessages() {
    if (unsubscribe) unsubscribe();
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML = '';
    unsubscribe = db.collection('chats').doc(sessionId)
      .collection('messages')
      .orderBy('createdAt')
      .onSnapshot(snapshot => {
        msgs.innerHTML = '';
        let newAdmin = false;
        snapshot.forEach(doc => {
          const d = doc.data();
          const div = document.createElement('div');
          div.className = 'chat-msg ' + (d.sender === 'visitor' ? 'visitor' : 'admin');
          const time = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
          div.innerHTML = d.text + '<span class="chat-msg-time">' + (d.sender === 'admin' ? ADMIN_REPLY_LABEL + ' · ' : '') + time + '</span>';
          msgs.appendChild(div);
          if (d.sender === 'admin' && !document.getElementById('chat-box').classList.contains('open')) newAdmin = true;
        });
        msgs.scrollTop = msgs.scrollHeight;
        if (newAdmin) showBadge();
      });
  }

  function showBadge() {
    const badge = document.getElementById('chat-badge');
    if (badge) { badge.className = 'show'; badge.textContent = '!'; }
  }

  window.sendMsg = function () {
    if (!sessionId) return;
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    db.collection('chats').doc(sessionId).collection('messages').add({
      text,
      sender: 'visitor',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    db.collection('chats').doc(sessionId).update({
      lastMessage: text,
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  };
})();
