import { Board, User } from '@/types/board';

const BOARDS_KEY = 'boardverse_boards';
const USER_KEY = 'boardverse_user';

export const loadBoards = (): Board[] => {
  try {
    const d = localStorage.getItem(BOARDS_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
};

export const saveBoards = (boards: Board[]) => {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
};

export const loadUser = (): User | null => {
  try {
    const d = localStorage.getItem(USER_KEY);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
};

export const saveUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
