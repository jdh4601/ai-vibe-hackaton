import type { Vec3 } from '../game/types';

// Full-rate player pose for world actors (NPC facing, professor chase, camera).
// usePlayerStore.position is only written at PLAYER_POSE_HZ; this is updated every frame by Player.
export const playerLive: { position: Vec3; heading: number } = {
  position: [0, 0, 0],
  heading: 0,
};

// Third-person camera orbit state, shared so the ending stage can take over smoothly.
export const cameraRig = { yaw: 0, pitch: 0.2 };
