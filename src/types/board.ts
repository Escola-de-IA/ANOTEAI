export type ToolType = 'select' | 'pan' | 'sticky' | 'text' | 'rect' | 'ellipse' | 'line' | 'eraser';
export type NodeType = 'sticky' | 'text' | 'rect' | 'ellipse' | 'line';
export type PlanType = 'free' | 'pro';

export interface NodeStyle {
  fill: string;
  stroke: string;
  textColor: string;
  fontSize: number;
  lineWidth: number;
  opacity: number;
}

export interface BoardNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  style: NodeStyle;
  text: string;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface BoardEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style: {
    stroke: string;
    lineWidth: number;
    arrowHead: boolean;
  };
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  nodes: BoardNode[];
  edges: BoardEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  preferences: {
    gridOn: boolean;
    snapOn: boolean;
    darkMode: boolean;
  };
}

export type FinanceEntryType = 'income' | 'expense';

export interface FinanceEntry {
  id: string;
  userId: string;
  title: string;
  category: string;
  type: FinanceEntryType;
  amount: number;
  date: string;
  notes?: string;
  createdAt: number;
}
