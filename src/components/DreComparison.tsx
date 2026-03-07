
import React, { useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { MONTHS, MONTH_LABELS, Month } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';

const SummaryCard: React.FC<{ title: string; planned: number; actual: number; higherIsBetter?: boolean }> = ({ title, planned, actual, higherIsBetter = true }) => {
    const diff = actual - planned;
    const percent = planned > 0 ? (diff / planned) * 100 : 0;
    const isGood = higherIsBetter ? diff >= 0 : diff <= 0;
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title} (YTD)</h3>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-xs text-gray-400">Orçado</p>
                    <p className="text-lg font-semibold text-gray-600">{formatCurrency(planned, true)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Realizado</p>
                    <p className="text-xl font-bold text-brand-dark">{formatCurrency(actual, true)}</p>
                </div>
            </div>
            <div className={`mt-2 text-xs font-bold ${isGood ? 'text-green-600' : 'text-red-600'} text-center bg-gray-50 py-1 rounded`}>
                {diff > 0 ? '+' : ''}{formatCurrency(diff, true)} ({formatPercentage(Math.abs(percent))})
            </div>
        </div>
    );
};

const DreRow: React.FC<{
    label: string;
    monthData: { [key in Month]: { planned: number; actual: number | null } };
    isBold?: boolean;
    isHeader?: boolean;
    isSubItem?: boolean;
    higherIsBetter?: boolean;
    isEditable?: boolean;
    fieldKey?: string; // Key to update in tracking2026
    onUpdate?: (month: Month, field: string, value: string) => void;
}> = ({ label, monthData, isBold, isHeader, isSubItem, higherIsBetter = true, isEditable, fieldKey, onUpdate }) => {
    
    if (isHeader) {
        return (
            <tr className="bg-gray-100 border-b border-gray-300">
                <td className="sticky left-0 bg-gray-100 z-20 p-3 font-bold text-gray-800 text-xs uppercase border-r border-gray-300">{label}</td>
                {MONTHS.map(m => (
                    <td key={m} colSpan={3} className="p-0 border-r border-gray-300"></td>
                ))}
            </tr>
        );
    }

    return (
        <tr className={clsx("border-b border-gray-100 hover:bg-gray-50 transition-colors", isBold && "bg-gray-50 font-semibold")}>
            <td className={clsx("sticky left-0 bg-white z-10 p-3 text-sm border-r border-gray-200 whitespace-nowrap", isSubItem ? "pl-8 text-gray-600" : "text-gray-800")}>
                {label}
            </td>
            {MONTHS.map(m => {
                const planned = monthData?.[m]?.planned || 0;
                const actual = monthData?.[m]?.actual;
                // We consider "hasActual" true only if it's not null/undefined. 0 is a valid actual.
                const hasActual = actual !== null && actual !== undefined;
                
                let variance = 0;
                let variancePercent = 0;
                let isGood = true;

                if (hasActual) {
                    variance = (actual as number) - planned;
                    variancePercent = planned !== 0 ? (variance / planned) * 100 : 0;
                    isGood = higherIsBetter ? variance >= 0 : variance <= 0;
                }

                return (
                    <React.Fragment key={m}>
                        <td className="p-2 text-right text-xs text-gray-500 w-24 border-r border-gray-100 bg-gray-50/30">
                            {formatCurrency(planned, true)}
                        </td>
                        <td className="p-0 w-24 border-r border-gray-100 text-right align-middle">
                            {isEditable && onUpdate && fieldKey ? (
                                <input 
                                    type="number" 
                                    value={actual ?? ''} 
                                    onChange={(e) => onUpdate(m, fieldKey, e.target.value)}
                                    className="w-full h-full p-2 text-right text-xs font-medium text-brand-dark border-none bg-transparent focus:ring-2 focus:ring-brand-orange focus:bg-white"
                                    placeholder="-"
                                />
                            ) : (
                                <div className="p-2 text-xs text-brand-dark font-medium">
                                    {hasActual ? formatCurrency(actual, true) : '-'}
                                </div>
                            )}
                        </td>
                        <td className={clsx("p-2 text-right text-xs w-20 border-r border-gray-300 font-bold", 
                            !hasActual ? "text-gray-300" : (isGood ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50")
                        )}>
                            {hasActual ? `${formatPercentage(variancePercent, 0)}` : '-'}
                        </td>
                    </React.Fragment>
                );
            })}
        </tr>
    );
};

const DreComparison: React.FC = () => {
    const { scenarios2026, tracking2026, updateTracking2026, baseScenario } = usePlan();
    const scenario = scenarios2026[baseScenario];
    const projection = scenario.projection;

    // --- Data Preparation ---
    const preparedData = useMemo(() => {
        const data: any = {
            receitaBruta: {}, impostos: {}, receitaLiquida: {}, custosVariaveisTotal: {},
            margemContribuicao: {}, despesasFixasTotal: {}, ebitda: {}, lucroLiquido: {}
        };

        // Initialize structure
        const metrics = Object.keys(data);
        metrics.forEach(key => {
            MONTHS.forEach(m => { if (!data[key]) data[key] = {}; data[key][m] = { planned: 0, actual: null }; });
        });

        // Sub-items preparation
        const subItems: any = {
            cmv: {}, comissoes: {}, fretes: {}, folha: {}, aluguel: {}, mkt: {}, admin: {}, ops: {}
        };
        Object.keys(subItems).forEach(key => {
             MONTHS.forEach(m => { if (!subItems[key]) subItems[key] = {}; subItems[key][m] = { planned: 0, actual: null }; });
        });

        // Safe access helper for custom items
        const getCustomItemValues = (item: any, month: Month) => {
            if (!item || !item.values) return 0;
            return Number(item.values[month]) || 0;
        };

        // Custom Items Preparation
        const customVariaveis = (projection.customCustosVariaveis || []).map(item => {
            const monthData: any = {};
            MONTHS.forEach(m => {
                const track = tracking2026[m];
                const actualVal = track ? (track[`custom_${item.id}`] as number) : null;
                monthData[m] = { planned: getCustomItemValues(item, m), actual: actualVal };
            });
            return { id: item.id, name: item.name, monthData };
        });

        const customFixos = (projection.customCustosFixos || []).map(item => {
            const monthData: any = {};
            MONTHS.forEach(m => {
                const track = tracking2026[m];
                const actualVal = track ? (track[`custom_${item.id}`] as number) : null;
                monthData[m] = { planned: getCustomItemValues(item, m), actual: actualVal };
            });
            return { id: item.id, name: item.name, monthData };
        });


        MONTHS.forEach(m => {
            const track = tracking2026[m];
            
            // --- PLAN CALCULATIONS ---
            const pRb = projection.receitaBruta?.[m] || 0;
            const pImp = projection.impostosSobreFaturamento?.[m] || 0;
            const pRl = pRb - pImp;
            
            const pCmv = projection.cmv?.[m] || 0;
            const pCom = projection.comissoes?.[m] || 0;
            const pFre = projection.fretes?.[m] || 0;
            const pCustVarCustom = (projection.customCustosVariaveis || []).reduce((s, i) => s + getCustomItemValues(i, m), 0);
            const pCustVarTotal = pCmv + pCom + pFre + pCustVarCustom;

            const pMc = pRl - pCustVarTotal;

            const pFolha = projection.folhaPagamento?.[m] || 0;
            const pAluguel = projection.aluguel?.[m] || 0;
            const pOps = projection.despesasOperacionais?.[m] || 0;
            const pMkt = projection.marketingFixo?.[m] || 0;
            const pAdmin = projection.administrativo?.[m] || 0;
            const pDespFixCustom = (projection.customCustosFixos || []).reduce((s, i) => s + getCustomItemValues(i, m), 0);
            const pDespFixTotal = pFolha + pAluguel + pOps + pMkt + pAdmin + pDespFixCustom;

            const pEbitda = pMc - pDespFixTotal;
            const pLucro = pEbitda * 0.85; // Simplified Net Profit

            // --- ACTUAL CALCULATIONS ---
            const getVal = (key: string): number | null => {
                if (!track) return null;
                const v = track[key];
                return (v !== undefined && v !== null && v !== '') ? Number(v) : null;
            }

            const aRb = getVal('receitaBruta'); 
            const aImp = getVal('impostos');
            const aRl_Detailed = (aRb !== null && aImp !== null) ? aRb - aImp : null;
            const aRl = aRl_Detailed !== null ? aRl_Detailed : getVal('receitaRealizada'); 

            const aCmv = getVal('cmv');
            const aCom = getVal('comissoes');
            const aFre = getVal('fretes');
            const aCustVarCustom = (projection.customCustosVariaveis || []).reduce((s, i) => {
                const v = getVal(`custom_${i.id}`);
                return s + (v || 0);
            }, 0);
            
            let aCustVarTotal: number | null = null;
            if (aCmv !== null || aCom !== null || aFre !== null) {
                aCustVarTotal = (aCmv||0) + (aCom||0) + (aFre||0) + aCustVarCustom;
            } else {
                aCustVarTotal = getVal('custosRealizados');
            }

            const aMc = (aRl !== null && aCustVarTotal !== null) ? aRl - aCustVarTotal : null;

            const aFolha = getVal('folha');
            const aAluguel = getVal('aluguel');
            const aMkt = getVal('marketing');
            const aAdmin = getVal('administrativo');
            const aOps = getVal('operacional');
            const aDespFixCustom = (projection.customCustosFixos || []).reduce((s, i) => {
                const v = getVal(`custom_${i.id}`);
                return s + (v || 0);
            }, 0);

            let aDespFixTotal: number | null = null;
            if (aFolha !== null || aAluguel !== null || aMkt !== null || aAdmin !== null || aOps !== null) {
                aDespFixTotal = (aFolha||0) + (aAluguel||0) + (aMkt||0) + (aAdmin||0) + (aOps||0) + aDespFixCustom;
            } else {
                aDespFixTotal = getVal('despesasRealizadas');
            }

            const aEbitda = (aMc !== null && aDespFixTotal !== null) ? aMc - aDespFixTotal : null;
            const aLucro = aEbitda !== null ? aEbitda * 0.85 : null;

            // Populate Data Structure
            data.receitaBruta[m] = { planned: pRb, actual: aRb };
            data.impostos[m] = { planned: pImp, actual: aImp };
            data.receitaLiquida[m] = { planned: pRl, actual: aRl };
            
            data.custosVariaveisTotal[m] = { planned: pCustVarTotal, actual: aCustVarTotal };
            subItems.cmv[m] = { planned: pCmv, actual: aCmv };
            subItems.comissoes[m] = { planned: pCom, actual: aCom };
            subItems.fretes[m] = { planned: pFre, actual: aFre };

            data.margemContribuicao[m] = { planned: pMc, actual: aMc };

            data.despesasFixasTotal[m] = { planned: pDespFixTotal, actual: aDespFixTotal };
            subItems.folha[m] = { planned: pFolha, actual: aFolha };
            subItems.aluguel[m] = { planned: pAluguel, actual: aAluguel };
            subItems.mkt[m] = { planned: pMkt, actual: aMkt };
            subItems.admin[m] = { planned: pAdmin, actual: aAdmin };
            subItems.ops[m] = { planned: pOps, actual: aOps };

            data.ebitda[m] = { planned: pEbitda, actual: aEbitda };
            data.lucroLiquido[m] = { planned: pLucro, actual: aLucro };
        });

        return { main: data, subs: subItems, customVariaveis, customFixos };
    }, [scenarios2026, tracking2026, baseScenario]);

    // --- YTD Calculation ---
    const ytd = useMemo(() => {
        const sum = { pRl: 0, aRl: 0, pEbitda: 0, aEbitda: 0, pLucro: 0, aLucro: 0 };
        MONTHS.forEach(m => {
            const d = preparedData.main;
            if (d.receitaLiquida[m].actual !== null) {
                sum.pRl += d.receitaLiquida[m].planned;
                sum.aRl += d.receitaLiquida[m].actual!;
                sum.pEbitda += d.ebitda[m].planned;
                sum.aEbitda += d.ebitda[m].actual!;
                sum.pLucro += d.lucroLiquido[m].planned;
                sum.aLucro += d.lucroLiquido[m].actual!;
            }
        });
        return sum;
    }, [preparedData]);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center no-print">
                <div>
                    <h1 className="text-4xl font-bold text-brand-dark">13. Comparativo DRE (Orç x Real)</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Preencha a coluna "Realizado" para monitorar os desvios. Os totais são calculados automaticamente.
                    </p>
                    <p className="text-xs text-brand-orange font-bold mt-1">Cenário Base: {baseScenario}</p>
                </div>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 font-semibold text-white bg-brand-blue rounded-md hover:opacity-80 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Relatório
                </button>
            </header>

            {/* YTD Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Receita Líquida Acumulada" planned={ytd.pRl} actual={ytd.aRl} higherIsBetter={true} />
                <SummaryCard title="EBITDA Acumulado" planned={ytd.pEbitda} actual={ytd.aEbitda} higherIsBetter={true} />
                <SummaryCard title="Lucro Líquido (Est.)" planned={ytd.pLucro} actual={ytd.aLucro} higherIsBetter={true} />
            </div>

            {/* Main Comparison Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-brand-blue">Demonstrativo de Resultados Comparativo</h2>
                    <div className="text-xs text-gray-500">
                        <span className="inline-block w-3 h-3 bg-gray-200 mr-1 rounded-sm"></span> Orçado
                        <span className="inline-block w-3 h-3 bg-white border border-gray-300 ml-3 mr-1 rounded-sm"></span> Realizado (Editável)
                        <span className="inline-block w-3 h-3 bg-green-100 ml-3 mr-1 rounded-sm"></span> Var Positiva
                        <span className="inline-block w-3 h-3 bg-red-100 ml-3 mr-1 rounded-sm"></span> Var Negativa
                    </div>
                </div>
                
                <div className="overflow-x-auto max-w-full">
                    <table className="min-w-max text-sm border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-white z-30 p-4 text-left border-b-2 border-r border-gray-300 min-w-[250px]">Indicador</th>
                                {MONTHS.map(m => (
                                    <th key={m} colSpan={3} className="p-2 text-center border-b-2 border-r border-gray-300 bg-gray-50 min-w-[200px]">
                                        {MONTH_LABELS[m]}
                                        <div className="flex justify-between text-[10px] text-gray-400 font-normal mt-1 px-2">
                                            <span className="w-1/3 text-right">Orc.</span>
                                            <span className="w-1/3 text-right">Real</span>
                                            <span className="w-1/3 text-right">Var%</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Revenue Section */}
                            <DreRow label="Receita Bruta" monthData={preparedData.main.receitaBruta} isSubItem higherIsBetter={true} isEditable fieldKey="receitaBruta" onUpdate={updateTracking2026} />
                            <DreRow label="(-) Impostos" monthData={preparedData.main.impostos} isSubItem higherIsBetter={false} isEditable fieldKey="impostos" onUpdate={updateTracking2026} />
                            <DreRow label="(=) Receita Líquida" monthData={preparedData.main.receitaLiquida} isBold />
                            
                            {/* Variable Costs Section */}
                            <DreRow label="(-) Custos Variáveis" monthData={preparedData.main.custosVariaveisTotal} isHeader />
                            <DreRow label="Total Custos Variáveis" monthData={preparedData.main.custosVariaveisTotal} isBold higherIsBetter={false} />
                            <DreRow label="CMV" monthData={preparedData.subs.cmv} isSubItem higherIsBetter={false} isEditable fieldKey="cmv" onUpdate={updateTracking2026} />
                            <DreRow label="Comissões" monthData={preparedData.subs.comissoes} isSubItem higherIsBetter={false} isEditable fieldKey="comissoes" onUpdate={updateTracking2026} />
                            <DreRow label="Fretes" monthData={preparedData.subs.fretes} isSubItem higherIsBetter={false} isEditable fieldKey="fretes" onUpdate={updateTracking2026} />
                            {preparedData.customVariaveis.map((item: any) => (
                                <DreRow key={item.id} label={item.name} monthData={item.monthData} isSubItem higherIsBetter={false} isEditable fieldKey={`custom_${item.id}`} onUpdate={updateTracking2026} />
                            ))}

                            {/* Margin Section */}
                            <DreRow label="(=) Margem de Contribuição" monthData={preparedData.main.margemContribuicao} isBold />

                            {/* Fixed Costs Section */}
                            <DreRow label="(-) Despesas Fixas" monthData={preparedData.main.despesasFixasTotal} isHeader />
                            <DreRow label="Total Despesas Fixas" monthData={preparedData.main.despesasFixasTotal} isBold higherIsBetter={false} />
                            <DreRow label="Folha de Pagamento" monthData={preparedData.subs.folha} isSubItem higherIsBetter={false} isEditable fieldKey="folha" onUpdate={updateTracking2026} />
                            <DreRow label="Aluguel" monthData={preparedData.subs.aluguel} isSubItem higherIsBetter={false} isEditable fieldKey="aluguel" onUpdate={updateTracking2026} />
                            <DreRow label="Marketing" monthData={preparedData.subs.mkt} isSubItem higherIsBetter={false} isEditable fieldKey="marketing" onUpdate={updateTracking2026} />
                            <DreRow label="Administrativo" monthData={preparedData.subs.admin} isSubItem higherIsBetter={false} isEditable fieldKey="administrativo" onUpdate={updateTracking2026} />
                            <DreRow label="Operacional" monthData={preparedData.subs.ops} isSubItem higherIsBetter={false} isEditable fieldKey="operacional" onUpdate={updateTracking2026} />
                            {preparedData.customFixos.map((item: any) => (
                                <DreRow key={item.id} label={item.name} monthData={item.monthData} isSubItem higherIsBetter={false} isEditable fieldKey={`custom_${item.id}`} onUpdate={updateTracking2026} />
                            ))}

                            {/* Result Section */}
                            <DreRow label="(=) EBITDA" monthData={preparedData.main.ebitda} isBold />
                            <DreRow label="(=) Lucro Líquido Estimado" monthData={preparedData.main.lucroLiquido} isBold />
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-blue-50 text-xs text-blue-800 border-t border-blue-200">
                    <strong>Dica:</strong> Digite os valores realizados diretamente nas células. Os totais (Receita Líquida, Custos Variáveis, EBITDA) são calculados automaticamente conforme você preenche os detalhes (CMV, Folha, etc.).
                </div>
            </div>
        </div>
    );
};

export default DreComparison;
