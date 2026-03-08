

import React, { useEffect, useRef } from 'react';
import { usePlan } from '../hooks/usePlanData';
import type { TaxesData } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import CurrencyInput from './shared/CurrencyInput';

const Taxes: React.FC = () => {
    const { taxes, updateTaxes, applyTaxesTo2025, summary2025 } = usePlan();
    const prevTaxesRef = useRef<string>('');

    // Calcula a alíquota efetiva atual com base nos campos preenchidos
    const calculatedRate = (() => {
        const { regimeTributario, simplesNacional, iss, icms, pis, cofins, irpj, csll, aliquotaEfetiva } = taxes;
        if (aliquotaEfetiva > 0) return aliquotaEfetiva;
        if (regimeTributario === 'Simples Nacional') return simplesNacional || 0;
        return (iss || 0) + (icms || 0) + (pis || 0) + (cofins || 0) + (irpj || 0) + (csll || 0);
    })();

    // Calcula total de encargos sobre folha automaticamente
    const totalEncargos = (taxes.inssPatronal || 0) + (taxes.fgts || 0) + (taxes.ratTerceiros || 0);

    // Atualiza totalEncargosFolha automaticamente
    useEffect(() => {
        if (taxes.totalEncargosFolha !== totalEncargos) {
            updateTaxes('totalEncargosFolha', totalEncargos.toString());
        }
    }, [taxes.inssPatronal, taxes.fgts, taxes.ratTerceiros]);

    // Aplica impostos automaticamente na Coleta de Dados quando alíquotas mudam
    useEffect(() => {
        const taxKey = JSON.stringify({
            regimeTributario: taxes.regimeTributario,
            aliquotaEfetiva: taxes.aliquotaEfetiva,
            simplesNacional: taxes.simplesNacional,
            iss: taxes.iss, icms: taxes.icms, pis: taxes.pis,
            cofins: taxes.cofins, irpj: taxes.irpj, csll: taxes.csll
        });
        
        if (prevTaxesRef.current && prevTaxesRef.current !== taxKey && calculatedRate > 0) {
            applyTaxesTo2025();
        }
        prevTaxesRef.current = taxKey;
    }, [taxes.regimeTributario, taxes.aliquotaEfetiva, taxes.simplesNacional, 
        taxes.iss, taxes.icms, taxes.pis, taxes.cofins, taxes.irpj, taxes.csll]);

    // Preview do imposto calculado
    const receitaBruta2025 = summary2025?.receitaBrutaTotal || 0;
    const impostoCalculado = receitaBruta2025 * (calculatedRate / 100);

    const handleCurrencyChange = (name: keyof TaxesData, value: string) => {
        updateTaxes(name, value);
    };

    const renderPercentInput = (name: keyof TaxesData, label: string, hint?: string, disabled: boolean = false) => {
        const value = taxes[name] as number ?? null;
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <CurrencyInput
                        value={value}
                        onChange={(v) => handleCurrencyChange(name, v)}
                        className={`block w-full rounded-xl border border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 pr-8 ${disabled ? 'bg-gray-100' : ''}`}
                        placeholder="0"
                        disabled={disabled}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                </div>
                {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    };

    const renderCurrencyField = (name: keyof TaxesData, label: string, hint?: string) => {
        const value = taxes[name] as number ?? null;
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                        <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <CurrencyInput
                        value={value}
                        onChange={(v) => handleCurrencyChange(name, v)}
                        className="block w-full rounded-xl border border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 pl-8"
                        placeholder="0"
                    />
                </div>
                {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
                <h1 className="text-4xl font-bold text-gray-900">2. Configuração de Impostos</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Preencha as informações tributárias da sua empresa. Os impostos são aplicados automaticamente na Coleta de Dados quando você altera as alíquotas.
                </p>
            </header>

            {/* Resumo Visual - Impacto dos Impostos */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-brand-orange space-y-4">
                <h2 className="text-xl font-bold text-brand-orange">Resumo do Impacto Tributário</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Alíquota Efetiva</p>
                        <p className="text-3xl font-extrabold text-brand-orange mt-1">{formatPercentage(calculatedRate)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Receita Bruta 2025</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(receitaBruta2025, true)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Impostos Estimado</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(impostoCalculado, true)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Receita Líquida Estimada</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(receitaBruta2025 - impostoCalculado, true)}</p>
                    </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 mr-2 text-lg">&#10003;</span>
                    <p className="text-sm text-green-800">
                        <strong>Aplicação automática:</strong> Ao alterar as alíquotas acima, os valores de impostos na aba "Coleta de Dados 2025" são recalculados automaticamente com base na sua receita bruta mensal.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Section 1: Regime Tributário */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Regime Tributário</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="regimeTributario" className="block text-sm font-medium text-gray-700">Regime Tributário Atual</label>
                            <select 
                                name="regimeTributario" 
                                id="regimeTributario"
                                value={taxes.regimeTributario || 'Simples Nacional'}
                                onChange={(e) => updateTaxes('regimeTributario', e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-xl"
                            >
                                <option>Simples Nacional</option>
                                <option>Lucro Presumido</option>
                                <option>Lucro Real</option>
                            </select>
                        </div>
                        {taxes.regimeTributario === 'Simples Nacional' && (
                            <div>
                                <label htmlFor="anexoSimples" className="block text-sm font-medium text-gray-700">Anexo do Simples</label>
                                <input
                                    type="text"
                                    name="anexoSimples"
                                    id="anexoSimples"
                                    className="mt-1 block w-full rounded-xl border border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2"
                                    placeholder="Anexo I, II, III..."
                                    value={taxes.anexoSimples || ''}
                                    onChange={(e) => updateTaxes('anexoSimples', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Impostos sobre Faturamento */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Impostos sobre Faturamento</h2>
                    <div className="space-y-4">
                        {renderPercentInput('aliquotaEfetiva', 'Alíquota Efetiva Total (%)', 'Se souber a alíquota total, preencha aqui. Caso contrário, preencha os campos abaixo.')}
                        
                        {taxes.regimeTributario === 'Simples Nacional' &&
                            renderPercentInput('simplesNacional', 'Simples Nacional (%)', 'Alíquota única do Simples')
                        }

                        {taxes.regimeTributario !== 'Simples Nacional' && (
                            <>
                                {renderPercentInput('iss', 'ISS (%)', 'Imposto Sobre Serviço')}
                                {renderPercentInput('icms', 'ICMS (%)', 'Se vende produto')}
                                {renderPercentInput('pis', 'PIS (%)', 'Taxa padrão pré-preenchida')}
                                {renderPercentInput('cofins', 'COFINS (%)', 'Taxa padrão pré-preenchida')}
                                {renderPercentInput('irpj', 'IRPJ (%)', 'Imposto de Renda Pessoa Jurídica')}
                                {renderPercentInput('csll', 'CSLL (%)', 'Contribuição Social sobre o Lucro Líquido')}
                            </>
                        )}
                    </div>
                </div>

                {/* Section 3 & 4 */}
                <div className="space-y-6">
                    {/* Section 3: Encargos sobre Folha */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Encargos sobre Folha</h2>
                        <div className="space-y-4">
                            {renderPercentInput('inssPatronal', 'INSS Patronal (%)', 'Padrão: 20%')}
                            {renderPercentInput('fgts', 'FGTS (%)', 'Padrão: 8%')}
                            {renderPercentInput('ratTerceiros', 'RAT + Terceiros (%)', 'Geralmente 3-6%')}
                            {renderPercentInput('totalEncargosFolha', 'Total Encargos Folha (%)', '', true)}
                        </div>
                    </div>

                    {/* Section 4: Valores Pagos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Valores Pagos</h2>
                        <div className="space-y-4">
                            {renderCurrencyField('totalImpostos2024', 'Total Impostos 2024 (R$)', 'Valor total pago em impostos em 2024')}
                            {renderCurrencyField('totalImpostos2025', 'Total Impostos 2025 (R$)', 'Valor total pago em impostos em 2025')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Taxes;
