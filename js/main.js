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
  const card = document.getElementById('instants-card');
  const content = document.getElementById('instants-content');
  const counter = document.getElementById('instants-counter');
  const flash = document.getElementById('instants-flash');

  if (!card || !content) return;

  let currentIndex = 0;

  function renderPhoto(index) {
    const photo = INSTANTS_DATA[index];
    counter.textContent = `${photo.id} / ${INSTANTS_DATA.length}`;

    // Camera flash effect on tap
    flash.classList.add('is-flashing');
    setTimeout(() => flash.classList.remove('is-flashing'), 180);

    content.style.background = photo.bg;
    content.innerHTML = `
      <div class="instants-card__icon">${photo.icon}</div>
      <h3 class="instants-card__title">${photo.title}</h3>
      <div class="instants-card__date">${photo.date}</div>
    `;
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % INSTANTS_DATA.length;
    renderPhoto(currentIndex);
  }

  renderPhoto(0);

  card.addEventListener('click', nextPhoto);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nextPhoto();
    }
  });
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
