import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedPost } from './entities/feed-post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostSave } from './entities/post-save.entity';
import { Reaction } from './entities/reaction.entity';
import { Collection } from './entities/collection.entity';
import { Share } from './entities/share.entity';
import { Hashtag } from './entities/hashtag.entity';
import { Mention } from './entities/mention.entity';
import { PostHashtag } from './entities/post-hashtag.entity';
import { User } from '../auth/entities/user.entity';
import { Connection } from '../matching/entities/connection.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedPost,
      PostLike,
      PostComment,
      PostSave,
      Reaction,
      Collection,
      Share,
      Hashtag,
      Mention,
      PostHashtag,
      User,
      Connection,
      InfluencerProfile,
      CompanyProfile,
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
