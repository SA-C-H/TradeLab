import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSession } from '@/hooks/use-supabase-session';
import { useAccount } from '@/contexts/AccountContext';
import { requireUserId } from '@/lib/require-user-id';
import type { Database } from '@/integrations/supabase/types';

export type JournalEntry = Database['public']['Tables']['trading_journal']['Row'];
export type NewJournalEntry = Omit<Database['public']['Tables']['trading_journal']['Insert'], 'user_id' | 'id' | 'created_at' | 'updated_at'>;

export function useTradingJournal() {
  const { session, ready } = useSupabaseSession();
  const { currentAccount } = useAccount();

  return useQuery({
    queryKey: ['trading_journal', session?.user?.id, currentAccount?.id],
    enabled: ready && !!session?.user && !!currentAccount?.id,
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase
        .from('trading_journal')
        .select('*')
        .eq('account_id', currentAccount!.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  const { currentAccount } = useAccount();

  return useMutation({
    mutationFn: async (entry: NewJournalEntry) => {
      const uid = await requireUserId();
      if (!currentAccount?.id) throw new Error('No account selected');
      
      const { data, error } = await supabase
        .from('trading_journal')
        .insert({
          ...entry,
          user_id: uid,
          account_id: currentAccount.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trading_journal'] });
    },
  });
}

export function useUpdateJournalEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewJournalEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('trading_journal')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trading_journal'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trading_journal')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trading_journal'] });
    },
  });
}

export function useJournalTags() {
  const { session, ready } = useSupabaseSession();

  return useQuery({
    queryKey: ['journal_tags', session?.user?.id],
    enabled: ready && !!session?.user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateJournalTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (tag: { name: string; color?: string }) => {
      const uid = await requireUserId();
      
      const { data, error } = await supabase
        .from('journal_tags')
        .insert({
          ...tag,
          user_id: uid,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journal_tags'] });
    },
  });
}
