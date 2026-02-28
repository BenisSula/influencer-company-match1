import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatbotTables1708010000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Chatbot Conversations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        context JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_message_at TIMESTAMP,
        
        CONSTRAINT chk_chatbot_conv_status CHECK (status IN ('active', 'closed', 'archived'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_conv_user_id ON chatbot_conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_chatbot_conv_session_id ON chatbot_conversations(session_id);
      CREATE INDEX IF NOT EXISTS idx_chatbot_conv_status ON chatbot_conversations(status);
      CREATE INDEX IF NOT EXISTS idx_chatbot_conv_last_message ON chatbot_conversations(last_message_at);
    `);

    // 2. Chatbot Messages
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        intent VARCHAR(100),
        confidence DECIMAL(5,4),
        metadata JSONB DEFAULT '{}',
        is_sensitive BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT chk_chatbot_msg_sender CHECK (sender_type IN ('user', 'bot'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_msg_conversation ON chatbot_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chatbot_msg_sender ON chatbot_messages(sender_type);
      CREATE INDEX IF NOT EXISTS idx_chatbot_msg_intent ON chatbot_messages(intent);
      CREATE INDEX IF NOT EXISTS idx_chatbot_msg_created ON chatbot_messages(created_at);
    `);

    // 3. Chatbot Intents
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_intents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        patterns TEXT[],
        responses TEXT[],
        requires_auth BOOLEAN DEFAULT FALSE,
        category VARCHAR(50),
        priority INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_intent_name ON chatbot_intents(name);
      CREATE INDEX IF NOT EXISTS idx_chatbot_intent_category ON chatbot_intents(category);
      CREATE INDEX IF NOT EXISTS idx_chatbot_intent_active ON chatbot_intents(is_active);
    `);

    // 4. Chatbot Analytics
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB DEFAULT '{}',
        session_duration INTEGER,
        messages_count INTEGER DEFAULT 0,
        satisfaction_score INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT chk_chatbot_satisfaction CHECK (satisfaction_score BETWEEN 1 AND 5)
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_user ON chatbot_analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_event ON chatbot_analytics(event_type);
      CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_created ON chatbot_analytics(created_at);
    `);

    // 5. Chatbot Email Queue
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_email_queue (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_type VARCHAR(50) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        template_data JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'pending',
        sent_at TIMESTAMP,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT chk_chatbot_email_status CHECK (status IN ('pending', 'sent', 'failed'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_email_user ON chatbot_email_queue(user_id);
      CREATE INDEX IF NOT EXISTS idx_chatbot_email_status ON chatbot_email_queue(status);
      CREATE INDEX IF NOT EXISTS idx_chatbot_email_type ON chatbot_email_queue(email_type);
      CREATE INDEX IF NOT EXISTS idx_chatbot_email_created ON chatbot_email_queue(created_at);
    `);

    // 6. Chatbot FAQ
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chatbot_faq (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50),
        keywords TEXT[],
        view_count INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_chatbot_faq_category ON chatbot_faq(category);
      CREATE INDEX IF NOT EXISTS idx_chatbot_faq_active ON chatbot_faq(is_active);
      CREATE INDEX IF NOT EXISTS idx_chatbot_faq_views ON chatbot_faq(view_count);
    `);

    // Seed initial intents
    await queryRunner.query(`
      INSERT INTO chatbot_intents (name, description, patterns, responses, requires_auth, category, priority, is_active)
      VALUES 
        ('greeting', 'User greets the chatbot', 
         ARRAY['hi', 'hello', 'hey', 'good morning', 'good afternoon'], 
         ARRAY['Hello! 👋 How can I help you today?', 'Hi there! What can I assist you with?', 'Hey! Ready to find your perfect match?'],
         false, 'general', 10, true),
        
        ('find_matches', 'User wants to find matches', 
         ARRAY['find matches', 'show matches', 'who can I work with', 'find influencers', 'find companies'], 
         ARRAY['I can help you find perfect matches! Let me check your profile and suggest the best options.', 'Great! Based on your profile, I''ll find the most compatible matches for you.'],
         true, 'matching', 9, true),
        
        ('collaboration_request', 'User wants to send collaboration request', 
         ARRAY['send collaboration', 'work together', 'start project', 'collaborate'], 
         ARRAY['I can help you send a collaboration request! Which match would you like to reach out to?', 'Let''s get you connected! Tell me more about the collaboration you have in mind.'],
         true, 'collaboration', 8, true),
        
        ('performance_metrics', 'User wants to see performance metrics', 
         ARRAY['show stats', 'my performance', 'analytics', 'how am I doing'], 
         ARRAY['Let me pull up your performance metrics! 📊', 'Here''s a quick overview of your performance...'],
         true, 'analytics', 7, true),
        
        ('help', 'User needs help', 
         ARRAY['help', 'how does this work', 'what can you do', 'guide'], 
         ARRAY['I''m here to help! I can assist you with:\n• Finding perfect matches\n• Sending collaboration requests\n• Viewing your analytics\n• Managing your profile\n\nWhat would you like to know more about?'],
         false, 'general', 5, true)
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_faq CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_email_queue CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_analytics CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_intents CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_messages CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS chatbot_conversations CASCADE`);
  }
}
