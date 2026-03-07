
import React, { useState, useEffect } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { CompanyProfile } from '../types';
import { getIndustryFromCnpj } from '../services/geminiService';

const Settings: React.FC = () => {
    const { planData, updateCompanyProfile } = usePlan();
    const [isSearching, setIsSearching] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    
    useEffect(() => {
        // Load Gemini Key
        const storedKey = localStorage.getItem('google_gemini_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('google_gemini_api_key', apiKey.trim());
            setSaveMessage('Chave salva com sucesso! ✅');
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            localStorage.removeItem('google_gemini_api_key');
            setSaveMessage('Chave removida.');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateCompanyProfile(name as keyof CompanyProfile, value);
    };

    const handleCnpjSearch = async () => {
        if (!planData.companyProfile.cnpj) return;
        setIsSearching(true);
        try {
            const industry = await getIndustryFromCnpj(planData.companyProfile.cnpj);
            updateCompanyProfile('industry', industry.trim());
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Não foi possível pesquisar o CNPJ. Verifique sua chave de API e tente novamente.');
        } finally {
            setIsSearching(false);
        }
    };


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-brand-dark">Configurações</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Gerencie os dados da sua empresa e as integrações do sistema.
                </p>
            </header>
            
            {/* GEMINI AI CONFIG SECTION */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
                <h2 className="text-xl font-bold text-brand-blue border-b pb-3">Configuração de IA (Google Gemini)</h2>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                    <p>Para utilizar as análises inteligentes, sugestões de metas e edição de imagens, você precisa de uma <strong>Chave de API do Google</strong>. </p>
                    <p className="mt-2">
                        1. Acesse o <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold underline">Google AI Studio</a>.<br/>
                        2. Clique em "Create API Key".<br/>
                        3. Copie e cole a chave abaixo.
                    </p>
                </div>

                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">Sua Chave de API (Gemini API Key)</label>
                    <div className="mt-1 flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-grow">
                                <input
                                    type={showKey ? "text" : "password"}
                                    name="apiKey"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => { setApiKey(e.target.value); setSaveMessage(''); }}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-3 pr-10 bg-white text-gray-900"
                                    placeholder="Cole sua chave aqui (AIzaSy...)"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showKey ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                                    )}
                                </button>
                            </div>
                            <button
                                onClick={handleSaveKey}
                                className="flex-shrink-0 px-4 py-2 h-11 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm transition-colors"
                            >
                                Salvar Chave
                            </button>
                        </div>
                        {saveMessage && <p className="text-sm font-medium text-green-600 animate-fadeIn">{saveMessage}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6">
                <h2 className="text-xl font-bold text-brand-blue border-b pb-3">Informações da Empresa</h2>
                
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={planData.companyProfile.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-3 bg-white text-gray-900"
                        placeholder="Sua Empresa Ltda."
                    />
                </div>
                
                <div>
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                    <div className="mt-1 flex gap-2 items-center">
                        <input
                            type="text"
                            name="cnpj"
                            id="cnpj"
                            value={planData.companyProfile.cnpj}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-3 bg-white text-gray-900"
                            placeholder="00.000.000/0001-00"
                            disabled={isSearching}
                        />
                         <button
                            onClick={handleCnpjSearch}
                            disabled={isSearching || !planData.companyProfile.cnpj}
                            className="flex-shrink-0 px-4 py-2 h-11 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSearching ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                'Pesquisar'
                            )}
                        </button>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Ramo de Atividade</label>
                    <input
                        type="text"
                        name="industry"
                        id="industry"
                        value={planData.companyProfile.industry}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-orange focus:ring-brand-orange sm:text-sm p-3 bg-white text-gray-900"
                        placeholder="Ex: Tecnologia, Varejo, Serviços Financeiros"
                    />
                     <p className="mt-2 text-xs text-gray-500">
                        Seja específico. Isso ajuda a IA a fornecer insights mais relevantes sobre o seu setor.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
