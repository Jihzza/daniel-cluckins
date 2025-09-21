// src/components/ui/SectionCta.jsx
import { useEffect, useRef, useState, cloneElement, isValidElement } from "react";

/**
 * Exact-crossing Section CTA (container-aware)
 * - FLOATS above bottom nav while the section is on screen.
 * - When the floating button’s TOP crosses the docked button’s TOP while scrolling *down* → DOCK.
 * - When scrolling *up* and the floating TOP crosses upward over the docked TOP → FLOAT.
 * - Once docked, it can persist while leaving downward (like the working project).
 * - Uses the scroll container (if present) as the visibility root so the CTA hides correctly
 *   when the section leaves the container’s viewport.
 */
export default function SectionCta({ sectionRef, children, minVisibleRatio = 0.25 }) {
  const anchorRef = useRef(null);    // exact TOP of the docked button
  const floatWrapRef = useRef(null); // floating wrapper (to measure actual height)

  const [mode, setMode] = useState("hidden"); // 'hidden' | 'floating' | 'docked'
  const [persistDocked, setPersistDocked] = useState(false);
  const [navOffset, setNavOffset] = useState(64); // fallback to 4rem if nav not found
  const [sectionOnScreen, setSectionOnScreen] = useState(false);
  const [floatH, setFloatH] = useState(0);

  const lastScrollYRef = useRef(0);
  const dirRef = useRef("down");          // 'down' | 'up'
  const lastDeltaRef = useRef(null);      // previous (topFloating - anchorTop)
  const scheduledRef = useRef(false);     // rAF throttle
  const prevModeRef = useRef(mode);       // for transition control
  const scrollerRef = useRef(null);       // scroll container if present

  const BOTTOM_PAD = 12; // breathing room above nav

  // Find first scrollable ancestor of the section (overflow-y: auto|scroll)
  const getScrollParent = (node) => {
    for (let p = node && node.parentElement; p; p = p.parentElement) {
      const oy = getComputedStyle(p).overflowY;
      if (/(auto|scroll|overlay)/.test(oy) && p.scrollHeight > p.clientHeight) return p;
    }
    return null;
  };

  // Resolve and store the scroller once
  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;
    scrollerRef.current = getScrollParent(el);
  }, [sectionRef]);

  // Measure bottom nav (and keep updated)
  useEffect(() => {
    const nav = document.getElementById("bottom-nav");
    const readNav = () => setNavOffset(nav?.offsetHeight ?? 64);

    readNav();
    const ro = nav ? new ResizeObserver(readNav) : null;
    ro?.observe(nav);

    const onVVResize = () => readNav();
    window.addEventListener("resize", onVVResize);
    window.visualViewport?.addEventListener("resize", onVVResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onVVResize);
      window.visualViewport?.removeEventListener("resize", onVVResize);
    };
  }, []);

  // Measure floating wrapper height (keeps topFloating exact)
  useEffect(() => {
    const el = floatWrapRef.current;
    if (!el) return;
    const measure = () => setFloatH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  // Gate: section must be on screen before we allow FLOATING to be shown
  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;

    const rootEl = scrollerRef.current || null;
    const thresholds = [0, minVisibleRatio, 1];
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setSectionOnScreen(e.isIntersecting && e.intersectionRatio >= minVisibleRatio);
      },
      { root: rootEl, rootMargin: "0px", threshold: thresholds }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sectionRef, minVisibleRatio]);

  // Initial “am I on screen now?” (before IO fires) — use the same root
  useEffect(() => {
    const el = sectionRef?.current;
    if (!el) return;

    const rootEl = scrollerRef.current;
    const r = el.getBoundingClientRect();

    if (rootEl) {
      const cr = rootEl.getBoundingClientRect();
      const visiblePx = Math.max(0, Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top));
      const ratio = r.height > 0 ? visiblePx / r.height : 0;
      if (ratio >= minVisibleRatio) setSectionOnScreen(true);
    } else {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const vt = window.visualViewport?.offsetTop ?? 0;
      const vb = vt + vh;
      const visiblePx = Math.max(0, Math.min(r.bottom, vb) - Math.max(r.top, vt));
      const ratio = r.height > 0 ? visiblePx / r.height : 0;
      if (ratio >= minVisibleRatio) setSectionOnScreen(true);
    }
  }, [sectionRef, minVisibleRatio]);

  // Compute & switch modes on exact crossing
  const compute = () => {
    const anchorEl = anchorRef.current;
    if (!anchorEl) return;

    // If section is off-screen and we haven't docked yet, keep hidden
    if (!sectionOnScreen && !persistDocked) {
      if (mode !== "hidden") setMode("hidden");
      lastDeltaRef.current = null;
      return;
    }

    // Visual viewport gives correct geometry with on-screen keyboards (mobile)
    const vvTop = window.visualViewport?.offsetTop ?? 0;
    const vvH = window.visualViewport?.height ?? window.innerHeight;
    const viewportBottom = vvTop + vvH;

    // Top of the floating button (fixed to the *window*), above the bottom nav
    const topFloating = viewportBottom - navOffset - BOTTOM_PAD - floatH;

    // Exact top of the docked button (in window coordinates)
    const anchorTop = anchorEl.getBoundingClientRect().top;

    // Negative => floating top is above anchor; Positive => passed anchor (crossed downward)
    const delta = topFloating - anchorTop;

    // Scroll direction detection (container-aware)
    const scroller = scrollerRef.current;
    const baseY = scroller ? scroller.scrollTop : (window.scrollY ?? window.pageYOffset ?? 0);
    const currentY = baseY + (scroller ? 0 : vvTop);
    if (currentY > lastScrollYRef.current) dirRef.current = "down";
    else if (currentY < lastScrollYRef.current) dirRef.current = "up";
    lastScrollYRef.current = currentY;

    // First pass after visibility: set base state by geometry only
    if (lastDeltaRef.current === null) {
      if (delta <= 0) {
        setMode("floating");
        setPersistDocked(false);
      } else {
        setMode("docked");
        setPersistDocked(true); // if we loaded past the anchor, start docked and persist
      }
      lastDeltaRef.current = delta;
      return;
    }

    const prev = lastDeltaRef.current; // previous delta

    // Exact-crossing logic: change only on sign change, based on direction
    if (dirRef.current === "down" && prev <= 0 && delta > 0) {
      setMode("docked");
      setPersistDocked(true);   // once docked, remain visible even off-screen
    } else if (dirRef.current === "up" && prev >= 0 && delta < 0) {
      setMode("floating");
      setPersistDocked(false);  // stop persisting when we re-enter floating
    } else if (persistDocked) {
      // If no crossing and we're persisting, ensure we stay docked.
      if (mode !== "docked") setMode("docked");
    }

    lastDeltaRef.current = delta;
  };

  // rAF-throttled listeners for smoothness (window + container)
  useEffect(() => {
    const onScrollOrResize = () => {
      if (scheduledRef.current) return;
      scheduledRef.current = true;
      requestAnimationFrame(() => {
        scheduledRef.current = false;
        compute();
      });
    };

    // run once initially
    compute();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    window.visualViewport?.addEventListener("scroll", onScrollOrResize);
    window.visualViewport?.addEventListener("resize", onScrollOrResize);

    const scroller = scrollerRef.current;
    let ro = null;
    if (scroller) {
      scroller.addEventListener("scroll", onScrollOrResize, { passive: true });
      ro = new ResizeObserver(onScrollOrResize);
      ro.observe(scroller);
    }

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.visualViewport?.removeEventListener("scroll", onScrollOrResize);
      window.visualViewport?.removeEventListener("resize", onScrollOrResize);
      if (scroller) {
        scroller.removeEventListener("scroll", onScrollOrResize);
        ro?.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionOnScreen, navOffset, floatH]);

  // Only fade when entering/leaving HIDDEN; no fade between floating <-> docked
  useEffect(() => {
    prevModeRef.current = mode;
  }, [mode]);
  const fadeClass =
    mode === "hidden" || prevModeRef.current === "hidden" ? "transition-opacity duration-150" : "transition-none";

  // Ensure both copies share identical styling; we pass noOuterPadding
  const renderBtn = () => {
    if (isValidElement(children)) return cloneElement(children, { noOuterPadding: true });
    return children;
  };

  return (
    <>
      {/* Anchor at the exact TOP of the docked button */}
      <div>
        <div ref={anchorRef} className="h-0 w-0 pointer-events-none" aria-hidden />
        <div
          aria-hidden={mode !== "docked"}
          className={[
            fadeClass,
            mode === "docked" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {renderBtn()}
        </div>
      </div>

      {/* Floating copy (fixed above bottom nav) */}
      <div
        ref={floatWrapRef}
        aria-hidden={mode !== "floating"}
        className={[
          "fixed inset-x-0 z-[60] flex justify-center",
          fadeClass,
          mode === "floating" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ bottom: `calc(${navOffset}px + ${BOTTOM_PAD}px)` }}
      >
        {renderBtn()}
      </div>
    </>
  );
}
