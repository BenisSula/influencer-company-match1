import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { BrandingService } from '../services/branding.service';
import { UpdateBrandingDto } from '../dto/update-branding.dto';
import { AdminRole } from '../entities/admin-user.entity';

@Controller('admin/branding')
@UseGuards(AdminAuthGuard, RolesGuard)
export class BrandingAliasController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async getBranding(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user?.tenantId || req.query.tenantId;
    return await this.brandingService.getBranding(tenantId);
  }

  @Patch()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  async updateBranding(@Request() req, @Body() dto: UpdateBrandingDto) {
    const user = req.adminUser || req.user;
    const tenantId = user?.tenantId || req.body.tenantId;
    return await this.brandingService.updateBranding(tenantId, dto);
  }
}
