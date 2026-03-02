import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../dto/create-email-template.dto';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async create(tenantId: string, dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    // Check if slug already exists for this tenant
    const existing = await this.emailTemplateRepository.findOne({
      where: { tenantId, slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Email template with this slug already exists');
    }

    const template = this.emailTemplateRepository.create({
      ...dto,
      tenantId,
    });

    return await this.emailTemplateRepository.save(template);
  }

  async findAll(tenantId: string): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async findBySlug(slug: string, tenantId: string): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findOne({
      where: { slug, tenantId, isActive: true },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async update(id: string, tenantId: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOne(id, tenantId);

    Object.assign(template, dto);

    return await this.emailTemplateRepository.save(template);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const template = await this.findOne(id, tenantId);

    if (template.isDefault) {
      throw new ConflictException('Cannot delete default template');
    }

    await this.emailTemplateRepository.remove(template);
  }

  async renderTemplate(slug: string, tenantId: string, variables: Record<string, any>): Promise<string> {
    const template = await this.findBySlug(slug, tenantId);

    let rendered = template.htmlContent;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    return rendered;
  }

  async createDefaultTemplates(tenantId: string): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Welcome Email',
        slug: 'welcome_email',
        subject: 'Welcome to {{platformName}}!',
        htmlContent: `
          <h1>Welcome {{userName}}!</h1>
          <p>Thank you for joining {{platformName}}.</p>
          <p>We're excited to have you on board.</p>
        `,
        textContent: 'Welcome {{userName}}! Thank you for joining {{platformName}}.',
        variables: ['userName', 'platformName'],
        metadata: {
          category: 'transactional',
          description: 'Sent when a new user registers',
          previewText: 'Welcome to our platform!',
        },
        isDefault: true,
      },
      {
        name: 'Password Reset',
        slug: 'password_reset',
        subject: 'Reset Your Password',
        htmlContent: `
          <h1>Password Reset Request</h1>
          <p>Hi {{userName}},</p>
          <p>Click the link below to reset your password:</p>
          <a href="{{resetLink}}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
        textContent: 'Hi {{userName}}, Click this link to reset your password: {{resetLink}}',
        variables: ['userName', 'resetLink'],
        metadata: {
          category: 'transactional',
          description: 'Sent when user requests password reset',
          previewText: 'Reset your password',
        },
        isDefault: true,
      },
      {
        name: 'New Match Notification',
        slug: 'new_match',
        subject: 'You have a new match!',
        htmlContent: `
          <h1>New Match!</h1>
          <p>Hi {{userName}},</p>
          <p>You have a new match with {{matchName}}.</p>
          <p>Compatibility Score: {{compatibilityScore}}%</p>
          <a href="{{profileLink}}">View Profile</a>
        `,
        textContent: 'Hi {{userName}}, You have a new match with {{matchName}}!',
        variables: ['userName', 'matchName', 'compatibilityScore', 'profileLink'],
        metadata: {
          category: 'notification',
          description: 'Sent when user gets a new match',
          previewText: 'You have a new match!',
        },
        isDefault: true,
      },
    ];

    for (const templateData of defaultTemplates) {
      const existing = await this.emailTemplateRepository.findOne({
        where: { tenantId, slug: templateData.slug },
      });

      if (!existing) {
        const template = this.emailTemplateRepository.create({
          ...templateData,
          tenantId,
        });
        await this.emailTemplateRepository.save(template);
      }
    }
  }
}
