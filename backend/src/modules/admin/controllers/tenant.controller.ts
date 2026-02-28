import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AdminRole } from '../entities/admin-user.entity';

@Controller('admin/tenants')
@UseGuards(AdminAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(AdminRole.SUPER_ADMIN)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles(AdminRole.SUPER_ADMIN)
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.tenantService.findAll(Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
