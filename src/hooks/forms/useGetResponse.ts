'use client';

import { useQuery } from "@tanstack/react-query";
import { getResponses } from "@/services/FormService";
import { ResponseScore } from "@/types/form";

export const useGetResponses = (id: string) => {
    const { data, isLoading, error } = useQuery<ResponseScore, Error>({
        queryKey: ["responses", id],
        queryFn: async () => {
        const res = await getResponses(id);
        return res.data?.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return {
        responses: data,
        loading: isLoading,
        error,
    };
};
