import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useBoardStore } from '@/store/boardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BoardCard from '@/components/dashboard/BoardCard';
import AppLayout from '@/components/layout/AppLayout';
import { KanbanSquare, Plus, Search } from 'lucide-react';
import { createDailyKanbanTemplate } from '@/lib/kanbanTemplate';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { boards, createBoard, deleteBoard, duplicateBoard, renameBoard } = useBoardStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const userBoards = boards.filter(b => b.ownerId === user?.id);
  const filtered = userBoards.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
  const maxBoards = user?.plan === 'free' ? 3 : Infinity;
  const canCreate = userBoards.length < maxBoards;

  const handleCreate = () => {
    if (!user || !canCreate) return;
    const board = createBoard('Novo board', user.id);
    navigate(`/app/board/${board.id}`);
  };

  const handleCreateKanban = () => {
    if (!user || !canCreate) return;
    const board = createBoard('Kanban Diário', user.id, { initialNodes: createDailyKanbanTemplate() });
    navigate(`/app/board/${board.id}`);
  };

  return (
    <AppLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Boards</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {userBoards.length} board{userBoards.length !== 1 ? 's' : ''}
              {user?.plan === 'free' && ` · ${maxBoards - userBoards.length} restante${maxBoards - userBoards.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar boards..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={handleCreateKanban} disabled={!canCreate} variant="outline" className="shrink-0">
              <KanbanSquare className="w-4 h-4 mr-2" />Kanban diário
            </Button>
            <Button onClick={handleCreate} disabled={!canCreate} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" />Novo board
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" /><path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {search ? 'Nenhum board encontrado' : 'Crie seu primeiro board'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? 'Tente outro termo de busca.' : 'Comece criando um board e organize suas ideias visualmente.'}
            </p>
            {!search && <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Novo board</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
            {filtered.map(board => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() => navigate(`/app/board/${board.id}`)}
                onDelete={() => deleteBoard(board.id)}
                onDuplicate={() => duplicateBoard(board.id)}
                onRename={(title) => renameBoard(board.id, title)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
