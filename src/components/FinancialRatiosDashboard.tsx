
import React from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatNumber, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';

const RatioCard: React.FC<{ 
    title: string; 
    value: string | number; 
    benchmark: string; 
    explanation: string; 
    status: 'good' | 'warning' | 'bad';
    diagnosis: string;
}> = ({ title, value, benchmark, explanation, status, diagnosis }) => {
    const [showInfo, setShowInfo] = React.useState(false);

    const statusMap = {
        good: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', label: 'Saudavel', bar: 'bg-emerald-500' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', label: 'Atencao', bar: 'bg-amber-500' },
        bad: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Critico', bar: 'bg-red-500' },
    };
    const s = statusMap[status];

    return (
        <div className={clsx("rounded-2xl border p-5 flex flex-col h-full relative transition-all hover:shadow-md", s.bg, s.border)}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-bold text-gray-700">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-bold", s.badge)}>{s.label}</span>
                    <button 
                        onClick={() => setShowInfo(!showInfo)}
                        className="w-5 h-5 rounded-full bg-white/70 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 hover:bg-white cursor-help"
                    >?</button>
                </div>
            </div>
            <div className={clsx("text-3xl font-extrabold mb-1", s.text)}>{value}</div>
            <p className="text-xs text-gray-400 mb-3">Meta: <span className="font-semibold">{benchmark}</span></p>
            
            <div className="mt-auto pt-3 border-t border-black/5">
                <p className="text-xs font-bold text-gray-600 mb-1">Diagnostico:</p>
                <p className="text-xs text-gray-500 italic leading-relaxed">"{diagnosis}"</p>
            </div>

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

