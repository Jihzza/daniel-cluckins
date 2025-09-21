// src/components/common/ScrollArea.jsx
import React, { forwardRef } from 'react';

/**
 * ScrollArea — standardized scroll container.
 * - axis: 'x' | 'y' | 'both' (default: 'y')
 * - hideScrollbar: if true, hides scrollbar but keeps scrolling
 * - className: extra classes applied to the scroll container
 *
 * Keeps behavior identical to prior usage (only applies the axis overflow and
 * optional scrollbar utility classes without altering layout/styling).
 */
const ScrollArea = forwardRef(function ScrollArea(
  {
    axis = 'y',
    hideScrollbar = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const axisClass = axis === 'x'
    ? 'overflow-x-auto'
    : axis === 'both'
      ? 'overflow-auto'
      : 'overflow-y-auto';

  const scrollbarClass = hideScrollbar ? 'hide-scrollbar' : 'sidebar-scrollbar';

  return (
    <div ref={ref} className={[axisClass, scrollbarClass, className].join(' ')} {...props}>
      {children}
    </div>
  );
});

export default ScrollArea;


