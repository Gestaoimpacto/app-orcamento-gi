
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { formatNumber, formatPercentage, formatCurrency } from '../utils/formatters';
import CurrencyInput from './shared/CurrencyInput';
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Pontuação Estratégica Consolidada</h2>
            <p className="text-sm text-gray-600 mb-4">
                Este score é calculado automaticamente com base nas análises abaixo (SWOT, Oceano Azul, Mercado, Portfólio e Bowman). 
                Ele impacta diretamente o <strong>Fator Estratégico</strong> na aba de Orçamentos/Cenários.
            </p>
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
                        {isPositive ? "Sua estratégia está acelerando seu crescimento." : "Sua estratégia está atuando como um freio no crescimento."}
                    </p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Composição do score por análise:</p>
                    <ul className="space-y-2 text-sm">
                        {components.map(comp => (
                            <li key={comp.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-100">
                                <span className="font-medium text-gray-700">{comp.name}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className={clsx("h-full rounded-full", comp.score > 0 ? "bg-green-500" : comp.score < 0 ? "bg-red-500" : "bg-gray-400")}
                                            style={{ width: `${Math.min(Math.abs(comp.score) * 10, 100)}%` }}
                                        />
                                    </div>
                                    <span className={clsx(
                                        "font-bold w-20 text-right",
                                        comp.score > 0 ? "text-green-600" : comp.score < 0 ? "text-red-600" : "text-gray-600"
                                    )}>
                                        {comp.score > 0 ? '+' : ''}{formatPercentage(comp.score, 1)}
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

    const impactLabels = ['Baixo', 'Médio', 'Alto'];

    const renderTextarea = (
        name: keyof Pick<SWOTData, 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>,
        impactName: keyof Pick<SWOTData, 'strengthsImpact' | 'weaknessesImpact' | 'opportunitiesImpact' | 'threatsImpact'>,
        title: string,
        subtitle: string,
        bgColor: string,
        borderColor: string,
        placeholder: string
    ) => (
        <div className={`p-4 rounded-lg ${bgColor} flex flex-col`}>
            <h3 className={`font-bold text-lg mb-0.5 text-gray-800 border-b-2 ${borderColor}`}>{title}</h3>
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            <textarea 
                value={swot[name]}
                onChange={(e) => updateSWOTData(name, e.target.value)}
                className="w-full h-40 p-2 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-brand-orange rounded-md resize-y flex-grow"
                placeholder={placeholder}
            />
            <div className="mt-2">
                <label className="text-sm font-semibold text-gray-700">Nível de Impacto no Negócio</label>
                <div className="flex items-center gap-2 mt-1">
                    {[0, 1, 2].map(val => (
                        <button
                            key={val}
                            onClick={() => updateSwotImpact(impactName, val)}
                            className={clsx(
                                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all border",
                                swot[impactName] === val 
                                    ? "bg-brand-orange text-white border-brand-orange shadow" 
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            {impactLabels[val]}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Análise SWOT</h2>
            <p className="text-sm text-gray-600">
                Identifique os fatores internos (Forças e Fraquezas) e externos (Oportunidades e Ameaças) que impactam seu negócio.
                O nível de impacto influencia diretamente o Fator Estratégico.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderTextarea('strengths', 'strengthsImpact', 'Forças', 'Fatores internos positivos - O que sua empresa faz bem?', 'bg-green-50', 'border-green-300', '- Equipe qualificada\n- Marca reconhecida\n- Processos eficientes')}
                {renderTextarea('weaknesses', 'weaknessesImpact', 'Fraquezas', 'Fatores internos negativos - O que precisa melhorar?', 'bg-red-50', 'border-red-300', '- Falta de capital de giro\n- Alta rotatividade\n- Dependência de poucos clientes')}
                {renderTextarea('opportunities', 'opportunitiesImpact', 'Oportunidades', 'Fatores externos positivos - O que o mercado oferece?', 'bg-blue-50', 'border-blue-300', '- Mercado em crescimento\n- Nova tecnologia disponível\n- Mudança regulatória favorável')}
                {renderTextarea('threats', 'threatsImpact', 'Ameaças', 'Fatores externos negativos - O que pode prejudicar?', 'bg-yellow-50', 'border-yellow-300', '- Novos concorrentes\n- Crise econômica\n- Mudança de comportamento do consumidor')}
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

     const renderTextarea = (name: keyof BlueOceanFourActions, title: string, subtitle: string, bgColor: string, borderColor: string, placeholder: string) => (
        <div className={`p-4 rounded-lg ${bgColor}`}>
            <h3 className={`font-bold text-lg mb-0.5 text-gray-800 border-b-2 ${borderColor}`}>{title}</h3>
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
            <textarea 
                value={blueOcean.fourActions[name]}
                onChange={(e) => updateBlueOceanFourActions(name, e.target.value)}
                className="w-full h-32 p-2 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-brand-orange rounded-md resize-none"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Estratégia do Oceano Azul</h2>
            <p className="text-sm text-gray-600">
                Compare os atributos de valor da sua empresa com o principal concorrente. 
                Quanto maior a diferença a seu favor, melhor o impacto no Fator Estratégico.
            </p>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Curva de Valor</h3>
                <p className="text-sm text-gray-600 mb-4">Dê notas de 1 (Baixo) a 5 (Alto) para cada atributo.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Atributo de Valor</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Sua Empresa</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">{marketCompetition.principalConcorrente || 'Concorrente'}</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Diferença</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(blueOcean.factors || []).map(factor => {
                                    const diff = (factor.yourCompanyScore || 0) - (factor.competitorScore || 0);
                                    return (
                                        <tr key={factor.id}>
                                            <td className="px-2 py-1"><input type="text" value={factor.name} onChange={e => updateBlueOceanFactor(factor.id, 'name', e.target.value)} className="w-full p-1 border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1"><CurrencyInput value={factor.yourCompanyScore ?? null} onChange={(v) => updateBlueOceanFactor(factor.id, 'yourCompanyScore', v)} className="w-20 p-1 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1"><CurrencyInput value={factor.competitorScore ?? null} onChange={(v) => updateBlueOceanFactor(factor.id, 'competitorScore', v)} className="w-20 p-1 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className={clsx("px-2 py-1 text-center font-bold text-sm", diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-400")}>
                                                {diff > 0 ? '+' : ''}{diff}
                                            </td>
                                            <td className="px-2 py-1 text-center"><button onClick={() => removeBlueOceanFactor(factor.id)} className="text-red-500 hover:text-red-700">&times;</button></td>
                                        </tr>
                                    );
                                })}
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
                <p className="text-sm text-gray-600 mb-4">Com base na Curva de Valor, defina como você irá se diferenciar no mercado.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextarea('eliminate', 'Eliminar', 'O que o setor oferece que pode ser eliminado?', 'bg-red-50', 'border-red-300', '- Burocracia desnecessária\n- Funcionalidades que ninguém usa')}
                    {renderTextarea('reduce', 'Reduzir', 'O que pode ser reduzido abaixo do padrão do setor?', 'bg-yellow-50', 'border-yellow-300', '- Custos de estrutura\n- Tempo de entrega')}
                    {renderTextarea('raise', 'Elevar', 'O que pode ser elevado acima do padrão do setor?', 'bg-green-50', 'border-green-300', '- Qualidade do atendimento\n- Personalização do serviço')}
                    {renderTextarea('create', 'Criar', 'O que o setor nunca ofereceu e pode ser criado?', 'bg-blue-50', 'border-blue-300', '- Garantia estendida\n- Programa de fidelidade inovador')}
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

    // Calcular posição estratégica média
    const avgPosition = useMemo(() => {
        if (filteredProducts.length === 0) return null;
        const avgPrice = filteredProducts.reduce((s, p) => s + (p.priceLevel || 0), 0) / filteredProducts.length;
        const avgValue = filteredProducts.reduce((s, p) => s + (p.perceivedValue || 0), 0) / filteredProducts.length;
        
        let strategy = '';
        if (avgValue >= 3.5 && avgPrice <= 2.5) strategy = 'Diferenciação (excelente posição)';
        else if (avgValue >= 3.5 && avgPrice >= 3.5) strategy = 'Diferenciação Focada (alto valor, alto preço)';
        else if (avgValue <= 2.5 && avgPrice <= 2.5) strategy = 'Baixo Preço (competição por custo)';
        else if (avgValue <= 2.5 && avgPrice >= 3.5) strategy = 'Destinado ao Fracasso (alto preço, baixo valor)';
        else strategy = 'Posição Híbrida (equilíbrio preço/valor)';
        
        return { avgPrice, avgValue, strategy };
    }, [filteredProducts]);

    const CustomizedLabel = (props: any) => {
        const { x, y, index } = props;
        const productName = filteredProducts[index]?.name || '';
        return <text x={x} y={y} dy={-10} fill="#6b7280" fontSize={12} textAnchor="middle">{productName}</text>;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Relógio Estratégico de Bowman</h2>
            <p className="text-sm text-gray-600">
                Posicione seus produtos/serviços com base no <strong>preço praticado</strong> e no <strong>valor percebido pelo cliente</strong>. 
                O ideal é ter alto valor percebido com preço competitivo (quadrante verde).
                <br/>
                <strong>Impacto no Score:</strong> A relação valor/preço impacta diretamente o Fator Estratégico. Quanto maior o valor em relação ao preço, melhor.
            </p>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Produto/Serviço</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Preço (1-5)</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Valor Percebido (1-5)</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-600">Posição</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bowmanClockProducts.map(p => {
                                    const price = p.priceLevel || 0;
                                    const value = p.perceivedValue || 0;
                                    let posLabel = '-';
                                    let posColor = 'text-gray-400';
                                    if (price > 0 && value > 0) {
                                        if (value > price) { posLabel = 'Bom'; posColor = 'text-green-600'; }
                                        else if (value === price) { posLabel = 'Neutro'; posColor = 'text-yellow-600'; }
                                        else { posLabel = 'Risco'; posColor = 'text-red-600'; }
                                    }
                                    return (
                                        <tr key={p.id}>
                                            <td className="px-2 py-1"><input type="text" value={p.name} onChange={e => updateBowmanClockProduct(p.id, 'name', e.target.value)} className="w-full p-1 border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1"><CurrencyInput value={p.priceLevel ?? null} onChange={(v) => updateBowmanClockProduct(p.id, 'priceLevel', v)} className="w-20 p-1 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1"><CurrencyInput value={p.perceivedValue ?? null} onChange={(v) => updateBowmanClockProduct(p.id, 'perceivedValue', v)} className="w-20 p-1 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className={clsx("px-2 py-1 text-center font-bold text-xs", posColor)}>{posLabel}</td>
                                            <td className="px-2 py-1 text-center"><button onClick={() => removeBowmanClockProduct(p.id)} className="text-red-500 hover:text-red-700">&times;</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <button onClick={addBowmanClockProduct} className="mt-2 text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Produto</button>
                        
                        {/* Resumo da posição estratégica */}
                        {avgPosition && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-bold text-gray-600 uppercase">Posição Estratégica Média</p>
                                <p className="text-sm font-bold text-gray-900 mt-1">{avgPosition.strategy}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Preço médio: {avgPosition.avgPrice.toFixed(1).replace('.', ',')} | Valor médio: {avgPosition.avgValue.toFixed(1).replace('.', ',')}
                                </p>
                            </div>
                        )}
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="priceLevel" name="Preço" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: "Preço Praticado", position: 'insideBottom', offset: -10 }} />
                                <YAxis type="number" dataKey="perceivedValue" name="Valor" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: 'Valor Percebido', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                                {/* Quadrants - corrigidos com nomes claros */}
                                <ReferenceArea x1={0} x2={3} y1={3} y2={6} fill="#28a745" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Diferenciação", position: "inside" }}/>
                                <ReferenceArea x1={3} x2={6} y1={3} y2={6} fill="#007bff" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Diferenciação Focada", position: "inside" }}/>
                                <ReferenceArea x1={0} x2={3} y1={0} y2={3} fill="#ffc107" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Baixo Preço", position: "inside" }}/>
                                <ReferenceArea x1={3} x2={6} y1={0} y2={3} fill="#dc3545" strokeOpacity={0.3} fillOpacity={0.1} label={{ value: "Destinado ao Fracasso", position: "inside" }}/>

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
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
            <h1 className="text-4xl font-bold text-gray-900">3. Análise Estratégica</h1>
            <p className="text-lg text-gray-600 mt-2">
                Analise seu mercado, concorrência e portfólio para encontrar oportunidades de crescimento.
                Cada análise abaixo alimenta automaticamente o <strong>Fator Estratégico</strong> que impacta seus cenários de orçamento.
            </p>
        </header>

        {/* Score consolidado no topo */}
        <StrategicScoreSummary />

        {/* Ordem lógica: Mercado > Portfólio > SWOT > Oceano Azul > Bowman */}
        <MarketAnalysis />
        <ProductPortfolio />
        <SwotAnalysis />
        <BlueOcean />
        <BowmanClock />
    </div>
  );
};
