const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DashboardMetrics {
  teacher: {
    totalStudents: number;
    avgMastery: number;
    topicsAtRisk: { topic: string; avgScore: number }[];
    activeStudentsLast7Days: number;
  };
  institution: {
    totalInteractions: number;
    avgDepthAlignment: number;
    avgClarity: number;
    ethicsFlagCount: number;
    depthDistribution: Record<string, number>;
  };
}

export const dashboardApi = {
  getMetrics: async (): Promise<{ success: boolean; data?: DashboardMetrics; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/metrics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Dashboard API Error]', error);
      return { success: false, error: 'Failed to fetch dashboard metrics' };
    }
  }
};