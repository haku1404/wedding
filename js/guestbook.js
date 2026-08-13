/**
 * Guestbook Module (Sổ lưu bút & Lời chúc)
 * Features:
 * - Expandable form dropdown
 * - Displays max 5 wishes on wish wall
 * - Pinned top wish (5-min priority for newly submitted wish or 5-min random rotation)
 * - Auto-rotation of bottom 4 wishes every 2 minutes
 * - Secret 5-click admin deletion switch (PIN: 1404)
 */

const GUESTBOOK_STORAGE_KEY = 'wedding_guestbook_messages_v2';
const ADMIN_SESSION_KEY = 'wedding_guestbook_admin_active';

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

  let newlySubmittedWish = null;
  let newWishPinnedTime = 0;
  let topWishIndex = 0;
  let bottomTickSeed = Date.now();

  // Sync from Google Sheets cloud DB on load if configured
  if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEET_SCRIPT_URL) {
    fetchCloudMessages();
  }

  async function fetchCloudMessages() {
    try {
      const res = await fetch(CONFIG.GOOGLE_SHEET_SCRIPT_URL);
      if (res.ok) {
        const cloudData = await res.json();
        if (Array.isArray(cloudData)) {
          messages = cloudData;
          saveMessages(messages);
          renderMessages();
        }
      }
    } catch (err) {
      console.warn('Google Sheets sync notice:', err);
    }
  }

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

    // Priority 5-minute pin at Position 1 for newly submitted wish
    newlySubmittedWish = newMsg;
    newWishPinnedTime = Date.now();

    messages.unshift(newMsg);
    saveMessages(messages);
    renderMessages();

    // Post to Google Sheets if URL configured
    if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEET_SCRIPT_URL) {
      try {
        fetch(CONFIG.GOOGLE_SHEET_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        });
      } catch (err) {
        console.warn('Google Sheets POST notice:', err);
      }
    }

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

  function getDisplayedWishes() {
    if (!messages || messages.length === 0) return [];
    if (messages.length <= 5) return messages;

    // Position 1: Pinned newly submitted wish (5 mins) or 5-min rotating top wish
    let topWish = null;
    const isNewWishActive = newlySubmittedWish && (Date.now() - newWishPinnedTime < 300000); // 5 mins

    if (isNewWishActive) {
      topWish = newlySubmittedWish;
    } else {
      topWish = messages[topWishIndex % messages.length];
    }

    // Positions 2 - 5: 4 random wishes rotated every 2 minutes
    const pool = messages.filter((m) => m.id !== topWish.id);
    const shuffled = pseudoShuffle(pool, bottomTickSeed);
    const bottomFour = shuffled.slice(0, 4);

    return [topWish, ...bottomFour];
  }

  function renderMessages() {
    listContainer.innerHTML = '';

    const displayed = getDisplayedWishes();

    if (displayed.length === 0) {
      listContainer.innerHTML = `<p class="guestbook-empty">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé! ✨</p>`;
      return;
    }

    displayed.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'guestbook-card';
      if (idx === 0 && (Date.now() - newWishPinnedTime < 300000) && newlySubmittedWish && newlySubmittedWish.id === item.id) {
        card.classList.add('guestbook-card--pinned');
      }

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
    if (newlySubmittedWish && newlySubmittedWish.id === id) {
      newlySubmittedWish = null;
    }
    messages = messages.filter((m) => m.id !== id);
    saveMessages(messages);
    renderMessages();
  }

  // Timers:
  // 1. Every 2 minutes (120,000 ms): Rotate 4 bottom wishes
  setInterval(() => {
    bottomTickSeed = Date.now();
    renderMessages();
  }, 120000);

  // 2. Every 5 minutes (300,000 ms): Rotate top wish if no active new wish
  setInterval(() => {
    if (!newlySubmittedWish || (Date.now() - newWishPinnedTime >= 300000)) {
      topWishIndex++;
      renderMessages();
    }
  }, 300000);

  function getStoredMessages() {
    try {
      const raw = localStorage.getItem(GUESTBOOK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
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

  function pseudoShuffle(arr, seed) {
    const copy = [...arr];
    let m = copy.length, t, i;
    while (m) {
      i = Math.floor(pseudoRandom(seed + m) * m--);
      t = copy[m];
      copy[m] = copy[i];
      copy[i] = t;
    }
    return copy;
  }

  function pseudoRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  renderMessages();
}
