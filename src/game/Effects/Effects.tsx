import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {Sparkles} from "@react-three/drei";
import * as THREE from "three";
import {useGameStore} from "../../state/useGameStore.ts";
import {chickenTransform} from "../Chicken/chickenTransform.ts";
import {CHICKEN_VISUAL_X} from "../Road/roadConfig.ts";

// Lightweight particle layer using drei's <Sparkles> (instanced points under the
// hood) instead of a hand-rolled particle system — dust while walking, a green
// confetti-style burst on cash out, an orange/red burst on death.
export const Effects = () => {
    const group = useRef<THREE.Group>(null);
    const chickenAnim = useGameStore(s => s.chickenAnim);

    useFrame(() => {
        if (!group.current) return;
        group.current.position.set(CHICKEN_VISUAL_X, 0.4, chickenTransform.z);
    });

    return (
        <group ref={group}>
            {chickenAnim === "walk" && (
                <Sparkles count={12} scale={[0.6, 0.2, 0.6]} size={2} speed={0.4} color="#EAF2FF" opacity={0.5} />
            )}
            {chickenAnim === "cashout" && (
                <Sparkles count={60} scale={[1.6, 1.6, 1.6]} size={4} speed={1.2} color="#31FF5B" />
            )}
            {chickenAnim === "die" && (
                <Sparkles count={45} scale={[1.4, 1, 1.4]} size={5} speed={1.6} color="#FF4D5A" />
            )}
        </group>
    );
};
