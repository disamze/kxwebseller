import { asyncHandler } from '../middleware/asyncHandler.js';

export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400);
    throw new Error('Name, email and message are required');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_RECEIVER_EMAIL || 'disamaze@gmail.com';
  const sender = process.env.CONTACT_SENDER_EMAIL || 'onboarding@resend.dev';

  // Graceful fallback: do not block users if email provider is not configured.
  if (!apiKey) {
    console.warn('Contact message received but RESEND_API_KEY is missing.', {
      to: recipient,
      fromUser: email,
      name,
      message
    });

    res.status(200).json({
      ok: true,
      queued: true,
      message: 'Thanks! Your message has been received. Our team will reach out soon.'
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `KXMATERIALS Contact <${sender}>`,
      to: [recipient],
      reply_to: email.trim(),
      subject: `New contact form message from ${name.trim()}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    })
  });

  const data = await response.json();
  if (!response.ok) {
    res.status(502);
    throw new Error(data?.message || 'Failed to deliver email');
  }

  res.status(200).json({ ok: true, message: 'Message sent successfully', id: data?.id });
});
