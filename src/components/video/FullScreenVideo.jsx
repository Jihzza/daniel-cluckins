import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * FullScreenVideo
 * Custom React + Tailwind video player
 * Behaviors:
 * - Page (not fullscreen): controls hidden; single click -> enter fullscreen
 * - Fullscreen: single click -> play/pause; double click -> exit fullscreen
 * - Timeline, play/pause, mute, ±10s seek, fullscreen button
 * - Keyboard: Space (play/pause), M (mute), F (fullscreen), ←/→ (±5s)
 */
export default function FullScreenVideo({
  src,
  poster,
  autoPlay = false,
  muted = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFsActive, setIsFsActive] = useState(false);
  const [usePseudoFs, setUsePseudoFs] = useState(false);
  const isFullscreen = isFsActive || usePseudoFs;

  // click aggregator for distinguishing single vs double
  const clickTimerRef = useRef(null);
  const DOUBLE_TAP_MS = 220; // adjust if you want

  const fmt = (t) => {
    if (!Number.isFinite(t)) return "0:00";
    const s = Math.max(0, Math.floor(t));
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  const fsEnabled = useMemo(() => {
    if (typeof document === "undefined") return false;
    return (
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }, []);

  // ---- Video event wiring ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => setDuration(video.duration || 0);
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolume = () => setIsMuted(video.muted);

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolume);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolume);
    };
  }, []);

  // Track native fullscreen changes
  useEffect(() => {
    const onFsChange = () => {
      const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFsActive(active);
      if (!active) setUsePseudoFs(false);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  // Set initial muted state and handle fullscreen mute/unmute behavior
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial muted state
    video.muted = muted;
    setIsMuted(muted);
  }, [muted]);

  // Handle mute/unmute based on fullscreen state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isFullscreen) {
      // When entering fullscreen, unmute and continue playing
      video.muted = false;
      setIsMuted(false);
      if (autoPlay && video.paused) {
        video.play().catch(() => {});
      }
    } else {
      // When exiting fullscreen, mute and continue playing
      video.muted = true;
      setIsMuted(true);
      if (autoPlay && video.paused) {
        video.play().catch(() => {});
      }
    }
  }, [isFullscreen, autoPlay]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key?.toLowerCase() === "m") {
        toggleMute();
      } else if (e.key?.toLowerCase() === "f") {
        toggleFullscreen();
      } else if (e.key === "ArrowRight") {
        seekBy(5);
      } else if (e.key === "ArrowLeft") {
        seekBy(-5);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying, isMuted, duration, currentTime, isFullscreen]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
    };
  }, []);

  // ---- Controls ----
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      const p = video.play();
      if (p?.catch) p.catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seekTo = (time) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(time)) return;
    const t = Math.min(Math.max(0, time), duration || 0);
    video.currentTime = t;
    setCurrentTime(t);
  };

  const seekBy = (delta) => seekTo(currentTime + delta);

  const handleScrub = (e) => {
    const value = Number(e.target.value);
    seekTo(value);
  };

  const exitFullscreenOnly = async () => {
    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
        else if (document.msExitFullscreen) await document.msExitFullscreen();
      } else if (usePseudoFs) {
        setUsePseudoFs(false);
      }
    } catch {}
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    // 1) Standard Fullscreen API
    try {
      if (fsEnabled) {
        if (
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        ) {
          await exitFullscreenOnly();
        } else {
          if (container.requestFullscreen) await container.requestFullscreen({ navigationUI: "hide" });
          else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen();
          else if (container.mozRequestFullScreen) await container.mozRequestFullScreen();
          else if (container.msRequestFullscreen) await container.msRequestFullscreen();
        }
        return;
      }
    } catch {
      // fall through
    }

    // 2) iOS Safari fallback
    try {
      if (video && typeof video.webkitEnterFullscreen === "function") {
        video.webkitEnterFullscreen(); // native iOS fullscreen
        return;
      }
    } catch {}

    // 3) Pseudo fullscreen overlay
    setUsePseudoFs((v) => !v);
  };

  // ---- CLICK BEHAVIOR RULES ----
  const onVideoClick = (e) => {
    // If not fullscreen: single click immediately enters fullscreen
    if (!isFullscreen) {
      toggleFullscreen();
      return;
    }

    // In fullscreen: single click -> play/pause, double -> exit
    // Use event.detail where available; also use a short timeout for mobile where dblclick may not fire.
    const clicks = e.detail || 1; // MDN: UIEvent.detail is click count
    if (clicks >= 2) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      // double click/tap -> exit fullscreen
      exitFullscreenOnly();
      return;
    }

    // single click -> delay briefly to see if a second click arrives
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      togglePlay();
      clickTimerRef.current = null;
    }, DOUBLE_TAP_MS);
  };

  return (
    <div
      ref={containerRef}
      className={[
        "group relative",
        isFullscreen ? "fixed inset-0 z-50" : "",
        className,
      ].join(" ")}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full rounded-xl object-contain select-none shadow-xl"
        playsInline
        controls={false}
        autoPlay={autoPlay}
        muted={muted}
        loop
        preload="metadata"
        onClick={onVideoClick}
      />

      {/* Controls overlay:
          - NOT fullscreen: completely hidden (no hover reveal)
          - Fullscreen: always visible */}
      <div
        className={[
          "pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3",
          "bg-gradient-to-t from-black/70 via-black/30 to-transparent",
          isFullscreen ? "opacity-100" : "opacity-0", // <- changed (removed hover reveal)
          "transition-opacity duration-200",
        ].join(" ")}
        role="group"
        aria-label="Video controls"
      >
        {/* Timeline */}
        <div className="flex items-center gap-3">
          <span className="w-10 text-right text-xs tabular-nums text-white/80">
            {fmt(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={Math.max(0.1, duration)}
            step={0.01}
            value={currentTime}
            onChange={handleScrub}
            aria-label="Seek"
            className={[
              "w-full appearance-none accent-indigo-500",
              "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full",
              "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:-mt-1.5",
              "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full",
              "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white",
              "cursor-pointer",
            ].join(" ")}
          />

          <span className="w-10 text-xs tabular-nums text-white/80">
            {fmt(duration)}
          </span>
        </div>

        {/* Primary controls */}
        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="rounded-full bg-black/10 p-2 hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/30"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="rounded-full bg-black/10 p-2 hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/30"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12l3.5 3.5-1.5 1.5L15 13.5 11.5 17H8l-4-4 4-4h3.5L15 10.5l3.5-3.5 1.5 1.5L16.5 12z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zm-2.5-8v2a8 8 0 010 12v2a10 10 0 000-16z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick seek */}
            <button
              onClick={() => seekBy(-10)}
              className="rounded-full bg-black/10 px-3 py-1 text-sm hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/30"
              aria-label="Rewind 10 seconds"
            >
              -10s
            </button>
            <button
              onClick={() => seekBy(10)}
              className="rounded-full bg-black/10 px-3 py-1 text-sm hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/30"
              aria-label="Forward 10 seconds"
            >
              +10s
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="rounded-full bg-black/10 p-2 hover:bg-white/20 focus:outline-none focus:ring focus:ring-white/30"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm12 5h-5v-2h3v-3h2v5zM7 5h3V3H5v5h2V5zm12 0v3h-3v2h5V3h-2z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm12 5h-5v-2h3v-3h2v5zM7 5h3V3H5v5h2V5zm12 0v3h-3v2h5V3h-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
