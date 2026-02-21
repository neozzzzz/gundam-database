// src/lib/utils/logger.ts
// 구조화된 로깅 유틸리티

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.isDevelopment && level === 'debug') {
      return
    }

    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    }

    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] DEBUG:`, message, context || '')
        break
      case 'info':
        console.info(`[${timestamp}] INFO:`, message, context || '')
        break
      case 'warn':
        console.warn(`[${timestamp}] WARN:`, message, context || '')
        break
      case 'error':
        console.error(`[${timestamp}] ERROR:`, message, context || '')
        // 프로덕션에서는 여기에 Sentry 등 에러 추적 서비스 호출
        break
    }

    // 프로덕션에서는 에러만 외부 서비스로 전송
    if (!this.isDevelopment && level === 'error') {
      // TODO: Sentry.captureException(logData)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
    this.log('error', message, errorContext)
  }
}

export const logger = new Logger()
