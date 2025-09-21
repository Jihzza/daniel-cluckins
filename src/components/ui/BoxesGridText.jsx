import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";

// Text-only presentational card/button used inside the grid.
function CardTabText({
  label,
  subtitle,
  index,
  isActive,
  isTabbable,
  onSelect,
  onKeyDown,
  tabId,
  panelId,
  focusRef,
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      layout
      initial={false}
      whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
      whileTap={{ scale: 0.95, transition: { duration: 0.12 } }}
      animate={{
        scale: isActive ? 1.04 : 1,
        boxShadow: isActive
          ? "0 16px 36px rgba(0, 0, 0, 0.35)"
          : "0 6px 14px rgba(0, 0, 0, 0.25)",
      }}
      transition={{
        layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
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
        "flex flex-col gap-1 w-full h-30 items-center justify-center rounded-2xl",
        "transform-gpu will-change-transform",
        "bg-transparent border border-[#BFA200]",
        "text-white px-3 py-6 text-center",
        "focus focus-visible:ring-[#BFA200]/40",
        "transition-all duration-200 ease-out transition-shadow",
        isActive ? "border-3 ring-2 ring-[#BFA200]/40" : "border-2 shadow-lg hover:shadow-xl",
        "cursor-pointer",
      ].join(" ")}
    >
      {label && <span className="text-lg font-semibold">{label}</span>}
      {subtitle && <span className="text-xl font-medium">{subtitle}</span>}
    </motion.button>
  );
}

// Hook: current column count (3 on mobile, 4 on md+).
function useCols() {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setCols(mql.matches ? 4 : 3);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return cols;
}

export default function BoxesGridText({ items = [], fixedHeight = false, onSelectItem }) {
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
              expandedText: it.expandedText ?? it.description ?? "",
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
    const uid = listId?.toString().replace(/:/g, "") || "boxes-text";
    return normalized.map((_, i) => ({
      tabId: `${uid}-tab-${i}`,
      panelId: `${uid}-panel-${i}`,
    }));
  }, [normalized.length, listId]);

  // keyboard navigation
  const onKeyDown = (e, index) => {
    const last = normalized.length - 1;
    const colCount = cols; // 3 on mobile, 4 on desktop
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
        animate: { height: "5rem", opacity: 1 },
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
              className="grid grid-cols-3 md:grid-cols-8 gap-3 py-4"
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
                      if (rem === 1 && index === last) {
                        desktopCentering = "md:col-end-6";
                      } else if (rem === 2) {
                        if (index === penultimate) desktopCentering = "md:col-end-5";
                        else if (index === last) desktopCentering = "md:col-end-7";
                      } else if (rem === 3) {
                        if (index === last - 2) desktopCentering = "md:col-start-2";
                      }
                    }
                    const wrapperClass = [base, desktopCentering].join(" ").trim();

                    return (
                      <motion.div key={ids[index].tabId} className={wrapperClass} layout>
                        <CardTabText
                          index={index}
                          label={item.label}
                          subtitle={item.paragraph}
                          isActive={isActive}
                          isTabbable={isTabbable}
                          onSelect={(i) => {
                            setActive((prev) => {
                              const next = prev === i ? null : i;
                              if (typeof onSelectItem === 'function') {
                                const selectedId = next === null ? null : normalized[next]?.id ?? null;
                                onSelectItem(selectedId);
                              }
                              return next;
                            });
                          }}
                          onKeyDown={(e) => onKeyDown(e, index)}
                          tabId={ids[index].tabId}
                          panelId={ids[index].panelId}
                          focusRef={(el) => (tabRefs.current[index] = el)}
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
                        className="overflow-hidden col-span-3 md:col-span-8"
                        {...panelMotion}
                      >
                        <div className={`py-4 text-center text-white ${fixedHeight ? 'h-40 flex flex-col items-center justify-center' : ''}`}>
                          {normalized[active].label && (
                            <h3 className="text-lg md:text-xl font-semibold mb-3 text-white">
                              {normalized[active].label}
                            </h3>
                          )}
                          <p className="text-sm md:text-lg">
                            {normalized[active].expandedText || ""}
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


