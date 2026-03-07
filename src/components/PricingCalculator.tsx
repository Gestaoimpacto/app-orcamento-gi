
import React, { useState, useMemo, useEffect } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { v4 as uuidv4 } from 'uuid';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, ReferenceLine } from 'recharts';
import type { PricingItem, DetailedCostBreakdown } from '../types';
import clsx from 'clsx';

// --- HELPER COMPONENTS ---

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={clsx("bg-white p-5 rounded-xl shadow-sm border border-gray-200", className)}>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

const InputGroup: React.FC<{ label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; hint?: string; max?: number, disabled?: boolean }> = ({ label, value, onChange, prefix, suffix, hint, max, disabled }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{label}</label>
        <div className="relative">
            {prefix && <span className="absolute left-3 top-2 text-gray-500 text-sm">{prefix}</span>}
            <input 
                type="number" 
                value={value} 
                onChange={e => onChange(Number(e.target.value))} 
                max={max}
                disabled={disabled}
                className={clsx("w-full p-2 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:bg-gray-100 disabled:text-gray-500", prefix && "pl-8", suffix && "pr-8")}
            />
            {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
        </div>
        {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
);

const FunnelStep: React.FC<{ label: string; value: number; unit?: string; color: string; isLast?: boolean; subLabel?: string }> = ({ label, value, unit = '', color, isLast, subLabel }) => (
    <div className="flex flex-col items-center relative z-10 w-full group">
        <div className={clsx("w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-md bg-white transition-transform hover:scale-105", color)}>
            <span className="text-lg sm:text-xl font-extrabold text-gray-800">{formatNumber(value, false)}</span>
            {unit && <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase">{unit}</span>}
        </div>
        <p className="text-[10px] sm:text-xs font-bold mt-2 uppercase text-gray-600 text-center">{label}</p>
        {subLabel && <p className="text-[9px] text-gray-400 text-center mt-0.5">{subLabel}</p>}
        {!isLast && <div className="absolute top-10 sm:top-12 left-1/2 w-full h-1 border-t-2 border-dashed border-gray-300 -z-10" style={{ transform: 'translateX(50%)' }}></div>}
    </div>
);

const BreakdownChart: React.FC<{ data: { name: string; value: number; color: string; percentage: number }[] }> = ({ data }) => (
    <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// --- MAIN COMPONENT ---

const PricingCalculator: React.FC = () => {
    const { pricingItems, addPricingItem, removePricingItem, taxes, summary2025 } = usePlan();
    const [activeTab, setActiveTab] = useState<'editor' | 'list' | 'mix'>('editor');
    
    // Editor State
    const [name, setName] = useState('');
    const [type, setType] = useState<'product' | 'service'>('product');
    const [salesModel, setSalesModel] = useState<'direct' | 'consultative'>('direct');
    const [estimatedMonthlyVolume, setEstimatedMonthlyVolume] = useState(1);

    // Detailed Costs State - Expanded for Services
    const initialDetailedCosts: DetailedCostBreakdown = {
        purchasePrice: 0, inboundFreight: 0, packaging: 0, otherDirectCosts: 0,
        hourlyRate: 0, hoursSpent: 0, softwareCosts: 0, travelCosts: 0,
        thirdPartyService: 0, materials: 0
    };
    const [detailedCosts, setDetailedCosts] = useState<DetailedCostBreakdown>(initialDetailedCosts);

    // Calculated Direct Cost (Sum)
    const directCost = useMemo(() => {
        if (type === 'product') {
            return detailedCosts.purchasePrice + detailedCosts.inboundFreight + detailedCosts.packaging + detailedCosts.otherDirectCosts;
        } else {
            return (detailedCosts.hourlyRate * detailedCosts.hoursSpent) + detailedCosts.softwareCosts + detailedCosts.travelCosts + detailedCosts.thirdPartyService + detailedCosts.materials;
        }
    }, [detailedCosts, type]);

    // Rates & Markup
    const [markupTarget, setMarkupTarget] = useState(20); // Margem de Lucro Desejada
    const [variableCostRate, setVariableCostRate] = useState(0);
    const [fixedCostRate, setFixedCostRate] = useState(0);
    const [taxRate, setTaxRate] = useState(0);
    
    // Behavioral & Funnel
    const [behavioralScore, setBehavioralScore] = useState(5);
    const [workingDays, setWorkingDays] = useState(22);
    
    const [funnelRates, setFunnelRates] = useState({
        leadToConversation: 30, conversationToMeeting: 20, meetingToProposal: 50, proposalToSale: 20,
        trafficToCart: 2, cartToSale: 30
    });

    // Load defaults
    useEffect(() => {
        const historicalRevenue = summary2025.receitaBrutaTotal || 1;
        setVariableCostRate(5); // Default commission/fees
        const fixedRate = (summary2025.custosFixosTotal / historicalRevenue) * 100;
        setFixedCostRate(parseFloat(fixedRate.toFixed(2)) || 20);
        setTaxRate(taxes.aliquotaEfetiva || 10);
    }, [summary2025, taxes]);

    // --- FINANCIAL CALCULATIONS (MARKUP DIVISOR) ---
    const financialCalc = useMemo(() => {
        const totalRates = taxRate + variableCostRate + fixedCostRate + markupTarget;
        const divisor = 1 - (totalRates / 100);
        let suggestedPrice = 0;
        let isValid = true;
        let errorMessage = '';

        if (totalRates >= 100) {
            isValid = false;
            errorMessage = "A soma das taxas (Impostos + Custos Var. + Fixos + Margem) ultrapassa 100%. O preço é matematicamente impossível.";
        } else if (directCost <= 0) {
            isValid = false;
            errorMessage = "Insira os custos diretos para calcular.";
        } else {
            suggestedPrice = directCost / divisor;
        }

        let strategicMultiplier = 1;
        if (behavioralScore >= 8) strategicMultiplier = 1.15; // +15%
        else if (behavioralScore <= 4) strategicMultiplier = 0.90; // -10%
        
        const finalPrice = suggestedPrice * strategicMultiplier; 
        
        // Monetize the percentages based on Final Price
        const taxesValue = finalPrice * (taxRate / 100);
        const variableValue = finalPrice * (variableCostRate / 100);
        const fixedValue = finalPrice * (fixedCostRate / 100);
        const profitValue = finalPrice - directCost - taxesValue - variableValue - fixedValue;
        
        const contributionMargin = finalPrice - directCost - taxesValue - variableValue;
        const markupMultiplier = directCost > 0 ? finalPrice / directCost : 0;

        const breakdownData = [
            { name: 'Custo Direto', value: directCost, color: '#6b7280', percentage: (directCost / finalPrice) * 100 },
            { name: 'Impostos', value: taxesValue, color: '#ef4444', percentage: taxRate },
            { name: 'Comissões/Var.', value: variableValue, color: '#f59e0b', percentage: variableCostRate },
            { name: 'Rateio Fixo', value: fixedValue, color: '#3b82f6', percentage: fixedCostRate },
            { name: 'Lucro Líquido', value: profitValue, color: '#10b981', percentage: (profitValue / finalPrice) * 100 }
        ];

        return { 
            suggestedPrice, finalPrice, isValid, errorMessage, 
            contributionMargin, netProfit: profitValue, 
            divisor, totalRates, markupMultiplier, breakdownData 
        };
    }, [directCost, markupTarget, variableCostRate, fixedCostRate, taxRate, behavioralScore]);

    // --- FUNNEL CALCULATIONS (BEHAVIORAL GOAL) ---
    const funnelCalc = useMemo(() => {
        if (!financialCalc.isValid || financialCalc.finalPrice <= 0) return null;

        const unitsNeeded = estimatedMonthlyVolume; // User Goal

        if (salesModel === 'consultative') {
            // Conversions
            const sales = unitsNeeded;
            const proposals = sales / (funnelRates.proposalToSale / 100);
            const meetings = proposals / (funnelRates.meetingToProposal / 100);
            const conversations = meetings / (funnelRates.conversationToMeeting / 100);
            const leads = conversations / (funnelRates.leadToConversation / 100);

            // Daily Activity
            const days = workingDays || 22;
            return { 
                unitsNeeded, 
                leads: Math.ceil(leads), 
                conversations: Math.ceil(conversations), 
                meetings: Math.ceil(meetings), 
                proposals: Math.ceil(proposals), 
                sales: Math.ceil(sales),
                
                dailyLeads: Math.ceil(leads / days),
                dailyMeetings: Math.ceil(meetings / days),
                dailyProposals: (proposals / days).toFixed(1), // Can be decimal
                dailySales: (sales / days).toFixed(2)
            };
        } else {
            // Direct Sales
            const sales = unitsNeeded;
            const carts = sales / (funnelRates.cartToSale / 100);
            const traffic = carts / (funnelRates.trafficToCart / 100);
            const days = workingDays || 22;
            
            return {
                unitsNeeded, 
                sales: Math.ceil(sales), 
                carts: Math.ceil(carts), 
                traffic: Math.ceil(traffic), 
                dailyTraffic: Math.ceil(traffic / days),
                dailySales: (sales / days).toFixed(2)
            }
        }
    }, [financialCalc, funnelRates, workingDays, salesModel, estimatedMonthlyVolume]);

    // --- MIX ANALYSIS CALCULATIONS ---
    const mixAnalysis = useMemo(() => {
        if (pricingItems.length === 0) return null;
        const globalFixedCosts = summary2025.custosFixosTotal / 12;
        
        let totalRevenueMix = 0;
        let totalMarginMix = 0;
        
        const productsWithShare = pricingItems.map(item => {
            const revenue = item.finalPrice * item.estimatedMonthlyVolume;
            const margin = item.contributionMargin * item.estimatedMonthlyVolume;
            totalRevenueMix += revenue;
            totalMarginMix += margin;
            return { ...item, revenue, margin };
        });

        const sortedByMargin = [...productsWithShare].sort((a,b) => b.margin - a.margin);
        let accumulatedMargin = 0;
        const abcList = sortedByMargin.map(item => {
            accumulatedMargin += item.margin;
            const share = totalMarginMix > 0 ? accumulatedMargin / totalMarginMix : 0;
            let classification = 'C';
            if (share <= 0.8) classification = 'A';
            else if (share <= 0.95) classification = 'B';
            return { ...item, classification, shareOfMargin: item.margin / totalMarginMix };
        });

        const weightedMarginPercent = totalRevenueMix > 0 ? totalMarginMix / totalRevenueMix : 0;
        const globalBreakEvenRevenue = weightedMarginPercent > 0 ? globalFixedCosts / weightedMarginPercent : 0;
        
        // Safety check for breakEvenDay to avoid Infinity or NaN
        let breakEvenDay = 31;
        if (totalRevenueMix > 0 && globalBreakEvenRevenue > 0) {
            breakEvenDay = Math.ceil((globalBreakEvenRevenue / totalRevenueMix) * 30);
        }

        const timelineData = [];
        let accMargin = 0;
        const dailyMargin = totalMarginMix / 30;

        // Day 0 to 30
        for (let day = 1; day <= 30; day++) {
            accMargin += dailyMargin;
            const netResult = accMargin - globalFixedCosts;
            timelineData.push({
                day, 
                netResult, // Can be negative or positive
                isPositive: netResult >= 0,
                accumulatedMargin: accMargin,
                fixedCost: globalFixedCosts
            });
        }

        return { 
            totalRevenueMix, totalMarginMix, globalFixedCosts, weightedMarginPercent, 
            globalBreakEvenRevenue, breakEvenDay, abcList, timelineData
        };
    }, [pricingItems, summary2025.custosFixosTotal]);

    const handleSave = () => {
        if (!name || !financialCalc.isValid) return;
        addPricingItem({
            id: uuidv4(),
            name,
            type,
            salesModel,
            estimatedMonthlyVolume,
            detailedCosts,
            directCost,
            markupTarget,
            taxRate,
            variableCostRate,
            fixedCostRate,
            behavioralScore,
            funnelRates,
            workingDays,
            suggestedPrice: financialCalc.suggestedPrice,
            finalPrice: financialCalc.finalPrice,
            contributionMargin: financialCalc.contributionMargin,
            contributionMarginPercent: (financialCalc.contributionMargin / financialCalc.finalPrice) * 100,
            netProfit: financialCalc.netProfit,
            netProfitPercent: (financialCalc.netProfit / financialCalc.finalPrice) * 100,
            breakEvenUnits: funnelCalc ? Math.ceil(funnelCalc.unitsNeeded) : 0,
            breakEvenRevenue: funnelCalc ? funnelCalc.unitsNeeded * financialCalc.finalPrice : 0
        });
        
        // Reset Form
        setActiveTab('list');
        setName('');
        setEstimatedMonthlyVolume(1);
        setDetailedCosts(initialDetailedCosts);
        setMarkupTarget(20);
        setBehavioralScore(5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-brand-dark">Precificação Estratégica (Markup)</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Defina preços lucrativos considerando todos os custos, impostos e a percepção de valor do cliente.
                    </p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('editor')} className={clsx("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'editor' ? "bg-white text-brand-orange shadow-sm" : "text-gray-500")}>Calculadora</button>
                    <button onClick={() => setActiveTab('list')} className={clsx("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'list' ? "bg-white text-brand-blue shadow-sm" : "text-gray-500")}>Itens Salvos ({pricingItems.length})</button>
                    <button onClick={() => setActiveTab('mix')} className={clsx("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'mix' ? "bg-white text-brand-green-600 shadow-sm text-green-700" : "text-gray-500")}>Análise de Mix</button>
                </div>
            </header>

            {activeTab === 'editor' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: Inputs (4 cols) */}
                    <div className="xl:col-span-4 space-y-6">
                        <Card title="1. Definição do Item">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nome</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: Produto A ou Consultoria" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo</label>
                                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md">
                                            <option value="product">Produto</option>
                                            <option value="service">Serviço</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Venda</label>
                                        <select value={salesModel} onChange={e => setSalesModel(e.target.value as any)} className="w-full p-2 border rounded-md">
                                            <option value="direct">Direta</option>
                                            <option value="consultative">Consultiva</option>
                                        </select>
                                    </div>
                                </div>
                                <InputGroup label="Previsão Vendas/Mês" value={estimatedMonthlyVolume} onChange={setEstimatedMonthlyVolume} suffix="unid." hint="Impacta no Mix Global." />
                            </div>
                        </Card>

                        <Card title="2. Composição de Custo Detalhado">
                            <div className="space-y-3">
                                {type === 'product' ? (
                                    <>
                                        <InputGroup label="Custo Aquisição/Prod." value={detailedCosts.purchasePrice} onChange={v => setDetailedCosts(p => ({...p, purchasePrice: v}))} prefix="R$" />
                                        <InputGroup label="Frete Entrada (Unit.)" value={detailedCosts.inboundFreight} onChange={v => setDetailedCosts(p => ({...p, inboundFreight: v}))} prefix="R$" />
                                        <InputGroup label="Embalagem" value={detailedCosts.packaging} onChange={v => setDetailedCosts(p => ({...p, packaging: v}))} prefix="R$" />
                                        <InputGroup label="Outros Custos Diretos" value={detailedCosts.otherDirectCosts} onChange={v => setDetailedCosts(p => ({...p, otherDirectCosts: v}))} prefix="R$" />
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            <InputGroup label="Custo Hora Técnica" value={detailedCosts.hourlyRate} onChange={v => setDetailedCosts(p => ({...p, hourlyRate: v}))} prefix="R$" />
                                            <InputGroup label="Horas Gastas" value={detailedCosts.hoursSpent} onChange={v => setDetailedCosts(p => ({...p, hoursSpent: v}))} suffix="h" />
                                        </div>
                                        <InputGroup label="Softwares/Licenças (Unit)" value={detailedCosts.softwareCosts} onChange={v => setDetailedCosts(p => ({...p, softwareCosts: v}))} prefix="R$" />
                                        <InputGroup label="Deslocamento" value={detailedCosts.travelCosts} onChange={v => setDetailedCosts(p => ({...p, travelCosts: v}))} prefix="R$" />
                                        <InputGroup label="Terceirizados (Freelancers)" value={detailedCosts.thirdPartyService} onChange={v => setDetailedCosts(p => ({...p, thirdPartyService: v}))} prefix="R$" />
                                        <InputGroup label="Materiais/Insumos" value={detailedCosts.materials} onChange={v => setDetailedCosts(p => ({...p, materials: v}))} prefix="R$" />
                                        <InputGroup label="Outros Custos Operacionais" value={detailedCosts.otherDirectCosts} onChange={v => setDetailedCosts(p => ({...p, otherDirectCosts: v}))} prefix="R$" />
                                    </>
                                )}
                                <div className="bg-gray-100 p-2 rounded text-right font-bold text-gray-700">
                                    Total Custo Direto: {formatCurrency(directCost)}
                                </div>
                            </div>
                        </Card>

                        <Card title="3. Formação de Preço (Divisor)">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Impostos" value={taxRate} onChange={setTaxRate} suffix="%" />
                                    <InputGroup label="Comissões/Taxas" value={variableCostRate} onChange={setVariableCostRate} suffix="%" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputGroup label="Rateio Custo Fixo" value={fixedCostRate} onChange={setFixedCostRate} suffix="%" hint="Baseado no histórico da empresa." />
                                    <InputGroup label="Margem Líquida (Meta)" value={markupTarget} onChange={setMarkupTarget} suffix="%" hint="O que sobra no bolso." />
                                </div>
                                {financialCalc.divisor <= 0 && (
                                    <div className="p-2 bg-red-100 text-red-700 text-xs rounded border border-red-200">
                                        <strong>Erro:</strong> A soma das porcentagens ultrapassa 100%. Impossível calcular preço.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Middle & Right Column: Results (8 cols) */}
                    <div className="xl:col-span-8 space-y-6">
                        
                        {/* Price Display */}
                        <div className="bg-white p-6 rounded-xl border-l-4 border-brand-orange shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-bold">Preço de Venda Sugerido</p>
                                <div className="flex items-baseline gap-2">
                                    {financialCalc.isValid ? (
                                        <>
                                            <p className="text-5xl font-extrabold text-brand-dark">{formatCurrency(financialCalc.finalPrice)}</p>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">Markup: {formatNumber(financialCalc.markupMultiplier)}x</span>
                                        </>
                                    ) : (
                                        <p className="text-xl font-bold text-red-500">Dados Inválidos</p>
                                    )}
                                </div>
                                {financialCalc.isValid && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Margem Contrib.: <span className="text-green-600 font-bold">{formatCurrency(financialCalc.contributionMargin)}</span> | Lucro Líquido Real: <span className="text-blue-600 font-bold">{formatCurrency(financialCalc.netProfit)}</span>
                                    </p>
                                )}
                            </div>
                            <button onClick={handleSave} disabled={!financialCalc.isValid || !name} className="px-8 py-4 bg-brand-dark text-white font-bold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 shadow-md transform transition hover:scale-105">
                                Salvar Item no Mix
                            </button>
                        </div>

                        {/* Breakdown Chart & Explanation */}
                        {financialCalc.isValid && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Para onde vai o dinheiro? (Composição do Preço)">
                                        <BreakdownChart data={financialCalc.breakdownData} />
                                        <div className="mt-4 text-xs text-gray-500 space-y-1">
                                            <p>Note como o lucro é apenas a última fatia. Se você der um desconto no preço final, ele sai inteiramente da sua fatia verde (Lucro).</p>
                                        </div>
                                    </Card>
                                    <div className="space-y-6">
                                        <Card title="Entenda o Cálculo (Consultoria)" className="bg-blue-50 border-blue-200">
                                            <div className="text-sm text-blue-900 space-y-2">
                                                <p>Você usou o método do <strong>Divisor (Markup por Dentro)</strong>. Isso garante que, ao dar o preço final, todas as taxas que incidem sobre a venda (impostos, comissões) sejam cobertas.</p>
                                                <p><strong>Custo Direto:</strong> {formatCurrency(directCost)}</p>
                                                <p><strong>Custo Fixo Rateado:</strong> {formatCurrency(financialCalc.finalPrice * (fixedCostRate/100))} (Isso paga aluguel, luz, equipe administrativa...)</p>
                                                <p className="font-bold text-brand-dark mt-2">O Preço foi multiplicado por {formatNumber(financialCalc.markupMultiplier)}x sobre o custo.</p>
                                            </div>
                                        </Card>
                                        
                                        <Card title="Fator Comportamental (Estratégia)">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Diferenciação (Nota 1-10)</label>
                                                    <input type="range" min="1" max="10" value={behavioralScore} onChange={e => setBehavioralScore(Number(e.target.value))} className="w-full accent-brand-orange" />
                                                    <div className="flex justify-between text-[10px] text-gray-400">
                                                        <span>Commodity (Preço Menor)</span>
                                                        <span className="font-bold text-brand-orange text-lg">{behavioralScore}</span>
                                                        <span>Exclusivo (Preço Maior)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Behavioral Funnel / Reverse Engineering */}
                                {funnelCalc && (
                                    <Card title={`Meta Diária de Comportamento (Para vender ${estimatedMonthlyVolume} un./mês)`} className="bg-brand-blue/5 border-brand-blue/20">
                                        <div className="text-center mb-6 text-sm text-gray-600">
                                            Para cumprir sua meta de vendas e garantir o Ponto de Equilíbrio, sua equipe precisa entregar esta atividade <strong>TODO DIA</strong>:
                                        </div>
                                        {salesModel === 'consultative' ? (
                                            <div className="flex flex-wrap justify-between items-center gap-4">
                                                <div className="flex-1 min-w-[100px]">
                                                    <FunnelStep label="Ligações / Contatos" value={funnelCalc.dailyLeads} color="border-blue-400" subLabel="Por Dia" />
                                                </div>
                                                <div className="flex-1 min-w-[100px]">
                                                    <FunnelStep label="Reuniões Realizadas" value={funnelCalc.dailyMeetings} color="border-purple-400" subLabel="Por Dia" />
                                                </div>
                                                <div className="flex-1 min-w-[100px]">
                                                    <FunnelStep label="Propostas Enviadas" value={Number(funnelCalc.dailyProposals)} unit="/dia" color="border-orange-400" subLabel="Por Dia" />
                                                </div>
                                                <div className="flex-1 min-w-[100px]">
                                                    <FunnelStep label="Fechamentos (Vendas)" value={Number(funnelCalc.dailySales)} unit="/dia" color="border-green-400" isLast subLabel="Por Dia" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-around items-center gap-4">
                                                <div className="flex-1">
                                                    <FunnelStep label="Visitantes Loja/Site" value={funnelCalc.dailyTraffic} color="border-blue-400" subLabel="Por Dia" />
                                                </div>
                                                <div className="flex-1">
                                                    <FunnelStep label="Vendas Realizadas" value={Number(funnelCalc.dailySales)} unit="/dia" color="border-green-400" isLast subLabel="Por Dia" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 text-center text-xs text-gray-500 italic">
                                            Baseado em {workingDays} dias úteis e nas taxas de conversão configuradas.
                                        </div>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingItems.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative group transition-all hover:shadow-xl">
                            <button onClick={() => removePricingItem(item.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">&times;</button>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={clsx("w-2 h-2 rounded-full", item.type === 'product' ? 'bg-purple-500' : 'bg-teal-500')}></span>
                                <h3 className="font-bold text-lg text-brand-dark">{item.name}</h3>
                            </div>
                            <div className="flex justify-between items-baseline mb-4">
                                <p className="text-3xl font-extrabold text-brand-orange">{formatCurrency(item.finalPrice)}</p>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{item.salesModel === 'direct' ? 'Venda Direta' : 'Consultiva'}</span>
                            </div>
                            
                            <div className="space-y-3 text-sm border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Volume Estimado</span>
                                    <span className="font-bold text-gray-700">{item.estimatedMonthlyVolume} un.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Margem Contrib.</span>
                                    <span className="font-bold text-gray-700">{formatCurrency(item.contributionMargin)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Lucro Líquido</span>
                                    <span className="font-bold text-green-600">{formatCurrency(item.netProfit)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {pricingItems.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                            Nenhum item precificado ainda. Use a calculadora para adicionar.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'mix' && mixAnalysis && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card title="Receita Potencial Mix">
                            <p className="text-2xl font-extrabold text-brand-dark">{formatCurrency(mixAnalysis.totalRevenueMix)}</p>
                            <p className="text-xs text-gray-500">Soma de todos os itens cadastrados</p>
                        </Card>
                        <Card title="Margem Contrib. Média">
                            <p className="text-2xl font-extrabold text-brand-blue">{formatPercentage(mixAnalysis.weightedMarginPercent * 100)}</p>
                            <p className="text-xs text-gray-500">Eficiência global do seu portfólio</p>
                        </Card>
                        <Card title="Custos Fixos Globais">
                            <p className="text-2xl font-extrabold text-red-600">{formatCurrency(mixAnalysis.globalFixedCosts)}</p>
                            <p className="text-xs text-gray-500">Média mensal (do seu Plano Financeiro)</p>
                        </Card>
                        <Card title="Ponto de Equilíbrio Global">
                            <p className="text-2xl font-extrabold text-green-600">{formatCurrency(mixAnalysis.globalBreakEvenRevenue)}</p>
                            <p className="text-xs text-gray-500">Receita mínima para pagar a conta</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* ABC Analysis */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-brand-blue mb-4">Curva ABC de Margem (Quem paga a conta?)</h3>
                            <div className="overflow-y-auto max-h-[400px]">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-semibold">Produto</th>
                                            <th className="p-2 text-center font-semibold">Classe</th>
                                            <th className="p-2 text-right font-semibold">Margem Total</th>
                                            <th className="p-2 text-right font-semibold">% Share</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {mixAnalysis.abcList.map(item => (
                                            <tr key={item.id}>
                                                <td className="p-2">{item.name}</td>
                                                <td className="p-2 text-center">
                                                    <span className={clsx("px-2 py-1 rounded text-xs font-bold", item.classification === 'A' ? "bg-green-100 text-green-800" : item.classification === 'B' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800")}>
                                                        {item.classification}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-right font-medium">{formatCurrency(item.margin)}</td>
                                                <td className="p-2 text-right text-gray-500">{formatPercentage(item.shareOfMargin * 100)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Break-even Timeline - NEW VISUALIZATION */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col h-fit">
                            <h3 className="text-lg font-bold text-brand-blue mb-2">Jornada do Lucro Mensal</h3>
                            <p className="text-xs text-gray-500 mb-6">Em que dia do mês você termina de pagar os custos e começa a lucrar?</p>
                            
                            {/* Visual Progress Bar (Calendar) */}
                            <div className="flex h-12 w-full rounded-lg overflow-hidden border border-gray-200 mb-2">
                                <div 
                                    className="bg-red-100 flex items-center justify-center text-red-800 font-bold text-xs border-r border-red-200 transition-all duration-500" 
                                    style={{ width: `${Math.min(100, (mixAnalysis.breakEvenDay / 30) * 100)}%` }}
                                >
                                    {mixAnalysis.breakEvenDay > 30 ? "Mês inteiro pagando contas" : `${mixAnalysis.breakEvenDay} dias`}
                                </div>
                                {mixAnalysis.breakEvenDay < 30 && (
                                    <div className="bg-green-100 flex items-center justify-center text-green-800 font-bold text-xs flex-grow transition-all duration-500">
                                        {30 - mixAnalysis.breakEvenDay} dias de lucro
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-6">
                                <span>Dia 1</span>
                                <span>Dia 30</span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Evolução do Saldo Diário (Acumulado)</h4>
                            <div className="h-[180px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mixAnalysis.timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="day" tick={{fontSize: 10}} interval={2} label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                        <YAxis tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} tick={{fontSize: 10}} />
                                        <Tooltip 
                                            formatter={(v: number) => [formatCurrency(v), "Saldo Acumulado"]} 
                                            labelFormatter={(l) => `Dia ${l}`} 
                                            contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px'}} 
                                        />
                                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                                        <Bar dataKey="netResult" radius={[2, 2, 0, 0]}>
                                            {mixAnalysis.timelineData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.netResult < 0 ? '#f87171' : '#34d399'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-600">Diagnóstico:</p>
                                <p className={clsx("text-xl font-bold", mixAnalysis.breakEvenDay > 30 ? "text-red-600" : "text-brand-dark")}>
                                    {mixAnalysis.breakEvenDay > 30 
                                        ? "Sua operação está no prejuízo." 
                                        : `Você começa a lucrar no dia ${mixAnalysis.breakEvenDay}.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'mix' && !mixAnalysis && (
                 <div className="col-span-3 text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                    Cadastre itens na calculadora para ver a análise de mix.
                </div>
            )}
        </div>
    );
};

export default PricingCalculator;
