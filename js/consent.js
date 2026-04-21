/* Cookie Consent Banner + Google Consent Mode v2 */
(function() {
  var CONSENT_KEY = 'ypt_cookie_consent';
  var GA_ID = 'G-PP61NP5NN7';
  var stored = localStorage.getItem(CONSENT_KEY);

  function grantConsent() {
    gtag('consent', 'update', { 'analytics_storage': 'granted' });
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
      banner.style.display = 'none';
      banner.remove();
    }
  }

  if (stored === 'granted') { grantConsent(); return; }
  if (stored === 'denied') { return; }

  // No stored preference — show the banner
  var banner = document.getElementById('cookie-consent');
  if (!banner) return;

  // Show it
  banner.style.display = 'flex';

  banner.querySelector('#consent-accept').addEventListener('click', function() {
    localStorage.setItem(CONSENT_KEY, 'granted');
    grantConsent();
    dismissBanner();
  });

  banner.querySelector('#consent-reject').addEventListener('click', function() {
    localStorage.setItem(CONSENT_KEY, 'denied');
    dismissBanner();
  });
})();
