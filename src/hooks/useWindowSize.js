import { useState, useEffect } from 'react';

/**
 * A custom hook that returns the current window dimensions.
 * This is crucial for creating responsive layouts in React.
 * @returns {{width: number, height: number}} An object containing the window width and height.
 */
export default function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        // We only run this effect in the browser.
        if (typeof window === 'undefined') {
            return;
        }

        // This function updates the state with the new window dimensions.
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        // We add an event listener for the 'resize' event.
        window.addEventListener('resize', handleResize);
        
        // We call it once initially to set the correct size.
        handleResize();

        // This is the cleanup function. It removes the event listener
        // when the component unmounts to prevent memory leaks.
        return () => window.removeEventListener('resize', handleResize);
    }, []); // The empty dependency array ensures this effect runs only once on mount.

    return windowSize;
}