

import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { Month, MONTHS, MONTH_LABELS } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';

const ForecastCard: React.FC<{ title: string; value: number; ebitda: number; margin: number }> = ({ title, value, ebitda, margin }) => (
    <div className="bg-gray-50 p-4 rounded-lg border text-center">
        <h3 className="text-base font-bold text-brand-blue">{title}</h3>
        <p className="text-3xl font-extrabold text-brand-dark my-2">{formatCurrency(value, true)}</p>
        <div className="text-sm text-gray-600">
            <span>EBITDA: {formatCurrency(ebitda, true)}</span>
            <span className="mx-2">|</span>
            <span>Margem: {formatPercentage(margin)}</span>
        </div>
    </div>
);

const MonthlyTracking: React.FC = () => {
    const { tracking2026, scenarios2026, baseScenario, updateTracking2026, generateMonthlyAnalysis } = usePlan();
    const [selectedMonth, setSelectedMonth] = useState<Month>(MONTHS[0]);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    // FIX: Provide a default object for `actual` to avoid errors when `tracking2026[selectedMonth]` is undefined.
    const actual = tracking2026[selectedMonth] || { receitaRealizada: null, custosRealizados: null, despesasRealizadas: null, analysisText: null };
    const projected = {
        receita: scenarios2026[baseScenario]?.receitaProjetada?.[selectedMonth],
        custos: scenarios2026[baseScenario]?.custosProjetados?.[selectedMonth], // Variáveis
        despesas: scenarios2026[baseScenario]?.despesasProjetadas?.[selectedMonth], // Fixas
    };
    
    const projectedEbitda = (projected.receita || 0) - (projected.custos || 0) - (projected.despesas || 0);
    const actualEbitda = (actual.receitaRealizada || 0) - (actual.custosRealizados || 0) - (actual.despesasRealizadas || 0);

    const getVariance = (actualVal?: number | null, projectedVal?: number | null) => {
        if (actualVal === undefined || actualVal === null || projectedVal === undefined || projectedVal === null) return { value: undefined, status: 'nodata' };
        if (projectedVal === 0) return { value: actualVal > 0 ? Infinity : 0, status: actualVal > 0 ? 'good' : 'neutral' };
        
        const variance = ((actualVal - projectedVal) / Math.abs(projectedVal)) * 100;
        let status: 'good' | 'bad' | 'neutral' = 'neutral';
        if (Math.abs(variance) <= 5) status = 'neutral';
        else if (variance > 5) status = 'good';
        else status = 'bad';

        return { value: variance, status };
    };
    
    const varianceReceita = getVariance(actual.receitaRealizada, projected.receita);
    const varianceCustos = getVariance(actual.custosRealizados, projected.custos);
    if (varianceCustos.status === 'good') varianceCustos.status = 'bad'; else if (varianceCustos.status === 'bad') varianceCustos.status = 'good';
    
    const varianceDespesas = getVariance(actual.despesasRealizadas, projected.despesas);
    if (varianceDespesas.status === 'good') varianceDespesas.status = 'bad'; else if (varianceDespesas.status === 'bad') varianceDespesas.status = 'good';

    const varianceEbitda = getVariance(actualEbitda, projectedEbitda);

    // New Indicator Calculations
    const projectedMC = (projected.receita || 0) - (projected.custos || 0);
    const actualMC = (actual.receitaRealizada || 0) - (actual.custosRealizados || 0);
    const varianceMC = getVariance(actualMC, projectedMC);

    const projectedIMC = (projected.receita || 0) > 0 ? projectedMC / (projected.receita || 1) : 0;
    const projectedPE = projectedIMC > 0 ? (projected.despesas || 0) / projectedIMC : 0;

    const actualIMC = (actual.receitaRealizada || 0) > 0 ? actualMC / (actual.receitaRealizada || 1) : 0;
    const actualPE = actualIMC > 0 ? (actual.despesasRealizadas || 0) / actualIMC : 0;
    const variancePE = getVariance(actualPE, projectedPE);
    if (variancePE.status === 'good') variancePE.status = 'bad'; else if (variancePE.status === 'bad') variancePE.status = 'good';


    const rows = [
        { label: 'Receita', actual: actual.receitaRealizada, projected: projected.receita, variance: varianceReceita },
        { label: 'Custos Variáveis', actual: actual.custosRealizados, projected: projected.custos, variance: varianceCustos },
        { label: 'Margem de Contribuição', actual: actualMC, projected: projectedMC, variance: varianceMC, isBold: true },
        { label: 'Despesas Fixas', actual: actual.despesasRealizadas, projected: projected.despesas, variance: varianceDespesas },
        { label: 'EBITDA', actual: actualEbitda, projected: projectedEbitda, variance: varianceEbitda, isBold: true },
        { label: 'Ponto de Equilíbrio', actual: actualPE, projected: projectedPE, variance: variancePE },
    ];
    
    const yearEndSummary = useMemo(() => {
        const projected = { receita: 0, custos: 0, despesas: 0 };
        const actualYTD = { receita: 0, custos: 0, despesas: 0 };
        const forecast = { receita: 0, custos: 0, despesas: 0 };
        const selectedMonthIndex = MONTHS.indexOf(selectedMonth);

        const scenarioMonthData = scenarios2026[baseScenario];

        if (!scenarioMonthData) {
             const zeroMetrics = { ebitda: 0, margin: 0 };
             return {
                projected: { ...projected, ...zeroMetrics },
                actualYTD: { ...actualYTD, ...zeroMetrics },
                forecast: { ...forecast, ...zeroMetrics }
            };
        }

        MONTHS.forEach((month, index) => {
            const trackingMonthData = tracking2026[month];

            // Projected totals
            projected.receita += scenarioMonthData.receitaProjetada?.[month] || 0;
            projected.custos += scenarioMonthData.custosProjetados?.[month] || 0;
            projected.despesas += scenarioMonthData.despesasProjetadas?.[month] || 0;

            // Actual YTD totals
            if (trackingMonthData?.receitaRealizada != null) {
                 actualYTD.receita += trackingMonthData.receitaRealizada || 0;
                 actualYTD.custos += trackingMonthData.custosRealizados || 0;
                 actualYTD.despesas += trackingMonthData.despesasRealizadas || 0;
            }

            // Forecast totals
            if (index <= selectedMonthIndex && trackingMonthData?.receitaRealizada != null) {
                forecast.receita += trackingMonthData.receitaRealizada || 0;
                forecast.custos += trackingMonthData.custosRealizados || 0;
                forecast.despesas += trackingMonthData.despesasRealizadas || 0;
            } else {
                forecast.receita += scenarioMonthData.receitaProjetada?.[month] || 0;
                forecast.custos += scenarioMonthData.custosProjetados?.[month] || 0;
                forecast.despesas += scenarioMonthData.despesasProjetadas?.[month] || 0;
            }
        });

        const calcMetrics = (data: { receita: number, custos: number, despesas: number }) => {
            const ebitda = data.receita - data.custos - data.despesas;
            const margin = data.receita > 0 ? (ebitda / data.receita) * 100 : 0;
            return { ebitda, margin };
        };

        return {
            projected: { ...projected, ...calcMetrics(projected) },
            actualYTD: { ...actualYTD, ...calcMetrics(actualYTD) },
            forecast: { ...forecast, ...calcMetrics(forecast) }
        };

    }, [selectedMonth, tracking2026, scenarios2026, baseScenario]);

    const handleGenerateAnalysis = async () => {
        setIsAnalysisLoading(true);
        await generateMonthlyAnalysis(selectedMonth);
        setIsAnalysisLoading(false);
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">12. Acompanhamento & Forecast</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Acompanhe o realizado vs. projetado (cenário <span className="font-bold">{baseScenario}</span>), analise desvios e crie uma previsão (Forecast) para o restante do ano.
                </p>
            </header>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-brand-blue mb-4">Forecast Anual 2026</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ForecastCard title="Projetado (Ano)" value={yearEndSummary.projected.receita} ebitda={yearEndSummary.projected.ebitda} margin={yearEndSummary.projected.margin} />
                    <ForecastCard title="Realizado (Acumulado)" value={yearEndSummary.actualYTD.receita} ebitda={yearEndSummary.actualYTD.ebitda} margin={yearEndSummary.actualYTD.margin} />
                    <ForecastCard title="Forecast (Ano)" value={yearEndSummary.forecast.receita} ebitda={yearEndSummary.forecast.ebitda} margin={yearEndSummary.forecast.margin} />
                </div>
                 <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                    <p className="font-bold">Como funciona o Forecast?</p>
                    <p className="text-sm mt-1">
                        O Forecast combina os dados <strong>Realizados</strong> que você inseriu até o mês selecionado com os dados <strong>Projetados</strong> do seu cenário base para os meses futuros. Isso cria uma estimativa de como o ano terminará se a performance futura seguir o plano.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="mb-6">
                    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Selecione o Mês para Análise e Inserção de Dados</label>
                    <select
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value as Month)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-md"
                    >
                        {MONTHS.map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Data Input */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-brand-blue">Dados Realizados de {MONTH_LABELS[selectedMonth]}</h2>
                         <div>
                            <label htmlFor="receitaRealizada" className="block text-sm font-medium text-gray-700">Receita Realizada</label>
                            <input type="number" id="receitaRealizada" value={actual.receitaRealizada ?? ''} onChange={e => updateTracking2026(selectedMonth, 'receitaRealizada', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="custosRealizados" className="block text-sm font-medium text-gray-700">Custos Variáveis Realizados</label>
                            <input type="number" id="custosRealizados" value={actual.custosRealizados ?? ''} onChange={e => updateTracking2026(selectedMonth, 'custosRealizados', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="despesasRealizadas" className="block text-sm font-medium text-gray-700">Despesas Fixas Realizadas</label>
                            <input type="number" id="despesasRealizadas" value={actual.despesasRealizadas ?? ''} onChange={e => updateTracking2026(selectedMonth, 'despesasRealizadas', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div>
                         <h2 className="text-xl font-bold text-brand-blue mb-4">Análise de Desvios Mensal</h2>
                         <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="text-left py-2">Métrica</th>
                                    <th className="text-right py-2">Projetado</th>
                                    <th className="text-right py-2">Realizado</th>
                                    <th className="text-right py-2">Variação %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {rows.map(row => (
                                    <tr key={row.label} className={clsx(row.isBold && "font-bold")}>
                                        <td className="py-2">{row.label}</td>
                                        <td className="text-right py-2">{formatCurrency(row.projected)}</td>
                                        <td className="text-right py-2">{formatCurrency(row.actual)}</td>
                                        <td className={clsx("text-right py-2 font-semibold", {
                                            'text-brand-optimistic': row.variance.status === 'good',
                                            'text-brand-disruptive': row.variance.status === 'bad',
                                            'text-gray-600': row.variance.status === 'neutral',
                                        })}>
                                            {row.variance.value !== undefined ? (row.variance.value === Infinity ? 'N/A' : formatPercentage(row.variance.value)) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                </div>

                 <div className="mt-8 border-t pt-6 space-y-4">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <h2 className="text-xl font-bold text-brand-blue">Análise de Performance com IA</h2>
                        <button onClick={handleGenerateAnalysis} disabled={isAnalysisLoading} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400">
                            {isAnalysisLoading ? 'Analisando...' : 'Gerar Análise com IA'}
                        </button>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md min-h-[150px] font-sans leading-relaxed">
                         {actual.analysisText || "Clique no botão para que a IA (atuando como um CFO) analise o desempenho do mês e sugira ações."}
                    </div>
                 </div>

            </div>
        </div>
    );
};

export default MonthlyTracking;
