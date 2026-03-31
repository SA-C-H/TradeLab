import { useState } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAccount } from '@/contexts/AccountContext';
import { AccountRequiredMessage } from '@/components/AccountRequiredMessage';
import { useI18n } from '@/hooks/use-i18n';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Search, Smile, Meh, Frown, Angry } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/hooks/use-supabase-session';

const moodIcons = {
  excellent: { icon: Smile, color: 'text-green-500', label: 'Excellent' },
  good: { icon: Smile, color: 'text-blue-500', label: 'Bon' },
  neutral: { icon: Meh, color: 'text-gray-500', label: 'Neutre' },
  bad: { icon: Frown, color: 'text-orange-500', label: 'Mauvais' },
  terrible: { icon: Angry, color: 'text-red-500', label: 'Terrible' },
};

type JournalEntry = {
  id: string;
  date: string;
  title: string;
  content: string | null;
  mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' | null;
  tags: string[];
  created_at: string;
};

export default function TradingJournalSimple() {
  const { t } = useI18n();
  const { hasAccounts, currentAccount } = useAccount();
  const { session } = useSupabaseSession();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: '' as const,
    tags: [] as string[],
  });

  const fetchEntries = async () => {
    if (!session?.user?.id || !currentAccount?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trading_journal')
        .select('*')
        .eq('account_id', currentAccount.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEntries();
  }, [session, currentAccount]);

  const handleCreateEntry = async () => {
    if (!newEntry.title.trim() || !session?.user?.id || !currentAccount?.id) return;

    try {
      const { error } = await supabase
        .from('trading_journal')
        .insert({
          user_id: session.user.id,
          account_id: currentAccount.id,
          date: newEntry.date,
          title: newEntry.title,
          content: newEntry.content || null,
          mood: newEntry.mood || null,
          tags: newEntry.tags,
        } as any);
      
      if (error) throw error;
      
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        mood: '',
        tags: [],
      });
      setIsCreateDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        const { error } = await supabase
          .from('trading_journal')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchEntries();
      } catch (error) {
        console.error('Failed to delete journal entry:', error);
      }
    }
  };

  const filteredEntries = entries.filter((entry) => {
    return entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           entry.content?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!hasAccounts) {
    return <AccountRequiredMessage />;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Journal de Trading</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entrée
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle entrée du journal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Humeur</Label>
                  <Select value={newEntry.mood} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, mood: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une humeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodIcons).map(([key, { label, icon: Icon }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'entrée..."
                />
              </div>

              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Vos réflexions, observations, leçons apprises..."
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEntry}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans le journal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des entrées */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              Chargement...
            </CardContent>
          </Card>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {entries.length === 0 ? "Commencez votre journal de trading" : "Aucune entrée ne correspond à votre recherche"}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      {entry.mood && moodIcons[entry.mood] && (
                        <div className={`flex items-center gap-1 ${moodIcons[entry.mood].color}`}>
                          {React.createElement(moodIcons[entry.mood].icon, { className: "h-4 w-4" })}
                          <span className="text-sm">{moodIcons[entry.mood].label}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(new Date(entry.date), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {entry.content && (
                <CardContent>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
