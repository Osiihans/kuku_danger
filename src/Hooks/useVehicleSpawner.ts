import {useMemo} from "react";
import {TOTAL_PLAYABLE_LANES, getVehicleSpeedRange, type Difficulty} from "../utils/gameMath.ts";
import {randomVehicleType, type VehicleTypeDef} from "../game/Vehicles/vehicleTypes.ts";

export interface LaneVehicleConfig {
    laneIndex: number;
    type: VehicleTypeDef;
    direction: 1 | -1;
    baseSpeed: number;
}

// Generates one vehicle spawn config per lane. Re-rolled only when difficulty
// changes (via the `difficulty` key), not every frame — per-frame motion is
// handled imperatively inside VehicleManager's useFrame loop for performance.
export const useVehicleSpawner = (difficulty: Difficulty): LaneVehicleConfig[] => {
    return useMemo(() => {
        const [minSpeed, maxSpeed] = getVehicleSpeedRange(difficulty);
        return Array.from({length: TOTAL_PLAYABLE_LANES}, (_, i) => ({
            laneIndex: i + 1,
            type: randomVehicleType(),
            // Camera sits at world x = chickenX-14 looking toward +X (see
            // FollowCamera), so direction -1 makes cars spawn far/fogged
            // and drive toward the viewer, growing larger as they approach —
            // instead of spawning near-camera and shrinking away.
            direction: -1,
            baseSpeed: minSpeed + Math.random() * (maxSpeed - minSpeed),
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty]);
};
