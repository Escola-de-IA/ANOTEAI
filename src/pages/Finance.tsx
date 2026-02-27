import { FormEvent, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const categories = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Outros'],
};

const Finance = () => {
  const { user } = useAuthStore();
  const { entries, addEntry, removeEntry } = useFinanceStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState(categories.income[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const userEntries = useMemo(
    () => entries.filter((entry) => entry.userId === user?.id),
    [entries, user?.id],
  );

  const totals = useMemo(() => {
    const income = userEntries
      .filter((entry) => entry.type === 'income')
      .reduce((acc, entry) => acc + entry.amount, 0);
    const expenses = userEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((acc, entry) => acc + entry.amount, 0);

    return { income, expenses, balance: income - expenses };
  }, [userEntries]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const value = Number(amount.replace(',', '.'));
    if (!title.trim() || !date || !Number.isFinite(value) || value <= 0) return;

    addEntry({
      userId: user.id,
      title: title.trim(),
      type,
      category,
      amount: value,
      date,
    });

    setTitle('');
    setAmount('');
  };

  return (
    <AppLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full animate-fade-in space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-sm text-muted-foreground mt-1">Registre receitas e despesas em uma aba separada dos boards.</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />Receitas</p>
            <p className="text-2xl font-semibold text-foreground">R$ {totals.income.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Despesas</p>
            <p className="text-2xl font-semibold text-foreground">R$ {totals.expenses.toFixed(2)}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2"><Wallet className="w-4 h-4 text-primary" />Saldo</p>
            <p className={`text-2xl font-semibold ${totals.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {totals.balance.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Novo lançamento</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3" onSubmit={handleSubmit}>
            <div className="lg:col-span-2 space-y-1">
              <Label htmlFor="title">Descrição</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Mercado" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  const selectedType = e.target.value as 'income' | 'expense';
                  setType(selectedType);
                  setCategory(categories[selectedType][0]);
                }}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {categories[type].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="md:col-span-2 lg:col-span-6 flex justify-end pt-2">
              <Button type="submit">Salvar lançamento</Button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold mb-4">Histórico</h2>
          {userEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
          ) : (
            <div className="space-y-3">
              {userEntries.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.category} · {new Date(`${entry.date}T00:00:00`).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold text-sm ${entry.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                    </p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} aria-label="Excluir lançamento">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Finance;
