import React from 'react';
import { usePlan } from '../hooks/usePlanData';

const ProductPortfolio: React.FC = () => {
    const { planData, updateProductPortfolioItem, addProductPortfolioItem, removeProductPortfolioItem } = usePlan();

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Análise de Portfólio (Curva ABC)</h2>
            <p className="text-sm text-gray-600 mt-2 mb-4">Liste seus principais produtos/serviços de 2025. A Curva ABC será calculada automaticamente para identificar os itens mais importantes para sua receita.</p>
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
        </div>
    );
};

export default ProductPortfolio;