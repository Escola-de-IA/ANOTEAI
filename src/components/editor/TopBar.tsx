import { useEditorStore } from '@/store/editorStore';
import { useBoardStore } from '@/store/boardStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TopBar = ({ boardTitle }: { boardTitle: string }) => {
  const navigate = useNavigate();
  const { camera, undo, redo, past, future, nodes, edges, boardId } = useEditorStore();
  const { updateBoard, getBoard } = useBoardStore();

  const handleSave = () => {
    if (!boardId) return;
    const board = getBoard(boardId);
    if (board) updateBoard({ ...board, nodes, edges });
  };

  const zoomPercent = Math.round(camera.scale * 100);

  return (
    <div className="absolute top-0 left-0 right-0 h-12 z-20 flex items-center px-3 gap-2 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-card border rounded-xl px-2 py-1 shadow-sm">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { handleSave(); navigate('/app'); }}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground max-w-[160px] truncate">{boardTitle}</span>
      </div>

      <div className="pointer-events-auto flex items-center gap-1 bg-card border rounded-xl px-1 py-1 shadow-sm ml-2">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={undo} disabled={past.length === 0}>
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={redo} disabled={future.length === 0}>
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="ml-auto pointer-events-auto flex items-center gap-2">
        <span className="bg-card border rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          {zoomPercent}%
        </span>
        <Button size="sm" className="h-8 rounded-xl text-xs" onClick={handleSave}>Salvar</Button>
      </div>
    </div>
  );
};

export default TopBar;
