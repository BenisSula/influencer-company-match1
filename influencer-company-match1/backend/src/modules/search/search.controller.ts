import { Controller, Get, Post, Query, Body, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchQueryDto, TrackSearchDto, TrackSearchClickDto } from './dto/search-query.dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  async searchUsers(@Request() req: any, @Query() query: SearchQueryDto) {
    const results = await this.searchService.searchUsers(query.q, req.user.sub, query);
    
    // Track search
    await this.searchService.trackSearch(req.user.sub, query.q, 'user', results.length);
    
    return { results, total: results.length };
  }

  @Get('posts')
  async searchPosts(@Request() req: any, @Query() query: SearchQueryDto) {
    const results = await this.searchService.searchPosts(query.q, req.user.sub, query);
    
    // Track search
    await this.searchService.trackSearch(req.user.sub, query.q, 'post', results.length);
    
    return { results, total: results.length };
  }

  @Get('campaigns')
  async searchCampaigns(@Request() req: any, @Query() query: SearchQueryDto) {
    const results = await this.searchService.searchCampaigns(query.q, req.user.sub, query);
    
    // Track search
    await this.searchService.trackSearch(req.user.sub, query.q, 'campaign', results.length);
    
    return { results, total: results.length };
  }

  @Get('all')
  async searchAll(@Request() req: any, @Query() query: SearchQueryDto) {
    const response = await this.searchService.searchAll(query.q, req.user.sub, query);
    
    // Track search
    await this.searchService.trackSearch(req.user.sub, query.q, 'all', response.total);
    
    return response;
  }

  @Get('trending')
  async getTrending(@Query('limit') limit?: number) {
    return this.searchService.getTrending(limit || 10);
  }

  @Post('track')
  async trackSearch(@Request() req: any, @Body() dto: TrackSearchDto) {
    await this.searchService.trackSearch(req.user.sub, dto.query, dto.resultType, dto.resultCount);
    return { success: true };
  }

  @Post('track-click')
  async trackSearchClick(@Request() req: any, @Body() dto: TrackSearchClickDto) {
    await this.searchService.trackSearchClick(req.user.sub, dto.query, dto.resultId);
    return { success: true };
  }
}
