
import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { MONTHS, MONTH_LABELS } from '../types';

const MetricCard: React.FC<{ 
    title: string; 
    value: string; 
    subtext: string; 
    color: 'green' | 'red' | 'blue' | 'orange';
    explanation: string; // New detailed explanation
}> = ({ title, value, subtext, color, explanation }) => {
    const [showInfo, setShowInfo] = useState(false);

    const colorClasses = {
        green: 'border-green-200 bg-green-50 text-green-800',
        red: 'border-red-200 bg-red-50 text-red-800',
        blue: 'border-blue-200 bg-blue-50 text-blue-800',
        orange: 'border-orange-200 bg-orange-50 text-orange-800'
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]} flex flex-col justify-between h-full relative transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</h3>
                <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-xs bg-white/50 w-5 h-5 rounded-full flex items-center justify-center font-serif italic font-bold hover:bg-white cursor-help"
                    title="O que é isso?"
                >
                    ?
                </button>
            </div>
            
            <div className="mt-2">
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-xs mt-1 opacity-80">{subtext}</p>
            </div>

            {/* Educational Tooltip/Overlay */}
            {showInfo && (
                <div className="absolute inset-0 bg-white p-4 rounded-xl shadow-lg border border-gray-200 z-10 text-gray-800 text-sm flex flex-col animate-fadeIn">
                    <div className="flex justify-between items-center mb-2">
                        <strong className="text-brand-blue font-bold">{title}</strong>
                        <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    <p className="leading-relaxed text-xs">{explanation}</p>
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
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Painel de Liquidez & Caixa (CFO)</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Monitore a saúde financeira, necessidade de capital de giro e a sobrevivência do caixa. 
                    <span className="text-sm ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">Clique no "?" nos cards para aprender.</span>
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                    title="Saldo Final de Caixa (Dez)" 
                    value={formatCurrency(liquidity.cashBalanceProjection?.['dez'])} 
                    subtext="Projeção acumulada no fim do ano" 
                    color="blue" 
                    explanation="É quanto dinheiro sobrará na conta da empresa no último dia do ano, considerando todas as receitas, despesas, investimentos e empréstimos planejados. É seu colchão de segurança."
                />
                <MetricCard 
                    title="Burn Rate (Taxa de Queima)" 
                    value={formatCurrency(liquidity.cashBurnRate)} 
                    subtext="Média mensal de queima de caixa" 
                    color="red" 
                    explanation="Indica a velocidade com que a empresa 'queima' dinheiro em meses de prejuízo ou alto investimento. Se for R$ 50k, significa que você precisa injetar ou ter R$ 50k guardado todo mês para não quebrar."
                />
                <MetricCard 
                    title="Runway (Pista)" 
                    value={liquidity.runwayMonths > 24 ? "> 24 meses" : `${formatNumber(liquidity.runwayMonths, false)} meses`} 
                    subtext="Sobrevivência sem novas receitas" 
                    color={liquidity.runwayMonths < 6 ? 'red' : 'green'} 
                    explanation="Tempo de vida da empresa. Se você parasse de vender hoje (ou se o investimento acabasse), quantos meses seu caixa atual aguentaria pagando as contas fixas? Menos de 6 meses é zona de perigo."
                />
                <MetricCard 
                    title="Ciclo Financeiro" 
                    value={`${Math.round(liquidity.cycleSummary.financialCycle)} dias`} 
                    subtext={`PMR: ${liquidity.cycleSummary.pmr} + PME: ${liquidity.cycleSummary.pme} - PMP: ${liquidity.cycleSummary.pmp}`} 
                    color="orange" 
                    explanation="O tempo que seu dinheiro fica 'preso' na operação. É o intervalo entre pagar o fornecedor e receber do cliente. Quanto maior, mais caixa você precisa ter guardado para girar a operação."
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold text-brand-blue mb-4">Evolução do Caixa vs. Necessidade de Capital de Giro (NCG)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38a169" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#38a169" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorNcg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dd6b20" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#dd6b20" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Area type="monotone" dataKey="cash" stroke="#38a169" fillOpacity={1} fill="url(#colorCash)" name="Saldo de Caixa (Disponível)" />
                            <Area type="monotone" dataKey="ncg" stroke="#dd6b20" fillOpacity={1} fill="url(#colorNcg)" name="Necessidade de Giro (NCG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-blue-50 text-sm text-blue-800 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-bold mb-1">Como interpretar este gráfico?</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Linha Verde (Caixa):</strong> É o dinheiro real no banco. Se cair abaixo de zero, você entrou no cheque especial.</li>
                        <li><strong>Linha Laranja (NCG):</strong> É quanto dinheiro a operação "pede" para rodar (Estoques + Contas a Receber - Fornecedores).</li>
                        <li><strong>O Perigo (Efeito Tesoura):</strong> Se a linha Laranja (NCG) cresce mais rápido que a Verde (Caixa), você está vendendo muito, mas recebendo pouco/tarde. Isso pode quebrar a empresa mesmo com lucro.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LiquidityDashboard;
