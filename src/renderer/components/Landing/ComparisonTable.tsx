/**
 * ComparisonTable Component
 * Feature comparison matrix showing ICMatch vs competitors
 */

import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { ComparisonFeature, competitorNames } from '../../data/landing/features';
import './ComparisonTable.css';

interface ComparisonTableProps {
  features: ComparisonFeature[];
  onSignupClick?: () => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  features,
  onSignupClick
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const renderCell = (value: boolean | string, isICMatch: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="comparison-table__icon comparison-table__icon--check" size={20} />
      ) : (
        <X className="comparison-table__icon comparison-table__icon--cross" size={20} />
      );
    }

    return (
      <span className={`comparison-table__text ${isICMatch ? 'comparison-table__text--highlight' : ''}`}>
        {value}
      </span>
    );
  };

  return (
    <div className="comparison-table-wrapper">
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="comparison-table__header comparison-table__header--feature">
                Feature
              </th>
              <th className="comparison-table__header comparison-table__header--icmatch">
                <div className="comparison-table__header-content">
                  <span className="comparison-table__header-label">{competitorNames.icmatch}</span>
                  <span className="comparison-table__header-badge">Recommended</span>
                </div>
              </th>
              <th className="comparison-table__header">
                {competitorNames.competitor1}
              </th>
              <th className="comparison-table__header">
                {competitorNames.competitor2}
              </th>
              <th className="comparison-table__header">
                {competitorNames.competitor3}
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className={`comparison-table__row ${hoveredRow === index ? 'comparison-table__row--hovered' : ''}`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="comparison-table__cell comparison-table__cell--feature">
                  <div className="comparison-table__feature-name">
                    {feature.feature}
                    <button 
                      className="comparison-table__info-btn"
                      aria-label={`More info about ${feature.feature}`}
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </td>
                <td className="comparison-table__cell comparison-table__cell--icmatch">
                  {renderCell(feature.icmatch, true)}
                </td>
                <td className="comparison-table__cell">
                  {renderCell(feature.competitor1)}
                </td>
                <td className="comparison-table__cell">
                  {renderCell(feature.competitor2)}
                </td>
                <td className="comparison-table__cell">
                  {renderCell(feature.competitor3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA Section */}
      <div className="comparison-table__cta">
        <div className="comparison-table__cta-content">
          <h3 className="comparison-table__cta-title">
            Ready to experience the difference?
          </h3>
          <p className="comparison-table__cta-text">
            Join thousands of influencers and companies using ICMatch
          </p>
        </div>
        <button 
          className="comparison-table__cta-btn"
          onClick={onSignupClick}
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
};
