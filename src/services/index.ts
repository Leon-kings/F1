import type { RaceData, TelemetryFrameMessage, TrackStatus, ReplayState } from '../models/index';
import { SPEED_STEPS } from '../models/index';

// ---- Track status at a point in time ----
export function trackStatusAt(
  statuses: { t: number; status: TrackStatus }[],
  t: number,
): TrackStatus {
  let status: TrackStatus = '1';
  for (const s of statuses) {
    if (s.t <= t) status = s.status;
    else break;
  }
  return status;
}

// ---- Build a TelemetryFrameMessage from a RaceData + index ----
export function buildFrameMessage(
  data: RaceData,
  frameIndex: number,
  state: ReplayState,
): TelemetryFrameMessage {
  const idx = Math.max(0, Math.min(data.frames.length - 1, frameIndex));
  const frame = data.frames[idx];
  const trackStatus = trackStatusAt(data.trackStatuses, frame.t);
  const leader = Object.entries(frame.drivers)
    .sort((a, b) => a[1].position - b[1].position)[0];
  const leaderCode = leader ? leader[0] : '---';
  const h = Math.floor(frame.t / 3600);
  const m = Math.floor((frame.t % 3600) / 60);
  const s = Math.floor(frame.t % 60);
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return {
    frame,
    frame_index: idx,
    is_paused: state.isPaused,
    playback_speed: state.playbackSpeed,
    session_data: {
      lap: frame.lap,
      leader: leaderCode,
      time: timeStr,
      total_laps: data.totalLaps,
    },
    total_frames: data.frames.length,
    track_status: trackStatus,
  };
}

// ---- Speed stepper ----
export function nextSpeed(current: number, dir: 1 | -1): number {
  const idx = SPEED_STEPS.findIndex((s) => s >= current - 0.001);
  const next = Math.max(0, Math.min(SPEED_STEPS.length - 1, idx + dir));
  return SPEED_STEPS[next];
}

// ---- Telemetry stream (subscriber pattern, mirrors Python TCP stream) ----
type Listener = (msg: TelemetryFrameMessage) => void;

export class TelemetryStream {
  private listeners = new Set<Listener>();
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(msg: TelemetryFrameMessage): void {
    this.listeners.forEach((l) => l(msg));
  }
}

export const telemetryStream = new TelemetryStream();