
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ImageEditor from './components/ImageEditor';
import DataCollection from './components/DataCollection';
import GoalSetting from './components/GoalSetting';
import ScenarioPlanning from './components/ScenarioPlanning';
import MonthlyTracking from './components/MonthlyTracking';
import Taxes from './components/Taxes';
import { StrategicAnalysis } from './components/StrategicAnalysis';
import ActionPlan from './components/ActionPlan';
import Settings from './components/Settings';
import FinancialPlanning2026 from './components/FinancialPlanning2026';
import CommercialPlanning from './components/CommercialPlanning';
import OkrsAndKpis from './components/OkrsAndKpis';
import PlanSummary from './components/PlanSummary';
import PricingCalculator from './components/PricingCalculator';
import ReportGenerator from './components/ReportGenerator';
import Login from './components/Login';
import MarketingFunnel from './components/MarketingFunnel';
import DreComparison from './components/DreComparison';
import LiquidityDashboard from './components/LiquidityDashboard';
import FinancialRatiosDashboard from './components/FinancialRatiosDashboard';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import OnboardingWizard from './components/OnboardingWizard';
import { User, View } from './types';
import { PlanProvider, authService, usePlan } from './hooks/usePlanData';
import SubscriptionExpiredPage from './components/SubscriptionExpiredPage';

const MainLayout: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const { subscriptionStatus } = usePlan();

    const renderView = () => {
        switch (currentView) {
            case 'dashboard': return <Dashboard />;
            case 'settings': return <Settings />;
            case 'data-collection': return <DataCollection />;
            case 'strategic-analysis': return <StrategicAnalysis />;
            case 'goal-setting': return <GoalSetting />;
            case 'okrs-kpis': return <OkrsAndKpis />;
            case 'commercial-planning': return <CommercialPlanning />;
            case 'marketing-funnel': return <MarketingFunnel />;
            case 'action-plan': return <ActionPlan />;
            case 'scenario-planning': return <ScenarioPlanning />;
            case 'financial-planning': return <FinancialPlanning2026 />;
            case 'plan-summary': return <PlanSummary />;
            case 'monthly-tracking': return <MonthlyTracking />;
            case 'dre-comparison': return <DreComparison />;
            case 'taxes': return <Taxes />;
            case 'image-editor': return <ImageEditor />;
            case 'pricing-calculator': return <PricingCalculator />;
            case 'report-generator': return <ReportGenerator />;
            case 'liquidity-dashboard': return <LiquidityDashboard />;
            case 'financial-ratios': return <FinancialRatiosDashboard />;
            case 'sensitivity-analysis': return <SensitivityAnalysis />;
            default: return <Dashboard />;
        }
    };

    if (subscriptionStatus === 'loading') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-brand-light-gray">
                <div className="text-brand-dark font-semibold">Verificando assinatura...</div>
            </div>
        );
    }

    if (subscriptionStatus === 'expired' || subscriptionStatus === 'not_found' || subscriptionStatus === 'inactive') {
        return <SubscriptionExpiredPage status={subscriptionStatus} onLogout={onLogout} />;
    }

    if (subscriptionStatus === 'active') {
        return (
            <div className="flex h-screen bg-brand-light-gray text-gray-800 relative">
                <OnboardingWizard />
                <Sidebar 
                    currentView={currentView} 
                    setCurrentView={setCurrentView} 
                    user={user}
                    onLogout={onLogout}
                />
                <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-brand-light-gray">
            <div className="text-red-500 font-semibold text-center p-4">
                <h2 className="text-xl">Ocorreu um erro</h2>
                <p className="mt-2">Não foi possível verificar o estado da sua conta. Por favor, tente sair e entrar novamente.</p>
                 <button 
                    onClick={onLogout}
                    className="mt-4 px-4 py-2 bg-brand-orange text-white rounded-md"
                >
                    Sair
                </button>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use the authService wrapper instead of direct Firebase auth
    const unsubscribe = authService.subscribe((firebaseUser: any) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
        if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
        await authService.logout();
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-brand-light-gray">
            <div className="text-brand-dark font-semibold">Carregando...</div>
        </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <PlanProvider user={user}>
      <MainLayout user={user} onLogout={handleLogout} />
    </PlanProvider>
  );
};

export default App;
