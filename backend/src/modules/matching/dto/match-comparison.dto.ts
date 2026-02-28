export interface MatchComparisonDto {
  matches: ComparisonMatch[];
  comparisonDate: Date;
}

export interface ComparisonMatch {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  matchScore: number;
  factors: {
    nicheCompatibility: number;
    budgetAlignment: number;
    platformOverlap: number;
    audienceMatch: number;
    engagementQuality: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}
