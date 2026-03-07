
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

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="w-12 h-12 bg-brand-orange rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white font-black text-lg">GI</span>
            </div>
            <p className="text-gray-500 font-medium text-sm">{message}</p>
        </div>
    </div>
);

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
        return <LoadingScreen message="Verificando assinatura..." />;
    }

    if (subscriptionStatus === 'expired' || subscriptionStatus === 'not_found' || subscriptionStatus === 'inactive') {
        return <SubscriptionExpiredPage status={subscriptionStatus} onLogout={onLogout} />;
    }

    if (subscriptionStatus === 'active') {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-800 relative">
                <OnboardingWizard />
                <Sidebar 
                    currentView={currentView} 
                    setCurrentView={setCurrentView} 
                    user={user}
                    onLogout={onLogout}
                />
                <main className="flex-1 p-6 lg:p-8 xl:p-10 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {renderView()}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Ocorreu um erro</h2>
                <p className="mt-2 text-sm text-gray-500">Nao foi possivel verificar o estado da sua conta. Por favor, tente sair e entrar novamente.</p>
                <button 
                    onClick={onLogout}
                    className="mt-6 px-6 py-2.5 bg-brand-orange text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors text-sm"
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
    return <LoadingScreen />;
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
