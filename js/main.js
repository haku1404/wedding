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

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const content = lightbox.querySelector('.lightbox__content');
  const closeBtn = lightbox.querySelector('.lightbox__close');

  document.querySelectorAll('.gallery__item').forEach((item) => {
    item.addEventListener('click', () => {
      content.textContent = item.dataset.full;
      lightbox.hidden = false;
    });
  });

  closeBtn.addEventListener('click', () => {
    lightbox.hidden = true;
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.hidden = true;
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
    initLightbox();
    initScheduleFlip();
    initRSVP();
  });
});
