export const trackPageView = () => {
  // Use the Datadog RUM SDK to track page views
  const rum = createBrowserRUM({
    applicationId: 'YOUR_APPLICATION_ID',
    clientToken: 'YOUR_CLIENT_TOKEN',
    env: 'production',
    service: 'vete',
    site: 'datadoghq.com',
    revision: '123',
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
  rum.startSession();
  rum.addRumGlobalContext('pageViews', 1);
};

export const trackUserSession = () => {
  // Use the Datadog RUM SDK to track user sessions
  const rum = createBrowserRUM({
    applicationId: 'YOUR_APPLICATION_ID',
    clientToken: 'YOUR_CLIENT_TOKEN',
    env: 'production',
    service: 'vete',
    site: 'datadoghq.com',
    revision: '123',
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
  rum.startSession();
  rum.addRumGlobalContext('userSessions', 1);
};

export const trackPerformanceMetrics = () => {
  // Use the Datadog RUM SDK to track performance metrics
  const rum = createBrowserRUM({
    applicationId: 'YOUR_APPLICATION_ID',
    clientToken: 'YOUR_CLIENT_TOKEN',
    env: 'production',
    service: 'vete',
    site: 'datadoghq.com',
    revision: '123',
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
  const performance = window.performance;
  const metrics = {
    loadTime: performance.getEntriesByType('navigation')[0].loadEventEnd,
    domInteractive: performance.getEntriesByType('navigation')[0].domInteractive,
    domContentLoaded: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
  };
  rum.addRumGlobalContext('performanceMetrics', metrics);
};