import {Suspense, useMemo} from "react";
import {Canvas, useLoader} from "@react-three/fiber";
import {EffectComposer, Bloom} from "@react-three/postprocessing";
import * as THREE from "three";
import {Road} from "../Road/Road.tsx";
import {VehicleManager} from "../Vehicles/VehicleManager.tsx";
import {ChickenController} from "../Chicken/ChickenController.tsx";
import {FollowCamera, INTRO_POSITION} from "../Camera/FollowCamera.tsx";
import {Effects} from "../Effects/Effects.tsx";
import {Vegetation} from "../Environment/Vegetation.tsx";
import {IS_LOW_END_DEVICE} from "../../utils/deviceTier.ts";
// skybox2.png ships as a 4x3 horizontal-cross cubemap sheet (six faces in
// one image, same layout as the earlier skybox.png), not a flat photo —
// skybox2-front.png is a one-time crop of just the front face (PowerShell
// crop: face = sheet size / (4,3), offset (1,1)) — the only face needed
// since the camera never rotates.
import {skyUrl} from "./skyAsset.ts";

// Exported so App.tsx's splash-screen loader can fetch this URL up front,
// same as the vehicle/chicken GLBs — avoids a pop-in the moment the canvas
// mounts.
export {skyUrl};

// Warms @react-three/fiber's own suspense cache (keyed by [Loader, url]) —
// without this, the first real useLoader call below only fires once
// SkyBackground renders, i.e. exactly when the scene needs to appear.
useLoader.preload(THREE.TextureLoader, skyUrl);

// Sampled from skybox2-front.png's lower haze band — same tint the
// ground's <fog> converges to (GameScene's fog args below).
const HORIZON_TINT = "244,244,242";

// THREE.Fog only fades materials in the 3D scene — it never touches
// scene.background, which always renders at full, unfaded brightness. So a
// raw sky photo shows its own (different) colors right where the fogged
// ground meets it, reading as a seam. Fix: bake a fade to HORIZON_TINT
// directly into the texture's lower half via canvas, so the background's
// own bottom edge already matches what the ground fades to.
//
// The background's fade zone and the 3D fog's near/far range live in two
// unrelated coordinate systems (image-height percent vs. camera-space
// depth) — there's no single fadeStart value that lines up exactly with
// wherever the ground's fog happens to finish on screen, and that screen
// row moves whenever camera pitch/height is retuned (FollowCamera.tsx).
// Starting the fade much earlier/more gradually (0.15 instead of a late,
// sharp 0.5) means most of the lower image is already blending well before
// it needs to visually agree with anything — a slow gradient hides
// misalignment that a late, steep one would show as a hard band.
const SkyBackground = () => {
    const texture = useLoader(THREE.TextureLoader, skyUrl);
    const blended = useMemo(() => {
        const img = texture.image as HTMLImageElement;
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const fadeStart = img.height * 0.15;
        const gradient = ctx.createLinearGradient(0, fadeStart, 0, img.height);
        gradient.addColorStop(0, `rgba(${HORIZON_TINT},0)`);
        gradient.addColorStop(1, `rgba(${HORIZON_TINT},1)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, fadeStart, img.width, img.height - fadeStart);
        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        return canvasTexture;
    }, [texture]);
    return <primitive attach="background" object={blended} />;
};

export const GameScene = () => {
    // Wider fov exaggerates perspective foreshortening on the road's
    // parallel edges (they extend along X, the depth axis), giving a
    // visible convergence toward a vanishing point in the distance.
    // Initial position matches FollowCamera's INTRO_POSITION (the intro
    // establishing shot) rather than its gameplay OFFSET — otherwise there's
    // a visible pop from the gameplay position to the intro shot on frame 1.
    return (
        <Canvas
            shadows={IS_LOW_END_DEVICE ? false : "percentage"}
            dpr={IS_LOW_END_DEVICE ? 1 : [1, 1.5]}
            camera={{position: INTRO_POSITION.toArray(), fov: 65, near: 0.1, far: 150}}
        >
            {/* far=29 sits exactly on the road/ground plane's physical edge
                (depth = ROAD_HALF_WIDTH(15) - cameraX(-14) = 29). User opted
                to push past the previously-tuned safe floor (19/27, ~2 unit
                buffer) for lighter fog, accepting the edge may start to peek
                through again — if that seam returns, either back off toward
                19/27 or extend Road.tsx's ground geometry past depth 29 to
                decouple fog amount from hiding the edge entirely. Color
                matches HORIZON_TINT (SkyBackground's fade target above) so
                the two always agree regardless of screen position. */}
            <fog attach="fog" args={["#F4F4F2", 21, 28]} />
            <hemisphereLight args={["#3A4A6E", "#0B0E14", 1.1]} />
            <ambientLight intensity={0.65} />
            <directionalLight
                position={[6, 10, -4]}
                intensity={2}
                color="#CFE0FF"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-18}
                shadow-camera-right={18}
                shadow-camera-top={18}
                shadow-camera-bottom={-18}
            />
            {/* Fill light from the opposite side — the single directional
                light left the vegetation's far/shadow side reading flat black. */}
            <pointLight position={[-8, 6, 8]} intensity={1.2} color="#FFE9C4" distance={30} />
            {/* Cars spawn direction=-1, entering far/fogged at the positive-X
                end (depth ~30.5 — see roadConfig.ts/useVehicleSpawner.ts) and
                drive toward the viewer. Lighting that zone so they're visibly
                lit as they emerge from the fog instead of appearing as dark
                shapes. Z centered across the lane band. */}
            <pointLight position={[20, 8, 20]} intensity={2.5} color="#EAF2FF" distance={35} />

            <Suspense fallback={null}>
                <SkyBackground />
                <Road />
                <Vegetation />
                <VehicleManager />
                <ChickenController />
                <Effects />
            </Suspense>

            <FollowCamera />

            {/* Extra render pass — real per-frame GPU cost, not just a
                download-size one. Skipped on low-end devices. */}
            {!IS_LOW_END_DEVICE && (
                <EffectComposer>
                    <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={0.6} mipmapBlur />
                </EffectComposer>
            )}
        </Canvas>
    );
};
