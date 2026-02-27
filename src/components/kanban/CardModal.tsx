import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/ids';

export type KanbanLabel = { text: string; color: string };
export type CheckItem = { text: string; done: boolean };

export interface KanbanCardData {
  id: string;
  title: string;
  description?: string;
  labels: KanbanLabel[];
  deadline?: string;
  checklist: CheckItem[];
  attachments: number;
  assignee?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  card: KanbanCardData | null;
  onSave: (card: KanbanCardData) => void;
  onDelete: (cardId: string) => void;
  columnTitle?: string;
}

const CardModal = ({ open, onClose, card, onSave, onDelete, columnTitle }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    setTitle(card?.title ?? '');
    setDescription(card?.description ?? '');
    setDeadline(card?.deadline ?? '');
    setAssignee(card?.assignee ?? '');
  }, [card, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: card?.id ?? generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      labels: card?.labels ?? [],
      deadline: deadline || undefined,
      checklist: card?.checklist ?? [],
      attachments: card?.attachments ?? 0,
      assignee: assignee.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{card ? 'Editar cartão' : `Novo cartão ${columnTitle ? `- ${columnTitle}` : ''}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="card-title">Título</Label>
            <Input id="card-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="card-description">Descrição</Label>
            <Textarea id="card-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="card-deadline">Prazo</Label>
              <Input id="card-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="card-assignee">Responsável (iniciais)</Label>
              <Input id="card-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value.toUpperCase().slice(0, 3))} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {card ? (
              <Button variant="destructive" onClick={() => { onDelete(card.id); onClose(); }}>Excluir</Button>
            ) : <span />}
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;
