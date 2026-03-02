import React from 'react';
import { Card, CardHeader, CardBody } from '../index';
import './DashboardWidget.css';

interface DashboardWidgetProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  loading?: boolean;
  error?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  icon,
  children,
  action,
  loading,
  error,
}) => {
  return (
    <Card className="dashboard-widget">
      <CardHeader>
        <div className="dashboard-widget-header">
          <div className="dashboard-widget-title">
            {icon && <span className="dashboard-widget-icon">{icon}</span>}
            <h3>{title}</h3>
          </div>
          {action && (
            <button
              className="dashboard-widget-action"
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {loading && (
          <div className="dashboard-widget-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="dashboard-widget-error">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && children}
      </CardBody>
    </Card>
  );
};
