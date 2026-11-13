import type {
  RaceData,
  Frame,
  DriverFrame,
  DriverStanding,
  ConstructorStanding,
  TrackStatus,
  SafetyCarData,
  SessionInfo,
  RaceControlMessage,
  SessionOption,
  Point,
  DriverInfo,
} from "../models/index";

// ---- Season calendar ----
export const SEASONS: Record<number, SessionOption[]> = {
  2025: [
    { year: 2025, round: 1, name: "Australian Grand Prix", country: "Australia", date: "2025-03-16", hasSprint: false },
    { year: 2025, round: 2, name: "Chinese Grand Prix", country: "China", date: "2025-03-23", hasSprint: true },
    { year: 2025, round: 3, name: "Japanese Grand Prix", country: "Japan", date: "2025-04-06", hasSprint: false },
    { year: 2025, round: 4, name: "Bahrain Grand Prix", country: "Bahrain", date: "2025-04-13", hasSprint: false },
    { year: 2025, round: 5, name: "Saudi Arabian Grand Prix", country: "Saudi Arabia", date: "2025-04-20", hasSprint: false },
    { year: 2025, round: 6, name: "Miami Grand Prix", country: "USA", date: "2025-05-04", hasSprint: true },
    { year: 2025, round: 7, name: "Emilia Romagna Grand Prix", country: "Italy", date: "2025-05-18", hasSprint: false },
    { year: 2025, round: 8, name: "Monaco Grand Prix", country: "Monaco", date: "2025-05-25", hasSprint: false },
    { year: 2025, round: 9, name: "Spanish Grand Prix", country: "Spain", date: "2025-06-01", hasSprint: false },
    { year: 2025, round: 10, name: "Canadian Grand Prix", country: "Canada", date: "2025-06-15", hasSprint: false },
    { year: 2025, round: 11, name: "Austrian Grand Prix", country: "Austria", date: "2025-06-29", hasSprint: false },
    { year: 2025, round: 12, name: "British Grand Prix", country: "UK", date: "2025-07-06", hasSprint: false },
    { year: 2025, round: 13, name: "Belgian Grand Prix", country: "Belgium", date: "2025-07-27", hasSprint: true },
    { year: 2025, round: 14, name: "Hungarian Grand Prix", country: "Hungary", date: "2025-08-03", hasSprint: false },
    { year: 2025, round: 15, name: "Dutch Grand Prix", country: "Netherlands", date: "2025-08-31", hasSprint: false },
    { year: 2025, round: 16, name: "Italian Grand Prix", country: "Italy", date: "2025-09-07", hasSprint: false },
    { year: 2025, round: 17, name: "Azerbaijan Grand Prix", country: "Azerbaijan", date: "2025-09-21", hasSprint: false },
    { year: 2025, round: 18, name: "Singapore Grand Prix", country: "Singapore", date: "2025-10-05", hasSprint: false },
    { year: 2025, round: 19, name: "United States Grand Prix", country: "USA", date: "2025-10-19", hasSprint: true },
    { year: 2025, round: 20, name: "Mexico City Grand Prix", country: "Mexico", date: "2025-10-26", hasSprint: false },
    { year: 2025, round: 21, name: "São Paulo Grand Prix", country: "Brazil", date: "2025-11-09", hasSprint: true },
    { year: 2025, round: 22, name: "Las Vegas Grand Prix", country: "USA", date: "2025-11-22", hasSprint: false },
    { year: 2025, round: 23, name: "Qatar Grand Prix", country: "Qatar", date: "2025-11-30", hasSprint: true },
    { year: 2025, round: 24, name: "Abu Dhabi Grand Prix", country: "UAE", date: "2025-12-07", hasSprint: false },
  ],
};

export const AVAILABLE_YEARS = Object.keys(SEASONS).map(Number);
export const CURRENT_YEAR = Math.max(...AVAILABLE_YEARS);

