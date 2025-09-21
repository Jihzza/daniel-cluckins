import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that wraps the Intersection Observer API.
 * It observes a target element and returns its intersection entry.
 *
 * @param {object} options - Configuration for the Intersection Observer.
 * @param {number} [options.threshold=0.1] - The percentage of the target's visibility at which the observer's callback should be executed.
 * @param {string} [options.rootMargin="0px"] - Margin around the root. Can be used to grow or shrink the area used for intersections.
 * @returns {[React.RefObject<HTMLElement>, IntersectionObserverEntry|null]} - A tuple containing the ref to attach to the element and the latest intersection entry.
 */
export default function useIntersectionObserver(options = {}) {
    // 1. STATE: This state will hold the latest intersection entry.
    // An "entry" is an object that contains information like whether the element
    // is currently visible (`isIntersecting`). It's null by default.
    const [entry, setEntry] = useState(null);

    // 2. REF: We create a React ref. This ref will be attached to the DOM element
    // we want to observe (our "sentinel").
    const sentinelRef = useRef(null);

    // 3. EFFECT: This is where the magic happens. We use useEffect to set up
    // the observer when the component mounts.
    useEffect(() => {
        const observer = new IntersectionObserver(
            // 4. CALLBACK: This function is called by the browser whenever the
            // visibility of the observed element crosses the defined `threshold`.
            // It receives an array of entries (we only care about the first one).
            ([entry]) => {
                // We update our state with the latest entry from the observer.
                setEntry(entry);
            },
            // 5. OPTIONS: We pass the configuration object (threshold, rootMargin)
            // directly to the observer.
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: "0px 0px -90px 0px", // Shrink the observer viewport by 90px from the bottom to account for the navbar
                ...options,
            }
        );

        // 6. OBSERVE: If the ref is attached to an element, we tell the
        // observer to start watching it.
        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        // 7. CLEANUP: This function is called when the component unmounts.
        // It's crucial for preventing memory leaks. We disconnect the observer
        // so it stops watching the element.
        return () => {
            if (sentinelRef.current) {
                observer.unobserve(sentinelRef.current);
            }
        };
    }, [sentinelRef, options.threshold, options.rootMargin]); // The effect re-runs if the options change.

    // 8. RETURN VALUE: The hook returns the ref (to be attached to a JSX element)
    // and the latest intersection entry object.
    return [sentinelRef, entry];
}