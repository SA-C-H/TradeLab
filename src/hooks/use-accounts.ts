import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useSupabaseSession } from './use-supabase-session';
import { toast } from 'sonner';

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

export function useAccounts() {
  const { session } = useSupabaseSession();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!session?.user?.id,
  });

  const createAccount = useMutation({
    mutationFn: async (account: Omit<AccountInsert, 'user_id'>) => {
      if (!session?.user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('accounts')
        .insert({ ...account, user_id: session.user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Compte créé avec succès');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du compte');
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...update }: AccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Compte mis à jour avec succès');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du compte');
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Compte supprimé avec succès');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression du compte');
    },
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}

export function useCurrentAccount() {
  const { session } = useSupabaseSession();
  const { accounts } = useAccounts();
  
  const { data: userSettings } = useQuery({
    queryKey: ['user_settings', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const currentAccount = accounts?.find(account => 
    account.id === userSettings?.default_account_id
  ) || accounts?.[0];

  return {
    currentAccount,
    hasAccounts: !!accounts?.length,
  };
}
