import { LoggerService, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class StructuredLogger implements LoggerService {
  static dataSource: DataSource | null = null;
  private static isSaving = false;

  private saveToDb(level: string, message: any, context?: string) {
    if (StructuredLogger.isSaving) {
      return;
    }
    // Prevent logging TypeORM operations to avoid infinite cycles
    if (context === 'TypeOrmModule' || (context && context.toLowerCase().includes('typeorm'))) {
      return;
    }

    if (StructuredLogger.dataSource && StructuredLogger.dataSource.isInitialized) {
      StructuredLogger.isSaving = true;
      try {
        const repo = StructuredLogger.dataSource.getRepository(AuditLog);
        const logMessage = message instanceof Error ? message.message : typeof message === 'object' ? JSON.stringify(message) : message;
        repo.save({
          level,
          context: context || 'Application',
          message: String(logMessage || ''),
        })
        .then(() => {
          StructuredLogger.isSaving = false;
        })
        .catch(() => {
          StructuredLogger.isSaving = false;
        });
      } catch (err) {
        StructuredLogger.isSaving = false;
      }
    }
  }

  private formatLog(level: string, message: any, context?: string, trace?: string) {
    const timestamp = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === 'production';

    const logMessage = message instanceof Error ? message.message : message;
    const logTrace = message instanceof Error ? message.stack : trace;

    if (isProduction) {
      // In production, output structured JSON for ELK/Splunk ingestion
      const logObject: Record<string, any> = {
        timestamp,
        level,
        context: context || 'Application',
        message: logMessage,
      };

      if (logTrace) {
        logObject.trace = logTrace;
      }

      return JSON.stringify(logObject);
    } else {
      // In development, output clean, readable logs with visual prefixes
      const colorMap: Record<string, string> = {
        INFO: '\x1b[32m',  // Green
        WARN: '\x1b[33m',  // Yellow
        ERROR: '\x1b[31m', // Red
        DEBUG: '\x1b[34m', // Blue
        LOG: '\x1b[36m',   // Cyan
      };
      const resetColor = '\x1b[0m';
      const color = colorMap[level] || resetColor;
      const ctxStr = context ? ` [\x1b[33m${context}\x1b[0m]` : '';
      
      let out = `${color}[${level}]${resetColor} ${timestamp}${ctxStr} ${logMessage}`;
      if (logTrace) {
        out += `\n${logTrace}`;
      }
      return out;
    }
  }

  log(message: any, context?: string) {
    console.log(this.formatLog('LOG', message, context));
    this.saveToDb('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatLog('ERROR', message, context, trace));
    this.saveToDb('ERROR', message, context);
  }

  warn(message: any, context?: string) {
    console.warn(this.formatLog('WARN', message, context));
    this.saveToDb('WARN', message, context);
  }

  debug?(message: any, context?: string) {
    console.debug(this.formatLog('DEBUG', message, context));
  }

  verbose?(message: any, context?: string) {
    console.log(this.formatLog('VERBOSE', message, context));
  }
}
