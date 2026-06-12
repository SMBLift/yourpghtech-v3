// Contact form handler (Cloudflare Pages Function).
// Hardening (2026-06): HTML-escape all fields, validate email, lock CORS to our
// origin, reject obvious cross-site posts. NOTE: Turnstile + rate limiting are a
// planned follow-up (need a Turnstile secret + KV namespace) and are not here yet.

const ALLOWED_ORIGINS = [
  'https://yourpghtech.com',
  'https://www.yourpghtech.com',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allow,
    'Vary': 'Origin',
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);

  // Reject cross-site browser submissions. (A missing Origin is allowed so
  // same-origin/no-Origin clients still work; forged-Origin bots are the job
  // of the planned Turnstile + rate-limit layer.)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), { status: 403, headers });
  }

  try {
    const data = await request.json();

    // Honeypot: silently accept (looks successful to the bot), send nothing.
    if (data._honeypot) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Timestamp gate: reject submissions faster than 2s (bot-speed).
    const elapsed = Date.now() - parseInt(data._timestamp || '0', 10);
    if (elapsed < 2000) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Pull + escape fields (escaping prevents HTML/link injection into the email).
    const name = esc(data['your-name'] || 'No name');
    const company = esc(data['company-name'] || 'Not provided');
    const emailRaw = (data['your-email'] || '').trim();
    const validEmail = EMAIL_RE.test(emailRaw);
    const email = validEmail ? esc(emailRaw) : `${esc(emailRaw) || 'No email'} (INVALID FORMAT)`;
    const phone = esc(data['your-phone'] || 'Not provided');
    const message = esc(data['message-text'] || 'No message');

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Notification to YPT. replyTo only when the email is a valid format.
    const notify = {
      sender: { name: 'Your Pgh Tech Website', email: 'support@yourpghtech.com' },
      to: [{ email: 'support@yourpghtech.com', name: 'Your Pgh Tech' }],
      subject: `New Website Inquiry from ${name}`,
      htmlContent,
    };
    if (validEmail) notify.replyTo = { email: emailRaw, name: data['your-name'] || 'Website visitor' };

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify(notify),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('Brevo error:', errText);
      return new Response(JSON.stringify({ success: false, error: 'Email failed' }), { status: 500, headers });
    }

    // Auto-reply ONLY to a valid email (prevents the endpoint being used to mail
    // arbitrary/garbage addresses).
    if (validEmail) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: 'Your Pgh Tech', email: 'support@yourpghtech.com' },
          to: [{ email: emailRaw, name: data['your-name'] || 'there' }],
          subject: 'Thanks for contacting Your Pgh Tech!',
          htmlContent: `
            <p>Hi ${name},</p>
            <p>Thank you for reaching out! We received your message and will get back to you shortly.</p>
            <p>Best regards,<br>Your Pgh Tech</p>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers });
  }
}

// Preflight CORS: echo only an allowed origin.
export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': allow,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
