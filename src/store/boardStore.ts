import { create } from 'zustand';
import { Board, BoardNode } from '@/types/board';
import { loadBoards, saveBoards } from '@/lib/storage';
import { generateId } from '@/lib/ids';

interface CreateBoardOptions {
  initialNodes?: BoardNode[];
}

interface BoardStoreState {
  boards: Board[];
  loadAll: () => void;
  createBoard: (title: string, ownerId: string, options?: CreateBoardOptions) => Board;
  deleteBoard: (id: string) => void;
  duplicateBoard: (id: string) => Board | null;
  renameBoard: (id: string, title: string) => void;
  updateBoard: (board: Board) => void;
  getBoard: (id: string) => Board | undefined;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  boards: loadBoards(),
  loadAll: () => set({ boards: loadBoards() }),

  createBoard: (title, ownerId, options) => {
    const board: Board = {
      id: generateId(),
      title,
      ownerId,
      nodes: options?.initialNodes ?? [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const boards = [...get().boards, board];
    saveBoards(boards);
    set({ boards });
    return board;
  },

  deleteBoard: (id) => {
    const boards = get().boards.filter((board) => board.id !== id);
    saveBoards(boards);
    set({ boards });
  },

  duplicateBoard: (id) => {
    const original = get().boards.find((board) => board.id === id);
    if (!original) return null;

    const duplicate: Board = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
      title: `${original.title} (cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const boards = [...get().boards, duplicate];
    saveBoards(boards);
    set({ boards });
    return duplicate;
  },

  renameBoard: (id, title) => {
    const boards = get().boards.map((board) => (
      board.id === id ? { ...board, title, updatedAt: Date.now() } : board
    ));
    saveBoards(boards);
    set({ boards });
  },

  updateBoard: (board) => {
    const boards = get().boards.map((current) => (
      current.id === board.id ? { ...board, updatedAt: Date.now() } : current
    ));
    saveBoards(boards);
    set({ boards });
  },

  getBoard: (id) => get().boards.find((board) => board.id === id),
}));
