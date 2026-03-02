import React from 'react';
import { HiCurrencyDollar } from 'react-icons/hi';
import './BudgetTierBadge.css';

interface BudgetTierBadgeProps {
  budget: number;
}

export const BudgetTierBadge: React.FC<BudgetTierBadgeProps> = ({ budget }) => {
  const getTier = (budget: number) => {
    if (budget < 1000) return { tier: 'starter', label: 'Starter' };
    if (budget < 5000) return { tier: 'growth', label: 'Growth' };
    if (budget < 20000) return { tier: 'professional', label: 'Professional' };
    return { tier: 'enterprise', label: 'Enterprise' };
  };

  const { tier, label } = getTier(budget);

  return (
    <span className={`budget-tier-badge ${tier}`}>
      <span className="budget-tier-icon">
        <HiCurrencyDollar />
      </span>
      {label}
    </span>
  );
};
