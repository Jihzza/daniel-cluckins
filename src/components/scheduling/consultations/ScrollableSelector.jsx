// src/components/scheduling/consultations/ScrollableSelector.jsx

import React, { useRef, useEffect, useCallback } from 'react'

/**
 * A reusable, horizontal, scrollable selector for choosing an option from a list.
 * Fully controlled by parent.
 *
 * Props:
 * - title: string
 * - options: Array<{ value: string, label: string, disabled?: boolean }>
 * - selectedValue: string | null
 * - onSelect: (value: string) => void
 */
export default function ScrollableSelector({ title, options = [], selectedValue, onSelect }) {
  const containerRef = useRef(null)

  // Smoothly center the item at index `idx` in the scroll container
  const centerIndex = useCallback((idx) => {
    const container = containerRef.current
    if (!container) return
    const el = container.querySelector(`[data-index="${idx}"]`)
    if (!el) return

    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()

    const currentLeft = container.scrollLeft
    const deltaLeft = (elRect.left - containerRect.left) - (containerRect.width / 2 - elRect.width / 2)
    let target = currentLeft + deltaLeft

    // clamp to container scrollable range
    const maxScroll = container.scrollWidth - container.clientWidth
    if (target < 0) target = 0
    if (target > maxScroll) target = maxScroll

    container.scrollTo({ left: target, behavior: 'smooth' })
  }, [])

  // When selectedValue changes (by click or externally), recenter the selected option
  useEffect(() => {
    if (!options.length || selectedValue == null) return
    const idx = options.findIndex((o) => o.value === selectedValue)
    if (idx >= 0) {
      // wait a frame to ensure DOM is ready
      requestAnimationFrame(() => centerIndex(idx))
    }
  }, [selectedValue, options, centerIndex])

  return (
    <div className="w-full">
      <h3 className="text-base font-semibold text-white mb-3 text-center md:text-xl lg:text-base">{title}</h3>

      <div className="relative group">
        {/* gradient edges */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-[#002147] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-[#002147] to-transparent z-20 pointer-events-none" />

        <div
          ref={containerRef}
          className="flex space-x-3 overflow-x-auto hide-scrollbar md:space-x-4 md:px-10 py-2"
        >
          {options.map((option, i) => {
            const selected = selectedValue === option.value
            const disabled = !!option.disabled
            return (
              <button
                key={option.value}
                data-index={i}
                onClick={() => {
                  if (disabled) return
                  onSelect(option.value)
                  // also center immediately on click for snappy feel
                  requestAnimationFrame(() => centerIndex(i))
                }}
                disabled={disabled}
                className={[
                  'flex-shrink-0 px-3 py-1 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap md:px-5 md:py-2 text-sm md:text-base shadow-xl lg:text-sm lg:px-3 lg:py-1 bg-black/10 backdrop-blur-md border border-white/20',
                  disabled
                    ? 'text-gray-500 border-gray-600/60 cursor-not-allowed opacity-60'
                    : selected
                      ? 'bg-white/40 text-white border-white/50 scale-105 shadow-xl font-bold'
                      : 'text-white shadow-xl hover:bg-white/15 hover:border-[#bfa200]',
                ].join(' ')}
                aria-pressed={selected}
                aria-disabled={disabled}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
