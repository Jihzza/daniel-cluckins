// PitchDeckGrid.jsx — dedicated grid with InfoBlock-like square cards
import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";

function PitchDeckCard({
  label,
  image,
  imageAlt,
  index,
  isActive,
  isTabbable,
  onSelect,
  onKeyDown,
  tabId,
  panelId,
  focusRef,
  showLabels = true,
  imageSize = "w-16 h-16",
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.button
      layout
      initial={false}
      ref={focusRef}
      role="button"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isTabbable ? 0 : -1}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(index)}
      className={[
        "flex flex-col items-center justify-center gap-2 w-full rounded-2xl",
        "text-center",
        "cursor-pointer",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#002147] p-4 w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
        {image && (
          <img
            src={image}
            alt={imageAlt ?? ""}
            className={`${imageSize} object-contain pointer-events-none select-none`}
            {...(!imageAlt ? { "aria-hidden": true } : {})}
          />
        )}
      </div>
      {showLabels && (
        <span className="text-white text-sm md:text-base font-normal mt-2">{label}</span>
      )}
    </motion.button>
  );
}

function useCols() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setCols(mql.matches ? 4 : 2);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return cols;
}

export default function PitchDeckGrid({
  items = [],
  showLabels = true,
  imageSize = "w-16 h-16",
  fixedHeight = true,
  showExpandedImage = true,
}) {
  const normalized = useMemo(
    () =>
      (items || []).map((it) =>
        typeof it === "string"
          ? { label: it, paragraph: "" }
          : {
              id: it.id,
              label: it.label ?? it.name ?? "",
              paragraph: it.paragraph ?? it.subtitle ?? "",
              image: it.image,
              imageAlt: it.imageAlt,
              expandedImage: it.expandedImage,
            }
      ),
    [items]
  );

  const cols = useCols();
  const [active, setActive] = useState(null);
  const listId = useId();
  const prefersReduced = useReducedMotion();
  const tabRefs = useRef([]);

  useEffect(() => {
    tabRefs.current = new Array(normalized.length);
  }, [normalized.length]);

  // --- Preload & decode expanded images on mount so they are instant when panel opens ---
  useEffect(() => {
    const urls = normalized.map((it) => it.expandedImage).filter(Boolean);
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      // Decode ahead of time so first paint is instant
      img.decode?.().catch(() => {});
    });
  }, [normalized]);

  const ids = useMemo(() => {
    const uid = listId?.toString().replace(/:/g, "") || "pitchdeck";
    return normalized.map((_, i) => ({ tabId: `${uid}-tab-${i}`, panelId: `${uid}-panel-${i}` }));
  }, [normalized.length, listId]);

  const onKeyDown = (e, index) => {
    const last = normalized.length - 1;
    const colCount = cols;
    const row = Math.floor(index / colCount);
    let next = index;
    switch (e.key) {
      case "ArrowRight":
        next = Math.min(index + 1, last);
        break;
      case "ArrowLeft":
        next = Math.max(index - 1, 0);
        break;
      case "ArrowDown":
        next = Math.min(index + colCount, last);
        break;
      case "ArrowUp":
        next = Math.max(index - colCount, 0);
        break;
      case "Home":
        next = row * colCount;
        break;
      case "End":
        next = Math.min(row * colCount + (colCount - 1), last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setActive((prev) => (prev === index ? null : index));
        return;
      default:
        return;
    }
    e.preventDefault();
    tabRefs.current[next]?.focus?.();
  };

  if (normalized.length === 0) return null;

  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < normalized.length; i += cols) {
      r.push(normalized.slice(i, i + cols));
    }
    return r;
  }, [normalized, cols]);

  const rem = normalized.length % cols;
  const activeRow = active === null ? -1 : Math.floor(active / cols);

  const panelMotion = prefersReduced
    ? {
        initial: false,
        animate: { height: "auto", opacity: 1 },
        exit: { height: "auto", opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "10rem", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <section className="w-full">
      <div className="mx-auto w-full">
        <LayoutGroup>
          <motion.div layout>
            <div
              role="tablist"
              aria-label="PitchDeck Options"
              className="grid grid-cols-2 md:grid-cols-8 gap-3 py-4"
            >
              {rows.map((row, rIdx) => (
                <React.Fragment key={`row-${rIdx}`}>
                  {row.map((item, iInRow) => {
                    const index = rIdx * cols + iInRow;
                    const isActive = active === index;
                    const isTabbable = active === null ? index === 0 : isActive;
                    const last = normalized.length - 1;
                    const penultimate = normalized.length - 2;

                    const base = "min-w-0 w-full md:col-span-2";
                    let desktopCentering = "";
                    if (cols === 4) {
                      if (rem === 1 && index === last) desktopCentering = "md:col-end-6";
                      else if (rem === 2) {
                        if (index === penultimate) desktopCentering = "md:col-end-5";
                        else if (index === last) desktopCentering = "md:col-end-7";
                      } else if (rem === 3) {
                        if (index === last - 2) desktopCentering = "md:col-start-2";
                      }
                    }
                    const wrapperClass = [base, desktopCentering].join(" ").trim();

                    return (
                      <motion.div key={ids[index].tabId} className={wrapperClass} layout>
                        <PitchDeckCard
                          index={index}
                          label={item.label}
                          image={item.image}
                          imageAlt={item.imageAlt}
                          isActive={isActive}
                          isTabbable={isTabbable}
                          onSelect={(i) => setActive((prev) => (prev === i ? null : i))}
                          onKeyDown={(e) => onKeyDown(e, index)}
                          tabId={ids[index].tabId}
                          panelId={ids[index].panelId}
                          focusRef={(el) => (tabRefs.current[index] = el)}
                          showLabels={showLabels}
                          imageSize={imageSize}
                        />
                      </motion.div>
                    );
                  })}

                  <AnimatePresence initial={false}>
                    {active !== null && activeRow === rIdx && normalized[active] && (
                      <motion.div
                        key={`panel-row-${rIdx}`}
                        role="region"
                        id={ids[active].panelId}
                        aria-labelledby={ids[active].tabId}
                        className="overflow-hidden col-span-2 md:col-span-8"
                        {...panelMotion}
                      >
                        <div
                          className={`py-4 text-center text-white ${
                            fixedHeight ? "h-40 flex flex-col items-center justify-center" : ""
                          }`}
                        >
                          {showExpandedImage &&
                            (normalized[active].expandedImage || normalized[active].image) && (
                              <div className="mb-4 flex justify-center h-48 md:h-56">
                                <img
                                  src={
                                    normalized[active].expandedImage ||
                                    normalized[active].image
                                  }
                                  alt={
                                    normalized[active].imageAlt ||
                                    normalized[active].label ||
                                    ""
                                  }
                                  className="w-48 md:w-56 object-contain"
                                  loading="eager"
                                  style={{ willChange: "transform" }}
                                />
                              </div>
                            )}

                          {!showExpandedImage && normalized[active].label && (
                            <h3 className="text-lg md:text-xl font-semibold mb-3 text-white">
                              {normalized[active].label}
                            </h3>
                          )}

                          <p className="text-sm md:text-lg">
                            {normalized[active].paragraph || ""}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </LayoutGroup>

        {/* Optional DOM-based warm-up: render tiny offscreen copies so the browser fetches early */}
        <div aria-hidden="true">
          {Array.from(
            new Set(
              normalized
                .map((it) => it.expandedImage || it.image)
                .filter(Boolean)
            )
          ).map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              width="1"
              height="1"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: "none",
              }}
              decoding="async"
              fetchPriority="low"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
