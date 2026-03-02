import { Module } from '@nestjs/common';
import { ConnectionsController } from './connections.controller';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [MatchingModule],
  controllers: [ConnectionsController],
})
export class ConnectionsModule {}
