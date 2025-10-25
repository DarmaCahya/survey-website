import { AxiosError } from "axios";

export async function safeRequest<T>(fn:() => Promise<T>): Promise<T> {
    try{
        return await fn();
    } catch (err: unknown) {
        throw err as AxiosError<{ message?: string }>;
    }
}