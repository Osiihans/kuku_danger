export const TOTAL_PLAYABLE_LANES = 10;

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

const GROWTH_BY_DIFFICULTY: Record<Difficulty, number> = {
    EASY: 1.15,
    MEDIUM: 1.3,
    HARD: 1.55,
};

export const generateOdds = (difficulty: string): number[] => {
    const growth = GROWTH_BY_DIFFICULTY[difficulty as Difficulty] ?? GROWTH_BY_DIFFICULTY.MEDIUM;
    return Array.from({length: TOTAL_PLAYABLE_LANES}, (_, i) => {
        const lane = i + 1;
        return Math.round(growth ** lane * 100) / 100;
    });
};

const SPEED_RANGE_BY_DIFFICULTY: Record<Difficulty, [number, number]> = {
    EASY: [2.5, 4.5],
    MEDIUM: [3.5, 6],
    HARD: [5, 8.5],
};

export const getVehicleSpeedRange = (difficulty: string): [number, number] =>
    SPEED_RANGE_BY_DIFFICULTY[difficulty as Difficulty] ?? SPEED_RANGE_BY_DIFFICULTY.MEDIUM;

export const formatKES = (amount: number): string =>
    `KSh ${amount.toLocaleString("en-KE", {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
