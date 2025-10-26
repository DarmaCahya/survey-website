'use client';

import { useQuery } from "@tanstack/react-query";
import { getAnalyticData } from "@/services/FormService";
import { AnalyticResponse } from "@/types/analytics";

export const useGetAnalyticData = (adminPin?: string) => {
    const { data, isLoading, error } = useQuery<AnalyticResponse, Error>({
        queryKey: ["analytics", adminPin],
        queryFn: async () => {
            if (!adminPin) throw new Error("PIN admin belum diatur");
            const res = await getAnalyticData(adminPin);
            if (!res.success) {
                throw new Error(res.message || "Gagal mengambil data analytics");
            }

            return res.data;
        },
        enabled: !!adminPin,
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: false, 
    });

    return {
        analytics: data,
        loading: isLoading,
        error,
    };
};
