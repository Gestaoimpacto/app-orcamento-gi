

import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const ComparisonCard: React.FC<{
    title: string;
    value2025: string;
    value2026: string;
    growth: number;
    growthIsGood: boolean;
}> = ({ title, value2025, value2026, growth, growthIsGood }) => {
    const growthIsPositive = growth >= 0;
    const growthColor = growthIsGood ? (growthIsPositive ? 'text-green-500' : 'text-red-500') : (growthIsPositive ? 'text-red-500' : 'text-green-500');
    const arrow = growthIsPositive ? '▲' : '▼';

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 truncate">{title}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 items-baseline">
                <div>
                    <p className="text-[10px] text-gray-400">2025 Realizado</p>
                    <p className="text-lg font-bold text-gray-700">{value2025}</p>
                </div>
                <div>
                    <p className="text-[10px] text-brand-blue font-medium">2026 Plano</p>
                    <p className="text-lg font-bold text-brand-dark">{value2026}</p>
                </div>
            </div>
            <div className={`mt-2 text-center font-bold text-base ${growthColor} flex items-center justify-center`}>
                <span>{arrow} {formatPercentage(Math.abs(growth))}</span>
            </div>
        </div>
    );
};


const PlanSummary: React.FC = () => {
    const { planData, summary2025, goals2026, scenarios2026, baseScenario, generateStrategicSummaryAndActions } = usePlan();
    const [isLoading, setIsLoading] = useState(false);

    const sumMonthlyData = (data: { [key: string]: number | null }): number => 
        Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

    const summary2026 = React.useMemo(() => {
        const scenario = scenarios2026[baseScenario];
        const receitaTotal = sumMonthlyData(scenario.receitaProjetada);
        const custosTotal = sumMonthlyData(scenario.custosProjetados);
        const despesasTotal = sumMonthlyData(scenario.despesasProjetadas);
        const ebitda = receitaTotal - custosTotal - despesasTotal;
        const margemEbitda = receitaTotal > 0 ? (ebitda / receitaTotal) * 100 : 0;

        return {
            receitaTotal,
            ebitda,
            margemEbitda,
            novosClientes: sumMonthlyData(goals2026.comerciais.metaNumClientes),
            ticketMedio: goals2026.comerciais.metaTicketMedio,
            headcount: goals2026.pessoas.metaHeadcount,
            turnover: goals2026.pessoas.metaTurnover
        };
    }, [scenarios2026, baseScenario, goals2026]);

    const getGrowth = (newValue?: number, oldValue?: number) => {
        if (oldValue === undefined || newValue === undefined || oldValue === 0) return 0;
        return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    };
    
    const chartData = [
        { name: 'Receita', '2025': summary2025.receitaTotal, '2026': summary2026.receitaTotal },
        { name: 'EBITDA', '2025': summary2025.ebitda, '2026': summary2026.ebitda },
    ];

    const kpiData = [
        { name: 'Novos Clientes', '2025': summary2025.novosClientesTotal, '2026': summary2026.novosClientes },
        { name: 'Headcount', '2025': summary2025.headcountFinal, '2026': summary2026.headcount },
    ];

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        await generateStrategicSummaryAndActions();
        setIsLoading(false);
    };


    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Resumo do Plano: 2025 vs 2026</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Visão executiva comparando os resultados de 2025 com as metas e projeções para 2026 (cenário <span className="font-bold">{baseScenario}</span>).
                </p>
            </header>
            
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ComparisonCard 
                    title="Receita Líquida"
                    value2025={formatCurrency(summary2025.receitaTotal, true)}
                    value2026={formatCurrency(summary2026.receitaTotal, true)}
                    growth={getGrowth(summary2026.receitaTotal, summary2025.receitaTotal)}
                    growthIsGood={true}
                />
                 <ComparisonCard 
                    title="EBITDA"
                    value2025={formatCurrency(summary2025.ebitda, true)}
                    value2026={formatCurrency(summary2026.ebitda, true)}
                    growth={getGrowth(summary2026.ebitda, summary2025.ebitda)}
                    growthIsGood={true}
                />
                 <ComparisonCard 
                    title="Margem EBITDA"
                    value2025={formatPercentage(summary2025.margemEbitda)}
                    value2026={formatPercentage(summary2026.margemEbitda)}
                    growth={(summary2026.margemEbitda || 0) - summary2025.margemEbitda}
                    growthIsGood={true}
                />
                 <ComparisonCard 
                    title="Novos Clientes"
                    value2025={formatNumber(summary2025.novosClientesTotal)}
                    value2026={formatNumber(summary2026.novosClientes)}
                    growth={getGrowth(summary2026.novosClientes, summary2025.novosClientesTotal)}
                    growthIsGood={true}
                />
                <ComparisonCard 
                    title="Ticket Médio"
                    value2025={formatCurrency(summary2025.ticketMedio)}
                    value2026={formatCurrency(summary2026.ticketMedio)}
                    growth={getGrowth(summary2026.ticketMedio, summary2025.ticketMedio)}
                    growthIsGood={true}
                />
                <ComparisonCard 
                    title="Headcount Final"
                    value2025={formatNumber(summary2025.headcountFinal)}
                    value2026={formatNumber(summary2026.headcount)}
                    growth={getGrowth(summary2026.headcount, summary2025.headcountFinal)}
                    growthIsGood={true}
                />
                <ComparisonCard 
                    title="Turnover Anual"
                    value2025={formatPercentage(summary2025.turnoverPercent)}
                    value2026={formatPercentage(summary2026.turnover)}
                    growth={(summary2026.turnover || 0) - summary2025.turnoverPercent}
                    growthIsGood={false}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-brand-blue mb-4">Financeiro: 2025 vs 2026</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="2025" fill="#a1a1aa" name="2025 (Realizado)" />
                                <Bar dataKey="2026" fill="#EE7533" name="2026 (Plano)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-brand-blue mb-4">Operacional: 2025 vs 2026</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={kpiData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => formatNumber(value, true)} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => formatNumber(value)} />
                                <Legend />
                                <Bar dataKey="2025" fill="#a1a1aa" name="2025 (Realizado)" />
                                <Bar dataKey="2026" fill="#213242" name="2026 (Plano)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            {/* AI Strategic Analysis Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                 <div className="flex flex-wrap gap-4 justify-between items-center border-b pb-3">
                    <h2 className="text-2xl font-bold text-brand-blue">Análise Estratégica & Plano de Ação da IA</h2>
                    <button onClick={handleGenerateAnalysis} disabled={isLoading} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400">
                        {isLoading ? 'Analisando Cenário...' : 'Gerar Análise Estratégica Completa'}
                    </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[200px] font-sans leading-relaxed">
                    {planData.analysis.strategicSummary || "Clique no botão acima para a IA analisar todos os seus dados (SWOT, Portfólio, Custos, Metas, etc.), gerar um diagnóstico e criar um plano de ação inicial para você na Aba 7."}
                </div>
                 {planData.analysis.strategicSummary && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                        <p className="font-bold">Plano de Ação Criado!</p>
                        <p className="text-sm mt-1">
                            A IA adicionou as ações recomendadas na sua <strong>Aba 7 - Plano de Ação</strong>. Visite a aba para revisar, detalhar e atribuir responsáveis.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PlanSummary;