'use client';

import { useQuery } from "@tanstack/react-query";
import { getDetailSubmission } from "@/services/FormService";
import { SubmissionDetail } from "@/types/form";

export const useGetDetailSubmission = (id: string) => {
    const { data, isLoading, error } = useQuery<SubmissionDetail, Error>({
        queryKey: ["submissionDetail", id],
        queryFn: async () => {
            const res = await getDetailSubmission(id);
            return res.data?.data; 
        },
        enabled: !!id, 
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return {
        submissionDetail: data,
        loading: isLoading,
        error,
    };
};