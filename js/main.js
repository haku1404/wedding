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
  { id: 1, title: 'Lần đầu gặp gỡ', date: 'Mùa thu 2019', icon: '✨', bg: 'linear-gradient(135deg, #6B4984, #B48A6A)' },
  { id: 2, title: 'Buổi hẹn hò đầu tiên', date: 'Cuối năm 2019', icon: '☕', bg: 'linear-gradient(135deg, #8A5A44, #C9A678)' },
  { id: 3, title: 'Chuyến đi Đà Lạt', date: 'Mùa xuân 2020', icon: '🌲', bg: 'linear-gradient(135deg, #3A5A40, #A8AE9C)' },
  { id: 4, title: 'Kỷ niệm 1 năm yêu', date: 'Mùa thu 2020', icon: '💐', bg: 'linear-gradient(135deg, #B56576, #E8C9C4)' },
  { id: 5, title: 'Sinh nhật ngọt ngào', date: 'Đầu năm 2021', icon: '🎂', bg: 'linear-gradient(135deg, #583101, #C5A880)' },
  { id: 6, title: 'Mùa thu Hà Nội', date: 'Mùa thu 2021', icon: '🍂', bg: 'linear-gradient(135deg, #9C6644, #D4B295)' },
  { id: 7, title: 'Chuyến du lịch biển', date: 'Mùa hè 2022', icon: '🌊', bg: 'linear-gradient(135deg, #2A6F97, #89C2D9)' },
  { id: 8, title: 'Kỷ niệm 3 năm', date: 'Mùa thu 2022', icon: '🥂', bg: 'linear-gradient(135deg, #6B4E71, #C9A678)' },
  { id: 9, title: 'Đón năm mới', date: 'Đầu năm 2023', icon: '🎆', bg: 'linear-gradient(135deg, #3D5A80, #98C1D9)' },
  { id: 10, title: 'Ngày bình dị', date: 'Năm 2024', icon: '🌿', bg: 'linear-gradient(135deg, #52796F, #CAD2C5)' },
  { id: 11, title: 'Lời cầu hôn', date: 'Đầu năm 2026', icon: '💍', bg: 'linear-gradient(135deg, #9E2A2B, #E8C9C4)' },
  { id: 12, title: 'Về chung một nhà', date: 'Đầu năm 2027', icon: '💒', bg: 'linear-gradient(135deg, #6B4984, #C9A678)' }
];

function initInstantsWidget() {
  const cardTop = document.getElementById('card-top');
  const cardContent = document.getElementById('card-content');

  if (!cardTop || !cardContent) return;

  let currentIndex = 0;
  let isDragging = false;
  let isAnimating = false;
  let startX = 0;
  let startY = 0;
  let currentDeltaX = 0;
  let currentDeltaY = 0;
  let startTime = 0;

  function renderPhoto(index) {
    const data = INSTANTS_DATA[(index + INSTANTS_DATA.length) % INSTANTS_DATA.length];
    cardContent.style.background = data.bg;
    cardContent.innerHTML = `
      <div class="instants-card__icon">${data.icon}</div>
      <h3 class="instants-card__title">${data.title}</h3>
      <div class="instants-card__date">${data.date}</div>
    `;
  }

  function onPointerDown(e) {
    if (isAnimating) return;
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    currentDeltaX = 0;
    currentDeltaY = 0;
    startTime = Date.now();

    cardTop.classList.add('is-dragging');
    if (e.pointerId !== undefined && cardTop.setPointerCapture) {
      try { cardTop.setPointerCapture(e.pointerId); } catch {}
    }
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    currentDeltaX = x - startX;
    currentDeltaY = y - startY;

    const rotateDeg = (currentDeltaX / 300) * 18;
    const opacity = Math.max(0, 1 - Math.abs(currentDeltaX) / 450);

    cardTop.style.transform = `translate3d(${currentDeltaX}px, ${currentDeltaY}px, 0) rotate(${rotateDeg}deg)`;
    cardTop.style.opacity = opacity;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    cardTop.classList.remove('is-dragging');

    if (e.pointerId !== undefined && cardTop.releasePointerCapture) {
      try { cardTop.releasePointerCapture(e.pointerId); } catch {}
    }

    const duration = Date.now() - startTime;
    const velocityX = Math.abs(currentDeltaX) / Math.max(1, duration);

    const isSwipe = Math.abs(currentDeltaX) > 60 || (velocityX > 0.3 && Math.abs(currentDeltaX) > 15);
    const isClick = Math.abs(currentDeltaX) < 6 && Math.abs(currentDeltaY) < 6;

    if (isClick) {
      triggerClickFlyOut();
    } else if (isSwipe) {
      triggerSwipeOut(currentDeltaX < 0 ? -1 : 1);
    } else {
      resetToCenter();
    }
  }

  function triggerClickFlyOut() {
    isAnimating = true;
    cardTop.classList.add('is-animating');

    // Fly current photo out to the right FIRST
    cardTop.style.transform = 'translate3d(420px, 0, 0) rotate(25deg)';
    cardTop.style.opacity = '0';

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % INSTANTS_DATA.length;
      renderPhoto(currentIndex);

      // Instant reset back to center without bounce
      cardTop.classList.remove('is-animating');
      cardTop.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      cardTop.style.opacity = '1';
      isAnimating = false;
    }, 240);
  }

  function triggerSwipeOut(direction = 1) {
    isAnimating = true;
    cardTop.classList.add('is-animating');

    const flyX = direction * 450;
    const flyRot = direction * 30;

    cardTop.style.transform = `translate3d(${flyX}px, ${currentDeltaY * 1.2}px, 0) rotate(${flyRot}deg)`;
    cardTop.style.opacity = '0';

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % INSTANTS_DATA.length;
      renderPhoto(currentIndex);

      // Instant reset back to center without bounce
      cardTop.classList.remove('is-animating');
      cardTop.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      cardTop.style.opacity = '1';
      isAnimating = false;
    }, 180);
  }

  function resetToCenter() {
    cardTop.classList.add('is-animating');
    cardTop.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    cardTop.style.opacity = '1';
    setTimeout(() => cardTop.classList.remove('is-animating'), 240);
  }

  cardTop.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  renderPhoto(0);
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

document.addEventListener('DOMContentLoaded', () => {
  initPreloader(() => {
    initHeroEntrance();
    initScrollReveals();
    initTimelineDraw();
    initInstantsWidget();
    initScheduleFlip();
    initRSVP();
  });
});
