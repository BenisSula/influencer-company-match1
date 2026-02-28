import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ShareType, ItemType } from './entities/share.entity';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post('posts')
  async createPost(
    @CurrentUser() user: any,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.feedService.createPost(user.sub, createPostDto);
  }

  @Get('posts')
  async getFeed(@Query() query: FeedQueryDto) {
    return this.feedService.getFeed(query);
  }

  @Get('personalized')
  async getPersonalizedFeed(
    @CurrentUser() user: any,
    @Query() query: FeedQueryDto,
  ) {
    return this.feedService.getPersonalizedFeed(user.sub, query);
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.feedService.getPostById(id);
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.deletePost(id, user.sub);
    return { message: 'Post deleted successfully' };
  }

  @Post('posts/:id/like')
  async likePost(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.likePost(id, user.sub);
    return { message: 'Post liked successfully' };
  }

  @Delete('posts/:id/like')
  async unlikePost(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.unlikePost(id, user.sub);
    return { message: 'Post unliked successfully' };
  }

  @Get('posts/:id/liked')
  async hasLiked(@Param('id') id: string, @CurrentUser() user: any) {
    const liked = await this.feedService.hasUserLikedPost(id, user.sub);
    return { liked };
  }

  @Post('posts/:id/comments')
  async createComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.feedService.createComment(id, user.sub, createCommentDto);
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feedService.getComments(id, page, limit);
  }

  @Delete('comments/:id')
  async deleteComment(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.deleteComment(id, user.sub);
    return { message: 'Comment deleted successfully' };
  }

  // Save/Unsave endpoints
  @Post('posts/:id/save')
  async savePost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body?: { collectionId?: string },
  ) {
    await this.feedService.savePost(id, user.sub, body?.collectionId);
    return { message: 'Post saved successfully' };
  }

  @Delete('posts/:id/save')
  async unsavePost(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.unsavePost(id, user.sub);
    return { message: 'Post unsaved successfully' };
  }

  @Get('posts/:id/saved')
  async hasSaved(@Param('id') id: string, @CurrentUser() user: any) {
    const saved = await this.feedService.hasUserSavedPost(id, user.sub);
    return { saved };
  }

  @Get('saved')
  async getSavedPosts(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feedService.getSavedPosts(user.sub, page, limit);
  }

  @Get('posts/:id/interaction-status')
  async getInteractionStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feedService.getPostInteractionStatus(id, user.sub);
  }

  // ==================== REACTION ENDPOINTS ====================

  @Post('posts/:id/react')
  async reactToPost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reactionType: string },
  ) {
    await this.feedService.reactToPost(id, user.sub, body.reactionType as any);
    return { message: 'Reaction added successfully' };
  }

  @Delete('posts/:id/react')
  async removeReaction(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.removeReaction(id, user.sub);
    return { message: 'Reaction removed successfully' };
  }

  @Get('posts/:id/reactions')
  async getPostReactions(@Param('id') id: string, @CurrentUser() user: any) {
    const reactions = await this.feedService.getPostReactions(id);
    const userReaction = await this.feedService.getUserReaction(id, user.sub);
    return { ...reactions, userReaction };
  }

  // ==================== COLLECTION ENDPOINTS ====================

  @Post('collections')
  async createCollection(
    @CurrentUser() user: any,
    @Body() body: { name: string; description?: string },
  ) {
    return this.feedService.createCollection(user.sub, body.name, body.description);
  }

  @Get('collections')
  async getCollections(@CurrentUser() user: any) {
    return this.feedService.getCollections(user.sub);
  }

  @Get('collections/:id')
  async getCollection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.feedService.getCollectionById(id, user.sub);
  }

  @Put('collections/:id')
  async updateCollection(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.feedService.updateCollection(id, user.sub, body.name, body.description);
  }

  @Delete('collections/:id')
  async deleteCollection(@Param('id') id: string, @CurrentUser() user: any) {
    await this.feedService.deleteCollection(id, user.sub);
    return { message: 'Collection deleted successfully' };
  }

  @Get('saved/by-collection')
  async getSavedPostsByCollection(
    @CurrentUser() user: any,
    @Query('collectionId') collectionId?: string,
  ) {
    return this.feedService.getSavedPostsByCollection(user.sub, collectionId);
  }

  // ==================== SHARE ENDPOINTS ====================

  @Post('posts/:id/share')
  async sharePost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { shareType: ShareType },
  ) {
    await this.feedService.trackShare(id, user.sub, ItemType.POST, body.shareType);
    return { message: 'Share tracked successfully' };
  }

  @Get('posts/:id/share-count')
  async getShareCount(@Param('id') id: string) {
    const count = await this.feedService.getShareCount(id, ItemType.POST);
    return { count };
  }

  @Get('posts/:id/share-details')
  async getShareDetails(@Param('id') id: string) {
    const [count, breakdown, recentSharers] = await Promise.all([
      this.feedService.getShareCount(id, ItemType.POST),
      this.feedService.getShareBreakdown(id, ItemType.POST),
      this.feedService.getRecentSharers(id, ItemType.POST),
    ]);

    return {
      count,
      breakdown,
      recentSharers,
    };
  }

  // ==================== HASHTAG ENDPOINTS ====================

  @Get('hashtags/trending')
  async getTrendingHashtags(@Query('limit') limit?: number) {
    const hashtags = await this.feedService.getTrendingHashtags(limit || 10);
    return { hashtags };
  }

  @Get('hashtags/search')
  async searchHashtags(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const hashtags = await this.feedService.searchHashtags(query, limit || 10);
    return { hashtags };
  }

  @Get('hashtags/:name/posts')
  async getPostsByHashtag(
    @Param('name') name: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.feedService.getPostsByHashtag(
      name,
      page || 1,
      limit || 20,
    );
    return result;
  }

  // ==================== MENTION ENDPOINTS ====================

  @Get('mentions/search-users')
  async searchUsersForMention(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const users = await this.feedService.searchUsersForMention(query, limit || 10);
    return { users };
  }

  @Get('mentions/my-mentions')
  async getMyMentions(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const mentions = await this.feedService.getUserMentions(
      user.sub,
      page || 1,
      limit || 20,
    );
    return { mentions };
  }
}
