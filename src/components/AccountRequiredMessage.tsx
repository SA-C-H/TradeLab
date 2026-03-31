import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus } from 'lucide-react';
import { useAccount } from '@/contexts/AccountContext';
import { useNavigate } from 'react-router-dom';

export function AccountRequiredMessage() {
  const { hasAccounts } = useAccount();
  const navigate = useNavigate();

  if (hasAccounts) return null;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Aucun compte de trading</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous devez créer au moins un compte de trading pour commencer à utiliser l'application.
          </p>
          <Button 
            onClick={() => navigate('/settings')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un compte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
