import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from subdomain or header
    const host = req.get('host');
    const subdomain = host?.split('.')[0];
    
    // Or from custom header (useful for development and API clients)
    const tenantIdHeader = req.get('X-Tenant-ID');
    
    // Priority: Header > Subdomain > Default
    const tenantId = tenantIdHeader || subdomain || 'default';
    
    // Attach to request object
    req['tenantId'] = tenantId;
    
    next();
  }
}
