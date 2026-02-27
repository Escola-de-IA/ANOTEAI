import { useState } from 'react';
import { Board } from '@/types/board';
import { MoreHorizontal, Copy, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface Props {
  board: Board;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (title: string) => void;
}

const BoardCard = ({ board, onOpen, onDelete, onDuplicate, onRename }: Props) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(board.title);

  const handleRename = () => {
    if (title.trim()) onRename(title.trim());
    setIsRenaming(false);
  };

  const nodeCount = board.nodes.length;
  const date = new Date(board.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <div className="group bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden" onClick={() => !isRenaming && onOpen()}>
      {/* Preview area */}
      <div className="h-36 bg-muted relative flex items-center justify-center overflow-hidden">
        {nodeCount > 0 ? (
          <div className="flex flex-wrap gap-1.5 p-4 justify-center items-center max-w-full">
            {board.nodes.slice(0, 8).map(n => (
              <div key={n.id} className="rounded" style={{
                width: n.type === 'sticky' ? 28 : 22,
                height: n.type === 'sticky' ? 28 : 18,
                backgroundColor: n.style.fill === 'transparent' ? 'hsl(var(--border))' : n.style.fill,
                border: n.style.stroke !== 'transparent' ? `1.5px solid ${n.style.stroke}` : undefined,
                borderRadius: n.type === 'ellipse' ? '50%' : 4,
              }} />
            ))}
            {nodeCount > 8 && <span className="text-xs text-muted-foreground">+{nodeCount - 8}</span>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Board vazio</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-card/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border" aria-label="Menu do board">
              <MoreHorizontal className="w-4 h-4 text-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setIsRenaming(true)}><Pencil className="w-4 h-4 mr-2" />Renomear</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}><Copy className="w-4 h-4 mr-2" />Duplicar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4">
        {isRenaming ? (
          <Input
            autoFocus value={title} onChange={e => setTitle(e.target.value)}
            onBlur={handleRename} onKeyDown={e => e.key === 'Enter' && handleRename()}
            onClick={e => e.stopPropagation()} className="h-8 text-sm"
          />
        ) : (
          <h3 className="font-semibold text-sm text-foreground truncate">{board.title}</h3>
        )}
        <p className="text-xs text-muted-foreground mt-1">{date} · {nodeCount} elemento{nodeCount !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
};

export default BoardCard;
