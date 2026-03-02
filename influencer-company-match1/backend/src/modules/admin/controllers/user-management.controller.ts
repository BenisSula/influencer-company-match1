import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UserManagementService } from '../services/user-management.service';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant.decorator';
import { AdminRole } from '../entities/admin-user.entity';
import { UserRole } from '../../auth/entities/user.entity';

@Controller('admin/users')
@UseGuards(AdminAuthGuard, RolesGuard)
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.MODERATOR)
  findAll(
    @TenantId() tenantId: string,
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userManagementService.findAll({
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      tenantId, // Pass tenant context
    });
  }

  @Get('stats')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.ANALYST)
  getStats(@TenantId() tenantId: string) {
    return this.userManagementService.getUserStats(tenantId);
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  createUser(@Body() createData: any, @Req() req: any, @TenantId() tenantId: string) {
    return this.userManagementService.createUser(createData, req.adminUser.sub, tenantId);
  }

  @Get('export')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  exportUsers(
    @Query('role') role?: UserRole,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.userManagementService.exportUsers({
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    });
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id);
  }

  @Get(':id/profile')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT)
  getUserProfile(@Param('id') id: string) {
    return this.userManagementService.getUserProfile(id);
  }

  @Get(':id/activity')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.MODERATOR)
  getUserActivity(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.userManagementService.getUserActivityLogs(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  update(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    return this.userManagementService.updateUser(id, updateData, req.adminUser.sub);
  }

  @Patch(':id/profile')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  updateProfile(@Param('id') id: string, @Body() updateData: any, @Req() req: any) {
    return this.userManagementService.updateUserProfile(id, updateData, req.adminUser.sub);
  }

  @Patch(':id/toggle-status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN, AdminRole.MODERATOR)
  toggleStatus(@Param('id') id: string, @Req() req: any) {
    return this.userManagementService.toggleUserStatus(id, req.adminUser.sub);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  delete(@Param('id') id: string, @Req() req: any) {
    return this.userManagementService.deleteUser(id, req.adminUser.sub);
  }

  @Post('bulk-delete')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  bulkDelete(@Body('ids') ids: string[], @Req() req: any) {
    return this.userManagementService.bulkDelete(ids, req.adminUser.sub);
  }

  @Post('bulk-update-status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TENANT_ADMIN)
  bulkUpdateStatus(
    @Body('ids') ids: string[],
    @Body('isActive') isActive: boolean,
    @Req() req: any,
  ) {
    return this.userManagementService.bulkUpdateStatus(ids, isActive, req.adminUser.sub);
  }
}
