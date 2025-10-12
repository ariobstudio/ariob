import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
type Result<T, E = Error> = [T, null] | [null, E];
export declare function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export {};
