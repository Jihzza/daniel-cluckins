import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// --- CHILD COMPONENT IMPORTS ---
import Header from './Header';
import NavigationBar from './NavigationBar';
import SidebarMenu from './SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollRootContext } from '../../contexts/ScrollRootContext';

// --- HOOKS ---
// For maintainability, this should be in its own file (e.g., /src/hooks/useVisualViewport.js)
// and imported here, but is included for completeness.
function useVisualViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      setViewport({
        width: vv.width,
        height: vv.height,
      });
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    handleResize(); // Set initial size

    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);

  return viewport;
}

export default function Layout() {
  // --- STATE ---
  const [isMenuOpen, setMenuOpen] = useState(false);
  // Chatbot removed
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const headerRef = useRef(null);
  const navBarRef = useRef(null);
  const mainContentRef = useRef(null);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [navBarHeight, setNavBarHeight] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const viewport = useVisualViewport(); // Use the keyboard-aware viewport hook
  const { isAuthenticated, user } = useAuth();

  // Track navigation history for go back functionality
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // --- HANDLERS ---
  const handleMenuClick = () => setMenuOpen(!isMenuOpen);
  const handleCloseMenu = () => setMenuOpen(false);

  const handleScrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleNavigate = (path) => {
    // If clicking on the current active page, go back to previous page
    if (path === currentPath && navigationHistory.length > 0) {
      const previousPath = navigationHistory[navigationHistory.length - 1];
      navigate(previousPath);
      // Remove the last item from history since we're going back
      setNavigationHistory((prev) => prev.slice(0, -1));
    } else {
      // Normal navigation - add current path to history and navigate to new path
      if (currentPath !== path) {
        setNavigationHistory((prev) => [...prev, currentPath]);
        setCurrentPath(path);
      }
      navigate(path);
    }
    handleCloseMenu();
  };

  // --- LIFECYCLE HOOKS ---
  useLayoutEffect(() => {
    setHeaderHeight(headerRef.current?.offsetHeight || 0);
    setNavBarHeight(navBarRef.current?.offsetHeight || 0);
  }, [location.pathname]); // Recalculate on route change

  // Update current path when location changes (for external navigation)
  useEffect(() => {
    if (location.pathname !== currentPath) {
      setCurrentPath(location.pathname);
    }
  }, [location.pathname, currentPath]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        setShowScrollToTop(scrollTop > 200);
      }
    };

    const scrollElement = mainContentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);


  // Trigger welcome-message WF on first load to seed chatbot message
  useEffect(() => {
    try {
      const alreadyTriggered = sessionStorage.getItem('welcome_triggered');
      if (alreadyTriggered) return;

      const sidKey = 'chatbot-session-id';
      let sid = sessionStorage.getItem(sidKey);
      if (!sid) {
        sid = typeof crypto?.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(sidKey, sid);
      }

      sessionStorage.setItem('welcome_triggered', '1');

      const WELCOME_URL = 'https://rafaello.app.n8n.cloud/webhook/welcome-message';
      const payload = {
        session_id: sid,
        user_id: isAuthenticated ? (user?.id ?? null) : null,
        path: location.pathname,
        referrer: document.referrer || null,
        ts: new Date().toISOString(),
      };

      fetch(WELCOME_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
        .then(async (res) => {
          try {
            const raw = await res.json();
            const first = Array.isArray(raw) ? raw[0] : raw;
            const text = first?.content ?? first?.value ?? first?.output ?? '';
            if (text) {
              sessionStorage.setItem('pending_welcome_message', text);
              window.dispatchEvent(new CustomEvent('welcomeMessageReady'));
            }
          } catch {}
        })
        .catch(() => {});
    } catch {}
  }, [isAuthenticated, user?.id, location.pathname]);

  // --- RENDER LOGIC ---
  return (
    // This is the main application container.
    // Using dvh (dynamic viewport height) instead of viewport.height to prevent
    // scaling issues during pinch zoom while still handling keyboard properly.
    <div
      className="h-full w-full flex flex-col bg-[#002147] min-h-dvh"
    >
      <Header ref={headerRef} onMenuClick={handleMenuClick} />

      <SidebarMenu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onNavigate={handleNavigate}
        topOffset={headerHeight}
        bottomOffset={navBarHeight}
        isAuthenticated={isAuthenticated}
      />

      <main ref={mainContentRef} className="flex-grow min-h-0 overflow-y-auto w-full overflow-x-hidden pb-16 md:pb-20">
        <ScrollRootContext.Provider value={mainContentRef}>
          <Outlet />
        </ScrollRootContext.Provider>
      </main>

      {/* Bottom navigation */}
      <div ref={navBarRef} className="relative">
        <NavigationBar onNavigate={handleNavigate} />
      </div>


      {/* SCROLL TO TOP BUTTON - Only show on home page */}
      {location.pathname === '/' && (
        <button
          onClick={handleScrollToTop}
          className={[
            'fixed right-4 z-[70]',
            'w-12 h-12 rounded-full',
            'bg-black',
            'text-[#bfa200]',
            'shadow-lg backdrop-blur-sm',
            'flex items-center justify-center',
            'transition-all duration-200 ease-in-out',
            'hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring focus:ring-[#bfa200]',
            showScrollToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
          ].join(' ')}
          style={{
            bottom: `calc(4rem + 1rem + env(safe-area-inset-bottom))`,
          }}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 4l-7 7h4v7h6v-7h4z" />
          </svg>
        </button>
      )}
    </div>
  );
}
