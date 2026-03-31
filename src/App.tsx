import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/i18n/I18nProvider';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { AccountProvider } from '@/contexts/AccountContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Trades from '@/pages/Trades';
import NewTrade from '@/pages/NewTrade';
import Analytics from '@/pages/Analytics';
import TradingViewPage from '@/pages/TradingViewPage';
import CalendarView from '@/pages/CalendarView';
import Playbook from '@/pages/Playbook';
import TradingPlan from '@/pages/TradingPlan';
import Gallery from '@/pages/Gallery';
import SettingsPage from '@/pages/SettingsPage';
import AIAssistant from '@/pages/AIAssistant';
import TradingJournalSimple from '@/pages/TradingJournalSimple';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="trade-mastermind-theme">
    <I18nProvider>
    <SupabaseAuthProvider>
    <AccountProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/trades/new" element={<NewTrade />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/charts" element={<TradingViewPage />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/playbook" element={<Playbook />} />
            <Route path="/plan" element={<TradingPlan />} />
            <Route path="/gallery" element={<Gallery />} />
            {/* <Route path="/journal" element={<TradingJournalSimple />} /> */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai" element={<AIAssistant />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AccountProvider>
    </SupabaseAuthProvider>
    </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
