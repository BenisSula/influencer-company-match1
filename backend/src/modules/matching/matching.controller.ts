import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { MatchingService, PaginatedMatchResponse } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { MatchFiltersDto } from './dto/match-filters.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  async getMatches(@CurrentUser() user: User, @Query() filters: MatchFiltersDto): Promise<PaginatedMatchResponse> {
    return this.matchingService.getMatchesForUser(user, filters);
  }
}
