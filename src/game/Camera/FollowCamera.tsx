import {useRef} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {chickenTransform} from "../Chicken/chickenTransform.ts";
import {IDLE_Z, FINISH_Z} from "../Road/roadConfig.ts";

// Camera sits off to the side along world X and looks back along -X, so the
// chicken's lane-advance axis (world Z, driven by coin clicks) reads as
// screen left-right — tapping the next coin visibly moves the chicken across
// the highway instead of into the distance.
// Distance (X magnitude) sets how many lanes fit on screen: visible width
// along Z ≈ 2·D·tan(fov/2), and apparent object size scales with 1/D. Pulled
// closer than the previous D=17 (paired with a wider fov in GameScene.tsx)
// so vehicles/chicken read bigger while still keeping ~3 lanes on screen.
// Y=10.2 gave a ~34.7° downward pitch — steeper than the camera's own
// half-FOV (65/2=32.5°), so the true horizontal/vanishing-point direction
// sat just outside the top of frame and the road could never actually
// converge to a point on screen; it read as "elevated" no matter how well
// the fog/background matched. Lowered in three 15% steps (8 → 6.8 → 5.78,
// now ~19.4° pitch) per follow-up requests — each step trades some of the
// steep top-down read for a flatter, more-open-horizon look.
const OFFSET = new THREE.Vector3(-14, 5.78, 0);

// Screen-space horizontal = world Z, and the camera used to center exactly
// on the chicken — near the start, half the frame showed empty void past the
// sidewalk instead of road. Biasing both the camera and its look target
// forward (+Z, the direction of travel) shifts that dead space out and
// reveals more upcoming lanes instead. One lane's worth (LANE_DEPTH).
const LOOK_AHEAD = 4;

// Intro sequence on load: a sweep from FINISH_Z back to IDLE_Z at the
// normal gameplay OFFSET/height — a flythrough of just the lanes the
// chicken has to cross (no elevated whole-scene overview), ending exactly
// at the chicken's real start position (IDLE_Z) so the per-frame follow
// lerp below picks up with zero jump.
// Exported so GameScene.tsx's initial <Canvas camera> can start here too —
// same reason OFFSET used to need to match it: avoids a pop on first frame.
const SWEEP_DURATION = 2.2;
export const INTRO_DURATION = SWEEP_DURATION;
export const INTRO_POSITION = new THREE.Vector3(OFFSET.x, OFFSET.y, FINISH_Z + OFFSET.z + LOOK_AHEAD);
const INTRO_LOOK = new THREE.Vector3(0, 0.5, FINISH_Z + LOOK_AHEAD);

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const FollowCamera = () => {
    const {camera} = useThree();
    const lookTarget = useRef(new THREE.Vector3(INTRO_LOOK.x, INTRO_LOOK.y, INTRO_LOOK.z));
    const elapsed = useRef(0);

    useFrame((_, delta) => {
        elapsed.current += delta;

        if (elapsed.current < INTRO_DURATION) {
            const t = smoothstep(elapsed.current / SWEEP_DURATION);
            const sweepZ = THREE.MathUtils.lerp(FINISH_Z, IDLE_Z, t);
            camera.position.set(OFFSET.x, OFFSET.y, sweepZ + OFFSET.z + LOOK_AHEAD);
            lookTarget.current.set(0, 0.5, sweepZ + LOOK_AHEAD);
            camera.lookAt(lookTarget.current);
            return;
        }

        const targetPos = new THREE.Vector3(
            chickenTransform.x + OFFSET.x,
            OFFSET.y,
            chickenTransform.z + OFFSET.z + LOOK_AHEAD
        );
        camera.position.lerp(targetPos, 1 - Math.pow(0.001, delta));
        lookTarget.current.lerp(
            new THREE.Vector3(chickenTransform.x, 0.5, chickenTransform.z + LOOK_AHEAD),
            1 - Math.pow(0.001, delta)
        );
        camera.lookAt(lookTarget.current);
    });

    return null;
};
