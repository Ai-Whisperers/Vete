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