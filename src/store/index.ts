import { create } from 'zustand';
import type {
  RaceData, SessionOption, SessionType, TelemetryFrameMessage,
} from '../models/index';
import { buildFrameMessage, nextSpeed, telemetryStream } from '../services/index';

interface ReplayStore {
  // Selection
  selectedSession: SessionOption | null;
  sessionType: SessionType;
  raceData: RaceData | null;
  loading: boolean;

  // Replay
  frameIndex: number;
  isPaused: boolean;
  playbackSpeed: number;
  lastMessage: TelemetryFrameMessage | null;

  // UI toggles
  showHud: boolean;
  showNames: boolean;
  showDrsZones: boolean;
  showProgressBar: boolean;
  showSessionInfo: boolean;
  showDriverStandings: boolean;
  showConstructorStandings: boolean;
  showControlsHelp: boolean;
  selectedDrivers: string[];

  // Actions
  selectSession: (s: SessionOption, type: SessionType, data: RaceData) => void;
  exitReplay: () => void;
  tick: (deltaMs: number) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  bumpSpeed: (dir: 1 | -1) => void;
  rewind: () => void;
  fastForward: () => void;
  restart: () => void;
  seek: (index: number) => void;
  toggle: (key: ToggleKey) => void;
  toggleDriver: (code: string) => void;
}

type ToggleKey =
  | 'showHud' | 'showNames' | 'showDrsZones' | 'showProgressBar'
  | 'showSessionInfo' | 'showDriverStandings' | 'showConstructorStandings'
  | 'showControlsHelp';

const STEP_FRAMES = 10;

export const useReplayStore = create<ReplayStore>((set, get) => ({
  selectedSession: null,
  sessionType: 'R',
  raceData: null,
  loading: false,

  frameIndex: 0,
  isPaused: true,
  playbackSpeed: 1,
  lastMessage: null,

  showHud: true,
  showNames: true,
  showDrsZones: true,
  showProgressBar: true,
  showSessionInfo: true,
  showDriverStandings: false,
  showConstructorStandings: false,
  showControlsHelp: false,
  selectedDrivers: [],

  selectSession: (s, type, data) => {
    const msg = buildFrameMessage(data, 0, { frameIndex: 0, isPaused: true, playbackSpeed: 1 });
    telemetryStream.emit(msg);
    set({
      selectedSession: s, sessionType: type, raceData: data,
      frameIndex: 0, isPaused: true, playbackSpeed: 1,
      lastMessage: msg, selectedDrivers: [],
    });
  },

  exitReplay: () => set({ selectedSession: null, raceData: null, lastMessage: null }),

  tick: (deltaMs) => {
    const { raceData, isPaused, playbackSpeed, frameIndex } = get();
    if (!raceData || isPaused) return;
    // 1x = 1 frame per 40ms
    const framesToAdvance = (deltaMs / 40) * playbackSpeed;
    const next = Math.min(raceData.frames.length - 1, frameIndex + framesToAdvance);
    const nextIdx = Math.floor(next);
    if (nextIdx !== Math.floor(frameIndex)) {
      const msg = buildFrameMessage(raceData, nextIdx, {
        frameIndex: nextIdx, isPaused, playbackSpeed,
      });
      telemetryStream.emit(msg);
      set({ frameIndex: next, lastMessage: msg, isPaused: next >= raceData.frames.length - 1 });
    } else {
      set({ frameIndex: next });
    }
  },

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  setSpeed: (speed) => {
    const { raceData, frameIndex, isPaused } = get();
    set({ playbackSpeed: speed });
    if (raceData) {
      const msg = buildFrameMessage(raceData, Math.floor(frameIndex), { frameIndex: Math.floor(frameIndex), isPaused, playbackSpeed: speed });
      telemetryStream.emit(msg);
      set({ lastMessage: msg });
    }
  },
  bumpSpeed: (dir) => get().setSpeed(nextSpeed(get().playbackSpeed, dir)),
  rewind: () => get().seek(Math.max(0, get().frameIndex - STEP_FRAMES * 5)),
  fastForward: () => get().seek(Math.min((get().raceData?.frames.length ?? 1) - 1, get().frameIndex + STEP_FRAMES * 5)),

  restart: () => {
    const { raceData } = get();
    if (!raceData) return;
    const msg = buildFrameMessage(raceData, 0, { frameIndex: 0, isPaused: true, playbackSpeed: get().playbackSpeed });
    telemetryStream.emit(msg);
    set({ frameIndex: 0, isPaused: true, lastMessage: msg });
  },

  seek: (index) => {
    const { raceData, isPaused, playbackSpeed } = get();
    if (!raceData) return;
    const idx = Math.max(0, Math.min(raceData.frames.length - 1, index));
    const msg = buildFrameMessage(raceData, idx, { frameIndex: idx, isPaused, playbackSpeed });
    telemetryStream.emit(msg);
    set({ frameIndex: idx, lastMessage: msg });
  },

  toggle: (key) => set((s) => ({ [key]: !s[key] } as Partial<ReplayStore>)),

  toggleDriver: (code) => set((s) => {
    const has = s.selectedDrivers.includes(code);
    return {
      selectedDrivers: has
        ? s.selectedDrivers.filter((c) => c !== code)
        : [...s.selectedDrivers, code].slice(-2),
    };
  }),
}));