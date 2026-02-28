import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExperimentService } from './experiment.service';
import { RolloutService } from './rollout.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { CreateRolloutDto } from './dto/create-rollout.dto';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('experiments')
@UseGuards(JwtAuthGuard)
export class ExperimentsController {
  constructor(
    private readonly experimentService: ExperimentService,
    private readonly rolloutService: RolloutService,
  ) {}

  // Experiment endpoints
  @Post()
  async createExperiment(
    @Request() req: any,
    @Body() dto: CreateExperimentDto,
  ) {
    return this.experimentService.createExperiment(dto, req.user.sub);
  }

  @Get()
  async getAllExperiments() {
    return this.experimentService.getAllExperiments();
  }

  @Get(':id')
  async getExperiment(@Param('id') id: string) {
    return this.experimentService.getExperiment(id);
  }

  @Put(':id/start')
  async startExperiment(@Param('id') id: string) {
    return this.experimentService.startExperiment(id);
  }

  @Put(':id/pause')
  async pauseExperiment(@Param('id') id: string) {
    return this.experimentService.pauseExperiment(id);
  }

  @Put(':id/complete')
  async completeExperiment(@Param('id') id: string) {
    return this.experimentService.completeExperiment(id);
  }

  @Delete(':id')
  async deleteExperiment(@Param('id') id: string) {
    await this.experimentService.deleteExperiment(id);
    return { message: 'Experiment deleted successfully' };
  }

  @Get(':id/variant')
  async getVariant(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const variant = await this.experimentService.assignVariant(id, req.user.sub);
    return { variant };
  }

  @Post(':id/track')
  async trackEvent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: TrackEventDto,
  ) {
    await this.experimentService.trackEvent(
      id,
      req.user.sub,
      dto.eventType,
      dto.eventData,
    );
    return { message: 'Event tracked successfully' };
  }

  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.experimentService.getResults(id);
  }

  // Rollout endpoints
  @Post('rollouts')
  async createRollout(@Body() dto: CreateRolloutDto) {
    return this.rolloutService.createRollout(dto);
  }

  @Get('rollouts')
  async getAllRollouts() {
    return this.rolloutService.getAllRollouts();
  }

  @Get('rollouts/:id')
  async getRollout(@Param('id') id: string) {
    return this.rolloutService.getRollout(id);
  }

  @Put('rollouts/:id/start')
  async startRollout(@Param('id') id: string) {
    return this.rolloutService.startRollout(id);
  }

  @Put('rollouts/:id/update')
  async updateRollout(@Param('id') id: string) {
    await this.rolloutService.updateRolloutPercentage(id);
    return { message: 'Rollout updated successfully' };
  }

  @Put('rollouts/:id/rollback')
  async rollbackRollout(@Param('id') id: string) {
    await this.rolloutService.rollbackRollout(id);
    return { message: 'Rollout rolled back successfully' };
  }

  @Delete('rollouts/:id')
  async deleteRollout(@Param('id') id: string) {
    await this.rolloutService.deleteRollout(id);
    return { message: 'Rollout deleted successfully' };
  }

  @Get('rollouts/check/:modelVersion')
  async checkRollout(
    @Request() req: any,
    @Param('modelVersion') modelVersion: string,
  ) {
    const rollout = await this.rolloutService.getActiveRollout(modelVersion);
    
    if (!rollout) {
      return { shouldUseNewModel: false };
    }

    const shouldUse = await this.rolloutService.shouldUseNewModel(
      req.user.sub,
      rollout.id,
    );

    return {
      shouldUseNewModel: shouldUse,
      rollout: {
        id: rollout.id,
        name: rollout.name,
        currentPercentage: rollout.currentPercentage,
      },
    };
  }
}
