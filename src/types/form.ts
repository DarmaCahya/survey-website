export type ThreatData = {
    threatId: string;
    biaya_pengetahuan: number;
    pengaruh_kerugian: number;
    frekuensi_serangan: number;
    pemulihan: number;
    mengerti_poin: boolean;
    tidak_mengerti: string;
    tidak_mengerti_description: string;
}

type ThreatPayload = {
    biaya_pengetahuan: number;
    pengaruh_kerugian: number;
    frekuensi_serangan: number;
    pemulihan: number;
    mengerti_poin: boolean;
    tidak_mengerti?: string;
    tidak_mengerti_description?: string;
};

export type Submission = {
    threats: ThreatPayload[];
};

export type SubmissionData = {
    assetId: string;
    threats: ThreatData[];
}

export type Form = {
    id: number;
    name: string;
    threatCount: number;
};

export type FormData = Form[];

export type Threat = {
    id: string;
    name: string;
    description: string;
}

export type ThreatDescription = {
    category: string;
    priority: string;
    threatName: string;
    description: string;
    actionRequired: boolean;
    recommendations: string[];
};

export type ResponseScore = {
    peluang: number;
    impact: number;
    total: number;
    category: string;
    threatDescription: ThreatDescription;
};

export type SubmissionDetail = {
    submission: {
        id: number;
        submittedAt: string;
        understand: string;
    };
    context: {
        user: {
            id: number;
            email: string;
            name: string;
        };
        asset: {
            id: number;
            name: string;
            description: string;
        };
        threat: {
            id: number;
            name: string;
            description: string;
        };
    };
    questions: {
        riskAssessment: Record<
            string,
            {
                question: string;
                description: string;
                answer: number;
                scale: string;
                meaning: string;
            }
        >;
        understanding: {
        question: string;
        answer: string;
        meaning: string;
        };
    };
    calculatedScores: {
        peluang: number;
        impact: number;
        total: number;
        category: string;
        formula: Record<string, string>;
    };
    feedback: any[];
};
