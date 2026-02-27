import { generateId } from '@/lib/ids';
import { BoardNode } from '@/types/board';

const now = () => Date.now();

const makeNode = (node: Omit<BoardNode, 'id' | 'createdAt' | 'updatedAt'>): BoardNode => ({
  ...node,
  id: generateId(),
  createdAt: now(),
  updatedAt: now(),
});

export const createDailyKanbanTemplate = (): BoardNode[] => {
  const columns = [
    { title: 'A fazer', x: 80, color: '#DBEAFE', stroke: '#3B82F6' },
    { title: 'Em andamento', x: 390, color: '#FEF3C7', stroke: '#F59E0B' },
    { title: 'Concluído', x: 700, color: '#DCFCE7', stroke: '#22C55E' },
  ];

  const nodes: BoardNode[] = [];

  columns.forEach((column, index) => {
    nodes.push(
      makeNode({
        type: 'rect',
        x: column.x,
        y: 60,
        w: 280,
        h: 520,
        rotation: 0,
        text: '',
        zIndex: index,
        style: {
          fill: column.color,
          stroke: column.stroke,
          textColor: '#0F172A',
          fontSize: 14,
          lineWidth: 2,
          opacity: 0.35,
        },
      }),
      makeNode({
        type: 'text',
        x: column.x + 20,
        y: 24,
        w: 220,
        h: 30,
        rotation: 0,
        text: column.title,
        zIndex: 10 + index,
        style: {
          fill: 'transparent',
          stroke: 'transparent',
          textColor: '#0F172A',
          fontSize: 22,
          lineWidth: 0,
          opacity: 1,
        },
      }),
    );
  });

  nodes.push(
    makeNode({
      type: 'sticky',
      x: 120,
      y: 100,
      w: 200,
      h: 140,
      rotation: 0,
      text: 'Prioridade 1\n\nDefina sua principal tarefa do dia.',
      zIndex: 30,
      style: {
        fill: '#FEF08A',
        stroke: '#CA8A04',
        textColor: '#1E293B',
        fontSize: 14,
        lineWidth: 0,
        opacity: 1,
      },
    }),
    makeNode({
      type: 'sticky',
      x: 430,
      y: 100,
      w: 200,
      h: 140,
      rotation: 0,
      text: 'Em execução\n\nArraste para cá quando iniciar.',
      zIndex: 31,
      style: {
        fill: '#FED7AA',
        stroke: '#EA580C',
        textColor: '#1E293B',
        fontSize: 14,
        lineWidth: 0,
        opacity: 1,
      },
    }),
  );

  return nodes;
};
