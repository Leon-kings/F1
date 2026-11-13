# 🏎️ F1 Race Replay & Manual Drive

An interactive, browser-based Formula 1 race replay simulator with a full manual driving mode. Watch a simulated Grand Prix unfold in real time — or take control of any car and race against the field yourself.

Built with **React**, **TypeScript**, **Zustand**, **Framer Motion**, and **Tailwind CSS**.

---

## 📖 Table of Contents

1. [What This Project Does](#-what-this-project-does)
2. [Core Features](#-core-features)
3. [How the Replay Works](#-how-the-replay-works)
4. [How Manual Drive Works](#-how-manual-drive-works)
5. [Cameras](#-cameras)
6. [The HUD & Live Statistics](#-the-hud--live-statistics)
7. [Live Classification](#-live-classification)
8. [Controls](#-controls)
9. [Physics Model](#-physics-model)
10. [Project Structure](#-project-structure)
11. [How to Run](#-how-to-run)
12. [Technical Notes](#-technical-notes)
13. [FAQ](#-faq)

---

## 🎯 What This Project Does

This is a **race simulator + replay viewer**. When you start a session:

- A full Grand Prix is **generated procedurally** for any season, round, and session type (Race, Sprint, Qualifying, Sprint Quali, FP1, FP2).
- The race is played back as **animated frames** — cars move around a track, their positions update, gaps are calculated, laps increment, and a leaderboard updates in real time.
- At any point, you can **take over a car** and drive it manually using your keyboard, racing live against the simulated field.

The result is a hybrid experience:
- **Watch** a full race replay like a broadcast overlay.
- **Drive** in it yourself like an arcade racer.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🗓️ **Season & session picker** | Choose from multiple seasons, rounds, and session types |
| 🌍 **Multiple circuits** | Each round has its own track, country, and layout |
| 🎬 **Smooth frame-based replay** | Cars animate along a polyline track |
| 🏁 **Live leaderboard** | Position, gap to leader, tyre compound |
| 🕐 **Session timer & lap counter** | Live session clock and lap progress |
| 🚦 **Track status indicators** | Green / Yellow / Safety Car / Red / VSC |
| 👥 **Championship standings** | Driver + constructor championship panels |
| 🎥 **Multi-camera system** | Top-down, chase cam, front cam |
| 🎮 **Manual driving** | Full keyboard control of any car |
| 📊 **Live telemetry** | Speed, gear, throttle, brake, DRS, tyre |
| 🏎️ **Realistic physics** | Acceleration curves, braking, drag, steering penalty |
| 📈 **Live timing** | Current lap, last lap, best lap, max speed, average speed |
| 🔁 **Independent manual race** | Your manual race runs its own clock and laps — separate from the replay |
| 🎨 **Team-colored driver avatars** | Driver photos shown with team color borders |

---

## 🎬 How the Replay Works

The replay is the "broadcast mode." You're an observer watching a pre-generated race unfold.

### 1. Session Selection
From the main menu, you pick:
- **Season** (year)
- **Round** (race weekend)
- **Session type** (`R` = Race, `S` = Sprint, `Q` = Qualifying, `SQ` = Sprint Quali, `FP1`, `FP2`)

### 2. Race Data Generation
The app calls `generateRaceData()` which procedurally builds:

- A **track polyline** (`trackPolyline`) — an array of 2D points that form the track path.
- An array of **frames** — each frame is a snapshot of every car's state at that moment.
- **Driver standings** and **constructor standings** at that point in the season.

Each frame contains, for every driver:

```ts
interface DriverFrame {
  code: string;         // driver code (e.g. "VER", "HAM")
  name: string;         // full name
  image: string;        // photo URL
  position: number;     // 1..20
  speed: number;        // km/h
  gear: number;         // 1..8
  drs: boolean;         // DRS open?
  throttle: number;     // 0..100%
  brake: number;        // 0..100%
  distance: number;     // total meters traveled
  x: number;            // pixel position on track
  y: number;
  tyre: number;         // tyre compound index
}
