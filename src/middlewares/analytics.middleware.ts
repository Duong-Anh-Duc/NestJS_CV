import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AnalyticsMiddleware implements NestMiddleware {
  constructor(private analyticsService: AnalyticsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    
    res.send = function(body) {
      // Track API calls for specific routes
      if (req.method === 'GET' && req.url.startsWith('/api/v1/jobs/') && req.url !== '/api/v1/jobs') {
        const jobId = req.url.split('/').pop();
        if (jobId && jobId !== 'undefined') {
          // Track job view asynchronously
          setImmediate(async () => {
            try {
              await this.analyticsService.trackEvent({
                event_type: 'JOB_VIEW_API',
                resource_id: jobId,
                user_id: req.user?.['_id']?.toString(),
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                metadata: {
                  method: req.method,
                  url: req.url
                }
              });
            } catch (error) {
              console.error('Analytics tracking error:', error);
            }
          });
        }
      }
      
      return originalSend.call(this, body);
    }.bind(this);

    next();
  }
}
