// src/components/layout/SidebarMenu.jsx

import React, { Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from '../../services/authService';
import { useTranslation } from 'react-i18next';

// Static data for links.
const mainPagesHrefs = ['/', '/profile', '/messages', '/calendar'];
const exploreLinksHrefs = [
    '/#consultations-section', '/#coaching-section', '/#invest-section',
    '/#testimonials-section', '/#media-appearances-section', '/#other-wins-section',
    '/#interactive-sections-social', '/#interactive-sections-faq', '/#interactive-sections-bug'
];


export default function SidebarMenu({ isOpen, onClose, isAuthenticated = true, style }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const mainPages = (t('sidebar.mainPages', { returnObjects: true }) || []).map((item, index) => ({
        ...item,
        href: mainPagesHrefs[index]
    }));

    const exploreLinks = (t('sidebar.exploreLinks', { returnObjects: true }) || []).map((item, index) => ({
        ...item,
        href: exploreLinksHrefs[index]
    }));


    const handleSignOut = async () => {
        await signOut();
        onClose();
        navigate('/login');
    };

    const handleLinkClick = (href) => {
        onClose();
        if (href.includes('#')) {
            const [path, id] = href.split('#');
            if (path && location.pathname !== path) {
                navigate(`${path}#${id}`);
                setTimeout(() => {
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
            } else {
                if (window.location.hash !== `#${id}`) {
                    window.location.hash = id;
                }
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate(href);
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/60" 
                onClick={onClose}
            />
            
            {/* Sidebar */}
            <div 
                className="fixed left-0 top-0 h-full w-[70vw] md:w-[50vw] lg:[30vw] bg-black text-white"
                style={style}
            >
                {/* - Apply the `sidebar-scrollbar` class to this div.
                  - This is the element with `overflow-y-auto`, making it the scroll container. 
                */}
                <div className="flex flex-grow flex-col gap-y-5 overflow-y-auto px-6 py-2 sidebar-scrollbar">
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1 lg:space-y-0">
                                    {mainPages.map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                to={item.href}
                                                onClick={() => handleLinkClick(item.href)}
                                                className="block rounded-md px-2 py-2 text-base md:text-xl lg:text-sm leading-4 text-white hover:bg-black/10 hover:text-yellow-400"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li>
                                <div className="text-sm md:text-lg lg:text-base font-semibold leading-6 lg:mt-2 text-yellow-400">{t('sidebar.explore')}</div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1 lg:space-y-0">
                                    {exploreLinks.map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                to={item.href}
                                                onClick={() => handleLinkClick(item.href)}
                                                className="block rounded-md px-2 py-2 text-base md:text-xl lg:text-sm leading-6 text-white hover:bg-black/10 hover:text-yellow-400"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <Link
                                    to="/settings"
                                    onClick={() => handleLinkClick('/settings')}
                                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm md:text-lg lg:text-base leading-6 text-white hover:bg-black/10 items-center"
                                >
                                    <Cog6ToothIcon className="h-6 w-6 md:h-8 md:w-8 lg:h-4 lg:w-4 hrink-0" />
                                    {t('sidebar.settings')}
                                </Link>
                                <button 
                                    onClick={handleSignOut} 
                                    className="group -mx-2 flex w-full gap-x-3 rounded-md md:text-lg lg:text-base p-2 text-sm font-semibold leading-6 text-white hover:bg-black/10 items-center"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-6 w-6 md:h-8 md:w-8 lg:h-4 lg:w-4 shrink-0" />
                                    {t('sidebar.logout')}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}