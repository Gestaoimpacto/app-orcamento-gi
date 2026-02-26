
import React, { useState, useMemo, useEffect } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';

const KpiCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'yellow';
    note?: string;
    className?: string;
}> = ({ title, value, icon, color, note, className = '' }) => {
    const colorClasses = {
        orange: 'bg-orange-100 text-orange-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    };
    return (
        <div className={clsx("bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between", className)}>
            <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-500 truncate">{title}</h3>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="mt-2 text-3xl font-bold text-brand-dark">{value}</p>
                {note && <p className="text-xs text-gray-400 mt-1 truncate">{note}</p>}
            </div>
        </div>
    );
};

const MarketComparison: React.FC = () => {
    const { summary2025 } = usePlan();

    const benchmarks = {
        ebitdaMargin: { user: summary2025.margemEbitda, avg: 25, top10: 40 },
        cac: { user: summary2025.cac, avg: 1200, top10: 800 },
        ltvCac: { user: summary2025.relacaoLtvCac, avg: 3, top10: 10 },
    };

    const getComparison = (userValue: number, avg: number, top10: number, isHigherBetter: boolean) => {
        if (userValue === 0) return { text: "Preencha seus dados para comparar.", color: "text-gray-500"};
        
        if(isHigherBetter){
            if(userValue >= top10) return { text: `🏆 Excelente! Você está entre os Top 10% do setor.`, color: "text-green-600 font-bold" };
            if(userValue >= avg) return { text: `✅ Bom! ${formatPercentage(((userValue / avg) - 1) * 100, 0)} acima da média.`, color: "text-green-600" };
            return { text: `⚠️ Atenção! ${formatPercentage(100 - (userValue / avg) * 100, 0)} abaixo da média.`, color: "text-red-600" };
        } else { // Lower is better
            if(userValue <= top10) return { text: `🏆 Excelente! Você está entre os Top 10% do setor.`, color: "text-green-600 font-bold" };
            if(userValue <= avg) return { text: `✅ Bom! ${formatPercentage(100 - (userValue / avg) * 100, 0)} abaixo da média.`, color: "text-green-600" };
            return { text: `⚠️ Atenção! ${formatPercentage(((userValue / avg) - 1) * 100, 0)} acima da média.`, color: "text-red-600" };
        }
    };
    
    const ebitdaComp = getComparison(benchmarks.ebitdaMargin.user, benchmarks.ebitdaMargin.avg, benchmarks.ebitdaMargin.top10, true);
    const cacComp = getComparison(benchmarks.cac.user, benchmarks.cac.avg, benchmarks.cac.top10, false);
    const ltvCacComp = getComparison(benchmarks.ltvCac.user, benchmarks.ltvCac.avg, benchmarks.ltvCac.top10, true);


    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-lg font-bold text-brand-blue mb-3">Seu Desempenho vs. Mercado</h2>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm">Margem EBITDA</h4>
                    <p className="text-xs text-gray-500">Você: <span className="font-bold">{formatPercentage(benchmarks.ebitdaMargin.user)}</span> | Média: {formatPercentage(benchmarks.ebitdaMargin.avg)} | Top 10%: {formatPercentage(benchmarks.ebitdaMargin.top10)}</p>
                    <p className={`text-xs mt-1 ${ebitdaComp.color}`}>{ebitdaComp.text}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm">CAC (Custo de Aquisição)</h4>
                    <p className="text-xs text-gray-500">Você: <span className="font-bold">{formatCurrency(benchmarks.cac.user)}</span> | Média: {formatCurrency(benchmarks.cac.avg)} | Top 10%: {formatCurrency(benchmarks.cac.top10)}</p>
                     <p className={`text-xs mt-1 ${cacComp.color}`}>{cacComp.text}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-sm">LTV / CAC</h4>
                    <p className="text-xs text-gray-500">Você: <span className="font-bold">{formatNumber(benchmarks.ltvCac.user)}x</span> | Ideal: &gt;{benchmarks.ltvCac.avg}x | Top 10%: &gt;{benchmarks.ltvCac.top10}x</p>
                     <p className={`text-xs mt-1 ${ltvCacComp.color}`}>{ltvCacComp.text}</p>
                </div>
            </div>
             <p className="text-right text-[10px] text-gray-400 mt-3">Fonte: Dados agregados e anonimizados do setor.</p>
        </div>
    );
};

