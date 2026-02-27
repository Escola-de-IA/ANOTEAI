import { useEditorStore } from '@/store/editorStore';
import { getNodesBounds } from '@/lib/geometry';

const MiniMap = () => {
  const { nodes, camera } = useEditorStore();
  if (nodes.length === 0) return null;

  const bounds = getNodesBounds(nodes);
  const pad = 50;
  const mapW = 160, mapH = 100;
  const totalW = bounds.w + pad * 2, totalH = bounds.h + pad * 2;
  const scale = Math.min(mapW / totalW, mapH / totalH);
  const offX = bounds.x - pad, offY = bounds.y - pad;

  const vpW = window.innerWidth / camera.scale;
  const vpH = window.innerHeight / camera.scale;

  // Clamp viewport rect to minimap bounds
  const vpRectX = (camera.x - offX) * scale;
  const vpRectY = (camera.y - offY) * scale;
  const vpRectW = Math.min(vpW * scale, mapW * 2);
  const vpRectH = Math.min(vpH * scale, mapH * 2);

  return (
    <div className="absolute bottom-3 left-3 z-20 bg-card/90 backdrop-blur border rounded-xl p-2 shadow-sm" style={{ width: mapW + 16, height: mapH + 16 }}>
      <svg width={mapW} height={mapH} className="overflow-hidden">
        {nodes.map(n => (
          <rect key={n.id} x={(n.x - offX) * scale} y={(n.y - offY) * scale} width={Math.max(n.w * scale, 2)} height={Math.max(n.h * scale, 2)}
            fill={n.style.fill === 'transparent' ? 'hsl(var(--muted-foreground))' : n.style.fill} rx={2} opacity={0.8} />
        ))}
        <rect x={vpRectX} y={vpRectY} width={vpRectW} height={vpRectH}
          fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} rx={2} opacity={0.5} />
      </svg>
    </div>
  );
};

export default MiniMap;
