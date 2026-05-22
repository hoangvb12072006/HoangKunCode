// ===== POPUP =====
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const popup = document.getElementById('popupOverlay');
    if (popup) { popup.classList.add('active'); document.body.style.overflow = 'hidden'; }
  }, 600);
  initScrollAnimations();
  initNavbar();
});

function closePopup() {
  const popup = document.getElementById('popupOverlay');
  if (popup) { popup.classList.remove('active'); document.body.style.overflow = ''; }
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMenu() {
  const nav = document.getElementById('navLinks');
  if (nav) nav.classList.toggle('open');
}
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('open');
  });
});

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => observer.observe(el));
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-number, .stat-num').forEach(counter => {
    const text = counter.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;
    const target = parseInt(match[0]);
    const suffix = text.replace(match[0], '');
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { counter.textContent = text; clearInterval(interval); }
      else { counter.textContent = Math.floor(current) + suffix; }
    }, 25);
  });
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounters(); statsObserver.unobserve(entry.target); }
  });
}, { threshold: 0.3 });
const statsEl = document.querySelector('.stats-bar') || document.querySelector('.hero');
if (statsEl) statsObserver.observe(statsEl);

// ===== FORM → FIREBASE (Firestore) =====
async function handleSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('name')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const service = document.getElementById('service')?.value || '';
  const message = document.getElementById('message')?.value || '';

  const btn = event.target.querySelector('.form-submit');
  if (btn) { btn.innerHTML = '⏳ Đang gửi...'; btn.disabled = true; }

  try {
    // Lưu vào Firestore — admin nhận realtime
    if (typeof db !== 'undefined') {
      await db.collection('requests').add({
        name, phone, service, message,
        status: 'new',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        page: window.location.pathname
      });
    }

    if (btn) {
      btn.innerHTML = '✓ Đã gửi! Chúng tôi sẽ liên hệ sớm.';
      btn.style.background = '#059669';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Yêu Cầu';
        btn.style.background = '';
        btn.disabled = false;
        event.target.reset();
      }, 3500);
    }
  } catch (err) {
    console.error('Lỗi gửi yêu cầu:', err);
    if (btn) {
      btn.innerHTML = '❌ Lỗi! Thử lại sau';
      btn.disabled = false;
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Yêu Cầu'; }, 3000);
    }
  }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== FAQ TOGGLE =====
function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const icon = el.querySelector('i');
  const isOpen = item.classList.contains('open');

  // Close all others
  document.querySelectorAll('.faq-item.open').forEach(other => {
    if (other !== item) {
      other.classList.remove('open');
      other.querySelector('.faq-answer').style.maxHeight = null;
      other.querySelector('.faq-question i').style.transform = '';
    }
  });

  if (isOpen) {
    item.classList.remove('open');
    answer.style.maxHeight = null;
    icon.style.transform = '';
  } else {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
    icon.style.transform = 'rotate(180deg)';
  }
}
