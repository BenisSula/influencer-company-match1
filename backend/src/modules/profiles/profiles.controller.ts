import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateInfluencerProfileDto } from './dto/create-influencer-profile.dto';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateInfluencerProfileDto } from './dto/update-influencer-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { multerConfig } from '../../common/config/multer.config';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('influencer')
  async createInfluencerProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateInfluencerProfileDto,
  ) {
    return this.profilesService.createInfluencerProfile(user.id, dto);
  }

  @Post('company')
  async createCompanyProfile(
    @CurrentUser() user: User,
    @Body() dto: CreateCompanyProfileDto,
  ) {
    return this.profilesService.createCompanyProfile(user.id, dto);
  }

  @Get('influencer/me')
  async getMyInfluencerProfile(@CurrentUser() user: User) {
    return this.profilesService.getInfluencerProfile(user.id);
  }

  @Get('company/me')
  async getMyCompanyProfile(@CurrentUser() user: User) {
    return this.profilesService.getCompanyProfile(user.id);
  }

  @Get('influencers')
  async getAllInfluencers() {
    return this.profilesService.getAllInfluencers();
  }

  @Get('companies')
  async getAllCompanies() {
    return this.profilesService.getAllCompanies();
  }

  @Get('user/:userId')
  async getProfileByUserId(@Param('userId') userId: string) {
    return this.profilesService.getProfileByUserId(userId);
  }

  @Get('influencer/:id')
  async getInfluencerById(@Param('id') id: string) {
    return this.profilesService.getInfluencerById(id);
  }

  @Get('company/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.profilesService.getCompanyById(id);
  }

  /**
   * Upload media to influencer profile gallery
   * POST /api/profiles/influencer/:id/media
   * Validates: Requirements 1.1.6, 1.1.7, 1.1.8, 1.1.9
   */
  @Post('influencer/:id/media')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadMedia(
    @Param('id') profileId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.profilesService.uploadMedia(profileId, file, caption);
  }

  /**
   * Delete media from influencer profile gallery
   * DELETE /api/profiles/influencer/:id/media/:mediaId
   */
  @Delete('influencer/:id/media/:mediaId')
  async deleteMedia(
    @Param('id') profileId: string,
    @Param('mediaId') mediaId: string,
  ) {
    await this.profilesService.deleteMedia(profileId, mediaId);
    return { message: 'Media deleted successfully' };
  }

  /**
   * Update influencer profile
   * PATCH /api/profiles/influencer/:id
   * Validates: Requirements 1.1.1-1.1.9
   */
  @Patch('influencer/:id')
  async updateInfluencerProfile(
    @Param('id') id: string,
    @Body() dto: UpdateInfluencerProfileDto,
  ) {
    return this.profilesService.updateInfluencerProfile(id, dto);
  }

  /**
   * Update company profile
   * PATCH /api/profiles/company/:id
   * Validates: Requirements 1.2.1-1.2.7
   */
  @Patch('company/:id')
  async updateCompanyProfile(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.profilesService.updateCompanyProfile(id, dto);
  }
}
