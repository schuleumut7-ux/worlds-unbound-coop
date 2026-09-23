# Worlds Unbound Co-op

2-player online top-down co-op adventure built with HTML, CSS, JavaScript and Node.js/WebSocket.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000` in a browser.

## Deploy on Render

- Create a Render **Web Service** from this repository.
- Build Command: `npm install`
- Start Command: `npm start`
- The server uses Render's `PORT` automatically.
- Open the generated `https://...onrender.com` URL on both devices.
- Player 1 chooses **CREATE ROOM** and shares the 5-character room code.
- Player 2 chooses **JOIN ROOM** and enters the code.

The server serves the game files and the WebSocket multiplayer connection from the same URL. HTTPS automatically uses secure WebSockets in the client.