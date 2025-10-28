'use client';

import { useQuery } from "@tanstack/react-query";
import { getAllForms } from "@/services/FormService";
import { FormData } from "@/types/form";

export const useGetAllForms = () => {
    const { data, isLoading, error, refetch } = useQuery<FormData, Error>({
        queryKey: ["forms"],
        queryFn: async () => {
            const res = await getAllForms();
            return res.data; 
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    return {
        forms: data,
        loading: isLoading,
        error,
        refetch
    };
};
