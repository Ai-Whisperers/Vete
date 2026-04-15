import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Real User Monitoring (RUM) Service
 *
 * Tracks page views, user sessions, and performance metrics.
 */

export interface PageView {
  url: string;
  referrer: string;
  timestamp: number;
}

export interface UserSession {
  id: string;
  startedAt: number;
  endedAt: number;
  pages: PageView[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Track a page view
 *
 * @param pageView - Page view data
 */
export async function trackPageView(pageView: PageView): Promise<void> {
  try {
    const { error } = await supabase
      .from('page_views')
      .insert({
        url: pageView.url,
        referrer: pageView.referrer,
        timestamp: new Date(pageView.timestamp).toISOString(),
      });

    if (error) {
      logger.error('Failed to track page view:', error);
    }
  } catch (error) {
    logger.error('Error tracking page view:', error);
  }
}

/**
 * Track a user session
 *
 * @param session - User session data
 */
export async function trackUserSession(session: UserSession): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .insert({
        id: session.id,
        started_at: new Date(session.startedAt).toISOString(),
        ended_at: session.endedAt ? new Date(session.endedAt).toISOString() : null,
      });

    if (error) {
      logger.error('Failed to track user session:', error);
    }

    // Track page views for the session
    for (const pageView of session.pages) {
      await trackPageView(pageView);
    }
  } catch (error) {
    logger.error('Error tracking user session:', error);
  }
}

/**
 * Track a performance metric
 *
 * @param metric - Performance metric data
 */
export async function trackPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  try {
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        name: metric.name,
        value: metric.value,
      });

    if (error) {
      logger.error('Failed to track performance metric:', error);
    }
  } catch (error) {
    logger.error('Error tracking performance metric:', error);
  }
}