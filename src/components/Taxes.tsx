

import React, { useEffect, useRef } from 'react';
import { usePlan } from '../hooks/usePlanData';
import type { TaxesData } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

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
            // Alíquotas mudaram e são > 0, aplica automaticamente
            applyTaxesTo2025();
        }
        prevTaxesRef.current = taxKey;
    }, [taxes.regimeTributario, taxes.aliquotaEfetiva, taxes.simplesNacional, 
        taxes.iss, taxes.icms, taxes.pis, taxes.cofins, taxes.irpj, taxes.csll]);

    // Preview do imposto calculado
    const receitaBruta2025 = summary2025?.receitaBrutaTotal || 0;
    const impostoCalculado = receitaBruta2025 * (calculatedRate / 100);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateTaxes(name as keyof TaxesData, value);
    };

    const renderInput = (name: keyof TaxesData, label: string, type: 'text' | 'number' | 'select' = 'text', hint?: string, disabled: boolean = false) => {
        const value = taxes[name] ?? '';
        
        return (
            <div>
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                {type === 'select' ? (
                     <select 
                        name={name} 
                        id={name}
                        value={value.toString()}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-md"
                     >
                        <option>Simples Nacional</option>
                        <option>Lucro Presumido</option>
                        <option>Lucro Real</option>
                     </select>
                ) : (
                    <div className="mt-1 relative rounded-md shadow-sm">
                        { type === 'number' && !label.includes('(R$)') && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-gray-500 sm:text-sm">%</span></div>}
                         { type === 'number' && label.includes('(R$)') && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">R$</span></div>}
                        <input
                            type={type}
                            name={name}
                            id={name}
                            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-2 ${label.includes('(R$)') ? 'pl-8' : ''} ${disabled ? 'bg-gray-100' : ''}`}
                            placeholder={hint}
                            value={value}
                            onChange={handleInputChange}
                            step="any"
                            disabled={disabled}
                        />
                    </div>
                )}
                 {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <header>
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
                       {renderInput('regimeTributario', 'Regime Tributário Atual', 'select')}
                       {taxes.regimeTributario === 'Simples Nacional' && 
                           renderInput('anexoSimples', 'Anexo do Simples', 'text', 'Anexo I, II, III...')
                       }
                    </div>
                </div>

                {/* Section 2: Impostos sobre Faturamento */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                     <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Impostos sobre Faturamento</h2>
                      <div className="space-y-4">
                        {renderInput('aliquotaEfetiva', 'Alíquota Efetiva Total (%)', 'number', 'Se souber a alíquota total, preencha aqui. Caso contrário, preencha os campos abaixo.')}
                        
                        {taxes.regimeTributario === 'Simples Nacional' &&
                            renderInput('simplesNacional', 'Simples Nacional (%)', 'number', 'Alíquota única do Simples')
                        }

                        {taxes.regimeTributario !== 'Simples Nacional' && (
                            <>
                                {renderInput('iss', 'ISS (%)', 'number', 'Imposto Sobre Serviço')}
                                {renderInput('icms', 'ICMS (%)', 'number', 'Se vende produto')}
                                {renderInput('pis', 'PIS (%)', 'number', 'Taxa padrão pré-preenchida')}
                                {renderInput('cofins', 'COFINS (%)', 'number', 'Taxa padrão pré-preenchida')}
                                {renderInput('irpj', 'IRPJ (%)', 'number', 'Imposto de Renda Pessoa Jurídica')}
                                {renderInput('csll', 'CSLL (%)', 'number', 'Contribuição Social sobre o Lucro Líquido')}
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
                            {renderInput('inssPatronal', 'INSS Patronal (%)', 'number', 'Padrão: 20%')}
                            {renderInput('fgts', 'FGTS (%)', 'number', 'Padrão: 8%')}
                            {renderInput('ratTerceiros', 'RAT + Terceiros (%)', 'number', 'Geralmente 3-6%')}
                            {renderInput('totalEncargosFolha', 'Total Encargos Folha (%)', 'number', '', true)}
                        </div>
                    </div>

                    {/* Section 4: Valores Pagos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Valores Pagos</h2>
                        <div className="space-y-4">
                            {renderInput('totalImpostos2024', 'Total Impostos 2024 (R$)', 'number', '0.00')}
                            {renderInput('totalImpostos2025', 'Total Impostos 2025 (R$)', 'number', '0.00')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Taxes;
