import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {VehicleModel} from "./VehicleModel.tsx";
import {useVehicleSpawner} from "../../Hooks/useVehicleSpawner.ts";
import {useGameStore} from "../../state/useGameStore.ts";
import {laneCenterZ, ROAD_HALF_WIDTH, CHICKEN_VISUAL_X} from "../Road/roadConfig.ts";
import {chickenTransform} from "../Chicken/chickenTransform.ts";
import {intersects} from "../Physics/collision.ts";

const SPAWN_MARGIN = 1.5;

export const VehicleManager = () => {
    const difficulty = useGameStore(s => s.difficulty);
    const configs = useVehicleSpawner(difficulty);
    const groupRefs = useRef<(THREE.Group | null)[]>([]);
    const xRef = useRef<number[]>(configs.map(() => (Math.random() - 0.5) * ROAD_HALF_WIDTH * 2));

    useFrame((_, delta) => {
        const {isBetPlaced, currentLane, chickenAnim, registerHit} = useGameStore.getState();
        const bound = ROAD_HALF_WIDTH + SPAWN_MARGIN;

        configs.forEach((cfg, i) => {
            let x = xRef.current[i] ?? 0;
            x += cfg.direction * cfg.baseSpeed * delta;
            if (x > bound) x = -bound;
            if (x < -bound) x = bound;
            xRef.current[i] = x;

            const group = groupRefs.current[i];
            if (group) group.position.x = x;

            if (isBetPlaced && chickenAnim !== "die" && currentLane === cfg.laneIndex) {
                const laneZ = laneCenterZ(cfg.laneIndex);
                if (Math.abs(chickenTransform.z - laneZ) < 0.6) {
                    const hit = intersects(
                        {x: CHICKEN_VISUAL_X, z: chickenTransform.z, halfWidth: 0.28, halfDepth: 0.28},
                        {x, z: laneZ, halfWidth: cfg.type.length / 2, halfDepth: cfg.type.width / 2}
                    );
                    if (hit) registerHit();
                }
            }
        });
    });

    return (
        <>
            {configs.map((cfg, i) => (
                <group
                    key={cfg.laneIndex}
                    ref={el => {
                        groupRefs.current[i] = el;
                    }}
                    position={[xRef.current[i] ?? 0, 0, laneCenterZ(cfg.laneIndex)]}
                >
                    <VehicleModel type={cfg.type} direction={cfg.direction} />
                </group>
            ))}
        </>
    );
};
