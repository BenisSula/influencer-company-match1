/**
 * StatMicroChart - Reusable micro-chart component
 * Uses recharts for trend visualization
 * Single source of truth for all stat charts
 * 
 * @example
 * <StatMicroChart data={[100, 200, 300]} color="#E1306C" />
 */

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import './StatMicroChart.css';

interface StatMicroChartProps {
  data: number[];
  color: string;
  className?: string;
}

export const StatMicroChart: React.FC<StatMicroChartProps> = React.memo(({ 
  data, 
  color,
  className = '' 
}) => {
  // Transform data for recharts
  const chartData = data.map((value, index) => ({ 
    value, 
    index 
  }));
  
  // Unique gradient ID per color
  const gradientId = `gradient-${color.replace('#', '')}`;
  
  return (
    <div className={`stat-micro-chart ${className}`}>
      <ResponsiveContainer width="100%" height={40}>
        <AreaChart 
          data={chartData} 
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fill={`url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

StatMicroChart.displayName = 'StatMicroChart';