// ---- Driver roster (20 cars) ----
export const DRIVER_ROSTER: DriverInfo[] = [
  { code: "VER", name: "Max Verstappen", team: "Red Bull Racing", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png", points: 437 },
  { code: "PER", name: "Sergio Pérez", team: "Red Bull Racing", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png", points: 285 },
  { code: "HAM", name: "Lewis Hamilton", team: "Mercedes", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png", points: 352 },
  { code: "RUS", name: "George Russell", team: "Mercedes", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png", points: 245 },
  { code: "LEC", name: "Charles Leclerc", team: "Ferrari", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png", points: 356 },
  { code: "SAI", name: "Carlos Sainz", team: "Ferrari", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png", points: 289 },
  { code: "NOR", name: "Lando Norris", team: "McLaren", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png", points: 374 },
  { code: "PIA", name: "Oscar Piastri", team: "McLaren", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png", points: 292 },
  { code: "ALO", name: "Fernando Alonso", team: "Aston Martin", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png", points: 62 },
  { code: "STR", name: "Lance Stroll", team: "Aston Martin", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png", points: 24 },
  { code: "GAS", name: "Pierre Gasly", team: "Alpine", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png", points: 26 },
  { code: "OCO", name: "Esteban Ocon", team: "Alpine", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png", points: 23 },
  { code: "ALB", name: "Alexander Albon", team: "Williams", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png", points: 12 },
  { code: "SAR", name: "Logan Sargeant", team: "Williams", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png.transform/1col/image.png", points: 0 },
  { code: "TSU", name: "Yuki Tsunoda", team: "RB", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png", points: 22 },
  { code: "RIC", name: "Daniel Ricciardo", team: "RB", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png.transform/1col/image.png", points: 12 },
  { code: "HUL", name: "Nico Hülkenberg", team: "Haas", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png", points: 37 },
  { code: "MAG", name: "Kevin Magnussen", team: "Haas", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png.transform/1col/image.png", points: 14 },
  { code: "BOT", name: "Valtteri Bottas", team: "Kick Sauber", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png", points: 0 },
  { code: "ZHO", name: "Zhou Guanyu", team: "Kick Sauber", image: "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png.transform/1col/image.png", points: 0 },
];

// Mapping team colors for UI borders (used in constructor standings and HUD borders)
export const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#3671C6",
  "Mercedes": "#27F4D2",
  "Ferrari": "#E8002D",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "Haas": "#B6BABD",
  "Kick Sauber": "#52E252",
};

// ---- Deterministic PRNG ----
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Procedural track generator ----
function generateTrack(seed: number): Point[] {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  const numControl = 16;
  const radii = Array.from({ length: numControl }, () => 60 + rand() * 90);
  const cx = 400;
  const cy = 300;
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    const idx = Math.floor((t / (Math.PI * 2)) * numControl) % numControl;
    const r = radii[idx] + 25 * Math.sin(t * 3 + seed);
    points.push({ x: cx + Math.cos(t) * r * 1.6, y: cy + Math.sin(t) * r });
  }
  points.push(points[0]);
  return points;
}

function interpolateTrack(points: Point[], progress: number): Point {
  const n = points.length - 1;
  const p = ((progress % 1) + 1) % 1;
  const f = p * n;
  const i = Math.floor(f);
  const frac = f - i;
  const a = points[i];
  const b = points[Math.min(i + 1, n)];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

// ---- Race data generator ----
export function generateRaceData(
  year: number,
  round: number,
  sessionInfo: SessionInfo,
): RaceData {
  const rand = mulberry32(year * 1000 + round);
  const track = generateTrack(year + round);
  const totalLaps = sessionInfo.total_laps;
  const FRAMES_PER_LAP = 40;
  const totalFrames = totalLaps * FRAMES_PER_LAP;

  const driverState: Record<
    string,
    {
      progress: number;
      pace: number;
      retiredAt: number | null;
      tyre: number;
      pitAt: number[];
    }
  > = {};

  const order = [...DRIVER_ROSTER];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  order.forEach((d, i) => {
    driverState[d.code] = {
      progress: 0,
      pace: 1 + (rand() - 0.5) * 0.02 + i * 0.0008,
      retiredAt: null,
      tyre: 2,
      pitAt: [
        Math.floor(totalLaps * (0.3 + rand() * 0.3)),
        Math.floor(totalLaps * (0.6 + rand() * 0.3)),
      ],
    };
  });

  const scWindows: { start: number; end: number }[] = [];
  if (totalLaps > 20) {
    const scLap = Math.floor(totalLaps * (0.35 + rand() * 0.3));
    scWindows.push({
      start: scLap * FRAMES_PER_LAP,
      end: (scLap + 3) * FRAMES_PER_LAP,
    });
  }

  order
    .slice(15)
    .filter(() => rand() < 0.35)
    .forEach((d) => {
      driverState[d.code].retiredAt = Math.floor(rand() * totalFrames * 0.8);
    });

  const frames: Frame[] = [];
  const trackStatuses: { t: number; status: TrackStatus }[] = [
    { t: 0, status: "1" },
  ];
  const raceControlMessages: RaceControlMessage[] = [
    { t: 0, category: "Flag", message: "RACE START", flag: "GREEN" },
  ];

  for (let f = 0; f < totalFrames; f++) {
    const lapFraction = (f % FRAMES_PER_LAP) / FRAMES_PER_LAP;
    let status: TrackStatus = "1";
    const activeSC = scWindows.find((w) => f >= w.start && f < w.end);
    if (activeSC) {
      status = "4";
      if (f === activeSC.start) {
        raceControlMessages.push({
          t: f * 0.4,
          category: "SafetyCar",
          message: "SAFETY CAR DEPLOYED",
          flag: "YELLOW",
        });
      }
      if (f === activeSC.end - 1) {
        raceControlMessages.push({
          t: f * 0.4,
          category: "SafetyCar",
          message: "SAFETY CAR IN THIS LAP",
          flag: "GREEN",
        });
      }
    }
    if (f > 0 && trackStatuses[trackStatuses.length - 1].status !== status) {
      trackStatuses.push({ t: f * 0.4, status });
    }

    const drivers: Record<string, DriverFrame> = {};
    const positions: { code: string; progress: number }[] = [];

    order.forEach((d) => {
      const st = driverState[d.code];
      if (st.retiredAt !== null && f >= st.retiredAt) return;

      st.progress += (1 / FRAMES_PER_LAP) * (activeSC ? 0.35 : st.pace);

      const curLap = Math.floor(st.progress);
      st.pitAt.forEach((pl) => {
        if (curLap === pl && lapFraction > 0.4 && lapFraction < 0.6) {
          st.progress -= 0.006;
        }
      });

      positions.push({ code: d.code, progress: st.progress });
    });

    positions.sort((a, b) => b.progress - a.progress);

    positions.forEach((p, idx) => {
      const st = driverState[p.code];
      const d = DRIVER_ROSTER.find((r) => r.code === p.code)!;
      const pos = interpolateTrack(track, p.progress % 1);
      const isPitting = st.pitAt.some(
        (pl) =>
          Math.floor(p.progress) === pl &&
          lapFraction > 0.4 &&
          lapFraction < 0.6,
      );
      const speed = activeSC
        ? 90 + rand() * 20
        : isPitting
          ? 60
          : 200 + rand() * 120;
      drivers[p.code] = {
        brake: rand() > 0.85 ? 1 : 0,
        dist: (p.progress % 1) * (sessionInfo.circuit_length_m ?? 5000),
        distance: (p.progress % 1) * (sessionInfo.circuit_length_m ?? 5000),
        drs: speed > 280 && Math.abs((p.progress % 1) - 0.5) < 0.3 ? 1 : 0,
        gear: Math.min(8, Math.floor(speed / 40) + 1),
        lap: Math.min(totalLaps, Math.floor(p.progress) + 1),
        position: idx + 1,
        rel_dist: p.progress % 1,
        speed,
        throttle: speed > 200 ? 100 : speed > 100 ? 60 : 0,
        tyre: st.tyre,
        x: pos.x,
        y: pos.y,
        name: d.name,
        image: d.image,
      };
    });

    let safetyCar: SafetyCarData | null = null;
    if (activeSC) {
      const leader = positions[0];
      const leaderPos = interpolateTrack(track, leader.progress % 1);
      const scPos = interpolateTrack(track, (leader.progress + 0.012) % 1);
      const sinceStart = f - activeSC.start;
      const tillEnd = activeSC.end - f;
      let phase: "deploying" | "on_track" | "returning" = "on_track";
      let alpha = 1;
      if (sinceStart < 8) {
        phase = "deploying";
        alpha = sinceStart / 8;
      } else if (tillEnd < 8) {
        phase = "returning";
        alpha = tillEnd / 8;
      }
      safetyCar = {
        x: phase === "deploying" ? leaderPos.x : scPos.x,
        y: phase === "deploying" ? leaderPos.y : scPos.y,
        phase,
        alpha,
      };
    }

    const leader = positions[0];
    const leaderLap = leader
      ? Math.floor(driverState[leader.code].progress) + 1
      : 0;

    frames.push({
      drivers,
      safety_car: safetyCar,
      lap: Math.min(leaderLap, totalLaps),
      t: f * 0.4,
      weather: {
        air_temp: 18.3 + Math.sin(f / 500) * 2,
        track_temp: 24.1 + Math.sin(f / 400) * 3,
        humidity: 80 - Math.sin(f / 600) * 5,
        rain_state: "DRY",
        wind_speed: 1.1 + rand() * 2,
        wind_direction: 200 + rand() * 40,
      },
    });
  }

  // Standings
  const driverStandings: DriverStanding[] = DRIVER_ROSTER.map((d) => ({
    position: 0,
    code: d.code,
    name: d.name,
    team: d.team,
    image: d.image,
    points: d.points,
    gap: null,
    tyre: 2,
    retired: driverState[d.code].retiredAt !== null,
  }))
    .sort((a, b) => b.points - a.points)
    .map((s, i, arr) => ({
      ...s,
      position: i + 1,
      gap: i === 0 ? null : s.points - arr[0].points,
    }));

  const teamMap = new Map<string, { points: number; color: string }>();
  DRIVER_ROSTER.forEach((d) => {
    const cur = teamMap.get(d.team) ?? { points: 0, color: TEAM_COLORS[d.team] };
    cur.points += d.points;
    teamMap.set(d.team, cur);
  });
  const constructorStandings: ConstructorStanding[] = Array.from(
    teamMap.entries(),
  )
    .map(([team, v]) => ({
      team,
      color: v.color,
      points: v.points,
      position: 0,
      gap: null as number | null,
    }))
    .sort((a, b) => b.points - a.points)
    .map((c, i, arr) => ({
      ...c,
      position: i + 1,
      gap: i === 0 ? null : c.points - arr[0].points,
    }));

  return {
    frames,
    trackStatuses,
    drivers: order.map((d) => d.code),
    driverImages: Object.fromEntries(
      DRIVER_ROSTER.map((d) => [d.code, d.image]),
    ),
    totalLaps,
    trackPolyline: track,
    sessionInfo,
    driverStandings,
    constructorStandings,
    raceControlMessages,
  };
}