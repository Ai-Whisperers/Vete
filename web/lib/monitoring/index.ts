/**
 * Comprehensive monitoring system
 * Logging, metrics, and observability for the application
 */

// Structured logging
export {
  logger,
  createRequestLogger,
  logApiRequest,
  logDatabaseOperation,
  type LogLevel,
  type LogContext,
  type LogEntry,
} from './logger'

// Metrics collection
export {
  metrics,
  businessMetrics,
  performanceMetrics,
  systemMetrics,
  MetricsCollector,
  type MetricValue,
  type Counter,
  type Gauge,
  type Histogram,
} from './metrics'

// AUDIT-002: Alerting system
export {
  sendAlert,
  sendCronFailureAlert,
  sendHighErrorRateAlert,
  sendSlowJobAlert,
  type AlertPayload,
  type AlertType,
  type AlertSeverity,
} from './alerts'
