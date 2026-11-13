// ============================================================
// Domain models — every type lives here.
// ============================================================

export type SessionType = 'R' | 'S' | 'Q' | 'SQ' | 'FP1' | 'FP2' | 'FP3';
export type TrackStatus = '1' | '2' | '4' | '5' | '6' | '7';
export type SafetyCarPhase = 'deploying' | 'on_track' | 'returning';
export type Point = { x: number; y: number };

// ---- Driver data ----
export interface DriverFrame {
  distance: any;
  brake: number;
  dist: number;
  drs: number;
  gear: number;
  lap: number;
  position: number;
  rel_dist: number;
  speed: number;
  throttle: number;
  tyre: number;
  x: number;
  y: number;
  name: string;
  image: string; // <-- Replaced color with image
}

export interface DriverInfo {
  code: string;
  name: string;
  team: string;
  image: string; // <-- Replaced color with image
  points: number;
}

export interface DriverStanding {
  position: number;
  code: string;
  name: string;
  team: string;
  image: string; // <-- Replaced color with image
  points: number;
  gap: number | null;
  tyre: number;
  retired: boolean;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  color: string; // Teams still use colors
  points: number;
  gap: number | null;
}

// ---- Session data ----
export interface SessionInfo {
  event_name: string;
  circuit_name: string;
  country: string;
  year: number;
  round: number;
  date: string;
  total_laps: number;
  circuit_length_m: number | null;
}

export interface SessionOption {
  year: number;
  round: number;
  name: string;
  country: string;
  date: string;
  hasSprint: boolean;
}

// ---- Frame data ----
export interface SafetyCarData {
  x: number;
  y: number;
  phase: SafetyCarPhase;
  alpha: number;
}

export interface Weather {
  air_temp: number;
  track_temp: number;
  humidity: number;
  rain_state: string;
  wind_speed: number;
  wind_direction: number;
}

export interface Frame {
  drivers: Record<string, DriverFrame>;
  safety_car: SafetyCarData | null;
  lap: number;
  t: number;
  weather: Weather;
}

export interface RaceControlMessage {
  t: number;
  category: string;
  message: string;
  flag?: string;
}

// ---- Aggregated race dataset ----
export interface RaceData {
  frames: Frame[];
  trackStatuses: { t: number; status: TrackStatus }[];
  drivers: string[];
  driverImages: Record<string, string>; // <-- Replaced driverColors with driverImages
  totalLaps: number;
  trackPolyline: Point[];
  sessionInfo: SessionInfo;
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  raceControlMessages: RaceControlMessage[];
}

// ---- Telemetry stream payload ----
export interface TelemetryFrameMessage {
  frame: Frame;
  frame_index: number;
  is_paused: boolean;
  playback_speed: number;
  session_data: {
    lap: number;
    leader: string;
    time: string;
    total_laps: number;
  };
  total_frames: number;
  track_status: TrackStatus;
}

// ============================================================
// Constants / lookup tables
// ============================================================

export const TYRE_COMPOUNDS: Record<number, { name: string; color: string }> = {
  1: { name: 'S', color: '#ef4444' },
  2: { name: 'M', color: '#facc15' },
  3: { name: 'H', color: '#e5e7eb' },
  4: { name: 'I', color: '#22c55e' },
  5: { name: 'W', color: '#3b82f6' },
};

export const TRACK_STATUS_COLORS: Record<TrackStatus, string> = {
  '1': '#22c55e',
  '2': '#facc15',
  '4': '#f59e0b',
  '5': '#ef4444',
  '6': '#eab308',
  '7': '#eab308',
};

export const TRACK_STATUS_LABEL: Record<TrackStatus, string> = {
  '1': 'GREEN',
  '2': 'YELLOW',
  '4': 'SAFETY CAR',
  '5': 'RED FLAG',
  '6': 'VSC',
  '7': 'VSC ENDING',
};

// ============================================================
// Replay engine models
// ============================================================

export const MIN_SPEED = 0.1;
export const MAX_SPEED = 256;
export const SPEED_STEPS = [0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256];
export const DEFAULT_FRAME_DURATION_MS = 40; // 25 fps baseline

export interface ReplayState {
  frameIndex: number;
  isPaused: boolean;
  playbackSpeed: number;
}