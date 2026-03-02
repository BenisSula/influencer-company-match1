import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateInfluencerProfileDto } from './dto/create-influencer-profile.dto';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateInfluencerProfileDto } from './dto/update-influencer-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('influencer')
  async createInfluencerProfile(
    @Request() req: any,
    @Body() dto: CreateInfluencerProfileDto,
  ) {
    return this.profilesService.createInfluencerProfile(req.user.sub, dto);
  }

  @Post('company')
  async createCompanyProfile(
    @Request() req: any,
    @Body() dto: CreateCompanyProfileDto,
  ) {
    return this.profilesService.createCompanyProfile(req.user.sub, dto);
  }

  @Get('influencer/me')
  async getMyInfluencerProfile(@Request() req: any) {
    return this.profilesService.getInfluencerProfile(req.user.sub);
  }

  @Get('company/me')
  async getMyCompanyProfile(@Request() req: any) {
    return this.profilesService.getCompanyProfile(req.user.sub);
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

  @Get(':profileId/user-id')
  async getUserIdFromProfile(@Param('profileId') profileId: string) {
    return this.profilesService.getUserIdFromProfileId(profileId);
  }

  @Get('influencer/:id')
  async getInfluencerById(@Param('id') id: string) {
    return this.profilesService.getInfluencerById(id);
  }

  @Get('company/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.profilesService.getCompanyById(id);
  }

  @Post('influencer/:id/media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @Param('id') profileId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.profilesService.uploadMedia(profileId, file, caption);
  }

  @Delete('influencer/:id/media/:mediaId')
  async deleteMedia(
    @Param('id') profileId: string,
    @Param('mediaId') mediaId: string,
  ) {
    await this.profilesService.deleteMedia(profileId, mediaId);
    return { message: 'Media deleted successfully' };
  }

  @Patch('influencer/:id')
  async updateInfluencerProfile(
    @Param('id') id: string,
    @Body() dto: UpdateInfluencerProfileDto,
  ) {
    return this.profilesService.updateInfluencerProfile(id, dto);
  }

  @Patch('company/:id')
  async updateCompanyProfile(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    return this.profilesService.updateCompanyProfile(id, dto);
  }

  @Post(':profileId/save')
  async saveProfile(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() body: { notes?: string; tags?: string[] },
  ) {
    return this.profilesService.saveProfile(
      req.user.sub,
      profileId,
      body.notes,
      body.tags,
    );
  }

  @Delete(':profileId/save')
  async unsaveProfile(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ) {
    await this.profilesService.unsaveProfile(req.user.sub, profileId);
    return { message: 'Profile unsaved successfully' };
  }

  @Get('saved')
  async getSavedProfiles(@Request() req: any) {
    return this.profilesService.getSavedProfiles(req.user.sub);
  }

  @Get(':profileId/saved-status')
  async getProfileSavedStatus(
    @Request() req: any,
    @Param('profileId') profileId: string,
  ) {
    const saved = await this.profilesService.isProfileSaved(req.user.sub, profileId);
    return { saved };
  }

  // Review Endpoints
  @Post(':profileId/reviews')
  async createReview(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() dto: any,
  ) {
    return this.profilesService.createReview(req.user.sub, profileId, dto);
  }

  @Get(':profileId/reviews')
  async getProfileReviews(
    @Param('profileId') profileId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.profilesService.getProfileReviews(profileId, limitNum);
  }

  @Get(':profileId/ratings')
  async getProfileRatings(@Param('profileId') profileId: string) {
    return this.profilesService.getProfileRatings(profileId);
  }

  @Post('reviews/:reviewId/helpful')
  async markReviewHelpful(@Param('reviewId') reviewId: string) {
    return this.profilesService.markReviewHelpful(reviewId);
  }

  // Admin Review Management Endpoints
  @Get('reviews/all')
  async getAllReviews(@Query('all') all?: string) {
    return this.profilesService.getAllReviews();
  }

  @Post('reviews/:id/feature')
  async toggleFeature(
    @Param('id') id: string,
    @Body('featured') featured: boolean,
  ) {
    return this.profilesService.toggleReviewFeature(id, featured);
  }

  // Public Testimonials Endpoint (No Auth Required)
  @Public()
  @Get('testimonials')
  async getTestimonials(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.profilesService.getTestimonials(limitNum);
  }

  // Public Platform Ratings Endpoint (No Auth Required)
  @Public()
  @Get('ratings')
  async getPlatformRatings() {
    return this.profilesService.getPlatformRatings();
  }
}

