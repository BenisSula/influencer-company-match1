import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../modules/auth/entities/user.entity';
import { InfluencerProfile } from '../../modules/auth/entities/influencer-profile.entity';
import { CompanyProfile } from '../../modules/auth/entities/company-profile.entity';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const influencerRepository = dataSource.getRepository(InfluencerProfile);
  const companyRepository = dataSource.getRepository(CompanyProfile);

  console.log('🌱 Starting database seeding...');

  // Check if data already exists
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('⚠️  Database already has data. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Influencers
  const influencers = [
    {
      email: 'sarah.fashion@example.com',
      name: 'Sarah Johnson',
      niche: 'Fashion & Lifestyle',
      bio: 'Fashion influencer with a passion for sustainable style',
      audienceSize: 150000,
      engagementRate: 4.5,
      location: 'New York, USA',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
    },
    {
      email: 'mike.tech@example.com',
      name: 'Mike Chen',
      niche: 'Technology',
      bio: 'Tech reviewer and gadget enthusiast',
      audienceSize: 250000,
      engagementRate: 5.2,
      location: 'San Francisco, USA',
      platforms: ['YouTube', 'Twitter', 'Instagram'],
    },
    {
      email: 'emma.fitness@example.com',
      name: 'Emma Rodriguez',
      niche: 'Fitness & Wellness',
      bio: 'Certified personal trainer and wellness coach',
      audienceSize: 180000,
      engagementRate: 6.1,
      location: 'Los Angeles, USA',
      platforms: ['Instagram', 'TikTok'],
    },
  ];

  for (const inf of influencers) {
    const user = userRepository.create({
      email: inf.email,
      password: hashedPassword,
      role: UserRole.INFLUENCER,
      profileCompleted: true,
      profileCompletionPercentage: 100,
    });
    await userRepository.save(user);

    const profile = influencerRepository.create({
      userId: user.id,
      name: inf.name,
      niche: inf.niche,
      bio: inf.bio,
      audienceSize: inf.audienceSize,
      engagementRate: inf.engagementRate,
      location: inf.location,
      platforms: inf.platforms,
    });
    await influencerRepository.save(profile);
    console.log(`✅ Created influencer: ${inf.name}`);
  }

  // Create Companies
  const companies = [
    {
      email: 'contact@techstartup.com',
      name: 'TechStartup Inc',
      industry: 'Technology',
      bio: 'Innovative tech company building the future',
      budget: 50000,
      location: 'San Francisco, USA',
      platforms: ['Instagram', 'YouTube', 'Twitter'],
      companySize: 'startup',
    },
    {
      email: 'marketing@fashionbrand.com',
      name: 'Fashion Brand Co',
      industry: 'Fashion',
      bio: 'Sustainable fashion brand for modern consumers',
      budget: 75000,
      location: 'New York, USA',
      platforms: ['Instagram', 'TikTok'],
      companySize: 'medium',
    },
    {
      email: 'partnerships@fitnessapp.com',
      name: 'FitnessApp',
      industry: 'Health & Fitness',
      bio: 'Leading fitness app with millions of users',
      budget: 100000,
      location: 'Los Angeles, USA',
      platforms: ['Instagram', 'YouTube', 'TikTok'],
      companySize: 'large',
    },
  ];

  for (const comp of companies) {
    const user = userRepository.create({
      email: comp.email,
      password: hashedPassword,
      role: UserRole.COMPANY,
      profileCompleted: true,
      profileCompletionPercentage: 100,
    });
    await userRepository.save(user);

    const profile = companyRepository.create({
      userId: user.id,
      name: comp.name, // ✅ Fixed: use 'name' instead of 'companyName'
      industry: comp.industry,
      bio: comp.bio,
      budget: comp.budget,
      location: comp.location,
      platforms: comp.platforms,
      companySize: comp.companySize,
    });
    await companyRepository.save(profile);
    console.log(`✅ Created company: ${comp.name}`);
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('   Email: sarah.fashion@example.com');
  console.log('   Password: password123');
  console.log('\n   Or any other seeded email with password: password123');
}
