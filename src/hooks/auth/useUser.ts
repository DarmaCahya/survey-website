'use client';

import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/services/fetchUser";
import { UserData } from "@/types/user";

export const useUser = () => {
    const { data, isLoading, error } = useQuery<UserData, Error>({
        queryKey: ["user"], 
        queryFn: fetchUser,
        staleTime: 1000 * 60 * 5, 
        retry: 1, 
    });
        
    return {
        user: data,
        loading: isLoading,
        error
    }
};