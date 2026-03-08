document.addEventListener('DOMContentLoaded', function() {

  // ── WPBakery Full-Width Row Handler ──
  // Replicates WPBakery's JS that stretches rows with data-vc-full-width="true"
  function vcStretchRows() {
    var rows = document.querySelectorAll('[data-vc-full-width="true"]');
    var viewWidth = document.documentElement.clientWidth;
    rows.forEach(function(row) {
      // Reset positioning first to measure natural position
      row.style.left = '';
      row.style.width = '';
      row.style.paddingLeft = '';
      row.style.paddingRight = '';
      row.style.position = 'relative';
      row.style.boxSizing = 'border-box';

      var rowRect = row.getBoundingClientRect();
      var offset = rowRect.left;

      row.style.left = -offset + 'px';
      row.style.width = viewWidth + 'px';

      // For rows that need content to stay within container width
      if (row.getAttribute('data-vc-full-width-init') === 'true') {
        row.style.paddingLeft = offset + 'px';
        row.style.paddingRight = offset + 'px';
      }
    });
  }

  // Also stretch the slider element
  function stretchSlider() {
    var slider = document.querySelector('.wpb_revslider_element');
    if (!slider) return;
    // Reset first to get natural position
    slider.style.left = '0';
    slider.style.position = 'relative';
    var sliderRect = slider.getBoundingClientRect();
    var viewWidth = document.documentElement.clientWidth;
    slider.style.left = -sliderRect.left + 'px';
    slider.style.width = viewWidth + 'px';
    slider.style.boxSizing = 'border-box';
  }

  vcStretchRows();
  stretchSlider();
  window.addEventListener('resize', function() {
    vcStretchRows();
    stretchSlider();
  });

  // ── Navbar shrink on scroll ──
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    function checkScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-shrink');
      } else {
        navbar.classList.remove('navbar-shrink');
      }
    }
    window.addEventListener('scroll', checkScroll);
    checkScroll();
  }

  // ── Mobile menu toggle (Bootstrap 3 collapse) ──
  var toggleBtn = document.querySelector('.navbar-toggle');
  var mainMenu = document.querySelector('#main-menu');
  if (toggleBtn && mainMenu) {
    toggleBtn.addEventListener('click', function() {
      mainMenu.classList.toggle('in');
    });
  }

  // ── Hero Slider ──
  var slides = document.querySelectorAll('.rev-slide');
  var bullets = document.querySelectorAll('.slider-bullet');
  var currentSlide = 0;
  var slideCount = slides.length;
  var autoplayInterval;
  var isTransitioning = false;

  // Stack all slides; background images crossfade, text animates separately
  slides.forEach(function(slide, i) {
    slide.style.position = 'absolute';
    slide.style.top = '0';
    slide.style.left = '0';
    slide.style.width = '100%';
    slide.style.height = '100%';
    slide.style.display = 'block';

    var bg = slide.querySelector('.rev-slide-bg');
    var content = slide.querySelector('.rev-slide-content');

    if (bg) {
      bg.style.transition = 'opacity 1s ease';
      bg.style.opacity = i === 0 ? '1' : '0';
    }
    if (content) {
      content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      content.style.opacity = i === 0 ? '1' : '0';
      content.style.transform = i === 0 ? 'translateY(0)' : 'translateY(20px)';
    }

    slide.style.zIndex = i === 0 ? '2' : '1';
  });

  function goToSlide(index) {
    if (isTransitioning || index === currentSlide) return;
    isTransitioning = true;

    var oldSlide = slides[currentSlide];
    var newSlide = slides[index];
    var oldContent = oldSlide.querySelector('.rev-slide-content');
    var newContent = newSlide.querySelector('.rev-slide-content');
    var newBg = newSlide.querySelector('.rev-slide-bg');

    // Step 1: Fade out current text quickly
    if (oldContent) {
      oldContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      oldContent.style.opacity = '0';
      oldContent.style.transform = 'translateY(-20px)';
    }

    // Step 2: After text fades, bring new slide on top with bg at 0, then fade bg IN
    // Old slide stays fully visible underneath — no white flash
    setTimeout(function() {
      // Prep new slide: bg invisible, text invisible, on top
      if (newBg) {
        newBg.style.transition = 'none';
        newBg.style.opacity = '0';
      }
      if (newContent) {
        newContent.style.transition = 'none';
        newContent.style.opacity = '0';
        newContent.style.transform = 'translateY(20px)';
      }
      newSlide.style.zIndex = '3';

      // Force reflow so transition:none takes effect
      void newSlide.offsetWidth;

      // Fade in the new background over the old (old stays visible at z-index 2)
      if (newBg) {
        newBg.style.transition = 'opacity 1s ease';
        newBg.style.opacity = '1';
      }

      // Fade in new text with slight delay
      setTimeout(function() {
        if (newContent) {
          newContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          newContent.style.opacity = '1';
          newContent.style.transform = 'translateY(0)';
        }
      }, 400);

      // After transition completes, clean up z-indexes
      setTimeout(function() {
        oldSlide.style.zIndex = '1';
        newSlide.style.zIndex = '2';
        oldSlide.classList.remove('active');
        newSlide.classList.add('active');
        currentSlide = index;
        isTransitioning = false;
      }, 1100);
    }, 300);

    // Update bullets immediately
    bullets.forEach(function(b, i) {
      if (i === index) {
        b.classList.add('active');
        b.style.background = '#fff';
      } else {
        b.classList.remove('active');
        b.style.background = 'rgba(255,255,255,0.6)';
      }
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slideCount);
  }

  function prevSlide() {
    goToSlide((currentSlide - 1 + slideCount) % slideCount);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 8000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Arrow click handlers
  var leftArrow = document.querySelector('.slider-arrow-left');
  var rightArrow = document.querySelector('.slider-arrow-right');
  if (leftArrow) leftArrow.addEventListener('click', function() { prevSlide(); resetAutoplay(); });
  if (rightArrow) rightArrow.addEventListener('click', function() { nextSlide(); resetAutoplay(); });

  // Bullet click handlers
  bullets.forEach(function(bullet, index) {
    bullet.addEventListener('click', function() {
      goToSlide(index);
      resetAutoplay();
    });
  });

  // Touch/swipe support for mobile
  var sliderEl = document.getElementById('hero-slider');
  if (sliderEl) {
    var touchStartX = 0;
    var touchStartY = 0;
    var swiping = false;

    sliderEl.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });

    sliderEl.addEventListener('touchmove', function(e) {
      if (!swiping) return;
      // If vertical scroll is greater than horizontal, let it scroll normally
      var dx = Math.abs(e.touches[0].clientX - touchStartX);
      var dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dy > dx) {
        swiping = false;
      }
    }, { passive: true });

    sliderEl.addEventListener('touchend', function(e) {
      if (!swiping) return;
      swiping = false;
      var touchEndX = e.changedTouches[0].clientX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) { nextSlide(); } else { prevSlide(); }
        resetAutoplay();
      }
    }, { passive: true });
  }

  if (slideCount > 1) {
    startAutoplay();
  }

  // ── Custom smooth scroll with easing (matches WP site speed) ──
  function smoothScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var diff = targetY - startY;
    var startTime = null;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutCubic(progress);
      window.scrollTo(0, startY + diff * easedProgress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ── Feature tabs scroll (click to scroll to section) ──
  var tabLinks = document.querySelectorAll('.feature-tabs-scroll');
  var tabLabels = document.querySelectorAll('.sticky-tabs .nav-label');
  tabLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);
      if (target) {
        var stickyTabsEl = document.querySelector('.feature-sections-tabs');
        var tabsHeight = stickyTabsEl ? stickyTabsEl.offsetHeight : 0;
        var navHeight = navbar ? navbar.offsetHeight : 0;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - tabsHeight - 10;
        smoothScrollTo(targetPos, 1000);
      }
    });
  });

  // ── Scroll spy for active tab highlighting + hide tabs past last section ──
  var featureSections = document.querySelectorAll('.feature-sections-wrapper > section[id]');
  var stickyTabsEl = document.querySelector('.feature-sections-tabs');
  function updateActiveTab() {
    if (!featureSections.length || !tabLabels.length || !stickyTabsEl) return;
    var navHeight = navbar ? navbar.offsetHeight : 0;
    var tabsHeight = stickyTabsEl.offsetHeight;
    var scrollPos = window.scrollY + navHeight + tabsHeight + 20;

    var activeIndex = -1;
    featureSections.forEach(function(section, i) {
      var sectionTop = section.getBoundingClientRect().top + window.scrollY;
      var sectionBottom = sectionTop + section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        activeIndex = i;
      }
    });

    // Hide tabs when the content after the feature sections scrolls into view
    var lastSection = featureSections[featureSections.length - 1];
    var lastBottom = lastSection.getBoundingClientRect().bottom;
    var hideThreshold = window.innerHeight * 0.65;
    if (lastBottom < hideThreshold) {
      stickyTabsEl.style.opacity = '0';
      stickyTabsEl.style.pointerEvents = 'none';
    } else {
      stickyTabsEl.style.opacity = '1';
      stickyTabsEl.style.pointerEvents = '';
    }

    tabLabels.forEach(function(label, i) {
      if (i === activeIndex) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveTab);
  updateActiveTab();

  // ── Form timestamp (spam prevention) ──
  var timestampField = document.getElementById('form-timestamp');
  if (timestampField) {
    timestampField.value = Date.now();
  }

  // ── Contact form submission ──
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.target;
      var data = Object.fromEntries(new FormData(form));

      // Client-side honeypot check
      if (data._honeypot) return;

      var btn = form.querySelector('button[type="submit"], input[type="submit"]');
      var originalText = btn.value || btn.textContent;
      btn.disabled = true;
      if (btn.tagName === 'INPUT') btn.value = 'Sending...';
      else btn.textContent = 'Sending...';

      // For now, show success (Worker URL to be configured)
      setTimeout(function() {
        form.reset();
        var msg = document.getElementById('form-success');
        if (msg) {
          msg.classList.remove('hidden');
          msg.style.display = 'block';
          msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        btn.disabled = false;
        if (btn.tagName === 'INPUT') btn.value = originalText;
        else btn.textContent = originalText;
        // Clean URL params
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }, 1000);
    });
  }

  // ── Inline form (top of page) ──
  var inlineForm = document.getElementById('inline-contact-form');
  if (inlineForm) {
    inlineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var form = e.target;
      var data = Object.fromEntries(new FormData(form));
      var btn = form.querySelector('input[type="submit"]');
      var originalText = btn.value;
      btn.disabled = true;
      btn.value = 'Sending...';

      setTimeout(function() {
        form.reset();
        btn.disabled = false;
        btn.value = originalText;
        alert('Thank you! We will be in touch shortly.');
      }, 1000);
    });
  }

});
