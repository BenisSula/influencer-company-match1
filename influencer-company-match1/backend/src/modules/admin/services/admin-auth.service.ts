import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string, ipAddress?: string): Promise<{ accessToken: string; adminUser: Partial<AdminUser> }> {
    const adminUser = await this.adminUserRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });

    if (!adminUser || !adminUser.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    adminUser.lastLoginAt = new Date();
    adminUser.lastLoginIp = ipAddress;
    await this.adminUserRepository.save(adminUser);

    // Log login
    await this.logAction(adminUser.id, AuditAction.LOGIN, 'AdminUser', adminUser.id, null, ipAddress);

    // Generate JWT
    const payload = {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      tenantId: adminUser.tenantId,
      isAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
        tenant: adminUser.tenant,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logAction(
    adminUserId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
    ipAddress?: string,
  ): Promise<void> {
    const log = this.auditLogRepository.create({
      adminUserId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress,
    });

    await this.auditLogRepository.save(log);
  }
}
