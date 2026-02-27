import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardStore } from '@/store/boardStore';
import { useEditorStore } from '@/store/editorStore';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import TopBar from '@/components/editor/TopBar';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import MiniMap from '@/components/editor/MiniMap';
import ZoomControls from '@/components/editor/ZoomControls';

const BoardEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBoard, updateBoard } = useBoardStore();
  const { loadBoard, nodes, edges, boardId } = useEditorStore();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!id) return;
    const board = getBoard(id);
    if (!board) { navigate('/app'); return; }
    loadBoard(board.id, board.nodes, board.edges);
  }, [id]);

  // Auto-save with debounce
  useEffect(() => {
    if (!boardId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const board = getBoard(boardId);
      if (board) updateBoard({ ...board, nodes, edges });
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [nodes, edges, boardId]);

  // Save on unmount
  useEffect(() => {
    return () => {
      const store = useEditorStore.getState();
      if (store.boardId) {
        const board = useBoardStore.getState().getBoard(store.boardId);
        if (board) useBoardStore.getState().updateBoard({ ...board, nodes: store.nodes, edges: store.edges });
      }
    };
  }, []);

  const board = id ? getBoard(id) : undefined;

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden">
      <div className="flex-1 relative">
        <TopBar boardTitle={board?.title || 'Board'} />
        <Toolbar />
        <Canvas />
        <PropertiesPanel />
        <MiniMap />
        <ZoomControls />
      </div>
    </div>
  );
};

export default BoardEditor;
