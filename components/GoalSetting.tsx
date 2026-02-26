
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { FinancialGoals, CommercialGoals, PeopleGoals, StrategicObjectives, MonthlyData, Month, MONTHS, MONTH_LABELS } from '../types';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

const sumMonthlyData = (data: MonthlyData): number => Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

const DiagnosticItem: React.FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-100">
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            {hint && <dd className="text-xs text-gray-400">{hint}</dd>}
        </div>
        <dd className="text-base font-semibold text-brand-dark">{value}</dd>
    </div>
);

const MonthlyGoalInput: React.FC<{
    label: string;
    monthlyData: MonthlyData;
    onUpdate: (month: Month, value: string) => void;
    isCurrency?: boolean;
}> = ({ label, monthlyData, onUpdate, isCurrency = false }) => {
    const total = useMemo(() => sumMonthlyData(monthlyData), [monthlyData]);
    return (
        <div className="p-4 border rounded-lg bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2">
                {MONTHS.map(month => (
                    <div key={month}>
                        <label className="text-xs text-gray-500">{MONTH_LABELS[month]}</label>
                        <input
                            type="number"
                            value={monthlyData[month] ?? ''}
                            onChange={(e) => onUpdate(month, e.target.value)}
                            className="w-full p-1 border-gray-300 rounded-md text-sm bg-white text-gray-900"
                        />
                    </div>
                ))}
            </div>
            <div className="mt-3 text-right">
                <span className="text-sm font-semibold">Total Anual: </span>
                <span className="text-lg font-bold text-brand-dark">
                    {isCurrency ? formatCurrency(total) : formatNumber(total)}
                </span>
            </div>
        </div>
    );
};


const GoalSetting: React.FC = () => {
    const { goals2026, generateGoalSuggestions, updateGoal, updateObjective, updateInflation, summary2025 } = usePlan();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateSuggestions = async () => {
        setIsLoading(true);
        await generateGoalSuggestions();
        setIsLoading(false);
    };

    const renderFinancialGoals = (goals: FinancialGoals) => (
        <div className="space-y-4">
            <MonthlyGoalInput
                label="Meta de Receita (R$)"
                monthlyData={goals.metaReceita}
                onUpdate={(month, value) => updateGoal('financeiras', 'metaReceita', value, month)}
                isCurrency={true}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Margem EBITDA (%)</label>
                <input
                    type="number"
                    value={goals.metaMargemEbitda ?? ''}
                    onChange={(e) => updateGoal('financeiras', 'metaMargemEbitda', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 25"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Lucro Líquido (R$)</label>
                <input
                    type="number"
                    value={goals.metaLucroLiquido ?? ''}
                    onChange={(e) => updateGoal('financeiras', 'metaLucroLiquido', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 500000"
                />
            </div>
        </div>
    );

    const renderCommercialGoals = (goals: CommercialGoals) => (
         <div className="space-y-4">
            <MonthlyGoalInput
                label="Meta de Nº de Clientes"
                monthlyData={goals.metaNumClientes}
                onUpdate={(month, value) => updateGoal('comerciais', 'metaNumClientes', value, month)}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Ticket Médio (R$)</label>
                <input
                    type="number"
                    value={goals.metaTicketMedio ?? ''}
                    onChange={(e) => updateGoal('comerciais', 'metaTicketMedio', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 3000"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Taxa de Conversão (%)</label>
                <input
                    type="number"
                    value={goals.metaTaxaConversao ?? ''}
                    onChange={(e) => updateGoal('comerciais', 'metaTaxaConversao', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 5"
                />
            </div>
        </div>
    );
    
    const renderPeopleGoals = (goals: PeopleGoals) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Headcount</label>
                <input
                    type="number"
                    value={goals.metaHeadcount ?? ''}
                    onChange={(e) => updateGoal('pessoas', 'metaHeadcount', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 25"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Turnover (%)</label>
                <input
                    type="number"
                    value={goals.metaTurnover ?? ''}
                    onChange={(e) => updateGoal('pessoas', 'metaTurnover', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 10"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Investimento T&D (R$)</label>
                <input
                    type="number"
                    value={goals.metaInvestimentoTD ?? ''}
                    onChange={(e) => updateGoal('pessoas', 'metaInvestimentoTD', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: 50000"
                />
            </div>
        </div>
    );
    
     const renderStrategicObjectives = (objectives: StrategicObjectives) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Objetivo Estratégico 1</label>
                <input
                    type="text"
                    value={objectives.objective1}
                    onChange={(e) => updateObjective('objective1', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: Expandir para o mercado do Sudeste"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Objetivo Estratégico 2</label>
                <input
                    type="text"
                    value={objectives.objective2}
                    onChange={(e) => updateObjective('objective2', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: Lançar novo produto X"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Objetivo Estratégico 3</label>
                <input
                    type="text"
                    value={objectives.objective3}
                    onChange={(e) => updateObjective('objective3', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                    placeholder="Ex: Atingir NPS 80"
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <header>
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-brand-dark">4. Metas & Objetivos para 2026</h1>
                        <p className="text-lg text-gray-600 mt-2">Defina as metas macro e os objetivos estratégicos que guiarão seu planejamento.</p>
                    </div>
                     <button onClick={handleGenerateSuggestions} disabled={isLoading} className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400">
                        {isLoading ? 'Gerando...' : 'Gerar Sugestões com IA'}
                     </button>
                </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold text-brand-blue border-b pb-2 mb-4">Diagnóstico Rápido 2025</h2>
                    <dl className="space-y-1">
                        <DiagnosticItem label="Receita Líquida" value={formatCurrency(summary2025.receitaTotal)} />
                        <DiagnosticItem label="Margem EBITDA" value={formatPercentage(summary2025.margemEbitda)} />
                        <DiagnosticItem label="Novos Clientes" value={formatNumber(summary2025.novosClientesTotal)} />
                        <DiagnosticItem label="Ticket Médio" value={formatCurrency(summary2025.ticketMedio)} />
                        <DiagnosticItem label="Turnover Anual" value={formatPercentage(summary2025.turnoverPercent)} hint="Rotatividade de pessoal" />
                        <DiagnosticItem label="Headcount Final" value={formatNumber(summary2025.headcountFinal)} hint="Total de colaboradores" />
                    </dl>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2 mb-4">Metas de Crescimento 2026</h2>
                        <div className="mb-4">
                             <label className="block text-sm font-medium text-gray-700">Inflação Prevista para 2026 (%)</label>
                            <input
                                type="number"
                                value={goals2026.inflacaoPrevista ?? ''}
                                onChange={(e) => updateInflation(e.target.value)}
                                className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 bg-white text-gray-900"
                                placeholder="Ex: 4.5"
                            />
                            <p className="text-xs text-gray-500 mt-1">Isso ajuda a calcular o crescimento real desejado.</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Financeiras</h3>
                                {renderFinancialGoals(goals2026.financeiras)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Comerciais</h3>
                                {renderCommercialGoals(goals2026.comerciais)}
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">Pessoas</h3>
                                {renderPeopleGoals(goals2026.pessoas)}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2 mb-4">Objetivos Estratégicos</h2>
                        {renderStrategicObjectives(goals2026.objetivosEstrategicos)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSetting;
