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

const STORIES_DATA = [
  { id: 1, title: 'Lần đầu gặp gỡ', date: 'Mùa thu 2019', icon: '✨', bg: 'linear-gradient(135deg, #6B4984, #B48A6A)', caption: 'Buổi chiều mùa thu năm 2019, ánh mắt đầu tiên trao nhau ❤️' },
  { id: 2, title: 'Buổi hẹn hò đầu tiên', date: 'Cuối năm 2019', icon: '☕', bg: 'linear-gradient(135deg, #8A5A44, #C9A678)', caption: 'Quán cafe nhỏ góc phố quen thuộc, nói chuyện hăng hái quên giờ giấc' },
  { id: 3, title: 'Chuyến đi Đà Lạt', date: 'Mùa xuân 2020', icon: '🌲', bg: 'linear-gradient(135deg, #3A5A40, #A8AE9C)', caption: 'Cùng nhau ngắm hoàng hôn rực rỡ trên đồi thông 🌅' },
  { id: 4, title: 'Kỷ niệm 1 năm yêu', date: 'Mùa thu 2020', icon: '💐', bg: 'linear-gradient(135deg, #B56576, #E8C9C4)', caption: 'Bó hoa thạch thảo và những nụ cười hạnh phúc' },
  { id: 5, title: 'Sinh nhật ngọt ngào', date: 'Đầu năm 2021', icon: '🎂', bg: 'linear-gradient(135deg, #583101, #C5A880)', caption: 'Bữa tiệc nhỏ ấm áp chỉ có hai đứa' },
  { id: 6, title: 'Mùa thu Hà Nội', date: 'Mùa thu 2021', icon: '🍂', bg: 'linear-gradient(135deg, #9C6644, #D4B295)', caption: 'Nắm tay nhau đi qua từng con phố rợp lá vàng' },
  { id: 7, title: 'Chuyến du lịch biển', date: 'Mùa hè 2022', icon: '🌊', bg: 'linear-gradient(135deg, #2A6F97, #89C2D9)', caption: 'Biển xanh, cát trắng và tình yêu nồng thắm 🏖️' },
  { id: 8, title: 'Kỷ niệm 3 năm', date: 'Mùa thu 2022', icon: '🥂', bg: 'linear-gradient(135deg, #6B4E71, #C9A678)', caption: 'Cùng nhau trưởng thành qua bao khoảnh khắc đáng nhớ' },
  { id: 9, title: 'Đón năm mới', date: 'Đầu năm 2023', icon: '🎆', bg: 'linear-gradient(135deg, #3D5A80, #98C1D9)', caption: 'Đếm ngược giao thừa dưới pháo hoa rạng rỡ' },
  { id: 10, title: 'Ngày bình dị', date: 'Năm 2024', icon: '🌿', bg: 'linear-gradient(135deg, #52796F, #CAD2C5)', caption: 'Những niềm vui giản dị nhưng đầy ắp tình yêu' },
  { id: 11, title: 'Lời cầu hôn', date: 'Đầu năm 2026', icon: '💍', bg: 'linear-gradient(135deg, #9E2A2B, #E8C9C4)', caption: 'Một buổi tối lãng mạn, câu trả lời là "Có!" ✨' },
  { id: 12, title: 'Về chung một nhà', date: 'Đầu năm 2027', icon: '💒', bg: 'linear-gradient(135deg, #6B4984, #C9A678)', caption: 'Sẵn sàng cho ngày trọng đại nhất cuộc đời! 💕' }
];

function initStoriesModal() {
  const trigger = document.getElementById('story-trigger');
  const modal = document.getElementById('story-modal');
  const backdrop = document.getElementById('story-backdrop');
  const closeBtn = document.getElementById('story-close');
  const barsContainer = document.getElementById('story-bars');
  const timeLabel = document.getElementById('story-time');
  const slideContainer = document.getElementById('story-slide');
  const captionLabel = document.getElementById('story-caption');
  const prevBtn = document.getElementById('story-tap-prev');
  const nextBtn = document.getElementById('story-tap-next');

  if (!trigger || !modal) return;

  let currentIndex = 0;
  let timer = null;
  const STORY_DURATION = 4500;

  // Build 12 segmented bars
  barsContainer.innerHTML = '';
  STORIES_DATA.forEach((_, idx) => {
    const bar = document.createElement('div');
    bar.className = 'story-bar';
    const inner = document.createElement('div');
    inner.className = 'story-bar__inner';
    inner.id = `story-bar-${idx}`;
    bar.appendChild(inner);
    barsContainer.appendChild(bar);
  });

  function renderSlide(index) {
    currentIndex = index;
    const data = STORIES_DATA[index];

    timeLabel.textContent = `Khoảnh khắc #${data.id} / ${STORIES_DATA.length}`;
    slideContainer.style.background = data.bg;
    slideContainer.innerHTML = `
      <div class="story-slide__num">${data.date}</div>
      <div class="story-slide__icon">${data.icon}</div>
      <h3 class="story-slide__title">${data.title}</h3>
    `;
    captionLabel.textContent = data.caption;

    STORIES_DATA.forEach((_, idx) => {
      const barInner = document.getElementById(`story-bar-${idx}`);
      if (!barInner) return;
      barInner.style.transition = 'none';
      if (idx < index) {
        barInner.style.width = '100%';
      } else if (idx > index) {
        barInner.style.width = '0%';
      } else {
        barInner.style.width = '0%';
        void barInner.offsetWidth;
        barInner.style.transition = `width ${STORY_DURATION}ms linear`;
        barInner.style.width = '100%';
      }
    });

    startTimer();
  }

  function nextSlide() {
    if (currentIndex < STORIES_DATA.length - 1) {
      renderSlide(currentIndex + 1);
    } else {
      closeModal();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      renderSlide(currentIndex - 1);
    } else {
      renderSlide(0);
    }
  }

  function startTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      nextSlide();
    }, STORY_DURATION);
  }

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    renderSlide(0);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    clearTimeout(timer);
  }

  trigger.addEventListener('click', openModal);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextSlide();
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevSlide();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
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
    initStoriesModal();
    initScheduleFlip();
    initRSVP();
  });
});
