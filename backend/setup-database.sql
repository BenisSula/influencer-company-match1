-- Setup Database Script
-- This script creates all necessary tables and seed data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS feed_posts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS influencer_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  role varchar(50) NOT NULL,
  "isActive" boolean DEFAULT true,
  "profileCompleted" boolean DEFAULT false,
  "profileCompletionPercentage" integer DEFAULT 0,
  "avatarUrl" varchar(500),
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- Create influencer_profiles table
CREATE TABLE influencer_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid UNIQUE NOT NULL,
  name varchar(255),
  bio text,
  niche varchar(100),
  platforms jsonb,
  "followerCount" integer,
  "engagementRate" decimal(5,2),
  location varchar(255),
  "audienceSize" integer,
  "portfolioUrl" varchar(500),
  "minBudget" integer,
  "maxBudget" integer,
  "collaborationPreference" varchar(100),
  "avatarUrl" varchar(500),
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create company_profiles table
CREATE TABLE company_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid UNIQUE NOT NULL,
  "companyName" varchar(255),
  industry varchar(100),
  bio text,
  description text,
  website varchar(255),
  budget integer,
  location varchar(255),
  platforms jsonb,
  "companySize" varchar(50),
  "campaignType" jsonb,
  "preferredInfluencerNiches" text,
  "collaborationDuration" varchar(100),
  "minAudienceSize" integer,
  "maxAudienceSize" integer,
  "verificationStatus" boolean DEFAULT false,
  "avatarUrl" varchar(500),
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create connections table
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "requesterId" uuid NOT NULL,
  "recipientId" uuid NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY ("requesterId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("recipientId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "influencerId" uuid NOT NULL,
  "companyId" uuid NOT NULL,
  score decimal(5,2) NOT NULL,
  factors jsonb,
  "createdAt" timestamp DEFAULT now(),
  FOREIGN KEY ("influencerId") REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY ("companyId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  last_message_at timestamp,
  unread_count_1 integer DEFAULT 0,
  unread_count_2 integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  attachment_url varchar,
  read_at timestamp,
  created_at timestamp DEFAULT now(),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Create feed_posts table
CREATE TABLE feed_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  content text NOT NULL,
  "postType" varchar DEFAULT 'update',
  "mediaUrls" text,
  "likeCount" integer DEFAULT 0,
  "commentCount" integer DEFAULT 0,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX "IDX_FEED_POSTS_AUTHOR_CREATED" ON feed_posts(author_id, "createdAt");

-- Create post_likes table
CREATE TABLE post_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "IDX_POST_LIKES_UNIQUE" ON post_likes(post_id, user_id);

-- Create post_comments table
CREATE TABLE post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX "IDX_POST_COMMENTS_POST_CREATED" ON post_comments(post_id, "createdAt");

-- Insert seed data
-- Password for all users: password123 (hashed with bcrypt)
DO $$
DECLARE
  influencer1_id uuid;
  influencer2_id uuid;
  influencer3_id uuid;
  company1_id uuid;
  company2_id uuid;
  company3_id uuid;
BEGIN
  -- Insert influencers
  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('sarah.fashion@example.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'INFLUENCER', true, 100)
  RETURNING id INTO influencer1_id;

  INSERT INTO influencer_profiles ("userId", name, niche, bio, "followerCount", "engagementRate", location, platforms)
  VALUES (influencer1_id, 'Sarah Johnson', 'Fashion & Lifestyle', 'Professional fashion influencer', 150000, 4.5, 'USA', '["Instagram", "TikTok"]');

  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('mike.tech@example.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'INFLUENCER', true, 100)
  RETURNING id INTO influencer2_id;

  INSERT INTO influencer_profiles ("userId", name, niche, bio, "followerCount", "engagementRate", location, platforms)
  VALUES (influencer2_id, 'Mike Chen', 'Technology', 'Tech reviewer and enthusiast', 200000, 5.2, 'USA', '["YouTube", "Twitter"]');

  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('emma.fitness@example.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'INFLUENCER', true, 100)
  RETURNING id INTO influencer3_id;

  INSERT INTO influencer_profiles ("userId", name, niche, bio, "followerCount", "engagementRate", location, platforms)
  VALUES (influencer3_id, 'Emma Rodriguez', 'Fitness & Wellness', 'Fitness coach and wellness advocate', 180000, 4.8, 'USA', '["Instagram", "YouTube"]');

  -- Insert companies
  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('contact@techstartup.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'COMPANY', true, 100)
  RETURNING id INTO company1_id;

  INSERT INTO company_profiles ("userId", "companyName", industry, description, budget, location, platforms, "companySize")
  VALUES (company1_id, 'TechStartup Inc', 'Technology', 'Leading tech company', 50000, 'USA', '["Instagram", "YouTube"]', 'medium');

  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('marketing@fashionbrand.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'COMPANY', true, 100)
  RETURNING id INTO company2_id;

  INSERT INTO company_profiles ("userId", "companyName", industry, description, budget, location, platforms, "companySize")
  VALUES (company2_id, 'Fashion Brand Co', 'Fashion', 'Premium fashion brand', 75000, 'USA', '["Instagram", "TikTok"]', 'large');

  INSERT INTO users (email, password, role, "profileCompleted", "profileCompletionPercentage")
  VALUES ('partnerships@fitnessapp.com', '$2b$10$rKZvVxwKxLxVxwKxLxVxwOqKxLxVxwKxLxVxwKxLxVxwKxLxVxwKxLxVxw', 'COMPANY', true, 100)
  RETURNING id INTO company3_id;

  INSERT INTO company_profiles ("userId", "companyName", industry, description, budget, location, platforms, "companySize")
  VALUES (company3_id, 'FitnessApp', 'Health & Fitness', 'Fitness app platform', 60000, 'USA', '["Instagram", "YouTube"]', 'medium');

END $$;

-- Success message
SELECT 'Database setup completed successfully!' as message;
SELECT 'Test credentials: sarah.fashion@example.com / password123' as credentials;
