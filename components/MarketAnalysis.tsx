import React from 'react';
import { usePlan } from '../hooks/usePlanData';
import type { MarketCompetitionData } from '../types';

const MarketAnalysis: React.FC = () => {
    const { planData, updateMarketCompetitionData } = usePlan();
    const { marketCompetition } = planData.marketAnalysis;

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
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 ${isCurrency ? 'pl-8' : ''} ${isPercentage ? 'pr-8' : ''} ${disabled ? 'bg-gray-100' : ''}`}
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
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Mercado e Concorrência</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderInput('tamanhoMercado', 'Tamanho do Mercado (R$)', 'number', 'Estimativa do faturamento total do seu setor.')}
                {renderInput('taxaCrescimentoMercado', 'Taxa Crescimento Mercado (%)', 'number', 'Crescimento anual esperado do setor.')}
                {renderInput('suaParticipacao', 'Sua Participação (%)', 'number', 'Sua receita / Tamanho do mercado', true)}
                {renderInput('numConcorrentesDiretos', 'Nº Concorrentes Diretos', 'number')}
                {renderInput('principalConcorrente', 'Principal Concorrente', 'text')}
                {renderInput('seuDiferencial', 'Seu Diferencial', 'text', 'O que torna sua empresa única?')}
            </div>
        </div>
    )
};

export default MarketAnalysis;