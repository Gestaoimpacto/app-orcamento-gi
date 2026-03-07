
import React, { useState } from 'react';
import type { View } from '../types';
import { User } from '../types';
import { usePlan } from '../hooks/usePlanData';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const NavButton: React.FC<{
  id: View;
  label: string;
  icon: React.ReactNode;
  currentView: View;
  onClick: () => void;
  progress: { status: 'completed' | 'inprogress' | 'notstarted', percentage: number } | undefined;
}> = ({ id, label, icon, currentView, onClick, progress }) => {
    const statusIcons = {
        completed: <span className="text-green-400">✅</span>,
        inprogress: <span className="text-yellow-400">⚠️</span>,
        notstarted: <span className="text-red-400">❌</span>,
    };

    const currentProgress = progress || { status: 'notstarted', percentage: 0 };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-lg transition-colors duration-200 text-left ${
            currentView === id
                ? 'bg-brand-orange text-white'
                : 'text-gray-400 hover:bg-brand-blue hover:text-white'
            }`}
        >
            <div className="flex items-center">
                {icon}
                <span className="ml-4 font-semibold">{label}</span>
            </div>
            <div className="flex items-center text-xs">
                {statusIcons[currentProgress.status]}
                <span className="ml-2 font-mono w-8 text-right">{currentProgress.percentage}%</span>
            </div>
        </button>
    );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="px-4 mt-6 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h2>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout }) => {
  const { progressStatus, saveStatus, saveDataNow, lastSaved } = usePlan();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
      setIsLoggingOut(true);
      // Force save before logout
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
          await saveDataNow();
      }
      onLogout();
  };

  const mainNavItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m-6 0H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-3m-6 0v-6" /></svg> },
    { id: 'settings', label: 'Configurações', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];
  
  const phase1Items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'data-collection', label: '1. Coleta de Dados 2025', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { id: 'taxes', label: '2. Impostos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
    { id: 'strategic-analysis', label: '3. Análise Estratégica', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  ];
  
  const phase2Items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'goal-setting', label: '4. Metas & Objetivos', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { id: 'okrs-kpis', label: '5. OKRs & KPIs', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg> },
    { id: 'commercial-planning', label: '6. Plan. Comercial & RH', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { id: 'marketing-funnel', label: '7. Funil de Marketing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> },
    { id: 'action-plan', label: '8. Plano de Ação', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
    { id: 'scenario-planning', label: '9. Orçamento & Cenários', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { id: 'financial-planning', label: '10. Planejamento Financeiro', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'plan-summary', label: '11. Resumo do Plano', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];
  
  const phase3Items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'monthly-tracking', label: '12. Acompanhamento', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { id: 'dre-comparison', label: '13. Comparativo DRE', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  ];

  const cfoItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'liquidity-dashboard', label: 'Caixa & Liquidez', icon: <span className="text-lg">💧</span> },
    { id: 'financial-ratios', label: 'KPIs Financeiros', icon: <span className="text-lg">📊</span> },
    { id: 'sensitivity-analysis', label: 'Matriz de Sensibilidade', icon: <span className="text-lg">🎯</span> },
  ];
  
  const reportItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'report-generator', label: 'Relatórios & Impressão', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> },
  ];

  const toolItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'pricing-calculator', label: 'Calculadora de Preços', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h3m-3 0v-3m0 0h3m-3 0h-3m3 0v-3m0 0h3m-6 0h6m-6 3h6m-6 0v-3m0 3h-3m3 0v-3m-6-3h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> },
    { id: 'image-editor', label: 'Gemini Image Editor', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  const getSaveStatusDisplay = () => {
      switch(saveStatus) {
          case 'saving': return <span className="text-yellow-400 flex items-center text-xs"><span className="animate-spin mr-1">⟳</span> Salvando...</span>;
          case 'saved': return <span className="text-green-400 flex items-center text-xs">✓ Salvo</span>;
          case 'unsaved': return <span className="text-red-400 text-xs">Alterado</span>;
          case 'error': return <span className="text-red-500 text-xs">Erro ao salvar</span>;
          default: return null;
      }
  }

  return (
    <div className="w-80 bg-brand-dark text-brand-gray flex flex-col h-full no-print">
      <div className="flex flex-col items-center justify-center h-24 border-b border-brand-blue flex-shrink-0 px-4">
         <h1 className="text-xl font-bold text-white tracking-wider">GESTÃO DE IMPACTO</h1>
         <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mt-1 px-2 py-0.5 bg-brand-orange/10 rounded border border-brand-orange/30">v1.0 Oficial</span>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}

        <SectionTitle title="Fase 1: Diagnóstico & Análise" />
        {phase1Items.map((item) => (
          <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}
        
        <SectionTitle title="Fase 2: Planejamento 2026" />
        {phase2Items.map((item) => (
          <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}

        <SectionTitle title="Fase 3: Execução" />
        {phase3Items.map((item) => (
            <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}

        <SectionTitle title="Gestão Financeira (CFO)" />
        {cfoItems.map((item) => (
            <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}

        <SectionTitle title="Relatórios" />
        {reportItems.map((item) => (
          <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}
        
        <SectionTitle title="Ferramentas" />
        {toolItems.map((item) => (
          <NavButton key={item.id} {...item} progress={progressStatus[item.id]} currentView={currentView} onClick={() => setCurrentView(item.id)} />
        ))}
      </nav>
       <div className="px-4 py-4 border-t border-brand-blue mt-auto flex-shrink-0 space-y-3">
            {/* Manual Save Section */}
            <div className="flex items-center justify-between bg-brand-blue/30 p-2 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-gray-400 font-bold">Status</span>
                    {getSaveStatusDisplay()}
                </div>
                <button 
                    onClick={() => saveDataNow()}
                    disabled={saveStatus === 'saving'}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${saveStatus === 'unsaved' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-brand-blue text-gray-300 hover:bg-gray-700'}`}
                >
                    Salvar Agora
                </button>
            </div>

            <div>
                <div className="font-bold text-white truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate mb-2">{user?.email}</div>
                <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-orange/20 rounded-lg hover:bg-brand-orange/40 transition-colors"
                >
                    {isLoggingOut ? (
                        <span className="flex items-center">Salvando...</span>
                    ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Sair
                        </>
                    )}
                </button>
            </div>
      </div>
    </div>
  );
};

export default Sidebar;
