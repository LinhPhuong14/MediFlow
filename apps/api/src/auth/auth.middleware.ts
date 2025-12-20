import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthLogging');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Log incoming request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Track response time
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      // Log auth-related requests with more detail
      if (originalUrl.includes('/auth/')) {
        this.logger.log(
          `Auth Request: ${method} ${originalUrl} ${statusCode} ${duration}ms`
        );
      }

      // Log failed auth attempts
      if (originalUrl.includes('/auth/login') && statusCode === 401) {
        this.logger.warn(`Failed login attempt from ${ip}`);
      }
    });

    next();
  }
}