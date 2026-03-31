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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTradingJournal, useCreateJournalEntry, useUpdateJournalEntry, useDeleteJournalEntry, useJournalTags } from '@/hooks/use-trading-journal';
import { useAccount } from '@/contexts/AccountContext';
import { AccountRequiredMessage } from '@/components/AccountRequiredMessage';
import { useI18n } from '@/hooks/use-i18n';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Search, Filter, Smile, Meh, Frown, Angry } from 'lucide-react';
import { cn } from '@/lib/utils';

const moodIcons = {
  excellent: { icon: Smile, color: 'text-green-500', label: 'Excellent' },
  good: { icon: Smile, color: 'text-blue-500', label: 'Bon' },
  neutral: { icon: Meh, color: 'text-gray-500', label: 'Neutre' },
  bad: { icon: Frown, color: 'text-orange-500', label: 'Mauvais' },
  terrible: { icon: Angry, color: 'text-red-500', label: 'Terrible' },
};

export default function TradingJournal() {
  const { t } = useI18n();
  const { hasAccounts } = useAccount();
  const { data: entries = [], isLoading } = useTradingJournal();
  const { data: tags = [] } = useJournalTags();
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const deleteEntry = useDeleteJournalEntry();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    mood: '' as const,
    tags: [] as string[],
    is_private: true,
  });

  if (!hasAccounts) {
    return <AccountRequiredMessage />;
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.some(tag => entry.tags.includes(tag));
    const matchesMood = !selectedMood || entry.mood === selectedMood;
    
    return matchesSearch && matchesTags && matchesMood;
  });

  const handleCreateEntry = async () => {
    if (!newEntry.title.trim()) return;

    try {
      await createEntry.mutateAsync(newEntry);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        mood: '',
        tags: [],
        is_private: true,
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const handleUpdateEntry = async (id: string, updates: Partial<typeof newEntry>) => {
    try {
      await updateEntry.mutateAsync({ id, ...updates });
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        await deleteEntry.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete journal entry:', error);
      }
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={newEntry.tags.includes(tag.name) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={{ 
                        backgroundColor: newEntry.tags.includes(tag.name) ? tag.color : undefined,
                        borderColor: tag.color
                      }}
                      onClick={() => {
                        setNewEntry(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag.name)
                            ? prev.tags.filter(t => t !== tag.name)
                            : [...prev.tags, tag.name]
                        }));
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEntry} disabled={createEntry.isPending}>
                  {createEntry.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans le journal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Humeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les humeurs</SelectItem>
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

          {/* Tags sélectionnés */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des entrées */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {entries.length === 0 ? "Commencez votre journal de trading" : "Aucune entrée ne correspond à vos filtres"}
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
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEntry(entry.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
