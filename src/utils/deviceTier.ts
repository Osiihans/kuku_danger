// Cheap low-end heuristic, computed once at module load — hardware specs
// don't change mid-session, so this doesn't need to be reactive state.
// deviceMemory is Chrome/Android-only (undefined on iOS Safari/Firefox);
// missing values default to "not low-end" rather than degrading quality
// on browsers that just don't report it.
const deviceMemory = (navigator as Navigator & {deviceMemory?: number}).deviceMemory ?? 8;
const cores = navigator.hardwareConcurrency ?? 8;

export const IS_LOW_END_DEVICE = deviceMemory <= 4 || cores <= 4;
