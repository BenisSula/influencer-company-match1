import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus, SubscriptionTier } from '../entities/tenant.entity';
import { AdminUser, AdminRole } from '../entities/admin-user.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists');
    }

    // Check if admin email already exists
    const existingAdmin = await this.adminUserRepository.findOne({
      where: { email: createTenantDto.adminEmail },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin email already exists');
    }

    // Create tenant
    const tenant = this.tenantRepository.create({
      subdomain: createTenantDto.subdomain,
      name: createTenantDto.name,
      subscriptionTier: createTenantDto.subscriptionTier || SubscriptionTier.TRIAL,
      status: TenantStatus.TRIAL,
      branding: createTenantDto.branding || {},
      features: this.getDefaultFeatures(createTenantDto.subscriptionTier || SubscriptionTier.TRIAL),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create tenant admin user
    const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);
    const adminUser = this.adminUserRepository.create({
      email: createTenantDto.adminEmail,
      password: hashedPassword,
      fullName: createTenantDto.adminFullName,
      role: AdminRole.TENANT_ADMIN,
      tenantId: savedTenant.id,
    });

    await this.adminUserRepository.save(adminUser);

    return savedTenant;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: Tenant[]; total: number }> {
    const [data, total] = await this.tenantRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['adminUsers'],
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
  }

  private getDefaultFeatures(tier: SubscriptionTier) {
    const features = {
      [SubscriptionTier.TRIAL]: {
        maxUsers: 10,
        maxMatches: 50,
        aiMatching: false,
        analytics: false,
        customBranding: false,
        apiAccess: false,
      },
      [SubscriptionTier.BASIC]: {
        maxUsers: 50,
        maxMatches: 500,
        aiMatching: true,
        analytics: true,
        customBranding: false,
        apiAccess: false,
      },
      [SubscriptionTier.PRO]: {
        maxUsers: 200,
        maxMatches: 2000,
        aiMatching: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
      },
      [SubscriptionTier.ENTERPRISE]: {
        maxUsers: -1, // unlimited
        maxMatches: -1, // unlimited
        aiMatching: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
      },
    };

    return features[tier];
  }
}
