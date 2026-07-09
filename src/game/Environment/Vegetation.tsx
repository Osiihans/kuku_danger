import {useMemo} from "react";
import {useLoader} from "@react-three/fiber";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";
import {TREE_ROW_Z, FAR_TREE_ROW_Z, TREE_X_SPREAD} from "../Road/roadConfig.ts";
import {IS_LOW_END_DEVICE} from "../../utils/deviceTier.ts";

import treeObj1 from "../../assets/vegetation/Tree_3.obj?url";
import treeMtl1 from "../../assets/vegetation/Tree_3.mtl?url";
import treeObj2 from "../../assets/vegetation/Pine_2.obj?url";
import treeMtl2 from "../../assets/vegetation/Pine_2.mtl?url";
import treeObj3 from "../../assets/vegetation/Birch_4.obj?url";
import treeMtl3 from "../../assets/vegetation/Birch_4.mtl?url";
import treeObj4 from "../../assets/vegetation/DeadTree_2.obj?url";
import treeMtl4 from "../../assets/vegetation/DeadTree_2.mtl?url";
import treeObj5 from "../../assets/vegetation/Tree_7.obj?url";
import treeMtl5 from "../../assets/vegetation/Tree_7.mtl?url";

// Exported so App.tsx's splash-screen loader can fetch these URLs up front
// and gate splash completion on them, instead of only App.tsx's own guess.
export const VARIANTS = [
    {obj: treeObj1, mtl: treeMtl1},
    {obj: treeObj2, mtl: treeMtl2},
    {obj: treeObj3, mtl: treeMtl3},
    {obj: treeObj4, mtl: treeMtl4},
    {obj: treeObj5, mtl: treeMtl5},
];

// TreeModel below (`useLoader(MTLLoader/OBJLoader, ...)`) only fires when it
// actually renders — after GamePage mounts, inside Suspense — so without
// this, all 5 OBJ+MTL parses happened for the first time exactly when the
// scene needed to appear. useLoader.preload populates the same cache
// TreeModel reads from (keyed by [Loader, url]), so a matching real call
// later resolves instantly instead of re-parsing. It returns void, so we
// track completion separately via our own awaited loadAsync calls.
export const preloadVegetation = async (): Promise<void> => {
    await Promise.all(
        VARIANTS.map(async ({obj, mtl}) => {
            const materials = await new MTLLoader().loadAsync(mtl);
            materials.preload();
            useLoader.preload(MTLLoader, mtl);
            useLoader.preload(OBJLoader, obj, loader => loader.setMaterials(materials));
        }),
    );
};

// Every source MTL ships the same flat placeholder grey (Kd 0.64 0.64 0.64)
// on all materials, meant to be recolored by whatever engine imports it —
// so color by material name instead of trusting the MTL's own Kd.
const colorFor = (name: string): string => {
    if (/leaves/i.test(name)) return "#3D7A3E";
    if (/bark/i.test(name)) return "#5B4636";
    return "#6B6B6B";
};

const recolor = (mat: THREE.Material) => {
    if (mat instanceof THREE.MeshPhongMaterial || mat instanceof THREE.MeshStandardMaterial) {
        mat.color = new THREE.Color(colorFor(mat.name));
    }
};

const TreeModel = ({obj, mtl}: {obj: string; mtl: string}) => {
    const materials = useLoader(MTLLoader, mtl);
    const loaded = useLoader(OBJLoader, obj, loader => {
        materials.preload();
        loader.setMaterials(materials);
    });

    const cloned = useMemo(() => {
        const clone = loaded.clone(true);
        clone.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (Array.isArray(child.material)) {
                    child.material.forEach(recolor);
                } else {
                    recolor(child.material);
                }
            }
        });
        return clone;
    }, [loaded]);

    return <primitive object={cloned} />;
};

interface TreeInstance {
    variant: number;
    x: number;
    z: number;
    scale: number;
    rotationY: number;
}

// Each tree GLB is several sub-meshes (trunk + leaf clusters), so instance
// count directly multiplies draw calls — halved on low-end devices where
// draw-call submission (CPU-bound) is the real bottleneck, not triangle count.
const TREE_COUNT = IS_LOW_END_DEVICE ? 9 : 18;

const makeRow = (rowZ: number, count: number): TreeInstance[] =>
    Array.from({length: count}, () => ({
        variant: Math.floor(Math.random() * VARIANTS.length),
        x: (Math.random() * 2 - 1) * TREE_X_SPREAD,
        z: rowZ + (Math.random() - 0.5) * 2,
        scale: 0.35 + Math.random() * 0.35,
        rotationY: Math.random() * Math.PI * 2,
    }));

export const Vegetation = () => {
    const instances = useMemo<TreeInstance[]>(
        () => [...makeRow(TREE_ROW_Z, TREE_COUNT), ...makeRow(FAR_TREE_ROW_Z, TREE_COUNT)],
        [],
    );

    return (
        <group>
            {/* TREE_ROW_Z/FAR_TREE_ROW_Z sit behind both Sidewalk ground
                strips (Road.tsx) — nothing else renders a floor back there,
                so trees planted at y=0 had no visible ground under them and
                read as floating. Oversized well past the fog/frustum in both
                axes (not just the tight tree spread) so its own edges are
                never visible either — a tightly-fit patch just moved the
                floating-island look from "trees" to "grass". */}
            <mesh receiveShadow position={[0, -0.05, TREE_ROW_Z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[TREE_X_SPREAD * 4, 60]} />
                <meshStandardMaterial color="#123018" roughness={1} />
            </mesh>
            <mesh receiveShadow position={[0, -0.05, FAR_TREE_ROW_Z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[TREE_X_SPREAD * 4, 60]} />
                <meshStandardMaterial color="#123018" roughness={1} />
            </mesh>
            {instances.map((inst, i) => (
                <group key={i} position={[inst.x, 0, inst.z]} rotation={[0, inst.rotationY, 0]} scale={inst.scale}>
                    <TreeModel obj={VARIANTS[inst.variant].obj} mtl={VARIANTS[inst.variant].mtl} />
                </group>
            ))}
        </group>
    );
};
