import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { InfluencerProfile } from '../modules/profiles/entities/influencer-profile.entity';
import { CompanyProfile } from '../modules/profiles/entities/company-profile.entity';
import { UserRole } from '../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

const dataSourceConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'influencer_matching',
  entities: [User, InfluencerProfile, CompanyProfile],
  synchronize: true,
};

const mockInfluencers = [
  {
    email: 'sarah.johnson@example.com',
    password: 'password123',
    profile: {
      niche: 'Fashion',
      audienceSize: 100000,
      engagementRate: 4.5,
      platforms: ['Instagram', 'TikTok'],
      location: 'New York',
      minBudget: 5000,
      maxBudget: 15000,
      bio: 'Fashion influencer specializing in sustainable and ethical fashion. Passionate about eco-friendly brands.',
      portfolioUrl: 'https://example.com/sarah',
    },
  },
  {
    email: 'mike.chen@example.com',
    password: 'password123',
    profile: {
      niche: 'Tech',
      audienceSize: 250000,
      engagementRate: 3.2,
      platforms: ['YouTube', 'Twitter'],
      location: 'San Francisco',
      minBudget: 10000,
      maxBudget: 25000,
      bio: 'Tech reviewer and gadget enthusiast. Covering the latest in consumer electronics and software.',
      portfolioUrl: 'https://example.com/mike',
    },
  },
  {
    email: 'emma.davis@example.com',
    password: 'password123',
    profile: {
      niche: 'Beauty',
      audienceSize: 500000,
      engagementRate: 5.8,
      platforms: ['Instagram', 'YouTube'],
      location: 'Los Angeles',
      minBudget: 15000,
      maxBudget: 30000,
      bio: 'Beauty and makeup artist. Sharing tutorials, product reviews, and skincare tips.',
      portfolioUrl: 'https://example.com/emma',
    },
  },
  {
    email: 'alex.rodriguez@example.com',
    password: 'password123',
    profile: {
      niche: 'Fitness',
      audienceSize: 150000,
      engagementRate: 4.1,
      platforms: ['Instagram', 'TikTok'],
      location: 'Miami',
      minBudget: 7000,
      maxBudget: 18000,
      bio: 'Certified personal trainer and fitness coach. Helping people achieve their health goals.',
      portfolioUrl: 'https://example.com/alex',
    },
  },
  {
    email: 'lisa.park@example.com',
    password: 'password123',
    profile: {
      niche: 'Food',
      audienceSize: 80000,
      engagementRate: 6.2,
      platforms: ['Instagram', 'TikTok'],
      location: 'Chicago',
      minBudget: 4000,
      maxBudget: 12000,
      bio: 'Food blogger and recipe creator. Exploring cuisines from around the world.',
      portfolioUrl: 'https://example.com/lisa',
    },
  },
];

const mockCompanies = [
  {
    email: 'contact@styleco.com',
    password: 'password123',
    profile: {
      companyName: 'StyleCo',
      industry: 'Fashion',
      budget: 12000,
      targetPlatforms: ['Instagram', 'TikTok'],
      targetLocation: 'New York',
      minAudienceSize: 50000,
      maxAudienceSize: 200000,
      description: 'Sustainable fashion brand focused on ethical manufacturing and eco-friendly materials.',
      website: 'https://styleco.example.com',
    },
  },
  {
    email: 'marketing@techgear.com',
    password: 'password123',
    profile: {
      companyName: 'TechGear',
      industry: 'Tech',
      budget: 20000,
      targetPlatforms: ['YouTube', 'Twitter'],
      targetLocation: 'San Francisco',
      minAudienceSize: 100000,
      maxAudienceSize: 500000,
      description: 'Leading tech accessories brand offering innovative solutions for modern professionals.',
      website: 'https://techgear.example.com',
    },
  },
  {
    email: 'hello@glowbeauty.com',
    password: 'password123',
    profile: {
      companyName: 'GlowBeauty',
      industry: 'Beauty',
      budget: 25000,
      targetPlatforms: ['Instagram', 'YouTube'],
      targetLocation: 'Los Angeles',
      minAudienceSize: 200000,
      maxAudienceSize: 1000000,
      description: 'Premium beauty and skincare brand with natural, cruelty-free products.',
      website: 'https://glowbeauty.example.com',
    },
  },
  {
    email: 'team@fitlife.com',
    password: 'password123',
    profile: {
      companyName: 'FitLife',
      industry: 'Fitness',
      budget: 15000,
      targetPlatforms: ['Instagram', 'TikTok'],
      targetLocation: 'Miami',
      minAudienceSize: 100000,
      maxAudienceSize: 300000,
      description: 'Fitness apparel and equipment brand empowering active lifestyles.',
      website: 'https://fitlife.example.com',
    },
  },
  {
    email: 'info@tastybites.com',
    password: 'password123',
    profile: {
      companyName: 'TastyBites',
      industry: 'Food',
      budget: 10000,
      targetPlatforms: ['Instagram', 'TikTok'],
      targetLocation: 'Chicago',
      minAudienceSize: 50000,
      maxAudienceSize: 150000,
      description: 'Gourmet food delivery service featuring chef-curated meals and recipes.',
      website: 'https://tastybites.example.com',
    },
  },
];

async function seed() {
  const dataSource = new DataSource(dataSourceConfig);
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const influencerRepo = dataSource.getRepository(InfluencerProfile);
  const companyRepo = dataSource.getRepository(CompanyProfile);

  console.log('🌱 Seeding database...');

  // Seed influencers
  for (const data of mockInfluencers) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: UserRole.INFLUENCER,
    });
    const savedUser = await userRepo.save(user);

    const profile = influencerRepo.create({
      ...data.profile,
      user: savedUser,
    });
    await influencerRepo.save(profile);
    console.log(`✅ Created influencer: ${data.email}`);
  }

  // Seed companies
  for (const data of mockCompanies) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = userRepo.create({
      email: data.email,
      password: hashedPassword,
      role: UserRole.COMPANY,
    });
    const savedUser = await userRepo.save(user);

    const profile = companyRepo.create({
      ...data.profile,
      user: savedUser,
    });
    await companyRepo.save(profile);
    console.log(`✅ Created company: ${data.email}`);
  }

  console.log('🎉 Seeding completed!');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
