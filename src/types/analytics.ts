export interface AnalyticResponse {
    success: boolean;
    message: string;
    data: {
        summary: {
            totalSubmissions: number;
            totalUsers: number;
            totalAssets: number;
            totalThreats: number;
            understandStats: {
                mengerti: number;
                tidakMengerti: number;
                total: number;
            };
            riskCategoryStats: Record<"LOW" | "MEDIUM" | "HIGH" | "none", number>;
            feedbackStats: {
                totalFeedback: number;
                feedbackByField: Record<string, number>;
                mostCommonFields: { field: string; count: number }[];
            };
            averageScores: {
                riskScore: number;
                peluang: number;
                impact: number;
            };
        };
        assetAnalytics: {
            asset: { id: number; name: string; description: string };
            statistics: {
                totalThreats: number;
                totalSubmissions: number;
                understandStats: { mengerti: number; tidakMengerti: number };
                riskStats: Record<"LOW" | "MEDIUM" | "HIGH", number>;
                totalFeedback: number;
                completionRate: number;
            };
        }[];
        userAnalytics: {
            user: { id: number; email: string; name: string; createdAt: string };
            statistics: {
                totalSubmissions: number;
                understandStats: { mengerti: number; tidakMengerti: number };
                riskStats: Record<"LOW" | "MEDIUM" | "HIGH", number>;
                totalFeedback: number;
                averageRiskScore: number;
            };
        }[];
        feedbackAnalysis: {
            mostCommonFields: { field: string; count: number }[];
            feedbackTrends: {
                field: string;
                _count: { id: number };
            }[];
        };
    };
}
