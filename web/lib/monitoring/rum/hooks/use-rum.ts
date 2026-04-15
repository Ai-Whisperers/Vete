import { useEffect } from 'react';
import { trackPageView, trackUserSession } from './rum';

/**
 * useRUM Hook
 *
 * Automatically tracks page views and user sessions.
 */

export function useRum() {
  useEffect(() => {
    const pageView: PageView = {
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now(),
    };

    trackPageView(pageView);

    const session: UserSession = {
      id: 'session-id',
      startedAt: Date.now(),
      endedAt: null,
      pages: [pageView],
    };

    trackUserSession(session);

    return () => {
      session.endedAt = Date.now();
      trackUserSession(session);
    };
  }, []);
}