import {create} from "zustand";
import {generateOdds, TOTAL_PLAYABLE_LANES, type Difficulty} from "../utils/gameMath.ts";
import type {VukaTBetHistory} from "../utils/type.ts";

const STARTING_BALANCE = 1000;
const FULL_CROSS_HOLD_MS = 3000;

export type ChickenAnim = "idle" | "walk" | "die" | "cashout";
export type RoundStatus = "IDLE" | "PROGRESS" | "LOST" | "CASHOUT";

interface GameStore {
    balance: number;
    currentBet: number;
    difficulty: Difficulty;
    odds: number[];
    currentLane: number;
    bestMultiplier: number;
    winnings: number;
    isBetPlaced: boolean;
    status: RoundStatus;
    chickenAnim: ChickenAnim;
    lives: number;
    isMuted: boolean;
    showWinPopup: boolean;
    history: VukaTBetHistory[];
    autoCashOutLane: number | null;
    reachedFinish: boolean;

    setBet: (amount: number) => void;
    setDifficulty: (difficulty: Difficulty) => void;
    setAutoCashOutLane: (lane: number | null) => void;
    toggleMute: () => void;
    startGame: () => void;
    advanceLane: (laneIndex: number) => void;
    cashOut: () => void;
    registerHit: () => void;
    finishDeathAnim: () => void;
    dismissWinPopup: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    balance: STARTING_BALANCE,
    currentBet: 20,
    difficulty: "MEDIUM",
    odds: generateOdds("MEDIUM"),
    currentLane: 0,
    bestMultiplier: 0,
    winnings: 0,
    isBetPlaced: false,
    status: "IDLE",
    chickenAnim: "idle",
    lives: 1,
    isMuted: false,
    showWinPopup: false,
    history: [],
    autoCashOutLane: null,
    reachedFinish: false,

    setBet: (amount) => {
        if (get().isBetPlaced || amount < 1) return;
        set({currentBet: amount});
    },

    setDifficulty: (difficulty) => {
        if (get().isBetPlaced) return;
        set({difficulty, odds: generateOdds(difficulty)});
    },

    setAutoCashOutLane: (lane) => {
        if (get().isBetPlaced) return;
        const clamped = lane === null ? null : Math.min(Math.max(lane, 1), TOTAL_PLAYABLE_LANES);
        set({autoCashOutLane: clamped});
    },

    toggleMute: () => set(state => ({isMuted: !state.isMuted})),

    startGame: () => {
        const {isBetPlaced, balance, currentBet, difficulty} = get();
        if (isBetPlaced || balance < currentBet) return;
        set({
            balance: balance - currentBet,
            odds: generateOdds(difficulty),
            currentLane: 0,
            bestMultiplier: 0,
            winnings: 0,
            status: "PROGRESS",
            chickenAnim: "walk",
            isBetPlaced: true,
            reachedFinish: false,
        });
    },

    advanceLane: (laneIndex) => {
        const {odds, currentBet, isBetPlaced, autoCashOutLane} = get();
        if (!isBetPlaced || laneIndex < 1) return;
        const odd = odds[laneIndex - 1] ?? 1;
        const winnings = Math.round(currentBet * odd * 100) / 100;
        set(state => ({
            currentLane: laneIndex,
            winnings,
            bestMultiplier: Math.max(state.bestMultiplier, odd),
            chickenAnim: "walk",
        }));
        if (laneIndex === TOTAL_PLAYABLE_LANES) {
            // Full crossing — park the chicken on the far pavement (past the
            // last highway lane, see ChickenController's reachedFinish
            // handling) and hold it there before the usual cashOut() snaps
            // currentLane back to 0.
            set({reachedFinish: true});
            setTimeout(() => get().cashOut(), FULL_CROSS_HOLD_MS);
        } else if (laneIndex === autoCashOutLane) {
            get().cashOut();
        }
    },

    cashOut: () => {
        const {winnings, isBetPlaced, bestMultiplier, balance} = get();
        if (!isBetPlaced || winnings <= 0) return;
        set(state => ({
            balance: balance + winnings,
            status: "CASHOUT",
            isBetPlaced: false,
            chickenAnim: "cashout",
            showWinPopup: true,
            currentLane: 0,
            reachedFinish: false,
            history: [{Multiplier: bestMultiplier.toFixed(2), WinAmount: winnings.toFixed(2)}, ...state.history],
        }));
    },

    registerHit: () => {
        const {isBetPlaced, bestMultiplier} = get();
        if (!isBetPlaced) return;
        set(state => ({
            isBetPlaced: false,
            status: "LOST",
            chickenAnim: "die",
            history: [{Multiplier: bestMultiplier.toFixed(2), WinAmount: "0.00"}, ...state.history],
        }));
    },

    finishDeathAnim: () => {
        set({currentLane: 0, winnings: 0, chickenAnim: "idle", status: "IDLE"});
    },

    dismissWinPopup: () => set({showWinPopup: false, winnings: 0, chickenAnim: "idle", status: "IDLE"}),
}));
