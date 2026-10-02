# Burger Simulator V2.1 — 2 Player CO-OP

Online 2-player burger-shop simulator built with HTML, CSS, JavaScript and Node.js/WebSocket.

## Neu in V2.1

- Ladenname in den Einstellungen ändern und im gemeinsamen Raum synchronisieren.
- Braune Stationen haben echte Kollisionen: durch Maschinen und Theken kann man nicht laufen.
- Graue/weiße Felder sind die einzigen Interaktionsflächen für Stationen.
- Die rechte Stationen-Hilfe wurde entfernt.
- Mobile Aktion ist nur noch **✋ Interagieren**. Die zusätzlichen Kasse-/Q-Buttons sind entfernt.
- Der manuelle Schicht-Ende-Button wurde durch eine automatische **Uhrzeit-/Tage-System** ersetzt.
- Das Zeitlimit pro Burger-Bestellung wurde vorerst entfernt. Bestellungen laufen nicht mehr ab.
- Ein Tag dauert 5 Minuten Echtzeit und läuft von 08:00 bis 22:00 Spielzeit.
- Das Tutorial-Feld oben links ist reine Info und keine Interaktionsfläche.
- Das alte Save-Slot-/Save-Code-System bleibt entfernt.

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

Desktop: **WASD / Pfeiltasten** bewegen und **E** bzw. die Interaktionsfläche benutzen.

Mobil: **Joystick links** bewegen und **✋** rechts benutzen. Der Joystick hält die Pointer-Verbindung auch dann wenn der Finger weit außerhalb des Joysticks ist und setzt sich beim Loslassen sicher zurück.

## Spiel

Bestellungen annehmen, Zutaten verbrauchen, Grill und Fritteuse timen, Burger bauen, an der Kasse Geld annehmen, korrekt Rückgeld geben, Personal einstellen und den Laden ausbauen.

## Render

- Build Command: `npm install`
- Start Command: `npm start`
- Der Server nutzt `PORT` automatisch.
- Die gleiche Render-URL wird auf beiden Geräten geöffnet.

- Grafik-Polish: dunkles Tutorial, transparentere Interaktionsfelder mit passenden Emojis, Geräte näher an der Wand und animierte Geräte/Beleuchtung.
