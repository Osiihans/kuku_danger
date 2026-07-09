export interface AABB {
    x: number;
    z: number;
    halfWidth: number;
    halfDepth: number;
}

export const intersects = (a: AABB, b: AABB): boolean =>
    Math.abs(a.x - b.x) < a.halfWidth + b.halfWidth &&
    Math.abs(a.z - b.z) < a.halfDepth + b.halfDepth;
