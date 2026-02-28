import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1707598000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if column exists
    const columnExists = async (table: string, column: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`
      );
      return result.length > 0;
    };

    // Users table indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    
    // Check for isActive column (could be isActive or is_active)
    if (await columnExists('users', 'isActive')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
      `);
    } else if (await columnExists('users', 'is_active')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      `);
    }

    // Profile tables indexes - check for userId or user_id
    if (await columnExists('influencer_profiles', 'userId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_influencer_profiles_userId 
        ON influencer_profiles("userId");
      `);
    } else if (await columnExists('influencer_profiles', 'user_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_influencer_profiles_userId 
        ON influencer_profiles(user_id);
      `);
    }

    if (await columnExists('company_profiles', 'userId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_company_profiles_userId 
        ON company_profiles("userId");
      `);
    } else if (await columnExists('company_profiles', 'user_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_company_profiles_userId 
        ON company_profiles(user_id);
      `);
    }

    // Connections table indexes
    if (await columnExists('connections', 'requesterId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_requester 
        ON connections("requesterId");
      `);
    } else if (await columnExists('connections', 'requester_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_requester 
        ON connections(requester_id);
      `);
    }

    if (await columnExists('connections', 'recipientId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_recipient 
        ON connections("recipientId");
      `);
    } else if (await columnExists('connections', 'recipient_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_recipient 
        ON connections(recipient_id);
      `);
    }

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_status 
      ON connections(status);
    `);
    
    if (await columnExists('connections', 'collaboration_status')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_collaboration_status 
        ON connections(collaboration_status);
      `);
    }

    // Composite index for connection lookups
    if (await columnExists('connections', 'requesterId') && await columnExists('connections', 'recipientId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_requester_recipient 
        ON connections("requesterId", "recipientId");
      `);
    } else if (await columnExists('connections', 'requester_id') && await columnExists('connections', 'recipient_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_connections_requester_recipient 
        ON connections(requester_id, recipient_id);
      `);
    }

    // Matches table indexes
    if (await columnExists('matches', 'influencerId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_matches_influencer 
        ON matches("influencerId");
      `);
    } else if (await columnExists('matches', 'influencer_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_matches_influencer 
        ON matches(influencer_id);
      `);
    }

    if (await columnExists('matches', 'companyId')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_matches_company 
        ON matches("companyId");
      `);
    } else if (await columnExists('matches', 'company_id')) {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_matches_company 
        ON matches(company_id);
      `);
    }

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_matches_score 
      ON matches(score DESC);
    `);

    // Match history indexes - only if table exists
    const matchHistoryExists = await queryRunner.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'match_history'`
    );
    
    if (matchHistoryExists.length > 0) {
      if (await columnExists('match_history', 'userId')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_match_history_userId 
          ON match_history("userId");
        `);
      } else if (await columnExists('match_history', 'user_id')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_match_history_userId 
          ON match_history(user_id);
        `);
      }

      if (await columnExists('match_history', 'createdAt')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_match_history_createdAt 
          ON match_history("createdAt" DESC);
        `);
      } else if (await columnExists('match_history', 'created_at')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_match_history_createdAt 
          ON match_history(created_at DESC);
        `);
      }
    }

    // Saved profiles indexes - only if table exists
    const savedProfilesExists = await queryRunner.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'saved_profiles'`
    );
    
    if (savedProfilesExists.length > 0) {
      if (await columnExists('saved_profiles', 'userId')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_saved_profiles_userId 
          ON saved_profiles("userId");
        `);
      } else if (await columnExists('saved_profiles', 'user_id')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_saved_profiles_userId 
          ON saved_profiles(user_id);
        `);
      }

      if (await columnExists('saved_profiles', 'savedProfileId')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_saved_profiles_savedProfileId 
          ON saved_profiles("savedProfileId");
        `);
      } else if (await columnExists('saved_profiles', 'saved_profile_id')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_saved_profiles_savedProfileId 
          ON saved_profiles(saved_profile_id);
        `);
      }
    }

    // Profile reviews indexes - only if table exists
    const profileReviewsExists = await queryRunner.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'profile_reviews'`
    );
    
    if (profileReviewsExists.length > 0) {
      if (await columnExists('profile_reviews', 'profileId')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_profileId 
          ON profile_reviews("profileId");
        `);
      } else if (await columnExists('profile_reviews', 'profile_id')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_profileId 
          ON profile_reviews(profile_id);
        `);
      }

      if (await columnExists('profile_reviews', 'reviewerId')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_reviewerId 
          ON profile_reviews("reviewerId");
        `);
      } else if (await columnExists('profile_reviews', 'reviewer_id')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_reviewerId 
          ON profile_reviews(reviewer_id);
        `);
      }

      if (await columnExists('profile_reviews', 'overallRating')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_rating 
          ON profile_reviews("overallRating");
        `);
      } else if (await columnExists('profile_reviews', 'overall_rating')) {
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_profile_reviews_rating 
          ON profile_reviews(overall_rating);
        `);
      }
    }

    console.log('✅ Performance indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_influencer_profiles_userId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_profiles_userId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_connections_requester`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_connections_recipient`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_connections_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_connections_collaboration_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_connections_requester_recipient`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_influencer`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_company`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_matches_score`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_match_history_userId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_match_history_createdAt`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_profiles_userId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_profiles_savedProfileId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profile_reviews_profileId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profile_reviews_reviewerId`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profile_reviews_rating`);

    console.log('✅ Performance indexes dropped');
  }
}
