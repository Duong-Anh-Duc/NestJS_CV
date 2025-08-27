import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  constructor(private readonly analyticsService: AnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;

    return next.handle().pipe(
      tap(async () => {
        // Track specific endpoints
        if (this.shouldTrack(method, url)) {
          try {
            await this.analyticsService.trackEvent({
              event_type: this.getEventType(method, url),
              resource_id: this.extractResourceId(url),
              user_id: user?._id?.toString(),
              ip_address: ip,
              user_agent: request.get('User-Agent'),
              metadata: {
                method,
                url,
                timestamp: new Date()
              }
            });
          } catch (error) {
            console.error('Analytics tracking error:', error);
          }
        }
      })
    );
  }

  private shouldTrack(method: string, url: string): boolean {
    // Track specific API endpoints
    const trackablePatterns = [
      /^\/api\/v1\/jobs\/[^\/]+$/, // Job view: /api/v1/jobs/:id
      /^\/api\/v1\/companies\/[^\/]+$/, // Company view: /api/v1/companies/:id
      /^\/api\/v1\/auth\/login$/, // Login
      /^\/api\/v1\/auth\/register$/, // Register
      /^\/api\/v1\/resumes$/, // Resume submission
    ];

    return trackablePatterns.some(pattern => pattern.test(url));
  }

  private getEventType(method: string, url: string): string {
    if (url.includes('/jobs/') && method === 'GET') return 'JOB_VIEW_API';
    if (url.includes('/companies/') && method === 'GET') return 'COMPANY_VIEW_API';
    if (url.includes('/auth/login') && method === 'POST') return 'LOGIN_API';
    if (url.includes('/auth/register') && method === 'POST') return 'REGISTER_API';
    if (url.includes('/resumes') && method === 'POST') return 'RESUME_SUBMIT_API';
    
    return `${method}_${url.split('/').pop()?.toUpperCase() || 'UNKNOWN'}`;
  }

  private extractResourceId(url: string): string | undefined {
    // Extract ID from URLs like /api/v1/jobs/123
    const matches = url.match(/\/api\/v1\/\w+\/([^\/\?]+)/);
    return matches ? matches[1] : undefined;
  }
}
