const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

// Lazy + non-throwing until actually called, matching getAnthropicClient()'s convention —
// the rest of the backend must keep working even before EmailJS env vars are configured.
export async function sendOtpEmail(email: string, code: string, expiresAt: Date): Promise<void> {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    throw new Error("EmailJS is not configured on this server.");
  }

  const time = expiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const res = await fetch(EMAILJS_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      // Matches the "Milo One Time Password" template's variables: {{email}}, {{otp}}, {{time}}.
      template_params: { email, otp: code, time },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`EmailJS send failed (${res.status}): ${body || res.statusText}`);
  }
}
