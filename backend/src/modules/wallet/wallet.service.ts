import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { User } from '../auth/entities/user.entity';
import { StripeConnectService } from '../payments/services/stripe-connect.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Payout)
    private payoutRepository: Repository<Payout>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private stripeConnectService: StripeConnectService,
    private dataSource: DataSource,
  ) {}

  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepository.findOne({ where: { userId } });

    if (!wallet) {
      wallet = this.walletRepository.create({
        userId,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        currency: 'usd',
      });
      wallet = await this.walletRepository.save(wallet);
      this.logger.log(`Created wallet for user ${userId}`);
    }

    return wallet;
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    
    if (!wallet) {
      throw new NotFoundException(`Wallet not found: ${walletId}`);
    }

    return wallet;
  }

  /**
   * Get wallet balance and transaction history
   */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const transactions = await this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const payouts = await this.payoutRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      wallet: {
        availableBalance: Number(wallet.availableBalance),
        pendingBalance: Number(wallet.pendingBalance),
        totalEarned: Number(wallet.totalEarned),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        currency: wallet.currency,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        createdAt: t.createdAt,
      })),
      payouts: payouts.map(p => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        requestedAt: p.requestedAt,
        completedAt: p.completedAt,
      })),
    };
  }

  /**
   * Credit balance (add funds to wallet)
   */
  async creditBalance(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceId: string,
    description?: string,
  ): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Update wallet balance
      wallet.availableBalance = Number(wallet.availableBalance) + amount;
      wallet.totalEarned = Number(wallet.totalEarned) + amount;
      wallet.lastUpdated = new Date();

      await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = this.transactionRepository.create({
        walletId: wallet.id,
        userId,
        type,
        amount,
        balanceAfter: wallet.availableBalance,
        referenceType: 'payment',
        referenceId,
        description: description || `Payment released`,
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Credited $${amount} to wallet ${wallet.id}`);

      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to credit balance:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Debit balance (remove funds from wallet)
   */
  async debitBalance(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceId: string,
    description?: string,
  ): Promise<Wallet> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getOrCreateWallet(userId);

      // Check sufficient balance
      if (Number(wallet.availableBalance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update wallet balance
      wallet.availableBalance = Number(wallet.availableBalance) - amount;
      wallet.totalWithdrawn = Number(wallet.totalWithdrawn) + amount;
      wallet.lastUpdated = new Date();

      await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = this.transactionRepository.create({
        walletId: wallet.id,
        userId,
        type,
        amount: -amount, // Negative for debit
        balanceAfter: wallet.availableBalance,
        referenceType: 'payout',
        referenceId,
        description: description || `Payout requested`,
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Debited $${amount} from wallet ${wallet.id}`);

      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to debit balance:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Request payout (withdrawal)
   */
  async requestPayout(userId: string, amount: number): Promise<Payout> {
    try {
      this.logger.log(`Processing payout request for user ${userId}, amount: $${amount}`);

      // Get wallet
      const wallet = await this.getOrCreateWallet(userId);

      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Payout amount must be greater than 0');
      }

      if (Number(wallet.availableBalance) < amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: $${wallet.availableBalance}`,
        );
      }

      // Get user's Stripe account
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || !user.stripeAccountId) {
        throw new BadRequestException('Stripe account not connected');
      }

      // Create payout record
      const payout = this.payoutRepository.create({
        userId,
        walletId: wallet.id,
        amount,
        currency: 'usd',
        status: PayoutStatus.PENDING,
        destinationAccount: user.stripeAccountId,
      });

      const savedPayout = await this.payoutRepository.save(payout);

      // Debit balance immediately
      await this.debitBalance(
        userId,
        amount,
        TransactionType.PAYOUT,
        savedPayout.id,
        `Payout to bank account`,
      );

      // Process payout with Stripe
      await this.processPayout(savedPayout.id);

      return savedPayout;
    } catch (error) {
      this.logger.error(`Failed to request payout:`, error);
      throw error;
    }
  }

  /**
   * Process payout with Stripe
   */
  private async processPayout(payoutId: string): Promise<void> {
    try {
      const payout = await this.payoutRepository.findOne({ where: { id: payoutId } });
      if (!payout) {
        throw new NotFoundException('Payout not found');
      }

      // Update status to processing
      payout.status = PayoutStatus.PROCESSING;
      payout.processedAt = new Date();
      await this.payoutRepository.save(payout);

      // Get Stripe instance
      const stripe = this.stripeConnectService.getStripeInstance();

      // Create Stripe Transfer to connected account
      const amountCents = Math.round(payout.amount * 100);

      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'usd',
        destination: payout.destinationAccount,
        description: `Payout for user ${payout.userId}`,
        metadata: {
          payoutId: payout.id,
          userId: payout.userId,
        },
      });

      // Update payout with Stripe transfer ID
      payout.stripeTransferId = transfer.id;
      payout.status = PayoutStatus.COMPLETED;
      payout.completedAt = new Date();
      payout.metadata = {
        ...payout.metadata,
        stripeTransfer: transfer,
      };

      await this.payoutRepository.save(payout);

      this.logger.log(`Payout ${payoutId} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process payout ${payoutId}:`, error);

      // Update payout status to failed
      const payout = await this.payoutRepository.findOne({ where: { id: payoutId } });
      if (payout) {
        payout.status = PayoutStatus.FAILED;
        payout.failureReason = error.message;
        await this.payoutRepository.save(payout);

        // Refund the amount back to wallet
        await this.creditBalance(
          payout.userId,
          payout.amount,
          TransactionType.REFUND,
          payoutId,
          `Payout failed - refunded`,
        );
      }

      throw error;
    }
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(userId: string) {
    return this.payoutRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
