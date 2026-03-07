import React, { useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import clsx from 'clsx';

const ProductPortfolio: React.FC = () => {
    const { planData, updateProductPortfolioItem, addProductPortfolioItem, removeProductPortfolioItem } = usePlan();

    // Calcular Curva ABC
    const abcAnalysis = useMemo(() => {
        const products = planData.productPortfolio.filter(p => (p.revenue2025 || 0) > 0);
        if (products.length === 0) return { items: [], totalRevenue: 0 };

        const totalRevenue = products.reduce((sum, p) => sum + (p.revenue2025 || 0), 0);
        const sorted = [...products].sort((a, b) => (b.revenue2025 || 0) - (a.revenue2025 || 0));
        
        let cumulative = 0;
        const items = sorted.map(p => {
            const revenue = p.revenue2025 || 0;
            const percent = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            cumulative += percent;
            let classification: 'A' | 'B' | 'C' = 'C';
            if (cumulative <= 80) classification = 'A';
            else if (cumulative <= 95) classification = 'B';
            
            return {
                id: p.id,
                name: p.name,
                revenue,
                percent,
                cumulative,
                classification
            };
        });

        return { items, totalRevenue };
    }, [planData.productPortfolio]);

    const classColors = {
        'A': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', bar: 'bg-green-500' },
        'B': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', bar: 'bg-yellow-500' },
        'C': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', bar: 'bg-red-400' },
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Análise de Portfólio (Curva ABC)</h2>
            <p className="text-sm text-gray-600 mt-2 mb-4">Liste seus principais produtos/serviços de 2025. A classificação ABC é calculada automaticamente.</p>
            
            {/* Tabela de entrada */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600 w-2/5">Produto/Serviço</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-600">Receita 2025 (R$)</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-600">Qtd. Vendida 2025</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {planData.productPortfolio.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={e => updateProductPortfolioItem(item.id, 'name', e.target.value)}
                                        className="w-full bg-transparent p-2 border-0 focus:ring-1 focus:ring-brand-orange rounded-md"
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        value={item.revenue2025 ?? ''} 
                                        onChange={e => updateProductPortfolioItem(item.id, 'revenue2025', e.target.value)}
                                        className="w-full bg-transparent p-2 text-right border-0 focus:ring-1 focus:ring-brand-orange rounded-md"
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="number" 
                                        value={item.quantitySold2025 ?? ''} 
                                        onChange={e => updateProductPortfolioItem(item.id, 'quantitySold2025', e.target.value)}
                                        className="w-full bg-transparent p-2 text-right border-0 focus:ring-1 focus:ring-brand-orange rounded-md"
                                    />
                                </td>
                                <td className="text-center">
                                    <button onClick={() => removeProductPortfolioItem(item.id)} className="text-red-400 hover:text-red-600 font-bold text-lg">&times;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={addProductPortfolioItem} className="mt-4 text-brand-orange font-semibold hover:text-orange-700 text-sm">+ Adicionar Produto/Serviço</button>
            </div>

            {/* Visualização da Curva ABC */}
            {abcAnalysis.items.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-bold text-brand-blue">Resultado da Curva ABC</h3>
                    
                    {/* Legenda */}
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> <strong>Classe A</strong> (até 80% da receita) - Prioridade máxima</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> <strong>Classe B</strong> (80-95%) - Atenção moderada</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded"></span> <strong>Classe C</strong> (95-100%) - Avaliar necessidade</div>
                    </div>

                    {/* Barras visuais */}
                    <div className="space-y-2">
                        {abcAnalysis.items.map(item => {
                            const colors = classColors[item.classification];
                            return (
                                <div key={item.id} className="flex items-center gap-3">
                                    <span className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", colors.bg, colors.text, 'border', colors.border)}>
                                        {item.classification}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="font-medium text-gray-700">{item.name}</span>
                                            <span className="text-gray-500">{formatCurrency(item.revenue, true)} ({formatPercentage(item.percent, 1)})</span>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={clsx("h-full rounded-full transition-all", colors.bar)} style={{ width: `${item.percent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumo */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {(['A', 'B', 'C'] as const).map(cls => {
                            const items = abcAnalysis.items.filter(i => i.classification === cls);
                            const revenue = items.reduce((s, i) => s + i.revenue, 0);
                            const percent = abcAnalysis.totalRevenue > 0 ? (revenue / abcAnalysis.totalRevenue) * 100 : 0;
                            const colors = classColors[cls];
                            return (
                                <div key={cls} className={clsx("p-3 rounded-lg border text-center", colors.bg, colors.border)}>
                                    <p className={clsx("text-2xl font-extrabold", colors.text)}>Classe {cls}</p>
                                    <p className="text-sm text-gray-600 mt-1">{items.length} {items.length === 1 ? 'produto' : 'produtos'}</p>
                                    <p className="text-lg font-bold text-gray-800">{formatPercentage(percent, 0)} da receita</p>
                                    <p className="text-xs text-gray-500">{formatCurrency(revenue, true)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPortfolio;
