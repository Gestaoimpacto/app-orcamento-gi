
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlan } from '../../hooks/usePlanData';
import ReportSection from './ReportSection';
import DataCollectionReport from './DataCollectionReport';
import StrategicAnalysisReport from './StrategicAnalysisReport';
import FinancialPlanReport from './FinancialPlanReport';

interface ReportPreviewProps {
  reportType: 'diagnosis' | 'plan';
  onClose: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportType, onClose }) => {
    const { planData } = usePlan();
    const isDiagnosis = reportType === 'diagnosis';
    const reportTitle = isDiagnosis ? "Relatório de Diagnóstico 2025" : "Plano Estratégico & Orçamentário 2026";
    const analysisText = isDiagnosis ? planData.analysis.diagnosisReportAnalysis : planData.analysis.planReportAnalysis;
    
    // Add body class for print styling isolation when component mounts
    useEffect(() => {
        document.body.classList.add('printing-report-mode');
        return () => document.body.classList.remove('printing-report-mode');
    }, []);

    // Render content via portal to body to ensure print styles can isolate it easily
    return createPortal(
        <div className="report-preview-container fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center p-4 overflow-y-auto">
             <div className="report-toolbar w-full max-w-4xl bg-white rounded-t-lg p-2 flex justify-between items-center shadow-lg sticky top-0 z-10 no-print">
                <h2 className="text-lg font-bold text-brand-dark">{reportTitle}</h2>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="px-4 py-2 text-sm font-semibold text-white bg-brand-blue rounded-md hover:opacity-80">
                        Imprimir / Salvar PDF
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Fechar
                    </button>
                </div>
            </div>
            <div className="report-portal-content w-full max-w-4xl bg-white p-12 shadow-lg rounded-b-lg">
                <header className="text-center mb-12 border-b-4 border-brand-orange pb-8">
                     <h1 className="text-5xl font-extrabold text-brand-dark tracking-tight">{planData.companyProfile.name || "Sua Empresa"}</h1>
                     <p className="text-2xl text-brand-blue mt-3 font-semibold uppercase tracking-wider">{reportTitle}</p>
                     <p className="text-sm text-gray-500 mt-4">Documento Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </header>
                
                {/* EXECUTIVE SUMMARY (AI ANALYSIS) IS ALWAYS FIRST */}
                <div className="mb-12 bg-gray-50 p-8 rounded-xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-brand-blue mb-4 flex items-center">
                        <span className="mr-2">🚀</span> Executive Summary (CSO Analysis)
                    </h2>
                    <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm report-markdown" dangerouslySetInnerHTML={{ __html: analysisText ? analysisText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-dark">$1</strong>').replace(/### (.*?)\n/g, '<h3 class="text-lg font-bold text-brand-blue mt-4 mb-2">$1</h3>').replace(/#### (.*?)\n/g, '<h4 class="text-md font-bold text-gray-700 mt-3 mb-1">$1</h4>') : '<p class="italic text-gray-500">Nenhuma análise gerada. Por favor, clique em "Gerar com IA" antes de visualizar.</p>' }} />
                </div>

                {isDiagnosis ? (
                    <>
                        <DataCollectionReport />
                        <StrategicAnalysisReport />
                    </>
                ) : (
                    <>
                        {/* PLAN REPORT STRUCTURE: Strategic Context -> Financials */}
                        <div className="break-before-page"></div>
                        <StrategicAnalysisReport />
                        
                        <div className="break-before-page"></div>
                        <FinancialPlanReport />
                        
                        {/* TODO: Add sections for Goals and OKRs explicitly if needed, but FinancialPlan covers the core budget */}
                    </>
                )}
                
                <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                    <p>Gerado por PLAN 2026 - Sistema de Planejamento Estratégico</p>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default ReportPreview;
