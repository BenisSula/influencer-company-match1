import { IsString, IsEnum, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';
import { PostType } from '../entities/feed-post.entity';

export class CreatePostDto {
  @IsString()
  @MinLength(1, { message: 'Post content cannot be empty' })
  @MaxLength(2000, { message: 'Post content cannot exceed 2000 characters' })
  content: string;

  @IsEnum(PostType)
  @IsOptional()
  postType?: PostType;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];
}
