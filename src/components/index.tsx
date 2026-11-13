import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SpeedIcon from "@mui/icons-material/Speed";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { HelpOutlined, RestartAlt } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import SportsMotorsportsIcon from "@mui/icons-material/SportsMotorsports";
import TimerIcon from "@mui/icons-material/Timer";
import VideocamIcon from "@mui/icons-material/Videocam";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagIcon from "@mui/icons-material/Flag";
import type { Frame, SessionType } from "../models/index";
import {
  TYRE_COMPOUNDS,
  TRACK_STATUS_COLORS,
  TRACK_STATUS_LABEL,
} from "../models/index";
import { useReplayStore } from "../store/index";
import {
  SEASONS,
  AVAILABLE_YEARS,
  CURRENT_YEAR,
  generateRaceData,
  TEAM_COLORS,
} from "../data/index";

// ============================================================
// Utilities
// ============================================================
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const fmtSpeed = (n: number) => `${Math.round(n)} km/h`;

const fmtGap = (g: number | null) => {
  if (g === null || g === 0) return "LEADER";
  return `+${g.toFixed(3)}s`;
};

const calculateGap = (leaderDistance: number, driverDistance: number) => {
  const distanceDiff = leaderDistance - driverDistance;
  if (distanceDiff <= 0) return 0;
  return distanceDiff / 55.5;
};

const formatRaceTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatLapTime = (seconds: number) => {
  if (!isFinite(seconds) || seconds <= 0) return "--:--.---";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
};

const F1_LOGO_URL =
  "https://media.gettyimages.com/id/113756242/video/racetrack-goal-with-sound.jpg?s=640x640&k=20&c=7LzZdin2YtnV8QiNL9mb8dhSC9QNM9-XNaPeWaXpXNU=";

const CANVAS_W = 800;
const CANVAS_H = 600;
const TRACK_LENGTH_M = 5800;

type CameraMode = "top" | "chase" | "front";

// ============================================================
// Manual Racing State
// ============================================================
interface ManualRace {
  active: boolean;
  code: string | null;
  name: string;
  image: string;
  teamColor: string;

  speed: number;
  distance: number;
  lapDistance: number;
  heading: number;
  steer: number;
  throttle: number;
  brake: boolean;

  raceTime: number;
  lapStartTime: number;
  lastLapTime: number;
  bestLapTime: number;
  lapTimes: number[];

  laps: number;
  maxSpeed: number;
  avgSpeedSum: number;
  avgSpeedCount: number;

  x: number;
  y: number;

  throttleReleasedAfterLap: boolean;
}

const makeEmptyManualRace = (): ManualRace => ({
  active: false,
  code: null,
  name: "",
  image: "",
  teamColor: "#fff",
  speed: 0,
  distance: 0,
  lapDistance: 0,
  heading: 0,
  steer: 0,
  throttle: 0,
  brake: false,
  raceTime: 0,
  lapStartTime: 0,
  lastLapTime: 0,
  bestLapTime: 0,
  lapTimes: [],
  laps: 0,
  maxSpeed: 0,
  avgSpeedSum: 0,
  avgSpeedCount: 0,
  x: 0,
  y: 0,
  throttleReleasedAfterLap: false,
});

