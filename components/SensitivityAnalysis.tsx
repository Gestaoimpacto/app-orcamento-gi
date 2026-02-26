
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { MonthlyData } from '../types';

const sumMonthlyData = (data: MonthlyData): number => data ? Object.values(data).reduce((s, v) => s + (v || 0), 0) : 0;

const SensitivityAnalysis: React.FC = () => {
    const { calculateSensitivityAnalysis, scenarios2026, baseScenario } = usePlan();
    const [range, setRange] = useState(20); 

    const projection = scenarios2026[baseScenario].projection;
    
    // Base Totals Calculation
    const baseRevenue = sumMonthlyData(projection.receitaBruta) - sumMonthlyData(projection.impostosSobreFaturamento);
    
    const baseVariableCost = sumMonthlyData(projection.cmv) + sumMonthlyData(projection.comissoes) + sumMonthlyData(projection.fretes) + 
        (projection.customCustosVariaveis || []).reduce((s, i) => s + sumMonthlyData(i.values), 0);
        
    const baseFixedCost = sumMonthlyData(projection.folhaPagamento) + sumMonthlyData(projection.aluguel) + 
        sumMonthlyData(projection.despesasOperacionais) + sumMonthlyData(projection.marketingFixo) + 
        sumMonthlyData(projection.administrativo) + 
        (projection.customCustosFixos || []).reduce((s, i) => s + sumMonthlyData(i.values), 0);

    const baseEbit = baseRevenue - baseVariableCost - baseFixedCost;
    const baseNetProfit = baseEbit > 0 ? baseEbit * (1 - 0.24) : baseEbit; // Approx Net Profit

    // Safety Margin Calculation
    // How much can revenue drop before Net Profit hits 0?
    // Breakeven Revenue = Fixed Costs / Margin Contribution Ratio
    const contributionMarginRatio = baseRevenue > 0 ? (baseRevenue - baseVariableCost) / baseRevenue : 0;
    const breakevenRevenue = contributionMarginRatio > 0 ? baseFixedCost / contributionMarginRatio : 0;
    const safetyMarginValue = baseRevenue - breakevenRevenue;
    const safetyMarginPercent = baseRevenue > 0 ? (safetyMarginValue / baseRevenue) * 100 : 0;


    const matrix = useMemo(() => {
        if (calculateSensitivityAnalysis) {
            return calculateSensitivityAnalysis(baseRevenue, baseVariableCost, baseFixedCost, range);
        }
        return [];
    }, [calculateSensitivityAnalysis, baseRevenue, baseVariableCost, baseFixedCost, range]);

    const steps = [-range, -range/2, 0, range/2, range];

    const getCellColor = (value: number, baseValue: number) => {
        if (value < 0) return 'bg-red-100 text-red-800 font-bold border-red-200'; // Loss
        if (value > baseValue) return 'bg-green-100 text-green-800 font-bold border-green-200'; // Growth
        if (value < baseValue) return 'bg-yellow-50 text-yellow-800 border-yellow-200'; // Worse than plan but profitable
        return 'bg-white text-gray-800'; // Baseline
    };

    if (!matrix || matrix.length === 0) return <div className="p-6 text-center text-gray-500">Carregando análise ou dados insuficientes...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Análise de Sensibilidade (Matriz)</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Simule o impacto cruzado de variações de <strong>Preço</strong> e <strong>Volume</strong> no seu Lucro Líquido.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Insights Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-brand-blue mb-4">Margem de Segurança</h3>
                        <div className={`text-center p-4 rounded-lg mb-4 ${safetyMarginPercent > 20 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="text-sm uppercase tracking-wide font-semibold">Queda Máxima Aceitável</p>
                            <p className="text-4xl font-extrabold">{formatPercentage(safetyMarginPercent)}</p>
                            <p className="text-xs mt-2">
                                Sua receita pode cair até <strong>{formatPercentage(safetyMarginPercent)}</strong> antes que sua empresa entre no prejuízo (Zero Profit).
                            </p>
                        </div>
                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                <strong>Ponto de Equilíbrio:</strong> Você precisa faturar no mínimo <strong>{formatCurrency(breakevenRevenue)}</strong> para cobrir todos os custos.
                            </p>
                            <p>
                                <strong>Alavancagem Operacional:</strong> Note que um aumento de <strong>{range}%</strong> no preço gera muito mais lucro do que <strong>{range}%</strong> no volume. Isso ocorre porque o volume traz custos variáveis junto, enquanto o preço vai direto para a margem.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <label className="font-bold text-gray-700 block mb-2">Ajustar Sensibilidade (+/- %)</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="5" 
                                max="50" 
                                step="5" 
                                value={range} 
                                onChange={e => setRange(e.target.valueAsNumber)} 
                                className="w-full accent-brand-orange"
                            />
                            <span className="font-mono font-bold text-brand-orange text-lg">{range}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Arraste para ver cenários mais extremos (ex: o que acontece se o preço cair 50%?)
                        </p>
                    </div>
                </div>

                {/* Matrix Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <h3 className="text-lg font-bold text-brand-blue mb-4">Matriz de Impacto no Lucro Líquido</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="p-3 bg-white text-right font-medium text-gray-500 border-b border-r" rowSpan={2}>Volume de Vendas</th>
                                    <th className="p-3 bg-brand-blue text-white text-center font-bold rounded-t-lg" colSpan={5}>Variação de Preço</th>
                                </tr>
                                <tr>
                                    {steps.map(step => (
                                        <th key={step} className={`p-3 bg-gray-50 text-center min-w-[100px] border-b ${step === 0 ? 'border-x-2 border-x-brand-orange/30 bg-orange-50' : ''}`}>
                                            {step > 0 ? '+' : ''}{step}%
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row, rowIndex) => {
                                    const volStep = steps[rowIndex];
                                    return (
                                        <tr key={rowIndex}>
                                            <td className={`p-3 bg-gray-50 font-bold text-right border-r ${volStep === 0 ? 'border-y-2 border-y-brand-orange/30 bg-orange-50' : ''}`}>
                                                {volStep > 0 ? '+' : ''}{volStep}%
                                            </td>
                                            {row.map((cell, colIndex) => {
                                                const priceStep = steps[colIndex];
                                                const isCenter = volStep === 0 && priceStep === 0;
                                                return (
                                                    <td key={colIndex} className={`p-4 border text-right transition-colors hover:brightness-95 ${getCellColor(cell.netProfit, baseNetProfit)} ${isCenter ? 'ring-2 ring-brand-orange ring-inset' : ''}`}>
                                                        <div className="text-sm">{formatCurrency(cell.netProfit, true)}</div>
                                                        <div className="text-[10px] opacity-70 mt-1">{formatPercentage(cell.margin)} Marg.</div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs justify-end">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-100 border border-green-200 block"></span> Melhora</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border border-gray-200 block"></span> Neutro/Pior (Lucro)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-100 border border-red-200 block"></span> Prejuízo</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SensitivityAnalysis;
