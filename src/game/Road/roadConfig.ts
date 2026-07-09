import {TOTAL_PLAYABLE_LANES} from "../../utils/gameMath.ts";

export const LANE_DEPTH = 4;
// World X is the camera's depth axis (camera sits at chickenX-14, looking
// +X — see FollowCamera). Vehicles travel along this same axis, and their
// wrap-around bound is ROAD_HALF_WIDTH+SPAWN_MARGIN (VehicleManager). At the
// old value (5) both wrap edges sat inside the visible/lightly-fogged
// frustum, so cars visibly popped. 15 pushes the near wrap point behind the
// camera (depth 14-16.5=-2.5, culled) and the far wrap point deep into fog
// (see GameScene fog range) — wrap happens off-screen, and the longer travel
// distance gives a stronger near-big/far-small perspective falloff.
export const ROAD_HALF_WIDTH = 15;
export const CHICKEN_X = 0;
// Render-only depth offset for the chicken mesh and coin markers — NOT used
// for chickenTransform.x (camera tracking / vehicle collision, which stay at
// CHICKEN_X=0). The first lane dash sits at X=-15, right where cars exit
// (X=-16.5) — both behind the camera's near-clip plane at the current
// OFFSET, so literally matching that X would make the chicken invisible.
// -10 is the closest depth to that zone that's still in front of the camera.
export const CHICKEN_VISUAL_X = -6;
export const IDLE_Z = -LANE_DEPTH / 2;
export const FINISH_Z = TOTAL_PLAYABLE_LANES * LANE_DEPTH + LANE_DEPTH / 2;

// The roadside treeline (Vegetation.tsx) and its streetlights (Road.tsx)
// share this row so the lights actually land next to the trees instead of
// each file guessing its own placement.
export const TREE_ROW_Z = IDLE_Z - LANE_DEPTH / 2 - 2;
// Mirror row behind the FINISH_Z sidewalk — the far end of the road had no
// treeline, only the IDLE_Z (start) side did.
export const FAR_TREE_ROW_Z = FINISH_Z + LANE_DEPTH / 2 + 2;
export const TREE_X_SPREAD = ROAD_HALF_WIDTH * 0.9;

export const laneCenterZ = (laneIndex: number): number => (laneIndex - 0.5) * LANE_DEPTH;

export const laneIndexZ = (laneIndex: number): number =>
    laneIndex <= 0 ? IDLE_Z : laneIndex > TOTAL_PLAYABLE_LANES ? FINISH_Z : laneCenterZ(laneIndex);
