gsap.registerPlugin(ScrollTrigger);

function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const mark = preloader.querySelector('.preloader__mark');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    preloader.style.display = 'none';
    document.documentElement.dataset.ready = '1';
    onComplete();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      preloader.style.display = 'none';
      document.documentElement.dataset.ready = '1';
      onComplete();
    }
  });

  tl.to(mark, {
    clipPath: 'inset(0 0% 0 0)',
    duration: 1.0,
    ease: 'power2.out'
  }).to(preloader, {
    opacity: 0,
    duration: 0.5,
    ease: 'power1.inOut'
  }, '+=0.2');
}

function initHeroEntrance() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.to('.hero [data-reveal]', {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.15
  });

  if (!reduceMotion) {
    gsap.fromTo(
      '.hero__bg',
      { scale: 1.08 },
      { scale: 1, duration: 1.4, ease: 'power2.out' }
    );

    gsap.to('.hero__bg', {
      y: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  } else {
    gsap.set('.hero__bg', { scale: 1 });
  }
}

function initScrollReveals() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const targets = document.querySelectorAll('[data-reveal]:not(.hero [data-reveal])');
  targets.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%'
      }
    });
  });
}

function initTimelineDraw() {
  const line = document.querySelector('.timeline__line line');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const length = line.getTotalLength();

  line.style.strokeDasharray = length;

  if (reduceMotion) {
    line.style.strokeDashoffset = 0;
    return;
  }

  line.style.strokeDashoffset = length;

  gsap.to(line, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 70%',
      end: 'bottom 80%',
      scrub: true
    }
  });
}

