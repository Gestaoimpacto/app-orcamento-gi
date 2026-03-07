
import React from 'react';
import { usePlan } from '../hooks/usePlanData';
import { ActionPlanItem, ActionPlanStatus } from '../types';
import clsx from 'clsx';

const ActionPlan: React.FC = () => {
    const { planData, addActionPlanItem, removeActionPlanItem, updateActionPlanItem } = usePlan();

    const statusStyles: { [key in ActionPlanStatus]: string } = {
        'Não Iniciado': 'bg-gray-200 text-gray-800 border-gray-300 focus:ring-gray-400',
        'Em Andamento': 'bg-blue-200 text-blue-800 border-blue-300 focus:ring-blue-400',
        'Concluído': 'bg-green-200 text-green-800 border-green-300 focus:ring-green-400',
        'Atrasado': 'bg-red-200 text-red-800 border-red-300 focus:ring-red-400',
    };

    const renderTextarea = (item: ActionPlanItem, field: 'what' | 'why' | 'how') => (
        <textarea
            value={item[field]}
            onChange={(e) => updateActionPlanItem(item.id, field, e.target.value)}
            className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-orange focus:border-brand-orange min-h-[80px] resize-y"
            rows={3}
        />
    );

    const renderInput = (item: ActionPlanItem, field: 'who' | 'when' | 'where' ) => (
        <input
            type="text"
            value={item[field]}
            onChange={(e) => updateActionPlanItem(item.id, field, e.target.value)}
            className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
        />
    );

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">8. Plano de Ação (5W2H)</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Transforme seus objetivos estratégicos em ações concretas e mensuráveis.
                </p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm align-top border-separate border-spacing-2">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[16%]">O Quê? (What)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[16%]">Por Quê? (Why)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">Quem? (Who)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">Quando? (When)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">Onde? (Where)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[16%]">Como? (How)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[8%]">Quanto? (R$)</th>
                                <th className="p-3 text-left font-semibold text-gray-600 w-[10%]">Status</th>
                                <th className="p-3 text-center font-semibold text-gray-600 w-[4%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {planData.actionPlan.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-0">{renderTextarea(item, 'what')}</td>
                                    <td className="p-0">{renderTextarea(item, 'why')}</td>
                                    <td className="p-0">{renderInput(item, 'who')}</td>
                                    <td className="p-0">{renderInput(item, 'when')}</td>
                                    <td className="p-0">{renderInput(item, 'where')}</td>
                                    <td className="p-0">{renderTextarea(item, 'how')}</td>
                                    <td className="p-0">
                                        <input
                                            type="number"
                                            value={item.howMuch ?? ''}
                                            onChange={(e) => updateActionPlanItem(item.id, 'howMuch', e.target.value)}
                                            className="w-full p-2 bg-white text-gray-900 border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="p-0">
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateActionPlanItem(item.id, 'status', e.target.value)}
                                            className={clsx('w-full p-2 border rounded-md font-semibold text-xs appearance-none text-center focus:ring-2', statusStyles[item.status])}
                                        >
                                            <option>Não Iniciado</option>
                                            <option>Em Andamento</option>
                                            <option>Concluído</option>
                                            <option>Atrasado</option>
                                        </select>
                                    </td>
                                    <td className="p-0 text-center align-middle">
                                        <button onClick={() => removeActionPlanItem(item.id)} className="text-red-400 hover:text-red-600 text-2xl font-bold leading-none">&times;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-6">
                    <button onClick={addActionPlanItem} className="text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Ação</button>
                </div>
                 <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                    <p className="font-bold">O que é a metodologia 5W2H?</p>
                    <p className="text-sm mt-1">
                        É uma ferramenta de gestão que ajuda a detalhar um plano de ação. Cada letra corresponde a uma pergunta em inglês, garantindo que todas as informações essenciais para a execução de uma tarefa sejam definidas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ActionPlan;
