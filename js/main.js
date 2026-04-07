/* ============================================
   MARCO MEDIUM - Main JavaScript
   GSAP + Lenis Smooth Scroll + Animations
   ============================================ */

// --- Lenis Smooth Scroll ---
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // Sync with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// --- Modern Custom Cursor with Glow Trail ---
function initCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  if (!cursor || !cursorDot || window.innerWidth < 1024) return;

  let mx = 0, my = 0, cx = 0, cy = 0;
  let velX = 0, velY = 0;
  let isHovering = false;

  // Create trail particles
  const trailCount = 8;
  const trails = [];
  for (let i = 0; i < trailCount; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.cssText = `position:fixed;width:${6 - i * 0.5}px;height:${6 - i * 0.5}px;background:rgba(108,60,225,${0.3 - i * 0.03});border-radius:50%;pointer-events:none;z-index:99997;transition:none;`;
    document.body.appendChild(trail);
    trails.push({ el: trail, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    // Smooth follow with velocity
    const prevCx = cx, prevCy = cy;
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    velX = cx - prevCx;
    velY = cy - prevCy;
    const speed = Math.sqrt(velX * velX + velY * velY);

    // Morph cursor based on speed
    const stretch = Math.min(speed * 0.8, 15);
    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    const scaleX = 1 + stretch * 0.02;
    const scaleY = 1 - stretch * 0.015;

    if (!isHovering) {
      cursor.style.transform = `translate(${cx - 20}px, ${cy - 20}px) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
    } else {
      cursor.style.transform = `translate(${cx - 30}px, ${cy - 30}px)`;
    }

    // Dot follows precisely
    gsap.to(cursorDot, { x: mx - 3, y: my - 3, duration: 0.08, ease: 'power2.out' });

    // Cursor glow intensity based on speed
    const glowIntensity = Math.min(speed * 2, 30);
    cursorDot.style.boxShadow = `0 0 ${10 + glowIntensity}px rgba(108,60,225,${0.4 + speed * 0.02}), 0 0 ${20 + glowIntensity * 2}px rgba(108,60,225,${0.15 + speed * 0.01})`;

    // Trail particles follow with increasing delay
    trails.forEach((t, i) => {
      const delay = (i + 1) * 0.06;
      t.x += (mx - t.x) * (0.15 - i * 0.012);
      t.y += (my - t.y) * (0.15 - i * 0.012);
      t.el.style.transform = `translate(${t.x - 3}px, ${t.y - 3}px)`;
      t.el.style.opacity = speed > 2 ? (0.5 - i * 0.05) : 0;
    });

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Enhanced hover effects
  document.querySelectorAll('a, button, .card, .magnetic, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => {
      isHovering = true;
      cursor.classList.add('cursor-hover');
      cursorDot.classList.add('cursor-hover');
      gsap.to(cursor, { width: 60, height: 60, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      isHovering = false;
      cursor.classList.remove('cursor-hover');
      cursorDot.classList.remove('cursor-hover');
      gsap.to(cursor, { width: 40, height: 40, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // Click effect
  document.addEventListener('mousedown', () => {
    gsap.to(cursor, { scale: 0.8, duration: 0.15, ease: 'power2.in' });
    gsap.to(cursorDot, { scale: 0.5, duration: 0.15 });
  });
  document.addEventListener('mouseup', () => {
    gsap.to(cursor, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    gsap.to(cursorDot, { scale: 1, duration: 0.3 });
  });
}

// --- Magnetic Buttons ---
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

// --- Navbar Scroll ---
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.scroll() > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });

  // Hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// --- Text Split Animation ---
function splitText(el) {
  const text = el.textContent;
  el.innerHTML = '';
  el.setAttribute('aria-label', text);
  const words = text.split(' ');
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.overflow = 'hidden';
    word.split('').forEach(char => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.style.display = 'inline-block';
      charSpan.style.transform = 'translateY(110%)';
      charSpan.classList.add('split-char');
      wordSpan.appendChild(charSpan);
    });
    el.appendChild(wordSpan);
    if (wi < words.length - 1) {
      const space = document.createElement('span');
      space.innerHTML = '&nbsp;';
      space.style.display = 'inline-block';
      el.appendChild(space);
    }
  });
}

function initTextAnimations() {
  // Hero title split animation
  document.querySelectorAll('.split-animate').forEach(el => {
    splitText(el);
    const chars = el.querySelectorAll('.split-char');
    gsap.to(chars, {
      y: 0,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power3.out',
      delay: 0.3,
    });
  });

  // Scroll-triggered text reveals
  document.querySelectorAll('.text-reveal').forEach(el => {
    splitText(el);
    const chars = el.querySelectorAll('.split-char');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(chars, {
          y: 0,
          duration: 0.7,
          stagger: 0.015,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  });
}

// --- Scroll Reveal Animations ---
function initScrollReveal() {
  // Fade up elements
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });

  // Fade left
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -60 },
      {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // Fade right
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 60 },
      {
        opacity: 1, x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // Scale in
  gsap.utils.toArray('.reveal-scale').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.85 },
      {
        opacity: 1, scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // Staggered children
  gsap.utils.toArray('.stagger-children').forEach(parent => {
    const children = parent.children;
    gsap.fromTo(children,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
      }
    );
  });
}

// --- Parallax Effects ---
function initParallax() {
  gsap.utils.toArray('.parallax').forEach(el => {
    const speed = el.dataset.speed || 0.3;
    gsap.to(el, {
      yPercent: -30 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });

  // Parallax for hero section background elements
  gsap.utils.toArray('.hero-parallax').forEach(el => {
    gsap.to(el, {
      y: -100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  });
}

// --- Image Reveal (clip-path) ---
function initImageReveals() {
  gsap.utils.toArray('.img-reveal').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      }
    );
  });

  // Image zoom on scroll
  gsap.utils.toArray('.img-zoom').forEach(el => {
    gsap.fromTo(el.querySelector('img, .hero-placeholder'),
      { scale: 1.3 },
      {
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      }
    );
  });
}

// --- Horizontal Marquee ---
function initMarquee() {
  const tracks = document.querySelectorAll('.trust-track');
  tracks.forEach(track => {
    // Clone for seamless loop
    const clone = track.innerHTML;
    track.innerHTML += clone;
  });
}

// --- Counter Animation ---
function initCounters() {
  gsap.utils.toArray('.counter').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = prefix + Math.round(this.targets()[0].val).toLocaleString('fr-CH') + suffix;
          }
        });
      }
    });
  });
}

// --- Card 3D Tilt ---
function initCardTilt() {
  if (window.innerWidth < 1024) return;
  document.querySelectorAll('.card-tilt').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 10,
        rotateX: -y * 10,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

// --- Gradient Orb Animation ---
function initOrbs() {
  gsap.utils.toArray('.animated-orb').forEach((orb, i) => {
    gsap.to(orb, {
      x: `random(-100, 100)`,
      y: `random(-80, 80)`,
      scale: `random(0.8, 1.3)`,
      duration: `random(4, 8)`,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.5,
    });
  });
}

// --- Page Loader ---
function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  try {
    const tl = gsap.timeline();
    tl.to('.loader-progress', {
      scaleX: 1,
      duration: 0.8,
      ease: 'power2.inOut',
    })
    .to(loader, {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
      delay: 0.1,
    })
    .set(loader, { display: 'none' });
  } catch(e) {
    loader.style.display = 'none';
  }
}
// Fallback: always hide loader after 3s even if JS fails
setTimeout(function(){ var l=document.querySelector('.page-loader'); if(l) l.style.display='none'; }, 3000);

// --- Hero Section Animation Timeline ---
function initHeroAnimation() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const tl = gsap.timeline({ delay: 0.8 });

  tl.fromTo('.hero-badge',
    { opacity: 0, y: 20, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
  )
  .fromTo('.hero-desc',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
    '-=0.2'
  )
  .fromTo('.hero-actions .btn',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
    '-=0.3'
  )
  .fromTo('.hero-stats .hero-stat-item',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
    '-=0.3'
  )
  .fromTo('.hero-visual',
    { opacity: 0, x: 60, scale: 0.95 },
    { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out' },
    '-=0.6'
  )
  .fromTo('.float-card',
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
    '-=0.4'
  );
}

// --- CTA Banner Gradient Animation ---
function initGradientAnimation() {
  document.querySelectorAll('.animated-gradient').forEach(el => {
    gsap.to(el, {
      backgroundPosition: '200% center',
      duration: 3,
      ease: 'none',
      repeat: -1,
    });
  });
}

// --- Smooth Anchor Scroll ---
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target && lenis) {
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}

// --- Cookie Banner ---
function initCookieBanner() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('cookies_accepted')) {
    banner.remove();
    return;
  }
  setTimeout(() => banner.classList.add('show'), 2000);
  banner.querySelector('.cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem('cookies_accepted', 'true');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
  });
}

// --- Phone number formatting on click ---
function initPhoneClick() {
  document.querySelectorAll('.phone-link').forEach(el => {
    el.addEventListener('click', (e) => {
      // Track phone click if gtag exists
      if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
          send_to: 'AW-XXXXXXXXX/XXXXX',
          event_callback: function() {}
        });
      }
    });
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  initLenis();
  initLoader();
  initNavbar();
  initCursor();
  initMagnetic();
  initTextAnimations();
  initScrollReveal();
  initParallax();
  initImageReveals();
  initMarquee();
  initCounters();
  initCardTilt();
  initOrbs();
  initHeroAnimation();
  initGradientAnimation();
  initSmoothAnchors();
  initCookieBanner();
  initPhoneClick();
});

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});
