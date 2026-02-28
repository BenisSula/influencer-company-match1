import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletTables1708013000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create wallets table
    await queryRunner.query(`
      CREATE TABLE wallets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        available_balance DECIMAL(10,2) DEFAULT 0,
        pending_balance DECIMAL(10,2) DEFAULT 0,
        total_earned DECIMAL(10,2) DEFAULT 0,
        total_withdrawn DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'usd',
        last_updated TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create wallet_transactions table
    await queryRunner.query(`
      CREATE TYPE transaction_type AS ENUM (
        'payment_released',
        'payout',
        'refund',
        'fee',
        'adjustment'
      );

      CREATE TABLE wallet_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type transaction_type NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        balance_after DECIMAL(10,2) NOT NULL,
        reference_type VARCHAR(50),
        reference_id UUID,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create payouts table
    await queryRunner.query(`
      CREATE TYPE payout_status AS ENUM (
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled'
      );

      CREATE TABLE payouts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status payout_status DEFAULT 'pending',
        stripe_payout_id VARCHAR(255),
        stripe_transfer_id VARCHAR(255),
        destination_account VARCHAR(255),
        failure_reason TEXT,
        metadata JSONB,
        requested_at TIMESTAMP DEFAULT NOW(),
        processed_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
      CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
      CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
      CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
      CREATE INDEX idx_payouts_user_id ON payouts(user_id);
      CREATE INDEX idx_payouts_wallet_id ON payouts(wallet_id);
      CREATE INDEX idx_payouts_status ON payouts(status);
      CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS payouts CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallet_transactions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS wallets CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS payout_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type;`);
  }
}
