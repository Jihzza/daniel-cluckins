// src/components/scheduling/StepControls.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * StepControls — Back / Next / Finish with accessible disabled styling
 *
 * Props:
 * - currentStep: number
 * - totalSteps: number
 * - isProcessing: boolean
 * - paymentStatus: 'awaiting' | 'success' | 'cancelled'
 * - formData: {
 *     serviceType: 'consultation' | 'coaching' | 'pitchdeck' | null,
 *     consultation?: { date: string|null, duration: string|null, time: string|null },
 *     coaching?: { plan: string|null },
 *     pitchdeck?: { type: string|null },
 *     contactInfo?: { name: string, email: string }
 *   }
 * - onBack(): void
 * - onNext(): void
 * - onFinish(): void
 * - labels?: { back?: string, next?: string, finish?: string, hint?: string }
 */
export default function StepControls({
  currentStep,
  totalSteps,
  isProcessing,
  paymentStatus,
  formData,
  onBack,
  onNext,
  onFinish,
  labels = {},
}) {
  const {
    back = "Back",
    next = "Next",
    finish = "Finish",
    hint = "Complete the required fields to continue.",
  } = labels;

  // Centralize your "can proceed" logic so we can reuse it for both `disabled`
  // and visual styling (don’t rely on color alone to convey state).
  const isNextDisabled = useMemo(() => {
    if (isProcessing) return true;

    const st = formData?.serviceType;

    // Step 2: Require the choice for each service flow
    if (currentStep === 2) {
      if (st === "consultation") {
        const c = formData?.consultation || {};
        if (!c.date || !c.duration || !c.time) return true;
      }
      if (st === "coaching") {
        if (!formData?.coaching?.plan) return true;
      }
      if (st === "pitchdeck") {
        if (!formData?.pitchdeck?.type) return true;
      }
    }

    // Step 3: Require contact info
    if (currentStep === 3) {
      const ci = formData?.contactInfo || {};
      if (!ci.name || !ci.email) return true;
    }

    // Step 4: payment must be success for consultation/coaching
    if (
      currentStep === 4 &&
      (st === "consultation" || st === "coaching") &&
      paymentStatus !== "success"
    ) {
      return true;
    }

    return false;
  }, [currentStep, formData, isProcessing, paymentStatus]);

  return (
    <div
      className="sticky bottom-0 left-0 right-0 bg-black/10 backdrop-blur-md"
      style={{
        paddingBottom:
          "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Back */}
        <motion.button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-sm md:text-base font-semibold text-white bg-black rounded-md shadow-xl cursor-pointer hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98] transition"
          whileHover={{ scale: 1.06, transition: { duration: 0.08 } }}
          whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
        >
          {back}
        </motion.button>

        {/* Next / Finish */}
        {currentStep < totalSteps ? (
          <div className="flex flex-col items-end">
            <motion.button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled}
              aria-disabled={isNextDisabled}
              aria-describedby={isNextDisabled ? "next-hint" : undefined}
              className={[
                "px-6 py-2 text-sm md:text-base font-semibold rounded-md transition",
                isNextDisabled
                  ? "bg-gray-500/30 text-gray-300 cursor-not-allowed shadow-none ring-1 ring-gray-400/30"
                  : "bg-[#BFA200] text-black shadow-xl hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/40 active:scale-[0.98]",
              ].join(" ")}
              whileHover={
                isNextDisabled ? undefined : { scale: 1.06, transition: { duration: 0.08 } }
              }
              whileTap={
                isNextDisabled ? undefined : { scale: 0.95, transition: { duration: 0.08 } }
              }
            >
              {next}
            </motion.button>

            {isNextDisabled && (
              <p id="next-hint" className="mt-2 text-xs text-gray-300">
                {hint}
              </p>
            )}
          </div>
        ) : (
          <motion.button
            type="button"
            onClick={onFinish}
            className="px-6 py-2 text-sm md:text-base font-semibold text-black bg-[#BFA200] rounded-md shadow-xl cursor-pointer hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/40 active:scale-[0.98] transition"
            whileHover={{ scale: 1.06, transition: { duration: 0.08 } }}
            whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
          >
            {finish}
          </motion.button>
        )}
      </div>
    </div>
  );
}
