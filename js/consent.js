/* Cookie Consent Banner + Google Consent Mode v2 */
(function() {
  var CONSENT_KEY = 'ypt_cookie_consent';
  var GA_ID = 'G-PP61NP5NN7';

  // Check stored consent
  var stored = localStorage.getItem(CONSENT_KEY);

  function grantConsent() {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
    // Load GA4 script dynamically
    if (!document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
    }
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function dismissBanner() {
    var banner = document.getElementById('cookie-consent');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(function() { banner.remove(); }, 300);
    }
  }

  // If already consented, grant immediately and don't show banner
  if (stored === 'granted') {
    grantConsent();
    return;
  }

  // If already rejected, don't show banner
  if (stored === 'denied') {
    return;
  }

  // Show banner on DOMContentLoaded
  function showBanner() {
    var banner = document.getElementById('cookie-consent');
    if (!banner) return;

    // Animate in after a brief delay
    setTimeout(function() {
      banner.style.transform = 'translateY(0)';
    }, 500);

    // Accept button
    var acceptBtn = document.getElementById('consent-accept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function() {
        localStorage.setItem(CONSENT_KEY, 'granted');
        grantConsent();
        dismissBanner();
      });
    }

    // Reject button
    var rejectBtn = document.getElementById('consent-reject');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', function() {
        localStorage.setItem(CONSENT_KEY, 'denied');
        dismissBanner();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
