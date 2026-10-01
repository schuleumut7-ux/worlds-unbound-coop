# Burger Simulator V2.1 — 2 Player CO-OP

Online 2-player burger-shop simulator built with HTML, CSS, JavaScript and Node.js/WebSocket.

## Starten

```bash
npm install
npm start
```

Dann `http://localhost:3000` öffnen.

## Online CO-OP

Spieler 1 klickt **LADEN ERSTELLEN** und bekommt direkt die Spielwelt. Der 5-stellige ROOM-Code erscheint oben im Spiel.

Spieler 2 klickt **CO-OP BEITRETEN**, gibt den Code ein und startet damit direkt im gemeinsamen Laden.

## Steuerung

Desktop: **WASD / Pfeiltasten** bewegen und **E** interagieren.

Mobil: **Joystick links** bewegen und **E / 💶 / Q** rechts benutzen. Der Joystick hält die Pointer-Verbindung auch dann wenn der Finger weit außerhalb des Joysticks ist und setzt sich beim Loslassen sicher zurück.

Die Mobile-Steuerung kann später in **⚙️ Einstellungen** an- oder ausgeschaltet werden. Der Button für die Mobile-Steuerung im Startmenü bleibt technisch vorhanden wird aber nicht angezeigt.

## Spiel

Bestellungen annehmen, Zutaten verbrauchen, Grill und Fritteuse timen, Burger bauen, an der Kasse Geld annehmen, korrekt Rückgeld geben, Personal einstellen und den Laden ausbauen.

Die alte Save-Slot- und Save-Code-Funktion wurde aus V2.1 entfernt. Bereits vorhandene alte Browser-Save-Daten werden beim Start bereinigt.

## Render

- Build Command: `npm install`
- Start Command: `npm start`
- Der Server nutzt `PORT` automatisch.
- Die gleiche Render-URL wird auf beiden Geräten geöffnet.
