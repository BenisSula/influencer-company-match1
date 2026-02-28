import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ReviewsService } from '../services/reviews.service';

@Controller('admin/reviews')
@UseGuards(AdminAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MODERATOR')
  async getAllReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.reviewsService.getAllReviews(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('stats')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MODERATOR')
  async getReviewStats() {
    return await this.reviewsService.getReviewStats();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MODERATOR')
  async getReview(@Param('id') id: string) {
    return await this.reviewsService.getReview(id);
  }

  @Patch(':id/feature')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MODERATOR')
  async toggleFeatured(
    @Param('id') id: string,
    @Body('featured') featured: boolean,
  ) {
    return await this.reviewsService.toggleFeatured(id, featured);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'MODERATOR')
  async deleteReview(@Param('id') id: string) {
    await this.reviewsService.deleteReview(id);
    return { message: 'Review deleted successfully' };
  }
}
