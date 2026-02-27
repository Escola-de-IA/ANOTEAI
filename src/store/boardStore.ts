import { create } from 'zustand';
import { Board, BoardNode } from '@/types/board'; // Adicionado BoardNode
import { loadBoards, saveBoards } from '@/lib/storage';
import { generateId } from '@/lib/ids';

interface BoardStoreState {
  boards: Board[];
  loadAll: () => void;
  // Atualizado para aceitar initialNodes
  createBoard: (title: string, ownerId: string, initialNodes?: BoardNode[]) => Board;
  deleteBoard: (id: string) => void;
  duplicateBoard: (id: string) => Board | null;
  renameBoard: (id: string, title: string) => void;
  updateBoard: (board: Board) => void;
  getBoard: (id: string) => Board | undefined;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  boards: loadBoards(),
  loadAll: () => set({ boards: loadBoards() }),

  createBoard: (title, ownerId, initialNodes = []) => {
    const board: Board = {
      id: generateId(), 
      title, 
      ownerId, 
      nodes: initialNodes, // Usa os nós iniciais fornecidos ou um array vazio
      edges: [],
      createdAt: Date.now(), 
      updatedAt: Date.now(),
    };
    const boards = [...get().boards, board];
    saveBoards(boards);
    set({ boards });
    return board;
  },

  // ... (mantenha o restante do código inalterado)
  deleteBoard: (id) => {
    const boards = get().boards.filter(b => b.id !== id);
    saveBoards(boards);
    set({ boards });
  },

  duplicateBoard: (id) => {
    const orig = get().boards.find(b => b.id === id);
    if (!orig) return null;
    const dup: Board = {
      ...JSON.parse(JSON.stringify(orig)),
      id: generateId(), title: `${orig.title} (cópia)`,
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    const boards = [...get().boards, dup];
    saveBoards(boards);
    set({ boards });
    return dup;
  },

  renameBoard: (id, title) => {
    const boards = get().boards.map(b => b.id === id ? { ...b, title, updatedAt: Date.now() } : b);
    saveBoards(boards);
    set({ boards });
  },

  updateBoard: (board) => {
    const boards = get().boards.map(b => b.id === board.id ? { ...board, updatedAt: Date.now() } : b);
    saveBoards(boards);
    set({ boards });
  },

  getBoard: (id) => get().boards.find(b => b.id === id),
}));