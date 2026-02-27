import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'free' as const,
    name: 'Starter',
    price: 'Grátis',
    features: ['Até 3 boards', 'Ferramentas básicas', 'Export PNG com marca d\'água', 'Suporte comunitário'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 'R$ 29/mês',
    popular: true,
    features: ['Boards ilimitados', 'Todas as ferramentas', 'Export PNG sem marca d\'água', 'Histórico de versões', 'Suporte prioritário'],
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: 'Em breve',
    disabled: true,
    features: ['Tudo do Pro', 'Colaboração em tempo real', 'Permissões por membro', 'Admin dashboard', 'SSO'],
  },
];

const Billing = () => {
  const { user, setPlan } = useAuthStore();

  return (
    <AppLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground">Planos & Preços</h1>
          <p className="text-sm text-muted-foreground mt-2">Escolha o plano ideal para você</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isCurrent = user?.plan === plan.id;
            return (
              <div key={plan.id} className={`bg-card rounded-2xl border p-6 flex flex-col relative ${plan.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-extrabold text-foreground mt-2">{plan.price}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={plan.disabled || isCurrent}
                  onClick={() => !plan.disabled && plan.id !== 'team' && setPlan(plan.id)}
                >
                  {isCurrent ? 'Plano atual' : plan.disabled ? 'Em breve' : 'Selecionar'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Billing;
