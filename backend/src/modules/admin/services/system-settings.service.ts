import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../entities/system-config.entity';
import { SettingsGateway } from '../gateways/settings.gateway';
import * as crypto from 'crypto';

@Injectable()
export class SystemSettingsService {
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
    private settingsGateway: SettingsGateway,
  ) {}

  async getAllSettings() {
    const settings = await this.systemConfigRepository.find();
    
    // Return flat array instead of grouped object
    return settings.map(s => ({
      key: s.key,
      value: s.isEncrypted ? this.decrypt(s.value) : s.value,
      description: s.description,
      category: s.category,
      isEncrypted: s.isEncrypted,
    }));
  }

  async getSetting(key: string) {
    const setting = await this.systemConfigRepository.findOne({ where: { key } });
    
    if (!setting) {
      return null;
    }
    
    return {
      key: setting.key,
      value: setting.isEncrypted ? this.decrypt(setting.value) : setting.value,
      description: setting.description,
      category: setting.category,
    };
  }

  async updateSetting(key: string, value: string, isEncrypted = false) {
    let setting = await this.systemConfigRepository.findOne({ where: { key } });
    
    const finalValue = isEncrypted ? this.encrypt(value) : value;
    
    if (setting) {
      setting.value = finalValue;
      setting.isEncrypted = isEncrypted;
    } else {
      setting = this.systemConfigRepository.create({
        key,
        value: finalValue,
        isEncrypted,
        category: this.getCategoryFromKey(key),
      });
    }
    
    const savedSetting = await this.systemConfigRepository.save(setting);
    
    // 🚀 BROADCAST CHANGE TO ALL CLIENTS
    this.settingsGateway.broadcastSettingChange(
      key,
      isEncrypted ? '[ENCRYPTED]' : value,
      setting.category
    );
    
    // Special handling for branding changes
    if (setting.category === 'BRANDING' || key.startsWith('branding.')) {
      await this.handleBrandingChange();
    }
    
    // Special handling for maintenance mode
    if (key === 'system.maintenance.enabled') {
      await this.handleMaintenanceModeChange(value);
    }
    
    return savedSetting;
  }

  async updateMultipleSettings(settings: Array<{ key: string; value: string; isEncrypted?: boolean }>) {
    const results = [];
    
    for (const setting of settings) {
      const result = await this.updateSetting(
        setting.key,
        setting.value,
        setting.isEncrypted || false,
      );
      results.push({
        key: setting.key,
        value: setting.isEncrypted ? '[ENCRYPTED]' : setting.value,
        category: result.category,
      });
    }
    
    // 🚀 BROADCAST BULK CHANGES
    this.settingsGateway.broadcastSettingsChange(results);
    
    return results;
  }

  async deleteSetting(key: string) {
    const result = await this.systemConfigRepository.delete({ key });
    return { deleted: result.affected > 0 };
  }

  async getEmailSettings() {
    const settings = await this.systemConfigRepository.find({
      where: { category: 'EMAIL' },
    });
    
    return settings.map(s => ({
      key: s.key,
      value: s.isEncrypted ? this.decrypt(s.value) : s.value,
      description: s.description,
    }));
  }

  async getStorageSettings() {
    const settings = await this.systemConfigRepository.find({
      where: { category: 'STORAGE' },
    });
    
    return settings.map(s => ({
      key: s.key,
      value: s.isEncrypted ? this.decrypt(s.value) : s.value,
      description: s.description,
    }));
  }

  async getSecuritySettings() {
    const settings = await this.systemConfigRepository.find({
      where: { category: 'SECURITY' },
    });
    
    return settings.map(s => ({
      key: s.key,
      value: s.isEncrypted ? this.decrypt(s.value) : s.value,
      description: s.description,
    }));
  }

  async getAPISettings() {
    const settings = await this.systemConfigRepository.find({
      where: { category: 'API' },
    });
    
    return settings.map(s => ({
      key: s.key,
      value: s.isEncrypted ? this.decrypt(s.value) : s.value,
      description: s.description,
    }));
  }

  async initializeDefaultSettings() {
    const defaults = [
      // Email Settings
      { key: 'email.smtp.host', value: 'smtp.gmail.com', category: 'EMAIL', description: 'SMTP server host' },
      { key: 'email.smtp.port', value: '587', category: 'EMAIL', description: 'SMTP server port' },
      { key: 'email.smtp.secure', value: 'false', category: 'EMAIL', description: 'Use TLS/SSL' },
      { key: 'email.smtp.user', value: '', category: 'EMAIL', description: 'SMTP username' },
      { key: 'email.smtp.password', value: '', category: 'EMAIL', description: 'SMTP password', isEncrypted: true },
      { key: 'email.from.name', value: 'Platform Admin', category: 'EMAIL', description: 'From name' },
      { key: 'email.from.address', value: 'noreply@platform.com', category: 'EMAIL', description: 'From email address' },
      
      // Storage Settings
      { key: 'storage.type', value: 'local', category: 'STORAGE', description: 'Storage type (local, s3)' },
      { key: 'storage.s3.bucket', value: '', category: 'STORAGE', description: 'S3 bucket name' },
      { key: 'storage.s3.region', value: 'us-east-1', category: 'STORAGE', description: 'S3 region' },
      { key: 'storage.s3.accessKey', value: '', category: 'STORAGE', description: 'S3 access key', isEncrypted: true },
      { key: 'storage.s3.secretKey', value: '', category: 'STORAGE', description: 'S3 secret key', isEncrypted: true },
      { key: 'storage.maxFileSize', value: '10485760', category: 'STORAGE', description: 'Max file size in bytes (10MB)' },
      
      // Security Settings
      { key: 'security.jwt.expiration', value: '24h', category: 'SECURITY', description: 'JWT token expiration' },
      { key: 'security.password.minLength', value: '8', category: 'SECURITY', description: 'Minimum password length' },
      { key: 'security.password.requireSpecialChar', value: 'true', category: 'SECURITY', description: 'Require special characters' },
      { key: 'security.maxLoginAttempts', value: '5', category: 'SECURITY', description: 'Max login attempts before lockout' },
      { key: 'security.lockoutDuration', value: '900', category: 'SECURITY', description: 'Lockout duration in seconds (15 min)' },
      
      // API Settings
      { key: 'api.rateLimit.enabled', value: 'true', category: 'API', description: 'Enable rate limiting' },
      { key: 'api.rateLimit.maxRequests', value: '100', category: 'API', description: 'Max requests per window' },
      { key: 'api.rateLimit.windowMs', value: '900000', category: 'API', description: 'Rate limit window in ms (15 min)' },
      { key: 'api.cors.enabled', value: 'true', category: 'API', description: 'Enable CORS' },
      { key: 'api.cors.origins', value: 'http://localhost:5173', category: 'API', description: 'Allowed CORS origins' },
      
      // System Settings
      { key: 'system.maintenance.enabled', value: 'false', category: 'SYSTEM', description: 'Maintenance mode' },
      { key: 'system.maintenance.message', value: 'System under maintenance', category: 'SYSTEM', description: 'Maintenance message' },
      { key: 'system.backup.enabled', value: 'true', category: 'SYSTEM', description: 'Enable automatic backups' },
      { key: 'system.backup.frequency', value: 'daily', category: 'SYSTEM', description: 'Backup frequency' },
      { key: 'system.backup.retention', value: '30', category: 'SYSTEM', description: 'Backup retention days' },
    ];
    
    for (const setting of defaults) {
      const exists = await this.systemConfigRepository.findOne({
        where: { key: setting.key },
      });
      
      if (!exists) {
        const config = this.systemConfigRepository.create({
          key: setting.key,
          value: setting.isEncrypted ? this.encrypt(setting.value) : setting.value,
          category: setting.category,
          description: setting.description,
          isEncrypted: setting.isEncrypted || false,
        });
        
        await this.systemConfigRepository.save(config);
      }
    }
    
    return { message: 'Default settings initialized' };
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      return text; // Return as-is if decryption fails
    }
  }

  private getCategoryFromKey(key: string): string {
    if (key.startsWith('email.')) return 'EMAIL';
    if (key.startsWith('storage.')) return 'STORAGE';
    if (key.startsWith('security.')) return 'SECURITY';
    if (key.startsWith('api.')) return 'API';
    if (key.startsWith('branding.')) return 'BRANDING';
    return 'SYSTEM';
  }

  private async handleBrandingChange() {
    // Get all branding settings and broadcast as complete branding object
    const brandingSettings = await this.systemConfigRepository.find({
      where: { category: 'BRANDING' }
    });
    
    const brandingData: any = {};
    brandingSettings.forEach(s => {
      const key = s.key.replace('branding.', '').replace(/\./g, '_');
      brandingData[key] = s.isEncrypted ? this.decrypt(s.value) : s.value;
    });
    
    this.settingsGateway.broadcastBrandingChange(brandingData);
  }

  private async handleMaintenanceModeChange(value: string) {
    const enabled = value === 'true';
    const messageSetting = await this.systemConfigRepository.findOne({
      where: { key: 'system.maintenance.message' }
    });
    
    this.settingsGateway.broadcastMaintenanceMode(
      enabled,
      messageSetting?.value
    );
  }

  async testEmailConfiguration(config: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    emailFrom: string;
    testRecipient: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Import nodemailer dynamically
      const nodemailer = require('nodemailer');

      // Create transporter
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
      });

      // Verify connection
      await transporter.verify();

      // Send test email
      await transporter.sendMail({
        from: config.emailFrom,
        to: config.testRecipient,
        subject: 'Test Email from Admin Dashboard',
        text: 'This is a test email to verify your SMTP configuration is working correctly.',
        html: '<p>This is a test email to verify your SMTP configuration is working correctly.</p>',
      });

      return {
        success: true,
        message: `Test email sent successfully to ${config.testRecipient}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Email test failed: ${error.message}`,
      };
    }
  }

  async testStorageConfiguration(config: {
    storageProvider: string;
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      if (config.storageProvider === 'local') {
        // Test local storage
        const fs = require('fs');
        const path = require('path');
        const uploadDir = path.join(process.cwd(), 'uploads');

        // Check if directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Test write permission
        const testFile = path.join(uploadDir, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);

        return {
          success: true,
          message: 'Local storage is configured correctly and writable',
        };
      } else if (config.storageProvider === 's3') {
        // Test S3 storage
        const AWS = require('aws-sdk');

        const s3 = new AWS.S3({
          accessKeyId: config.s3AccessKey,
          secretAccessKey: config.s3SecretKey,
          region: config.s3Region,
        });

        // Test bucket access
        await s3.headBucket({ Bucket: config.s3Bucket }).promise();

        // Test write permission
        const testKey = '.test-write-' + Date.now();
        await s3
          .putObject({
            Bucket: config.s3Bucket,
            Key: testKey,
            Body: 'test',
          })
          .promise();

        // Clean up test file
        await s3
          .deleteObject({
            Bucket: config.s3Bucket,
            Key: testKey,
          })
          .promise();

        return {
          success: true,
          message: `S3 bucket "${config.s3Bucket}" is accessible and writable`,
        };
      } else {
        return {
          success: false,
          message: 'Unknown storage provider',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Storage test failed: ${error.message}`,
      };
    }
  }
}
