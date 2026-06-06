/* ============================================
   IRONFORGE FITNESS — script.js
   ============================================ */

'use strict';

/* ---- LOADER ---- */
window.addEventListener('load', () => {
  document.body.classList.add('loading');
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    initRevealOnLoad();
  }, 1200);
});

/* ---- NAVBAR ---- */
const navbar  = document.getElementById('navbar');
const burger  = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
}, { passive: true });

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ---- SMOOTH SCROLL for all anchors ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- REVEAL ON SCROLL ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || (Array.from(el.parentElement.children).indexOf(el) * 100);
      setTimeout(() => el.classList.add('visible'), parseInt(delay));
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function initRevealOnLoad() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ---- ANIMATED COUNTERS ---- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

/* ---- BILLING TOGGLE ---- */
const billingToggle  = document.getElementById('billingToggle');
const toggleMonthly  = document.getElementById('toggleMonthly');
const toggleAnnual   = document.getElementById('toggleAnnual');
let isAnnual = false;

function updatePrices() {
  document.querySelectorAll('.price-val').forEach(el => {
    const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
    el.textContent = val;
  });
}

billingToggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  billingToggle.classList.toggle('annual', isAnnual);
  billingToggle.setAttribute('aria-checked', String(isAnnual));
  toggleMonthly.classList.toggle('active', !isAnnual);
  toggleAnnual.classList.toggle('active', isAnnual);
  updatePrices();
});

billingToggle.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); billingToggle.click(); }
});

/* ---- BMI CALCULATOR ---- */
let currentUnit = 'metric';

document.querySelectorAll('.unit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentUnit = btn.dataset.unit;
    document.getElementById('metricFields').style.display = currentUnit === 'metric' ? 'block' : 'none';
    document.getElementById('imperialFields').style.display = currentUnit === 'imperial' ? 'block' : 'none';
    resetBMI();
  });
});

document.getElementById('calcBMI').addEventListener('click', calculateBMI);

// Allow Enter key to trigger calculation
['heightCm','weightKg','heightFt','heightIn','weightLbs'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') calculateBMI(); });
});

function calculateBMI() {
  let heightM, weightKg;

  if (currentUnit === 'metric') {
    const h = parseFloat(document.getElementById('heightCm').value);
    const w = parseFloat(document.getElementById('weightKg').value);
    if (!h || !w || h < 50 || h > 300 || w < 10 || w > 500) { showBMIError(); return; }
    heightM = h / 100;
    weightKg = w;
  } else {
    const ft = parseFloat(document.getElementById('heightFt').value) || 0;
    const inch = parseFloat(document.getElementById('heightIn').value) || 0;
    const lbs = parseFloat(document.getElementById('weightLbs').value);
    if (!lbs || (ft === 0 && inch === 0)) { showBMIError(); return; }
    heightM = (ft * 12 + inch) * 0.0254;
    weightKg = lbs * 0.453592;
  }

  const bmi = weightKg / (heightM * heightM);
  displayBMI(bmi);
}

function displayBMI(bmi) {
  const rounded = Math.round(bmi * 10) / 10;
  const result = document.getElementById('bmiResult');
  const valueEl = document.getElementById('bmiValue');
  const labelEl = document.getElementById('bmiLabel');
  const adviceEl = document.getElementById('bmiAdvice');
  const ring     = document.getElementById('bmiRing');

  let category, color, advice;
  if (bmi < 18.5) {
    category = 'Underweight'; color = '#3b82f6';
    advice = 'Consider our Muscle Building or Personal Training program to help you reach a healthy weight.';
  } else if (bmi < 25) {
    category = 'Normal'; color = '#00FFB2';
    advice = 'Great shape! Our Strength or Muscle Building programs can help you optimize further.';
  } else if (bmi < 30) {
    category = 'Overweight'; color = '#FFD700';
    advice = 'Our Fat Loss program with nutrition coaching can help you get back to a healthy range.';
  } else {
    category = 'Obese'; color = '#FF6B35';
    advice = 'We recommend starting with our Personal Training program for a safe, guided journey.';
  }

  valueEl.textContent = rounded;
  labelEl.textContent = category;
  labelEl.style.color = color;
  adviceEl.textContent = advice;

  // Ring progress: map BMI 10–40 to 0–100% of circumference (314)
  const percent = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const dashoffset = 314 - (314 * percent);
  ring.style.strokeDashoffset = dashoffset;
  ring.style.stroke = color;
  valueEl.parentElement.parentElement.querySelector('.bmi__result-val strong').style.color = color;

  result.classList.add('show');
}

function resetBMI() {
  const result = document.getElementById('bmiResult');
  result.classList.remove('show');
  document.getElementById('bmiValue').textContent = '—';
  document.getElementById('bmiLabel').textContent = 'Enter values';
  document.getElementById('bmiAdvice').textContent = '';
  document.getElementById('bmiRing').style.strokeDashoffset = 314;
}

function showBMIError() {
  const result = document.getElementById('bmiResult');
  document.getElementById('bmiValue').textContent = '!';
  document.getElementById('bmiLabel').textContent = 'Invalid input';
  document.getElementById('bmiAdvice').textContent = 'Please enter valid height and weight values.';
  result.classList.add('show');
}

/* ---- TESTIMONIALS SLIDER ---- */
(function initTestimonials() {
  const track   = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.tcard'));
  let current = 0;
  let autoTimer;
  let touchStartX = 0;

  function getVisible() {
    return window.innerWidth <= 900 ? 1 : 3;
  }

  function totalSlides() {
    return Math.ceil(cards.length / getVisible());
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    dotsWrap.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = (index + totalSlides()) % totalSlides();
    const visible = getVisible();
    const gap = 24;
    const cardWidth = track.parentElement.offsetWidth / visible - gap * (visible - 1) / visible;
    const translateX = current * (cardWidth + gap) * visible;
    track.style.transform = `translateX(-${translateX}px)`;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';

    cards.forEach((c, i) => {
      const inRange = i >= current * visible && i < (current + 1) * visible;
      c.classList.toggle('active', inRange);
    });

    updateDots();
  }

  function next() { goTo(current + 1); }

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto() { clearInterval(autoTimer); }

  // Touch support
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : goTo(current - 1);
    startAuto();
  });

  // Pause on hover
  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);

  // Init
  track.style.display = 'flex';
  buildDots();
  cards[0]?.classList.add('active');
  startAuto();

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });
})();

/* ---- CONTACT FORM ---- */
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const success = document.getElementById('formSuccess');

  btn.textContent = 'Sending…';
  btn.disabled = true;

  // Simulate async send
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.disabled = false;
    success.classList.add('show');
    this.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  }, 1400);
});

/* ---- HERO PARALLAX (subtle) ---- */
const heroGrid = document.querySelector('.hero__grid');
if (heroGrid) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroGrid.style.transform = `translateY(${y * 0.2}px)`;
  }, { passive: true });
}

/* ---- PROGRAM CARDS stagger ---- */
document.querySelectorAll('.programs__grid .program-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

document.querySelectorAll('.trainers__grid .trainer-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 80}ms`;
});

document.querySelectorAll('.gallery__grid .transform-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 60}ms`;
});

/* ---- ACTIVE NAV LINK on scroll ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.navbar__links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active-nav'));
        const match = document.querySelector(`.navbar__links a[href="#${entry.target.id}"]`);
        if (match) match.classList.add('active-nav');
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* Style active nav link */
const activeStyle = document.createElement('style');
activeStyle.textContent = `.navbar__links a.active-nav { color: var(--neon) !important; }`;
document.head.appendChild(activeStyle);
