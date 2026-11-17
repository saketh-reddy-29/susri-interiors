/**
 * SUSRI INTERIORS - Alba & Co Motion & Design Interactions
 * High-performance smooth reveals, magnetic micro-interactions, hero slider & index drawer
 */
(function() {
  'use strict';

  function initAlbaMotion() {
    // 1. Intersection Observer for Scroll Reveals
    const revealElements = document.querySelectorAll(
      'section > div, h1, h2, [data-hero-label], .group\\/entry, .group\\/edition, [data-archive-card]'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.1
    });

    revealElements.forEach((el, i) => {
      if (!el.classList.contains('alba-fade-in') && !el.closest('header')) {
        el.classList.add('alba-fade-in');
        const delay = (i % 4) * 0.08;
        el.style.transitionDelay = delay + 's';
        observer.observe(el);
      }
    });

    // 2. Magnetic Micro-Interaction on Primary Buttons
    const magneticButtons = document.querySelectorAll(
      'button[type="submit"], a.inline-flex.items-center.justify-center.tecton-label, .group\\/mail'
    );

    magneticButtons.forEach((btn) => {
      btn.addEventListener('mousemove', function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18 - 2}px, 0)`;
      });

      btn.addEventListener('mouseleave', function() {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    // 3. Smooth Hero Reveal on Page Load
    const heroH1 = document.querySelector('h1.tecton-display');
    if (heroH1) {
      heroH1.style.opacity = '1';
      heroH1.style.transform = 'translateY(0)';
    }

    // 4. Subtle Parallax on Scroll for Hero & Featured Images
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const heroImgs = document.querySelectorAll('[data-hero-image="true"] img, .hero-parallax');
      
      heroImgs.forEach((img) => {
        const speed = 0.08;
        const yPos = scrollY * speed;
        img.style.transform = `translate3d(0, ${yPos}px, 0) scale(1.04)`;
      });

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // 5. Interactive Hero Slideshow
    const heroStrip = document.querySelector('[data-hero-strip="true"] > div');
    const heroSlides = document.querySelectorAll('[data-hero-slide="true"]');
    const heroDots = document.querySelectorAll('button.group\\/dot');

    if (heroStrip && heroSlides.length > 1 && heroDots.length > 0) {
      heroStrip.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
      let currentSlide = 0;
      let slideTimer = null;

      function goToSlide(idx) {
        currentSlide = (idx + heroSlides.length) % heroSlides.length;
        const targetSlide = heroSlides[currentSlide];
        const offsetLeft = targetSlide.offsetLeft;
        heroStrip.style.transform = `translate3d(-${offsetLeft}px, 0, 0)`;

        heroDots.forEach((dot, i) => {
          const bar = dot.querySelector('span:not(.sr-only)');
          if (i === currentSlide) {
            dot.setAttribute('aria-current', 'true');
            if (bar) {
              bar.className = 'block h-px w-10 bg-paper transition-all duration-700';
            }
          } else {
            dot.setAttribute('aria-current', 'false');
            if (bar) {
              bar.className = 'block h-px w-5 bg-paper/35 transition-all duration-700 group-hover/dot:bg-paper/70';
            }
          }
        });
      }

      heroDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          clearInterval(slideTimer);
          goToSlide(i);
          startAutoSlide();
        });
      });

      // Mobile Touch Gesture Support (Finger Swipe Left / Right)
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      const heroContainer = document.querySelector('[data-hero-strip="true"]') || heroStrip;

      heroContainer.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          clearInterval(slideTimer);
        }
      }, { passive: true });

      heroContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          // If horizontal swipe is dominant and exceeds 35px threshold
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
            if (diffX < 0) {
              goToSlide(currentSlide + 1); // Swipe left -> next slide
            } else {
              goToSlide(currentSlide - 1); // Swipe right -> prev slide
            }
          }
          startAutoSlide();
        }
      }, { passive: true });

      function startAutoSlide() {
        clearInterval(slideTimer);
        slideTimer = setInterval(() => {
          goToSlide(currentSlide + 1);
        }, 5500);
      }

      startAutoSlide();
    }

    // 6. Navigation Drawer / Architectural Split Menu (Desktop & Mobile Optimized)
    const menuButtons = document.querySelectorAll('button[aria-controls="site-index"]');
    let drawer = document.getElementById('site-index-drawer');

    if (!document.getElementById('susri-architectural-menu-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'susri-architectural-menu-styles';
      styleEl.textContent = `
        #site-index-drawer {
          position: fixed !important;
          inset: 0 !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 9999999 !important;
          background: #181613 !important;
          color: #f4f0ea !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          padding: clamp(1rem, 3.5vw, 3rem) !important;
          padding-top: max(1.2rem, env(safe-area-inset-top)) !important;
          padding-bottom: max(1.2rem, env(safe-area-inset-bottom)) !important;
          padding-left: max(1rem, env(safe-area-inset-left)) !important;
          padding-right: max(1rem, env(safe-area-inset-right)) !important;
          box-sizing: border-box !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s !important;
          transform: translateY(-6px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-y: contain !important;
        }
        #site-index-drawer.is-open {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
        #site-index-drawer nav,
        #site-index-drawer .susri-nav-wrap,
        #site-index-drawer .susri-col {
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .susri-hollow-link {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(1.4rem, 3.2vw, 3.2rem);
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          text-decoration: none;
          color: transparent;
          -webkit-text-stroke: 1.2px #f4f0ea;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0.7rem 0;
          border-bottom: 1px solid rgba(244, 240, 234, 0.15);
          background: transparent !important;
          touch-action: manipulation;
        }
        .susri-hollow-link:hover,
        .susri-hollow-link:active {
          color: #ffffff !important;
          -webkit-text-stroke: 0px !important;
          transform: translateX(6px);
        }
        .susri-social-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #f4f0ea;
          text-decoration: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          background: transparent !important;
          padding: 0.25rem 0;
          touch-action: manipulation;
        }
        .susri-social-link:hover,
        .susri-social-link:active {
          opacity: 0.7;
          transform: translateX(3px);
        }
        .menu-visual-card {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #25221c;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          border: 1px solid rgba(244, 240, 234, 0.12);
          display: block;
          text-decoration: none;
        }
        .menu-visual-card:hover,
        .menu-visual-card:active {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }
        .menu-visual-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: clamp(0.7rem, 1.1vw, 1rem);
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #111111;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(6px);
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
        }

        /* Mobile Phone Optimization (Screens <= 768px) */
        @media (max-width: 768px) {
          #site-index-drawer {
            padding: 1.25rem 1rem !important;
            padding-top: max(1.25rem, env(safe-area-inset-top)) !important;
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
          }
          .susri-menu-grid {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
            padding: 1.25rem 0 !important;
          }
          .susri-hollow-link {
            font-size: 1.45rem !important;
            padding: 0.65rem 0 !important;
            -webkit-text-stroke: 1px #f4f0ea !important;
          }
          .susri-cards-row {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .menu-visual-card {
            aspect-ratio: 1 / 1 !important;
          }
          .menu-visual-badge {
            bottom: 8px !important;
            left: 8px !important;
            font-size: 0.68rem !important;
            padding: 0.2rem 0.5rem !important;
          }
          .susri-social-bar {
            gap: 1rem !important;
            margin-top: 1.25rem !important;
          }
          .susri-social-link {
            font-size: 0.8rem !important;
          }
          .susri-mobile-contact-bar {
            display: flex !important;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1.25rem;
          }
          .susri-mobile-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-radius: 9999px;
            font-size: 0.78rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 600;
            text-decoration: none;
            width: 100%;
            box-sizing: border-box;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }

    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'site-index-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Site Navigation');

      drawer.innerHTML = `
        <!-- Top Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(244,240,234,0.15); padding-bottom: 1rem; width: 100%; background: transparent !important;">
          <div style="display: flex; align-items: center; gap: 0.65rem; background: transparent !important;">
            <img src="/images/susri-lotus-gold.png" alt="SUSRI Logo" style="height: 18px; width: auto; display: block;" />
            <span style="font-size: 0.82rem; letter-spacing: 0.22em; font-weight: 600; text-transform: uppercase; color: #f4f0ea;">SUSRI INTERIORS</span>
          </div>
          <button type="button" id="close-site-index" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.22); border-radius: 9999px; padding: 0.5rem 1.25rem; min-height: 40px; color: #f4f0ea; font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; display: inline-flex; align-items: center; gap: 0.45rem; cursor: pointer; transition: all 0.2s ease;">
            <span>Close</span>
            <svg style="width: 13px; height: 13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <!-- Main Body: Split Layout (Desktop Side-by-Side, Mobile Stacked) -->
        <div class="susri-menu-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(1.5rem, 5vw, 5rem); align-items: center; padding: clamp(1.25rem, 3.5vh, 2.5rem) 0; width: 100%; max-width: 1440px; margin: auto; background: transparent !important;">
          
          <!-- Left Column: Hollow Outline Nav Links -->
          <div class="susri-col" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; background: transparent !important;">
            <nav class="susri-nav-wrap" style="display: flex; flex-direction: column; background: transparent !important;">
              <a href="/#atelier-3d" class="susri-hollow-link">3D Atelier</a>
              <a href="/archive" class="susri-hollow-link">Projects</a>
              <a href="/about" class="susri-hollow-link">About &amp; Origins</a>
              <a href="/#disciplines" class="susri-hollow-link">Disciplines</a>
              <a href="/contact" class="susri-hollow-link">Contact</a>
            </nav>

            <!-- Social / Direct Channels -->
            <div class="susri-social-bar" style="display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: clamp(1.5rem, 3.5vh, 2.5rem); padding-top: 0.5rem; background: transparent !important;">
              <a href="https://wa.me/918143232177" target="_blank" rel="noopener noreferrer" class="susri-social-link">WhatsApp &rarr;</a>
              <a href="https://instagram.com/susri_constructions" target="_blank" rel="noopener noreferrer" class="susri-social-link">Instagram &rarr;</a>
              <a href="mailto:susri.co.0001@gmail.com" class="susri-social-link">Email &rarr;</a>
              <a href="tel:+918143232177" class="susri-social-link">+91 814 3232 177 &rarr;</a>
            </div>

            <!-- Mobile Action Buttons (Visible on Mobile) -->
            <div class="susri-mobile-contact-bar" style="display: none;">
              <a href="https://wa.me/918143232177" target="_blank" rel="noopener noreferrer" class="susri-mobile-btn" style="background: rgba(34, 197, 94, 0.16); border: 1px solid rgba(34, 197, 94, 0.45); color: #4ade80;">
                <span>💬 WhatsApp Us</span>
              </a>
              <a href="tel:+918143232177" class="susri-mobile-btn" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: #f4f0ea;">
                <span>📞 Call +91 814 3232 177</span>
              </a>
            </div>
          </div>

          <!-- Right Column: Visual Category Cards -->
          <div class="susri-cards-row susri-col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 600px; margin-left: auto; width: 100%; background: transparent !important;">
            
            <!-- Card 1: DESIGN (Luxury Living Room) -->
            <a href="/#atelier-3d" class="menu-visual-card" style="aspect-ratio: 4 / 5;">
              <img src="/images/camber-03.png" alt="Interior Architecture" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
              <span class="menu-visual-badge">Design</span>
            </a>

            <!-- Card 2: DESIGN + BUILD (Turnkey Luxury Villa Living Sanctuary) -->
            <a href="/#approach" class="menu-visual-card" style="aspect-ratio: 4 / 5;">
              <img src="/images/villa-forma-03.png" alt="Turnkey Residential Interior" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />
              <span class="menu-visual-badge">Design + Build</span>
            </a>

          </div>

        </div>

        <!-- Bottom Footer Bar -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; border-top: 1px solid rgba(244,240,234,0.15); padding-top: 1rem; font-size: 0.72rem; color: rgba(244,240,234,0.6); width: 100%; background: transparent !important;">
          <span>100% Vastu Consultation · Telangana, India</span>
          <span>© 2026 SUSRI CONSTRUCTIONS &amp; INTERIORS · Created by Saketh Reddy</span>
        </div>
      `;
      document.body.appendChild(drawer);

      const closeBtn = document.getElementById('close-site-index');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      }

      drawer.querySelectorAll('.susri-hollow-link, .menu-visual-card, .susri-mobile-btn').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      });

      // Close on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    }

    menuButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (drawer) {
          drawer.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAlbaMotion);
  } else {
    initAlbaMotion();
  }
})();