// ============================================================
// RaceSelection
// ============================================================
export function RaceSelection() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [round, setRound] = useState(12);
  const [sessionType, setSessionType] = useState<SessionType>("R");
  const selectSession = useReplayStore((s) => s.selectSession);

  const calendar = SEASONS[year] ?? [];
  const current = calendar.find((c) => c.round === round) ?? calendar[0];

  const sessionLabel = (t: SessionType) =>
    t === "R"
      ? "Race"
      : t === "S"
        ? "Sprint"
        : t === "Q"
          ? "Qualifying"
          : t === "SQ"
            ? "Sprint Quali"
            : t;

  const handleStart = () => {
    if (!current) return;
    const info = {
      event_name: current.name,
      circuit_name: current.name.replace(/\s+Grand\s+Prix$/i, ""),
      country: current.country,
      year: current.year,
      round: current.round,
      date: current.date,
      total_laps: sessionType === "S" ? 19 : 52,
      circuit_length_m: TRACK_LENGTH_M,
    };
    const data = generateRaceData(current.year, current.round, info);
    selectSession(current, sessionType, data);
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-black p-2 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-6xl bg-slate-800/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-slate-700 shadow-2xl p-3 sm:p-6 md:p-8 my-auto"
      >
        <div className="flex items-center gap-3 mb-4 sm:mb-8">
          <SportsScoreIcon
            sx={{ fontSize: { xs: 32, md: 40, xl: 48 }, color: "#e10600" }}
          />
          <div>
            <h1 className="text-lg sm:text-2xl xl:text-3xl font-bold tracking-tight text-white">
              F1 Race Replay
            </h1>
            <p className="text-[10px] sm:text-sm text-gray-400">
              Select a session to begin
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 sm:mb-2">
              Season
            </label>
            <div className="grid grid-cols-4 gap-1 sm:flex sm:gap-2">
              {AVAILABLE_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`py-1.5 sm:py-2 md:py-2.5 sm:flex-1 rounded-md sm:rounded-lg text-[10px] sm:text-sm font-medium transition-colors ${
                    year === y
                      ? "bg-red-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-gray-200"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 sm:mb-2">
              Session
            </label>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {(["R", "S", "Q", "SQ", "FP1", "FP2"] as SessionType[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setSessionType(t)}
                    className={`py-1.5 sm:py-2 md:py-2.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-medium transition-colors ${
                      sessionType === t
                        ? "bg-red-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600 text-gray-200"
                    }`}
                  >
                    {sessionLabel(t)}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 h-full">
          <label className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 mb-1 sm:mb-2">
            Round {round} — {current?.country}
          </label>
          <div className="min-h-screen sm:max-h-64 overflow-y-auto rounded-md sm:rounded-lg border border-slate-700 bg-slate-900/50">
            {calendar.map((s) => (
              <motion.button
                key={s.round}
                onClick={() => setRound(s.round)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 text-left border-b border-slate-700/50 last:border-b-0 transition-colors ${
                  round === s.round
                    ? "bg-red-600/20 border-l-4 border-l-red-600"
                    : "hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[9px] sm:text-xs font-mono text-gray-500 w-6 sm:w-8">
                    R{s.round}
                  </span>
                  <div>
                    <div className="text-[10px] sm:text-sm font-medium text-white">
                      {s.name}
                    </div>
                    <div className="text-[8px] sm:text-xs text-gray-400">
                      {s.date}
                    </div>
                  </div>
                </div>
                {s.hasSprint && (
                  <span className="text-[7px] sm:text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                    SPRINT
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-base md:text-lg transition-colors shadow-lg shadow-red-900/50"
        >
          Start Replay
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============================================================
// TrackCanvas
// ============================================================
function TrackCanvas({
  manual,
  cameraMode,
}: {
  manual: ManualRace;
  cameraMode: CameraMode;
}) {
  const raceData = useReplayStore((s) => s.raceData);
  const frameIndex = useReplayStore((s) => s.frameIndex);
  const showNames = useReplayStore((s) => s.showNames);
  const showDrsZones = useReplayStore((s) => s.showDrsZones);
  const selectedDrivers = useReplayStore((s) => s.selectedDrivers);

  const frame = useMemo<Frame | null>(() => {
    if (!raceData) return null;
    const idx = clamp(Math.floor(frameIndex), 0, raceData.frames.length - 1);
    return raceData.frames[idx];
  }, [raceData, frameIndex]);

  if (!raceData || !frame) return null;

  const poly = raceData.trackPolyline;
  const path =
    poly.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  const drsZones = showDrsZones
    ? [
        poly.slice(
          Math.floor(poly.length * 0.1),
          Math.floor(poly.length * 0.2),
        ),
        poly.slice(
          Math.floor(poly.length * 0.55),
          Math.floor(poly.length * 0.65),
        ),
      ]
    : [];

  const usingCamera = cameraMode !== "top" && manual.active;

  let camTransform = "";
  if (usingCamera) {
    const zoom = cameraMode === "chase" ? 3.4 : 4.0;
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const deg = (manual.heading * 180) / Math.PI;
    const rot = cameraMode === "chase" ? -deg - 90 : -deg + 90;
    camTransform = `translate(${cx} ${cy}) rotate(${rot}) scale(${zoom}) translate(${-manual.x} ${-manual.y})`;
  }

  const svgToHtml = (x: number, y: number) => {
    if (!usingCamera) {
      return { left: (x / CANVAS_W) * 100, top: (y / CANVAS_H) * 100 };
    }
    const zoom = cameraMode === "chase" ? 3.4 : 4.0;
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const deg = (manual.heading * 180) / Math.PI;
    const rot = cameraMode === "chase" ? -deg - 90 : -deg + 90;
    const rad = (rot * Math.PI) / 180;
    const dx = (x - manual.x) * zoom;
    const dy = (y - manual.y) * zoom;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
    return {
      left: ((cx + rx) / CANVAS_W) * 100,
      top: ((cy + ry) / CANVAS_H) * 100,
    };
  };

  const driversToRender = Object.entries(frame.drivers)
    .filter(([code]) => !manual.active || code !== manual.code)
    .map(([code, d]) => ({
      code,
      x: d.x,
      y: d.y,
      image: d.image,
      name: d.name,
      isManual: false,
      teamColor: TEAM_COLORS[d.name] || "#fff",
    }));

  if (manual.active) {
    driversToRender.push({
      code: manual.code!,
      x: manual.x,
      y: manual.y,
      image: manual.image,
      name: manual.name,
      isManual: true,
      teamColor: manual.teamColor,
    });
  }

  return (
    <div className="relative w-full h-full bg-[#0a0e1a]">
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

        <g transform={usingCamera ? camTransform : undefined}>
          <path
            d={path}
            fill="none"
            stroke="#1f2937"
            strokeWidth={16}
            strokeLinejoin="round"
          />
          <path
            d={path}
            fill="none"
            stroke="#4b5563"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeDasharray="8 10"
          />

          {drsZones.map((zone, i) => (
            <polyline
              key={i}
              points={zone.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#22c55e"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.6}
            />
          ))}

          <image
            href={F1_LOGO_URL}
            x={poly[0].x - 12}
            y={poly[0].y - 12}
            width={24}
            height={24}
            className="drop-shadow-lg object-cover rounded-2xl"
          />
        </g>
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {driversToRender.map((d) => {
          const isSelected = selectedDrivers.includes(d.code);
          const { left, top } = svgToHtml(d.x, d.y);
          if (left < -20 || left > 120 || top < -20 || top > 120) return null;

          const sizeClass = usingCamera
            ? d.isManual
              ? "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
              : "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
            : d.isManual
              ? "w-6 h-6 sm:w-9 sm:h-9 md:w-12 md:h-12"
              : "w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10";

          return (
            <div
              key={d.code}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer pointer-events-auto z-10"
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={(e) => {
                e.stopPropagation();
                if (!d.isManual) {
                  useReplayStore.getState().toggleDriver(d.code);
                }
              }}
            >
              {showNames && (
                <span
                  className="text-[8px] sm:text-[10px] md:text-xs font-bold text-white mb-0.5 whitespace-nowrap"
                  style={{ textShadow: "0 1px 3px black, 0 0 3px black" }}
                >
                  {d.code}
                </span>
              )}
              <div className="relative group">
                {(isSelected || d.isManual) && (
                  <div
                    className={`absolute -inset-1.5 rounded-full animate-pulse ${
                      d.isManual
                        ? "border-2 border-red-500 shadow-[0_0_12px_red]"
                        : "border-2 border-white shadow-[0_0_8px_white]"
                    }`}
                  />
                )}
                <div
                  className={`${sizeClass} rounded-full overflow-hidden border-2 shadow-lg bg-slate-800 transition-all duration-200 group-hover:scale-110`}
                  style={{ borderColor: d.teamColor }}
                >
                  <img
                    src={d.image}
                    alt={d.code}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        e.target as HTMLImageElement
                      ).parentElement!.style.backgroundColor = d.teamColor;
                    }}
                  />
                </div>
                {d.isManual && (
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-bold px-1 rounded">
                    YOU
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-md text-[10px] text-white flex items-center gap-1 pointer-events-none z-50">
        <VideocamIcon sx={{ fontSize: 12 }} />
        {cameraMode.toUpperCase()} CAM
      </div>
    </div>
  );
}

// ============================================================
// Leaderboard — LIVE classification
// ============================================================
function Leaderboard({ manual }: { manual: ManualRace }) {
  const raceData = useReplayStore((s) => s.raceData);
  const frameIndex = useReplayStore((s) => s.frameIndex);
  const selectedDrivers = useReplayStore((s) => s.selectedDrivers);
  const toggleDriver = useReplayStore((s) => s.toggleDriver);

  const [modalDriver, setModalDriver] = useState<string | null>(null);

  const frame =
    raceData?.frames[
      clamp(Math.floor(frameIndex), 0, (raceData?.frames.length ?? 1) - 1)
    ];

  const rows = useMemo(() => {
    if (!frame) return [];

    const drivers = { ...frame.drivers };
    if (manual.active && manual.code && drivers[manual.code]) {
      delete drivers[manual.code];
    }

    const list = Object.entries(drivers).map(([code, d]) => ({
      code,
      name: d.name,
      image: d.image,
      distance: d.distance,
      tyre: d.tyre,
      speed: d.speed,
      gear: d.gear,
      drs: d.drs,
      isManual: false,
    }));

    if (manual.active && manual.code) {
      list.push({
        code: manual.code,
        name: manual.name,
        image: manual.image,
        distance: manual.distance,
        tyre: 1,
        speed: manual.speed,
        gear:
          manual.speed < 1 ? 1 : Math.min(8, Math.floor(manual.speed / 55) + 1),
        drs: 0,
        isManual: true,
      });
    }

    list.sort((a, b) => b.distance - a.distance);
    const leaderDist = list[0]?.distance ?? 0;
    return list.map((d, i) => ({
      ...d,
      position: i + 1,
      calculatedGap: i === 0 ? null : calculateGap(leaderDist, d.distance),
    }));
  }, [frame, manual.active, manual.code, manual.distance, manual.speed]);

  const activeDriver =
    modalDriver && frame ? rows.find((r) => r.code === modalDriver) : null;

  return (
    <>
      <div className="w-full bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col">
        <div className="px-1.5 sm:px-2 py-1 border-b border-slate-700 flex items-center gap-1.5 bg-slate-900">
          <LeaderboardIcon
            sx={{ fontSize: { xs: 14, md: 18 } }}
            className="text-gray-400"
          />
          <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">
            Live Classification
          </span>
          <span className="ml-auto text-[7px] sm:text-[9px] text-green-400 font-mono animate-pulse">
            ● LIVE
          </span>
        </div>
        <div className="max-h-[35vh] sm:max-h-[55vh] overflow-y-auto">
          {rows.map((r) => {
            const tyre = TYRE_COMPOUNDS[r.tyre] ?? TYRE_COMPOUNDS[3];
            const isSelected = selectedDrivers.includes(r.code);
            return (
              <motion.div
                key={r.code}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => setModalDriver(r.code)}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 cursor-pointer border-l-2 text-[9px] sm:text-xs ${
                  r.isManual
                    ? "bg-red-600/30 border-l-red-500 text-white"
                    : isSelected
                      ? "bg-red-600/20 border-l-red-600 text-white"
                      : "border-l-transparent hover:bg-slate-700/40 text-gray-300"
                }`}
              >
                <span className="font-mono w-3 sm:w-4 text-gray-400 text-[8px] sm:text-[10px]">
                  {r.position}
                </span>

                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full overflow-hidden bg-slate-700 border shrink-0"
                  style={{ borderColor: TEAM_COLORS[r.name] || "#fff" }}
                >
                  <img
                    src={r.image}
                    alt={r.code}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="font-bold flex-1">
                  {r.code}
                  {r.isManual && (
                    <span className="ml-1 text-[7px] bg-red-500 px-1 rounded">
                      YOU
                    </span>
                  )}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] text-gray-400 w-10 sm:w-12 text-right">
                  {fmtGap(r.calculatedGap)}
                </span>

                <span
                  className="text-[7px] sm:text-[8px] font-bold w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center ml-0.5 shrink-0"
                  style={{ backgroundColor: tyre.color, color: "#0a0e1a" }}
                >
                  {tyre.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {modalDriver && activeDriver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setModalDriver(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-3 sm:p-6 w-full max-w-70 sm:max-w-[320px] shadow-2xl text-white relative"
              style={{
                borderTop: `4px solid ${
                  TEAM_COLORS[activeDriver.name] || "#fff"
                }`,
              }}
            >
              <button
                onClick={() => setModalDriver(null)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-white"
              >
                <CloseIcon fontSize="small" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-700 border-2 shrink-0"
                  style={{
                    borderColor: TEAM_COLORS[activeDriver.name] || "#fff",
                  }}
                >
                  <img
                    src={activeDriver.image}
                    alt={modalDriver}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-lg sm:text-2xl font-bold block">
                    {modalDriver}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {activeDriver.name}
                  </span>
                </div>
                <span
                  className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ml-auto"
                  style={{
                    backgroundColor: TEAM_COLORS[activeDriver.name] || "#fff",
                    color: "#0a0e1a",
                  }}
                >
                  P{activeDriver.position}
                </span>
              </div>

              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-slate-700 pb-1 bg-slate-900/50 px-1.5 py-0.5 rounded">
                  <span className="text-gray-300 flex items-center gap-1 font-bold">
                    <TimerIcon sx={{ fontSize: 14 }} /> GAP
                  </span>
                  <span className="font-mono text-green-400 font-bold">
                    {fmtGap(activeDriver.calculatedGap)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-1 pt-1">
                  <span className="text-gray-400">Tyre</span>
                  <span className="font-bold">
                    {TYRE_COMPOUNDS[activeDriver.tyre]?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-1">
                  <span className="text-gray-400">Speed</span>
                  <span className="font-mono">
                    {fmtSpeed(activeDriver.speed)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-1">
                  <span className="text-gray-400">Gear</span>
                  <span className="font-mono">{activeDriver.gear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DRS</span>
                  <span
                    className={
                      activeDriver.drs ? "text-green-400" : "text-gray-500"
                    }
                  >
                    {activeDriver.drs ? "OPEN" : "OFF"}
                  </span>
                </div>
              </div>

              {!activeDriver.isManual && (
                <button
                  onClick={() => toggleDriver(modalDriver)}
                  className={`w-full py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-colors ${
                    selectedDrivers.includes(modalDriver)
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {selectedDrivers.includes(modalDriver)
                    ? "Remove from HUD"
                    : "Add to HUD"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// SessionBanner
// ============================================================
function SessionBanner({ manual }: { manual: ManualRace }) {
  const raceData = useReplayStore((s) => s.raceData);
  const lastMessage = useReplayStore((s) => s.lastMessage);
  const showSessionInfo = useReplayStore((s) => s.showSessionInfo);
  const frameIndex = useReplayStore((s) => s.frameIndex);

  if (!raceData || !lastMessage || !showSessionInfo) return null;
  const info = raceData.sessionInfo;
  const status = lastMessage.track_status;

  const timeString = manual.active
    ? formatRaceTime(manual.raceTime)
    : formatRaceTime(Math.floor(frameIndex) * 0.4);

  const lapDisplay = manual.active
    ? `${manual.laps + 1} / ${info.total_laps}`
    : `${lastMessage.session_data.lap} / ${lastMessage.session_data.total_laps}`;

  const leaderDisplay = manual.active ? "YOU" : lastMessage.session_data.leader;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border px-2 sm:px-4 py-1 sm:py-1.5 flex items-center gap-2 sm:gap-4 shadow-lg text-white transition-all max-w-[95vw] overflow-x-auto ${
        manual.active ? "border-red-600" : "border-slate-700"
      }`}
    >
      <div className="shrink-0 flex items-center gap-2 sm:gap-3">
        <div>
          <div className="text-[7px] sm:text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">
            {info.year} • R{info.round}
          </div>
          <div className="font-bold text-[9px] sm:text-xs md:text-sm truncate max-w-25 sm:max-w-none">
            {info.event_name}
            {manual.active && (
              <span className="ml-2 text-[8px] bg-red-600 px-1 rounded">
                MANUAL
              </span>
            )}
          </div>
        </div>
        <div className="ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-slate-600 flex flex-col items-center">
          <div className="text-[7px] sm:text-[8px] text-gray-400 flex items-center gap-0.5">
            <TimerIcon sx={{ fontSize: 10 }} /> TIME
          </div>
          <div
            className={`font-mono font-bold text-[10px] sm:text-sm ${
              manual.active ? "text-red-400" : "text-green-400"
            }`}
          >
            {timeString}
          </div>
        </div>
      </div>

      <div className="h-5 sm:h-6 w-px bg-slate-700 shrink-0" />
      <div className="shrink-0">
        <div className="text-[7px] sm:text-[9px] md:text-[10px] text-gray-400">
          LAP
        </div>
        <div className="font-mono font-bold text-[9px] sm:text-xs md:text-sm">
          {lapDisplay}
        </div>
      </div>

      <div className="h-5 sm:h-6 w-px bg-slate-700 shrink-0 hidden xs:block sm:block" />
      <div className="shrink-0 hidden xs:block sm:block">
        <div className="text-[7px] sm:text-[9px] md:text-[10px] text-gray-400">
          LEADER
        </div>
        <div className="font-mono font-bold text-[9px] sm:text-xs md:text-sm">
          {leaderDisplay}
        </div>
      </div>
      <div className="h-5 sm:h-6 w-px bg-slate-700 shrink-0" />
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <div
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: TRACK_STATUS_COLORS[status] }}
        />
        <span
          className="text-[8px] sm:text-[10px] md:text-xs font-bold"
          style={{ color: TRACK_STATUS_COLORS[status] }}
        >
          {TRACK_STATUS_LABEL[status]}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================
// DriverTelemetryPanel
// ============================================================
function DriverTelemetryPanel() {
  const raceData = useReplayStore((s) => s.raceData);
  const frameIndex = useReplayStore((s) => s.frameIndex);
  const selectedDrivers = useReplayStore((s) => s.selectedDrivers);
  const showHud = useReplayStore((s) => s.showHud);

  if (!raceData || !showHud || selectedDrivers.length === 0) return null;
  const frame =
    raceData.frames[
      clamp(Math.floor(frameIndex), 0, raceData.frames.length - 1)
    ];

  const leader = Object.values(frame.drivers).find((d) => d.position === 1);
  const leaderDist = leader ? leader.distance : 0;

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      {selectedDrivers.map((code) => {
        const d = frame.drivers[code];
        if (!d) return null;
        const tyre = TYRE_COMPOUNDS[d.tyre] ?? TYRE_COMPOUNDS[3];
        const gap =
          d.position === 1 ? null : calculateGap(leaderDist, d.distance);

        return (
          <motion.div
            key={code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border border-slate-700 p-1.5 sm:p-2 w-40 sm:w-56 md:w-64 shadow-lg text-white"
            style={{
              borderLeft: `3px solid ${TEAM_COLORS[d.name] || "#fff"}`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-slate-700 border shrink-0"
                  style={{ borderColor: TEAM_COLORS[d.name] || "#fff" }}
                >
                  <img
                    src={d.image}
                    alt={code}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-[10px] sm:text-sm md:text-base">
                  {code}
                </span>
              </div>
              <span
                className="text-[8px] sm:text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: tyre.color, color: "#0a0e1a" }}
              >
                {tyre.name}
              </span>
            </div>

            <div className="flex justify-between items-center text-[9px] sm:text-xs mb-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
              <span className="text-gray-400 font-bold text-[8px] sm:text-[10px]">
                GAP
              </span>
              <span
                className={`font-mono font-bold ${
                  gap === null ? "text-green-400" : "text-white"
                }`}
              >
                {fmtGap(gap)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 text-center">
              <div>
                <div className="text-[7px] sm:text-[8px] text-gray-400 uppercase">
                  Speed
                </div>
                <div className="font-mono font-bold text-[9px] sm:text-xs">
                  {fmtSpeed(d.speed)}
                </div>
              </div>
              <div>
                <div className="text-[7px] sm:text-[8px] text-gray-400 uppercase">
                  Gear
                </div>
                <div className="font-mono font-bold text-[9px] sm:text-xs">
                  {d.gear}
                </div>
              </div>
              <div>
                <div className="text-[7px] sm:text-[8px] text-gray-400 uppercase">
                  DRS
                </div>
                <div
                  className={`font-mono font-bold text-[9px] sm:text-xs ${
                    d.drs ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {d.drs ? "OPEN" : "OFF"}
                </div>
              </div>
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-[7px] sm:text-[8px] text-gray-400 mb-0.5">
                <span>Throttle</span>
                <span>{Math.round(d.throttle)}%</span>
              </div>
              <div className="h-0.5 sm:h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${d.throttle}%` }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// ManualDrivePanel
// ============================================================
function ManualDrivePanel({
  manual,
  onClose,
}: {
  manual: ManualRace;
  onClose: () => void;
}) {
  if (!manual.active) return null;

  const avg =
    manual.avgSpeedCount > 0 ? manual.avgSpeedSum / manual.avgSpeedCount : 0;
  const currentLapTime = manual.raceTime - manual.lapStartTime;
  const lapProgress =
    TRACK_LENGTH_M > 0 ? (manual.lapDistance / TRACK_LENGTH_M) * 100 : 0;
  const stopped = manual.laps >= 1 && manual.speed <= 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="bg-slate-900/95 backdrop-blur-xl rounded-xl border-2 border-red-600 shadow-2xl text-white w-64 sm:w-80 max-h-[85vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-red-600 px-3 py-2 flex items-center gap-2 z-10">
        <SportsMotorsportsIcon sx={{ fontSize: 20 }} />
        <span className="font-bold text-sm">MANUAL RACE</span>
        <span className="ml-auto font-mono text-sm font-bold">
          {manual.code}
        </span>
        <button
          onClick={onClose}
          className="ml-1 hover:bg-red-700 rounded p-0.5"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {stopped && (
        <div className="bg-amber-600/40 px-3 py-1.5 text-[10px] font-bold text-amber-200 flex items-center gap-1">
          <FlagIcon sx={{ fontSize: 12 }} /> LAP COMPLETE — PRESS W TO GO AGAIN
        </div>
      )}

      <div className="bg-slate-950 px-3 py-2 border-b border-slate-700">
        <div className="text-[9px] text-gray-400 flex items-center gap-1">
          <TimerIcon sx={{ fontSize: 10 }} /> RACE TIME
        </div>
        <div className="font-mono font-bold text-xl text-green-400">
          {formatRaceTime(manual.raceTime)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-700">
        <div className="bg-slate-800 rounded p-2 text-center">
          <div className="text-[9px] text-gray-400">LAP</div>
          <div className="font-mono font-bold text-2xl text-sky-400">
            {manual.laps + 1}
          </div>
        </div>
        <div className="bg-slate-800 rounded p-2 text-center">
          <div className="text-[9px] text-gray-400">COMPLETED</div>
          <div className="font-mono font-bold text-2xl text-emerald-400">
            {manual.laps}
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-slate-700">
        <div className="text-[9px] text-gray-400 mb-1">SPEED</div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold">
            {Math.round(manual.speed)}
          </span>
          <span className="text-xs text-gray-400">km/h</span>
          <span className="ml-auto font-mono text-xl font-bold text-emerald-400">
            {manual.speed < 1
              ? 1
              : Math.min(8, Math.floor(manual.speed / 55) + 1)}
          </span>
        </div>
        <div className="h-2 bg-slate-950 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-linear-to-r from-green-500 via-amber-500 to-red-600 transition-all"
            style={{ width: `${Math.min(100, (manual.speed / 650) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-700">
        <div>
          <div className="text-[9px] text-gray-400 mb-0.5">THROTTLE</div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${manual.throttle * 100}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-green-400 mt-0.5">
            {Math.round(manual.throttle * 100)}%
          </div>
        </div>
        <div>
          <div className="text-[9px] text-gray-400 mb-0.5">BRAKE</div>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: manual.brake ? "100%" : "0%" }}
            />
          </div>
          <div className="text-[9px] font-mono text-red-400 mt-0.5">
            {manual.brake ? "ON" : "OFF"}
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-slate-700">
        <div className="text-[9px] text-gray-400 mb-1">STEERING</div>
        <div className="relative h-3 bg-slate-950 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
          <div
            className="absolute top-0 h-full w-3 bg-white rounded transition-all"
            style={{ left: `calc(${50 + manual.steer * 45}% - 6px)` }}
          />
        </div>
      </div>

      <div className="p-2 border-b border-slate-700 space-y-1">
        <div className="text-[9px] text-gray-400 uppercase mb-1 flex items-center gap-1">
          <TimerIcon sx={{ fontSize: 10 }} /> Live Timing
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-400">Current Lap</span>
          <span className="font-mono text-emerald-400">
            {formatLapTime(currentLapTime)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-400">Last Lap</span>
          <span className="font-mono text-amber-400">
            {formatLapTime(manual.lastLapTime)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-400">Best Lap</span>
          <span className="font-mono text-purple-400">
            {formatLapTime(manual.bestLapTime)}
          </span>
        </div>
      </div>

      <div className="p-2 border-b border-slate-700 grid grid-cols-3 gap-1 text-center">
        <div>
          <div className="text-[8px] text-gray-400 flex items-center justify-center gap-0.5">
            <TrendingUpIcon sx={{ fontSize: 9 }} /> MAX
          </div>
          <div className="font-mono font-bold text-[11px] text-amber-400">
            {Math.round(manual.maxSpeed)}
          </div>
        </div>
        <div>
          <div className="text-[8px] text-gray-400">AVG</div>
          <div className="font-mono font-bold text-[11px] text-sky-400">
            {Math.round(avg)}
          </div>
        </div>
        <div>
          <div className="text-[8px] text-gray-400 flex items-center justify-center gap-0.5">
            <FlagIcon sx={{ fontSize: 9 }} /> LAPS
          </div>
          <div className="font-mono font-bold text-[11px] text-emerald-400">
            {manual.laps}
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-slate-700">
        <div className="flex justify-between text-[9px] text-gray-400 mb-1">
          <span>LAP PROGRESS</span>
          <span>{lapProgress.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all"
            style={{ width: `${lapProgress}%` }}
          />
        </div>
      </div>

      <div className="p-2 text-[9px] text-gray-400 flex justify-center gap-1 flex-wrap">
        <kbd className="px-1 bg-slate-950 rounded">W</kbd> Gas
        <kbd className="px-1 bg-slate-950 rounded">S</kbd> Brake
        <kbd className="px-1 bg-slate-950 rounded">A/D</kbd> Steer
      </div>
    </motion.div>
  );
}

// ============================================================
// ManualDriverPicker
// ============================================================
function ManualDriverPicker({
  show,
  onClose,
  onSelect,
  currentCode,
}: {
  show: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  currentCode: string | null;
}) {
  const raceData = useReplayStore((s) => s.raceData);
  const frameIndex = useReplayStore((s) => s.frameIndex);

  const frame =
    raceData?.frames[
      clamp(Math.floor(frameIndex), 0, (raceData?.frames.length ?? 1) - 1)
    ];

  const drivers = useMemo(() => {
    if (!frame) return [];
    return Object.entries(frame.drivers)
      .map(([code, d]) => ({ code, ...d }))
      .sort((a, b) => a.position - b.position);
  }, [frame]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-100 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-3 sm:p-5 w-full max-w-lg shadow-2xl text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-lg font-bold flex items-center gap-2">
                <SportsMotorsportsIcon sx={{ fontSize: 18 }} /> Start Your Own
                Race
              </h2>
              <button onClick={onClose}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mb-3">
              Pick a driver to start at <b>312 km/h</b> with your own timer and
              live stats. Holds speed automatically. After lap 1 it stops unless
              you press <kbd className="px-1 bg-slate-900 rounded">W</kbd>.
            </p>
            <div className="max-h-[50vh] overflow-y-auto space-y-1">
              {drivers.map((d) => (
                <button
                  key={d.code}
                  onClick={() => onSelect(d.code)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs sm:text-sm transition-colors ${
                    currentCode === d.code
                      ? "bg-red-600/30 border border-red-600"
                      : "hover:bg-slate-700/50 border border-transparent"
                  }`}
                >
                  <span className="font-mono w-5 text-gray-400">
                    {d.position}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 border shrink-0"
                    style={{ borderColor: TEAM_COLORS[d.name] || "#fff" }}
                  >
                    <img
                      src={d.image}
                      alt={d.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold flex-1">
                    {d.code}{" "}
                    <span className="text-gray-400 font-normal">
                      — {d.name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Controls
// ============================================================
function Controls({
  manual,
  cameraMode,
  onToggleCamera,
  onOpenPicker,
}: {
  manual: ManualRace;
  cameraMode: CameraMode;
  onToggleCamera: () => void;
  onOpenPicker: () => void;
}) {
  const store = useReplayStore();
  const { isPaused, playbackSpeed, raceData } = store;
  const progress = raceData
    ? (store.frameIndex / (raceData.frames.length - 1)) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border border-slate-700 p-1 sm:p-2 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1 sm:gap-2 shadow-lg w-[95vw] sm:w-auto sm:min-w-125 md:min-w-150 text-white"
    >
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          onClick={store.rewind}
          className="p-1 sm:p-1.5 rounded-md hover:bg-slate-700/60 transition-colors"
        >
          <FastRewindIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
        </button>
        <button
          onClick={store.togglePause}
          className="p-1 sm:p-1.5 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
        >
          {isPaused ? (
            <PlayArrowIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
          ) : (
            <PauseIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
          )}
        </button>
        <button
          onClick={store.fastForward}
          className="p-1 sm:p-1.5 rounded-md hover:bg-slate-700/60 transition-colors"
        >
          <FastForwardIcon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
        </button>
        <button
          onClick={store.restart}
          className="p-1 sm:p-1.5 rounded-md hover:bg-slate-700/60 transition-colors"
        >
          <RestartAlt sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center w-full sm:w-auto order-last sm:order-0 mt-1 sm:mt-0 px-2">
        <span className="text-[10px] sm:text-xs font-mono text-gray-400 font-bold tracking-widest uppercase">
          Race Progress: {progress.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900 rounded-md sm:rounded-lg px-1 sm:px-1.5 py-0.5">
        <SpeedIcon sx={{ fontSize: { xs: 12, sm: 14, md: 16 } }} />
        <span className="font-mono text-[9px] sm:text-xs md:text-sm w-6 sm:w-10 text-center">
          {playbackSpeed}x
        </span>
        <div className="flex flex-col">
          <button
            onClick={() => store.bumpSpeed(1)}
            className="hover:bg-slate-700 rounded transition-colors"
          >
            <KeyboardArrowUpIcon
              sx={{ fontSize: { xs: 10, sm: 12, md: 14 } }}
            />
          </button>
          <button
            onClick={() => store.bumpSpeed(-1)}
            className="hover:bg-slate-700 rounded transition-colors"
          >
            <KeyboardArrowDownIcon
              sx={{ fontSize: { xs: 10, sm: 12, md: 14 } }}
            />
          </button>
        </div>
      </div>

      <button
        onClick={onOpenPicker}
        className={`px-2 py-1 rounded-md text-[9px] sm:text-xs font-bold transition-colors flex items-center gap-1 ${
          manual.active
            ? "bg-red-600 text-white animate-pulse"
            : "bg-slate-700 hover:bg-slate-600 text-white"
        }`}
      >
        <SportsMotorsportsIcon sx={{ fontSize: 14 }} />
        <span className="hidden sm:inline">
          {manual.active ? `Driving ${manual.code}` : "Drive"}
        </span>
      </button>

      <button
        onClick={onToggleCamera}
        className="px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-[9px] sm:text-xs font-bold flex items-center gap-1"
        title="Cycle camera"
      >
        <VideocamIcon sx={{ fontSize: 14 }} />
        <span className="hidden sm:inline">{cameraMode.toUpperCase()}</span>
      </button>

      <button
        onClick={() => store.toggle("showControlsHelp")}
        className="p-1 sm:p-1.5 rounded-md hover:bg-slate-700/60 transition-colors"
      >
        <HelpOutlined sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
      </button>
    </motion.div>
  );
}

// ============================================================
// ControlsHelp
// ============================================================
function ControlsHelp() {
  const show = useReplayStore((s) => s.showControlsHelp);
  const toggle = useReplayStore((s) => s.toggle);

  const rows: [string, string][] = [
    ["Space / P", "Pause / Resume"],
    ["← / →", "Rewind / Fast Forward"],
    ["↑ / ↓", "Playback Speed"],
    ["R", "Restart"],
    ["H", "Toggle help"],
    ["Esc", "Exit replay"],
    ["D", "Toggle DRS zones"],
    ["L", "Toggle driver names"],
    ["M", "Start manual race"],
    ["V", "Cycle camera"],
    ["W / S", "Throttle / Brake (driving)"],
    ["A / D", "Steer (driving)"],
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-2 sm:p-4"
          onClick={() => toggle("showControlsHelp")}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-3 sm:p-6 w-full max-w-[320px] sm:max-w-105 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-lg font-bold">Controls</h2>
              <button onClick={() => toggle("showControlsHelp")}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {rows.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between items-center text-[10px] sm:text-sm"
                >
                  <kbd className="px-1 sm:px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[9px] sm:text-xs">
                    {k}
                  </kbd>
                  <span className="text-gray-300">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// ChampionshipPanels
// ============================================================
function ChampionshipPanels() {
  const raceData = useReplayStore((s) => s.raceData);
  const showDriver = useReplayStore((s) => s.showDriverStandings);
  const showConstructor = useReplayStore((s) => s.showConstructorStandings);

  if (!raceData) return null;

  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <AnimatePresence>
        {showDriver && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border border-slate-700 w-32 sm:w-56 overflow-hidden shadow-lg text-white"
          >
            <div className="px-1.5 sm:px-2 py-1 bg-slate-900 border-b border-slate-700 flex items-center gap-1">
              <LeaderboardIcon
                sx={{ fontSize: { xs: 10, sm: 14 } }}
                className="text-gray-400"
              />
              <span className="text-[8px] sm:text-xs font-bold uppercase text-gray-200">
                Drivers
              </span>
            </div>
            <div className="max-h-32 sm:max-h-60 overflow-y-auto">
              {raceData.driverStandings.map((s) => (
                <div
                  key={s.code}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] sm:text-xs"
                >
                  <span className="font-mono w-3 text-gray-400">
                    {s.position}
                  </span>
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full overflow-hidden bg-slate-700 border shrink-0"
                    style={{ borderColor: TEAM_COLORS[s.name] || "#fff" }}
                  >
                    <img
                      src={s.image}
                      alt={s.code}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-bold flex-1">{s.code}</span>
                  <span className="font-mono text-gray-400 hidden sm:inline">
                    {s.gap !== null ? fmtGap(s.gap) : "LEADER"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {showConstructor && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-md sm:rounded-xl border border-slate-700 w-32 sm:w-56 overflow-hidden shadow-lg text-white"
          >
            <div className="px-1.5 sm:px-2 py-1 bg-slate-900 border-b border-slate-700 flex items-center gap-1">
              <GroupsIcon
                sx={{ fontSize: { xs: 10, sm: 14 } }}
                className="text-gray-400"
              />
              <span className="text-[8px] sm:text-xs font-bold uppercase text-gray-200">
                Constructors
              </span>
            </div>
            <div className="max-h-32 sm:max-h-60 overflow-y-auto">
              {raceData.constructorStandings.map((s) => (
                <div
                  key={s.team}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[8px] sm:text-xs"
                >
                  <span className="font-mono w-3 text-gray-400">
                    {s.position}
                  </span>
                  <span
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-bold flex-1 truncate">{s.team}</span>
                  <span className="font-mono text-gray-400 hidden sm:inline">
                    {s.gap !== null ? fmtGap(s.gap) : "LEADER"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// RaceReplay — main
// ============================================================
export function RaceReplay() {
  const store = useReplayStore();
  const lastTickRef = useRef<number>(performance.now());

  const [manual, setManual] = useState<ManualRace>(makeEmptyManualRace());
  const manualRef = useRef<ManualRace>(manual);
  useEffect(() => {
    manualRef.current = manual;
  }, [manual]);

  const [cameraMode, setCameraMode] = useState<CameraMode>("top");
  const [showPicker, setShowPicker] = useState(false);
  const [showManualPanel, setShowManualPanel] = useState(true);

  const keysRef = useRef<Set<string>>(new Set());

  // Replay tick (background world)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      useReplayStore.getState().tick(delta);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ===== Independent manual race loop — immune to playbackSpeed =====
  useEffect(() => {
    if (!manual.active) return;
    let raf = 0;
    let prev = performance.now();

    const step = () => {
      const now = performance.now();
      const dtMs = Math.min(now - prev, 50);
      prev = now;
      const dt = dtMs / 1000;

      const m = manualRef.current;
      const st = useReplayStore.getState();
      const data = st.raceData;
      if (!data || !m.active) {
        raf = requestAnimationFrame(step);
        return;
      }

      // ===== Physics =====
      const MAX_SPEED = 650;
      const MIN_SPEED = 0;
      const THROTTLE_ACCEL = 250;
      const BRAKE_DECEL = 400;
      const STOP_DECEL = 80;

      let speed = m.speed;
      const throttle = m.throttle;
      const brake = m.brake;
      const steer = m.steer;

      const stoppedAfterLap = m.laps >= 1 && speed <= 0.5;

      if (brake) {
        speed = Math.max(MIN_SPEED, speed - BRAKE_DECEL * dt);
      } else if (throttle > 0) {
        const ratio = speed / MAX_SPEED;
        const accelFactor = Math.max(0.15, 1 - Math.pow(ratio, 2.5));
        speed = Math.min(
          MAX_SPEED,
          speed + THROTTLE_ACCEL * throttle * accelFactor * dt,
        );
      } else if (stoppedAfterLap) {
        speed = 0;
      } else if (m.laps >= 1 && m.throttleReleasedAfterLap) {
        speed = Math.max(MIN_SPEED, speed - STOP_DECEL * dt);
      } else {
        speed = m.speed; // hold constant
      }

      if (Math.abs(steer) > 0.3 && speed > 0) {
        speed = Math.max(MIN_SPEED, speed - Math.abs(steer) * 15 * dt);
      }

      // ===== Distance & laps =====
      const mps = (speed * 1000) / 3600;
      const distanceDelta = mps * dt;
      const newDistance = m.distance + distanceDelta;
      const newLapDistance = newDistance % TRACK_LENGTH_M;
      const newLaps = Math.floor(newDistance / TRACK_LENGTH_M);

      const newRaceTime = m.raceTime + dt;
      let newLapStartTime = m.lapStartTime;
      let newLastLapTime = m.lastLapTime;
      let newBestLapTime = m.bestLapTime;
      let newLapTimes = m.lapTimes;

      if (newLaps > m.laps) {
        const lapSeconds = newRaceTime - m.lapStartTime;
        if (lapSeconds > 5 && lapSeconds < 600) {
          newLastLapTime = lapSeconds;
          if (newBestLapTime === 0 || lapSeconds < newBestLapTime) {
            newBestLapTime = lapSeconds;
          }
          newLapTimes = [...m.lapTimes, lapSeconds];
        }
        newLapStartTime = newRaceTime;
      }

      // ===== Position on polyline =====
      const poly = data.trackPolyline;
      const pts = poly.length;
      let x = m.x;
      let y = m.y;
      let heading = m.heading;
      if (pts > 1) {
        const prog = (newLapDistance / TRACK_LENGTH_M) % 1;
        const idx = Math.floor(prog * pts) % pts;
        const nIdx = (idx + 1) % pts;
        const a = poly[idx];
        const b = poly[nIdx];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const frac = (prog * pts) % 1;
        const bx = a.x + dx * frac;
        const by = a.y + dy * frac;
        const lateralOffset = steer * 6;
        x = bx + nx * lateralOffset;
        y = by + ny * lateralOffset;
        heading = Math.atan2(dy, dx);
      }

      const throttleHeld = throttle > 0 || brake;
      const throttleReleasedAfterLap =
        newLaps >= 1 && !throttleHeld ? true : false;

      const newMax = Math.max(m.maxSpeed, speed);

      setManual({
        ...m,
        speed,
        distance: newDistance,
        lapDistance: newLapDistance,
        laps: newLaps,
        raceTime: newRaceTime,
        lapStartTime: newLapStartTime,
        lastLapTime: newLastLapTime,
        bestLapTime: newBestLapTime,
        lapTimes: newLapTimes,
        maxSpeed: newMax,
        avgSpeedSum: m.avgSpeedSum + speed,
        avgSpeedCount: m.avgSpeedCount + 1,
        x,
        y,
        heading,
        throttleReleasedAfterLap,
      });

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [manual.active]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const s = useReplayStore.getState();
      const k = e.key.toLowerCase();
      const driving = !!manualRef.current.active;
      const driveKeys = [
        "w",
        "s",
        "a",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ];

      if (driving && driveKeys.includes(k)) {
        e.preventDefault();
        keysRef.current.add(k);
        const up = keysRef.current.has("w") || keysRef.current.has("arrowup");
        const down =
          keysRef.current.has("s") || keysRef.current.has("arrowdown");
        const left =
          keysRef.current.has("a") || keysRef.current.has("arrowleft");
        const right =
          keysRef.current.has("d") || keysRef.current.has("arrowright");
        setManual((m) => ({
          ...m,
          throttle: up ? 1 : 0,
          brake: down,
          steer: (right ? 1 : 0) - (left ? 1 : 0),
        }));
        return;
      }

      switch (e.key) {
        case " ":
        case "p":
        case "P":
          e.preventDefault();
          s.togglePause();
          break;
        case "ArrowLeft":
          if (!driving) s.rewind();
          break;
        case "ArrowRight":
          if (!driving) s.fastForward();
          break;
        case "ArrowUp":
          if (!driving) {
            e.preventDefault();
            s.bumpSpeed(1);
          }
          break;
        case "ArrowDown":
          if (!driving) {
            e.preventDefault();
            s.bumpSpeed(-1);
          }
          break;
        case "r":
        case "R":
          s.restart();
          break;
        case "h":
        case "H":
          s.toggle("showControlsHelp");
          break;
        case "d":
        case "D":
          s.toggle("showDrsZones");
          break;
        case "l":
        case "L":
          s.toggle("showNames");
          break;
        case "i":
        case "I":
          s.toggle("showSessionInfo");
          break;
        case "c":
        case "C":
          s.toggle("showDriverStandings");
          break;
        case "a":
        case "A":
          if (!driving) s.toggle("showConstructorStandings");
          break;
        case "m":
        case "M":
          setShowPicker(true);
          break;
        case "v":
        case "V":
          setCameraMode((c) =>
            c === "top" ? "chase" : c === "chase" ? "front" : "top",
          );
          break;
        case "Escape":
          s.exitReplay();
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      if (!manualRef.current.active) return;
      const up = keysRef.current.has("w") || keysRef.current.has("arrowup");
      const down = keysRef.current.has("s") || keysRef.current.has("arrowdown");
      const left = keysRef.current.has("a") || keysRef.current.has("arrowleft");
      const right =
        keysRef.current.has("d") || keysRef.current.has("arrowright");
      setManual((m) => ({
        ...m,
        throttle: up ? 1 : 0,
        brake: down,
        steer: (right ? 1 : 0) - (left ? 1 : 0),
      }));
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Fresh manual race starting at 312 km/h
  const selectManualDriver = useCallback((code: string) => {
    const st = useReplayStore.getState();
    if (!st.raceData) return;
    const idx = clamp(
      Math.floor(st.frameIndex),
      0,
      st.raceData.frames.length - 1,
    );
    const d = st.raceData.frames[idx]?.drivers[code];
    if (!d) return;
    const poly = st.raceData.trackPolyline;
    const startPt = poly[0] ?? { x: 0, y: 0 };

    setManual({
      ...makeEmptyManualRace(),
      active: true,
      code,
      name: d.name,
      image: d.image,
      teamColor: TEAM_COLORS[d.name] || "#fff",
      speed: 312,
      maxSpeed: 312,
      distance: 0,
      lapDistance: 0,
      raceTime: 0,
      lapStartTime: 0,
      x: startPt.x,
      y: startPt.y,
      heading: 0,
      throttle: 0,
      brake: false,
      steer: 0,
      throttleReleasedAfterLap: false,
    });
    setShowPicker(false);
    setShowManualPanel(true);
    setCameraMode("chase");
  }, []);

  if (!store.raceData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen w-screen relative overflow-hidden bg-[#0a0e1a] flex flex-col"
    >
      <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-2 md:p-4 lg:p-6 z-0">
        <div className="w-full h-full relative">
          <TrackCanvas manual={manual} cameraMode={cameraMode} />
        </div>
      </div>

      <div className="absolute top-1 sm:top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <SessionBanner manual={manual} />
        </div>
      </div>

      <div className="absolute top-10 sm:top-14 md:top-20 left-1 sm:left-2 md:left-4 z-40 w-36 sm:w-48 md:w-64 lg:w-72">
        <Leaderboard manual={manual} />
      </div>

      <div className="absolute top-10 sm:top-14 md:top-20 right-1 sm:right-2 md:right-4 z-40">
        <ChampionshipPanels />
      </div>

      <div className="absolute bottom-12 sm:bottom-16 md:bottom-24 left-1 sm:left-2 md:left-4 z-40">
        <DriverTelemetryPanel />
      </div>

      <AnimatePresence>
        {manual.active && showManualPanel && (
          <div className="absolute top-32 sm:top-40 right-2 sm:right-4 z-40">
            <ManualDrivePanel
              manual={manual}
              onClose={() => setShowManualPanel(false)}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex justify-center w-full px-1 sm:px-2">
        <Controls
          manual={manual}
          cameraMode={cameraMode}
          onToggleCamera={() =>
            setCameraMode((c) =>
              c === "top" ? "chase" : c === "chase" ? "front" : "top",
            )
          }
          onOpenPicker={() => setShowPicker(true)}
        />
      </div>

      <ControlsHelp />
      <ManualDriverPicker
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={selectManualDriver}
        currentCode={manual.code}
      />
    </motion.div>
  );
}
