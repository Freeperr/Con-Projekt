# Datenschutz- und Technikpruefung

Stand: 27.09.2026. Geprueft: lokaler Projektordner und separat die bisherige
oeffentliche Website. Keine Veroeffentlichung, kein Commit und kein Push.
Dieser Bericht dokumentiert technische Befunde und offene Betreiberangaben;
er ist keine abschliessende rechtliche Freigabe.

## 1. Geaenderte Dateien

- Alle 12 vorhandenen HTML-Seiten: Google-Fonts-preconnect entfernt.
- impressum/index.html: DDG, OS-Plattform, ueberholte Inhalts-Haftungstexte.
- datenschutz/index.html: Hosting, Kontakt, Speicher, externe Links und TLS.
- kontakt/index.html: POST-Ziel, Feldlaengen, Autocomplete, Datenschutzhinweis.
- js/main.js: lokale Videovorschauen, noreferrer, eindeutiger Feldzugriff,
  korrekter aria-hidden-Zustand beim Oeffnen und Schliessen des Menues.
- api/contact.js: Typ-/Laengen-/E-Mail-Pruefung, no-store, Versand-Timeout,
  keine ausfuehrlichen Provider-/Exception-Inhalte im Log, CONTACT_FROM erforderlich.
- css/style.css: lokaler Font-Import; ungenutzte Picsum-URLs entfernt.
- Neu: css/fonts.css, fonts/*.woff2 (19 Dateien) und vier OFL-Lizenztexte.
- Neu: images/videos/*.jpg (vier lokale Kopien der bisherigen Vorschaubilder).
- Neu: 404.html im bestehenden Seitendesign.
- Neu: tests/contact.test.mjs, .gitignore, .vercelignore und dieser Bericht.
- AGB-Vertragsinhalt unveraendert; nur der Font-preconnect wurde entfernt.

## 2. Ausgangslage und Implementierung

Statische HTML-/CSS-/JS-Website, eine Vercel-kompatible Node-Function unter
/api/contact. Kein package.json, keine Lockdatei, kein vercel.json, keine
Middleware, keine Edge-Function, kein Buildsystem. Im lokalen Ordner fehlt .git;
Remote, Branch und Git-Historie konnten daher nicht geprueft werden.

Keine Einbindung von Google Analytics, Tag Manager, Meta Pixel, Hotjar, Clarity,
Maps, Vimeo, Social-Embeds, reCAPTCHA, Turnstile, Vercel Web Analytics oder
Speed Insights im Code gefunden. Keine externen JS-Dateien. SVG-data-URLs in
CSS sind inline und erzeugen keine Netzwerkanfragen.

## 3. Netzwerk-Inventar und Einordnung

| Dienst / Domain | Ausloeser vorher | Einordnung und Zustand nach Aenderung |
| --- | --- | --- |
| con-projekt.de, www.con-projekt.de / Vercel | Seitenaufruf, Dateien, Formular | A: notwendiges Hosting; eigene Domain, keine Tracking-Einbindung |
| fonts.googleapis.com | CSS-Import und preconnect auf jeder Seite | C: entfernt; css/fonts.css lokal |
| fonts.gstatic.com | Schriftdateien | C: entfernt; WOFF2 lokal, Lizenzen beigelegt |
| img.youtube.com | Lazy-Loading der Videovorschauen, ohne Klick | C: entfernt; gleiche Vorschaubilder lokal |
| picsum.photos | sechs CSS-Platzhalterklassen; nicht in HTML verwendet | C: latente externe Bildquelle entfernt; kein Abruf im Baseline-Test |
| api.resend.com | nur Serverfunction nach Absenden | A: Versand der angeforderten Kontaktanfrage; kein Browserrequest |
| youtu.be -> www.youtube.com | ausdruecklicher Klick auf Videolink | Externer Seitenwechsel, kein Embed; keine Verbindung vor Klick, noreferrer |
| fynnpetersen.de | Klick auf vorhandenen Footer-Link | Externer Seitenwechsel; kein automatischer Abruf |
| www.bfdi.bund.de | Klick auf Datenschutz-Link | Externer Seitenwechsel; kein automatischer Abruf |
| vercel.com, resend.com | Klick auf neue Datenschutz-/DPA-Quellenlinks | Externer Seitenwechsel; kein automatischer Abruf |

Kategorie B: kein verbleibender automatisch eingebundener Dienst gefunden,
der hier ein Consent-System erfordert. Es gibt keine eingebetteten Player.
Die bestehende Link-Loesung bleibt erhalten; ein neuer YouTube-iframe waere eine
Funktionsaenderung und ist nicht erforderlich. Externe Zielseiten koennen nach
dem Verlassen dieser Website eigene weitere Dienste und Cookies laden; diese
gehoeren nicht zu den Ressourcen der hier geprueften Website.

GitHub ist gemaess Betreiberangabe Versionsverwaltung. Im Besuchercode keine
GitHub-, github.io- oder raw.githubusercontent.com-Anfragen. Die Font-Lizenzen
wurden bei der Entwicklung aus dem offiziellen Google-Fonts-Repository geladen;
das erzeugt keine entsprechenden Besucherrequests.

## 4. Erstbesuch und Speicher

Vorher lokal gemessen: fonts.googleapis.com, fonts.gstatic.com; auf der
Videoseite zusaetzlich img.youtube.com. Keine Cookies oder Web-Storage-Eintraege.

Nachher: 12 Seiten in jeweils frischen Chromium-Kontexten bei 1440x1000 und
390x844 geprueft, einschliesslich Scrollen und Lazy-Loading. Ausschliesslich
127.0.0.1 als lokale Website-Origin kontaktiert. Keine externen Domains,
Cookies, localStorage-, sessionStorage- oder IndexedDB-Eintraege.
Die neuen lokalen Schriftdateien und Bilder wurden erfolgreich ausgeliefert.

Live-Website (alter Stand): HTTP 308 nach HTTPS, anschliessend Weiterleitung
auf www.con-projekt.de; Serverheader Vercel. Start, Impressum, Datenschutz und
Videos HTTP 200; unbekannte URL HTTP 404. Ohne gespeicherte Besucherdaten:
con-projekt.de und www.con-projekt.de sowie Google-Fonts-Domains, auf der
Videoseite auch img.youtube.com. Keine Cookies oder local-/sessionStorage-
Eintraege in den untersuchten Live-Kontexten. Diese Beobachtung ersetzt nicht
die Kontrolle von kontoseitigen Integrationen, Log Drains oder Schutzfunktionen.

Ergebnis: Fuer den ueberarbeiteten Stand ist technisch kein allgemeiner
Consent-/Cookie-Banner erforderlich. Deshalb wurde keiner eingebaut. Ein
spaeterer Einbau von Tracking oder externen Playern erfordert eine neue Pruefung.
Nach dem Deployment muss der neue Produktionsstand nochmals kontrolliert werden.

## 5. Impressum

- § 5 TMG in Ueberschrift und Metadaten durch § 5 DDG ersetzt.
- Verweis auf die eingestellte EU-OS-Plattform entfernt.
- Separate Verbraucherstreitbeilegungserklaerung beibehalten; deren tatsaechliche
  Richtigkeit ist eine Betreiberfrage, keine aus dem Code belegbare Tatsache.
- Haftung fuer Inhalte: alte TMG-Verweise und die pauschale Aussage, Haftung
  beginne erst ab Kenntnis, durch Verantwortung nach allgemeinen Gesetzen ersetzt.
- Haftung fuer Links und Urheberrecht nicht neu geschrieben.
- Name, Anschrift, Telefon, E-Mail, USt-ID und Aufsichtsbehoerde unveraendert.

## 6. Datenschutztexte

Vercel und Resend mit anhand offizieller Anbieterunterlagen verifizierten
Anschriften ergaenzt. Verarbeitung von Verbindungsdaten, Hosting-Protokollen und
Kontaktangaben beschrieben. Keine erfundenen Fristen oder Behauptung, ein
bestimmter Vertrag sei im Kundenkonto abgeschlossen. Moegliche US-Verarbeitung
und vom Anbieter bereitgestellte DPA-/SCC-Regelungen genannt; konkrete Anwendung
im Betreiberkonto bleibt zu bestaetigen.

Cookie-/Hosting-Platzhalter, kuenftiger Zertifikatsantrag, zugesicherte Log-Loeschung
bei Sitzungsende, pauschaler Ausschluss des Widerspruchsrechts und falsche Aussage
zur Nichtweitergabe von Formulardaten entfernt. Lokale Schriftarten/Bilder,
externe Videolinks und fehlendes Tracking erklaert. TLS-Transport von
Ende-zu-Ende-Verschluesselung einer E-Mail abgegrenzt. Keine unbelegte Bestellung
eines Datenschutzbeauftragten mehr suggeriert. Herkunft der Ausgangsvorlage
beibehalten und technische Aktualisierung kenntlich gemacht.

Offene Angaben stehen als TODOs in diesem Bericht, nicht als sichtbare Platzhalter
in der Datenschutzerklaerung. Die Texte sind bis zur Betreiberpruefung ein Entwurf.

## 7. Kontaktformular und Sicherheit

Browser: Name, E-Mail und freiwilliger Objekttext als JSON per POST an
/api/contact. Server: Resend-API, mit Name im Betreff, E-Mail als Reply-To,
Text-/HTML-Nachricht, Eingangszeitpunkt und konfiguriertem Absender/Empfaenger.
Keine Weitergabe der Browser-IP im Resend-Payload durch den Anwendungscode;
Vercel verarbeitet die normalen HTTP-Verbindungsdaten. Resend sieht ausserdem
die Verbindungsdaten der anfragenden Serverfunction.

Kein CAPTCHA und kein anwendungseigener Rate-Limiter gefunden. Keine eigene
Datenbank. Empfang und Aufbewahrung im Betreiberpostfach sind aus dem Repository
nicht bestimmbar. Eventuelles Resend-E-Mail-Oeffnungs-/Klicktracking ist eine
Dashboard-Einstellung, nicht im Website-Code aktiviert oder nachweisbar.

Sichtbare Variablennamen: RESEND_API_KEY, CONTACT_TO, CONTACT_FROM.
Keine Werte gelesen oder ausgegeben. CONTACT_TO behielt den vorhandenen Fallback
kontakt@con-projekt.de. CONTACT_FROM muss nun explizit gesetzt sein; der bisherige
Fallback auf die Resend-Testadresse ist entfernt. Das verhindert unbemerktes
Versenden ueber eine nicht fuer den Produktivbetrieb konfigurierte Adresse.

Datei-/Mustersuche im aktuellen Ordner: keine .env-Dateien, privaten Schluessel,
echten API-Schluessel, Tokens oder Passwoerter gefunden. Testwerte sind kuenstliche
Fixtures. Dies ist keine Garantie und keine Pruefung der Git-Historie. .gitignore
beugt versehentlichem Einchecken von .env und .vercel vor. .vercelignore schliesst
lokale Konfiguration, Tests und diesen Bericht vom Deployment aus.

## 8. TODOs vor Freigabe

- TODO: Vertrags-/AVV-Status fuer Vercel und Resend im Betreiberkonto nachweisen;
  tatsaechlich anwendbare Drittlandgarantien, Regionen und Unterauftragnehmer pruefen.
- TODO: Log-Aufbewahrung, Log Drains und gegebenenfalls externe Log-Empfaenger
  in Vercel pruefen; passende Loeschregeln dokumentieren und Text konkretisieren.
- TODO: Resend-Aufbewahrung, Loeschpraxis, Versanddomain und deaktiviertes
  Open-/Click-Tracking pruefen. Keine unbekannte Frist als Tatsache eintragen.
- TODO: Anbieter des E-Mail-Postfachs benennen; dessen Auftragsverarbeitung,
  Speicherorte und Loesch-/Aufbewahrungsregeln fuer Kontaktanfragen pruefen.
- TODO: RESEND_API_KEY und CONTACT_FROM sicher in Vercel konfigurieren und
  CONTACT_TO pruefen. Anschliessend eine echte Zustellung vom Betreiber testen.
- TODO: Vercel-Dashboard auf zusaetzliche Analytics-/Speed-Insights-Integrationen,
  Schutzfunktionen und Firewall-/Rate-Limit-Regeln fuer /api/contact pruefen.
- TODO: Impressumsangaben durch Kai Petersen bestaetigen: Rechtsform/ggf.
  Registereintrag, aktuelle Aufsichtsbehoerde und Erlaubnisumfang, USt-ID, ggf.
  vorhandene Wirtschafts-ID sowie weitere berufsbezogene Pflichtangaben.
- TODO: Wahrheit der Verbraucherstreitbeilegungserklaerung bestaetigen.
- TODO: Produktionsdeployment und frischen Netzwerk-/Speichertest danach ausfuehren.

## 9. Rechtlich pruefen lassen

- AGB Nr. 5: '4,5 % p. a. ueber Bundesbankdiskont' ist ein ueberholter Bezug;
  keine eigenmaechtige Festlegung eines neuen Zinssatzes. § 288 BGB beachten.
- AGB Nr. 6 c: 6,25 % halbiert sind 3,125 %, nicht 3,1 %. Ausserdem ist die
  Zuordnung 'Auftraggeber und Auftragnehmer' im Maklerkontext zu klaeren.
  Keine stillschweigende Aenderung einer finanziellen Vertragskondition.
- AGB Nr. 2 bis 4 und 8: Reichweite der Provisionsansprueche, Folgegeschaefte,
  Weitergabe und Ruecktritt insbesondere gegenueber Verbrauchern pruefen.
- AGB Nr. 6 und 7: Verbraucher-/Maklerrecht, Kostenverteilung, Doppeltaetigkeit
  und Anwendungsbereich der einzelnen Provisionsregeln pruefen.
- AGB Nr. 9: pauschale Haftungsbegrenzung und Verjaehrung; erforderliche Ausnahmen
  etwa fuer Personenschaeden muessen juristisch geprueft werden.
- Widerrufsbelehrung: nennt ein beigefuegtes Muster-Widerrufsformular, das im
  Projekt fehlt. Belehrung, Leistungsbeginn und Erloeschen des Rechts pruefen.
- Impressum: Link-Haftungstext behauptet tatsaechliche Kontrollen; deren
  Durchfuehrung ist nicht belegt. Pauschale Disclaimer sind kein Haftungsfreibrief.
- Urheberrecht: Rechte an Fotografien, Visualisierungen und Videovorschauen sowie
  Nutzungsbeschraenkungen pruefen. Font-Lizenztexte sind lokal beigelegt.
- Datenschutz: Drittlandtransfers, Rechtsgrundlagen, tatsaechliche Loeschpraxis
  und Vollstaendigkeit der Betreiberangaben vor Veroeffentlichung pruefen.

## 10. Tests und Build

- node --check js/main.js und node --check api/contact.js erfolgreich.
- node --test tests/contact.test.mjs erfolgreich: ungueltige Typen, Pflichtfelder,
  Laengengrenzen, E-Mail-/Header-Eingaben, HTML-Escaping, Konfiguration, HTTP-Methode,
  Providerfehler, Timeout-Signal, Log-Redaktion und Payload ohne Browser-IP.
- Browser: 24 Seiten-/Viewport-Kombinationen, keine JS-Fehler, fehlgeschlagenen
  Ressourcen, defekten img-Elemente oder horizontalen Ueberlaeufe im Test.
- Navigation/Interne Linkziele und Menue-Zustaende geprueft. Kontaktformular-Erfolg
  und Fehleranzeige mit abgefangenen Requests, ohne echte E-Mails, getestet.
- Videos: vier lokale Vorschaubilder, korrekte externe Links, keine iframes.
- Luftaufnahmen: lokale Bilder erfolgreich geladen. Desktop-/Mobil-Screenshots
  erstellt; bestehendes Branding und Layout beibehalten.
- Eigene 404-Seite lokal mit Status 404 getestet. Vercel erkennt 404.html fuer
  statische Deployments; Produktivverhalten nach Deployment nochmals pruefen.
- Zehn externe Linkziele per GET erreichbar (HTTP 200 nach Weiterleitungen).
  YouTube-Status bestaetigt nicht die Abspielbarkeit fuer jede Region/Anmeldung.
- Lokale Asset-/Linkpruefung ohne fehlende Ziele.
- Kein vorhandener Linter, Typecheck oder Production-Build: keine entsprechenden
  Scripts/Dependencies vorhanden. Daher kein Production-Build als erfolgreich
  behauptet. Statische Auslieferung und Node-Function lokal geprueft; kein Vercel-
  Build oder Deployment angestossen und keine Kontoeinstellungen geaendert.

Browser-/Netzwerkprotokolle und Screenshots liegen lokal unter
C:/Users/fynns/.codex/con-projekt-audit/. Sie sind nicht Teil des Deployments.

## 11. Primaerquellen

- https://www.gesetze-im-internet.de/ddg/__5.html
- https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1800145
- https://www.datenschutz-berlin.de/fileadmin/user_upload/pdf/publikationen/DSK/2024/2024_DSK-OH_Digitale-Dienste.pdf
- https://vercel.com/legal/privacy-notice
- https://vercel.com/legal/dpa
- https://vercel.com/docs/logs/runtime
- https://vercel.com/docs/drains/reference/logs
- https://vercel.com/kb/guide/custom-404-page
- https://resend.com/legal/dpa
- https://resend.com/legal/privacy-policy
- https://resend.com/blog/open-and-click-tracking
- https://www.gesetze-im-internet.de/bgb/__288.html

Abruf fuer diese Pruefung am 27.09.2026. Anbieterunterlagen beschreiben die
angebotenen Regelungen; sie belegen nicht die konkreten Einstellungen oder
Vertragsabschluesse dieses Betreiberkontos.
