import { BoardNode } from '@/types/board';
import { useEditorStore } from '@/store/editorStore';
import { useRef, useEffect } from 'react';

interface Props {
  node: BoardNode;
  isSelected: boolean;
  isEditing: boolean;
}

const NodeRenderer = ({ node, isSelected, isEditing }: Props) => {
  const { updateNode, setEditingNode } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const base: React.CSSProperties = {
    position: 'absolute',
    left: node.x,
    top: node.y,
    width: node.w,
    height: node.h,
    opacity: node.style.opacity,
    zIndex: node.zIndex,
  };

  const selectionRing = isSelected ? '0 0 0 2px hsl(187 96% 42%)' : undefined;

  if (node.type === 'sticky') {
    return (
      <div style={{ ...base, backgroundColor: node.style.fill, boxShadow: `0 2px 8px rgba(0,0,0,0.08)${selectionRing ? ', ' + selectionRing : ''}`, borderRadius: 12 }}
        className="p-3 flex flex-col">
        {isEditing ? (
          <textarea ref={textareaRef} className="w-full h-full bg-transparent resize-none outline-none text-sm"
            style={{ color: node.style.textColor, fontSize: node.style.fontSize }}
            value={node.text} onChange={e => updateNode(node.id, { text: e.target.value })}
            onBlur={() => setEditingNode(null)} onMouseDown={e => e.stopPropagation()} />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words pointer-events-none" style={{ color: node.style.textColor, fontSize: node.style.fontSize }}>{node.text || 'Clique duplo para editar'}</p>
        )}
      </div>
    );
  }

  if (node.type === 'text') {
    return (
      <div style={{ ...base, boxShadow: selectionRing }}>
        {isEditing ? (
          <textarea ref={textareaRef} className="w-full h-full bg-transparent resize-none outline-none"
            style={{ color: node.style.textColor, fontSize: node.style.fontSize, fontWeight: 600 }}
            value={node.text} onChange={e => updateNode(node.id, { text: e.target.value })}
            onBlur={() => setEditingNode(null)} onMouseDown={e => e.stopPropagation()} />
        ) : (
          <p className="whitespace-pre-wrap break-words pointer-events-none" style={{ color: node.style.textColor, fontSize: node.style.fontSize, fontWeight: 600 }}>{node.text}</p>
        )}
      </div>
    );
  }

  if (node.type === 'rect') {
    return (
      <div style={{ ...base, backgroundColor: node.style.fill, border: `${node.style.lineWidth}px solid ${node.style.stroke}`, borderRadius: 12, boxShadow: selectionRing }}
        className="flex items-center justify-center p-2">
        {isEditing ? (
          <textarea ref={textareaRef} className="w-full h-full bg-transparent resize-none outline-none text-center text-sm"
            style={{ color: node.style.textColor, fontSize: node.style.fontSize }}
            value={node.text} onChange={e => updateNode(node.id, { text: e.target.value })}
            onBlur={() => setEditingNode(null)} onMouseDown={e => e.stopPropagation()} />
        ) : (
          <p className="text-sm text-center whitespace-pre-wrap pointer-events-none" style={{ color: node.style.textColor, fontSize: node.style.fontSize }}>{node.text}</p>
        )}
      </div>
    );
  }

  if (node.type === 'ellipse') {
    return (
      <div style={{ ...base, backgroundColor: node.style.fill, border: `${node.style.lineWidth}px solid ${node.style.stroke}`, borderRadius: '50%', boxShadow: selectionRing }}
        className="flex items-center justify-center p-4">
        {isEditing ? (
          <textarea ref={textareaRef} className="w-full h-full bg-transparent resize-none outline-none text-center text-sm"
            style={{ color: node.style.textColor, fontSize: node.style.fontSize }}
            value={node.text} onChange={e => updateNode(node.id, { text: e.target.value })}
            onBlur={() => setEditingNode(null)} onMouseDown={e => e.stopPropagation()} />
        ) : (
          <p className="text-sm text-center whitespace-pre-wrap pointer-events-none" style={{ color: node.style.textColor, fontSize: node.style.fontSize }}>{node.text}</p>
        )}
      </div>
    );
  }

  if (node.type === 'line') {
    // Line goes from (node.x, node.y) to (node.x + node.w, node.y + node.h)
    const x1 = node.x, y1 = node.y;
    const x2 = node.x + node.w, y2 = node.y + node.h;
    const pad = 20;
    const minX = Math.min(x1, x2) - pad, minY = Math.min(y1, y2) - pad;
    const svgW = Math.abs(node.w) + pad * 2, svgH = Math.abs(node.h) + pad * 2;
    const lx1 = x1 - minX, ly1 = y1 - minY;
    const lx2 = x2 - minX, ly2 = y2 - minY;

    // Arrow head
    const angle = Math.atan2(ly2 - ly1, lx2 - lx1);
    const arrowLen = 12;
    const a1x = lx2 - arrowLen * Math.cos(angle - Math.PI / 6);
    const a1y = ly2 - arrowLen * Math.sin(angle - Math.PI / 6);
    const a2x = lx2 - arrowLen * Math.cos(angle + Math.PI / 6);
    const a2y = ly2 - arrowLen * Math.sin(angle + Math.PI / 6);

    return (
      <svg style={{
        position: 'absolute', left: minX, top: minY,
        width: svgW, height: svgH,
        zIndex: node.zIndex, opacity: node.style.opacity,
        overflow: 'visible',
        filter: isSelected ? 'drop-shadow(0 0 2px hsl(187 96% 42%))' : undefined,
      }}>
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
          stroke={node.style.stroke} strokeWidth={node.style.lineWidth} strokeLinecap="round" />
        <polygon points={`${a1x},${a1y} ${lx2},${ly2} ${a2x},${a2y}`} fill={node.style.stroke} />
        {/* Invisible fat hitbox for easier clicking */}
        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
          stroke="transparent" strokeWidth={20} strokeLinecap="round" />
      </svg>
    );
  }

  return null;
};

export default NodeRenderer;
