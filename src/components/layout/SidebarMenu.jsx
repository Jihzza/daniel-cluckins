// src/components/layout/SidebarMenu.jsx

import React, { Fragment, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Static hrefs (labels come from i18n)
const mainPagesHrefs = ['/', '/profile', '/chat', '/calendar'];
const exploreLinksHrefs = [
  '/#consultations-section', '/#coaching-section', '/#invest-section',
  '/#testimonials-section', '/#media-appearances-section', '/#other-wins-section',
  '/#interactive-sections-social', '/#interactive-sections-faq', '/#interactive-sections-bug'
];

const MotionLink = motion.create(Link);

export default function SidebarMenu({ isOpen, onClose, isAuthenticated = true, style, topOffset, bottomOffset, topOffsetSelector, bottomOffsetSelector }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const closeButtonRef = useRef(null);
  const prefersReduced = useReducedMotion();

  // Optional selectors for measuring header/nav heights if numeric offsets aren't provided
  const headerSelector = topOffsetSelector ?? '[data-app-header], header[role="banner"], header';
  const bottomNavSelector = bottomOffsetSelector ?? '[data-bottom-nav], nav[role="navigation"].bottom-nav, nav.bottom-nav, footer[role="contentinfo"]';

  // Compute dynamic visible height and subtract app header + bottom nav so the panel fits exactly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getElHeight = (sel) => {
      if (!sel) return 0;
      const el = document.querySelector(sel);
      return el ? Math.ceil(el.getBoundingClientRect().height) : 0;
    };

    const setMetrics = () => {
      const dvh = window.innerHeight; // true visible height
      // Use numeric prop override if present, otherwise measure via selectors
      const top = typeof topOffset === 'number' ? topOffset : getElHeight(headerSelector);
      const bottom = typeof bottomOffset === 'number' ? bottomOffset : getElHeight(bottomNavSelector);

      document.documentElement.style.setProperty('--app-dvh', `${dvh}px`);
      document.documentElement.style.setProperty('--sidebar-top-offset', `${top}px`);
      document.documentElement.style.setProperty('--sidebar-bottom-offset', `${bottom}px`);
    };

    setMetrics();

    const ro = new ResizeObserver(() => setMetrics());
    const headerEl = document.querySelector(headerSelector) || undefined;
    const bottomEl = document.querySelector(bottomNavSelector) || undefined;
    headerEl && ro.observe(headerEl);
    bottomEl && ro.observe(bottomEl);

    window.addEventListener('resize', setMetrics);
    window.addEventListener('orientationchange', setMetrics);
    return () => {
      window.removeEventListener('resize', setMetrics);
      window.removeEventListener('orientationchange', setMetrics);
      ro.disconnect();
    };
  }, [topOffset, bottomOffset, headerSelector, bottomNavSelector]);

  const mainPages = (t('sidebar.mainPages', { returnObjects: true }) || []).map((item, index) => ({
    ...item,
    href: mainPagesHrefs[index]
  }));
  const exploreLinks = (t('sidebar.exploreLinks', { returnObjects: true }) || []).map((item, index) => ({
    ...item,
    href: exploreLinksHrefs[index]
  }));

  const isActive = (href) => {
    if (!href) return false;
    const [path] = href.split('#');
    return location.pathname === (path || href);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
    navigate('/login');
  };

  const handleLinkClick = (href) => {
    onClose?.();
    if (href.includes('#')) {
      const [path, id] = href.split('#');
      // Always reflect the hash in the URL so listeners react
      if (path && location.pathname !== path) {
        navigate(`${path}#${id}`);
        // After navigation, ensure the target is scrolled into view
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        // Same page: update hash to trigger hashchange and switch section
        if (window.location.hash !== `#${id}`) {
          window.location.hash = id;
        }
        // Ensure we scroll to the exact target element
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(href);
    }
  };

  const itemBase =
    'flex items-center gap-3 rounded-xl px-3 py-2 text-base md:text-lg lg:text-base transition-colors outline-none hover:bg-black/10 focus-visible:bg-black/10 focus-visible:ring-2 focus-visible:ring-yellow-400/70 cursor-pointer';

  const authColorClasses = isAuthenticated
    ? 'text-red-400 hover:text-red-300 focus-visible:ring-red-400/70'
    : 'text-green-300 hover:text-emerald-300 focus-visible:ring-emerald-400/70';

  // Motion variants (unchanged)
  const panelVariants = prefersReduced
    ? {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.15 } },
      exit: { opacity: 0, transition: { duration: 0.12 } },
    }
    : {
      hidden: { x: '-100%', opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }
      },
      exit: { x: '-100%', opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
    };

  const backdropVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  };

  const listGroup = prefersReduced
    ? { hidden: {}, show: {} }
    : {
      hidden: {},
      show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
    };

  const listItem = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
      hidden: { opacity: 0, y: 6 },
      show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 420, damping: 30, mass: 0.6 }
      },
    };

  return (
    <Dialog
      as="div"
      open={!!isOpen}
      onClose={onClose}
      className="relative z-[100]"
      initialFocus={closeButtonRef}
    >
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="backdrop"
              className="fixed inset-x-0 z-[60] bg-black/60 cursor-pointer"
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={onClose}
              style={{
                top: 'var(--sidebar-top-offset, 0px)',
                height: 'calc(var(--app-dvh) - var(--sidebar-top-offset, 0px))'
              }}
            />

            {/* Slide-over */}
            <div className="fixed inset-x-0 z-[60] flex"
              style={{
                top: 'var(--sidebar-top-offset, 0px)',
                height: 'calc(var(--app-dvh) - var(--sidebar-top-offset, 0px))'
              }}>
              <Dialog.Panel
                as={motion.div}
                key="panel"
                style={{
                  WebkitOverflowScrolling: "touch",
                  height: "100%",
                  touchAction: "pan-y",
                  overscrollBehavior: "contain"
                }}
                className="pointer-events-auto relative w-[78vw] sm:w-[380px] lg:w-[420px] bg-black text-white shadow-2xl overflow-y-auto box-border z-60"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Header (sticky so the close button stays visible) */}
                <div className="flex items-center justify-between px-4 md:px-6 md:py-4 border-b border-white/10 lg:py-1">
                  <Dialog.Title className="text-sm md:text-lg lg:text-base font-semibold tracking-wide text-yellow-400">
                    {t('sidebar.title', { defaultValue: 'Menu' })}
                  </Dialog.Title>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center rounded-lg p-2 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70 cursor-pointer"
                    aria-label={t('common.close', { defaultValue: 'Close' })}
                  >
                    <XMarkIcon className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </div>

                {/* Content (scrollable when the viewport is short) */}
                <div
                  className="flex h-auto flex-col px-3 py-3 md:px-5 md:py-5 lg:py-3 sidebar-scrollbar pb-2"
                >
                  <nav aria-label={t('sidebar.navigation', { defaultValue: 'Primary' })} className="flex-1">
                    {/* Main pages */}
                    <motion.ul role="list" className="space-y-1 md:space-y-2 lg:space-y-1"
                      variants={listGroup} initial="hidden" animate="show"
                    >
                      {mainPages.map((item) => (
                        <motion.li key={item.label} variants={listItem}>
                          <MotionLink
                            to={item.href}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLinkClick(item.href);
                            }}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.12 }}
                            className={`${itemBase} ${isActive(item.href) ? 'text-yellow-400 bg-white/5' : 'text-white/90 hover:text-yellow-400'}`}
                          >
                            <span className="truncate text-base md:text-xl lg:text-base">{item.label}</span>
                          </MotionLink>
                        </motion.li>
                      ))}
                    </motion.ul>

                    {/* Explore */}
                    <div className="mt-6 md:mt-8 lg:mt-4">
                      <h2 className="px-2 text-xs md:text-base font-semibold uppercase tracking-wider text-yellow-400/90 lg:text-sm">
                        {t('sidebar.explore')}
                      </h2>

                      <motion.ul role="list" className="mt-2 space-y-1 md:space-y-2 lg:space-y-1"
                        variants={listGroup} initial="hidden" animate="show"
                      >
                        {exploreLinks.map((item) => (
                          <motion.li key={item.label} variants={listItem}>
                            <MotionLink
                              to={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(item.href);
                              }}
                              whileTap={{ scale: 0.98 }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.12 }}
                              className={`${itemBase} text-white/90 hover:text-yellow-400`}
                            >
                              <span className="truncate text-base md:text-xl lg:text-base">{item.label}</span>
                            </MotionLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </nav>

                  {/* Footer actions */}
                  <div className="border-t border-white/10 pt-2 mt-2 space-y-2 md:pt-4 md:mt-4 lg:mt-2 lg:pt-2 lg:space-y-0">
                    <motion.button
                      type="button"
                      onClick={isAuthenticated ? handleSignOut : () => handleLinkClick('/login')}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.12 }}
                      className={`${itemBase} w-full text-left ${authColorClasses} cursor-pointer`}
                      aria-label={isAuthenticated
                        ? t('sidebar.logout', { defaultValue: 'Log Out' })
                        : t('sidebar.login', { defaultValue: 'Log In' })}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 md:h-7 md:w-7 lg:h-5 lg:w-5" />
                      <span className="text-base md:text-xl lg:text-base">
                        {isAuthenticated
                          ? t('sidebar.logout', { defaultValue: 'Log Out' })
                          : t('sidebar.login', { defaultValue: 'Log In' })}
                      </span>
                    </motion.button>

                    <MotionLink
                      to="/settings"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick('/settings');
                      }}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.12 }}
                      className={`${itemBase} text-white/90 hover:text-yellow-400`}
                    >
                      <Cog6ToothIcon className="h-5 w-5 md:h-7 md:w-7 lg:h-5 lg:w-5" />
                      <span className="text-base md:text-xl lg:text-base">{t('sidebar.settings')}</span>
                    </MotionLink>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