const FinancialRatiosDashboard: React.FC = () => {
    const { financialIndicators, calculateFinancialPlan2026 } = usePlan();
    
    React.useEffect(() => {
        calculateFinancialPlan2026();
    }, []);

    const ratios = financialIndicators?.ratios || {
        liquidity: { currentRatio: 0, quickRatio: 0, cashRatio: 0 },
        solvency: { debtToEbitda: 0, debtToEquity: 0 },
        profitability: { roe: 0, roic: 0, netMargin: 0 },
        efficiency: { cacPayback: 0, assetTurnover: 0 }
    };

    const getStatus = (val: number, target: number, type: 'higher' | 'lower'): 'good' | 'warning' | 'bad' => {
        if (type === 'higher') return val >= target ? 'good' : val >= target * 0.8 ? 'warning' : 'bad';
        return val <= target ? 'good' : val <= target * 1.2 ? 'warning' : 'bad';
    };

    const diagnose = (val: number, target: number, type: 'higher' | 'lower', goodText: string, badText: string) => {
        const isGood = type === 'higher' ? val >= target : val <= target;
        return isGood ? goodText : badText;
    };

    const sections = [
        {
            title: 'Liquidez (Capacidade de Pagamento)',
            subtitle: 'Sua empresa consegue pagar as contas em dia?',
            cards: [
                { title: 'Liquidez Corrente', value: formatNumber(ratios.liquidity.currentRatio, false), benchmark: '> 1.5', status: getStatus(ratios.liquidity.currentRatio, 1.5, 'higher'), diagnosis: diagnose(ratios.liquidity.currentRatio, 1.5, 'higher', 'Sua empresa tem folga financeira para pagar todas as obrigacoes de curto prazo.', 'Risco de liquidez. Voce pode ter dificuldade para pagar contas se houver um imprevisto.'), explanation: 'Para cada R$1,00 de divida vencendo no curto prazo, quanto voce tem de bens (Caixa + Estoque + A Receber) para pagar.' },
                { title: 'Liquidez Seca', value: formatNumber(ratios.liquidity.quickRatio, false), benchmark: '> 1.0', status: getStatus(ratios.liquidity.quickRatio, 1.0, 'higher'), diagnosis: diagnose(ratios.liquidity.quickRatio, 1.0, 'higher', 'Voce consegue pagar suas dividas sem depender de vender o estoque.', 'Voce depende da venda do estoque para honrar compromissos.'), explanation: 'Igual a Liquidez Corrente, mas exclui o Estoque. Mostra a capacidade real de pagamento em um cenario de vendas fracas.' },
                { title: 'Liquidez Imediata', value: formatNumber(ratios.liquidity.cashRatio, false), benchmark: '> 0.5', status: getStatus(ratios.liquidity.cashRatio, 0.5, 'higher'), diagnosis: diagnose(ratios.liquidity.cashRatio, 0.5, 'higher', 'Caixa robusto. Metade das suas dividas poderiam ser quitadas hoje.', 'Baixa disponibilidade de dinheiro vivo. Gestao de caixa diaria precisa ser rigorosa.'), explanation: 'Quanto da divida curto prazo pode ser paga HOJE apenas com o dinheiro que ja esta no banco.' },
            ]
        },
        {
            title: 'Solvencia e Estrutura (Risco)',
            subtitle: 'Sua empresa esta muito endividada?',
            cards: [
                { title: 'Divida Liquida / EBITDA', value: `${formatNumber(ratios.solvency.debtToEbitda, false)}x`, benchmark: '< 2.5x', status: getStatus(ratios.solvency.debtToEbitda, 2.5, 'lower'), diagnosis: diagnose(ratios.solvency.debtToEbitda, 2.5, 'lower', 'Nivel de endividamento saudavel e compativel com sua geracao de caixa.', 'Endividamento perigoso. Sua operacao demora muito para pagar o que deve aos bancos.'), explanation: 'Indica quantos anos de geracao de caixa operacional (EBITDA) seriam necessarios para quitar toda a divida bancaria.' },
                { title: 'Divida / Patrimonio (D/E)', value: formatNumber(ratios.solvency.debtToEquity, false), benchmark: '< 1.0', status: getStatus(ratios.solvency.debtToEquity, 1.0, 'lower'), diagnosis: diagnose(ratios.solvency.debtToEquity, 1.0, 'lower', 'A empresa e financiada majoritariamente com capital proprio (socios), o que e mais seguro.', 'A empresa esta alavancada, operando majoritariamente com dinheiro de terceiros.'), explanation: 'Mede o quanto a empresa depende de capital de terceiros versus o dinheiro investido pelos socios.' },
            ]
        },
        {
            title: 'Rentabilidade e Eficiencia',
            subtitle: 'Seu negocio vale a pena financeiramente?',
            cards: [
                { title: 'Retorno sobre Patrimonio (ROE)', value: formatPercentage(ratios.profitability.roe), benchmark: '> 15%', status: getStatus(ratios.profitability.roe, 15, 'higher'), diagnosis: diagnose(ratios.profitability.roe, 15, 'higher', 'Excelente retorno para o acionista. O negocio vale a pena.', 'O retorno esta baixo. Talvez rendesse mais deixar o dinheiro no mercado financeiro.'), explanation: 'Quanto lucro a empresa gera para cada real que os socios investiram. E a taxa de juros interna do seu negocio.' },
                { title: 'Retorno sobre Capital Investido (ROIC)', value: formatPercentage(ratios.profitability.roic), benchmark: '> Custo da Divida', status: getStatus(ratios.profitability.roic, 10, 'higher'), diagnosis: diagnose(ratios.profitability.roic, 10, 'higher', 'A operacao e eficiente e gera valor acima do custo do dinheiro.', 'Destruicao de valor. A operacao rende menos do que custa pegar dinheiro emprestado.'), explanation: 'Mede a eficiencia pura da operacao em gerar retorno sobre todo o dinheiro investido (socios + bancos).' },
                { title: 'Payback do Custo de Aquisicao (CAC)', value: `${formatNumber(ratios.efficiency.cacPayback, false)} meses`, benchmark: '< 12 meses', status: getStatus(ratios.efficiency.cacPayback, 12, 'lower'), diagnosis: diagnose(ratios.efficiency.cacPayback, 12, 'lower', 'Seu marketing se paga rapidamente. Voce pode acelerar o crescimento.', 'Voce demora muito para recuperar o investimento em marketing. Risco de queimar caixa crescendo.'), explanation: 'Tempo (em meses) necessario para recuperar o custo de aquisicao de um cliente atraves do lucro que ele gera.' },
            ]
        }
    ];

    return (
        <div className="space-y-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Indicadores Financeiros</h1>
                <p className="text-gray-500 mt-1">
                    Analise profunda da saude financeira com diagnosticos automaticos sobre Liquidez, Solvencia e Eficiencia.
                </p>
            </header>

            {sections.map((section, idx) => (
                <div key={idx}>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">{`${idx + 1}. ${section.title}`}</h2>
                        <p className="text-xs text-gray-400">{section.subtitle}</p>
                    </div>
                    <div className={clsx("grid gap-4", section.cards.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3")}>
                        {section.cards.map((card, cIdx) => (
                            <RatioCard key={cIdx} {...card} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FinancialRatiosDashboard;
