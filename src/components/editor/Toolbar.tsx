import { useEditorStore } from '@/store/editorStore';
import { ToolType } from '@/types/board';
import {
  MousePointer2, Hand, StickyNote, Type, Square, Circle,
  Minus, Eraser,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const tools: { id: ToolType; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Selecionar', shortcut: 'V' },
  { id: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note', shortcut: 'S' },
  { id: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
  { id: 'rect', icon: Square, label: 'Retângulo', shortcut: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Elipse', shortcut: 'O' },
  { id: 'line', icon: Minus, label: 'Linha / Seta', shortcut: 'L' },
  { id: 'eraser', icon: Eraser, label: 'Apagar', shortcut: 'E' },
];

const Toolbar = () => {
  const { activeTool, setTool } = useEditorStore();

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 bg-card border rounded-2xl p-1.5 shadow-lg">
      {tools.map(t => {
        const active = activeTool === t.id;
        return (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setTool(t.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label={t.label}
              >
                <t.icon className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {t.label} {t.shortcut && <kbd className="ml-1 text-[10px] opacity-60">{t.shortcut}</kbd>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default Toolbar;
