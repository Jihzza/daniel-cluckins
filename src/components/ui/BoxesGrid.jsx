// BoxesGrid.jsx — mobile 2-col, desktop 3-col with a centered *last* row.
// (unchanged layout logic)
import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";

// Simple presentational card/button used inside the grid.
function CardTabSimple({
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
  imageSize = "w-8 h-8",
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      layout
      initial={false}
      // Header-style micro-interactions
      whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.95, transition: { duration: 0.12 } }}
      // Animate the "active" emphasis smoothly
      animate={{
        scale: isActive ? 1.04 : 1,
        boxShadow: isActive
          ? "0 16px 36px rgba(0, 0, 0, 0.35)"
          : "0 6px 14px rgba(0, 0, 0, 0.25)",
      }}
      transition={{
        layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.20, ease: [0.22, 1, 0.36, 1] },
        boxShadow: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      }}
      ref={focusRef}
      role="button"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isTabbable ? 0 : -1}
      onKeyDown={onKeyDown}
      onClick={() => onSelect(index)}
      className={[
        "flex flex-col gap-2 w-full h-30 items-center justify-center rounded-2xl",
        "transform-gpu will-change-transform",
        "bg-transparent border border-[#BFA200]",
        "text-white px-3 py-6 text-center",
        "focus focus-visible:ring-[#BFA200]/40",
        "transition-all duration-200 ease-out transition-shadow",
        // Active vs. idle: thicker border & ring when active
        isActive ? "border-3 ring-2 ring-[#BFA200]/40" : "border-2 shadow-lg hover:shadow-xl",
        // Pointer on clickable
        "cursor-pointer",
      ].join(" ")}
    >
      {image && (
        <img
          src={image}
          alt={imageAlt ?? ""}
          className={`${imageSize} object-contain pointer-events-none select-none`}
          {...(!imageAlt ? { "aria-hidden": true } : {})}
        />
      )}
      {showLabels && <span className="text-base font-medium">{label}</span>}
    </motion.button>
  );
}

// Hook: current column count (2 on mobile, 3 on md+).
function useCols() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)"); // Tailwind md breakpoint
    const onChange = () => setCols(mql.matches ? 4 : 2);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return cols;
}

export default function BoxesGrid({ items = [], showLabels = true, imageSize = "w-8 h-8", fixedHeight = false, showExpandedImage = false }) {
  // Normalize input to objects with a label / paragraph
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

  // focus refs + ids
  const tabRefs = useRef([]);
  useEffect(() => {
    tabRefs.current = new Array(normalized.length);
  }, [normalized.length]);

  // ids for a11y
  const ids = useMemo(() => {
    const uid = listId?.toString().replace(/:/g, "") || "boxes";
    return normalized.map((_, i) => ({
      tabId: `${uid}-tab-${i}`,
      panelId: `${uid}-panel-${i}`,
    }));
  }, [normalized.length, listId]);

  // keyboard navigation
  const onKeyDown = (e, index) => {
    const last = normalized.length - 1;
    const colCount = cols; // 2 on mobile, 3 on desktop
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
        next = row * colCount; // first in this row
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

  // Build rows by current col count
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < normalized.length; i += cols) {
      r.push(normalized.slice(i, i + cols));
    }
    return r;
  }, [normalized, cols]);

  const rem = normalized.length % cols; // leftovers on the last row
  const activeRow = active === null ? -1 : Math.floor(active / cols);

  // Panel animation props (respect reduced motion)
  const panelMotion = prefersReduced
    ? {
      initial: false,
      animate: { height: "auto", opacity: 1 },
      exit: { height: "auto", opacity: 1 },
      transition: { duration: 0 },
    }
    : {
      initial: { height: 0, opacity: 0 },
      animate: { height: "10rem", opacity: 1 }, // Fixed height for smooth animation
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
              aria-label="Options"
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
                    if (cols === 3) {
                      if (rem === 1 && index === last) {
                        desktopCentering = "md:col-end-5";
                      } else if (rem === 2) {
                        if (index === penultimate) desktopCentering = "md:col-end-4";
                        else if (index === last) desktopCentering = "md:col-end-[-2]";
                      }
                    } else if (cols === 4) {
                      // For 8 grid lines (4 cols), each card spans 2 lines.
                      if (rem === 1 && index === last) {
                        // Single centered: end at line 6 → uses lines 4–5
                        desktopCentering = "md:col-end-6";
                      } else if (rem === 2) {
                        // Two centered: use 3–4 and 5–6
                        if (index === penultimate) desktopCentering = "md:col-end-5";
                        else if (index === last) desktopCentering = "md:col-end-7";
                      } else if (rem === 3) {
                        // Shift the 3-card block right by one column (starts at col 2)
                        if (index === last - 2) desktopCentering = "md:col-start-2";
                      }
                    }
                    const wrapperClass = [base, desktopCentering].join(" ").trim();

                    return (
                      <motion.div key={ids[index].tabId} className={wrapperClass} layout>
                        <CardTabSimple
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

                  {/* Row-scoped expander right under this row */}
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
                         <div className={`py-4 text-center text-white ${fixedHeight ? 'h-40 flex flex-col items-center justify-center' : ''}`}>
                           {showExpandedImage && (normalized[active].expandedImage || normalized[active].image) && (
                             <div className="mb-4 flex justify-center h-48 md:h-56">
                               <img
                                 src={normalized[active].expandedImage || normalized[active].image}
                                 alt={normalized[active].imageAlt || normalized[active].label || ""}
                                 className="w-48 md:w-56   object-contain"
                                 loading="eager"
                                 style={{ willChange: 'transform' }}
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
      </div>
    </section>
  );
}
