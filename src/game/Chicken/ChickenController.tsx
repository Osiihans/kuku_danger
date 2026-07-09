import {useRef, useEffect} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {ChickenModel} from "./ChickenModel.tsx";
import {chickenTransform} from "./chickenTransform.ts";
import {useGameStore} from "../../state/useGameStore.ts";
import {CHICKEN_X, CHICKEN_VISUAL_X, FINISH_Z, laneIndexZ} from "../Road/roadConfig.ts";

const ARRIVE_EPSILON = 0.05;

export const ChickenController = () => {
    const group = useRef<THREE.Group>(null);
    const currentLane = useGameStore(s => s.currentLane);
    const reachedFinish = useGameStore(s => s.reachedFinish);
    const chickenAnim = useGameStore(s => s.chickenAnim);
    const finishDeathAnim = useGameStore(s => s.finishDeathAnim);
    const movingRef = useRef(false);
    const animRef = useRef(chickenAnim);
    animRef.current = chickenAnim;

    useEffect(() => {
        if (chickenAnim !== "die") return;
        const timer = setTimeout(() => finishDeathAnim(), 1100);
        return () => clearTimeout(timer);
    }, [chickenAnim, finishDeathAnim]);

    useFrame((_, delta) => {
        if (!group.current) return;
        const targetZ = reachedFinish ? FINISH_Z : laneIndexZ(currentLane);
        const z = group.current.position.z;
        const distance = targetZ - z;
        movingRef.current = Math.abs(distance) > ARRIVE_EPSILON && animRef.current !== "die";

        if (movingRef.current) {
            group.current.position.z = THREE.MathUtils.damp(z, targetZ, 6, delta);
        }

        chickenTransform.x = CHICKEN_X;
        chickenTransform.z = group.current.position.z;
    });

    const effectiveAnim = chickenAnim === "die" ? "die" : chickenAnim === "cashout" ? "cashout" : movingRef.current ? "walk" : "idle";

    return (
        <group ref={group} position={[CHICKEN_VISUAL_X, 0, laneIndexZ(0)]}>
            <ChickenModel anim={effectiveAnim} />
        </group>
    );
};
