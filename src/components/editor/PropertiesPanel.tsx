import { useEditorStore } from '@/store/editorStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowUpToLine, ArrowDownToLine, Trash2 } from 'lucide-react';

const PropertiesPanel = () => {
  const { selectedIds, nodes, updateNodeStyle, bringToFront, sendToBack, deleteSelected } = useEditorStore();
  if (selectedIds.length !== 1) return null;

  const node = nodes.find(n => n.id === selectedIds[0]);
  if (!node) return null;

  return (
    <div className="absolute right-3 top-14 z-20 w-56 bg-card border rounded-2xl p-4 shadow-lg space-y-4 animate-scale-in">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Propriedades</h3>

      {node.type !== 'line' && (
        <div className="space-y-2">
          <Label className="text-xs">Cor de fundo</Label>
          <div className="flex items-center gap-2">
            <input type="color" value={node.style.fill === 'transparent' ? '#ffffff' : node.style.fill}
              onChange={e => updateNodeStyle(node.id, { fill: e.target.value })} className="w-8 h-8 rounded-lg border cursor-pointer" />
            <Input value={node.style.fill} onChange={e => updateNodeStyle(node.id, { fill: e.target.value })} className="h-8 text-xs flex-1" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Cor da borda</Label>
        <div className="flex items-center gap-2">
          <input type="color" value={node.style.stroke === 'transparent' ? '#000000' : node.style.stroke}
            onChange={e => updateNodeStyle(node.id, { stroke: e.target.value })} className="w-8 h-8 rounded-lg border cursor-pointer" />
        </div>
      </div>

      {(node.type === 'sticky' || node.type === 'text' || node.type === 'rect' || node.type === 'ellipse') && (
        <div className="space-y-2">
          <Label className="text-xs">Tamanho da fonte</Label>
          <Slider value={[node.style.fontSize]} min={10} max={48} step={1}
            onValueChange={v => updateNodeStyle(node.id, { fontSize: v[0] })} />
          <span className="text-[10px] text-muted-foreground">{node.style.fontSize}px</span>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Opacidade</Label>
        <Slider value={[node.style.opacity * 100]} min={10} max={100} step={5}
          onValueChange={v => updateNodeStyle(node.id, { opacity: v[0] / 100 })} />
      </div>

      <div className="flex gap-1 pt-2 border-t">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => bringToFront(node.id)} title="Trazer para frente">
          <ArrowUpToLine className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => sendToBack(node.id)} title="Enviar para trás">
          <ArrowDownToLine className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 ml-auto text-destructive" onClick={deleteSelected} title="Excluir">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
