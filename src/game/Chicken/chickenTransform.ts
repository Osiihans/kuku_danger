// Mutable singleton updated every frame by ChickenController and read every frame
// by VehicleManager for collision checks and FollowCamera for tracking.
// Avoids passing a ref through the R3F tree or triggering React re-renders at 60fps.
export const chickenTransform = {x: 0, z: 0};
