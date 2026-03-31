import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccounts, useCurrentAccount } from '@/hooks/use-accounts';
import { useSaveUserSettings, useUserSettings } from '@/hooks/use-user-settings';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useSupabaseSession } from '@/hooks/use-supabase-session';

type Account = Database['public']['Tables']['accounts']['Row'];

interface AccountContextType {
  currentAccount: Account | null;
  accounts: Account[];
  setCurrentAccount: (account: Account) => void;
  isLoading: boolean;
  hasAccounts: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { session } = useSupabaseSession();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { currentAccount: defaultCurrentAccount, hasAccounts } = useCurrentAccount();
  const saveUserSettings = useSaveUserSettings();
  const { data: userSettings } = useUserSettings();
  
  const [currentAccount, setCurrentAccountState] = useState<Account | null>(null);

  useEffect(() => {
    if (defaultCurrentAccount) {
      setCurrentAccountState(defaultCurrentAccount);
    }
  }, [defaultCurrentAccount]);

  const setCurrentAccount = async (account: Account) => {
    setCurrentAccountState(account);
    
    if (session?.user?.id && userSettings) {
      try {
        await saveUserSettings.mutateAsync({
          ...userSettings,
          defaultAccountId: account.id,
        });
      } catch (error) {
        console.error('Failed to save default account:', error);
      }
    }
  };

  return (
    <AccountContext.Provider
      value={{
        currentAccount,
        accounts: accounts || [],
        setCurrentAccount,
        isLoading: accountsLoading,
        hasAccounts,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
