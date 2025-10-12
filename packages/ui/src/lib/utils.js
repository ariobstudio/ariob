import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export async function tryCatch(promise) {
    try {
        const data = await promise;
        return [data, null];
    }
    catch (error) {
        return [null, error];
    }
}
