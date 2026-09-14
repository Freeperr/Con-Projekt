// Vercel Serverless Function — nimmt die Kontaktformular-Daten entgegen
// und verschickt sie per E-Mail über die Resend-API.
//
// Setup (einmalig):
// 1. Kostenloses Konto auf https://resend.com anlegen.
// 2. Domain con-projekt.de dort verifizieren (DNS-Einträge setzen) —
//    oder für einen ersten Test ohne eigene Domain die Testadresse
//    "onboarding@resend.dev" als FROM_EMAIL verwenden.
// 3. Im Vercel-Projekt unter Settings → Environment Variables anlegen:
//    RESEND_API_KEY = der API-Key aus dem Resend-Dashboard
//    CONTACT_TO     = kontakt@con-projekt.de
//    CONTACT_FROM   = z. B. formular@con-projekt.de (muss zur verifizierten Domain passen)
// 4. Deployen — fertig, kein weiterer Code nötig.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { name, email, objekt } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: "Name und E-Mail sind erforderlich." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || "kontakt@con-projekt.de";
  const from = process.env.CONTACT_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.error("RESEND_API_KEY fehlt in den Umgebungsvariablen.");
    return res.status(500).json({ ok: false, error: "Serverkonfiguration unvollständig." });
  }

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(objekt || "—").replace(/\n/g, "<br>");
  const receivedAt = new Date().toLocaleString("de-DE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  });

  const html = `
    <meta charset="utf-8">
    <div style="background:#f4f2ed;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #121212;">
        <tr>
          <td style="background:#121212;padding:20px 28px;">
            <span style="font-family:Georgia,serif;font-size:18px;color:#ffffff;letter-spacing:0.02em;">CON<span style="color:#a8492f;">—</span>PROJEKT</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 20px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6e6c67;">
              Neue Anfrage über das Kontaktformular
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:0 0 14px;border-bottom:1px solid #c7c4bd;">
                  <span style="display:block;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#6e6c67;margin-bottom:4px;">Name</span>
                  <span style="font-family:Georgia,serif;font-size:17px;color:#121212;">${safeName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0;border-bottom:1px solid #c7c4bd;">
                  <span style="display:block;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#6e6c67;margin-bottom:4px;">E-Mail</span>
                  <a href="mailto:${safeEmail}" style="font-family:Georgia,serif;font-size:17px;color:#121212;text-decoration:underline;">${safeEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0 0;">
                  <span style="display:block;font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#6e6c67;margin-bottom:6px;">Zum Objekt</span>
                  <span style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2a2a28;">${safeMessage}</span>
                </td>
              </tr>
            </table>

            <a href="mailto:${safeEmail}" style="display:inline-block;padding:11px 20px;border:1px solid #121212;color:#121212;text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;">
              Direkt antworten →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background:#f4f2ed;border-top:1px solid #c7c4bd;">
            <span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.05em;color:#6e6c67;">Eingegangen am ${receivedAt} Uhr über con-projekt.de</span>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = `Neue Anfrage über das Kontaktformular\n\nName: ${name}\nE-Mail: ${email}\n\nZum Objekt:\n${objekt || "—"}\n\nEingegangen am ${receivedAt} Uhr über con-projekt.de`;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Con—Projekt Kontaktformular <${from}>`,
        to: [to],
        reply_to: email,
        subject: `Neue Anfrage von ${name}`,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      console.error("Resend-Fehler:", detail);
      return res.status(502).json({ ok: false, error: "Versand fehlgeschlagen." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Unerwarteter Fehler." });
  }
}
