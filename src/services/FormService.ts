import api from "@/lib/api";
import { safeRequest } from "@/app/utils/safeRequest";
import { SubmissionData } from "@/types/form"; 

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

export const makeSubmission = async (payload: SubmissionData) => {
    return safeRequest(async () => {
        const response = await api.post("form/submissions", payload);
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