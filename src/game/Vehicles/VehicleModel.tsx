import {useMemo} from "react";
import {useGLTF} from "@react-three/drei";
import * as THREE from "three";
import {VEHICLE_TYPES, type VehicleTypeDef} from "./vehicleTypes.ts";

// Kenney "Car Kit" models face -Z by default. Vehicles here travel along
// local +X once rotated by `direction` below, so this constant re-aligns the
// model's nose onto +X. If cars render sideways or backwards, this is the one
// knob to change — try 0, Math.PI/2, -Math.PI/2, or Math.PI.
const MODEL_YAW_OFFSET = Math.PI / 2;

interface VehicleModelProps {
    type: VehicleTypeDef;
    direction: 1 | -1;
}

export const VehicleModel = ({type, direction}: VehicleModelProps) => {
    const {modelUrl, scale, length, roofLight} = type;
    const {scene} = useGLTF(modelUrl);

    // GLTF scenes are shared/cached by useGLTF — clone per instance so the
    // same vehicle type can appear in multiple lanes at once without fighting
    // over a single parent. Static (unrigged) props, so a plain deep clone is
    // safe — no skeleton bindings to re-wire.
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

    return (
        <group rotation={[0, (direction > 0 ? 0 : Math.PI) + MODEL_YAW_OFFSET, 0]} scale={scale}>
            <primitive object={cloned} />
            {roofLight && (
                <mesh position={[0, 1.1, 0]}>
                    <boxGeometry args={[length * 0.2, 0.08, 0.4]} />
                    <meshStandardMaterial
                        color={roofLight === "police" ? "#FF4D5A" : "#31FF5B"}
                        emissive={roofLight === "police" ? "#FF4D5A" : "#31FF5B"}
                        emissiveIntensity={1.4}
                    />
                </mesh>
            )}
        </group>
    );
};

VEHICLE_TYPES.forEach(t => useGLTF.preload(t.modelUrl));
