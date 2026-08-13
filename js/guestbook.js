/**
 * Guestbook Module (Sổ lưu bút & Lời chúc)
 * Features:
 * - Collapsible form dropdown
 * - Supabase / LocalStorage fallback storage
 * - Secret 5-click admin deletion mode (PIN: 1404)
 */

const GUESTBOOK_STORAGE_KEY = 'wedding_guestbook_messages_v1';
const ADMIN_SESSION_KEY = 'wedding_guestbook_admin_active';

const INITIAL_MOCK_MESSAGES = [
  {
    id: 'msg-1',
    name: 'Anh Tuấn & Chị Mai',
    message: 'Chúc hai em bách niên giai lão, sớm đón quý tử nha! Ngày trọng đại ngập tràn hạnh phúc ❤️',
    timestamp: '10:30 - 12/08/2026'
  },
  {
    id: 'msg-2',
    name: 'Minh Hoàng (Hội bạn thân)',
    message: 'Chúc mừng chú rể đã thoát kiếp F.A! Chúc hai bạn một đời an yên, cùng nhau đi qua trăm năm hạnh phúc ✨',
    timestamp: '14:15 - 12/08/2026'
  },
  {
    id: 'msg-3',
    name: 'Chị Thanh Hương',
    message: 'Thật mừng cho hai em. Chúc tổ ấm nhỏ luôn tràn ngập tiếng cười và sự yêu thương mỗi ngày 💕',
    timestamp: '09:00 - 13/08/2026'
  }
];

function initGuestbook() {
  const sectionLabel = document.getElementById('guestbook-label');
  const toggleBtn = document.getElementById('guestbook-toggle');
  const formContainer = document.getElementById('guestbook-form-container');
  const form = document.getElementById('guestbook-form');
  const nameInput = document.getElementById('guestbook-name');
  const messageInput = document.getElementById('guestbook-message');
  const listContainer = document.getElementById('guestbook-list');

  if (!toggleBtn || !formContainer || !form || !listContainer) return;

  let messages = getStoredMessages();
  let isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

  // Toggle dropdown form
  toggleBtn.addEventListener('click', () => {
    const isExpanded = formContainer.classList.toggle('is-open');
    toggleBtn.classList.toggle('is-active', isExpanded);
    toggleBtn.setAttribute('aria-expanded', isExpanded);
    if (isExpanded) {
      setTimeout(() => nameInput.focus(), 250);
    }
  });

  // Submit new message
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      name: name,
      message: message,
      timestamp: formatTimestamp(new Date())
    };

    messages.unshift(newMsg);
    saveMessages(messages);
    renderMessages();

    // Trigger celebratory confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#C9A678', '#E8C9C4', '#B48A6A']
      });
    }

    // Reset & close form
    form.reset();
    formContainer.classList.remove('is-open');
    toggleBtn.classList.remove('is-active');

    // Smooth scroll to wish wall
    listContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Secret 5-click admin toggle trigger
  let titleClickCount = 0;
  let titleClickTimer = null;

  if (sectionLabel) {
    sectionLabel.addEventListener('click', () => {
      titleClickCount++;
      clearTimeout(titleClickTimer);

      if (titleClickCount >= 5) {
        titleClickCount = 0;
        promptAdminAccess();
      } else {
        titleClickTimer = setTimeout(() => {
          titleClickCount = 0;
        }, 2000);
      }
    });
  }

  function promptAdminAccess() {
    if (isAdmin) {
      if (confirm('Bạn đang ở chế độ Quản trị viên. Bạn có muốn THOÁT chế độ Quản trị viên không?')) {
        isAdmin = false;
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        renderMessages();
        alert('Đã thoát chế độ Quản trị viên.');
      }
      return;
    }

    const pin = prompt('🔑 Nhập mã bí mật Quản trị viên để xóa lời chúc:');
    const adminPin = (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_PIN) ? CONFIG.ADMIN_PIN : '1404';

    if (pin === adminPin) {
      isAdmin = true;
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      renderMessages();
      alert('✨ Đã bật Chế độ Quản trị viên! Giờ bạn có thể thấy nút Xóa trên các lời chúc.');
    } else if (pin !== null) {
      alert('❌ Mã bí mật không đúng!');
    }
  }

  function renderMessages() {
    listContainer.innerHTML = '';

    if (messages.length === 0) {
      listContainer.innerHTML = `<p class="guestbook-empty">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé! ✨</p>`;
      return;
    }

    messages.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'guestbook-card';
      
      const avatarLetter = item.name.charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="guestbook-card__header">
          <div class="guestbook-card__avatar">${avatarLetter}</div>
          <div class="guestbook-card__meta">
            <h4 class="guestbook-card__name">${escapeHtml(item.name)}</h4>
            <span class="guestbook-card__time">${escapeHtml(item.timestamp)}</span>
          </div>
          ${isAdmin ? `<button class="guestbook-card__delete" data-id="${item.id}" title="Xóa lời chúc này">🗑️ Xóa</button>` : ''}
        </div>
        <p class="guestbook-card__msg">"${escapeHtml(item.message)}"</p>
      `;

      if (isAdmin) {
        const deleteBtn = card.querySelector('.guestbook-card__delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            if (confirm(`Bạn có chắc chắn muốn xóa lời chúc từ "${item.name}" không?`)) {
              deleteMessage(item.id);
            }
          });
        }
      }

      listContainer.appendChild(card);
    });
  }

  function deleteMessage(id) {
    messages = messages.filter((m) => m.id !== id);
    saveMessages(messages);
    renderMessages();
  }

  function getStoredMessages() {
    try {
      const raw = localStorage.getItem(GUESTBOOK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MESSAGES));
    return [...INITIAL_MOCK_MESSAGES];
  }

  function saveMessages(msgs) {
    try {
      localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(msgs));
    } catch {}
  }

  function formatTimestamp(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${mins} - ${day}/${month}/${year}`;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  renderMessages();
}
