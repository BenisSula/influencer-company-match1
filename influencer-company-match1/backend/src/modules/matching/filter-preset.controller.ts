import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FilterPresetService } from './filter-preset.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';

@Controller('filter-presets')
@UseGuards(JwtAuthGuard)
export class FilterPresetController {
  constructor(private readonly filterPresetService: FilterPresetService) {}

  @Post()
  async createPreset(
    @CurrentUser() user: User,
    @Body() dto: CreateFilterPresetDto,
  ) {
    return this.filterPresetService.createPreset(user.id, dto);
  }

  @Get()
  async getPresets(@CurrentUser() user: User) {
    return this.filterPresetService.getPresets(user.id);
  }

  @Get(':id')
  async getPresetById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.filterPresetService.getPresetById(user.id, id);
  }

  @Put(':id')
  async updatePreset(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateFilterPresetDto,
  ) {
    return this.filterPresetService.updatePreset(user.id, id, dto);
  }

  @Delete(':id')
  async deletePreset(@CurrentUser() user: User, @Param('id') id: string) {
    await this.filterPresetService.deletePreset(user.id, id);
    return { message: 'Filter preset deleted successfully' };
  }
}
