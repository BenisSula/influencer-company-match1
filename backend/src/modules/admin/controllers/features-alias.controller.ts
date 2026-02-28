import { Controller, Get, Put, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { BrandingService } from '../services/branding.service';
import { AdminRole } from '../entities/admin-user.entity';

@Controller('admin/features')
@UseGuards(AdminAuthGuard, RolesGuard)
export class FeaturesAliasController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async getFeatures(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user?.tenantId || req.query.tenantId;
    const config = await this.brandingService.getOrCreateConfig(tenantId);
    return config.features || {};
  }

  @Patch()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async updateFeatures(@Request() req, @Body() dto: any) {
    const user = req.adminUser || req.user;
    const tenantId = user?.tenantId || req.body.tenantId;
    
    // Get current config
    const currentConfig = await this.brandingService.getOrCreateConfig(tenantId);
    
    // Update with new features
    const updatedFeatures = { ...currentConfig.features, ...dto };
    
    return await this.brandingService.updateFeatures(tenantId, updatedFeatures);
  }

  @Put(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async updateFeatureFlag(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: { enabled: boolean },
  ) {
    const user = req.adminUser || req.user;
    const tenantId = user?.tenantId || req.body.tenantId;
    
    // Get current config
    const currentConfig = await this.brandingService.getOrCreateConfig(tenantId);
    
    // Update specific feature
    const updatedFeatures = { 
      ...currentConfig.features, 
      [id]: dto.enabled 
    };
    
    return await this.brandingService.updateFeatures(tenantId, updatedFeatures);
  }
}
