import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase/service';
import type { PageView, UserSession, PerformanceMetric } from '../types';

export class MonitoringRepository {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * Track a page view
   *
   * @param pageView - Page view data
   */
  async trackPageView(pageView: PageView): Promise<void> {
    const { error } = await this.supabase
      .from('page_views')
      .insert({
        url: pageView.url,
        referrer: pageView.referrer,
        timestamp: new Date(pageView.timestamp).toISOString(),
      });

    if (error) {
      throw error;
    }
  }

  /**
   * Track a user session
   *
   * @param session - User session data
   */
  async trackUserSession(session: UserSession): Promise<void> {
    const { error } = await this.supabase
      .from('user_sessions')
      .insert({
        id: session.id,
        started_at: new Date(session.startedAt).toISOString(),
        ended_at: session.endedAt ? new Date(session.endedAt).toISOString() : null,
      });

    if (error) {
      throw error;
    }

    // Track page views for the session
    for (const pageView of session.pages) {
      await this.trackPageView(pageView);
    }
  }

  /**
   * Track a performance metric
   *
   * @param metric - Performance metric data
   */
  async trackPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    const { error } = await this.supabase
      .from('performance_metrics')
      .insert({
        name: metric.name,
        value: metric.value,
      });

    if (error) {
      throw error;
    }
  }
}