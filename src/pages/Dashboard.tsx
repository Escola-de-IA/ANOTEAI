import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useBoardStore } from '@/store/boardStore';
import { useFinanceStore } from '@/store/financeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BoardCard from '@/components/dashboard/BoardCard';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowRight, Eye, EyeOff, KanbanSquare, Plus, Search, Wallet } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { entries } = useFinanceStore();
  const { boards, createBoard, deleteBoard, duplicateBoard, renameBoard } = useBoardStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showBalance, setShowBalance] = useState(false);

  const userBoards = boards.filter((board) => board.ownerId === user?.id);
  const filteredBoards = userBoards.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()));
  const maxBoards = user?.plan === 'free' ? 3 : Infinity;
  const canCreate = userBoards.length < maxBoards;

  const userEntries = useMemo(
    () => entries.filter((entry) => entry.userId === user?.id),
    [entries, user?.id],
  );

  const balance = useMemo(() => {
    const income = userEntries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const expense = userEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return income - expense;
  }, [userEntries]);

  const periodGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = user?.name?.trim().split(' ')[0] || 'usuário';

  const handleCreateBoard = () => {
    if (!user || !canCreate) return;
    const board = createBoard('Novo board', user.id);
    navigate(`/app/board/${board.id}`);
  };

  return (
    <AppLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-6">
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-fade-in">
          <div className="xl:col-span-2 rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Painel principal</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">
              {periodGreeting}, {firstName}.
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Organize seu dia com foco nas tarefas, boards e saúde financeira em um só lugar.
            </p>

            <div className="mt-5 rounded-xl border bg-muted/30 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Kanban diário</p>
                <p className="font-semibold text-foreground">Acompanhe tarefas por status com visão profissional</p>
              </div>
              <Button onClick={() => navigate('/app/kanban')} className="shrink-0">
                Abrir Kanban <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />Saldo financeiro
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {periodGreeting}, {firstName}, o seu saldo é:
              </p>
              <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {showBalance ? `R$ ${balance.toFixed(2)}` : 'R$ ••••••'}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowBalance((prev) => !prev)}>
                {showBalance ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/app/finance')}>
                Ir para financeiro
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Meus Boards</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {userBoards.length} board{userBoards.length !== 1 ? 's' : ''}
                {user?.plan === 'free' && ` · ${maxBoards - userBoards.length} restante${maxBoards - userBoards.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar boards..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleCreateBoard} disabled={!canCreate}>
                <Plus className="w-4 h-4 mr-2" />Novo board
              </Button>
            </div>
          </div>

          {filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <h3 className="font-semibold text-foreground mb-1">
                {search ? 'Nenhum board encontrado' : 'Crie seu primeiro board'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                {search ? 'Tente outro termo de busca.' : 'Comece criando um board para organizar suas ideias visualmente.'}
              </p>
              {!search && (
                <Button onClick={handleCreateBoard}>
                  <Plus className="w-4 h-4 mr-2" />Novo board
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBoards.map((board) => (
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
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
