// src/hooks/useScheduleNavigation.js
import * as React from "react";
import { useNavigate } from "react-router-dom";

export function useScheduleNavigation() {
  const navigate = useNavigate();

  return React.useCallback((service, options = {}) => {
    const params = new URLSearchParams({
      service,                          // 'coaching' | 'consultation' | 'pitchdeck'
      step: String(options.step ?? 2),  // wizard step to open
    });

    if (options.plan) params.set("plan", options.plan); // e.g. 'basic' | 'standard' | 'premium'
    if (options.deck) params.set("deck", options.deck); // if you deep-link pitch decks

    navigate(`/schedule?${params.toString()}`);
  }, [navigate]);
}
