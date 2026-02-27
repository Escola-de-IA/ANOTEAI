import { create } from 'zustand';
import { BoardNode, BoardEdge, Camera, ToolType, NodeType, NodeStyle } from '@/types/board';
import { generateId } from '@/lib/ids';

const DEFAULT_STYLES: Record<NodeType, NodeStyle> = {
  sticky: { fill: '#FEF3C7', stroke: '#F59E0B', textColor: '#1E293B', fontSize: 14, lineWidth: 0, opacity: 1 },
  text: { fill: 'transparent', stroke: 'transparent', textColor: '#1E293B', fontSize: 18, lineWidth: 0, opacity: 1 },
  rect: { fill: '#DBEAFE', stroke: '#3B82F6', textColor: '#1E293B', fontSize: 14, lineWidth: 2, opacity: 1 },
  ellipse: { fill: '#D1FAE5', stroke: '#10B981', textColor: '#1E293B', fontSize: 14, lineWidth: 2, opacity: 1 },
  line: { fill: 'transparent', stroke: '#64748B', textColor: '#1E293B', fontSize: 14, lineWidth: 2, opacity: 1 },
};

const DEFAULT_SIZES: Record<NodeType, { w: number; h: number }> = {
  sticky: { w: 200, h: 200 },
  text: { w: 200, h: 40 },
  rect: { w: 200, h: 150 },
  ellipse: { w: 180, h: 140 },
  line: { w: 200, h: 0 },
};

interface HistoryEntry { nodes: BoardNode[]; edges: BoardEdge[]; }

interface EditorState {
  boardId: string | null;
  nodes: BoardNode[];
  edges: BoardEdge[];
  camera: Camera;
  activeTool: ToolType;
  selectedIds: string[];
  editingNodeId: string | null;
  past: HistoryEntry[];
  future: HistoryEntry[];

  loadBoard: (id: string, nodes: BoardNode[], edges: BoardEdge[]) => void;
  setCamera: (camera: Camera) => void;
  setTool: (tool: ToolType) => void;
  selectNode: (id: string, additive?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  setEditingNode: (id: string | null) => void;
  addNode: (type: NodeType, x: number, y: number) => BoardNode;
  updateNode: (id: string, updates: Partial<BoardNode>) => void;
  updateNodeStyle: (id: string, style: Partial<NodeStyle>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  boardId: null, nodes: [], edges: [],
  camera: { x: -400, y: -300, scale: 1 },
  activeTool: 'select', selectedIds: [], editingNodeId: null,
  past: [], future: [],

  loadBoard: (id, nodes, edges) => set({
    boardId: id, nodes, edges, camera: { x: -400, y: -300, scale: 1 },
    selectedIds: [], editingNodeId: null, past: [], future: [],
  }),

  setCamera: (camera) => set({ camera }),
  setTool: (tool) => set({ activeTool: tool, editingNodeId: null }),

  selectNode: (id, additive) => set(s => ({
    selectedIds: additive
      ? (s.selectedIds.includes(id) ? s.selectedIds.filter(i => i !== id) : [...s.selectedIds, id])
      : [id],
  })),

  selectNodes: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [], editingNodeId: null }),
  setEditingNode: (id) => set({ editingNodeId: id }),

  addNode: (type, x, y) => {
    get().pushHistory();
    const size = DEFAULT_SIZES[type];
    const isLine = type === 'line';
    const node: BoardNode = {
      id: generateId(), type,
      x: isLine ? x : x - size.w / 2,
      y: isLine ? y : y - size.h / 2,
      w: isLine ? 0 : size.w,
      h: isLine ? 0 : size.h,
      rotation: 0,
      style: { ...DEFAULT_STYLES[type] },
      text: type === 'sticky' ? '' : type === 'text' ? 'Text' : '',
      zIndex: get().nodes.length,
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    set(s => ({ nodes: [...s.nodes, node], selectedIds: [node.id], activeTool: isLine ? 'line' : 'select' }));
    return node;
  },

  updateNode: (id, updates) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n),
  })),

  updateNodeStyle: (id, style) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, style: { ...n.style, ...style }, updatedAt: Date.now() } : n),
  })),

  deleteSelected: () => {
    get().pushHistory();
    set(s => ({
      nodes: s.nodes.filter(n => !s.selectedIds.includes(n.id)),
      edges: s.edges.filter(e => !s.selectedIds.includes(e.fromNodeId) && !s.selectedIds.includes(e.toNodeId)),
      selectedIds: [], editingNodeId: null,
    }));
  },

  duplicateSelected: () => {
    get().pushHistory();
    const { nodes, selectedIds } = get();
    const selected = nodes.filter(n => selectedIds.includes(n.id));
    const newNodes = selected.map((n, i) => ({
      ...n, id: generateId(), x: n.x + 30, y: n.y + 30,
      zIndex: nodes.length + i, createdAt: Date.now(), updatedAt: Date.now(),
    }));
    set(s => ({ nodes: [...s.nodes, ...newNodes], selectedIds: newNodes.map(n => n.id) }));
  },

  bringToFront: (id) => set(s => {
    const maxZ = Math.max(...s.nodes.map(n => n.zIndex), 0);
    return { nodes: s.nodes.map(n => n.id === id ? { ...n, zIndex: maxZ + 1 } : n) };
  }),

  sendToBack: (id) => set(s => {
    const minZ = Math.min(...s.nodes.map(n => n.zIndex), 0);
    return { nodes: s.nodes.map(n => n.id === id ? { ...n, zIndex: minZ - 1 } : n) };
  }),

  pushHistory: () => set(s => ({
    past: [...s.past.slice(-50), { nodes: JSON.parse(JSON.stringify(s.nodes)), edges: JSON.parse(JSON.stringify(s.edges)) }],
    future: [],
  })),

  undo: () => set(s => {
    if (s.past.length === 0) return s;
    const prev = s.past[s.past.length - 1];
    return {
      past: s.past.slice(0, -1),
      future: [{ nodes: s.nodes, edges: s.edges }, ...s.future],
      nodes: prev.nodes, edges: prev.edges, selectedIds: [],
    };
  }),

  redo: () => set(s => {
    if (s.future.length === 0) return s;
    const next = s.future[0];
    return {
      past: [...s.past, { nodes: s.nodes, edges: s.edges }],
      future: s.future.slice(1),
      nodes: next.nodes, edges: next.edges, selectedIds: [],
    };
  }),
}));
