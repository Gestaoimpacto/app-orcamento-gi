
import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MONTHS, MONTH_LABELS } from '../types';
import clsx from 'clsx';

const MetricCard: React.FC<{ 
    title: string; 
    value: string; 
    subtext: string; 
    color: 'green' | 'red' | 'blue' | 'orange';
    explanation: string;
    icon: React.ReactNode;
}> = ({ title, value, subtext, color, explanation, icon }) => {
    const [showInfo, setShowInfo] = useState(false);

    const colorMap = {
        green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
        red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'bg-red-100 text-red-600' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100 text-blue-600' },
        orange: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' },
    };
    const c = colorMap[color];

    return (
        <div className={clsx("p-5 rounded-2xl border relative transition-all hover:shadow-md", c.bg, c.border)}>
            <div className="flex justify-between items-start mb-3">
                <div className={clsx("p-2.5 rounded-xl", c.icon)}>{icon}</div>
                <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-6 h-6 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-xs text-gray-400 hover:bg-white hover:text-gray-600 transition-colors cursor-help"
                >?</button>
            </div>
            <p className={clsx("text-2xl font-extrabold", c.text)}>{value}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>

            {showInfo && (
                <div className="absolute inset-0 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 z-10 flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <strong className="text-sm font-bold text-gray-900">{title}</strong>
                        <button onClick={() => setShowInfo(false)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm">&times;</button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{explanation}</p>
                </div>
            )}
        </div>
    );
};

const LiquidityDashboard: React.FC = () => {
    const { financialIndicators, calculateFinancialPlan2026 } = usePlan();
    
    React.useEffect(() => {
        calculateFinancialPlan2026();
    }, []);

    const liquidity = financialIndicators?.liquidity || {
        monthlyNCG: {},
        cashBurnRate: 0,
        runwayMonths: 0,
        cashBalanceProjection: {},
        cycleSummary: { pmr: 0, pme: 0, pmp: 0, financialCycle: 0 }
    };

    const chartData = MONTHS.map(m => ({
        month: MONTH_LABELS[m].substring(0, 3),
        cash: liquidity.cashBalanceProjection?.[m] || 0,
        ncg: liquidity.monthlyNCG?.[m] || 0,
    }));

    return (
        <div className="space-y-6">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel de Liquidez e Caixa</h1>
                <p className="text-gray-500 mt-1">
                    Monitore a saude financeira, necessidade de capital de giro e a sobrevivencia do caixa.
                    <span className="text-xs ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200">Clique no "?" para aprender</span>
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Saldo Final de Caixa (Dezembro)" 
                    value={formatCurrency(liquidity.cashBalanceProjection?.['dez'])} 
                    subtext="Projeção acumulada no fim do ano" 
                    color="blue" 
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1" /></svg>}
                    explanation="E quanto dinheiro sobrara na conta da empresa no ultimo dia do ano, considerando todas as receitas, despesas, investimentos e emprestimos planejados. E seu colchao de seguranca."
                />
                <MetricCard 
                    title="Taxa de Queima (Burn Rate)" 
                    value={formatCurrency(liquidity.cashBurnRate)} 
                    subtext="Media mensal de queima de caixa" 
                    color="red" 
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>}
                    explanation="Indica a velocidade com que a empresa 'queima' dinheiro em meses de prejuízo ou alto investimento. Se for R$ 50k, significa que você precisa injetar ou ter R$ 50k guardado todo mes para nao quebrar."
                />
                <MetricCard 
                    title="Pista de Sobrevivencia (Runway)" 
                    value={liquidity.runwayMonths > 24 ? "> 24 meses" : `${formatNumber(liquidity.runwayMonths, false)} meses`} 
                    subtext="Sobrevivencia sem novas receitas" 
                    color={liquidity.runwayMonths < 6 ? 'red' : 'green'} 
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    explanation="Tempo de vida da empresa. Se você parasse de vender hoje, quantos meses seu caixa atual aguentaria pagando as contas fixas? Menos de 6 meses e zona de perigo."
                />
                <MetricCard 
                    title="Ciclo Financeiro" 
                    value={`${formatNumber(Math.round(liquidity.cycleSummary.financialCycle))} dias`} 
                    subtext={`Receber: ${liquidity.cycleSummary.pmr}d + Estoque: ${liquidity.cycleSummary.pme}d - Pagar: ${liquidity.cycleSummary.pmp}d`} 
                    color="orange" 
                    icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                    explanation="O tempo que seu dinheiro fica 'preso' na operação. E o intervalo entre pagar o fornecedor e receber do cliente. Quanto maior, mais caixa você precisa ter guardado para girar a operação."
                />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Evolucao do Caixa vs. Necessidade de Capital de Giro</h2>
                <p className="text-xs text-gray-400 mb-4">Acompanhe se o caixa disponivel cobre a necessidade operacional</p>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorNcg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(v) => `R$${Math.round(v/1000).toLocaleString('pt-BR')}k`} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Area type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" name="Saldo de Caixa (Disponivel)" />
                            <Area type="monotone" dataKey="ncg" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorNcg)" name="Necessidade de Giro (NCG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-2">
                        <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-1">Como interpretar este grafico?</p>
                            <div className="space-y-1 text-xs leading-relaxed">
                                <p><strong>Linha Verde (Caixa):</strong> E o dinheiro real no banco. Se cair abaixo de zero, você entrou no cheque especial.</p>
                                <p><strong>Linha Laranja (NCG):</strong> E quanto dinheiro a operação "pede" para rodar (Estoques + Contas a Receber - Fornecedores).</p>
                                <p><strong>O Perigo (Efeito Tesoura):</strong> Se a linha Laranja cresce mais rápido que a Verde, você esta vendendo muito mas recebendo pouco/tarde. Isso pode quebrar a empresa mesmo com lucro.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiquidityDashboard;
