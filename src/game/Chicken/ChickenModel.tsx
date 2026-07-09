import {useMemo, useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {useGLTF} from "@react-three/drei";
import * as THREE from "three";
import type {ChickenAnim} from "../../state/useGameStore.ts";
import chickenUrl from "../../assets/chicken/Chicken.glb?url";

export {chickenUrl};

// Real GLB model (static/unrigged — no animation clips baked in), so motion
// is procedural on the wrapping group, same approach as VehicleModel.
// The source mesh is authored ~190 world-units tall; this scene uses ~1 unit
// per meter, so it needs a heavy downscale to read as a chicken instead of
// rendering off past the camera's far plane.
const SCALE = 0.005;
// Mesh's comb/eyes cluster near local x=-60 (inside the body's -87..+3.6
// range), with eyes mirrored across z — so the beak/front points local -X,
// tail is +X, and z is the model's left-right axis. Rotating +90° puts the
// front on world +Z, the chicken's direction of travel. If it's still facing
// wrong, this is the one knob — try -Math.PI/2 or Math.PI next.
const MODEL_YAW_OFFSET = Math.PI / 2;

interface ChickenModelProps {
    anim: ChickenAnim;
}

export const ChickenModel = ({anim}: ChickenModelProps) => {
    const group = useRef<THREE.Group>(null);
    const body = useRef<THREE.Group>(null);
    const clock = useRef(0);

    const {scene} = useGLTF(chickenUrl);
    const cloned = useMemo(() => {
        const clone = scene.clone(true);
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clone;
    }, [scene]);

    useFrame((_, delta) => {
        clock.current += delta;
        if (!group.current || !body.current) return;

        if (anim === "die") {
            body.current.rotation.z = THREE.MathUtils.lerp(body.current.rotation.z, Math.PI / 2, delta * 6);
            body.current.position.y = THREE.MathUtils.lerp(body.current.position.y, 0, delta * 6);
            return;
        }

        body.current.rotation.z = THREE.MathUtils.lerp(body.current.rotation.z, 0, delta * 8);

        if (anim === "walk") {
            body.current.position.y = Math.abs(Math.sin(clock.current * 12)) * 0.15;
            body.current.rotation.y = MODEL_YAW_OFFSET + Math.sin(clock.current * 12) * 0.15;
        } else if (anim === "cashout") {
            body.current.position.y = Math.abs(Math.sin(clock.current * 8)) * 0.35;
            group.current.rotation.y += delta * 4;
        } else {
            body.current.position.y = Math.max(0, Math.sin(clock.current * 2.2) * 0.04);
            body.current.rotation.y = THREE.MathUtils.lerp(body.current.rotation.y, MODEL_YAW_OFFSET, delta * 6);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 6);
        }
    });

    return (
        <group ref={group}>
            {/* GLB's own feet already sit near local y=0 at this scale — no
                base lift needed, only the bob/hop offsets above. */}
            <group ref={body} position={[0, 0, 0]} rotation={[0, MODEL_YAW_OFFSET, 0]} scale={SCALE}>
                <primitive object={cloned} />
            </group>
        </group>
    );
};

useGLTF.preload(chickenUrl);
