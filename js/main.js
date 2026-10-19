/**
 * Calvary Exotics — main.js
 * Handles: sticky nav, mobile menu, contact form, scroll animations
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

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = $$('.nav-link');

  if (!header || navLinks.length === 0) return;

  function updateHeader() {
    const scrolled = window.scrollY > 20;
    header.classList.toggle('scrolled', scrolled);
    navLinks.forEach(link => link.classList.toggle('scrolled', scrolled));
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
});

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

  // Close on link click (the Shop dropdown toggle only opens its submenu)
  $$('.nav-link:not(.nav-dropdown-toggle), .nav-cta, .nav-sublink', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Shop dropdown: click toggles, click outside or Escape closes
  $$('.nav-dropdown').forEach(dd => {
    const toggle = $('.nav-dropdown-toggle', dd);
    toggle.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', e => {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dd.classList.contains('open')) {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
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
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showFeedback('✓ Message sent! We\'ll be in touch soon.', 'success');
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      showFeedback('Something went wrong. Please try emailing us directly.', 'error');
      setLoading(false);
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
