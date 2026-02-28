import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  size = 'md',
  hover = false,
  shadow = 'md',
  style 
}) => {
  const cardClasses = [
    'card',
    `card-${size}`,
    `card-shadow-${shadow}`,
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} style={style}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};