const SimInput: React.FC<{ label: string, value: number, onChange: (v: number) => void, prefix?: string, suffix?: string, disabled: boolean }> = ({ label, value, onChange, prefix, suffix, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative mt-1">
            {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</span>}
            <input type="number" value={value} onChange={e => onChange(e.target.valueAsNumber || 0)} disabled={disabled} className={`w-full p-2 border-gray-300 rounded-md text-sm text-center disabled:bg-gray-200 disabled:cursor-not-allowed ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`} />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{suffix}</span>}
        </div>
    </div>
);

const ResultRow: React.FC<{ label: string, baseValue: string, simValue: string, growth: number, higherIsBetter: boolean }> = ({ label, baseValue, simValue, growth, higherIsBetter }) => {
     const isPositive = growth >= 0;
     const color = (higherIsBetter && isPositive) || (!higherIsBetter && !isPositive) ? 'text-green-600' : 'text-red-600';
     return (
         <tr className="border-t">
            <td className="py-2 font-medium text-gray-600">{label}</td>
            <td className="py-2 text-right text-gray-500">{baseValue}</td>
            <td className="py-2 text-right font-bold text-brand-dark">{simValue}</td>
            <td className={`py-2 text-right font-bold ${color}`}>{isPositive ? '▲' : '▼'} {formatPercentage(Math.abs(growth))}</td>
         </tr>
     );
};

