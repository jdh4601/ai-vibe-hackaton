// Non-reactive pose overrides written by EndingStage and read by Npc every frame.
// While an NPC id is in `poses`, the NPC is "staged": its collider is removed and it follows this pose.
export interface StagedPose {
  x: number;
  z: number;
  rotationY: number;
}

export const npcStage: { poses: Map<string, StagedPose> } = { poses: new Map() };
