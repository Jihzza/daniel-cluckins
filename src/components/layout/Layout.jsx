import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// --- CHILD COMPONENT IMPORTS ---
import Header from './Header';
import NavigationBar from './NavigationBar';
import SidebarMenu from './SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';
import { ScrollRootContext } from '../../contexts/ScrollRootContext';

export default function Layout() {
  const headerRef = useRef(null);
  const navBarRef = useRef(null);
  const mainContentRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [navBarHeight, setNavBarHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const clearOnUnload = () => {
      try {
        sessionStorage.removeItem('chatbot-session-id');
      } catch {}
    };
    window.addEventListener('beforeunload', clearOnUnload);
    window.addEventListener('pagehide', clearOnUnload);
    return () => {
      window.removeEventListener('beforeunload', clearOnUnload);
      window.removeEventListener('pagehide', clearOnUnload);
    };
  }, []);

  // Measure header/navbar heights (used as offsets for SidebarMenu, etc.)
  useLayoutEffect(() => {
    const observers = [];

    if (headerRef.current) {
      const roHeader = new ResizeObserver(() => {
        setHeaderHeight(headerRef.current?.offsetHeight ?? 0);
      });
      roHeader.observe(headerRef.current);
      observers.push(roHeader);
      setHeaderHeight(headerRef.current.offsetHeight ?? 0);
    }

    if (navBarRef.current) {
      const roNav = new ResizeObserver(() => {
        setNavBarHeight(navBarRef.current?.offsetHeight ?? 0);
      });
      roNav.observe(navBarRef.current);
      observers.push(roNav);
      setNavBarHeight(navBarRef.current.offsetHeight ?? 0);
    }

    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    const existing = localStorage.getItem('chatbot-session-id');
    const sid = existing ||
     (typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).lastIndexOf(2));
    localStorage.setItem('chatbot-session-id', sid);
    setSessionId(sid);
  }, []);

  // NEW: Scroll to the hash target after navigating to "/"
  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;

    const id = decodeURIComponent(location.hash.slice(1));
    let tries = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        // Scrolls the nearest scrollable ancestor; your <main> is overflow-y-auto
        el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        return;
      }
      // Retry briefly in case the section mounts a moment later
      if (tries < 30) {
        tries += 1;
        requestAnimationFrame(tryScroll);
      }
    };

    // Wait until <Outlet/> children have painted
    requestAnimationFrame(tryScroll);
  }, [location.pathname, location.hash, location.key]);

  // Optional: when landing on "/" without a hash, reset scroll to top
  useEffect(() => {
    if (location.pathname === '/' && !location.hash && mainContentRef.current) {
      // Use "instant" to avoid animation stutter; fall back if not supported
      try {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
      } catch {
        mainContentRef.current.scrollTop = 0;
      }
    }
  }, [location.pathname, location.hash]);

  const handleMenuClick = () => setIsMenuOpen(true);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const handleNavigate = (to) => {
    setIsMenuOpen(false);
    // "to" can be "/#section-id" from your sidebar items
    navigate(to);
  };

  return (
    <ScrollRootContext.Provider value={{ root: mainContentRef }}>
      <div className="h-full w-full flex flex-col bg-[#002147] min-h-dvh">
        {/* Header (sticky) */}
        <Header ref={headerRef} onMenuClick={handleMenuClick} />

        {/* Sidebar (overlay) */}
        <SidebarMenu
          isOpen={isMenuOpen}
          onClose={handleCloseMenu}
          onNavigate={handleNavigate}
          topOffset={headerHeight}
          bottomOffset={navBarHeight}
          isAuthenticated={isAuthenticated}
        />

        {/* Main scrollable content area */}
        <main
          ref={mainContentRef}
          className="flex-grow min-h-0 overflow-y-auto w-full overflow-x-hidden pb-16 md:pb-20"
        >
          <Outlet />
        </main>

        {/* Bottom nav (sticky) */}
        <NavigationBar ref={navBarRef} navBarHeight={navBarHeight} />
      </div>
    </ScrollRootContext.Provider>
  );
}