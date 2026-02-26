
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatNumber, formatPercentage, formatCurrency } from '../utils/formatters';
import type { MarketCompetitionData, SWOTData, BlueOceanFourActions, BowmanClockProduct, ProductPortfolioItem } from '../types';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ReferenceArea, Label, LabelList } from 'recharts';
import clsx from 'clsx';
import MarketAnalysis from './MarketAnalysis';
import ProductPortfolio from './ProductPortfolio';

// Sub-componente para Pontuação Estratégica
const StrategicScoreSummary: React.FC = () => {
    const { planData } = usePlan();
    const { total, components } = planData.analysis?.strategicScore || { total: 0, components: [] };
    const isPositive = total >= 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2 mb-4">Pontuação Estratégica Consolidada</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className={clsx(
                    "md:col-span-1 p-6 rounded-lg text-center flex flex-col items-center justify-center",
                    isPositive ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                )}>
                    <h3 className={clsx("text-sm font-semibold uppercase", isPositive ? "text-green-800" : "text-red-800")}>
                        Fator Estratégico
                    </h3>
                    <p className={clsx("text-5xl font-extrabold my-2", isPositive ? "text-green-600" : "text-red-600")}>
                        {isPositive ? '+' : ''}{formatPercentage(total, 1)}
                    </p>
                    <p className={clsx("text-xs", isPositive ? "text-green-700" : "text-red-700")}>
                        {isPositive ? "Sua estratégia está acelerando seu crescimento." : "Sua estratégia está atuando como um freio."}
                    </p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Veja como cada análise impacta sua projeção de crescimento:</p>
                    <ul className="space-y-2 text-sm">
                        {components.map(comp => (
                            <li key={comp.name} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border border-gray-100">
                                <span className="font-medium text-gray-700">{comp.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className={clsx(
                                        "font-bold w-32 text-right",
                                        comp.score > 0 ? "text-green-600" : comp.score < 0 ? "text-red-600" : "text-gray-600"
                                    )}>
                                        Impacto: {comp.score > 0 ? '+' : ''}{formatPercentage(comp.score, 1)}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Sub-componente para SWOT
const SwotAnalysis: React.FC = () => {
    const { planData, updateSWOTData, updateSwotImpact } = usePlan();
    const swot = planData.marketAnalysis?.swot;
    
    if (!swot) return null;

    const renderTextarea = (
        name: keyof Pick<SWOTData, 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>,
        impactName: keyof Pick<SWOTData, 'strengthsImpact' | 'weaknessesImpact' | 'opportunitiesImpact' | 'threatsImpact'>,
        title: string,
        bgColor: string,
        borderColor: string
    ) => (
        <div className={`p-4 rounded-lg ${bgColor} flex flex-col`}>
            <h3 className={`font-bold text-lg mb-2 text-gray-800 border-b-2 ${borderColor}`}>{title}</h3>
            <textarea 
                value={swot[name]}
                onChange={(e) => updateSWOTData(name, e.target.value)}
                className="w-full h-40 p-2 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-brand-orange rounded-md resize-y flex-grow"
                placeholder={`Liste os pontos aqui...\n- Ponto 1\n- Ponto 2`}
            />
            <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">Nível de Impacto (0 a 2)</label>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Baixo</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1" 
                        value={swot[impactName]}
                        onChange={e => updateSwotImpact(impactName, e.target.valueAsNumber)}
                        className="w-full"
                    />
                    <span className="text-xs">Alto</span>
                    <span className="font-bold w-6 text-center">{swot[impactName]}</span>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Análise SWOT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTextarea('strengths', 'strengthsImpact', 'Forças (Strengths)', 'bg-green-50', 'border-green-300')}
                {renderTextarea('weaknesses', 'weaknessesImpact', 'Fraquezas (Weaknesses)', 'bg-red-50', 'border-red-300')}
                {renderTextarea('opportunities', 'opportunitiesImpact', 'Oportunidades (Opportunities)', 'bg-blue-50', 'border-blue-300')}
                {renderTextarea('threats', 'threatsImpact', 'Ameaças (Threats)', 'bg-yellow-50', 'border-yellow-300')}
            </div>
        </div>
    );
};

// Sub-componente para Blue Ocean
const BlueOcean: React.FC = () => {
    const { planData, updateBlueOceanFactor, addBlueOceanFactor, removeBlueOceanFactor, updateBlueOceanFourActions } = usePlan();
    const blueOcean = planData.marketAnalysis?.blueOcean;
    const marketCompetition = planData.marketAnalysis?.marketCompetition;

    if (!blueOcean || !marketCompetition) return null;

     const renderTextarea = (name: keyof BlueOceanFourActions, title: string, bgColor: string, borderColor: string) => (
        <div className={`p-4 rounded-lg ${bgColor}`}>
            <h3 className={`font-bold text-lg mb-2 text-gray-800 border-b-2 ${borderColor}`}>{title}</h3>
            <textarea 
                value={blueOcean.fourActions[name]}
                onChange={(e) => updateBlueOceanFourActions(name, e.target.value)}
                className="w-full h-40 p-2 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-brand-orange rounded-md resize-none"
                placeholder={`Liste os pontos aqui...\n- Ponto 1\n- Ponto 2`}
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Estratégia do Oceano Azul</h2>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Curva de Valor</h3>
                <p className="text-sm text-gray-600 mb-4">Compare os atributos da sua oferta com a do seu concorrente. Dê notas de 1 (Baixo) a 5 (Alto).</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Atributo de Valor</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Sua Empresa</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Concorrente</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(blueOcean.factors || []).map(factor => (
                                    <tr key={factor.id}>
                                        <td className="px-2 py-1"><input type="text" value={factor.name} onChange={e => updateBlueOceanFactor(factor.id, 'name', e.target.value)} className="w-full p-1 border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1"><input type="number" min="1" max="5" value={factor.yourCompanyScore ?? ''} onChange={e => updateBlueOceanFactor(factor.id, 'yourCompanyScore', e.target.value)} className="w-20 p-1 text-center border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1"><input type="number" min="1" max="5" value={factor.competitorScore ?? ''} onChange={e => updateBlueOceanFactor(factor.id, 'competitorScore', e.target.value)} className="w-20 p-1 text-center border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1 text-center"><button onClick={() => removeBlueOceanFactor(factor.id)} className="text-red-500 hover:text-red-700">&times;</button></td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                         <button onClick={addBlueOceanFactor} className="mt-2 text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Atributo</button>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={blueOcean.factors}>
                                <PolarGrid /><PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} /><PolarRadiusAxis angle={30} domain={[0, 5]} /><Tooltip /><Legend />
                                <Radar name="Sua Empresa" dataKey="yourCompanyScore" stroke="#EE7533" fill="#EE7533" fillOpacity={0.6} />
                                <Radar name={marketCompetition.principalConcorrente || 'Concorrente'} dataKey="competitorScore" stroke="#213242" fill="#213242" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-gray-800">Matriz das Quatro Ações</h3>
                <p className="text-sm text-gray-600 mb-4">Com base na Curva de Valor, defina como você irá se diferenciar.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextarea('eliminate', 'Eliminar', 'bg-red-50', 'border-red-300')}
                    {renderTextarea('reduce', 'Reduzir', 'bg-yellow-50', 'border-yellow-300')}
                    {renderTextarea('raise', 'Elevar', 'bg-green-50', 'border-green-300')}
                    {renderTextarea('create', 'Criar', 'bg-blue-50', 'border-blue-300')}
                 </div>
            </div>
        </div>
    );
};

// Sub-componente para Bowman's Clock
const BowmanClock: React.FC = () => {
    const { planData, updateBowmanClockProduct, addBowmanClockProduct, removeBowmanClockProduct } = usePlan();
    const bowmanClockProducts = planData.marketAnalysis?.bowmanClockProducts || [];

    const filteredProducts = useMemo(() => 
        bowmanClockProducts.filter(p => p.priceLevel != null && p.perceivedValue != null),
        [bowmanClockProducts]
    );

    const CustomizedLabel = (props: any) => {
        const { x, y, index } = props;
        const productName = filteredProducts[index]?.name || '';
        return <text x={x} y={y} dy={-10} fill="#6b7280" fontSize={12} textAnchor="middle">{productName}</text>;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-6 mt-6">
            <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Relógio Estratégico de Bowman</h2>
            <div>
                <p className="text-sm text-gray-600 mb-4">Posicione seus produtos/serviços com base no preço e valor percebido pelo cliente. Use uma escala de 1 (Baixo) a 5 (Alto).</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Produto/Serviço</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Preço (1-5)</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Valor (1-5)</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bowmanClockProducts.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-2 py-1"><input type="text" value={p.name} onChange={e => updateBowmanClockProduct(p.id, 'name', e.target.value)} className="w-full p-1 border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1"><input type="number" min="1" max="5" value={p.priceLevel ?? ''} onChange={e => updateBowmanClockProduct(p.id, 'priceLevel', e.target.value)} className="w-20 p-1 text-center border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1"><input type="number" min="1" max="5" value={p.perceivedValue ?? ''} onChange={e => updateBowmanClockProduct(p.id, 'perceivedValue', e.target.value)} className="w-20 p-1 text-center border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                        <td className="px-2 py-1 text-center"><button onClick={() => removeBowmanClockProduct(p.id)} className="text-red-500 hover:text-red-700">&times;</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={addBowmanClockProduct} className="mt-2 text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Produto</button>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="priceLevel" name="Preço" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: "Preço", position: 'insideBottom', offset: -10 }} />
                                <YAxis type="number" dataKey="perceivedValue" name="Valor" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: 'Valor Percebido', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                                {/* Quadrants */}
                                <ReferenceArea x1={0} x2={3} y1={3} y2={6} fill="#28a745" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Diferenciação", position: "inside" }}/>
                                <ReferenceArea x1={3} x2={6} y1={3} y2={6} fill="#007bff" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Híbrido", position: "inside" }}/>
                                <ReferenceArea x1={0} x2={3} y1={0} y2={3} fill="#ffc107" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Foco no Preço", position: "inside" }}/>
                                <ReferenceArea x1={3} x2={6} y1={0} y2={3} fill="#dc3545" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Destinadas ao Fracasso", position: "inside" }}/>

                                <Scatter name="Produtos" data={filteredProducts} fill="#EE7533">
                                    <LabelList dataKey="name" content={<CustomizedLabel />} />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StrategicAnalysis: React.FC = () => {
  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-4xl font-bold text-brand-dark">3. Análise Estratégica</h1>
            <p className="text-lg text-gray-600 mt-2">
                Analise seu mercado, concorrência e portfólio para encontrar oportunidades de crescimento.
            </p>
        </header>

        <StrategicScoreSummary />
        <MarketAnalysis />
        <ProductPortfolio />
        <SwotAnalysis />
        <BlueOcean />
        <BowmanClock />
    </div>
  );
};
