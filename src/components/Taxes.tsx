

import React from 'react';
import { usePlan } from '../hooks/usePlanData';
import type { TaxesData } from '../types';

const Taxes: React.FC = () => {
    const { taxes, updateTaxes } = usePlan();

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
                 {/* FIX: Removed undefined 'placeholder' variable from condition */}
                 {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">2. Configuração de Impostos</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Preencha as informações tributárias da sua empresa. O formulário se ajusta com base no regime selecionado.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Section 1: Regime Tributário */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4 md:col-span-2">
                    <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Regime Tributário</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {renderInput('regimeTributario', 'Regime Tributário Atual', 'select')}
                       {taxes.regimeTributario === 'Simples Nacional' && 
                           renderInput('anexoSimples', 'Anexo do Simples', 'text', 'Anexo I, II, III...')
                       }
                    </div>
                </div>

                {/* Section 2: Impostos sobre Faturamento */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                     <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Impostos sobre Faturamento</h2>
                      <div className="space-y-4">
                        {renderInput('aliquotaEfetiva', 'Alíquota Efetiva Total (%)', 'number', 'Soma das alíquotas')}
                        
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
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Encargos sobre Folha</h2>
                        <div className="space-y-4">
                            {renderInput('inssPatronal', 'INSS Patronal (%)', 'number', 'Padrão: 20%')}
                            {renderInput('fgts', 'FGTS (%)', 'number', 'Padrão: 8%')}
                            {renderInput('ratTerceiros', 'RAT + Terceiros (%)', 'number', 'Geralmente 3-6%')}
                            {renderInput('totalEncargosFolha', 'Total Encargos Folha (%)', 'number', '', true)}
                        </div>
                    </div>

                    {/* Section 4: Valores Pagos */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 space-y-4">
                        <h2 className="text-xl font-bold text-brand-blue border-b pb-2">Valores Pagos</h2>
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
