// src/components/scheduling/consultations/CustomCalendar.jsx
// Accessible, keyboard-navigable calendar with CalendarPage styling.
// - Pure styling update to match your CalendarPage look
// - Keeps behaviors: month paging, focus/ARIA, min/max, restriction rules
// - Adds optional `highlightedDates` (array of Date or ISO) to show a dot

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomCalendar({
  selectedDate,
  onDateSelect,
  isDateSelectionRestricted = false,
  weekStartsOn = 0,
  locale,
  leadTimeHours = 48,
  disableWeekendsWhenRestricted = true,
  minDate,
  maxDate,
  className = "",
  onMonthChange,
  highlightedDates = [],
}) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || today));
  const [focusedDate, setFocusedDate] = useState(selectedDate || today);
  const gridRef = useRef(null);

  // set of YYYY-MM-DD strings for dots
  const markedSet = useMemo(() => {
    try {
      return new Set(
        (highlightedDates || []).map((d) =>
          format(typeof d === "string" ? new Date(d) : d, "yyyy-MM-dd")
        )
      );
    } catch {
      return new Set();
    }
  }, [highlightedDates]);

  // Build weeks covering the visible month
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const displayStart = useMemo(
    () => startOfWeek(monthStart, { weekStartsOn }),
    [monthStart, weekStartsOn]
  );
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const displayEnd = useMemo(
    () => endOfWeek(monthEnd, { weekStartsOn }),
    [monthEnd, weekStartsOn]
  );

  const weeks = useMemo(() => {
    const out = [];
    let cursor = displayStart;
    while (cursor <= displayEnd) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        row.push(cursor);
        cursor = addDays(cursor, 1);
      }
      out.push(row);
    }
    return out;
  }, [displayStart, displayEnd]);

  // Range helpers
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  const isOutOfRange = useCallback(
    (date) => {
      if (minDate && isBefore(date, startOfDay(minDate))) return true;
      if (maxDate && isAfter(date, endOfDay(maxDate))) return true;
      return false;
    },
    [minDate, maxDate]
  );

  const isDisabled = useCallback(
    (date) => {
      if (isOutOfRange(date)) return true;

      if (!isDateSelectionRestricted) return false;

      // restriction rules (same as before): weekends + lead time
      const leadCutoff = new Date();
      leadCutoff.setHours(leadCutoff.getHours() + Number(leadTimeHours || 0));

      const day = date.getDay(); // 0 Sun … 6 Sat
      const weekend = day === 0 || day === 6;
      if (disableWeekendsWhenRestricted && weekend) return true;

      // anything earlier than the lead cutoff is disabled
      if (endOfDay(date) < leadCutoff) return true;

      return false;
    },
    [isDateSelectionRestricted, disableWeekendsWhenRestricted, leadTimeHours, isOutOfRange]
  );

  // Keyboard navigation within the grid
  const moveFocusBy = useCallback(
    (deltaDays) => {
      const next = addDays(focusedDate, deltaDays);
      setFocusedDate(next);
      // If focus moved to another month, update visible month
      if (!isSameMonth(next, currentMonth)) {
        const cm = startOfMonth(next);
        setCurrentMonth(cm);
        onMonthChange?.(cm);
      }
    },
    [focusedDate, currentMonth, onMonthChange]
  );

  const onKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          moveFocusBy(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveFocusBy(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveFocusBy(-7);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveFocusBy(7);
          break;
        case "PageUp":
          e.preventDefault();
          {
            const next = addMonths(focusedDate, -1);
            setFocusedDate(next);
            const cm = startOfMonth(addMonths(currentMonth, -1));
            setCurrentMonth(cm);
            onMonthChange?.(cm);
          }
          break;
        case "PageDown":
          e.preventDefault();
          {
            const next = addMonths(focusedDate, 1);
            setFocusedDate(next);
            const cm = startOfMonth(addMonths(currentMonth, 1));
            setCurrentMonth(cm);
            onMonthChange?.(cm);
          }
          break;
        case "Home":
          e.preventDefault();
          {
            const start = startOfWeek(focusedDate, { weekStartsOn });
            setFocusedDate(start);
            if (!isSameMonth(start, currentMonth)) {
              const cm = startOfMonth(start);
              setCurrentMonth(cm);
              onMonthChange?.(cm);
            }
          }
          break;
        case "End":
          e.preventDefault();
          {
            const end = endOfWeek(focusedDate, { weekStartsOn });
            setFocusedDate(end);
            if (!isSameMonth(end, currentMonth)) {
              const cm = startOfMonth(end);
              setCurrentMonth(cm);
              onMonthChange?.(cm);
            }
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (!isDisabled(focusedDate)) {
            onDateSelect?.(focusedDate);
          }
          break;
        default:
      }
    },
    [
      focusedDate,
      currentMonth,
      weekStartsOn,
      onMonthChange,
      onDateSelect,
      isDisabled,
      moveFocusBy,
    ]
  );

  // Ensure focused button remains tabbable
  useEffect(() => {
    const node =
      gridRef.current?.querySelector(`button[data-iso="${format(focusedDate, "yyyy-MM-dd")}"]`);
    if (node) node.focus({ preventScroll: true });
  }, [focusedDate, currentMonth]);

  const goToPrevMonth = useCallback(() => {
    const cm = startOfMonth(addMonths(currentMonth, -1));
    setCurrentMonth(cm);
    setFocusedDate(cm);
    onMonthChange?.(cm);
  }, [currentMonth, onMonthChange]);

  const goToNextMonth = useCallback(() => {
    const cm = startOfMonth(addMonths(currentMonth, 1));
    setCurrentMonth(cm);
    setFocusedDate(cm);
    onMonthChange?.(cm);
  }, [currentMonth, onMonthChange]);

  return (
    <div className={`w-full max-w-md mx-auto rounded-xl text-white ${className}`}>
      {/* Header: (‹)  Month Year  (›) */}
      <div className="grid grid-cols-3 items-center px-3 py-3">
        <div className="justify-self-start">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="px-2 py-1"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <h2
          id="calendar-month-label"
          className="justify-self-center font-semibold text-lg tracking-tight text-center"
          aria-live="polite"
        >
          {format(currentMonth, "MMMM yyyy", { locale })}
        </h2>
        <div className="justify-self-end">
          <button
            type="button"
            onClick={goToNextMonth}
            className="px-2 py-1"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Weekday headings */}
      <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs text-white/50 px-2 sm:px-3 select-none uppercase tracking-wide">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = addDays(startOfWeek(currentMonth, { weekStartsOn }), i);
          return (
            <div key={i} className="py-1 font-medium">
              {format(d, "EEE", { locale })}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        role="grid"
        aria-labelledby="calendar-month-label"
        className="px-2 sm:px-3 pb-3 sm:pb-4"
        onKeyDown={onKeyDown}
      >
        {weeks.map((week, rowIdx) => (
          <div
            key={rowIdx}
            role="row"
            className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2 mb-1.5 sm:mb-2"
          >
            {week.map((date) => {
              const inMonth = isSameMonth(date, monthStart);
              const selected = selectedDate ? isSameDay(date, selectedDate) : false;
              const todayFlag = isSameDay(date, today);
              const disabled = isDisabled(date);

              const base =
                "relative aspect-square w-full flex flex-col items-center justify-center rounded-full text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/70";
              const classes = [base];

              if (disabled) {
                classes.push("text-white/30 cursor-not-allowed");
              } else if (selected) {
                classes.push("bg-white/20");
              } else {
                classes.push("hover:bg-black/10 cursor-pointer");
              }
              if (!inMonth) classes.push("text-white/40");

              return (
                <button
                  key={format(date, "yyyy-MM-dd")}
                  type="button"
                  role="gridcell"
                  data-iso={format(date, "yyyy-MM-dd")}
                  aria-selected={selected}
                  aria-disabled={disabled}
                  aria-current={todayFlag ? "date" : undefined}
                  tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                  className={classes.join(" ")}
                  onFocus={() => setFocusedDate(date)}
                  onClick={() => {
                    if (disabled) return;
                    onDateSelect?.(date);
                    if (!inMonth) {
                      const cm = startOfMonth(date);
                      setCurrentMonth(cm);
                      onMonthChange?.(cm);
                    }
                    setFocusedDate(date);
                  }}
                >
                  {/* Month abbreviation for prev/next month cells */}
                  {!inMonth && (
                    <span className="absolute top-1 text-[10px] uppercase tracking-wide text-white/60 pointer-events-none">
                      {format(date, "MMM", { locale })}
                    </span>
                  )}

                  {/* Day number */}
                  <span className="text-sm leading-none pointer-events-none select-none">
                    {format(date, "d")}
                  </span>

                  {/* subtle ring for today */}
                  {todayFlag && !selected && (
                    <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/30" />
                  )}

                  {/* dot for highlighted dates */}
                  {markedSet.has(format(date, "yyyy-MM-dd")) && (
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}