'use client';

import { useQuery } from "@tanstack/react-query";
import { getThreatByFormId } from "@/services/FormService";
import { Threat } from "@/types/form";

export const useThreatsByFormId = (formId: string) => {
    const { data, isLoading, error } = useQuery<Threat[], Error>({
        queryKey: ["threats", formId],
        queryFn: async () => {
            const res = await getThreatByFormId(formId);
            return res.data ?? [];
        },
        enabled: !!formId,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return {
        threats: data,
        loading: isLoading,
        error,
    };
};