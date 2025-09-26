// src/pages/sections/InteractiveSections.jsx
import React, { useState, useMemo, useEffect } from 'react';

import SocialMediaSection from './SocialMediaSection';
import FaqSection from './FaqSection';
import BugReportSection from './bugReportSection';
import SectionNavigator from '../../components/common/SectionNavigator';
import { useTranslation } from 'react-i18next';

// Use keys at module scope; resolve labels inside the component
const SECTION_DEFS = [
  { id: 'social-media', labelKey: 'interactive.sections.socialMedia' },
  { id: 'faq',         labelKey: 'interactive.sections.faq' },
  { id: 'bug-report',  labelKey: 'interactive.sections.bugReport' },
];

// Map hash fragments to section IDs
const HASH_TO_SECTION = {
  'interactive-sections-social': 'social-media',
  'interactive-sections-faq': 'faq',
  'interactive-sections-bug': 'bug-report',
};

export default function InteractiveSections() {
  const { t, i18n } = useTranslation();

  // Default visible section remains 'social-media'
  const [activeSection, setActiveSection] = useState('social-media');

  // Listen for hash changes and update active section
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (HASH_TO_SECTION[hash]) {
        setActiveSection(HASH_TO_SECTION[hash]);
        // After switching, scroll the corresponding section into view
        // Small timeout to allow the section to render
        setTimeout(() => {
          const target = document.getElementById(hash);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Resolve i18n labels whenever language changes
  const sections = useMemo(
    () => SECTION_DEFS.map(s => ({ id: s.id, label: t(s.labelKey) })),
    [t, i18n.language]
  );

  return (
    <section id="interactive-sections" className="w-full max-w-6xl mx-auto py-8">
      <SectionNavigator
        sections={sections}
        activeSectionId={activeSection}   // ✅ pass the prop name the component expects
        onSelectSection={setActiveSection}
        className="flex"
      />
      <div>
        <div id="interactive-sections-social">
          {activeSection === 'social-media' && <SocialMediaSection />}
        </div>
        <div id="interactive-sections-faq">
          {activeSection === 'faq' && <FaqSection />}
        </div>
        <div id="interactive-sections-bug">
          {activeSection === 'bug-report' && <BugReportSection />}
        </div>
      </div>
    </section>
  );
}
