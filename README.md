# Nutrition Tracker

Eine Mobile-First Webapp zum Tracking von Ernährung und Sport mit AI-Unterstützung (Gemini).

## Voraussetzungen

- **Node.js**: Muss installiert sein (https://nodejs.org/).
- **Gemini API Key**: Ein API Key von Google AI Studio wird benötigt.

## Installation

Da Node.js auf dem System zum Zeitpunkt der Erstellung nicht verfügbar war, müssen die Abhängigkeiten manuell installiert werden.

1. **Repository klonen / öffnen**
   Öffnen Sie ein Terminal im Ordner `nutrition-tracker`.

2. **Server Setup**
   ```bash
   cd server
   npm install
   # Erstellen Sie eine .env Datei mit:
   # GOOGLE_API_KEY=IhrKeyHier
   # PORT=3000
   node server.js
   ```

3. **Client Setup**
   Öffnen Sie ein zweites Terminal im Ordner `nutrition-tracker/client`.
   ```bash
   npm install
   npm run dev
   ```

## Nutzung

Öffnen Sie die angezeigte URL (meist http://localhost:5173) in Ihrem Browser (am besten im Mobile-Modus der DevTools).
