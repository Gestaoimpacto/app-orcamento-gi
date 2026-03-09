
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

    // Calcular vantagem competitiva
    const factors = blueOcean.factors || [];
    const avgYou = factors.length > 0 ? factors.reduce((s, f) => s + (f.yourCompanyScore || 0), 0) / factors.length : 0;
    const avgComp = factors.length > 0 ? factors.reduce((s, f) => s + (f.competitorScore || 0), 0) / factors.length : 0;
    const gapScore = avgYou - avgComp;
    const factorsWinning = factors.filter(f => (f.yourCompanyScore || 0) > (f.competitorScore || 0)).length;
    const factorsLosing = factors.filter(f => (f.yourCompanyScore || 0) < (f.competitorScore || 0)).length;
    const factorsTied = factors.filter(f => (f.yourCompanyScore || 0) === (f.competitorScore || 0)).length;

    const renderTextarea = (name: keyof BlueOceanFourActions, title: string, subtitle: string, bgColor: string, borderColor: string, iconColor: string, icon: string, placeholder: string) => (
        <div className={`p-5 rounded-xl ${bgColor} border ${borderColor}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-2xl`}>{icon}</span>
                <div>
                    <h3 className="font-bold text-base text-gray-800">{title}</h3>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
            </div>
            <textarea 
                value={blueOcean.fourActions[name]}
                onChange={(e) => updateBlueOceanFourActions(name, e.target.value)}
                className="w-full h-28 p-3 bg-white text-gray-900 border border-gray-200 focus:ring-2 focus:ring-brand-orange rounded-lg resize-none text-sm"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8 mt-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">&#127754;</span>
                    Estratégia do Oceano Azul
                </h2>
                <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium">O que é esta ferramenta?</p>
                    <p className="text-sm text-blue-800 mt-1">
                        A Estratégia do Oceano Azul, criada por W. Chan Kim e Renée Mauborgne, ajuda a empresa a <strong>sair da competição direta</strong> (oceano vermelho) e <strong>criar um novo espaço de mercado</strong> (oceano azul). Em vez de competir nos mesmos atributos que o concorrente, você redefine as regras do jogo.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-red-100 p-3 rounded-lg border border-red-200">
                            <p className="text-xs font-bold text-red-800">Oceano Vermelho</p>
                            <p className="text-xs text-red-700 mt-1">Competir no mercado existente, brigar por fatia de mercado, guerra de preços, margens cada vez menores.</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs font-bold text-blue-800">Oceano Azul</p>
                            <p className="text-xs text-blue-700 mt-1">Criar demanda nova, tornar a concorrência irrelevante, inovar em valor, crescer com margens saudáveis.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CURVA DE VALOR */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Curva de Valor</h3>
                <p className="text-sm text-gray-600">Compare os atributos de valor da sua empresa com o principal concorrente. Notas de <strong>1</strong> (Baixo) a <strong>5</strong> (Alto).</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Atributo de Valor</th>
                                        <th className="px-3 py-2.5 text-center font-semibold text-orange-600">Você</th>
                                        <th className="px-3 py-2.5 text-center font-semibold text-gray-600">{marketCompetition.principalConcorrente || 'Concorrente'}</th>
                                        <th className="px-3 py-2.5 text-center font-semibold text-gray-600">Gap</th>
                                        <th className="w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {factors.map(factor => {
                                        const diff = (factor.yourCompanyScore || 0) - (factor.competitorScore || 0);
                                        return (
                                            <tr key={factor.id} className="hover:bg-gray-50">
                                                <td className="px-2 py-1.5"><input type="text" value={factor.name} onChange={e => updateBlueOceanFactor(factor.id, 'name', e.target.value)} className="w-full p-1.5 border-gray-300 rounded-md bg-white text-gray-900 text-sm" /></td>
                                                <td className="px-2 py-1.5"><CurrencyInput value={factor.yourCompanyScore ?? null} onChange={(v) => updateBlueOceanFactor(factor.id, 'yourCompanyScore', v)} className="w-16 p-1.5 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                                <td className="px-2 py-1.5"><CurrencyInput value={factor.competitorScore ?? null} onChange={(v) => updateBlueOceanFactor(factor.id, 'competitorScore', v)} className="w-16 p-1.5 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                                <td className="px-2 py-1.5 text-center">
                                                    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", diff > 0 ? "bg-green-100 text-green-700" : diff < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500")}>
                                                        {diff > 0 ? '+' : ''}{diff}
                                                    </span>
                                                </td>
                                                <td className="px-1 py-1.5 text-center"><button onClick={() => removeBlueOceanFactor(factor.id)} className="text-red-400 hover:text-red-600 text-lg">&times;</button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={addBlueOceanFactor} className="mt-3 text-sm text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Atributo</button>
                        
                        {/* Resumo da Curva de Valor */}
                        {factors.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                                    <p className="text-2xl font-extrabold text-green-600">{factorsWinning}</p>
                                    <p className="text-xs text-green-700 font-medium">Você ganha</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                                    <p className="text-2xl font-extrabold text-gray-500">{factorsTied}</p>
                                    <p className="text-xs text-gray-600 font-medium">Empate</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                                    <p className="text-2xl font-extrabold text-red-600">{factorsLosing}</p>
                                    <p className="text-xs text-red-700 font-medium">Concorrente ganha</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer>
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={factors}>
                                    <PolarGrid gridType="polygon" />
                                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Radar name="Sua Empresa" dataKey="yourCompanyScore" stroke="#EE7533" fill="#EE7533" fillOpacity={0.4} strokeWidth={2} />
                                    <Radar name={marketCompetition.principalConcorrente || 'Concorrente'} dataKey="competitorScore" stroke="#213242" fill="#213242" fillOpacity={0.2} strokeWidth={2} strokeDasharray="5 5" />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        {factors.length > 0 && (
                            <div className={clsx("p-4 rounded-xl border text-center mt-2", gapScore > 0 ? "bg-green-50 border-green-200" : gapScore < 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200")}>
                                <p className="text-xs font-bold text-gray-600 uppercase">Vantagem Competitiva Média</p>
                                <p className={clsx("text-3xl font-extrabold mt-1", gapScore > 0 ? "text-green-600" : gapScore < 0 ? "text-red-600" : "text-gray-500")}>
                                    {gapScore > 0 ? '+' : ''}{gapScore.toFixed(1).replace('.', ',')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {gapScore > 0.5 ? 'Sua empresa tem vantagem competitiva clara. Explore o Oceano Azul!' : gapScore < -0.5 ? 'Concorrente está à frente. Use as 4 Ações para reposicionar.' : 'Posição equilibrada. Hora de diferenciar com inovação de valor.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MATRIZ DAS 4 AÇÕES */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Matriz das Quatro Ações</h3>
                <p className="text-sm text-gray-600">Com base na Curva de Valor, defina como você irá se diferenciar e criar seu Oceano Azul. Cada ação redefine a proposta de valor.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderTextarea('eliminate', 'Eliminar', 'O que o setor oferece que pode ser eliminado?', 'bg-red-50', 'border-red-200', 'text-red-600', '\u2716', '- Burocracia desnecessária\n- Funcionalidades que ninguém usa\n- Intermediários que não agregam valor')}
                    {renderTextarea('reduce', 'Reduzir', 'O que pode ser reduzido abaixo do padrão do setor?', 'bg-yellow-50', 'border-yellow-200', 'text-yellow-600', '\u25BC', '- Custos de estrutura\n- Tempo de entrega\n- Complexidade do produto')}
                    {renderTextarea('raise', 'Elevar', 'O que pode ser elevado acima do padrão do setor?', 'bg-green-50', 'border-green-200', 'text-green-600', '\u25B2', '- Qualidade do atendimento\n- Personalização do serviço\n- Velocidade de resposta')}
                    {renderTextarea('create', 'Criar', 'O que o setor nunca ofereceu e pode ser criado?', 'bg-blue-50', 'border-blue-200', 'text-blue-600', '\u2728', '- Garantia estendida\n- Programa de fidelidade inovador\n- Experiência digital única')}
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
        bowmanClockProducts.filter(p => p.priceLevel != null && p.perceivedValue != null && (p.priceLevel > 0 || p.perceivedValue > 0)),
        [bowmanClockProducts]
    );

    // Calcular posição estratégica de cada produto
    const getStrategyInfo = (price: number, value: number): { name: string; color: string; bgColor: string; description: string; position: number } => {
        if (price <= 0 || value <= 0) return { name: '-', color: 'text-gray-400', bgColor: 'bg-gray-100', description: '', position: 0 };
        const ratio = value / price;
        if (value >= 4 && price <= 2) return { name: '1. Baixo Preço / Alto Valor', color: 'text-green-700', bgColor: 'bg-green-100', description: 'Posição ideal. Entrega muito valor por um preço acessível. Difícil de sustentar sem escala.', position: 1 };
        if (value >= 3.5 && price <= 3) return { name: '2. Diferenciação', color: 'text-emerald-700', bgColor: 'bg-emerald-100', description: 'Boa posição. Alto valor percebido com preço justo. Foco em qualidade e experiência.', position: 2 };
        if (value >= 3.5 && price >= 3.5) return { name: '3. Diferenciação Focada', color: 'text-blue-700', bgColor: 'bg-blue-100', description: 'Premium. Alto valor e alto preço. Funciona em nichos e marcas fortes.', position: 3 };
        if (value <= 2 && price <= 2) return { name: '4. Baixo Preço', color: 'text-yellow-700', bgColor: 'bg-yellow-100', description: 'Competição por custo. Margens apertadas. Precisa de volume alto para lucrar.', position: 4 };
        if (value <= 2.5 && price >= 3) return { name: '5. Destinado ao Fracasso', color: 'text-red-700', bgColor: 'bg-red-100', description: 'Perigo! Preço alto sem entregar valor. Clientes vão migrar para concorrentes.', position: 5 };
        if (ratio >= 1.2) return { name: '6. Híbrido Positivo', color: 'text-teal-700', bgColor: 'bg-teal-100', description: 'Bom equilíbrio. Valor ligeiramente acima do preço. Posição sustentável.', position: 6 };
        if (ratio <= 0.8) return { name: '7. Híbrido Negativo', color: 'text-orange-700', bgColor: 'bg-orange-100', description: 'Atenção. Preço acima do valor percebido. Risco de perder clientes.', position: 7 };
        return { name: '8. Posição Neutra', color: 'text-gray-700', bgColor: 'bg-gray-100', description: 'Preço e valor equilibrados. Sem diferenciação clara. Vulnerável a concorrentes.', position: 8 };
    };

    // Calcular posição estratégica média
    const avgPosition = useMemo(() => {
        if (filteredProducts.length === 0) return null;
        const avgPrice = filteredProducts.reduce((s, p) => s + (p.priceLevel || 0), 0) / filteredProducts.length;
        const avgValue = filteredProducts.reduce((s, p) => s + (p.perceivedValue || 0), 0) / filteredProducts.length;
        const info = getStrategyInfo(avgPrice, avgValue);
        return { avgPrice, avgValue, strategy: info.name, description: info.description, color: info.color, bgColor: info.bgColor };
    }, [filteredProducts]);

    const CustomizedLabel = (props: any) => {
        const { x, y, index } = props;
        const productName = filteredProducts[index]?.name || '';
        return <text x={x} y={y} dy={-12} fill="#374151" fontSize={11} fontWeight="600" textAnchor="middle">{productName}</text>;
    };

    // 8 posições do Bowman Clock
    const bowmanPositions = [
        { pos: 1, name: 'Baixo Preço / Alto Valor', desc: 'Preço baixo + valor alto. Ideal mas difícil de manter.', color: 'bg-green-500' },
        { pos: 2, name: 'Diferenciação', desc: 'Alto valor com preço justo. Foco em qualidade.', color: 'bg-emerald-500' },
        { pos: 3, name: 'Diferenciação Focada', desc: 'Premium: alto valor, alto preço. Nicho.', color: 'bg-blue-500' },
        { pos: 4, name: 'Baixo Preço', desc: 'Competição por custo. Precisa de volume.', color: 'bg-yellow-500' },
        { pos: 5, name: 'Destinado ao Fracasso', desc: 'Preço alto sem valor. Clientes migram.', color: 'bg-red-500' },
        { pos: 6, name: 'Híbrido Positivo', desc: 'Valor > preço. Posição sustentável.', color: 'bg-teal-500' },
        { pos: 7, name: 'Híbrido Negativo', desc: 'Preço > valor. Risco de perda.', color: 'bg-orange-500' },
        { pos: 8, name: 'Posição Neutra', desc: 'Sem diferenciação. Vulnerável.', color: 'bg-gray-500' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8 mt-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-lg">&#128337;</span>
                    Relógio Estratégico de Bowman
                </h2>
                <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <p className="text-sm text-indigo-900 font-medium">O que é esta ferramenta?</p>
                    <p className="text-sm text-indigo-800 mt-1">
                        O Relógio Estratégico de Bowman mapeia <strong>8 posições competitivas</strong> com base na relação entre <strong>preço praticado</strong> e <strong>valor percebido pelo cliente</strong>. Diferente do Oceano Azul (que foca em criar novos mercados), o Bowman analisa <strong>onde você está posicionado dentro do mercado existente</strong>.
                    </p>
                </div>
            </div>

            {/* 8 POSIÇÕES DO RELÓGIO */}
            <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3">As 8 Posições Estratégicas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {bowmanPositions.map(bp => (
                        <div key={bp.pos} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-6 h-6 ${bp.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{bp.pos}</span>
                                <p className="text-xs font-bold text-gray-800">{bp.name}</p>
                            </div>
                            <p className="text-xs text-gray-500">{bp.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* TABELA + GRÁFICO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Seus Produtos / Serviços</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2.5 text-left font-semibold text-gray-700">Produto/Serviço</th>
                                    <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Preço (1-5)</th>
                                    <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Valor (1-5)</th>
                                    <th className="px-3 py-2.5 text-center font-semibold text-gray-700">Posição</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {bowmanClockProducts.map(p => {
                                    const price = p.priceLevel || 0;
                                    const value = p.perceivedValue || 0;
                                    const info = getStrategyInfo(price, value);
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5"><input type="text" value={p.name} onChange={e => updateBowmanClockProduct(p.id, 'name', e.target.value)} className="w-full p-1.5 border-gray-300 rounded-md bg-white text-gray-900 text-sm" /></td>
                                            <td className="px-2 py-1.5"><CurrencyInput value={p.priceLevel ?? null} onChange={(v) => updateBowmanClockProduct(p.id, 'priceLevel', v)} className="w-16 p-1.5 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1.5"><CurrencyInput value={p.perceivedValue ?? null} onChange={(v) => updateBowmanClockProduct(p.id, 'perceivedValue', v)} className="w-16 p-1.5 text-center border border-gray-300 rounded-md bg-white text-gray-900" /></td>
                                            <td className="px-2 py-1.5">
                                                <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", info.bgColor, info.color)}>
                                                    {info.name.split('.')[0]}.
                                                </span>
                                            </td>
                                            <td className="px-1 py-1.5 text-center"><button onClick={() => removeBowmanClockProduct(p.id)} className="text-red-400 hover:text-red-600 text-lg">&times;</button></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={addBowmanClockProduct} className="mt-3 text-sm text-brand-orange font-semibold hover:text-orange-700">+ Adicionar Produto</button>
                    
                    {/* Resumo da posição estratégica */}
                    {avgPosition && (
                        <div className={clsx("mt-4 p-4 rounded-xl border", avgPosition.bgColor, avgPosition.color.replace('text-', 'border-'))}>
                            <p className="text-xs font-bold uppercase">Posição Estratégica Média do Portfólio</p>
                            <p className="text-base font-bold mt-1">{avgPosition.strategy}</p>
                            <p className="text-xs mt-1 opacity-80">{avgPosition.description}</p>
                            <p className="text-xs mt-2 opacity-70">
                                Preço médio: {avgPosition.avgPrice.toFixed(1).replace('.', ',')} | Valor médio: {avgPosition.avgValue.toFixed(1).replace('.', ',')}
                            </p>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Mapa de Posicionamento</h3>
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="priceLevel" name="Preço" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: "Preço Praticado \u2192", position: 'insideBottom', offset: -15, style: { fontWeight: 600, fontSize: 12 } }} />
                                <YAxis type="number" dataKey="perceivedValue" name="Valor" domain={[0, 6]} ticks={[1,2,3,4,5]} label={{ value: 'Valor Percebido \u2192', angle: -90, position: 'insideLeft', offset: -15, style: { fontWeight: 600, fontSize: 12 } }}/>
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: number, name: string) => [value.toFixed(1).replace('.', ','), name === 'priceLevel' ? 'Preço' : 'Valor']} />

                                {/* Quadrantes com labels mais claros */}
                                <ReferenceArea x1={0} x2={3} y1={3} y2={6} fill="#22c55e" strokeOpacity={0.3} fillOpacity={0.08} label={{ value: "Diferenciação\n(Ideal)", position: "center", style: { fontSize: 11, fill: '#166534', fontWeight: 600 } }}/>
                                <ReferenceArea x1={3} x2={6} y1={3} y2={6} fill="#3b82f6" strokeOpacity={0.3} fillOpacity={0.08} label={{ value: "Premium\n(Nicho)", position: "center", style: { fontSize: 11, fill: '#1e40af', fontWeight: 600 } }}/>
                                <ReferenceArea x1={0} x2={3} y1={0} y2={3} fill="#eab308" strokeOpacity={0.3} fillOpacity={0.08} label={{ value: "Baixo Custo\n(Volume)", position: "center", style: { fontSize: 11, fill: '#854d0e', fontWeight: 600 } }}/>
                                <ReferenceArea x1={3} x2={6} y1={0} y2={3} fill="#ef4444" strokeOpacity={0.3} fillOpacity={0.08} label={{ value: "Fracasso\n(Evitar)", position: "center", style: { fontSize: 11, fill: '#991b1b', fontWeight: 600 } }}/>

                                {/* Linha de equilíbrio */}
                                <ReferenceArea x1={0} x2={6} y1={0} y2={0} />

                                <Scatter name="Produtos" data={filteredProducts} fill="#EE7533" r={8}>
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

// Comparação entre Oceano Azul e Bowman
const ToolComparison: React.FC = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-lg">&#9878;</span>
                Oceano Azul vs Bowman: Quando Usar Cada Ferramenta
            </h2>
            <p className="text-sm text-gray-600">
                As duas ferramentas se complementam. Use a tabela abaixo para entender como cada uma contribui para sua estratégia.
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left font-bold text-gray-700 bg-gray-50 rounded-tl-lg">Critério de Análise</th>
                            <th className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50">Oceano Azul</th>
                            <th className="px-4 py-3 text-center font-bold text-indigo-700 bg-indigo-50 rounded-tr-lg">Relógio de Bowman</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-4 py-3 font-medium text-gray-700">Objetivo Principal</td><td className="px-4 py-3 text-center text-gray-600">Criar novo espaço de mercado</td><td className="px-4 py-3 text-center text-gray-600">Mapear posição no mercado atual</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">Pergunta que Responde</td><td className="px-4 py-3 text-center text-gray-600">"Como me diferenciar?"</td><td className="px-4 py-3 text-center text-gray-600">"Onde estou posicionado?"</td></tr>
                        <tr><td className="px-4 py-3 font-medium text-gray-700">Foco</td><td className="px-4 py-3 text-center text-gray-600">Inovação de valor e atributos</td><td className="px-4 py-3 text-center text-gray-600">Relação preço vs valor percebido</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">Visão</td><td className="px-4 py-3 text-center text-gray-600">Futuro (para onde ir)</td><td className="px-4 py-3 text-center text-gray-600">Presente (onde estou)</td></tr>
                        <tr><td className="px-4 py-3 font-medium text-gray-700">Concorrência</td><td className="px-4 py-3 text-center text-gray-600">Tornar irrelevante</td><td className="px-4 py-3 text-center text-gray-600">Entender posição relativa</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">Ferramenta Chave</td><td className="px-4 py-3 text-center text-gray-600">Curva de Valor + 4 Ações</td><td className="px-4 py-3 text-center text-gray-600">Mapa de Posicionamento (8 posições)</td></tr>
                        <tr><td className="px-4 py-3 font-medium text-gray-700">Quando Usar</td><td className="px-4 py-3 text-center text-gray-600">Mercado saturado, guerra de preços</td><td className="px-4 py-3 text-center text-gray-600">Definir estratégia de precificação</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">Resultado Esperado</td><td className="px-4 py-3 text-center text-gray-600">Novo mercado sem concorrência</td><td className="px-4 py-3 text-center text-gray-600">Clareza sobre reposicionamento</td></tr>
                        <tr><td className="px-4 py-3 font-medium text-gray-700">Impacto na Precificação</td><td className="px-4 py-3 text-center text-gray-600">Justifica preço premium por inovação</td><td className="px-4 py-3 text-center text-gray-600">Mostra se o preço está coerente com o valor</td></tr>
                        <tr className="bg-gray-50"><td className="px-4 py-3 font-medium text-gray-700">Melhor Para</td><td className="px-4 py-3 text-center text-gray-600">Empresas que querem inovar</td><td className="px-4 py-3 text-center text-gray-600">Empresas que querem otimizar</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                <p className="text-sm font-bold text-gray-800">Como usar as duas juntas:</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-700 uppercase">Passo 1: Diagnóstico</p>
                        <p className="text-xs text-gray-600 mt-1">Use o <strong>Bowman</strong> para mapear onde cada produto está posicionado hoje (preço vs valor).</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-700 uppercase">Passo 2: Estratégia</p>
                        <p className="text-xs text-gray-600 mt-1">Use o <strong>Oceano Azul</strong> para identificar como se diferenciar (Curva de Valor + 4 Ações).</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-xs font-bold text-gray-700 uppercase">Passo 3: Validação</p>
                        <p className="text-xs text-gray-600 mt-1">Volte ao <strong>Bowman</strong> para verificar se o reposicionamento moveu seus produtos para quadrantes melhores.</p>
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
        <ToolComparison />
    </div>
  );
};
