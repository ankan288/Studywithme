export interface AnalyticsEvent {
  timestamp: string;
  eventType: string;
  depth: string;
  mode: string;
  ethicsFlag: boolean;
  qualityScore: number;
}

export interface DepthDistribution {
  Core: number;
  Applied: number;
  Mastery: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}
