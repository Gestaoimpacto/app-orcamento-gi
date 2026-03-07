
import React from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatNumber, formatPercentage } from '../utils/formatters';

const RatioCard: React.FC<{ 
    title: string; 
    value: string | number; 
    benchmark: string; 
    explanation: string; 
    status: 'good' | 'warning' | 'bad';
    diagnosis: string;
}> = ({ title, value, benchmark, explanation, status, diagnosis }) => {
    const statusColors = {
        good: 'bg-green-50 text-green-800 border-green-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        bad: 'bg-red-50 text-red-800 border-red-200',
    };

    const badgeColors = {
        good: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        bad: 'bg-red-100 text-red-800',
    };

    return (
        <div className={`rounded-xl shadow-sm border p-5 flex flex-col h-full ${statusColors[status]}`}>
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold opacity-80">{title}</h3>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${badgeColors[status]}`}>
                    {status === 'good' ? 'Saudável' : status === 'warning' ? 'Atenção' : 'Crítico'}
                </span>
            </div>
            <div className="text-3xl font-extrabold mb-1">{value}</div>
            <div className="text-xs opacity-70 mb-4">Meta: <span className="font-semibold">{benchmark}</span></div>
            
            <div className="mt-auto pt-3 border-t border-black/5">
                <p className="text-sm font-bold mb-1">Diagnóstico:</p>
                <p className="text-sm italic mb-2">"{diagnosis}"</p>
                <p className="text-[10px] opacity-70 uppercase tracking-wide font-semibold">O que significa?</p>
                <p className="text-xs leading-relaxed opacity-90">{explanation}</p>
            </div>
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

    // Helper to generate dynamic diagnosis text
    const diagnose = (val: number, target: number, type: 'higher' | 'lower', goodText: string, badText: string) => {
        const isGood = type === 'higher' ? val >= target : val <= target;
        return isGood ? goodText : badText;
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Indicadores Financeiros (KPIs)</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Análise profunda da saúde financeira com diagnósticos automáticos sobre Liquidez, Solvência e Eficiência.
                </p>
            </header>

            <div>
                <h2 className="text-xl font-bold text-brand-blue mb-4 border-b pb-2 flex items-center gap-2">
                    <span>💧</span> 1. Liquidez (Capacidade de Pagamento)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RatioCard 
                        title="Liquidez Corrente" 
                        value={formatNumber(ratios.liquidity.currentRatio, false)} 
                        benchmark="> 1.5" 
                        status={getStatus(ratios.liquidity.currentRatio, 1.5, 'higher')}
                        diagnosis={diagnose(ratios.liquidity.currentRatio, 1.5, 'higher', 
                            "Sua empresa tem folga financeira para pagar todas as obrigações de curto prazo.",
                            "Risco de liquidez. Você pode ter dificuldade para pagar contas se houver um imprevisto."
                        )}
                        explanation="Para cada R$1,00 de dívida vencendo no curto prazo, quanto você tem de bens (Caixa + Estoque + A Receber) para pagar."
                    />
                    <RatioCard 
                        title="Liquidez Seca" 
                        value={formatNumber(ratios.liquidity.quickRatio, false)} 
                        benchmark="> 1.0" 
                        status={getStatus(ratios.liquidity.quickRatio, 1.0, 'higher')}
                        diagnosis={diagnose(ratios.liquidity.quickRatio, 1.0, 'higher',
                            "Você consegue pagar suas dívidas sem depender de vender o estoque.",
                            "Você depende da venda do estoque para honrar compromissos. Se as vendas pararem, o caixa trava."
                        )}
                        explanation="Igual a Liquidez Corrente, mas exclui o Estoque. Mostra a capacidade real de pagamento em um cenário de vendas fracas."
                    />
                    <RatioCard 
                        title="Liquidez Imediata" 
                        value={formatNumber(ratios.liquidity.cashRatio, false)} 
                        benchmark="> 0.5" 
                        status={getStatus(ratios.liquidity.cashRatio, 0.5, 'higher')}
                        diagnosis={diagnose(ratios.liquidity.cashRatio, 0.5, 'higher',
                            "Caixa robusto. Metade das suas dívidas poderiam ser quitadas hoje.",
                            "Baixa disponibilidade de dinheiro vivo. Gestão de caixa diária precisa ser rigorosa."
                        )}
                        explanation="Quanto da dívida curto prazo pode ser paga HOJE apenas com o dinheiro que já está no banco."
                    />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-brand-blue mb-4 border-b pb-2 flex items-center gap-2">
                    <span>⚖️</span> 2. Solvência & Estrutura (Risco)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RatioCard 
                        title="Dívida Líquida / EBITDA" 
                        value={`${formatNumber(ratios.solvency.debtToEbitda, false)}x`} 
                        benchmark="< 2.5x" 
                        status={getStatus(ratios.solvency.debtToEbitda, 2.5, 'lower')}
                        diagnosis={diagnose(ratios.solvency.debtToEbitda, 2.5, 'lower',
                            "Nível de endividamento saudável e compatível com sua geração de caixa.",
                            "Endividamento perigoso. Sua operação demora muito para pagar o que deve aos bancos."
                        )}
                        explanation="Indica quantos anos de geração de caixa operacional (EBITDA) seriam necessários para quitar toda a dívida bancária. Bancos monitoram isso de perto."
                    />
                    <RatioCard 
                        title="Dívida / Patrimônio (D/E)" 
                        value={formatNumber(ratios.solvency.debtToEquity, false)} 
                        benchmark="< 1.0" 
                        status={getStatus(ratios.solvency.debtToEquity, 1.0, 'lower')}
                        diagnosis={diagnose(ratios.solvency.debtToEquity, 1.0, 'lower',
                            "A empresa é financiada majoritariamente com capital próprio (sócios), o que é mais seguro.",
                            "A empresa está alavancada, operando majoritariamente com dinheiro de terceiros (bancos/credores)."
                        )}
                        explanation="Mede o quanto a empresa depende de capital de terceiros versus o dinheiro investido pelos sócios."
                    />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-brand-blue mb-4 border-b pb-2 flex items-center gap-2">
                    <span>🚀</span> 3. Rentabilidade & Eficiência
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RatioCard 
                        title="ROE (Retorno s/ Patrimônio)" 
                        value={formatPercentage(ratios.profitability.roe)} 
                        benchmark="> 15%" 
                        status={getStatus(ratios.profitability.roe, 15, 'higher')}
                        diagnosis={diagnose(ratios.profitability.roe, 15, 'higher',
                            "Excelente retorno para o acionista. O negócio vale a pena.",
                            "O retorno está baixo. Talvez rendesse mais deixar o dinheiro no mercado financeiro."
                        )}
                        explanation="Quanto lucro a empresa gera para cada real que os sócios investiram. É a taxa de juros interna do seu negócio."
                    />
                    <RatioCard 
                        title="ROIC (Retorno s/ Capital Investido)" 
                        value={formatPercentage(ratios.profitability.roic)} 
                        benchmark="> Custo da Dívida" 
                        status={getStatus(ratios.profitability.roic, 10, 'higher')} // Assuming 10% cost of debt proxy
                        diagnosis={diagnose(ratios.profitability.roic, 10, 'higher',
                            "A operação é eficiente e gera valor acima do custo do dinheiro.",
                            "Destruição de valor. A operação rende menos do que custa pegar dinheiro emprestado."
                        )}
                        explanation="Mede a eficiência pura da operação em gerar retorno sobre todo o dinheiro investido (sócios + bancos)."
                    />
                     <RatioCard 
                        title="CAC Payback" 
                        value={`${formatNumber(ratios.efficiency.cacPayback, false)} meses`} 
                        benchmark="< 12 meses" 
                        status={getStatus(ratios.efficiency.cacPayback, 12, 'lower')}
                        diagnosis={diagnose(ratios.efficiency.cacPayback, 12, 'lower',
                            "Seu marketing se paga rapidamente. Você pode acelerar o crescimento.",
                            "Você demora muito para recuperar o investimento em marketing. Risco de queimar caixa crescendo."
                        )}
                        explanation="Tempo (em meses) necessário para recuperar o custo de aquisição de um cliente através do lucro que ele gera."
                    />
                </div>
            </div>
        </div>
    );
};

export default FinancialRatiosDashboard;
