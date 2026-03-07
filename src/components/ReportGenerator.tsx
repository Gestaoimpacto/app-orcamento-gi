
import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlanData';
import ReportPreview from './reports/ReportPreview';

const ReportCard: React.FC<{
    title: string;
    description: string;
    onGenerate: () => Promise<void>;
    onView: () => void;
    analysisText?: string;
}> = ({ title, description, onGenerate, onView, analysisText }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            await onGenerate();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-brand-blue">{title}</h3>
                <p className="text-sm text-gray-600 mt-2">{description}</p>
                {analysisText && (
                    <div className="mt-4 p-3 bg-gray-50 border rounded-md text-xs text-gray-700 max-h-24 overflow-y-auto">
                        <p className="font-semibold">Resumo da Análise da IA:</p>
                        <p className="italic">"{analysisText.substring(0, 150)}..."</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-brand-orange rounded-md hover:opacity-80 shadow-sm disabled:bg-gray-400"
                >
                    {isLoading ? 'Gerando Análise...' : (analysisText ? 'Gerar Novamente' : 'Gerar com IA')}
                </button>
                <button
                    onClick={onView}
                    disabled={!analysisText}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-brand-dark bg-gray-200 rounded-md hover:bg-gray-300 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Visualizar Relatório
                </button>
            </div>
        </div>
    );
};


const ReportGenerator: React.FC = () => {
    const { planData, generateDiagnosisReport, generatePlanReport } = usePlan();
    const [viewingReport, setViewingReport] = useState<'diagnosis' | 'plan' | null>(null);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-brand-dark">Relatórios & Impressão</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Gere relatórios profissionais e consolidados do seu planejamento, enriquecidos com análises da IA.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ReportCard
                    title="Relatório de Diagnóstico 2025"
                    description="Consolida todos os dados históricos e análises estratégicas (SWOT, ABC, etc.). A IA gera um parecer profissional sobre a situação atual da empresa."
                    onGenerate={generateDiagnosisReport}
                    onView={() => setViewingReport('diagnosis')}
                    analysisText={planData.analysis.diagnosisReportAnalysis}
                />
                <ReportCard
                    title="Relatório CSO: Plano Estratégico 2026 (Completo)"
                    description="O relatório definitivo. A IA atua como um CSO (Chief Strategy Officer) analisando a coerência entre Metas, Finanças, Pessoas e Mercado, criando uma Tese de Crescimento e Ações de Impacto."
                    onGenerate={generatePlanReport}
                    onView={() => setViewingReport('plan')}
                    analysisText={planData.analysis.planReportAnalysis}
                />
            </div>
            
             {viewingReport && (
                <ReportPreview 
                    reportType={viewingReport} 
                    onClose={() => setViewingReport(null)} 
                />
            )}
        </div>
    );
};

export default ReportGenerator;
