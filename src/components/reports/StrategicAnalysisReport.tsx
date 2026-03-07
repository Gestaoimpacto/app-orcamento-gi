
import React, { useMemo } from 'react';
import { usePlan } from '../../hooks/usePlanData';
import ReportSection from './ReportSection';
import { formatPercentage } from '../../utils/formatters';
import clsx from 'clsx';

const SwotTable: React.FC<{ data: { title: string; content: string; bgColor: string; borderColor: string; }[] }> = ({ data }) => (
    <div className="grid grid-cols-2 gap-4">
        {data.map(item => (
            <div key={item.title} className={`p-4 rounded-lg border ${item.borderColor}`}>
                <h4 className={`font-bold text-lg mb-2 text-gray-800 border-b-2 ${item.borderColor}`}>{item.title}</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {item.content.split('\n').filter(line => line.trim() !== '').map((line, i) => <li key={i}>{line.replace(/^- /, '')}</li>)}
                </ul>
            </div>
        ))}
    </div>
);

const StrategicAnalysisReport: React.FC = () => {
    const { planData } = usePlan();
    const { swot, blueOcean } = planData.marketAnalysis;

    const swotData = [
        { title: 'Forças', content: swot.strengths, bgColor: 'bg-green-50', borderColor: 'border-green-300' },
        { title: 'Fraquezas', content: swot.weaknesses, bgColor: 'bg-red-50', borderColor: 'border-red-300' },
        { title: 'Oportunidades', content: swot.opportunities, bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
        { title: 'Ameaças', content: swot.threats, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
    ];
    
    const analyzedProducts = useMemo(() => {
        const products = planData.productPortfolio;
        const totalRevenue = products.reduce((sum, p) => sum + (p.revenue2025 || 0), 0);
        if (totalRevenue === 0) return [];
        const sortedProducts = [...products].sort((a, b) => (b.revenue2025 || 0) - (a.revenue2025 || 0));
        let cumulative = 0;
        return sortedProducts.map(p => {
            const revenuePercent = ((p.revenue2025 || 0) / totalRevenue) * 100;
            cumulative += revenuePercent;
            const abcClass = cumulative <= 80 ? 'A' : cumulative <= 95 ? 'B' : 'C';
            return { ...p, revenuePercent, abcClass };
        });
    }, [planData.productPortfolio]);
    
    const classStyles = { A: 'bg-green-100 text-green-800', B: 'bg-yellow-100 text-yellow-800', C: 'bg-red-100 text-red-800' };

    return (
        <ReportSection title="Análise Estratégica">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-brand-dark mb-4">Análise SWOT</h3>
                    <SwotTable data={swotData} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-brand-dark mb-4">Análise de Portfólio (Curva ABC)</h3>
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-3 text-left font-semibold text-gray-600">Produto/Serviço</th>
                                <th className="py-2 px-3 text-right font-semibold text-gray-600">% da Receita</th>
                                <th className="py-2 px-3 text-center font-semibold text-gray-600">Classe ABC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                             {analyzedProducts.map(p => (
                                <tr key={p.id}>
                                    <td className="py-2 px-3 font-medium text-gray-800">{p.name}</td>
                                    <td className="py-2 px-3 text-right text-gray-600">{formatPercentage(p.revenuePercent)}</td>
                                    <td className="py-2 px-3 text-center">
                                        <span className={clsx('px-2 inline-flex text-xs leading-5 font-semibold rounded-full', classStyles[p.abcClass])}>
                                            Classe {p.abcClass}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ReportSection>
    );
};

export default StrategicAnalysisReport;
