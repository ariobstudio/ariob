/**
 * Game Session Store
 * Uses core thing store pattern with Zustand
 */
export declare const useSessionStore: () => import("@ariob/core").Store<{
    id: string;
    createdAt: number;
    soul: string;
    schema: "senterej/session";
    public: boolean;
    status: "ended" | "waiting" | "playing";
    gameState: string;
    updatedAt?: number | undefined;
    createdBy?: string | undefined;
    greenPlayer?: {
        id: string;
        pub: string;
        name: string;
        joinedAt: number;
    } | undefined;
    goldPlayer?: {
        id: string;
        pub: string;
        name: string;
        joinedAt: number;
    } | undefined;
}>;
