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
        html: `
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
          <p><strong>Zum Objekt:</strong></p>
          <p>${escapeHtml(objekt || "—").replace(/\n/g, "<br>")}</p>
        `,
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
