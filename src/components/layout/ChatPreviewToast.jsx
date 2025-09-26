import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BotIcon from "../../assets/icons/DaGalow Branco.svg"; // adjust if your path differs

/**
 * Bottom toast that previews the welcome message and sits just above the nav bar.
 */
export default function ChatPreviewToast({ open, text, onClick, bottomOffsetPx = 0 }) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  const full = cleaned.length > 120 ? `${cleaned.slice(0, 120)}…` : cleaned;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    const speed = 18;
    const id = setInterval(() => {
      setIdx((i) => (i < full.length ? i + 1 : i));
    }, 30);
    return () => clearInterval(id);
  }, [open, full]);

  const preview = useMemo(() => full.slice(0, idx), [full, idx]);

  return (
    <AnimatePresence>
      {open && (
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 36 }}
          className="fixed left-1/2 -translate-x-1/2 w-[90%] md:w-[520px] text-left 
                     rounded-3xl border px-4 py-3 shadow-xl 
                     backdrop-blur bg-black/60 border-[#BFA200] select-none"
          style={{
            bottom: `calc(${bottomOffsetPx}px + env(safe-area-inset-bottom))`,
            zIndex: 60, // above the nav (nav is z-50)
          }}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <img src={BotIcon} alt="" className="w-6 h-6 mt-0.5" />
            <div className="flex-1">
              <div className="text-[#BFA200] text-[11px] uppercase tracking-wide mb-0.5">
                New from Daniel
              </div>
              <div className="text-white text-sm md:text-base leading-snug">{preview}</div>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}