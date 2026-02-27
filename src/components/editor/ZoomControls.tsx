import { useEditorStore } from '@/store/editorStore';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MIN_ZOOM, MAX_ZOOM } from '@/lib/camera';
import { getNodesBounds } from '@/lib/geometry';

const ZoomControls = () => {
  const { camera, setCamera, nodes } = useEditorStore();

  const zoomIn = () => {
    const s = Math.min(MAX_ZOOM, camera.scale * 1.2);
    setCamera({ ...camera, scale: s });
  };
  const zoomOut = () => {
    const s = Math.max(MIN_ZOOM, camera.scale / 1.2);
    setCamera({ ...camera, scale: s });
  };
  const fitToContent = () => {
    if (nodes.length === 0) { setCamera({ x: -400, y: -300, scale: 1 }); return; }
    const b = getNodesBounds(nodes);
    const padding = 100;
    const vw = window.innerWidth - 120, vh = window.innerHeight - 80;
    const scale = Math.min(vw / (b.w + padding * 2), vh / (b.h + padding * 2), 2);
    setCamera({
      x: b.x - padding - (vw / scale - b.w - padding * 2) / 2,
      y: b.y - padding - (vh / scale - b.h - padding * 2) / 2,
      scale,
    });
  };

  return (
    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-card border rounded-xl p-1 shadow-sm">
      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomOut}><ZoomOut className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomIn}><ZoomIn className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={fitToContent}><Maximize className="w-4 h-4" /></Button>
    </div>
  );
};

export default ZoomControls;