const INSTANTS_DATA = [
  { id: 1, title: 'Lần đầu gặp gỡ', date: 'Mùa thu 2019', icon: '✨', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80', tilt: -2 },
  { id: 2, title: 'Buổi hẹn hò đầu tiên', date: 'Cuối năm 2019', icon: '☕', img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80', tilt: 3 },
  { id: 3, title: 'Chuyến đi Đà Lạt', date: 'Mùa xuân 2020', icon: '🌲', img: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80', tilt: -4 },
  { id: 4, title: 'Kỷ niệm 1 năm yêu', date: 'Mùa thu 2020', icon: '💐', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80', tilt: 2 },
  { id: 5, title: 'Sinh nhật ngọt ngào', date: 'Đầu năm 2021', icon: '🎂', img: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=800&q=80', tilt: -3 },
  { id: 6, title: 'Mùa thu Hà Nội', date: 'Mùa thu 2021', icon: '🍂', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', tilt: 4 },
  { id: 7, title: 'Chuyến du lịch biển', date: 'Mùa hè 2022', icon: '🌊', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', tilt: -2 },
  { id: 8, title: 'Kỷ niệm 3 năm', date: 'Mùa thu 2022', icon: '🥂', img: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80', tilt: 3 },
  { id: 9, title: 'Đón năm mới', date: 'Đầu năm 2023', icon: '🎆', img: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=800&q=80', tilt: -4 },
  { id: 10, title: 'Ngày bình dị', date: 'Năm 2024', icon: '🌿', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80', tilt: 2 },
  { id: 11, title: 'Lời cầu hôn', date: 'Đầu năm 2026', icon: '💍', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80', tilt: -3 },
  { id: 12, title: 'Về chung một nhà', date: 'Đầu năm 2027', icon: '💒', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', tilt: 4 }
];

function initInstantsWidget() {
  const stackContainer = document.getElementById('instants-stack');
  if (!stackContainer) return;

  const cards = Array.from(stackContainer.querySelectorAll('.instants-card'));
  if (cards.length < 3) return;

  let currentIndex = 0;
  let isAnimating = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentDeltaX = 0;
  let currentDeltaY = 0;
  let startTime = 0;

  function getPhotoData(idx) {
    return INSTANTS_DATA[(idx % INSTANTS_DATA.length + INSTANTS_DATA.length) % INSTANTS_DATA.length];
  }

  function renderCardContent(cardEl, data) {
    const content = cardEl.querySelector('.instants-card__content');
    if (!content) return;
    content.style.backgroundImage = `url('${data.img}')`;
    content.innerHTML = `
      <div class="instants-card__overlay"></div>
      <div class="instants-card__body">
        <div class="instants-card__icon">${data.icon}</div>
        <h3 class="instants-card__title">${data.title}</h3>
        <div class="instants-card__date">${data.date}</div>
      </div>
    `;
  }

  function setupStackState() {
    const topCard = cards[0];
    const midCard = cards[1];
    const botCard = cards[2];

    const dataTop = getPhotoData(currentIndex);
    const dataMid = getPhotoData(currentIndex + 1);
    const dataBot = getPhotoData(currentIndex + 2);

    renderCardContent(topCard, dataTop);
    renderCardContent(midCard, dataMid);
    renderCardContent(botCard, dataBot);

    // Disable CSS transition during structural setup
    topCard.classList.add('no-transition');
    midCard.classList.add('no-transition');
    botCard.classList.add('no-transition');

    topCard.className = 'instants-card is-top';
    topCard.style.transform = `translate3d(0, 0, 0) rotate(${dataTop.tilt}deg) scale(1)`;
    topCard.style.opacity = '1';

    midCard.className = 'instants-card is-middle';
    midCard.style.transform = `translate3d(0, 8px, 0) rotate(${dataMid.tilt}deg) scale(0.95)`;
    midCard.style.opacity = '0.92';

    botCard.className = 'instants-card is-bottom';
    botCard.style.transform = `translate3d(0, 16px, 0) rotate(${dataBot.tilt}deg) scale(0.90)`;
    botCard.style.opacity = '0.80';

    // Re-enable CSS transitions on next frame
    requestAnimationFrame(() => {
      topCard.classList.remove('no-transition');
      midCard.classList.remove('no-transition');
      botCard.classList.remove('no-transition');
    });

    bindTopCardEvents(topCard);
  }

  let activeTopCard = null;

  function bindTopCardEvents(cardEl) {
    if (activeTopCard === cardEl) return;
    if (activeTopCard) {
      activeTopCard.removeEventListener('pointerdown', onPointerDown);
    }
    activeTopCard = cardEl;
    activeTopCard.addEventListener('pointerdown', onPointerDown);
  }

  function onPointerDown(e) {
    if (isAnimating || !activeTopCard) return;
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    currentDeltaX = 0;
    currentDeltaY = 0;
    startTime = Date.now();

    activeTopCard.classList.add('is-dragging');
    if (e.pointerId !== undefined && activeTopCard.setPointerCapture) {
      try { activeTopCard.setPointerCapture(e.pointerId); } catch {}
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging || !activeTopCard) return;

    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    currentDeltaX = x - startX;
    currentDeltaY = y - startY;

    const currentData = getPhotoData(currentIndex);
    const baseTilt = currentData.tilt || 0;
    const dragRotate = (currentDeltaX / 300) * 18;
    const opacity = Math.max(0, 1 - Math.abs(currentDeltaX) / 450);

    activeTopCard.style.transform = `translate3d(${currentDeltaX}px, ${currentDeltaY}px, 0) rotate(${baseTilt + dragRotate}deg)`;
    activeTopCard.style.opacity = opacity;
  }

  function onPointerUp(e) {
    if (!isDragging || !activeTopCard) return;
    isDragging = false;
    activeTopCard.classList.remove('is-dragging');

    if (e.pointerId !== undefined && activeTopCard.releasePointerCapture) {
      try { activeTopCard.releasePointerCapture(e.pointerId); } catch {}
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    const duration = Date.now() - startTime;
    const velocityX = Math.abs(currentDeltaX) / Math.max(1, duration);

    const isSwipe = Math.abs(currentDeltaX) > 50 || (velocityX > 0.25 && Math.abs(currentDeltaX) > 12);
    const isClick = Math.abs(currentDeltaX) < 6 && Math.abs(currentDeltaY) < 6;

    if (isClick) {
      executeFlyOut(1);
    } else if (isSwipe) {
      executeFlyOut(currentDeltaX < 0 ? -1 : 1);
    } else {
      resetToCenter();
    }
  }

  function executeFlyOut(direction = 1) {
    if (!activeTopCard) return;
    isAnimating = true;

    const currentData = getPhotoData(currentIndex);
    const baseTilt = currentData.tilt || 0;
    const flyX = direction * 450;
    const flyRot = baseTilt + direction * 26;

    activeTopCard.style.transform = `translate3d(${flyX}px, ${currentDeltaY * 1.1}px, 0) rotate(${flyRot}deg)`;
    activeTopCard.style.opacity = '0';

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % INSTANTS_DATA.length;

      // Move flown card to back of DOM array and DOM tree
      const flownCard = cards.shift();
      cards.push(flownCard);
      stackContainer.appendChild(flownCard);

      // Re-setup DOM stack order and positions seamlessly
      setupStackState();

      isAnimating = false;
    }, 280);
  }

  function resetToCenter() {
    if (!activeTopCard) return;
    const currentData = getPhotoData(currentIndex);
    const baseTilt = currentData.tilt || 0;

    activeTopCard.style.transform = `translate3d(0, 0, 0) rotate(${baseTilt}deg)`;
    activeTopCard.style.opacity = '1';
  }

  setupStackState();
}

function initScheduleFlip() {
  document.querySelectorAll('.flip-card').forEach((card) => {
    const toggle = () => card.classList.toggle('is-flipped');
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

function initRSVP() {
  const RSVP_FORM_URL = 'https://forms.google.com/REPLACE_WITH_REAL_LINK';
  const btn = document.getElementById('rsvp-btn');

  btn.addEventListener('click', () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#C9A678', '#E8C9C4', '#B48A6A']
    });

    window.setTimeout(() => {
      window.open(RSVP_FORM_URL, '_blank', 'noopener');
    }, 700);
  });
}

function initBackgroundMusic() {
  const musicBtn = document.getElementById('music-toggle');
  if (!musicBtn) return;

  const musicUrl = (typeof CONFIG !== 'undefined' && CONFIG.MUSIC_URL)
    ? CONFIG.MUSIC_URL
    : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-wedding-piano-112191.mp3';

  const audio = new Audio(musicUrl);
  audio.loop = true;
  let isPlaying = false;

  function playMusic() {
    audio.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('is-playing');
      musicBtn.querySelector('.music-toggle__disc').textContent = '🎵';
      musicBtn.setAttribute('title', 'Tắt nhạc nền Piano A Thousand Years');
    }).catch(() => {
      isPlaying = false;
      musicBtn.classList.remove('is-playing');
      musicBtn.querySelector('.music-toggle__disc').textContent = '🔇';
      musicBtn.setAttribute('title', 'Bật nhạc nền Piano A Thousand Years');
    });
  }

  function pauseMusic() {
    audio.pause();
    isPlaying = false;
    musicBtn.classList.remove('is-playing');
    musicBtn.querySelector('.music-toggle__disc').textContent = '🔇';
    musicBtn.setAttribute('title', 'Bật nhạc nền Piano A Thousand Years');
  }

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  // Autoplay on first user interaction anywhere on page
  function handleFirstUserGesture() {
    if (!isPlaying) {
      playMusic();
    }
    window.removeEventListener('click', handleFirstUserGesture);
    window.removeEventListener('touchstart', handleFirstUserGesture);
    window.removeEventListener('keydown', handleFirstUserGesture);
  }

  window.addEventListener('click', handleFirstUserGesture);
  window.addEventListener('touchstart', handleFirstUserGesture);
  window.addEventListener('keydown', handleFirstUserGesture);
}

document.addEventListener('DOMContentLoaded', () => {
  initPreloader(() => {
    initHeroEntrance();
    initScrollReveals();
    initTimelineDraw();
    initInstantsWidget();
    initScheduleFlip();
    if (typeof initGuestbook === 'function') initGuestbook();
    initRSVP();
    initBackgroundMusic();
  });
});
