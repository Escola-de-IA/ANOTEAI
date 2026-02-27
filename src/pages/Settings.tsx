import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { user, updateUser, updatePreferences } = useAuthStore();
  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex-1 p-6 lg:p-10 max-w-2xl mx-auto w-full animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-8">Configurações</h1>

        <section className="bg-card border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Perfil</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={user.name} onChange={e => updateUser({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Plano atual</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize px-3 py-1 rounded-full bg-accent text-accent-foreground">
                  {user.plan === 'free' ? 'Starter (Free)' : 'Pro'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Preferências do Editor</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Grid visível</Label>
                <p className="text-xs text-muted-foreground">Mostrar pontos de grid no canvas</p>
              </div>
              <Switch checked={user.preferences.gridOn} onCheckedChange={v => updatePreferences({ gridOn: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Snap to grid</Label>
                <p className="text-xs text-muted-foreground">Alinhar elementos ao grid</p>
              </div>
              <Switch checked={user.preferences.snapOn} onCheckedChange={v => updatePreferences({ snapOn: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Tema escuro</Label>
                <p className="text-xs text-muted-foreground">Alternar entre tema claro e escuro</p>
              </div>
              <Switch checked={user.preferences.darkMode} onCheckedChange={v => {
                updatePreferences({ darkMode: v });
                document.documentElement.classList.toggle('dark', v);
              }} />
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Settings;
