// src/utils/scrollPositionManager.js

/**
 * Manages scroll position for the home page
 * Stores the last scroll position when leaving home page
 * Restores position when returning to home page
 */

const HOME_SCROLL_KEY = 'homeScrollPosition';
const HOME_SCROLL_TIMESTAMP_KEY = 'homeScrollTimestamp';

// Maximum age for saved scroll position (24 hours)
const MAX_SCROLL_AGE = 24 * 60 * 60 * 1000;

/**
 * Saves the current scroll position of the home page
 * @param {number} scrollY - The vertical scroll position
 */
export const saveHomeScrollPosition = (scrollY) => {
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, scrollY.toString());
    sessionStorage.setItem(HOME_SCROLL_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save home scroll position:', error);
  }
};

/**
 * Gets the saved scroll position for the home page
 * @returns {number|null} The saved scroll position or null if not found/expired
 */
export const getHomeScrollPosition = () => {
  try {
    const scrollY = sessionStorage.getItem(HOME_SCROLL_KEY);
    const timestamp = sessionStorage.getItem(HOME_SCROLL_TIMESTAMP_KEY);
    
    if (!scrollY || !timestamp) {
      return null;
    }
    
    const age = Date.now() - parseInt(timestamp);
    if (age > MAX_SCROLL_AGE) {
      // Clear expired data
      clearHomeScrollPosition();
      return null;
    }
    
    return parseInt(scrollY);
  } catch (error) {
    console.warn('Failed to get home scroll position:', error);
    return null;
  }
};

/**
 * Clears the saved home scroll position
 */
export const clearHomeScrollPosition = () => {
  try {
    sessionStorage.removeItem(HOME_SCROLL_KEY);
    sessionStorage.removeItem(HOME_SCROLL_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear home scroll position:', error);
  }
};

/**
 * Scrolls to the top of the page
 * @param {HTMLElement} scrollElement - The scrollable element (optional)
 */
export const scrollToTop = (scrollElement = null) => {
  const target = scrollElement || window;
  
  if (scrollElement) {
    scrollElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

/**
 * Scrolls to a specific position
 * @param {number} position - The scroll position
 * @param {HTMLElement} scrollElement - The scrollable element (optional)
 */
export const scrollToPosition = (position, scrollElement = null) => {
  const target = scrollElement || window;
  
  if (scrollElement) {
    scrollElement.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  } else {
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  }
};
