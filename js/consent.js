/* Cookie Consent Banner + Google Consent Mode v2 */
(function() {
  var CONSENT_KEY = 'ypt_cookie_consent';
  var GA_ID = 'G-PP61NP5NN7';
  var stored = null;

  try { stored = localStorage.getItem(CONSENT_KEY); } catch(e) {}

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

  if (stored === 'granted') { grantConsent(); return; }
  if (stored === 'denied') { return; }

  // No stored preference — show the banner immediately
  var banner = document.getElementById('cookie-consent');
  if (!banner) return;

  banner.style.display = 'flex';

  document.getElementById('consent-accept').addEventListener('click', function() {
    try { localStorage.setItem(CONSENT_KEY, 'granted'); } catch(e) {}
    grantConsent();
    banner.style.display = 'none';
  });

  document.getElementById('consent-reject').addEventListener('click', function() {
    try { localStorage.setItem(CONSENT_KEY, 'denied'); } catch(e) {}
    banner.style.display = 'none';
  });
})();
