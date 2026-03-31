import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Wallet } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useAccounts } from '@/hooks/use-accounts';
import { useI18n } from '@/hooks/use-i18n';
import { toast } from 'sonner';

const accountTypeColors = {
  real: 'bg-green-500',
  demo: 'bg-blue-500',
  prop_firm: 'bg-purple-500',
  paper: 'bg-gray-500',
};

const accountTypeLabels = {
  real: 'Réel',
  demo: 'Démo',
  prop_firm: 'Prop Firm',
  paper: 'Paper',
};

export function AccountSelector() {
  const { t } = useI18n();
  const { currentAccount, accounts, setCurrentAccount } = useAccount();
  const { createAccount } = useAccounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    account_type: 'demo' as const,
    initial_capital: 10000,
    currency: 'USD',
    broker: '',
  });

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) {
      toast.error('Le nom du compte est requis');
      return;
    }

    try {
      const account = await createAccount.mutateAsync(newAccount);
      setCurrentAccount(account);
      setIsCreateDialogOpen(false);
      setNewAccount({
        name: '',
        account_type: 'demo',
        initial_capital: 10000,
        currency: 'USD',
        broker: '',
      });
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentAccount?.id || ''}
        onValueChange={(value) => {
          const account = accounts.find(a => a.id === value);
          if (account) setCurrentAccount(account);
        }}
      >
        <SelectTrigger className="w-64">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Wallet className="h-4 w-4 flex-shrink-0" />
            <SelectValue placeholder="Sélectionner un compte">
              {currentAccount ? (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full ${accountTypeColors[currentAccount.account_type as keyof typeof accountTypeColors]} flex-shrink-0`} />
                  <span className="truncate flex-1 min-w-0">{currentAccount.name}</span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {accountTypeLabels[currentAccount.account_type as keyof typeof accountTypeLabels]}
                  </Badge>
                </div>
              ) : (
                'Aucun compte'
              )}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full ${accountTypeColors[account.account_type as keyof typeof accountTypeColors]} flex-shrink-0`} />
                <span className="truncate flex-1 min-w-0">{account.name}</span>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {accountTypeLabels[account.account_type as keyof typeof accountTypeLabels]}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau compte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Nom du compte</Label>
              <Input
                id="account-name"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Compte Réel IC Markets"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <Select
                value={newAccount.account_type}
                onValueChange={(value: any) => setNewAccount(prev => ({ ...prev, account_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo">Démo</SelectItem>
                  <SelectItem value="real">Réel</SelectItem>
                  <SelectItem value="prop_firm">Prop Firm</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-capital">Capital initial</Label>
              <Input
                id="initial-capital"
                type="number"
                value={newAccount.initial_capital}
                onChange={(e) => setNewAccount(prev => ({ ...prev, initial_capital: Number(e.target.value) }))}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={newAccount.currency}
                onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="broker">Broker (optionnel)</Label>
              <Input
                id="broker"
                value={newAccount.broker}
                onChange={(e) => setNewAccount(prev => ({ ...prev, broker: e.target.value }))}
                placeholder="Ex: IC Markets"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateAccount} disabled={createAccount.isPending}>
                {createAccount.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
