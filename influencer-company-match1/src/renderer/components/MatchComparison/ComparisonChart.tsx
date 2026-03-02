import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import './ComparisonChart.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ComparisonMatch {
  id: string;
  name: string;
  matchScore: number;
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceMatch: number;
    engagementQuality: number;
  };
}

interface ComparisonChartProps {
  matches: ComparisonMatch[];
}

const COLORS = [
  { bg: 'rgba(33, 150, 243, 0.2)', border: 'rgb(33, 150, 243)' },
  { bg: 'rgba(76, 175, 80, 0.2)', border: 'rgb(76, 175, 80)' },
  { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgb(255, 152, 0)' },
];

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ matches }) => {
  const chartData = {
    labels: [
      'Niche Compatibility',
      'Budget Alignment',
      'Platform Overlap',
      'Audience Match',
      'Engagement Quality',
    ],
    datasets: matches.map((match, index) => ({
      label: match.name,
      data: [
        match.factors.nicheCompatibility,
        match.factors.budgetAlignment,
        match.factors.platformOverlap,
        match.factors.audienceMatch,
        match.factors.engagementQuality,
      ],
      backgroundColor: COLORS[index % COLORS.length].bg,
      borderColor: COLORS[index % COLORS.length].border,
      borderWidth: 2,
      pointBackgroundColor: COLORS[index % COLORS.length].border,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: COLORS[index % COLORS.length].border,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.r}%`;
          },
        },
      },
    },
  };

  return (
    <div className="comparison-chart">
      <div className="chart-container">
        <Radar data={chartData} options={options} />
      </div>
      
      <div className="chart-legend">
        {matches.map((match, index) => (
          <div key={match.id} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: COLORS[index % COLORS.length].border }}
            />
            <div className="legend-info">
              <div className="legend-name">{match.name}</div>
              <div className="legend-score">Overall: {match.matchScore}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
