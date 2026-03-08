export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const data = await request.json();

    // Honeypot check
    if (data._honeypot) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Timestamp check — reject if submitted in under 2 seconds
    const elapsed = Date.now() - parseInt(data._timestamp || '0', 10);
    if (elapsed < 2000) {
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Build email content
    const name = data['your-name'] || 'No name';
    const company = data['company-name'] || 'Not provided';
    const email = data['your-email'] || 'No email';
    const phone = data['your-phone'] || 'Not provided';
    const message = data['message-text'] || 'No message';

    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    // Send notification email via Brevo
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Your Pgh Tech Website', email: 'support@yourpghtech.com' },
        to: [{ email: 'support@yourpghtech.com', name: 'Your Pgh Tech' }],
        replyTo: { email: email, name: name },
        subject: `New Website Inquiry from ${name}`,
        htmlContent: htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('Brevo error:', errText);
      return new Response(JSON.stringify({ success: false, error: 'Email failed' }), { status: 500, headers });
    }

    // Send auto-reply to the person who submitted
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: 'Your Pgh Tech', email: 'support@yourpghtech.com' },
        to: [{ email: email, name: name }],
        subject: 'Thanks for contacting Your Pgh Tech!',
        htmlContent: `
          <p>Hi ${name},</p>
          <p>Thank you for reaching out! We received your message and will get back to you shortly.</p>
          <p>Best regards,<br>Your Pgh Tech</p>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { headers });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500, headers });
  }
}

// Handle preflight CORS requests
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
