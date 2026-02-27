import { useState, useCallback, type DragEvent } from 'react';
import {
  GripVertical, Calendar, CheckSquare, Paperclip, MoreHorizontal, Plus, Clock, Pencil, Trash2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import CardModal, { type KanbanCardData, type CheckItem } from '@/components/kanban/CardModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Column = {
  id: string;
  title: string;
  colorClass: string;
  cards: KanbanCardData[];
};

const initialColumns: Column[] = [
  {
    id: 'todo', title: 'A Fazer', colorClass: 'kanban-column-todo',
    cards: [
      {
        id: '1', title: 'Definir arquitetura do backend', description: 'Modelar APIs REST e banco de dados',
        labels: [{ text: 'Backend', color: 'label-green' }, { text: 'Urgente', color: 'label-red' }],
        deadline: '2026-03-05', checklist: [{ text: 'Diagramas ER', done: true }, { text: 'Endpoints REST', done: false }, { text: 'Auth flow', done: false }],
        attachments: 2, assignee: 'LS',
      },
      {
        id: '2', title: 'Criar wireframes de telas', labels: [{ text: 'Design', color: 'label-purple' }],
        deadline: '2026-03-08', checklist: [], attachments: 0, assignee: 'MR',
      },
    ],
  },
  {
    id: 'progress', title: 'Em Andamento', colorClass: 'kanban-column-progress',
    cards: [
      {
        id: '3', title: 'Implementar autenticação', description: 'Login, registro, recuperação de senha',
        labels: [{ text: 'Backend', color: 'label-green' }, { text: 'Urgente', color: 'label-red' }],
        deadline: '2026-03-02', checklist: [{ text: 'Login email', done: true }, { text: 'OAuth Google', done: true }, { text: 'Recovery flow', done: false }],
        attachments: 0, assignee: 'LS',
      },
    ],
  },
  {
    id: 'done', title: 'Concluído', colorClass: 'kanban-column-done',
    cards: [
      {
        id: '4', title: 'Setup do projeto e CI/CD', labels: [{ text: 'Frontend', color: 'label-blue' }],
        checklist: [{ text: 'Repo GitHub', done: true }, { text: 'Pipeline CI', done: true }], attachments: 0, assignee: 'LS',
      },
    ],
  },
];

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; fromColumn: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCardData | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string>('todo');

  const openCreateModal = (columnId: string) => {
    setEditingCard(null);
    setActiveColumnId(columnId);
    setModalOpen(true);
  };

  const openEditModal = (card: KanbanCardData, columnId: string) => {
    setEditingCard(card);
    setActiveColumnId(columnId);
    setModalOpen(true);
  };

  const handleSaveCard = (card: KanbanCardData) => {
    setColumns((prev) => {
      if (editingCard) {
        return prev.map((col) => ({ ...col, cards: col.cards.map((c) => (c.id === card.id ? card : c)) }));
      }
      return prev.map((col) => (col.id === activeColumnId ? { ...col, cards: [...col.cards, card] } : col));
    });
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prev) => prev.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== cardId) })));
  };

  const handleDragStart = useCallback((cardId: string, columnId: string) => {
    setDraggedCard({ cardId, fromColumn: columnId });
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => { event.preventDefault(); }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedCard || draggedCard.fromColumn === targetColumnId) { setDraggedCard(null); return; }
    setColumns((prev) => {
      const sourceCol = prev.find((c) => c.id === draggedCard.fromColumn);
      const card = sourceCol?.cards.find((c) => c.id === draggedCard.cardId);
      if (!card) return prev;
      return prev.map((col) => {
        if (col.id === draggedCard.fromColumn) return { ...col, cards: col.cards.filter((c) => c.id !== draggedCard.cardId) };
        if (col.id === targetColumnId) return { ...col, cards: [...col.cards, card] };
        return col;
      });
    });
    setDraggedCard(null);
  }, [draggedCard]);

  const checklistProgress = (items: CheckItem[]) => {
    if (items.length === 0) return null;
    const done = items.filter((item) => item.done).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  };

  const isOverdue = (deadline?: string) => (deadline ? new Date(deadline) < new Date() : false);

  const columnTitle = columns.find((c) => c.id === activeColumnId)?.title;

  return (
    <AppLayout>
      <>
        <div className="flex gap-4 p-6 h-[calc(100vh-3.5rem)] overflow-x-auto">
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn('flex-shrink-0 w-80 rounded-xl p-3 flex flex-col', column.colorClass)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">{column.cards.length}</span>
                </div>
                <button onClick={() => openCreateModal(column.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                {column.cards.map((card) => {
                  const progress = checklistProgress(card.checklist);
                  const overdue = isOverdue(card.deadline);
                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id, column.id)}
                      onClick={() => openEditModal(card, column.id)}
                      className={cn(
                        'bg-card rounded-lg p-3 border border-border shadow-sm cursor-grab active:cursor-grabbing',
                        'hover:shadow-md hover:border-primary/20 transition-all animate-fade-in',
                        draggedCard?.cardId === card.id && 'opacity-50',
                      )}
                    >
                      {card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {card.labels.map((label) => (
                            <span key={`${card.id}-${label.text}`} className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full text-white', label.color)}>{label.text}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-start gap-1.5">
                        <GripVertical className="w-3 h-3 mt-1 text-muted-foreground/40 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium leading-snug">{card.title}</h4>
                          {card.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>}
                        </div>
                      </div>

                      {progress && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                            <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{progress.done}/{progress.total}</span>
                            <span>{progress.pct}%</span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress.pct}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-2">
                          {card.deadline && (
                            <span className={cn('text-[10px] flex items-center gap-1 font-medium', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                              {overdue ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                              {new Date(card.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {card.attachments > 0 && (
                            <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Paperclip className="w-3 h-3" />{card.attachments}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {card.assignee && (
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{card.assignee}</div>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                              <button className="text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                              <DropdownMenuItem onClick={() => openEditModal(card, column.id)}>
                                <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteCard(card.id)} className="text-destructive">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <CardModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingCard(null); }}
          card={editingCard}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          columnTitle={columnTitle}
        />
      </>
    </AppLayout>
  );
};

export default KanbanBoard;
