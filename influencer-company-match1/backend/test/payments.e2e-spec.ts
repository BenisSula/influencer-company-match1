import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Payment System (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let companyToken: string;
  let influencerId: string;
  let companyId: string;
  let collaborationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create test users
    const influencerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-influencer@test.com',
        password: 'Test123!@#',
        role: 'INFLUENCER',
      });
    
    influencerId = influencerRes.body.user.id;
    authToken = influencerRes.body.token;

    const companyRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-company@test.com',
        password: 'Test123!@#',
        role: 'COMPANY',
      });
    
    companyId = companyRes.body.user.id;
    companyToken = companyRes.body.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await dataSource.query('DELETE FROM collaboration_payments WHERE 1=1');
    await dataSource.query('DELETE FROM users WHERE email LIKE \'test-%\'');
    await app.close();
  });

  describe('Payment Creation', () => {
    it('should create payment on collaboration acceptance', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/create')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          influencerId,
          amount: 1000,
          description: 'Test collaboration payment',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      expect(response.body.amountTotal).toBe(1000);
    });

    it('should reject payment creation without auth', async () => {
      await request(app.getHttpServer())
        .post('/payments/create')
        .send({
          influencerId,
          amount: 1000,
        })
        .expect(401);
    });
  });

  describe('Payment Confirmation', () => {
    let paymentId: string;

    beforeEach(async () => {
      const payment = await request(app.getHttpServer())
        .post('/payments/create')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          influencerId,
          amount: 500,
        });
      
      paymentId = payment.body.id;
    });

    it('should confirm payment with valid payment intent', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          paymentIntentId: 'pi_test_123456',
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('should reject confirmation by non-owner', async () => {
      await request(app.getHttpServer())
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentIntentId: 'pi_test_123456',
        })
        .expect(403);
    });
  });

  describe('Payment Release', () => {
    let paymentId: string;

    beforeEach(async () => {
      const payment = await request(app.getHttpServer())
        .post('/payments/create')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          influencerId,
          amount: 750,
        });
      
      paymentId = payment.body.id;

      await request(app.getHttpServer())
        .post(`/payments/${paymentId}/confirm`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          paymentIntentId: 'pi_test_release',
        });
    });

    it('should release payment and update wallet', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/${paymentId}/release`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body.status).toBe('released');

      // Check wallet balance
      const wallet = await request(app.getHttpServer())
        .get('/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(wallet.body.availableBalance).toBeGreaterThan(0);
    });
  });

  describe('Payout Creation', () => {
    it('should create payout request', async () => {
      const response = await request(app.getHttpServer())
        .post('/wallet/payout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
    });

    it('should reject payout exceeding balance', async () => {
      await request(app.getHttpServer())
        .post('/wallet/payout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 999999,
        })
        .expect(400);
    });
  });

  describe('Webhook Handling', () => {
    it('should process payment_intent.succeeded webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_webhook_test',
            amount: 50000,
            status: 'succeeded',
          },
        },
      };

      await request(app.getHttpServer())
        .post('/payments/webhook')
        .send(webhookPayload)
        .expect(200);
    });

    it('should process payment_intent.payment_failed webhook', async () => {
      const webhookPayload = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_webhook_failed',
            status: 'failed',
          },
        },
      };

      await request(app.getHttpServer())
        .post('/payments/webhook')
        .send(webhookPayload)
        .expect(200);
    });
  });
});
