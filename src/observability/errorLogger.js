// Observability Error Logging System

const MAX_LOG_ENTRIES = 100;
const LOGS_STORAGE_KEY = 'zsports_system_logs';

class ErrorLogger {
  constructor() {
    this.logs = this._loadLogs();
  }

  _loadLogs() {
    try {
      const stored = localStorage.getItem(LOGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  _saveLogs() {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs.slice(0, MAX_LOG_ENTRIES)));
    } catch (e) {
      console.warn('Failed to persist logs to localStorage:', e);
    }
  }

  _createEntry(level, message, error = null, context = {}) {
    return {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message: message || (error ? error.message : 'Unknown message'),
      stack: error ? error.stack : null,
      context,
    };
  }

  logInfo(message, context = {}) {
    const entry = this._createEntry('INFO', message, null, context);
    this.logs.unshift(entry);
    this._saveLogs();
    console.info(`[ZSports Info] [${entry.timestamp}] ${message}`, context);
  }

  logWarning(message, context = {}) {
    const entry = this._createEntry('WARNING', message, null, context);
    this.logs.unshift(entry);
    this._saveLogs();
    console.warn(`[ZSports Warn] [${entry.timestamp}] ${message}`, context);
  }

  logError(error, message = '', context = {}) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const entry = this._createEntry('ERROR', message || errorObj.message, errorObj, context);
    
    this.logs.unshift(entry);
    this._saveLogs();
    
    console.error(
      `[ZSports Error] [${entry.timestamp}] ${entry.message}\n` +
      `Context: ${JSON.stringify(context, null, 2)}\n` +
      `Stack: ${entry.stack || 'No stack trace available'}`
    );
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem(LOGS_STORAGE_KEY);
    } catch {}
  }
}

export const errorLogger = new ErrorLogger();
export default errorLogger;
