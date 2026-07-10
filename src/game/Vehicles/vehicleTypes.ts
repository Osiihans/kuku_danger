// GLB models reference their colormap texture by relative URI ("Textures/colormap.png")
// baked into the glTF JSON — not embedded. Vite's ?url import only hashes the .glb
// itself and can't rewrite that internal reference, so a bundled import 404s the
// texture in prod. Serving from public/ keeps paths unhashed and relative lookups intact.
const CAR_KIT = "/car_kit/Models/GLB format";
const sedanUrl = `${CAR_KIT}/sedan.glb`;
const suvUrl = `${CAR_KIT}/suv.glb`;
const taxiUrl = `${CAR_KIT}/taxi.glb`;
const policeUrl = `${CAR_KIT}/police.glb`;
const truckUrl = `${CAR_KIT}/truck.glb`;
const garbageTruckUrl = `${CAR_KIT}/garbage-truck.glb`;
const ambulanceUrl = `${CAR_KIT}/ambulance.glb`;
const vanUrl = `${CAR_KIT}/van.glb`;
const kartUrl = `${CAR_KIT}/kart-oobi.glb`;

export interface VehicleTypeDef {
    key: string;
    modelUrl: string;
    // Approximate collision half-extents — the Kenney kit doesn't ship
    // per-model bounding data, so these are hand-tuned per type, not derived
    // from the GLB itself.
    length: number;
    width: number;
    scale: number;
    roofLight?: "police" | "ambulance";
}

// Kenney "Car Kit" (kenney.nl/assets) has no bus or motorbike model — "bus" and
// "truck" both map to its two largest rigs (truck.glb / garbage-truck.glb) for
// silhouette variety, and "motorbike" maps to its smallest kart (kart-oobi.glb)
// as the closest single-seat stand-in. Swap any mapping by changing the url
// import above; VehicleModel doesn't need to change.
export const VEHICLE_TYPES: VehicleTypeDef[] = [
    {key: "sedan", modelUrl: sedanUrl, length: 1.9, width: 0.95, scale: 1},
    {key: "suv", modelUrl: suvUrl, length: 2.1, width: 1.05, scale: 1},
    {key: "taxi", modelUrl: taxiUrl, length: 1.9, width: 0.95, scale: 1},
    {key: "police", modelUrl: policeUrl, length: 1.95, width: 0.98, scale: 1, roofLight: "police"},
    {key: "bus", modelUrl: truckUrl, length: 3, width: 1.1, scale: 1.15},
    {key: "truck", modelUrl: garbageTruckUrl, length: 3, width: 1.1, scale: 1.1},
    {key: "ambulance", modelUrl: ambulanceUrl, length: 2.3, width: 1.05, scale: 1, roofLight: "ambulance"},
    {key: "van", modelUrl: vanUrl, length: 2.2, width: 1.0, scale: 1},
    {key: "motorbike", modelUrl: kartUrl, length: 1.1, width: 0.5, scale: 0.7},
];

export const randomVehicleType = (): VehicleTypeDef =>
    VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
