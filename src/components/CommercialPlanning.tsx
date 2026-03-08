
import React, { useState, useMemo, useEffect } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { SalesFunnelData, HiringProjectionItem, DriverBasedPlanningData, Month, MONTHS, MONTH_LABELS, MonthlyData, DemandChannel } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import CurrencyInput from './shared/CurrencyInput';
import clsx from 'clsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';


type CommercialPlanningTab = 'demand' | 'funnel' | 'hiring' | 'driver-based' | 'people-analytics';

// --- HELPER FUNCTIONS (LOCAL) ---
const sumMonthlyData = (data?: MonthlyData): number => data ? Object.values(data).reduce((sum, val) => sum + (Number(val) || 0), 0) : 0;
const avgMonthlyData = (data?: MonthlyData): number => {
    if (!data) return 0;
    const values = Object.values(data).filter(v => v !== undefined && v !== null);
    return values.length > 0 ? values.reduce((sum, val) => sum + (val || 0), 0) / values.length : 0;
};


// --- SUB-COMPONENTS ---
const InfoBox: React.FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center border">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 my-1">{value}</p>
        <p className="text-xs text-gray-500">{hint}</p>
    </div>
);

const InputField: React.FC<{
    label: string;
    value: number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    prefix?: string;
    suffix?: string;
    hint: string;
}> = ({ label, value, onChange, prefix, suffix, hint }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            {prefix && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">{prefix}</span></div>}
            <CurrencyInput
                value={value ?? null}
                onChange={(v) => onChange({ target: { value: v } } as any)}
                className={`block w-full rounded-xl border border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
                placeholder="0"
            />
            {suffix && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">{suffix}</span></div>}
        </div>
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
);

const PeopleAnalyticsDashboard: React.FC = () => {
    const { planData, goals2026, summary2025 } = usePlan();
    
    const revenuePerEmployee2025 = summary2025.headcountMedio > 0 ? summary2025.receitaTotal / summary2025.headcountMedio : 0;
    const { productivityGainFactor, projectedRevenue } = planData.analysis.peopleAnalytics;

    const metricsRows = [
        { label: "Receita por Colaborador 2025", value: formatCurrency(revenuePerEmployee2025), hint: "Linha de base de produtividade." },
        { label: "Meta de Redução de Turnover", value: `${formatPercentage(summary2025.turnoverPercent)} ➔ ${formatPercentage(goals2026.pessoas.metaTurnover)}`, hint: "Menos turnover aumenta a produtividade." },
        { label: "Meta de ROI de Treinamento", value: `${formatNumber(summary2025.roiTreinamento)}x ➔ ${formatNumber(goals2026.pessoas.metaRoiTreinamento)}x`, hint: "Equipes mais treinadas são mais eficientes." },
        { label: "Bônus de Produtividade Calculado", value: formatPercentage(productivityGainFactor), hint: "Ganho percentual estimado com base nas metas de RH.", isHighlight: true, color: 'text-green-600' },
        { label: "Receita/Colaborador Projetada 2026", value: formatCurrency(revenuePerEmployee2025 * (1 + productivityGainFactor / 100)), hint: "Produtividade base + Bônus." },
        { label: "Headcount Projetado 2026", value: formatNumber(goals2026.pessoas.metaHeadcount), hint: "Vindo da sua Meta de Pessoas." },
        { label: "Projeção de Receita (Bottom-Up)", value: formatCurrency(projectedRevenue), hint: "Receita/Colab. 2026 x Headcount 2026.", isHighlight: true, color: 'text-brand-orange' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Dashboard de People Analytics</h2>
            <p className="text-sm text-gray-600 mb-4">
                Esta análise conecta suas metas de gestão de pessoas a um resultado financeiro tangível: a projeção de receita que sua equipe é capaz de gerar (Bottom-Up).
                Use este número para validar as metas de crescimento (Top-Down) nos seus cenários.
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                        {metricsRows.map(row => (
                            <tr key={row.label} className={clsx("hover:bg-gray-50", row.isHighlight && "bg-yellow-50")}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 w-1/3">
                                    {row.label}
                                    <p className="text-xs text-gray-500 font-normal">{row.hint}</p>
                                </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-lg font-bold text-right ${row.color || 'text-gray-900'}`}>
                                    {row.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const CommercialPlanning: React.FC = () => {
    const { planData, goals2026, updateCommercialPlanning, addDemandChannel, removeDemandChannel, updateDemandChannel, generateChannelAnalysis, updateHiringProjectionItem, addHiringProjectionItem, removeHiringProjectionItem, generateFunnelSuggestions, summary2025, updateDriverBasedPlanning } = usePlan();
    const [activeTab, setActiveTab] = useState<CommercialPlanningTab>('demand');
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    const { demandPlanning, salesFunnel, driverBasedPlanning } = planData.commercialPlanning || {};

    // --- Demand Planning Tab Calculations ---
    const demandTotals = useMemo(() => {
        const channels = demandPlanning?.channels || [];
        const totalBudget = channels.reduce((sum, ch) => sum + (ch.budget || 0), 0);
        const totalLeads = channels.reduce((sum, ch) => sum + (ch.leads || 0), 0);
        const totalRevenue = channels.reduce((sum, ch) => sum + (ch.expectedRevenue || 0), 0);
        const avgCpl = totalLeads > 0 ? totalBudget / totalLeads : 0;
        const totalRoi = totalBudget > 0 ? (totalRevenue - totalBudget) / totalBudget : 0;
        return { totalBudget, totalLeads, totalRevenue, avgCpl, totalRoi };
    }, [demandPlanning]);

    // --- Sales Funnel Tab Calculations ---
    const funnelCalculations = useMemo(() => {
        if (!salesFunnel) return { totalLeadsGoal: 0, totalRevenueGoal: 0, mqlsNeeded: 0, sqlsNeeded: 0, salesNeeded: 0, dailyActivitiesNeeded: 0, repsNeeded: 0, avgTicket: 0 };
        
        const totalLeadsGoal = demandTotals.totalLeads;
        const totalRevenueGoal = demandTotals.totalRevenue;

        const txLeadToMql = (salesFunnel.conversionRateLeadToMql || 0) / 100;
        const txMqlToSql = (salesFunnel.conversionRateMqlToSql || 0) / 100;
        const txSqlToSale = (salesFunnel.conversionRateSqlToSale || 0) / 100;

        const mqlsNeeded = totalLeadsGoal * txLeadToMql;
        const sqlsNeeded = mqlsNeeded * txMqlToSql;
        const salesNeeded = sqlsNeeded * txSqlToSale;
        
        const avgTicket = salesNeeded > 0 ? totalRevenueGoal / salesNeeded : (salesFunnel.avgTicket || 0);

        const dailyActivitiesNeeded = salesFunnel.workingDays ? totalLeadsGoal / salesFunnel.workingDays : 0;

        // Ramp-up aware headcount calculation
        const activitiesPerSenior = (salesFunnel.activitiesPerRep || 0) * (salesFunnel.workingDays || 0);
        const rampUpMonths = salesFunnel.rampUpTime || 0;
        const productivityLossFactor = (rampUpMonths / 12) / 2;
        const activitiesPerNewbie = activitiesPerSenior * (1 - productivityLossFactor);
        
        const commercialDept = (planData.hiringProjection || []).find(d => (d.department || '').toLowerCase() === 'comercial');
        const currentReps = commercialDept?.currentHeadcount || 0;
        
        const activitiesFromSeniors = currentReps * activitiesPerSenior;
        const activityDeficit = totalLeadsGoal - activitiesFromSeniors;
        
        let newRepsNeeded = 0;
        if (activityDeficit > 0 && activitiesPerNewbie > 0) {
            newRepsNeeded = activityDeficit / activitiesPerNewbie;
        }

        return { totalLeadsGoal, totalRevenueGoal, mqlsNeeded, sqlsNeeded, salesNeeded, dailyActivitiesNeeded, repsNeeded: newRepsNeeded + currentReps, avgTicket };
    }, [demandTotals, salesFunnel, planData.hiringProjection]);

     // Suggest sales headcount in hiring projection
    useEffect(() => {
        const repsNeeded = Math.ceil(funnelCalculations.repsNeeded);
        const commercialDept = (planData.hiringProjection || []).find(d => (d.department || '').toLowerCase() === 'comercial');
        if (commercialDept && repsNeeded > 0) {
            const current = commercialDept.currentHeadcount || 0;
            const toHire = Math.max(0, repsNeeded - current);
             // Only update if it's different to avoid loops
            if (commercialDept.newHires !== toHire) {
               updateHiringProjectionItem(commercialDept.id, 'newHires', String(toHire));
            }
        }
    }, [funnelCalculations.repsNeeded, planData.hiringProjection, updateHiringProjectionItem]);
    
    // --- Hiring Tab Calculations ---
    const hiringTotals = useMemo(() => {
        const hiringProjection = planData.hiringProjection || [];
        const totalCurrent = hiringProjection.reduce((sum, item) => sum + (item.currentHeadcount || 0), 0);
        const totalNew = hiringProjection.reduce((sum, item) => sum + (item.newHires || 0), 0);
        const totalBudget = hiringProjection.reduce((sum, item) => {
            const headcount2026 = (item.currentHeadcount || 0) + (item.newHires || 0);
            return sum + (headcount2026 * (item.avgAnnualCost || 0));
        }, 0);
        return { totalCurrent, totalNew, totalBudget };
    }, [planData.hiringProjection]);

    // --- Driver-Based Planning Calculations ---
    const driverCalculations = useMemo(() => {
        if (!driverBasedPlanning) return { monthlyResults: [], totals: { leadsQualificados: 0, clientesRecorrentes: 0, novosClientes: 0, totalClientes: 0, receitaTotal: 0, taxaConversao: 0, ticketMedio: 0 }};

        const monthlyResults = MONTHS.map(month => {
            const leads = driverBasedPlanning.leadsQualificados[month] || 0;
            const txConversao = (driverBasedPlanning.taxaConversao[month] || 0) / 100;
            const recorrentes = driverBasedPlanning.clientesRecorrentes[month] || 0;
            const ticket = driverBasedPlanning.ticketMedio[month] || 0;

            const novosClientes = leads * txConversao;
            const totalClientes = recorrentes + novosClientes;
            const receitaTotal = totalClientes * ticket;
            return { novosClientes, totalClientes, receitaTotal };
        });

        const totals = {
            leadsQualificados: sumMonthlyData(driverBasedPlanning.leadsQualificados),
            clientesRecorrentes: sumMonthlyData(driverBasedPlanning.clientesRecorrentes),
            novosClientes: monthlyResults.reduce((s, r) => s + r.novosClientes, 0),
            totalClientes: monthlyResults.reduce((s, r) => s + r.totalClientes, 0),
            receitaTotal: monthlyResults.reduce((s, r) => s + r.receitaTotal, 0),
            taxaConversao: 0,
            ticketMedio: 0
        };
        
        totals.taxaConversao = totals.leadsQualificados > 0 ? (totals.novosClientes / totals.leadsQualificados) * 100 : 0;
        totals.ticketMedio = totals.totalClientes > 0 ? totals.receitaTotal / totals.totalClientes : 0;
        
        return { monthlyResults, totals };
    }, [driverBasedPlanning]);


    // --- AI HANDLERS ---
    const handleGenerateFunnelSuggestions = async () => {
        setIsLoading(prev => ({ ...prev, funnel: true }));
        await generateFunnelSuggestions();
        setIsLoading(prev => ({ ...prev, funnel: false }));
    };

    const handleGenerateChannelAnalysis = async () => {
        setIsLoading(prev => ({ ...prev, channel: true }));
        await generateChannelAnalysis();
        setIsLoading(prev => ({ ...prev, channel: false }));
    };

    const handlePrefillDrivers = () => {
        // Simple heuristic to pre-fill based on 2025 averages
        const avgLeads25 = summary2025.novosClientesTotal / (summary2025.taxaConversaoLeadCliente / 100 || 0.05); // Estimate leads if not tracked
        const realLeads25 = avgLeads25 || 100; // Fallback
        const conversion25 = summary2025.taxaConversaoLeadCliente || 5;
        const ticket25 = summary2025.ticketMedio || 0;
        const clients25 = summary2025.monthlySummary[11]?.receita / summary2025.ticketMedio || 0; // Estimate active clients at end of year

        MONTHS.forEach(m => {
            updateDriverBasedPlanning('leadsQualificados', m, (realLeads25 / 12).toFixed(0));
            updateDriverBasedPlanning('taxaConversao', m, conversion25.toFixed(1).replace('.', ','));
            updateDriverBasedPlanning('ticketMedio', m, ticket25.toFixed(2).replace('.', ','));
            updateDriverBasedPlanning('clientesRecorrentes', m, clients25.toFixed(0)); // Static recurrent base
        });
    };

    const handleImportFromFunnel = () => {
        // 1. Leads: From Demand Planning (Annual Total) distributed monthly
        // We use annual leads from Demand Planning as the "Input"
        const annualLeads = demandTotals.totalLeads || 0;
        const monthlyLeads = annualLeads / 12;

        // 2. Conversion: Aggregate from Funnel (Lead -> Sale)
        // We calculate the full funnel effectiveness
        let aggregateRate = 0;
        const funnel = planData.commercialPlanning.salesFunnel;
        if (funnel) {
            const r1 = (funnel.conversionRateLeadToMql || 0) / 100;
            const r2 = (funnel.conversionRateMqlToSql || 0) / 100;
            const r3 = (funnel.conversionRateSqlToSale || 0) / 100;
            aggregateRate = (r1 * r2 * r3) * 100; // As percentage
        }
        // Fallback to 2025 summary if funnel is not set
        if (aggregateRate === 0) {
             aggregateRate = summary2025.taxaConversaoLeadCliente || 1;
        }

        // 3. Ticket: From Funnel Input
        const ticket = funnelCalculations.avgTicket || summary2025.ticketMedio || 0;

        // 4. Recurrent Clients: Estimate based on 2025 active base
        // (Revenue / Ticket) roughly gives active clients
        const estimatedActiveClients = summary2025.receitaTotal > 0 && (summary2025.ticketMedio || 1) > 0 
            ? (summary2025.receitaTotal / 12) / (summary2025.ticketMedio || 1)
            : 0;

        MONTHS.forEach(m => {
            updateDriverBasedPlanning('leadsQualificados', m, monthlyLeads.toFixed(0));
            updateDriverBasedPlanning('taxaConversao', m, aggregateRate.toFixed(2).replace('.', ','));
            updateDriverBasedPlanning('ticketMedio', m, ticket.toFixed(2).replace('.', ','));
            
            // Only update recurrent if empty, to not overwrite custom inputs if user already edited
            const currentRecurrent = driverBasedPlanning?.clientesRecorrentes[m];
            if (currentRecurrent === undefined || currentRecurrent === null || Number(currentRecurrent) === 0) {
                 updateDriverBasedPlanning('clientesRecorrentes', m, estimatedActiveClients.toFixed(0));
            }
        });
    };

    // --- RENDER FUNCTIONS FOR TABS ---
    const renderDemandPlanningTab = () => {
        const channels = demandPlanning?.channels || [];
        const COLORS = ['#EE7533', '#213242', '#28A745', '#FFC107', '#6f42c1', '#dc3545'];
        const chartData = channels.map(ch => ({ name: ch.name, value: ch.expectedRevenue || 0}));
        
        return (
            <div className="space-y-6 mt-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                     <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Planejamento de Demanda por Canal</h3>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600 w-1/4">Canal de Aquisição</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Orçamento (R$)</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Nº Leads</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Receita Esperada (R$)</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">CPL (R$)</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-600">ROI</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {channels.map(ch => {
                                    const cpl = (ch.leads || 0) > 0 ? (ch.budget || 0) / ch.leads! : 0;
                                    const roi = (ch.budget || 0) > 0 ? ((ch.expectedRevenue || 0) - ch.budget!) / ch.budget! : 0;
                                    return (
                                        <tr key={ch.id}>
                                            <td><input type="text" value={ch.name} onChange={e => updateDemandChannel(ch.id, 'name', e.target.value)} className="w-full p-2 bg-transparent border-0 focus:ring-1 focus:ring-brand-orange rounded-md"/></td>
                                            <td><CurrencyInput value={ch.budget ?? null} onChange={(v) => updateDemandChannel(ch.id, 'budget', v)} className="w-full p-2 text-right border-0 focus:ring-1 focus:ring-brand-orange rounded-md"/></td>
                                            <td><CurrencyInput value={ch.leads ?? null} onChange={(v) => updateDemandChannel(ch.id, 'leads', v)} className="w-full p-2 text-right border-0 focus:ring-1 focus:ring-brand-orange rounded-md"/></td>
                                            <td><CurrencyInput value={ch.expectedRevenue ?? null} onChange={(v) => updateDemandChannel(ch.id, 'expectedRevenue', v)} className="w-full p-2 text-right border-0 focus:ring-1 focus:ring-brand-orange rounded-md"/></td>
                                            <td className="px-4 py-2 text-right text-gray-600 font-semibold">{formatCurrency(cpl)}</td>
                                            <td className="px-4 py-2 text-right text-gray-600 font-semibold">{formatNumber(roi)}x</td>
                                            <td className="text-center"><button onClick={() => removeDemandChannel(ch.id)} className="text-red-400 hover:text-red-600">&times;</button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                             <tfoot className="bg-gray-100 font-bold">
                                <tr>
                                    <td className="px-4 py-2 text-left">TOTAIS</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(demandTotals.totalBudget)}</td>
                                    <td className="px-4 py-2 text-right">{formatNumber(demandTotals.totalLeads)}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(demandTotals.totalRevenue)}</td>
                                    <td className="px-4 py-2 text-right">{formatCurrency(demandTotals.avgCpl)}</td>
                                    <td className="px-4 py-2 text-right">{formatNumber(demandTotals.totalRoi)}x</td>
                                    <td></td>
                                </tr>
                             </tfoot>
                        </table>
                     </div>
                     <button onClick={addDemandChannel} className="mt-2 text-brand-orange font-semibold hover:text-orange-700 text-sm">+ Adicionar Canal</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <h3 className="text-lg font-bold text-brand-blue mb-4">Mix de Receita por Canal</h3>
                        <div style={{width: '100%', height: 250}}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value, true)}`}>
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-brand-blue">Análise de Canais com IA</h3>
                            <button onClick={handleGenerateChannelAnalysis} disabled={isLoading.channel} className="flex items-center px-3 py-2 text-xs font-semibold text-white bg-brand-orange rounded-xl hover:bg-orange-700 shadow-md shadow-orange-200 btn-glow transition-colors shadow-sm disabled:bg-gray-400">
                                {isLoading.channel ? 'Analisando...' : 'Gerar Análise'}
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[220px]">
                            {demandPlanning?.analysis || "A IA analisará seu mix de canais, eficiência (CPL, ROI) e sugerirá otimizações de orçamento."}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const renderFunnelTab = () => {
        if (!salesFunnel) return <div className="p-4 text-center text-gray-500">Carregando dados do funil...</div>;
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Coluna Esquerda: Inputs e Sugestões IA */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                         <h3 className="text-lg font-bold text-brand-blue">Premissas do Funil Granular</h3>
                         <InputField label="Tx. Conversão (Lead > MQL)" value={salesFunnel.conversionRateLeadToMql} onChange={e => updateCommercialPlanning('salesFunnel', 'conversionRateLeadToMql', e.target.value)} hint="Marketing Qualified Lead" suffix="%" />
                         <InputField label="Tx. Conversão (MQL > SQL)" value={salesFunnel.conversionRateMqlToSql} onChange={e => updateCommercialPlanning('salesFunnel', 'conversionRateMqlToSql', e.target.value)} hint="Sales Qualified Lead" suffix="%" />
                         <InputField label="Tx. Conversão (SQL > Venda)" value={salesFunnel.conversionRateSqlToSale} onChange={e => updateCommercialPlanning('salesFunnel', 'conversionRateSqlToSale', e.target.value)} hint="Taxa de Fechamento" suffix="%" />
                         <InputField label="Atividades/Dia por Vendedor" value={salesFunnel.activitiesPerRep} onChange={e => updateCommercialPlanning('salesFunnel', 'activitiesPerRep', e.target.value)} hint="Nº de prospecções, etc." />
                         <InputField label="Dias Úteis em 2026" value={salesFunnel.workingDays} onChange={e => updateCommercialPlanning('salesFunnel', 'workingDays', e.target.value)} hint="Ex: 252 dias" />
                         <InputField label="Tempo de Ramp-up (meses)" value={salesFunnel.rampUpTime} onChange={e => updateCommercialPlanning('salesFunnel', 'rampUpTime', e.target.value)} hint="Tempo para um novo vendedor ser 100% produtivo." suffix="meses" />
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-brand-blue">Otimização do Funil com IA</h3>
                            <button onClick={handleGenerateFunnelSuggestions} disabled={isLoading.funnel} className="flex items-center px-3 py-2 text-xs font-semibold text-white bg-brand-orange rounded-xl hover:bg-orange-700 shadow-md shadow-orange-200 btn-glow transition-colors shadow-sm disabled:bg-gray-400">
                                 {isLoading.funnel ? 'Gerando...' : 'Gerar Sugestões'}
                             </button>
                         </div>
                         <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[150px]">
                            {planData.commercialPlanning?.funnelSuggestions || "Clique no botão para que a IA (atuando como um especialista em Growth) analise seu funil e sugira melhorias."}
                         </div>
                     </div>
                </div>
                {/* Coluna Direita: Resultados */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold text-brand-blue">Projeção do Funil</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBox label="Meta Anual de Leads" value={formatNumber(funnelCalculations.totalLeadsGoal)} hint="Vinda do Plano de Demanda" />
                            <InfoBox label="Meta Anual de Receita" value={formatCurrency(funnelCalculations.totalRevenueGoal)} hint="Vinda do Plano de Demanda" />
                            <InfoBox label="MQLs Necessários" value={formatNumber(funnelCalculations.mqlsNeeded)} hint="Marketing Qualified" />
                            <InfoBox label="SQLs Necessários" value={formatNumber(funnelCalculations.sqlsNeeded)} hint="Sales Qualified" />
                            <InfoBox label="Vendas Necessárias" value={formatNumber(funnelCalculations.salesNeeded)} hint="Total no ano" />
                            <InfoBox label="Ticket Médio Implícito" value={formatCurrency(funnelCalculations.avgTicket)} hint="Receita / Vendas" />
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold text-brand-blue">Meta de Comportamento</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <InfoBox label="Leads Necessários / Dia" value={formatNumber(funnelCalculations.dailyActivitiesNeeded)} hint="Para alimentar o funil" />
                             <InfoBox label="Atividades de Vendas / Dia" value={formatNumber((funnelCalculations.repsNeeded || 0) * (salesFunnel.activitiesPerRep || 0))} hint="Total da equipe" />
                        </div>
                    </div>
                    <div className="bg-brand-blue text-white p-6 rounded-2xl shadow-sm border">
                        <h3 className="text-lg font-bold">Headcount de Vendas Necessário</h3>
                         <p className="text-5xl font-extrabold my-2 text-center">{formatNumber(Math.ceil(funnelCalculations.repsNeeded))}</p>
                         <p className="text-sm text-center opacity-80">Vendedores necessários para gerar o volume de leads diários.</p>
                    </div>
                </div>
            </div>
        );
    }
    const renderHiringTab = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Projeção de Contratações e Orçamento de Pessoal 2026</h2>
            
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-lg">
                <h4 className="font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    O que é o Custo Médio?
                </h4>
                <p className="mt-2">
                    Este valor é <strong>Unitário (por colaborador)</strong> e <strong>Anual</strong>.
                </p>
                <p className="mt-1">
                    O sistema multiplica este valor pelo <strong>Headcount Final (Atuais + Contratações)</strong> para calcular o orçamento total do departamento.
                </p>
                <p className="mt-2 text-xs text-blue-600">
                    <strong>Como calcular (Estimativa):</strong> (Salário Bruto + Encargos + Benefícios) × 13,3 (inclui 13º e Férias).
                </p>
                <div className="mt-3 pt-3 border-t border-blue-200 text-blue-900 font-medium">
                    💡 Referência 2025: O custo médio geral da sua empresa foi de {formatCurrency(summary2025.custoColaboradorAno)}/ano.
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Headcount Atual</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Novas Contratações</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Headcount 2026</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Médio Unitário (R$/ano)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Total R$</th>
                            <th className="px-2 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(planData.hiringProjection || []).map(item => {
                            const headcount2026 = (item.currentHeadcount || 0) + (item.newHires || 0);
                            const budgetTotal = headcount2026 * (item.avgAnnualCost || 0);
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2"><input type="text" value={item.department} onChange={(e) => updateHiringProjectionItem(item.id, 'department', e.target.value)} className="w-full bg-transparent border-b border-transparent focus:border-brand-orange focus:outline-none" /></td>
                                    <td className="px-4 py-2"><CurrencyInput value={item.currentHeadcount ?? null} onChange={(v) => updateHiringProjectionItem(item.id, 'currentHeadcount', v)} className="w-28 p-2 text-right border-none bg-transparent focus:ring-2 focus:ring-brand-orange focus:ring-inset rounded-md" /></td>
                                    <td className="px-4 py-2"><CurrencyInput value={item.newHires ?? null} onChange={(v) => updateHiringProjectionItem(item.id, 'newHires', v)} className="w-28 p-2 text-right border-none bg-transparent focus:ring-2 focus:ring-brand-orange focus:ring-inset rounded-md" /></td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatNumber(headcount2026)}</td>
                                    <td className="px-4 py-2"><CurrencyInput value={item.avgAnnualCost ?? null} onChange={(v) => updateHiringProjectionItem(item.id, 'avgAnnualCost', v)} className="w-32 p-2 text-right border-none bg-transparent focus:ring-2 focus:ring-brand-orange focus:ring-inset rounded-md" /></td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatCurrency(budgetTotal, true)}</td>
                                    <td className="px-2 py-2 text-center"><button onClick={() => removeHiringProjectionItem(item.id)} className="text-red-400 hover:text-red-600 font-bold text-lg">&times;</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr className="font-bold text-sm text-gray-800">
                            <td className="px-4 py-3">TOTAL</td>
                            <td className="px-4 py-3 text-right">{formatNumber(hiringTotals.totalCurrent)}</td>
                            <td className="px-4 py-3 text-right">{formatNumber(hiringTotals.totalNew)}</td>
                            <td className="px-4 py-3 text-right">{formatNumber(hiringTotals.totalCurrent + hiringTotals.totalNew)}</td>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right">{formatCurrency(hiringTotals.totalBudget, true)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
             <div className="mt-4"><button onClick={addHiringProjectionItem} className="text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Departamento</button></div>
        </div>
    );
    
    const renderDriverBasedPlanningTab = () => {
        const metaReceita = goals2026.financeiras?.metaReceita || {};
        // FIX: Sum the MonthlyData object before performing arithmetic operations.
        const totalMetaReceita = sumMonthlyData(metaReceita);
        const diff = totalMetaReceita - driverCalculations.totals.receitaTotal;
        const diffPercent = totalMetaReceita > 0 ? (diff / totalMetaReceita) * 100 : 0;
        
        // Reverse calculations to close the gap
        const currentLeads = driverCalculations.totals.leadsQualificados;
        const currentTicket = driverCalculations.totals.ticketMedio;
        const currentConversion = driverCalculations.totals.taxaConversao / 100;
        const currentRecurrentClients = driverCalculations.totals.clientesRecorrentes;
        
        // Gap Revenue needs to be filled by New Sales
        const recurrentRevenue = currentRecurrentClients * currentTicket;
        const requiredTotalNewRevenue = totalMetaReceita - recurrentRevenue;
        
        let requiredLeads = 0;
        let requiredConversion = 0;
        
        if (currentTicket > 0 && currentConversion > 0) {
             requiredLeads = requiredTotalNewRevenue / (currentTicket * currentConversion);
        }
        
        if (currentTicket > 0 && currentLeads > 0) {
            requiredConversion = (requiredTotalNewRevenue / (currentTicket * currentLeads)) * 100;
        }

        const isGap = diff > 0;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6 space-y-4">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Driver-Based Planning - Projeção 2026</h2>
                    <div className="flex gap-2">
                        <button onClick={handleImportFromFunnel} className="text-sm text-brand-orange bg-orange-50 px-3 py-1 rounded hover:bg-orange-100 border border-orange-200 font-medium">
                            🔄 Importar do Funil & Demanda 2026
                        </button>
                        <button onClick={handlePrefillDrivers} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded hover:bg-gray-100 border border-gray-200">
                            📥 Carregar Base Histórica 2025
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl">
                    <p className="font-bold">Como funciona a correlação?</p>
                    <p className="text-sm mt-1">
                        Aqui comparamos sua <strong>Meta (Desejo)</strong> com seu <strong>Plano Operacional (Realidade)</strong>. Se houver um GAP, use os Drivers abaixo para encontrar o caminho (aumentar leads? melhorar conversão?).
                    </p>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                     <table className="min-w-full text-sm">
                        <thead className="bg-brand-blue text-white">
                            <tr>
                                <th className="p-3 text-left font-semibold sticky left-0 bg-brand-blue z-10 w-[200px]">Direcionador</th>
                                {MONTHS.map(m => <th key={m} className="p-2 text-center font-medium">{MONTH_LABELS[m].substring(0,3)}</th>)}
                                <th className="p-3 text-right font-semibold sticky right-0 bg-brand-blue z-10 w-[120px]">Total/Média</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {/* Inputs */}
                            {(['leadsQualificados', 'taxaConversao', 'clientesRecorrentes', 'ticketMedio'] as const).map(key => {
                                const isPercent = key === 'taxaConversao';
                                const isCurrency = key === 'ticketMedio';
                                const totalVal = driverCalculations.totals[key];
                                const formatFn = isCurrency ? formatCurrency : (isPercent ? formatPercentage : formatNumber);
                                const labelMap = {
                                    leadsQualificados: 'Leads Qualificados (#)',
                                    taxaConversao: 'Taxa de Conversão (%)',
                                    clientesRecorrentes: 'Clientes Recorrentes (#)',
                                    ticketMedio: 'Ticket Médio (R$)',
                                };
                                return (
                                    <tr key={key}>
                                        <td className="p-3 font-medium sticky left-0 bg-white z-10">{labelMap[key]}</td>
                                        {MONTHS.map(m => (
                                            <td key={m} className="p-0 text-right">
                                                <CurrencyInput
                                                    value={driverBasedPlanning?.[key]?.[m] ?? null}
                                                    onChange={(v) => updateDriverBasedPlanning(key, m, v)}
                                                    className="w-24 p-2 text-right border-none bg-transparent focus:ring-2 focus:ring-brand-orange focus:ring-inset"
                                                    placeholder="0"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-3 text-right font-bold sticky right-0 bg-white z-10">{formatFn(totalVal)}</td>
                                    </tr>
                                )
                            })}
                            {/* Calculations */}
                             <tr className="bg-gray-50 font-semibold">
                                <td className="p-3 sticky left-0 bg-gray-50 z-10">(=) Novos Clientes (#)</td>
                                {driverCalculations.monthlyResults.map((r, i) => <td key={i} className="p-2 text-right">{formatNumber(r.novosClientes)}</td>)}
                                <td className="p-3 text-right font-bold sticky right-0 bg-gray-50 z-10">{formatNumber(driverCalculations.totals.novosClientes)}</td>
                            </tr>
                            <tr className="bg-gray-100 font-bold text-gray-900">
                                <td className="p-3 sticky left-0 bg-gray-50 z-10">(=) Receita Projetada (R$)</td>
                                {driverCalculations.monthlyResults.map((r, i) => <td key={i} className="p-2 text-right">{formatCurrency(r.receitaTotal)}</td>)}
                                <td className="p-3 text-right sticky right-0 bg-gray-50 z-10">{formatCurrency(driverCalculations.totals.receitaTotal)}</td>
                            </tr>
                        </tbody>
                     </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoBox label="Meta de Receita (Top-Down)" value={formatCurrency(totalMetaReceita)} hint="Definida na aba de Metas." />
                    <div className={clsx("p-4 rounded-lg text-center border", diff > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200")}>
                        <p className="text-sm font-medium">{diff > 0 ? "GAP (Falta Atingir)" : "Excedente (Acima da Meta)"}</p>
                        <p className={clsx("text-2xl font-bold my-1", diff > 0 ? "text-red-700" : "text-green-700")}>{formatCurrency(Math.abs(diff))}</p>
                        <p className="text-xs">{formatPercentage(Math.abs(diffPercent))} da meta</p>
                    </div>
                </div>
                
                <div className={clsx("mt-4 p-4 border rounded-lg", isGap ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200")}>
                    <h4 className={clsx("font-bold mb-2", isGap ? "text-orange-800" : "text-green-800")}>
                        {isGap ? 'Calculadora de Correção de Rota (GAP)' : 'Análise de Sensibilidade (O que é necessário para a meta exata?)'}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                        {isGap
                            ? `Para fechar o GAP de ${formatCurrency(diff)} e atingir a meta, você precisa ajustar seus drivers. Veja as opções:`
                            : `Você já superou a meta em ${formatCurrency(Math.abs(diff))}. Para manter a meta exata (ponto de equilíbrio da meta), você precisaria apenas de:`
                        }
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={clsx("bg-white p-3 rounded border", isGap ? "border-orange-100" : "border-green-100")}>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Opção A: Volume de Leads</p>
                            <p className="text-sm mt-1">Gerar <strong className="text-gray-900">{formatNumber(requiredLeads)} leads</strong> no ano.</p>
                            <p className="text-xs text-gray-400">({formatNumber(requiredLeads - currentLeads)} em relação ao atual)</p>
                        </div>
                        <div className={clsx("bg-white p-3 rounded border", isGap ? "border-orange-100" : "border-green-100")}>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Opção B: Eficiência (Conversão)</p>
                            <p className="text-sm mt-1">Taxa de Conversão de <strong className="text-gray-900">{formatPercentage(requiredConversion)}</strong>.</p>
                            <p className="text-xs text-gray-400">({formatPercentage(requiredConversion - driverCalculations.totals.taxaConversao)} pontos percentuais)</p>
                        </div>
                    </div>
                </div>

            </div>
        )
    };

    const TABS: { id: CommercialPlanningTab; label: string; }[] = [
        { id: 'demand', label: '1. Planejamento de Demanda' },
        { id: 'funnel', label: '2. Funil de Vendas' },
        { id: 'hiring', label: '3. Projeção de Contratações' },
        { id: 'people-analytics', label: '4. Análise de Pessoas (Bottom-Up)' },
        { id: 'driver-based', label: '5. Planejamento por Drivers' },
    ];

    return (
        <div className="space-y-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">6. Planejamento Comercial & RH</h1>
                <p className="text-gray-500 mt-2">
                    Defina sua estratégia de geração de demanda, estruture seu funil de vendas e projete as contratações necessárias para 2026.
                </p>
            </header>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as CommercialPlanningTab)}
                            className={clsx(
                                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm',
                                activeTab === tab.id
                                ? 'border-brand-orange text-brand-orange'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {activeTab === 'demand' && renderDemandPlanningTab()}
                {activeTab === 'funnel' && renderFunnelTab()}
                {activeTab === 'hiring' && renderHiringTab()}
                {activeTab === 'driver-based' && renderDriverBasedPlanningTab()}
                {activeTab === 'people-analytics' && <PeopleAnalyticsDashboard />}
            </div>
        </div>
    );
};

export default CommercialPlanning;
