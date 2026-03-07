
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { ScenarioName, ScenarioData, Month, MONTHS, MONTH_LABELS, ScenarioInputMode, MonthlyData } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';
import FinancialDataRow from './shared/FinancialDataRow';

const sumMonthlyData = (data: MonthlyData): number => data ? Object.values(data).reduce((s, v) => s + (v || 0), 0) : 0;

const ScenarioPlanning: React.FC = () => {
    const { 
        scenarios2026, 
        planData,
        updateScenarioGrowthPercentage,
        updateScenarioInputMode,
        updateScenarioProjectionValue,
        updateScenarioProjectionAllValues,
        updateScenarioCustomItem,
        updateScenarioCustomItemAllValues,
        addScenarioCustomItem,
        removeScenarioCustomItem,
        updateDecisionTrigger,
        updateStrategicAction,
        generateDecisionTriggers,
        getStrategicScoreAnalysis,
        recalculateScenario
    } = usePlan();

    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const { productivityGainFactor } = planData.analysis.peopleAnalytics;


    const handleGenerateTriggers = async (scenario: ScenarioName) => {
        setIsLoading(prev => ({ ...prev, [`triggers-${scenario}`]: true }));
        await generateDecisionTriggers(scenario);
        setIsLoading(prev => ({ ...prev, [`triggers-${scenario}`]: false }));
    };

    const handleGenerateAnalysis = async (scenarioName: ScenarioName) => {
        setIsLoading(prev => ({...prev, [`analysis-${scenarioName}`]: true}));
        await getStrategicScoreAnalysis(scenarioName);
        setIsLoading(prev => ({...prev, [`analysis-${scenarioName}`]: false}));
    }

    const renderBudgetTable = (scenarioName: ScenarioName) => {
        const scenario = scenarios2026[scenarioName];
        if (!scenario || !scenario.projection) {
            return <div className="p-4 text-center text-gray-500">Carregando dados do cenário...</div>;
        }
        const { projection } = scenario;
        const isManual = planData.scenariosInputMode[scenarioName] === 'manual';

        // --- CALCULATIONS for display ---
        const receitaBrutaTotal = sumMonthlyData(projection.receitaBruta);
        const impostosTotal = sumMonthlyData(projection.impostosSobreFaturamento);
        const receitaLiquidaTotal = receitaBrutaTotal - impostosTotal;
        
        const customFixosTotal = (projection.customCustosFixos || []).reduce((s, i) => s + sumMonthlyData(i.values), 0);
        const custosFixosTotal = sumMonthlyData(projection.folhaPagamento) + sumMonthlyData(projection.aluguel) + sumMonthlyData(projection.despesasOperacionais) + sumMonthlyData(projection.marketingFixo) + sumMonthlyData(projection.administrativo) + customFixosTotal;
        
        const customVariaveisTotal = (projection.customCustosVariaveis || []).reduce((s, i) => s + sumMonthlyData(i.values), 0);
        const custosVariaveisTotal = sumMonthlyData(projection.cmv) + sumMonthlyData(projection.comissoes) + sumMonthlyData(projection.fretes) + customVariaveisTotal;
        
        const margemContribuicaoTotal = receitaLiquidaTotal - custosVariaveisTotal;
        const ebitdaTotal = margemContribuicaoTotal - custosFixosTotal;
        const margemEbitda = receitaLiquidaTotal > 0 ? (ebitdaTotal / receitaLiquidaTotal) * 100 : 0;

        const monthlyReceitaLiquida = MONTHS.reduce((acc, m) => ({...acc, [m]: (projection.receitaBruta?.[m] || 0) - (projection.impostosSobreFaturamento?.[m] || 0)}), {} as MonthlyData);
        const monthlyMargemContribuicao = MONTHS.reduce((acc, m) => {
            const customVar = (projection.customCustosVariaveis || []).reduce((s, i) => s + (i.values?.[m] || 0), 0);
            return {...acc, [m]: (monthlyReceitaLiquida[m] || 0) - ((projection.cmv?.[m] || 0) + (projection.comissoes?.[m] || 0) + (projection.fretes?.[m] || 0) + customVar)}
        }, {} as MonthlyData);
         const monthlyEbitda = MONTHS.reduce((acc, m) => {
            const customFix = (projection.customCustosFixos || []).reduce((s, i) => s + (i.values?.[m] || 0), 0);
            return {...acc, [m]: (monthlyMargemContribuicao[m] || 0) - ((projection.folhaPagamento?.[m] || 0) + (projection.aluguel?.[m] || 0) + (projection.despesasOperacionais?.[m] || 0) + (projection.marketingFixo?.[m] || 0) + (projection.administrativo?.[m] || 0) + customFix)}
        }, {} as MonthlyData);

        const handleAddItem = (type: 'customCustosFixos' | 'customCustosVariaveis') => {
            if (!isManual) {
                updateScenarioInputMode(scenarioName, 'manual');
            }
            addScenarioCustomItem(scenarioName, type);
        };

        return (
             <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="sticky left-0 bg-gray-100 z-10 p-3 text-left font-semibold" style={{width: '250px'}}>Indicador</th>
                            <th className="p-3 text-left font-semibold">Instruções</th>
                            <th className="p-3 text-right font-semibold">Total 2026</th>
                            {MONTHS.map(m => <th key={m} className="p-2 text-center font-medium">{MONTH_LABELS[m]}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr className="bg-orange-50"><td colSpan={15} className="p-2 font-bold text-orange-800">RECEITA</td></tr>
                        <FinancialDataRow label="Receita Bruta Total (R$)" rowData={{values: projection.receitaBruta}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'receitaBruta', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'receitaBruta', v) : undefined} seasonalReference={planData.financialSheet.receitaBruta.values2025} hint="Faturamento total"/>
                        <FinancialDataRow label="(-) Impostos (R$)" rowData={{values: projection.impostosSobreFaturamento}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'impostosSobreFaturamento', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'impostosSobreFaturamento', v) : undefined} seasonalReference={planData.financialSheet.impostosSobreFaturamento.values2025} hint="Com base na receita"/>
                        <FinancialDataRow label="(=) Receita Líquida (R$)" rowData={{values: monthlyReceitaLiquida}} calculatedValue={receitaLiquidaTotal} isTotal={true} />
                        
                        <tr className="bg-blue-50"><td colSpan={15} className="p-2 font-bold text-blue-800">CUSTOS FIXOS</td></tr>
                        <FinancialDataRow label="Folha de Pagamento (R$)" rowData={{values: projection.folhaPagamento}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'folhaPagamento', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'folhaPagamento', v) : undefined} seasonalReference={planData.financialSheet.folhaPagamento.values2025} hint="Salários + Encargos"/>
                        <FinancialDataRow label="Aluguel (R$)" rowData={{values: projection.aluguel}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'aluguel', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'aluguel', v) : undefined} seasonalReference={planData.financialSheet.aluguel.values2025} hint="Infraestrutura"/>
                        <FinancialDataRow label="Despesas Operacionais (R$)" rowData={{values: projection.despesasOperacionais}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'despesasOperacionais', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'despesasOperacionais', v) : undefined} seasonalReference={planData.financialSheet.despesasOperacionais.values2025} hint="Água, luz, internet"/>
                        <FinancialDataRow label="Marketing (R$)" rowData={{values: projection.marketingFixo}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'marketingFixo', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'marketingFixo', v) : undefined} seasonalReference={planData.financialSheet.marketingFixo.values2025} hint="Marketing fixo"/>
                        <FinancialDataRow label="Administrativo (R$)" rowData={{values: projection.administrativo}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'administrativo', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'administrativo', v) : undefined} seasonalReference={planData.financialSheet.administrativo.values2025} hint="Contabilidade, juri"/>
                        {(projection.customCustosFixos || []).map(item => (
                            <FinancialDataRow key={item.id} label={item.name} rowData={{values: item.values}} onUpdateName={isManual ? (v) => updateScenarioCustomItem(scenarioName, 'customCustosFixos', item.id, 'name', v) : undefined} onUpdate={isManual ? (m,v) => updateScenarioCustomItem(scenarioName, 'customCustosFixos', item.id, m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioCustomItemAllValues(scenarioName, 'customCustosFixos', item.id, v) : undefined} onRemove={isManual ? () => removeScenarioCustomItem(scenarioName, 'customCustosFixos', item.id) : undefined} isCustom={true} seasonalReference={planData.financialSheet.customCustosFixos.find(c => c.id === item.id)?.values2025} />
                        ))}
                        <tr>
                            <td className="sticky left-0 bg-white z-10 p-3">
                                <button 
                                    onClick={() => handleAddItem('customCustosFixos')} 
                                    className="text-brand-orange font-semibold hover:text-orange-700 no-print flex items-center gap-1"
                                >
                                    + Adicionar Custo Fixo
                                    {!isManual && <span className="text-[10px] bg-orange-100 text-orange-800 px-1 rounded border border-orange-200">(Muda para Manual)</span>}
                                </button>
                            </td>
                            <td colSpan={14}></td>
                        </tr>
                        <FinancialDataRow label="(=) Total Custos Fixos (R$)" calculatedValue={custosFixosTotal} isTotal={true}/>

                        <tr className="bg-yellow-50"><td colSpan={15} className="p-2 font-bold text-yellow-800">CUSTOS VARIÁVEIS</td></tr>
                        <FinancialDataRow label="CMV (R$)" rowData={{values: projection.cmv}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'cmv', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'cmv', v) : undefined} seasonalReference={planData.financialSheet.cmv.values2025} hint="Custo direto prod."/>
                        <FinancialDataRow label="Comissões (R$)" rowData={{values: projection.comissoes}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'comissoes', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'comissoes', v) : undefined} seasonalReference={planData.financialSheet.comissoes.values2025} hint="Comissão de vendas"/>
                        <FinancialDataRow label="Fretes (R$)" rowData={{values: projection.fretes}} onUpdate={isManual ? (m,v) => updateScenarioProjectionValue(scenarioName, 'fretes', m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioProjectionAllValues(scenarioName, 'fretes', v) : undefined} seasonalReference={planData.financialSheet.fretes.values2025} hint="Logística"/>
                        {(projection.customCustosVariaveis || []).map(item => (
                            <FinancialDataRow key={item.id} label={item.name} rowData={{values: item.values}} onUpdateName={isManual ? (v) => updateScenarioCustomItem(scenarioName, 'customCustosVariaveis', item.id, 'name', v) : undefined} onUpdate={isManual ? (m,v) => updateScenarioCustomItem(scenarioName, 'customCustosVariaveis', item.id, m, v) : undefined} onUpdateAll={isManual ? (v) => updateScenarioCustomItemAllValues(scenarioName, 'customCustosVariaveis', item.id, v) : undefined} onRemove={isManual ? () => removeScenarioCustomItem(scenarioName, 'customCustosVariaveis', item.id) : undefined} isCustom={true} seasonalReference={planData.financialSheet.customCustosVariaveis.find(c => c.id === item.id)?.values2025}/>
                        ))}
                        <tr>
                            <td className="sticky left-0 bg-white z-10 p-3">
                                <button 
                                    onClick={() => handleAddItem('customCustosVariaveis')}
                                    className="text-brand-orange font-semibold hover:text-orange-700 no-print flex items-center gap-1"
                                >
                                    + Adicionar Custo Variável
                                    {!isManual && <span className="text-[10px] bg-orange-100 text-orange-800 px-1 rounded border border-orange-200">(Muda para Manual)</span>}
                                </button>
                            </td>
                            <td colSpan={14}></td>
                        </tr>
                         <FinancialDataRow label="(=) Total Custos Variáveis (R$)" calculatedValue={custosVariaveisTotal} isTotal={true}/>
                        
                        <tr className="bg-green-50"><td colSpan={15} className="p-2 font-bold text-green-800">RESULTADOS</td></tr>
                        <FinancialDataRow label="Margem de Contribuição (R$)" rowData={{values: monthlyMargemContribuicao}} calculatedValue={margemContribuicaoTotal} isTotal={true} hint="Receita Líquida - Custos Variáveis"/>
                        <FinancialDataRow label="EBITDA (R$)" rowData={{values: monthlyEbitda}} calculatedValue={ebitdaTotal} isTotal={true} hint="Margem de Contrib. - Custos Fixos"/>
                        <FinancialDataRow label="Margem EBITDA (%)" calculatedValue={margemEbitda} isPercentage={true} isTotal={true} hint="(EBITDA / Receita Líquida)"/>
                    </tbody>
                </table>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brand-dark">9. Orçamento & Cenários 2026</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Projete o orçamento para 2026 em diferentes cenários e defina gatilhos e ações estratégicas.
                    </p>
                </div>
                <button 
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 font-semibold text-white bg-brand-blue rounded-md hover:opacity-80 shadow-sm no-print"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir / Salvar PDF
                </button>
            </header>

            {(['Otimista', 'Conservador', 'Disruptivo'] as ScenarioName[]).map(scenarioName => (
                <div key={scenarioName} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                    <h2 className="text-2xl font-bold text-brand-blue">{`Cenário ${scenarioName}`}</h2>
                    
                    <div className="flex items-center gap-4 no-print">
                        <label className="text-sm font-medium">Modo de projeção:</label>
                        <div className="flex rounded-md shadow-sm">
                            <button onClick={() => updateScenarioInputMode(scenarioName, 'percentage')} className={clsx("px-3 py-1 text-sm font-semibold rounded-l-md", planData.scenariosInputMode[scenarioName] === 'percentage' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-700')}>% Crescimento</button>
                            <button onClick={() => updateScenarioInputMode(scenarioName, 'manual')} className={clsx("px-3 py-1 text-sm font-semibold rounded-r-md", planData.scenariosInputMode[scenarioName] === 'manual' ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-700')}>Manual</button>
                        </div>
                    </div>

                    {planData.scenariosInputMode[scenarioName] === 'percentage' && (
                        <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 text-center">Crescimento Base</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={scenarios2026[scenarioName].growthPercentage ?? ''}
                                            onChange={e => updateScenarioGrowthPercentage(scenarioName, e.target.value)}
                                            className="w-28 p-2 text-center border border-gray-300 rounded-md focus:ring-brand-orange focus:border-brand-orange bg-white text-gray-900"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-light text-gray-500 pt-4">+</div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 text-center">Fator Estratégico</label>
                                    <div className="relative mt-1">
                                        <div className="w-28 p-2 border border-gray-200 rounded-md bg-gray-200 text-center font-bold text-gray-900">
                                            {formatPercentage(planData.analysis.strategicScore.total, 1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-2xl font-light text-gray-500 pt-4">=</div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-xs font-medium text-brand-blue text-center">Crescimento Ajustado</label>
                                    <div className="relative mt-1">
                                        <div className="w-full p-2 border-2 border-brand-orange rounded-md bg-orange-50 text-center font-bold text-brand-orange text-lg">
                                            {formatPercentage((scenarios2026[scenarioName].growthPercentage || 0) + planData.analysis.strategicScore.total, 1)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end pb-1">
                                    <button 
                                        onClick={() => {
                                            if(window.confirm('Isso irá sobrescrever todos os valores manuais deste cenário com base no crescimento ajustado sobre 2025. Continuar?')) {
                                                recalculateScenario(scenarioName);
                                            }
                                        }}
                                        className="px-3 py-2 bg-brand-blue text-white text-sm rounded hover:bg-blue-700 shadow-sm"
                                        title="Recalcular com base nos dados atuais de 2025"
                                    >
                                        Recalcular Projeção
                                    </button>
                                </div>
                            </div>
                            
                             <div className="flex items-center p-3 bg-white border border-gray-200 rounded-md mt-4">
                                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full text-green-600 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Bônus de Produtividade da Equipe: <span className="text-green-600">{formatPercentage(productivityGainFactor)}</span></p>
                                    <p className="text-xs text-gray-500">Este ganho é calculado com base nas suas metas de redução de turnover e investimento em treinamento (People Analytics), influenciando sua capacidade de receita.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {renderBudgetTable(scenarioName)}

                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg no-print">
                        <p className="font-bold">Como funciona a projeção?</p>
                        <p className="text-sm mt-1">
                           No modo <strong>% Crescimento</strong>, o sistema projeta 2026 aplicando o "Crescimento Ajustado" sobre os dados de 2025. Ao clicar em <strong>Adicionar Custo</strong> ou editar uma célula, o sistema mudará automaticamente para o modo <strong>Manual</strong>, permitindo personalização total.
                        </p>
                    </div>
                    
                    <div className="mt-4">
                        <h3 className="text-lg font-bold text-brand-blue mb-2">Análise e Ações Estratégicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Gatilhos de Decisão</label>
                                    <button onClick={() => handleGenerateTriggers(scenarioName)} disabled={isLoading[`triggers-${scenarioName}`]} className="text-xs px-2 py-1 bg-brand-orange text-white rounded hover:opacity-80 disabled:bg-gray-400 no-print">
                                        {isLoading[`triggers-${scenarioName}`] ? 'Gerando...' : 'Gerar com IA'}
                                    </button>
                                </div>
                                <textarea
                                    value={planData.scenarioRelatedData[scenarioName].decisionTriggers}
                                    onChange={e => updateDecisionTrigger(scenarioName, e.target.value)}
                                    rows={5}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                                    placeholder={`Ex: NPS > 75; Pipeline 20% acima da meta`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ações Estratégicas</label>
                                <textarea
                                    value={planData.scenarioRelatedData[scenarioName].strategicActions}
                                    onChange={e => updateStrategicAction(scenarioName, e.target.value)}
                                    rows={5}
                                    className="w-full p-2 border border-gray-300 rounded-md mt-1 bg-white text-gray-900"
                                    placeholder={`Ex: Acelerar contratações em vendas; Aumentar budget de marketing.`}
                                />
                            </div>
                             <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border">
                                <div className="flex flex-wrap gap-4 justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">Análise do Cenário com IA</h4>
                                    </div>
                                    <button onClick={() => handleGenerateAnalysis(scenarioName)} disabled={isLoading[`analysis-${scenarioName}`]} className="text-xs px-2 py-1 bg-brand-orange text-white rounded hover:opacity-80 disabled:bg-gray-400 no-print">
                                        {isLoading[`analysis-${scenarioName}`] ? 'Analisando...' : 'Analisar Impacto'}
                                    </button>
                                </div>
                                <div className="mt-2 text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-md min-h-[70px] border">
                                    {planData.scenarioRelatedData[scenarioName].scenarioAnalysis || "Clique no botão para que a IA explique como sua pontuação estratégica influencia este cenário."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ScenarioPlanning;
