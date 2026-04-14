import { useState, useEffect } from 'react';
import { createBrowserRUM } from '@datadog/browser-rum';

const rum = createBrowserRUM({
  applicationId: 'YOUR_APPLICATION_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  env: 'production',
  service: 'vete',
  // Use the site parameter to differentiate between environments
  site: 'datadoghq.com',
  // Use the revision parameter to track which version of the code is running
  revision: '123',
  trackInteractions: true,
  defaultPrivacyLevel: 'mask-user-input',
});

const RealUserMonitoring = () => {
  const [pageViews, setPageViews] = useState(0);
  const [userSessions, setUserSessions] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  useEffect(() => {
    // Track page views
    rum.startSession();
    rum.addRumGlobalContext('pageViews', pageViews + 1);

    // Track user sessions
    rum.addRumGlobalContext('userSessions', userSessions + 1);

    // Track performance metrics
    const performance = window.performance;
    const metrics = {
      loadTime: performance.getEntriesByType('navigation')[0].loadEventEnd,
      domInteractive: performance.getEntriesByType('navigation')[0].domInteractive,
      domContentLoaded: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
    };
    setPerformanceMetrics(metrics);
  }, [pageViews, userSessions]);

  return (
    <div>
      <h1>Real User Monitoring</h1>
      <p>Page Views: {pageViews}</p>
      <p>User Sessions: {userSessions}</p>
      <p>Performance Metrics:</p>
      <ul>
        <li>Load Time: {performanceMetrics.loadTime}</li>
        <li>DOM Interactive: {performanceMetrics.domInteractive}</li>
        <li>DOM Content Loaded: {performanceMetrics.domContentLoaded}</li>
      </ul>
    </div>
  );
};

export default RealUserMonitoring;