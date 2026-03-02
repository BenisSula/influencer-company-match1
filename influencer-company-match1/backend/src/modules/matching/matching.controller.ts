import { Controller, Get, Post, Delete, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchHistoryService } from './match-history.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchHistoryService: MatchHistoryService,
  ) {}

  @Get('matches')
  async getMatches(@Request() req: any) {
    return this.matchingService.getMatches(req.user.sub);
  }

  @Get('matches/enhanced')
  async getMatchesWithAnalytics(@Request() req: any) {
    return this.matchingService.getMatchesWithAnalytics(req.user.sub);
  }

  @Get('matches/:id')
  async getMatch(@Request() req: any, @Param('id') matchId: string) {
    return this.matchingService.getMatch(req.user.sub, matchId);
  }

  @Post('connections')
  async createConnection(@Request() req: any, @Body() createConnectionDto: CreateConnectionDto) {
    return this.matchingService.createConnection(req.user.sub, createConnectionDto);
  }

  @Delete('connections/:id')
  async deleteConnection(@Request() req: any, @Param('id') connectionId: string) {
    return this.matchingService.deleteConnection(req.user.sub, connectionId);
  }

  @Get('connections/status/:id')
  async getConnectionStatus(@Request() req: any, @Param('id') otherUserId: string) {
    try {
      return await this.matchingService.getConnectionStatus(req.user.sub, otherUserId);
    } catch (error) {
      console.error('Error in getConnectionStatus controller:', error);
      // Return a safe default response instead of 500 error
      return { status: 'none', connection: null };
    }
  }

  @Get('connections/user/:userId')
  async getConnectionByUserId(@Request() req: any, @Param('userId') otherUserId: string) {
    try {
      return await this.matchingService.getConnectionByUserId(req.user.sub, otherUserId);
    } catch (error) {
      console.error('Error in getConnectionByUserId controller:', error);
      return null;
    }
  }

  @Get('connections')
  async getMyConnections(@Request() req: any) {
    return this.matchingService.getMyConnections(req.user.sub);
  }

  @Get('users/search')
  async searchUsers(@Request() req: any, @Query('q') query: string) {
    return this.matchingService.searchUsers(req.user.sub, query);
  }

  // Collaboration Request Endpoints
  @Post('collaboration-requests')
  createCollaborationRequest(
    @Request() req: any,
    @Body() dto: any,
  ) {
    return this.matchingService.createCollaborationRequest(req.user.sub, dto);
  }

  @Get('collaboration-requests/received')
  getReceivedCollaborationRequests(@Request() req: any) {
    return this.matchingService.getReceivedCollaborationRequests(req.user.sub);
  }

  @Get('collaboration-requests/sent')
  getSentCollaborationRequests(@Request() req: any) {
    return this.matchingService.getSentCollaborationRequests(req.user.sub);
  }

  @Put('collaboration-requests/:id')
  updateCollaborationRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.matchingService.updateCollaborationRequest(req.user.sub, id, dto);
  }

  @Put('collaboration-requests/:id/accept')
  async acceptCollaborationRequest(
    @Request() req: any,
    @Param('id') connectionId: string
  ) {
    return this.matchingService.acceptCollaborationRequest(req.user.sub, connectionId);
  }

  @Put('collaboration-requests/:id/reject')
  async rejectCollaborationRequest(
    @Request() req: any,
    @Param('id') connectionId: string
  ) {
    return this.matchingService.rejectCollaborationRequest(req.user.sub, connectionId);
  }

  // Match History Endpoints
  @Get('match-history')
  async getMatchHistory(
    @Request() req: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minScore') minScore?: string,
    @Query('maxScore') maxScore?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (minScore) filters.minScore = parseFloat(minScore);
    if (maxScore) filters.maxScore = parseFloat(maxScore);
    if (limit) filters.limit = parseInt(limit, 10);

    return this.matchHistoryService.getHistory(req.user.sub, filters);
  }

  @Get('match-history/paginated')
  async getMatchHistoryPaginated(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minScore') minScore?: string,
    @Query('maxScore') maxScore?: string,
  ) {
    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (minScore) filters.minScore = parseFloat(minScore);
    if (maxScore) filters.maxScore = parseFloat(maxScore);

    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    return this.matchHistoryService.getHistoryPaginated(req.user.sub, filters, pagination);
  }

  @Get('match-history/analytics')
  async getMatchAnalytics(
    @Request() req: any,
    @Query('timeRange') timeRange?: 'week' | 'month' | 'all',
  ) {
    return this.matchHistoryService.getAnalytics(req.user.sub, timeRange || 'month');
  }

  @Get('match-history/trends')
  async getScoreTrends(
    @Request() req: any,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.matchHistoryService.getScoreTrends(req.user.sub, daysNum);
  }
}
