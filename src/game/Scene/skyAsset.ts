// Single source of truth for the sky texture URL so GameScene.tsx and
// App.tsx's splash prefetch share the exact same asset.
import * as THREE from "three";
import skyUrl from "../../assets/sky/skybox2-front.png?url";

export {skyUrl};

// Real TextureLoader decode (not just a raw byte fetch) — mirrors
// Vegetation.tsx's preloadVegetation() so App.tsx's splash Promise.all can
// await actual decode-readiness, matching what SkyBackground itself does via
// useLoader(TextureLoader, skyUrl).
export const preloadSky = async (): Promise<void> => {
    await new THREE.TextureLoader().loadAsync(skyUrl);
};
