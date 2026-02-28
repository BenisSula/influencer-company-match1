import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { BrandingService } from '../services/branding.service';
import { EmailTemplateService } from '../services/email-template.service';
import {
  UpdateBrandingDto,
  UpdateFeaturesDto,
  UpdateIntegrationsDto,
} from '../dto/update-branding.dto';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../dto/create-email-template.dto';

@Controller('admin/customization')
@UseGuards(AdminAuthGuard, RolesGuard)
export class BrandingController {
  constructor(
    private readonly brandingService: BrandingService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  // Branding Endpoints
  @Get('branding')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getBranding(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    return await this.brandingService.getBranding(tenantId);
  }

  @Patch('branding')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateBranding(@Request() req, @Body() dto: UpdateBrandingDto) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    return await this.brandingService.updateBranding(tenantId, dto);
  }

  @Post('upload-asset/:type')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @Request() req,
    @Param('type') type: 'logo' | 'favicon',
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    const url = await this.brandingService.uploadAsset(tenantId, file, type);
    return { url };
  }

  // Features Endpoints
  @Get('features')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getFeatures(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    return await this.brandingService.getFeatures(tenantId);
  }

  @Patch('features')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateFeatures(@Request() req, @Body() dto: UpdateFeaturesDto) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    return await this.brandingService.updateFeatures(tenantId, dto);
  }

  // Integrations Endpoints
  @Get('integrations')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getIntegrations(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    return await this.brandingService.getIntegrations(tenantId);
  }

  @Patch('integrations')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateIntegrations(@Request() req, @Body() dto: UpdateIntegrationsDto) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    return await this.brandingService.updateIntegrations(tenantId, dto);
  }

  // Email Templates Endpoints
  @Get('email-templates')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getEmailTemplates(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    return await this.emailTemplateService.findAll(tenantId);
  }

  @Post('email-templates')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createEmailTemplate(@Request() req, @Body() dto: CreateEmailTemplateDto) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    return await this.emailTemplateService.create(tenantId, dto);
  }

  @Get('email-templates/:id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getEmailTemplate(@Request() req, @Param('id') id: string) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    return await this.emailTemplateService.findOne(id, tenantId);
  }

  @Patch('email-templates/:id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateEmailTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    return await this.emailTemplateService.update(id, tenantId, dto);
  }

  @Delete('email-templates/:id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async deleteEmailTemplate(@Request() req, @Param('id') id: string) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.query.tenantId;
    await this.emailTemplateService.delete(id, tenantId);
    return { message: 'Email template deleted successfully' };
  }

  @Post('email-templates/init-defaults')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async initDefaultTemplates(@Request() req) {
    const user = req.adminUser || req.user;
    const tenantId = user.tenantId || req.body.tenantId;
    await this.emailTemplateService.createDefaultTemplates(tenantId);
    return { message: 'Default email templates created successfully' };
  }
}
