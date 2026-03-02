import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MatchingService } from '../matching/matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('status/:id')
  async getConnectionStatus(@Request() req: any, @Param('id') otherUserId: string) {
    try {
      const result = await this.matchingService.getConnectionStatus(req.user.sub, otherUserId);
      return result;
    } catch (error) {
      console.error('Error in getConnectionStatus:', error);
      // Return a safe default response instead of throwing
      return { status: 'none', connection: null };
    }
  }

  @Get('user/:userId')
  async getConnectionByUserId(@Request() req: any, @Param('userId') otherUserId: string) {
    try {
      const result = await this.matchingService.getConnectionByUserId(req.user.sub, otherUserId);
      return result;
    } catch (error) {
      console.error('Error in getConnectionByUserId:', error);
      return null;
    }
  }

  @Get()
  async getMyConnections(@Request() req: any) {
    try {
      return await this.matchingService.getMyConnections(req.user.sub);
    } catch (error) {
      console.error('Error in getMyConnections:', error);
      return [];
    }
  }
}
