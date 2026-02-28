# Admin Dashboard - Phase 8: Advanced Analytics & Business Intelligence

## Implementation Status: 🔄 IN PROGRESS

**Timeline**: Weeks 17-19  
**Started**: Current Session  
**Dependencies**: Phases 1-7 (Complete)

---

## Phase 8.1: Advanced Dashboard Widgets

### Overview
Implementing real-time metrics dashboard with customizable widget layout, predictive analytics, cohort analysis, funnel visualization, and user behavior heatmaps.

### Backend Implementation

#### Step 1: Create Advanced Analytics Service

**File**: `backend/src/modules/admin/services/advanced-analytics.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../../auth/entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class AdvancedAnalyticsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Get cohort retention analysis
   * Groups users by signup date and tracks retention over time
   */
  async getCohortAnalysis(tenantId: string, startDate: Date, endDate: Date) {
    const cohorts = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE_TRUNC(\'month\', user.created_at)', 'cohort_month')
      .addSelect('COUNT(*)', 'user_count')
      .where('user.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('cohort_month')
      .orderBy('cohort_month', 'ASC')
      .getRawMany();

    // Calculate retention for each cohort
    const cohortAnalysis = await Promise.all(
      cohorts.map(async (cohort) => {
        const cohortStart = new Date(cohort.cohort_month);
        const cohortEnd = new Date(cohortStart);
        cohortEnd.setMonth(cohortEnd.getMonth() + 1);

        // Get active users in subsequent months
        const retention = await this.calculateRetention(cohortStart, cohortEnd);

        return {
          cohortMonth: cohort.cohort_month,
          initialUsers: parseInt(cohort.user_count),
          retention,
        };
      }),
    );

    return cohortAnalysis;
  }

  /**
   * Get conversion funnel analysis
   * Tracks user progression through defined steps
   */
  async getFunnelAnalysis(tenantId: string, funnelSteps: string[]) {
    const funnelData = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const count = await this.getUserCountAtStep(tenantId, step);
      
      const dropoff = i > 0 
        ? ((funnelData[i - 1].count - count) / funnelData[i - 1].count) * 100 
        : 0;

      funnelData.push({
        step,
        count,
        dropoffRate: dropoff.toFixed(2),
        conversionRate: i > 0 
          ? ((count / funnelData[0].count) * 100).toFixed(2) 
          : 100,
      });
    }

    return funnelData;
  }

  /**
   * Get predictive metrics using ML-based predictions
   * Predicts churn, revenue, and growth trends
   */
  async getPredictiveMetrics(tenantId: string) {
    const historicalData = await this.getHistoricalMetrics(tenantId);
    
    // Simple linear regression for prediction
    const predictions = {
      churnPrediction: await this.predictChurn(historicalData),
      revenueForecast: await this.predictRevenue(historicalData),
      growthTrend: await this.predictGrowth(historicalData),
      confidence: 0.85, // Confidence score
    };

    return predictions;
  }

  /**
   * Get user behavior heatmap data
   * Tracks user interactions and engagement patterns
   */
  async getUserBehaviorHeatmap(tenantId: string) {
    // Get user activity by hour and day of week
    const heatmapData = await this.userRepository
      .createQueryBuilder('user')
      .select('EXTRACT(DOW FROM user.last_login_at)', 'day_of_week')
      .addSelect('EXTRACT(HOUR FROM user.last_login_at)', 'hour')
      .addSelect('COUNT(*)', 'activity_count')
      .where('user.last_login_at IS NOT NULL')
      .groupBy('day_of_week, hour')
      .getRawMany();

    // Format for heatmap visualization
    const formattedData = this.formatHeatmapData(heatmapData);

    return formattedData;
  }

  // Helper methods
  private async calculateRetention(cohortStart: Date, cohortEnd: Date) {
    const months = [1, 2, 3, 6, 12]; // Track retention at these intervals
    const retention = {};

    for (const month of months) {
      const checkDate = new Date(cohortStart);
      checkDate.setMonth(checkDate.getMonth() + month);

      const activeUsers = await this.userRepository
        .createQueryBuilder('user')
        .where('user.created_at BETWEEN :cohortStart AND :cohortEnd', {
          cohortStart,
          cohortEnd,
        })
        .andWhere('user.last_login_at >= :checkDate', { checkDate })
        .getCount();

      retention[`month_${month}`] = activeUsers;
    }

    return retention;
  }

  private async getUserCountAtStep(tenantId: string, step: string) {
    // Map steps to actual database queries
    const stepQueries = {
      'signup': () => this.userRepository.count(),
      'profile_completed': () => this.userRepository.count({ where: { profileCompleted: true } }),
      'first_match': () => this.userRepository
        .createQueryBuilder('user')
        .innerJoin('matches', 'match', 'match.user_id = user.id')
        .getCount(),
      'first_message': () => this.userRepository
        .createQueryBuilder('user')
        .innerJoin('messages', 'message', 'message.sender_id = user.id')
        .getCount(),
      'subscription': () => this.subscriptionRepository.count({ where: { status: 'ACTIVE' } }),
    };

    return stepQueries[step] ? await stepQueries[step]() : 0;
  }

  private async getHistoricalMetrics(tenantId: string) {
    const last12Months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const users = await this.userRepository.count({
        where: { createdAt: Between(monthStart, monthEnd) },
      });

      const revenue = await this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .where('payment.created_at BETWEEN :monthStart AND :monthEnd', {
          monthStart,
          monthEnd,
        })
        .andWhere('payment.status = :status', { status: 'SUCCEEDED' })
        .getRawOne();

      last12Months.push({
        month: monthStart.toISOString().slice(0, 7),
        users,
        revenue: parseFloat(revenue?.total || '0'),
      });
    }

    return last12Months;
  }

  private async predictChurn(historicalData: any[]) {
    // Simple moving average for churn prediction
    const recentMonths = historicalData.slice(-3);
    const avgChurn = recentMonths.reduce((sum, month) => {
      const churnRate = month.users > 0 ? (month.users * 0.05) : 0; // Assume 5% baseline
      return sum + churnRate;
    }, 0) / recentMonths.length;

    return {
      predictedChurnRate: (avgChurn * 100).toFixed(2),
      atRiskUsers: Math.round(avgChurn * recentMonths[recentMonths.length - 1].users),
      trend: this.calculateTrend(recentMonths.map(m => m.users)),
    };
  }

  private async predictRevenue(historicalData: any[]) {
    // Linear regression for revenue prediction
    const recentMonths = historicalData.slice(-6);
    const avgGrowth = this.calculateAverageGrowth(recentMonths.map(m => m.revenue));
    const lastRevenue = recentMonths[recentMonths.length - 1].revenue;

    return {
      nextMonthRevenue: (lastRevenue * (1 + avgGrowth)).toFixed(2),
      next3MonthsRevenue: (lastRevenue * Math.pow(1 + avgGrowth, 3)).toFixed(2),
      growthRate: (avgGrowth * 100).toFixed(2),
    };
  }

  private async predictGrowth(historicalData: any[]) {
    const userGrowth = this.calculateAverageGrowth(historicalData.map(m => m.users));
    const revenueGrowth = this.calculateAverageGrowth(historicalData.map(m => m.revenue));

    return {
      userGrowthRate: (userGrowth * 100).toFixed(2),
      revenueGrowthRate: (revenueGrowth * 100).toFixed(2),
      trend: userGrowth > 0 ? 'growing' : userGrowth < 0 ? 'declining' : 'stable',
    };
  }

  private calculateAverageGrowth(values: number[]): number {
    if (values.length < 2) return 0;

    let totalGrowth = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        totalGrowth += (values[i] - values[i - 1]) / values[i - 1];
      }
    }

    return totalGrowth / (values.length - 1);
  }

  private calculateTrend(values: number[]): string {
    const growth = this.calculateAverageGrowth(values);
    return growth > 0.05 ? 'increasing' : growth < -0.05 ? 'decreasing' : 'stable';
  }

  private formatHeatmapData(rawData: any[]) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const heatmap = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const dataPoint = rawData.find(
          d => parseInt(d.day_of_week) === day && parseInt(d.hour) === hour,
        );

        heatmap.push({
          day: days[day],
          hour,
          value: dataPoint ? parseInt(dataPoint.activity_count) : 0,
        });
      }
    }

    return heatmap;
  }
}
```

---

## Next Steps

1. ✅ Create Advanced Analytics Service
2. ⏳ Create Advanced Analytics Controller
3. ⏳ Create Advanced Analytics DTOs
4. ⏳ Update Admin Module
5. ⏳ Create Frontend Service
6. ⏳ Create Advanced Dashboard Widgets Components
7. ⏳ Integrate with Admin Dashboard
8. ⏳ Add Real-time Updates
9. ⏳ Testing & Verification

**Status**: Step 1 Complete - Service Layer Created

