import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experiment } from './entities/experiment.entity';
import { ExperimentAssignment } from './entities/experiment-assignment.entity';
import { ExperimentEvent } from './entities/experiment-event.entity';
import { Rollout } from './entities/rollout.entity';
import { ExperimentService } from './experiment.service';
import { RolloutService } from './rollout.service';
import { ExperimentsController } from './experiments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Experiment,
      ExperimentAssignment,
      ExperimentEvent,
      Rollout,
    ]),
  ],
  controllers: [ExperimentsController],
  providers: [ExperimentService, RolloutService],
  exports: [ExperimentService, RolloutService],
})
export class ExperimentsModule {}
