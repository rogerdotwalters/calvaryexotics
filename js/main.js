/**
 * Calvary Exotics — main.js
 * Handles: sticky nav, mobile menu, slideshow, contact form, scroll animations
 */

'use strict';

/* =========================================
   UTILITY
   ========================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =========================================
   FOOTER YEAR
   ========================================= */
const yearEl = $('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================
   STICKY HEADER
   ========================================= */
const header = $('#site-header');

function updateHeader() {
  if (!header) return;
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* =========================================
   MOBILE NAV TOGGLE
   ========================================= */
const navToggle = $('#nav-toggle');
const navLinks  = $('#nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  $$('.nav-link, .nav-cta', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });
}

/* =========================================
   ANIMAL SLIDESHOW
   ========================================= */
(function initSlideshow() {
  const track     = $('#slides-track');
  const dotsWrap  = $('#slide-dots');
  const prevBtn   = $('#slide-prev');
  const nextBtn   = $('#slide-next');

  if (!track) return;

  const slides    = $$('.slide', track);
  const dots      = $$('.dot-btn', dotsWrap);
  let current     = 0;
  let autoTimer   = null;
  const AUTO_MS   = 5000;

  function goTo(index) {
    // Wrap index
    index = (index + slides.length) % slides.length;

    // Update slides
    slides[current].classList.remove('active');
    slides[index].classList.add('active');

    // Update dots
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    dots[index].classList.add('active');
    dots[index].setAttribute('aria-selected', 'true');

    current = index;
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(current + 1), AUTO_MS);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Arrow buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  }

  // Dot buttons
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Keyboard navigation (left/right when focused inside slideshow)
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); stopAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); }
  });

  // Touch / swipe support
  let touchStartX = 0;
  const wrapper = $('.slideshow-wrapper') || track;

  wrapper.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  wrapper.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return; // ignore tiny swipes
    if (dx < 0) { goTo(current + 1); startAuto(); }
    else         { goTo(current - 1); startAuto(); }
  }, { passive: true });

  // Pause on hover
  wrapper.addEventListener('mouseenter', stopAuto);
  wrapper.addEventListener('mouseleave', startAuto);

  // Start
  startAuto();
})();

/* =========================================
   CONTACT FORM
   ========================================= */
(function initContactForm() {
  const form       = $('#contact-form');
  const submitBtn  = $('#form-submit');
  const submitText = $('#submit-text');
  const submitLoad = $('#submit-loading');
  const feedback   = $('#form-feedback');

  if (!form) return;

  function showFeedback(message, type) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className   = `form-feedback ${type}`;
    feedback.removeAttribute('hidden');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setLoading(loading) {
    if (!submitBtn || !submitText || !submitLoad) return;
    submitBtn.disabled = loading;
    submitText.hidden  = loading;
    submitLoad.hidden  = !loading;
  }

  function validateForm(data) {
    const errors = [];
    if (!data.get('name')?.trim())    errors.push('Please enter your name.');
    if (!data.get('email')?.trim())   errors.push('Please enter your email address.');
    if (!/\S+@\S+\.\S+/.test(data.get('email') || '')) errors.push('Please enter a valid email address.');
    if (!data.get('message')?.trim()) errors.push('Please include a message.');
    return errors;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const errors = validateForm(data);

    if (errors.length) {
      showFeedback(errors[0], 'error');
      return;
    }

    setLoading(true);
    if (feedback) feedback.setAttribute('hidden', '');

    try {
      /**
       * TODO: Replace this block with your actual form submission.
       *
       * Option A — Formspree (free tier):
       *   1. Sign up at https://formspree.io
       *   2. Create a new form and copy your endpoint
       *   3. Replace the fetch URL below with your endpoint
       *
       * Option B — EmailJS:
       *   Use emailjs.send() with your service/template IDs.
       *
       * Option C — Your own backend:
       *   POST to your API route.
       */

      // ---- SIMULATED SUBMISSION (remove when wiring up real endpoint) ----
      await new Promise(resolve => setTimeout(resolve, 1200));
      // ---- END SIMULATION ----

      // Example real submission with Formspree:
      // const res = await fetch('https://formspree.io/f/YOUR_ID', {
      //   method: 'POST',
      //   body: data,
      //   headers: { 'Accept': 'application/json' }
      // });
      // if (!res.ok) throw new Error('Server error');

      form.reset();
      showFeedback('✓ Message sent! We\'ll be in touch within 24 hours.', 'success');
    } catch (err) {
      console.error('Form submission error:', err);
      showFeedback('Something went wrong. Please try emailing us directly.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();

/* =========================================
   SCROLL-REVEAL ANIMATIONS
   (Lightweight — no library needed)
   ========================================= */
(function initScrollReveal() {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealSelectors = [
    '.about-grid',
    '.review-card',
    '.contact-grid',
    '.slide',
  ];

  const style = document.createElement('style');
  style.textContent = `
    .reveal-pending {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                  transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .reveal-pending.revealed {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  const targets = document.querySelectorAll(revealSelectors.join(', '));
  targets.forEach(el => el.classList.add('reveal-pending'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...(entry.target.parentElement?.children || [])];
        const idx = siblings.indexOf(entry.target);
        const delay = idx * 80;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

/* =========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   (Fallback for browsers that don't respect CSS scroll-behavior)
   ========================================= */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerH = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