const WhatIfSimulator: React.FC = () => {
    const { summary2025 } = usePlan();

    const [simTicket, setSimTicket] = useState(0);
    const [simNewHires, setSimNewHires] = useState(0);
    const [simMarketing, setSimMarketing] = useState(0);
    const [simVarCostReduction, setSimVarCostReduction] = useState(0);
    
    const isEnabled = summary2025 && summary2025.receitaBrutaTotal > 0;

    const simulation = useMemo(() => {
        if (!isEnabled) return null;
        
        const base = summary2025;
        
        const newCustomersFromMarketing = base.cac > 0 ? simMarketing / base.cac : 0;
        const newTicketMedio = base.ticketMedio * (1 + simTicket / 100);
        
        const simulatedGrossRevenue = base.receitaBrutaTotal * (1 + simTicket / 100) + (newCustomersFromMarketing * newTicketMedio);

        const baseVarCostRate = base.custosVariaveisTotal / base.receitaBrutaTotal;
        const newVarCostRate = baseVarCostRate * (1 - simVarCostReduction / 100);
        const simulatedVarCosts = simulatedGrossRevenue * newVarCostRate;

        const simulatedFixedCosts = base.custosFixosTotal + (simNewHires * (base.custoColaboradorAno || 90000)) + simMarketing;
        
        const taxRate = base.receitaBrutaTotal > 0 ? (base.receitaBrutaTotal - base.receitaTotal) / base.receitaBrutaTotal : 0;
        const simulatedNetRevenue = simulatedGrossRevenue * (1 - taxRate);
        const simulatedEBITDA = simulatedNetRevenue - simulatedVarCosts - simulatedFixedCosts;
        const simulatedEBITDAMargin = simulatedNetRevenue > 0 ? (simulatedEBITDA / simulatedNetRevenue) * 100 : 0;
        
        const totalNewCustomers = base.novosClientesTotal + newCustomersFromMarketing;
        const totalMarketingInvestment = base.investimentoMarketingTotal + simMarketing;
        const simulatedCAC = totalNewCustomers > 0 ? totalMarketingInvestment / totalNewCustomers : 0;

        return {
            simulatedNetRevenue,
            simulatedEBITDA,
            simulatedEBITDAMargin,
            simulatedCAC,
            totalNewCustomers,
        };
    }, [isEnabled, summary2025, simTicket, simNewHires, simMarketing, simVarCostReduction]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-brand-blue mb-1">Simulador What-If</h2>
            <p className="text-sm text-gray-600 mb-4">Analise o impacto de diferentes alavancas no seu resultado de 2026.</p>
            {!isEnabled && (
                <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="font-semibold text-gray-700">Preencha os dados de Receita de 2025 para ativar o simulador.</p>
                    <p className="text-sm text-gray-500 mt-1">Vá para a aba "Coleta de Dados" e insira a Receita Bruta.</p>
                </div>
            )}
            <div className={clsx("grid grid-cols-1 lg:grid-cols-2 gap-6", !isEnabled && "opacity-40")}>
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <h3 className="font-semibold text-center">Alavancas de Crescimento</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <SimInput label="Aumentar Ticket Médio" value={simTicket} onChange={setSimTicket} suffix="%" disabled={!isEnabled} />
                        <SimInput label="Reduzir Custo Variável (CMV)" value={simVarCostReduction} onChange={setSimVarCostReduction} suffix="%" disabled={!isEnabled} />
                        <SimInput label="Novas Contratações" value={simNewHires} onChange={setSimNewHires} suffix="pessoas" disabled={!isEnabled} />
                        <SimInput label="Investimento Adicional em MKT" value={simMarketing} onChange={setSimMarketing} prefix="R$" disabled={!isEnabled} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold text-center">Resultados Projetados</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="text-left font-normal py-1">Métrica</th>
                                <th className="text-right font-normal py-1">2025</th>
                                <th className="text-right font-normal py-1">Simulado</th>
                                <th className="text-right font-normal py-1">Variação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {simulation && (
                                <>
                                    <ResultRow label="Receita Líquida" baseValue={formatCurrency(summary2025.receitaTotal, true)} simValue={formatCurrency(simulation.simulatedNetRevenue, true)} growth={(simulation.simulatedNetRevenue / summary2025.receitaTotal - 1) * 100} higherIsBetter={true} />
                                    <ResultRow label="EBITDA" baseValue={formatCurrency(summary2025.ebitda, true)} simValue={formatCurrency(simulation.simulatedEBITDA, true)} growth={(simulation.simulatedEBITDA / summary2025.ebitda - 1) * 100} higherIsBetter={true} />
                                    <ResultRow label="Margem EBITDA" baseValue={formatPercentage(summary2025.margemEbitda)} simValue={formatPercentage(simulation.simulatedEBITDAMargin)} growth={simulation.simulatedEBITDAMargin - summary2025.margemEbitda} higherIsBetter={true} />
                                    <ResultRow label="Novos Clientes" baseValue={formatNumber(summary2025.novosClientesTotal)} simValue={formatNumber(simulation.totalNewCustomers)} growth={(simulation.totalNewCustomers / summary2025.novosClientesTotal - 1) * 100} higherIsBetter={true} />
                                    <ResultRow label="CAC" baseValue={formatCurrency(summary2025.cac)} simValue={formatCurrency(simulation.simulatedCAC)} growth={(simulation.simulatedCAC / summary2025.cac - 1) * 100} higherIsBetter={false} />
                                </>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { summary2025, planData, generateBenchmarkAnalysis } = usePlan();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        await generateBenchmarkAnalysis();
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Dashboard Estratégico</h1>
                <p className="text-lg text-gray-600 mt-2">Visão consolidada da performance de 2025 e insights para 2026.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Receita Líquida 2025" value={formatCurrency(summary2025.receitaTotal, true)} note="Faturamento total do ano" color="blue" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <KpiCard title="Margem EBITDA" value={formatPercentage(summary2025.margemEbitda)} note={`Total: ${formatCurrency(summary2025.ebitda, true)}`} color="green" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <KpiCard title="LTV / CAC" value={`${formatNumber(summary2025.relacaoLtvCac)}x`} note="Ideal: > 3x" color="orange" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <KpiCard title="Ponto de Equilíbrio" value={formatCurrency(summary2025.pontoEquilibrioContabil, true)} note="Receita mínima/mês" color="yellow" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-brand-blue mb-4">Performance Mensal 2025</h2>
                        <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={summary2025.monthlySummary} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => formatCurrency(value, true)} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="receita" name="Receita" stroke="#EE7533" strokeWidth={2} />
                                <Line type="monotone" dataKey="custos" name="Custos" stroke="#DC3545" strokeWidth={2} />
                                <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#28A745" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <MarketComparison />
                </div>
            </div>
            
            {/* What-If Simulator */}
            <div className="w-full">
                <WhatIfSimulator />
            </div>

            {/* AI Analysis */}
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="text-lg font-bold text-brand-blue">Análise de Mercado com IA</h2>
                    <button onClick={handleGenerateAnalysis} disabled={isLoading || !planData.companyProfile.industry} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Analisando...' : 'Gerar Análise com IA'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 -mt-2">Compare seus KPIs com o mercado. Preencha o Ramo de Atividade nas Configurações.</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md mt-4 min-h-[150px]">
                    {planData.analysis?.benchmarkAnalysis || "A análise da IA sobre seu posicionamento de mercado aparecerá aqui."}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
    