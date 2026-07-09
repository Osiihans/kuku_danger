import {useEffect} from "react";
import {useGameStore} from "../state/useGameStore.ts";

// Matches how long ChickenController's damp(rate 6) takes to visually settle
// one LANE_DEPTH(4) step within ARRIVE_EPSILON(0.05) — see roadConfig.ts.
const STEP_MS = 750;

export const useAutoAdvance = () => {
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const currentLane = useGameStore(s => s.currentLane);
    const autoCashOutLane = useGameStore(s => s.autoCashOutLane);
    const advanceLane = useGameStore(s => s.advanceLane);

    useEffect(() => {
        if (!isBetPlaced || autoCashOutLane === null || currentLane >= autoCashOutLane) return;
        const timer = setTimeout(() => advanceLane(currentLane + 1), STEP_MS);
        return () => clearTimeout(timer);
    }, [isBetPlaced, currentLane, autoCashOutLane, advanceLane]);
};
