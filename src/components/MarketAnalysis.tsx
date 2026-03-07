import React, { useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import type { MarketCompetitionData } from '../types';
import { formatPercentage, formatCurrency } from '../utils/formatters';

const MarketAnalysis: React.FC = () => {
    const { planData, updateMarketCompetitionData, summary2025 } = usePlan();
    const { marketCompetition } = planData.marketAnalysis;

    // Calcular automaticamente a participação de mercado
    const suaParticipacaoCalc = useMemo(() => {
        const tamanhoMercado = marketCompetition.tamanhoMercado || 0;
        const receitaAnual = summary2025.receitaBrutaTotal || 0;
        if (tamanhoMercado > 0 && receitaAnual > 0) {
            return (receitaAnual / tamanhoMercado) * 100;
        }
        return 0;
    }, [marketCompetition.tamanhoMercado, summary2025.receitaBrutaTotal]);

    const renderInput = (name: keyof MarketCompetitionData, label: string, type: 'text' | 'number' = 'text', hint?: string, disabled: boolean = false) => {
        const value = marketCompetition[name] ?? '';
        const isPercentage = label.includes('(%)');
        const isCurrency = label.includes('(R$)');
        
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                     {isCurrency && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">R$</span></div>}
                    <input
                        type={type === 'number' ? 'number' : 'text'}
                        name={name}
                        id={name}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 ${isCurrency ? 'pl-8' : ''} ${isPercentage ? 'pr-8' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="0"
                        value={value}
                        onChange={(e) => updateMarketCompetitionData(name, e.target.value)}
                        step="any"
                        disabled={disabled}
                    />
                    {isPercentage && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">%</span></div>}
                </div>
                 {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Mercado e Concorrência</h2>
            <p className="text-sm text-gray-600">Preencha os dados do seu mercado. A participação de mercado é calculada automaticamente com base na sua receita de 2025.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderInput('tamanhoMercado', 'Tamanho do Mercado (R$)', 'number', 'Estimativa do faturamento total do seu setor.')}
                {renderInput('taxaCrescimentoMercado', 'Taxa Crescimento Mercado (%)', 'number', 'Crescimento anual esperado do setor.')}
                
                {/* Participação calculada automaticamente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sua Participação de Mercado</label>
                    <div className="mt-1 p-2 bg-gray-100 rounded-md border border-gray-200">
                        <p className="text-lg font-bold text-brand-orange">{formatPercentage(suaParticipacaoCalc, 2)}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {summary2025.receitaBrutaTotal > 0 && marketCompetition.tamanhoMercado > 0 
                                ? `${formatCurrency(summary2025.receitaBrutaTotal, true)} / ${formatCurrency(marketCompetition.tamanhoMercado, true)}`
                                : 'Preencha o tamanho do mercado e a receita em Coleta de Dados'
                            }
                        </p>
                    </div>
                </div>

                {renderInput('numConcorrentesDiretos', 'Nº Concorrentes Diretos', 'number', 'Quantos concorrentes disputam o mesmo mercado.')}
                {renderInput('principalConcorrente', 'Principal Concorrente', 'text', 'Nome da empresa que mais compete com você.')}
                {renderInput('seuDiferencial', 'Seu Diferencial', 'text', 'O que torna sua empresa única no mercado?')}
            </div>
        </div>
    )
};

export default MarketAnalysis;
