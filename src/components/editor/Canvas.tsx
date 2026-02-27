import { useRef, useCallback, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { screenToWorld, zoomAt } from '@/lib/camera';
import { findNodeAtPoint, nodesInRect, findSnapTarget, getNodeEdgePoint, getNodeCenter } from '@/lib/geometry';
import { Camera, NodeType, ToolType } from '@/types/board';
import NodeRenderer from './NodeRenderer';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type LineEndpoint = 'line-start' | 'line-end';

type Interaction =
  | null
  | { type: 'pan'; startMx: number; startMy: number; startCam: Camera }
  | { type: 'drag'; startWorld: { x: number; y: number }; positions: { id: string; x: number; y: number }[] }
  | { type: 'marquee'; startWorld: { x: number; y: number } }
  | { type: 'resize'; handle: ResizeHandle; nodeId: string; startWorld: { x: number; y: number }; orig: { x: number; y: number; w: number; h: number } }
  | { type: 'draw-line'; nodeId: string }
  | { type: 'line-endpoint'; endpoint: LineEndpoint; nodeId: string; origX: number; origY: number; origW: number; origH: number };

const HANDLE_SIZE = 8;
const HANDLES: { key: ResizeHandle; cursor: string; getPos: (sx: number, sy: number, sw: number, sh: number) => { left: number; top: number } }[] = [
  { key: 'nw', cursor: 'nwse-resize', getPos: (sx, sy) => ({ left: sx - HANDLE_SIZE / 2, top: sy - HANDLE_SIZE / 2 }) },
  { key: 'n', cursor: 'ns-resize', getPos: (sx, sy, sw) => ({ left: sx + sw / 2 - HANDLE_SIZE / 2, top: sy - HANDLE_SIZE / 2 }) },
  { key: 'ne', cursor: 'nesw-resize', getPos: (sx, sy, sw) => ({ left: sx + sw - HANDLE_SIZE / 2, top: sy - HANDLE_SIZE / 2 }) },
  { key: 'e', cursor: 'ew-resize', getPos: (sx, sy, sw, sh) => ({ left: sx + sw - HANDLE_SIZE / 2, top: sy + sh / 2 - HANDLE_SIZE / 2 }) },
  { key: 'se', cursor: 'nwse-resize', getPos: (sx, sy, sw, sh) => ({ left: sx + sw - HANDLE_SIZE / 2, top: sy + sh - HANDLE_SIZE / 2 }) },
  { key: 's', cursor: 'ns-resize', getPos: (sx, sy, sw, sh) => ({ left: sx + sw / 2 - HANDLE_SIZE / 2, top: sy + sh - HANDLE_SIZE / 2 }) },
  { key: 'sw', cursor: 'nesw-resize', getPos: (sx, sy, _sw, sh) => ({ left: sx - HANDLE_SIZE / 2, top: sy + sh - HANDLE_SIZE / 2 }) },
  { key: 'w', cursor: 'ew-resize', getPos: (sx, sy, _sw, sh) => ({ left: sx - HANDLE_SIZE / 2, top: sy + sh / 2 - HANDLE_SIZE / 2 }) },
];

const TOOL_TO_NODE: Partial<Record<ToolType, NodeType>> = {
  sticky: 'sticky', text: 'text', rect: 'rect', ellipse: 'ellipse',
};

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const interRef = useRef<Interaction>(null);
  const spaceRef = useRef(false);
  const cameraRef = useRef(useEditorStore.getState().camera);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const camera = useEditorStore(s => s.camera);
  const nodes = useEditorStore(s => s.nodes);
  const selectedIds = useEditorStore(s => s.selectedIds);
  const activeTool = useEditorStore(s => s.activeTool);
  const editingNodeId = useEditorStore(s => s.editingNodeId);
  const user = useAuthStore(s => s.user);

  cameraRef.current = camera;

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (editingNodeId) return;
      const store = useEditorStore.getState();
      if (e.code === 'Space' && !e.repeat) { spaceRef.current = true; e.preventDefault(); }
      if (e.key === 'Delete' || e.key === 'Backspace') store.deleteSelected();
      if (e.ctrlKey && e.key === 'z') { store.undo(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'y') { store.redo(); e.preventDefault(); }
      if (e.ctrlKey && e.key === 'd') { store.duplicateSelected(); e.preventDefault(); }
      if (e.key === 'v') store.setTool('select');
      if (e.key === 'h') store.setTool('pan');
      if (e.key === 's' && !e.ctrlKey) store.setTool('sticky');
      if (e.key === 't') store.setTool('text');
      if (e.key === 'r') store.setTool('rect');
      if (e.key === 'o') store.setTool('ellipse');
      if (e.key === 'l') store.setTool('line');
      if (e.key === 'e' && !e.ctrlKey) store.setTool('eraser');
      if (e.key === 'Escape') store.clearSelection();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [editingNodeId]);

  // Wheel handler (native for passive:false)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
      if (e.ctrlKey || e.metaKey) {
        useEditorStore.getState().setCamera(zoomAt(cam, sx, sy, e.deltaY));
      } else {
        useEditorStore.getState().setCamera({ ...cam, x: cam.x + e.deltaX / cam.scale, y: cam.y + e.deltaY / cam.scale });
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, cameraRef.current);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const store = useEditorStore.getState();
    const world = getWorldPos(e);

    // Check for resize/line-endpoint handle click
    const target = e.target as HTMLElement;
    const handleAttr = target.getAttribute('data-resize-handle') as ResizeHandle | null;
    const lineEndpoint = target.getAttribute('data-line-endpoint') as LineEndpoint | null;
    const handleNodeId = target.getAttribute('data-node-id');

    if (lineEndpoint && handleNodeId) {
      const node = store.nodes.find(n => n.id === handleNodeId);
      if (node) {
        store.pushHistory();
        interRef.current = {
          type: 'line-endpoint', endpoint: lineEndpoint, nodeId: handleNodeId,
          origX: node.x, origY: node.y, origW: node.w, origH: node.h,
        };
        return;
      }
    }

    if (handleAttr && handleNodeId) {
      const node = store.nodes.find(n => n.id === handleNodeId);
      if (node) {
        store.pushHistory();
        interRef.current = {
          type: 'resize', handle: handleAttr, nodeId: handleNodeId,
          startWorld: world, orig: { x: node.x, y: node.y, w: node.w, h: node.h },
        };
        return;
      }
    }

    if (store.activeTool === 'pan' || spaceRef.current || e.button === 1) {
      interRef.current = { type: 'pan', startMx: e.clientX, startMy: e.clientY, startCam: { ...cameraRef.current } };
      return;
    }

    if (store.activeTool === 'select') {
      const sortedNodes = [...store.nodes].sort((a, b) => b.zIndex - a.zIndex);
      const hit = findNodeAtPoint(world.x, world.y, sortedNodes);
      if (hit) {
        const newSelected = store.selectedIds.includes(hit.id) ? store.selectedIds : (e.shiftKey ? [...store.selectedIds, hit.id] : [hit.id]);
        if (!store.selectedIds.includes(hit.id)) store.selectNode(hit.id, e.shiftKey);
        const positions = store.nodes.filter(n => newSelected.includes(n.id)).map(n => ({ id: n.id, x: n.x, y: n.y }));
        interRef.current = { type: 'drag', startWorld: world, positions };
        store.pushHistory();
      } else {
        if (!e.shiftKey) store.clearSelection();
        interRef.current = { type: 'marquee', startWorld: world };
      }
      return;
    }

    // Line tool: click-drag to draw
    if (store.activeTool === 'line') {
      const snapTarget = findSnapTarget(world.x, world.y, store.nodes, '');
      let startX = world.x, startY = world.y;
      if (snapTarget) {
        const edge = getNodeEdgePoint(snapTarget, world.x, world.y);
        startX = edge.x; startY = edge.y;
      }
      const node = store.addNode('line', startX, startY);
      // Set line to zero length initially (will grow on drag)
      store.updateNode(node.id, { x: startX, y: startY, w: 0, h: 0 });
      interRef.current = { type: 'draw-line', nodeId: node.id };
      return;
    }

    const nodeType = TOOL_TO_NODE[store.activeTool];
    if (nodeType) {
      store.addNode(nodeType, world.x, world.y);
      return;
    }

    if (store.activeTool === 'eraser') {
      const hit = findNodeAtPoint(world.x, world.y, store.nodes);
      if (hit) { store.selectNode(hit.id); store.deleteSelected(); }
    }
  }, [getWorldPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const inter = interRef.current;
    if (!inter) return;

    if (inter.type === 'pan') {
      const dx = (e.clientX - inter.startMx) / inter.startCam.scale;
      const dy = (e.clientY - inter.startMy) / inter.startCam.scale;
      useEditorStore.getState().setCamera({ ...inter.startCam, x: inter.startCam.x - dx, y: inter.startCam.y - dy });
    }

    if (inter.type === 'drag') {
      const world = getWorldPos(e);
      const dx = world.x - inter.startWorld.x;
      const dy = world.y - inter.startWorld.y;
      const store = useEditorStore.getState();
      inter.positions.forEach(p => store.updateNode(p.id, { x: p.x + dx, y: p.y + dy }));
    }

    if (inter.type === 'resize') {
      const world = getWorldPos(e);
      const dx = world.x - inter.startWorld.x;
      const dy = world.y - inter.startWorld.y;
      const { x, y, w, h } = inter.orig;
      const MIN = 20;
      let nx = x, ny = y, nw = w, nh = h;
      const handle = inter.handle;
      if (handle.includes('w')) { nx = x + dx; nw = w - dx; }
      if (handle.includes('e')) { nw = w + dx; }
      if (handle.includes('n')) { ny = y + dy; nh = h - dy; }
      if (handle.includes('s')) { nh = h + dy; }
      if (nw < MIN) { if (handle.includes('w')) nx = x + w - MIN; nw = MIN; }
      if (nh < MIN) { if (handle.includes('n')) ny = y + h - MIN; nh = MIN; }
      useEditorStore.getState().updateNode(inter.nodeId, { x: nx, y: ny, w: nw, h: nh });
    }

    if (inter.type === 'draw-line') {
      const world = getWorldPos(e);
      const store = useEditorStore.getState();
      const node = store.nodes.find(n => n.id === inter.nodeId);
      if (!node) return;
      // Snap end to nearby node
      const snapTarget = findSnapTarget(world.x, world.y, store.nodes, inter.nodeId);
      let endX = world.x, endY = world.y;
      if (snapTarget) {
        const edge = getNodeEdgePoint(snapTarget, node.x, node.y);
        endX = edge.x; endY = edge.y;
      }
      store.updateNode(inter.nodeId, { w: endX - node.x, h: endY - node.y });
    }

    if (inter.type === 'line-endpoint') {
      const world = getWorldPos(e);
      const store = useEditorStore.getState();
      const snapTarget = findSnapTarget(world.x, world.y, store.nodes, inter.nodeId);
      let px = world.x, py = world.y;
      if (snapTarget) {
        const edge = getNodeEdgePoint(snapTarget, px, py);
        px = edge.x; py = edge.y;
      }
      if (inter.endpoint === 'line-start') {
        // Move start, keep end fixed: end = origX + origW, origY + origH
        const endX = inter.origX + inter.origW;
        const endY = inter.origY + inter.origH;
        store.updateNode(inter.nodeId, { x: px, y: py, w: endX - px, h: endY - py });
      } else {
        // Move end, keep start fixed
        store.updateNode(inter.nodeId, { w: px - inter.origX, h: py - inter.origY });
      }
    }

    if (inter.type === 'marquee') {
      const world = getWorldPos(e);
      setMarquee({
        x: Math.min(inter.startWorld.x, world.x), y: Math.min(inter.startWorld.y, world.y),
        w: Math.abs(world.x - inter.startWorld.x), h: Math.abs(world.y - inter.startWorld.y),
      });
    }
  }, [getWorldPos]);

  const handleMouseUp = useCallback(() => {
    const inter = interRef.current;
    if (inter?.type === 'marquee' && marquee) {
      const hits = nodesInRect(marquee.x, marquee.y, marquee.w, marquee.h, useEditorStore.getState().nodes);
      useEditorStore.getState().selectNodes(hits.map(n => n.id));
      setMarquee(null);
    }
    interRef.current = null;
  }, [marquee]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const world = getWorldPos(e);
    const store = useEditorStore.getState();
    const sortedNodes = [...store.nodes].sort((a, b) => b.zIndex - a.zIndex);
    const hit = findNodeAtPoint(world.x, world.y, sortedNodes);
    if (hit && hit.type !== 'line') store.setEditingNode(hit.id);
  }, [getWorldPos]);

  const gridOn = user?.preferences.gridOn ?? true;
  const cursorClass = activeTool === 'pan' || spaceRef.current ? 'cursor-grab' : activeTool === 'select' ? 'cursor-default' : activeTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair';

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden bg-canvas ${cursorClass}`}
      style={gridOn ? {
        backgroundImage: `radial-gradient(circle, hsl(var(--canvas-dot)) 1px, transparent 1px)`,
        backgroundSize: `${20 * camera.scale}px ${20 * camera.scale}px`,
        backgroundPosition: `${-camera.x * camera.scale}px ${-camera.y * camera.scale}px`,
      } : undefined}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <div className="absolute origin-top-left" style={{ transform: `scale(${camera.scale}) translate(${-camera.x}px, ${-camera.y}px)` }}>
        {[...nodes].sort((a, b) => a.zIndex - b.zIndex).map(node => (
          <NodeRenderer key={node.id} node={node} isSelected={selectedIds.includes(node.id)} isEditing={editingNodeId === node.id} />
        ))}
      </div>

      {/* Resize handles overlay — rendered in screen space */}
      {selectedIds.length === 1 && !editingNodeId && (() => {
        const node = nodes.find(n => n.id === selectedIds[0]);
        if (!node) return null;

        // Line endpoint handles
        if (node.type === 'line') {
          const EP_SIZE = 10;
          const startSx = (node.x - camera.x) * camera.scale - EP_SIZE / 2;
          const startSy = (node.y - camera.y) * camera.scale - EP_SIZE / 2;
          const endSx = (node.x + node.w - camera.x) * camera.scale - EP_SIZE / 2;
          const endSy = (node.y + node.h - camera.y) * camera.scale - EP_SIZE / 2;
          return (
            <>
              <div data-line-endpoint="line-start" data-node-id={node.id}
                style={{ position: 'absolute', left: startSx, top: startSy, width: EP_SIZE, height: EP_SIZE,
                  backgroundColor: 'hsl(187 96% 42%)', border: '2px solid white', borderRadius: '50%', cursor: 'crosshair', zIndex: 9999 }} />
              <div data-line-endpoint="line-end" data-node-id={node.id}
                style={{ position: 'absolute', left: endSx, top: endSy, width: EP_SIZE, height: EP_SIZE,
                  backgroundColor: 'hsl(187 96% 42%)', border: '2px solid white', borderRadius: '50%', cursor: 'crosshair', zIndex: 9999 }} />
            </>
          );
        }

        // Regular resize handles
        const sx = (node.x - camera.x) * camera.scale;
        const sy = (node.y - camera.y) * camera.scale;
        const sw = node.w * camera.scale;
        const sh = node.h * camera.scale;
        return HANDLES.map(h => {
          const pos = h.getPos(sx, sy, sw, sh);
          return (
            <div
              key={h.key}
              data-resize-handle={h.key}
              data-node-id={node.id}
              style={{
                position: 'absolute', left: pos.left, top: pos.top,
                width: HANDLE_SIZE, height: HANDLE_SIZE,
                backgroundColor: 'hsl(187 96% 42%)', border: '1.5px solid white',
                borderRadius: 2, cursor: h.cursor, zIndex: 9999,
              }}
            />
          );
        });
      })()}

      {marquee && (
        <div className="absolute border-2 border-primary bg-primary/10 pointer-events-none rounded-sm" style={{
          left: (marquee.x - camera.x) * camera.scale, top: (marquee.y - camera.y) * camera.scale,
          width: marquee.w * camera.scale, height: marquee.h * camera.scale,
        }} />
      )}
    </div>
  );
};

export default Canvas;
