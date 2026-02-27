import { BoardNode } from '@/types/board';

export const pointInRect = (px: number, py: number, x: number, y: number, w: number, h: number) =>
  px >= x && px <= x + w && py >= y && py <= y + h;

export const pointInEllipse = (px: number, py: number, x: number, y: number, w: number, h: number) => {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  return ((px - cx) ** 2) / (rx ** 2) + ((py - cy) ** 2) / (ry ** 2) <= 1;
};

export const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

export const hitTestNode = (px: number, py: number, node: BoardNode): boolean => {
  if (node.type === 'ellipse') return pointInEllipse(px, py, node.x, node.y, node.w, node.h);
  if (node.type === 'line') {
    return distToSegment(px, py, node.x, node.y, node.x + node.w, node.y + node.h) <= Math.max(node.style.lineWidth * 2, 10);
  }
  return pointInRect(px, py, node.x, node.y, node.w, node.h);
};

export const getNodeCenter = (node: BoardNode): { x: number; y: number } => {
  if (node.type === 'line') return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
};

export const getNodeEdgePoint = (node: BoardNode, px: number, py: number): { x: number; y: number } => {
  // Returns the closest point on the node's edge to (px, py)
  if (node.type === 'ellipse') {
    const cx = node.x + node.w / 2, cy = node.y + node.h / 2;
    const rx = node.w / 2, ry = node.h / 2;
    const angle = Math.atan2(py - cy, px - cx);
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  }
  // For rect/sticky/text: clamp to edge
  const cx = node.x + node.w / 2, cy = node.y + node.h / 2;
  const angle = Math.atan2(py - cy, px - cx);
  const hw = node.w / 2, hh = node.h / 2;
  const absCos = Math.abs(Math.cos(angle)), absSin = Math.abs(Math.sin(angle));
  let dist: number;
  if (absCos * hh > absSin * hw) {
    dist = hw / absCos;
  } else {
    dist = hh / absSin;
  }
  return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
};

export const findSnapTarget = (wx: number, wy: number, nodes: BoardNode[], excludeId: string, snapDist: number = 30): BoardNode | null => {
  let closest: BoardNode | null = null;
  let minDist = snapDist;
  for (const n of nodes) {
    if (n.id === excludeId || n.type === 'line') continue;
    const c = getNodeCenter(n);
    const d = Math.hypot(wx - c.x, wy - c.y);
    if (d < minDist) { minDist = d; closest = n; }
  }
  return closest;
};

export const findNodeAtPoint = (px: number, py: number, nodes: BoardNode[]): BoardNode | null => {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (hitTestNode(px, py, nodes[i])) return nodes[i];
  }
  return null;
};

export const nodesInRect = (rx: number, ry: number, rw: number, rh: number, nodes: BoardNode[]): BoardNode[] => {
  const x1 = Math.min(rx, rx + rw), y1 = Math.min(ry, ry + rh);
  const x2 = Math.max(rx, rx + rw), y2 = Math.max(ry, ry + rh);
  return nodes.filter(n => n.x < x2 && n.x + n.w > x1 && n.y < y2 && n.y + n.h > y1);
};

export const getNodesBounds = (nodes: BoardNode[]) => {
  if (nodes.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach(n => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.w);
    maxY = Math.max(maxY, n.y + n.h);
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
};
