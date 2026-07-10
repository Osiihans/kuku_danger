import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {Text} from "@react-three/drei";
import * as THREE from "three";
import {TOTAL_PLAYABLE_LANES} from "../../utils/gameMath.ts";
import {useGameStore} from "../../state/useGameStore.ts";
import {LANE_DEPTH, ROAD_HALF_WIDTH, laneCenterZ, IDLE_Z, FINISH_Z, CHICKEN_VISUAL_X} from "./roadConfig.ts";

const CoinMarker = ({laneIndex}: {laneIndex: number}) => {
    const currentLane = useGameStore(s => s.currentLane);
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const odds = useGameStore(s => s.odds);
    const advanceLane = useGameStore(s => s.advanceLane);
    const mesh = useRef<THREE.Mesh>(null);

    const passed = laneIndex <= currentLane;
    const isNext = isBetPlaced && laneIndex === currentLane + 1;

    useFrame(({clock}, delta) => {
        if (!mesh.current) return;
        if (!isNext) {
            mesh.current.scale.setScalar(1);
            return;
        }
        // Shiny-gem treatment for the one coin that's actually clickable —
        // scale and glow breathe on the same sine so the pulse reads as one
        // motion, plus a slow spin to catch facet highlights as it turns.
        const pulse = Math.sin(clock.elapsedTime * 5);
        mesh.current.scale.setScalar(1 + pulse * 0.12);
        mesh.current.rotation.y += delta * 0.8;
        const material = mesh.current.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = 1.1 + pulse * 0.4;
    });

    if (passed) return null;

    const handleClick = (e: {stopPropagation: () => void}) => {
        e.stopPropagation();
        if (isNext) advanceLane(laneIndex);
    };
    const handlePointerOver = () => isNext && (document.body.style.cursor = "pointer");
    const handlePointerOut = () => (document.body.style.cursor = "auto");

    return (
        <group position={[CHICKEN_VISUAL_X, 0.02, laneCenterZ(laneIndex)]}>
            {/* Invisible hit target spanning the full lane strip — the visible
                coin disc (0.64 diameter) was the only clickable area before,
                far too small a tap target on a phone screen. */}
            <mesh
                position={[0, -0.1, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <planeGeometry args={[ROAD_HALF_WIDTH * 2, LANE_DEPTH]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh
                ref={mesh}
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                {/* Faceted gem shape (was a flat coin cylinder) — octahedron
                    gives it distinct cut faces so the shine/pulse actually
                    reads as a gem catching light rather than a glowing disc.
                    Radius 0.29 (0.24 * 1.2 bump) — gem+text top still sits
                    under the chicken's ~0.95 world-unit height. */}
                <octahedronGeometry args={[0.29]} />
                <meshPhysicalMaterial
                    color={isNext ? "#FFC83D" : "#766CFF"}
                    emissive={isNext ? "#FFC83D" : "#766CFF"}
                    emissiveIntensity={isNext ? 1.1 : 0.35}
                    metalness={0.35}
                    roughness={0.15}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>
            {/* Text's face-normal defaults to local +Z; -90° around Y points it
                along world +X, matching the cars' travel direction (all lanes
                drive +X — see useVehicleSpawner). */}
            <Text
                // Gem (octahedronGeometry(0.29)) spans y -0.29..0.29 — sit
                // the text's bottom edge just above its top vertex. Values
                // are the prior 0.3/0.4/0.018 each bumped 20%.
                position={[0, 0.36, 0]}
                rotation={[0, -Math.PI / 2, 0]}
                fontSize={0.48}
                color="#FFFFFF"
                outlineWidth={0.022}
                outlineColor="#000000"
                anchorX="center"
                anchorY="bottom"
            >
                {odds[laneIndex - 1]?.toFixed(2)}x
            </Text>
        </group>
    );
};

// Fixed spacing (not a fixed count) so dash density stays constant no matter
// how long ROAD_HALF_WIDTH makes the road — a hardcoded count of 5 only
// looked right at the old, shorter road length.
const DASH_SPACING = 2.5;
const DASH_COUNT = Math.ceil((ROAD_HALF_WIDTH * 2) / DASH_SPACING);

const RoadLane = ({laneIndex}: {laneIndex: number}) => (
    <group position={[0, 0, laneCenterZ(laneIndex)]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[ROAD_HALF_WIDTH * 2, LANE_DEPTH]} />
            <meshStandardMaterial color="#1D2735" roughness={0.95} />
        </mesh>
        {laneIndex < TOTAL_PLAYABLE_LANES &&
            Array.from({length: DASH_COUNT}).map((_, i) => (
                <mesh
                    key={i}
                    position={[-ROAD_HALF_WIDTH + i * DASH_SPACING, 0.01, LANE_DEPTH / 2]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <planeGeometry args={[0.5, 0.08]} />
                    <meshStandardMaterial color="#FFFFFF" transparent opacity={0.35} />
                </mesh>
            ))}
    </group>
);

const Sidewalk = ({z, width}: {z: number; width: number}) => (
    <group position={[0, 0, z]}>
        {/* Top face flush with y=0 (road level, where the chicken's feet
            sit) — recessed downward instead of raised, so it doesn't bury
            the chicken while it's waiting or has finished crossing. */}
        <mesh receiveShadow position={[0, -0.1, 0]}>
            <boxGeometry args={[ROAD_HALF_WIDTH * 2 + 1, 0.2, width]} />
            <meshStandardMaterial color="#2A3B52" roughness={0.9} />
        </mesh>
        <mesh receiveShadow position={[ROAD_HALF_WIDTH + 1.5, 0, 0]}>
            <boxGeometry args={[3, 0.05, width]} />
            <meshStandardMaterial color="#123018" roughness={1} />
        </mesh>
        <mesh receiveShadow position={[-ROAD_HALF_WIDTH - 1.5, 0, 0]}>
            <boxGeometry args={[3, 0.05, width]} />
            <meshStandardMaterial color="#123018" roughness={1} />
        </mesh>
    </group>
);

export const Road = () => {
    return (
        <group>
            <Sidewalk z={IDLE_Z} width={LANE_DEPTH} />
            <Sidewalk z={FINISH_Z} width={LANE_DEPTH} />

            {Array.from({length: TOTAL_PLAYABLE_LANES}, (_, i) => (
                <RoadLane key={i} laneIndex={i + 1} />
            ))}

            {Array.from({length: TOTAL_PLAYABLE_LANES}, (_, i) => (
                <CoinMarker key={i} laneIndex={i + 1} />
            ))}
        </group>
    );
};
