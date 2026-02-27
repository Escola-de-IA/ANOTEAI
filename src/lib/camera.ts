import { Camera } from '@/types/board';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4.0;
export const GRID_SIZE = 20;

export const screenToWorld = (sx: number, sy: number, cam: Camera) => ({
  x: sx / cam.scale + cam.x,
  y: sy / cam.scale + cam.y,
});

export const worldToScreen = (wx: number, wy: number, cam: Camera) => ({
  x: (wx - cam.x) * cam.scale,
  y: (wy - cam.y) * cam.scale,
});

export const zoomAt = (cam: Camera, sx: number, sy: number, delta: number): Camera => {
  const factor = delta > 0 ? 0.92 : 1.08;
  const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cam.scale * factor));
  const wx = sx / cam.scale + cam.x;
  const wy = sy / cam.scale + cam.y;
  return {
    x: wx - sx / newScale,
    y: wy - sy / newScale,
    scale: newScale,
  };
};

export const snapToGrid = (val: number, gridSize: number = GRID_SIZE) =>
  Math.round(val / gridSize) * gridSize;
