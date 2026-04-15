import { MonitoringRepository } from './repository';
import type { PageView, UserSession, PerformanceMetric } from '../types';

export class MonitoringService {
  private repository: MonitoringRepository;

  constructor() {
    this.repository = new MonitoringRepository();
  }

  /**
   * Track a page view
   *
   * @param pageView - Page view data
   */
  async trackPageView(pageView: PageView): Promise<void> {
    await this.repository.trackPageView(pageView);
  }

  /**
   * Track a user session
   *
   * @param session - User session data
   */
  async trackUserSession(session: UserSession): Promise<void> {
    await this.repository.trackUserSession(session);
  }

  /**
   * Track a performance metric
   *
   * @param metric - Performance metric data
   */
  async trackPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    await this.repository.trackPerformanceMetric(metric);
  }
}