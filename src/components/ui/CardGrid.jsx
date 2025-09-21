// CardGrid.jsx — animated, equal-width cards
import React, { useId, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

function CardTab({ item, index, isActive, isTabbable, onSelect, tabId, panelId, focusRef }) {
  const Icon = item.icon;
  const isImg = typeof Icon === "string";

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
      ref={focusRef}
      role="button"
      aria-expanded={isActive}
      id={tabId}
      aria-controls={panelId}
      tabIndex={isTabbable ? 0 : -1}
      onClick={() => onSelect(index)}
      className={[
        "flex w-full h-56 flex-col items-center justify-between rounded-2xl",
        "bg-gradient-to-b from-white/10 to-white/5 border border-white/15",
        "text-white py-4 px-2 space-y-4 focus:outline-none focus:ring-2 focus:ring-white/60",
        isActive ? "ring-1 ring-white/60" : "hover:from-white/20 hover:to-white/10",
      ].join(" ")}
    >
      <div className="flex-1 flex items-center justify-center">
        {isImg ? (
          <img src={Icon} alt="" className="w-10 h-10" />
        ) : Icon ? (
          <Icon className="w-10 h-10" aria-hidden="true" />
        ) : (
          <div className="w-10 h-10 rounded-xl border border-white/20" />
        )}
      </div>

      <div className="w-full text-center px-2">
        <p className="text-sm font-semibold leading-tight line-clamp-2">{item.title}</p>
      </div>
      <span className="w-auto text-xs leading-[1.45] tracking-[0.015em] py-2 rounded-lg text-[#F4C430] font-bold">Learn more…</span>
    </motion.button>
  );
}

export default function CardGrid({ items = [] }) {
  const [active, setActive] = useState(null);

  const handleSelect = (index) => {
    setActive((prev) => (prev === index ? null : index));
  };

  const listId = useId();

  const { ids, tabRefs } = useMemo(() => {
    return {
      ids: items.map((_, i) => ({
        tabId: `${listId}-tab-${i}`,
        panelId: `${listId}-panel-${i}`,
      })),
      tabRefs: { current: [] },
    };
  }, [items, listId]);

  function onKeyDown(e, i) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const last = items.length - 1;
    let next = i;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    setActive(next);
    const btn = tabRefs.current[next];
    if (btn && typeof btn.focus === "function") btn.focus();
  }

  return (
    <section className="w-full">
      <div className="mx-auto w-full">
        <LayoutGroup>
          <motion.div layout>
            {/* Cards */}
            <motion.div
              role="tablist"
              aria-label="Services"
              // 👇 enforce equal width per grid track
              className="grid grid-cols-3 gap-2 py-4 justify-items-stretch"
              layout
              transition={{ layout: { duration: 0.30, ease: [0.22, 1, 0.36, 1] } }}
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id ?? item.title ?? i}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  layout
                  // 👇 allow shrink and force the item wrapper to fill its cell
                  className="min-w-0 w-full"
                >
                  {(() => {
                    const isActive = active === i;
                    const isTabbable = active === null ? i === 0 : isActive;
                    return (
                      <CardTab
                        item={item}
                        index={i}
                        isActive={isActive}
                        isTabbable={isTabbable}
                        onSelect={handleSelect}
                        tabId={ids[i].tabId}
                        panelId={ids[i].panelId}
                        focusRef={(el) => (tabRefs.current[i] = el)}
                      />
                    );
                  })()}
                </motion.div>
              ))}
            </motion.div>

            {/* Expanded panel */}
            <AnimatePresence initial={false} mode="wait">
              {active !== null && items[active] && (
                <motion.div
                  key={active}
                  role="region"
                  id={ids[active].panelId}
                  aria-labelledby={ids[active].tabId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{items[active].content?.title ?? items[active].title}</h3>
                        <p className="mt-2 text-sm/6 text-white/80">{items[active].content?.paragraph}</p>
                      </div>
                      {items[active].href && (
                        <a
                          href={items[active].href}
                          className="shrink-0 inline-flex items-center rounded-xl border border-white/20 px-3 py-1.5 text-sm hover:bg-black/10"
                        >
                          Learn more
                        </a>
                      )}
                    </div>

                    {/* Two info boxes */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="rounded-xl border border-white/15 bg-black/10 p-4">
                        {items[active].content?.boxLeft ?? "Left info"}
                      </div>
                      <div className="rounded-xl border border-white/15 bg-black/10 p-4">
                        {items[active].content?.boxRight ?? "Right info"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}
