import api from "@/lib/api";
import { safeRequest } from "@/app/utils/safeRequest";
import { ThreatPayload } from "@/types/form"; 

export const getAllForms = async () => {
    return safeRequest(async () => {
        const response = await api.get("form/assets");
        return response.data;
    });
};

export const getThreatByFormId = async (id: string) => {
    return safeRequest(async () => {
        const response = await api.get(`form/assets/${id}/threats`);
        return response.data;
    });
};

export const makeSubmission = async (payload: ThreatPayload, assetId: string, threatId: string) => {
    return safeRequest(async () => {
        const response = await api.post(`form/submit-form/${assetId}/${threatId}`, payload);
        return response.data;
    });
};

export const getDetailSubmission = async (id: string) => {
    return safeRequest(async () => {
        const response = await api.get(`form/submissions/${id}/details`);
        return response.data;
    });
};

export const getResponses = async (id: string) => {
    return safeRequest(async () => {
        const response = await api.get(`form/submissions/${id}/score`);
        return response.data;
    });
};

export const getAnalyticData = async (adminPin: string) => {
    return safeRequest(async () => {
        const response = await api.get("form/admin/analytics", {
            headers: {
                "x-admin-pin": adminPin,
            },
        });
        return response.data;
    });
};