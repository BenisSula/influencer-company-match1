import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { FeedPost } from './entities/feed-post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostSave } from './entities/post-save.entity';
import { Reaction, ReactionType, TargetType } from './entities/reaction.entity';
import { Collection } from './entities/collection.entity';
import { Share, ShareType, ItemType } from './entities/share.entity';
import { Hashtag } from './entities/hashtag.entity';
import { Mention } from './entities/mention.entity';
import { PostHashtag } from './entities/post-hashtag.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { Connection, ConnectionStatus } from '../matching/entities/connection.entity';
import { InfluencerProfile } from '../auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../auth/entities/company-profile.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPost)
    private readonly feedPostRepo: Repository<FeedPost>,
    @InjectRepository(PostLike)
    private readonly postLikeRepo: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly postCommentRepo: Repository<PostComment>,
    @InjectRepository(PostSave)
    private readonly postSaveRepo: Repository<PostSave>,
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(Share)
    private readonly shareRepo: Repository<Share>,
    @InjectRepository(Hashtag)
    private readonly hashtagRepo: Repository<Hashtag>,
    @InjectRepository(Mention)
    private readonly mentionRepo: Repository<Mention>,
    @InjectRepository(PostHashtag)
    private readonly postHashtagRepo: Repository<PostHashtag>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Connection)
    private readonly connectionRepo: Repository<Connection>,
    @InjectRepository(InfluencerProfile)
    private readonly influencerProfileRepo: Repository<InfluencerProfile>,
    @InjectRepository(CompanyProfile)
    private readonly companyProfileRepo: Repository<CompanyProfile>,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<FeedPost> {
    const post = this.feedPostRepo.create({
      authorId: userId,
      ...createPostDto,
    });

    const savedPost = await this.feedPostRepo.save(post);

    // Process hashtags and mentions asynchronously
    await Promise.all([
      this.processHashtags(savedPost.id, createPostDto.content),
      this.processMentions(savedPost.id, createPostDto.content, userId),
    ]);

    return savedPost;
  }

  async getFeed(query: FeedQueryDto) {
    const { page = 1, limit = 20, postType } = query;
    const skip = (page - 1) * limit;

    // Query posts ordered by creation date DESC (newest posts first)
    // This ensures newly created posts appear at the TOP of the feed
    const queryBuilder = this.feedPostRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC') // NEWEST FIRST
      .skip(skip)
      .take(limit);

    if (postType) {
      queryBuilder.andWhere('post.postType = :postType', { postType });
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get personalized feed with intelligent prioritization
   * Priority: Connections > High Matches > Same Niche > Others
   */
  async getPersonalizedFeed(userId: string, query: FeedQueryDto) {
    const { page = 1, limit = 20, postType } = query;
    const skip = (page - 1) * limit;

    try {
      // Step 1: Get user's connections
      const connections = await this.connectionRepo.find({
        where: [
          { requesterId: userId, status: ConnectionStatus.ACCEPTED },
          { recipientId: userId, status: ConnectionStatus.ACCEPTED },
        ],
      });

      const connectionIds = connections.map((c) =>
        c.requesterId === userId ? c.recipientId : c.requesterId,
      );

      // Step 2: Get user's niche/industry for content relevance
      const currentUser = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!currentUser) {
        // Fallback to regular feed if user not found
        return this.getFeed(query);
      }

      let userNiche = '';
      if (currentUser.role === UserRole.INFLUENCER) {
        const profile = await this.influencerProfileRepo.findOne({
          where: { userId },
        });
        userNiche = profile?.niche || '';
      } else if (currentUser.role === UserRole.COMPANY) {
        const profile = await this.companyProfileRepo.findOne({
          where: { userId },
        });
        userNiche = profile?.industry || '';
      }

      // Step 3: Build query with priority scoring
      // We'll fetch posts and score them in application layer for simplicity
      const queryBuilder = this.feedPostRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.author_id != :userId', { userId });

      if (postType) {
        queryBuilder.andWhere('post.postType = :postType', { postType });
      }

      // Get more posts than needed for scoring
      const posts = await queryBuilder
        .orderBy('post.createdAt', 'DESC')
        .take(limit * 3) // Get 3x to ensure enough after filtering
        .getMany();

      // Step 4: Score and sort posts
      const scoredPosts = await Promise.all(
        posts.map(async (post) => {
          let priorityScore = 25; // Base score for all posts

          // Connection bonus: +75 points
          if (connectionIds.includes(post.authorId)) {
            priorityScore += 75;
          }

          // Same niche bonus: +25 points
          if (userNiche) {
            let postNiche = '';
            
            // Load author's profile to get niche/industry
            if (post.author.role === UserRole.INFLUENCER) {
              const profile = await this.influencerProfileRepo.findOne({
                where: { userId: post.authorId },
              });
              postNiche = profile?.niche || '';
            } else if (post.author.role === UserRole.COMPANY) {
              const profile = await this.companyProfileRepo.findOne({
                where: { userId: post.authorId },
              });
              postNiche = profile?.industry || '';
            }

            if (
              postNiche &&
              (postNiche.toLowerCase().includes(userNiche.toLowerCase()) ||
                userNiche.toLowerCase().includes(postNiche.toLowerCase()))
            ) {
              priorityScore += 25;
            }
          }

          // Engagement boost
          priorityScore += post.likeCount * 0.5;
          priorityScore += post.commentCount * 1.0;

          // Recency decay (subtract 0.1 per hour old)
          const hoursOld =
            (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
          priorityScore -= hoursOld * 0.1;

          return {
            post,
            priorityScore,
          };
        }),
      );

      // Sort by priority score
      scoredPosts.sort((a, b) => b.priorityScore - a.priorityScore);

      // Paginate
      const paginatedPosts = scoredPosts
        .slice(skip, skip + limit)
        .map((sp) => sp.post);

      // Get total count for pagination
      const totalQuery = this.feedPostRepo
        .createQueryBuilder('post')
        .where('post.author_id != :userId', { userId });

      if (postType) {
        totalQuery.andWhere('post.postType = :postType', { postType });
      }

      const total = await totalQuery.getCount();

      return {
        data: paginatedPosts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('[FeedService] Error in getPersonalizedFeed:', error);
      // Fallback to regular feed on error
      return this.getFeed(query);
    }
  }

  async getPostById(postId: string): Promise<FeedPost> {
    const post = await this.feedPostRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.getPostById(postId);

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.feedPostRepo.remove(post);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const post = await this.getPostById(postId);

    // Check if already liked
    const existingLike = await this.postLikeRepo.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      return; // Already liked, idempotent operation
    }

    // Create like
    const like = this.postLikeRepo.create({ postId, userId });
    await this.postLikeRepo.save(like);

    // Increment like count
    await this.feedPostRepo.increment({ id: postId }, 'likeCount', 1);
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const like = await this.postLikeRepo.findOne({
      where: { postId, userId },
    });

    if (!like) {
      return; // Not liked, idempotent operation
    }

    await this.postLikeRepo.remove(like);

    // Decrement like count
    await this.feedPostRepo.decrement({ id: postId }, 'likeCount', 1);
  }

  async hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
    const like = await this.postLikeRepo.findOne({
      where: { postId, userId },
    });

    return !!like;
  }

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<PostComment> {
    const post = await this.getPostById(postId);

    const comment = this.postCommentRepo.create({
      postId,
      authorId: userId,
      ...createCommentDto,
    });

    const savedComment = await this.postCommentRepo.save(comment);

    // Increment comment count
    await this.feedPostRepo.increment({ id: postId }, 'commentCount', 1);

    // Reload comment with author relation
    const commentWithAuthor = await this.postCommentRepo.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });

    return commentWithAuthor!;
  }

  async getComments(postId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.postCommentRepo.findAndCount({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.postCommentRepo.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.postCommentRepo.remove(comment);

    // Decrement comment count
    await this.feedPostRepo.decrement({ id: comment.postId }, 'commentCount', 1);
  }

  // Save/Unsave Post Methods
  async savePost(postId: string, userId: string, collectionId?: string): Promise<void> {
    await this.getPostById(postId);

    // Check if already saved
    const existingSave = await this.postSaveRepo.findOne({
      where: { postId, userId },
    });

    if (existingSave) {
      // Update collection if provided
      if (collectionId !== undefined) {
        existingSave.collectionId = collectionId;
        await this.postSaveRepo.save(existingSave);
      }
      return; // Already saved
    }

    // Create save
    const save = this.postSaveRepo.create({ postId, userId, collectionId });
    await this.postSaveRepo.save(save);
  }

  async unsavePost(postId: string, userId: string): Promise<void> {
    const save = await this.postSaveRepo.findOne({
      where: { postId, userId },
    });

    if (!save) {
      return; // Not saved, idempotent operation
    }

    await this.postSaveRepo.remove(save);
  }

  async hasUserSavedPost(postId: string, userId: string): Promise<boolean> {
    const save = await this.postSaveRepo.findOne({
      where: { postId, userId },
    });

    return !!save;
  }

  async getSavedPosts(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [saves, total] = await this.postSaveRepo.findAndCount({
      where: { userId },
      relations: ['post', 'post.author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const posts = saves.map(save => save.post);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get post interaction status for a user
  async getPostInteractionStatus(postId: string, userId: string) {
    try {
      const [liked, saved] = await Promise.all([
        this.hasUserLikedPost(postId, userId),
        this.hasUserSavedPost(postId, userId),
      ]);

      return { liked, saved };
    } catch (error) {
      console.error('Error fetching post interaction status:', error);
      return { liked: false, saved: false };
    }
  }

  // ==================== REACTION METHODS ====================

  async reactToPost(postId: string, userId: string, reactionType: ReactionType): Promise<void> {
    // Check if post exists
    await this.getPostById(postId);

    // Check if user already reacted
    const existingReaction = await this.reactionRepo.findOne({
      where: {
        userId,
        targetType: TargetType.POST,
        targetId: postId,
      },
    });

    if (existingReaction) {
      // Update reaction type if different
      if (existingReaction.reactionType !== reactionType) {
        existingReaction.reactionType = reactionType;
        await this.reactionRepo.save(existingReaction);
      }
    } else {
      // Create new reaction
      const reaction = this.reactionRepo.create({
        userId,
        targetType: TargetType.POST,
        targetId: postId,
        reactionType,
      });
      await this.reactionRepo.save(reaction);

      // Increment like count (for backward compatibility)
      await this.feedPostRepo.increment({ id: postId }, 'likeCount', 1);
    }
  }

  async removeReaction(postId: string, userId: string): Promise<void> {
    const reaction = await this.reactionRepo.findOne({
      where: {
        userId,
        targetType: TargetType.POST,
        targetId: postId,
      },
    });

    if (reaction) {
      await this.reactionRepo.remove(reaction);

      // Decrement like count
      await this.feedPostRepo.decrement({ id: postId }, 'likeCount', 1);
    }
  }

  async getPostReactions(postId: string) {
    try {
      const reactions = await this.reactionRepo.find({
        where: {
          targetType: TargetType.POST,
          targetId: postId,
        },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });

      // Count reactions by type
      const byType: Record<ReactionType, number> = {
        [ReactionType.LIKE]: 0,
        [ReactionType.LOVE]: 0,
        [ReactionType.WOW]: 0,
        [ReactionType.HAHA]: 0,
        [ReactionType.SAD]: 0,
        [ReactionType.ANGRY]: 0,
      };

      reactions.forEach((reaction) => {
        byType[reaction.reactionType]++;
      });

      // Get recent reactors (last 10)
      const recentReactors = reactions.slice(0, 10).map((r) => ({
        userId: r.userId,
        userName: r.user?.email?.split('@')[0] || 'Unknown',
        avatarUrl: r.user?.avatarUrl || null,
        reactionType: r.reactionType,
      }));

      return {
        total: reactions.length,
        byType,
        recentReactors,
      };
    } catch (error) {
      console.error('Error fetching post reactions:', error);
      // Return empty reactions if table doesn't exist
      return {
        total: 0,
        byType: {
          [ReactionType.LIKE]: 0,
          [ReactionType.LOVE]: 0,
          [ReactionType.WOW]: 0,
          [ReactionType.HAHA]: 0,
          [ReactionType.SAD]: 0,
          [ReactionType.ANGRY]: 0,
        },
        recentReactors: [],
      };
    }
  }

  async getUserReaction(postId: string, userId: string): Promise<ReactionType | null> {
    try {
      const reaction = await this.reactionRepo.findOne({
        where: {
          userId,
          targetType: TargetType.POST,
          targetId: postId,
        },
      });

      return reaction ? reaction.reactionType : null;
    } catch (error) {
      console.error('Error fetching user reaction:', error);
      return null;
    }
  }

  // ==================== COLLECTION METHODS ====================

  async createCollection(userId: string, name: string, description?: string): Promise<Collection> {
    const collection = this.collectionRepo.create({
      userId,
      name,
      description,
    });

    return this.collectionRepo.save(collection);
  }

  async getCollections(userId: string): Promise<Collection[]> {
    const collections = await this.collectionRepo.find({
      where: { userId },
      relations: ['savedItems'],
      order: { createdAt: 'DESC' },
    });

    return collections;
  }

  async getCollectionById(id: string, userId: string): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id, userId },
      relations: ['savedItems', 'savedItems.post', 'savedItems.post.author'],
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async updateCollection(
    id: string,
    userId: string,
    name?: string,
    description?: string,
  ): Promise<Collection> {
    const collection = await this.collectionRepo.findOne({
      where: { id, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;

    return this.collectionRepo.save(collection);
  }

  async deleteCollection(id: string, userId: string): Promise<void> {
    const collection = await this.collectionRepo.findOne({
      where: { id, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    await this.collectionRepo.remove(collection);
  }

  async getSavedPostsByCollection(userId: string, collectionId?: string) {
    const query = this.postSaveRepo
      .createQueryBuilder('save')
      .leftJoinAndSelect('save.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .where('save.user_id = :userId', { userId });

    if (collectionId) {
      query.andWhere('save.collection_id = :collectionId', { collectionId });
    } else {
      query.andWhere('save.collection_id IS NULL');
    }

    query.orderBy('save.created_at', 'DESC');

    const saves = await query.getMany();
    return saves.map((save) => save.post);
  }

  // ==================== SHARE METHODS ====================

  /**
   * Track a share action
   */
  async trackShare(
    itemId: string,
    userId: string,
    itemType: ItemType,
    shareType: ShareType,
  ): Promise<void> {
    const share = this.shareRepo.create({
      userId,
      itemType,
      itemId,
      shareType,
    });

    await this.shareRepo.save(share);
  }

  /**
   * Get share count for an item
   */
  async getShareCount(itemId: string, itemType: ItemType): Promise<number> {
    try {
      return await this.shareRepo.count({
        where: {
          itemId,
          itemType,
        },
      });
    } catch (error) {
      console.error('Error fetching share count:', error);
      return 0;
    }
  }

  /**
   * Get share breakdown by type
   */
  async getShareBreakdown(itemId: string, itemType: ItemType): Promise<Record<ShareType, number>> {
    const shares = await this.shareRepo.find({
      where: {
        itemId,
        itemType,
      },
    });

    const breakdown: Record<ShareType, number> = {
      [ShareType.FEED]: 0,
      [ShareType.MESSAGE]: 0,
      [ShareType.LINK]: 0,
      [ShareType.TWITTER]: 0,
      [ShareType.LINKEDIN]: 0,
      [ShareType.FACEBOOK]: 0,
    };

    shares.forEach((share) => {
      breakdown[share.shareType]++;
    });

    return breakdown;
  }

  /**
   * Get recent sharers
   */
  async getRecentSharers(itemId: string, itemType: ItemType, limit: number = 10): Promise<any[]> {
    const shares = await this.shareRepo.find({
      where: {
        itemId,
        itemType,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return shares.map((share) => ({
      userId: share.userId,
      userName: share.user?.email?.split('@')[0] || 'Unknown',
      avatarUrl: share.user?.avatarUrl || null,
      shareType: share.shareType,
      sharedAt: share.createdAt,
    }));
  }

  // ==================== HASHTAG METHODS ====================

  async processHashtags(postId: string, content: string): Promise<void> {
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push({
        name: match[1],
        normalizedName: match[1].toLowerCase(),
        positionStart: match.index,
        positionEnd: match.index + match[0].length,
      });
    }

    for (const hashtagData of hashtags) {
      // Find or create hashtag
      let hashtag = await this.hashtagRepo.findOne({
        where: { normalizedName: hashtagData.normalizedName },
      });

      if (!hashtag) {
        hashtag = this.hashtagRepo.create({
          name: hashtagData.name,
          normalizedName: hashtagData.normalizedName,
          usageCount: 1,
        });
        await this.hashtagRepo.save(hashtag);
      } else {
        // Increment usage count
        hashtag.usageCount += 1;
        await this.hashtagRepo.save(hashtag);
      }

      // Create post-hashtag relationship
      const postHashtag = this.postHashtagRepo.create({
        postId,
        hashtagId: hashtag.id,
        positionStart: hashtagData.positionStart,
        positionEnd: hashtagData.positionEnd,
      });
      await this.postHashtagRepo.save(postHashtag);
    }
  }

  async getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagRepo.find({
      order: { usageCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async searchHashtags(query: string, limit: number = 10): Promise<Hashtag[]> {
    return this.hashtagRepo.find({
      where: {
        normalizedName: Like(`%${query.toLowerCase()}%`),
      },
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }

  async getPostsByHashtag(hashtagName: string, page: number = 1, limit: number = 20) {
    const hashtag = await this.hashtagRepo.findOne({
      where: { normalizedName: hashtagName.toLowerCase() },
    });

    if (!hashtag) {
      return { posts: [], hashtag: null };
    }

    const skip = (page - 1) * limit;
    const postHashtags = await this.postHashtagRepo.find({
      where: { hashtagId: hashtag.id },
      relations: ['post', 'post.author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      posts: postHashtags.map((ph) => ph.post),
      hashtag,
    };
  }

  // ==================== MENTION METHODS ====================

  async processMentions(postId: string, content: string, mentionerUserId: string): Promise<void> {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        username: match[1],
        positionStart: match.index,
        positionEnd: match.index + match[0].length,
      });
    }

    for (const mentionData of mentions) {
      // Find user by email prefix (username)
      const user = await this.userRepo
        .createQueryBuilder('user')
        .where('LOWER(user.email) LIKE :email', { email: `${mentionData.username.toLowerCase()}%` })
        .getOne();

      if (user) {
        const mention = this.mentionRepo.create({
          postId,
          mentionedUserId: user.id,
          mentionerUserId,
          positionStart: mentionData.positionStart,
          positionEnd: mentionData.positionEnd,
        });
        await this.mentionRepo.save(mention);

        // TODO: Create notification for mentioned user
      }
    }
  }

  async searchUsersForMention(query: string, limit: number = 10): Promise<any[]> {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('LOWER(user.email) LIKE :query', { query: `%${query.toLowerCase()}%` })
      .take(limit)
      .getMany();

    return users.map((user) => ({
      id: user.id,
      username: user.email.split('@')[0],
      email: user.email,
      role: user.role,
    }));
  }

  async getUserMentions(userId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    const skip = (page - 1) * limit;
    const mentions = await this.mentionRepo.find({
      where: { mentionedUserId: userId },
      relations: ['post', 'post.author', 'mentionerUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return mentions.map((mention) => ({
      id: mention.id,
      post: mention.post,
      mentionerUser: {
        id: mention.mentionerUser.id,
        username: mention.mentionerUser.email.split('@')[0],
        email: mention.mentionerUser.email,
      },
      createdAt: mention.createdAt,
    }));
  }
}
