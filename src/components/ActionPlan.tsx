
import React, { useState, useMemo } from 'react';
import { usePlan } from '../hooks/usePlanData';
import { ActionPlanItem, ActionPlanStatus, ActionPlanCategory, ActionPlanPriority } from '../types';
import { formatCurrency } from '../utils/formatters';
import CurrencyInput from './shared/CurrencyInput';
import clsx from 'clsx';

// --- CONSTANTS ---
const CATEGORIES: ActionPlanCategory[] = ['Comercial', 'Financeiro', 'Pessoas', 'Operacional', 'Marketing', 'Estratégico'];
const PRIORITIES: ActionPlanPriority[] = ['Alta', 'Média', 'Baixa'];
const STATUSES: ActionPlanStatus[] = ['Não Iniciado', 'Em Andamento', 'Concluído', 'Atrasado'];

const categoryConfig: Record<ActionPlanCategory, { color: string; bg: string; border: string; icon: string }> = {
    'Comercial': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: '📊' },
    'Financeiro': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '💰' },
    'Pessoas': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: '👥' },
    'Operacional': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚙️' },
    'Marketing': { color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200', icon: '📢' },
    'Estratégico': { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: '🎯' },
};

const priorityConfig: Record<ActionPlanPriority, { color: string; bg: string; border: string; label: string }> = {
    'Alta': { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', label: '🔴 Alta' },
    'Média': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', label: '🟡 Média' },
    'Baixa': { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', label: '🟢 Baixa' },
};

const statusConfig: Record<ActionPlanStatus, { color: string; bg: string; border: string }> = {
    'Não Iniciado': { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' },
    'Em Andamento': { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
    'Concluído': { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' },
    'Atrasado': { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' },
};

type ViewMode = 'board' | 'list';
type FilterCategory = ActionPlanCategory | 'Todas';
type FilterPriority = ActionPlanPriority | 'Todas';

// --- ACTION CARD COMPONENT ---
const ActionCard: React.FC<{
    item: ActionPlanItem;
    updateItem: (id: string, field: keyof Omit<ActionPlanItem, 'id'>, value: string) => void;
    removeItem: (id: string) => void;
    isExpanded: boolean;
    toggleExpand: () => void;
}> = ({ item, updateItem, removeItem, isExpanded, toggleExpand }) => {
    const cat = categoryConfig[item.category] || categoryConfig['Estratégico'];
    const pri = priorityConfig[item.priority] || priorityConfig['Média'];
    const sta = statusConfig[item.status] || statusConfig['Não Iniciado'];

    return (
        <div className={clsx(
            "bg-white rounded-2xl shadow-sm border-l-4 transition-all duration-200 hover:shadow-md",
            item.priority === 'Alta' ? 'border-l-red-500' : item.priority === 'Média' ? 'border-l-amber-400' : 'border-l-green-400'
        )}>
            {/* Card Header - Always Visible */}
            <div className="p-4 cursor-pointer" onClick={toggleExpand}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full border", cat.bg, cat.color, cat.border)}>
                                {cat.icon} {item.category}
                            </span>
                            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full border", pri.bg, pri.color, pri.border)}>
                                {pri.label}
                            </span>
                            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full border", sta.bg, sta.color, sta.border)}>
                                {item.status}
                            </span>
                        </div>
                        {/* Title */}
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {item.what || <span className="text-gray-400 italic">Clique para definir a ação...</span>}
                        </h4>
                        {/* Expected Result */}
                        {item.expectedResult && (
                            <div className="mt-1.5 flex items-start gap-1.5">
                                <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs text-green-700 font-medium">{item.expectedResult}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {item.who && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:inline">{item.who}</span>
                        )}
                        {item.when && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:inline">{item.when}</span>
                        )}
                        <svg className={clsx("h-5 w-5 text-gray-400 transition-transform", isExpanded && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50 rounded-b-2xl">
                    {/* Row 1: Category + Priority + Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                            <select value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                                className={clsx("w-full p-2 border rounded-xl text-sm font-semibold", cat.bg, cat.color, cat.border)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{categoryConfig[c].icon} {c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridade</label>
                            <select value={item.priority} onChange={(e) => updateItem(item.id, 'priority', e.target.value)}
                                className={clsx("w-full p-2 border rounded-xl text-sm font-semibold", pri.bg, pri.color, pri.border)}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                            <select value={item.status} onChange={(e) => updateItem(item.id, 'status', e.target.value)}
                                className={clsx("w-full p-2 border rounded-xl text-sm font-semibold", sta.bg, sta.color, sta.border)}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: What + Why */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">O Que? (What)</label>
                            <textarea value={item.what} onChange={(e) => updateItem(item.id, 'what', e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-sm resize-y min-h-[70px]"
                                placeholder="Descreva a ação a ser executada..." rows={2} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Por Que? (Why)</label>
                            <textarea value={item.why} onChange={(e) => updateItem(item.id, 'why', e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-sm resize-y min-h-[70px]"
                                placeholder="Qual o motivo e impacto desta ação?" rows={2} />
                        </div>
                    </div>

                    {/* Row 3: How + Expected Result */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Como? (How)</label>
                            <textarea value={item.how} onChange={(e) => updateItem(item.id, 'how', e.target.value)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-sm resize-y min-h-[70px]"
                                placeholder="Passo a passo de como executar..." rows={2} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-green-600 uppercase mb-1">Resultado Esperado</label>
                            <textarea value={item.expectedResult} onChange={(e) => updateItem(item.id, 'expectedResult', e.target.value)}
                                className="w-full p-3 bg-green-50 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm resize-y min-h-[70px]"
                                placeholder="Ex: Aumentar conversao de 2% para 5% em 3 meses..." rows={2} />
                        </div>
                    </div>

                    {/* Row 4: Who + When + Where + How Much */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quem? (Who)</label>
                            <input type="text" value={item.who} onChange={(e) => updateItem(item.id, 'who', e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange text-sm"
                                placeholder="Responsável" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quando? (When)</label>
                            <input type="text" value={item.when} onChange={(e) => updateItem(item.id, 'when', e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange text-sm"
                                placeholder="Prazo" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Onde? (Where)</label>
                            <input type="text" value={item.where} onChange={(e) => updateItem(item.id, 'where', e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange text-sm"
                                placeholder="Local/Área" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quanto? (R$)</label>
                            <CurrencyInput
                                value={item.howMuch ?? null}
                                onChange={(v) => updateItem(item.id, 'howMuch', v)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange text-sm"
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex justify-end pt-2">
                        <button onClick={() => removeItem(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Remover Ação
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const ActionPlan: React.FC = () => {
    const { planData, addActionPlanItem, removeActionPlanItem, updateActionPlanItem } = usePlan();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('Todas');
    const [filterPriority, setFilterPriority] = useState<FilterPriority>('Todas');
    const [filterStatus, setFilterStatus] = useState<ActionPlanStatus | 'Todas'>('Todas');
    const [viewMode, setViewMode] = useState<ViewMode>('board');

    // Ensure backward compatibility - items without new fields
    const items: ActionPlanItem[] = planData.actionPlan.map(item => ({
        ...item,
        category: item.category || 'Estratégico' as ActionPlanCategory,
        priority: item.priority || 'Média' as ActionPlanPriority,
        expectedResult: item.expectedResult || '',
    }));

    // Filtered items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (filterCategory !== 'Todas' && item.category !== filterCategory) return false;
            if (filterPriority !== 'Todas' && item.priority !== filterPriority) return false;
            if (filterStatus !== 'Todas' && item.status !== filterStatus) return false;
            return true;
        });
    }, [items, filterCategory, filterPriority, filterStatus]);

    // Sorted by priority
    const sortedItems = useMemo(() => {
        const priorityOrder: Record<ActionPlanPriority, number> = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
        return [...filteredItems].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }, [filteredItems]);

    // Stats
    const stats = useMemo(() => {
        const total = items.length;
        const concluidas = items.filter(i => i.status === 'Concluído').length;
        const emAndamento = items.filter(i => i.status === 'Em Andamento').length;
        const atrasadas = items.filter(i => i.status === 'Atrasado').length;
        const naoIniciadas = items.filter(i => i.status === 'Não Iniciado').length;
        const alta = items.filter(i => i.priority === 'Alta').length;
        const investimentoTotal = items.reduce((sum, i) => sum + (i.howMuch || 0), 0);
        const progressPercent = total > 0 ? (concluidas / total) * 100 : 0;
        return { total, concluidas, emAndamento, atrasadas, naoIniciadas, alta, investimentoTotal, progressPercent };
    }, [items]);

    // Group by category for board view
    const groupedByCategory = useMemo(() => {
        const groups: Record<string, ActionPlanItem[]> = {};
        CATEGORIES.forEach(cat => {
            const catItems = sortedItems.filter(i => i.category === cat);
            if (catItems.length > 0) groups[cat] = catItems;
        });
        return groups;
    }, [sortedItems]);

    // Group by priority for list view
    const groupedByPriority = useMemo(() => {
        const groups: Record<string, ActionPlanItem[]> = {};
        PRIORITIES.forEach(pri => {
            const priItems = sortedItems.filter(i => i.priority === pri);
            if (priItems.length > 0) groups[pri] = priItems;
        });
        return groups;
    }, [sortedItems]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gradient-border">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Plano de Ação</h1>
                <p className="text-gray-500 mt-2">
                    Transforme seus objetivos estratégicos em ações concretas, priorizadas e com resultados mensuráveis.
                </p>
            </header>

            {/* Progress Dashboard */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Painel de Progresso</h2>
                    <span className="text-2xl font-extrabold text-brand-orange">{stats.progressPercent.toFixed(0).replace('.', ',')}%</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                    <div className="flex h-full">
                        <div className="bg-green-500 transition-all duration-500" style={{ width: `${stats.total > 0 ? (stats.concluidas / stats.total) * 100 : 0}%` }} />
                        <div className="bg-blue-400 transition-all duration-500" style={{ width: `${stats.total > 0 ? (stats.emAndamento / stats.total) * 100 : 0}%` }} />
                        <div className="bg-red-400 transition-all duration-500" style={{ width: `${stats.total > 0 ? (stats.atrasadas / stats.total) * 100 : 0}%` }} />
                    </div>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border text-center">
                        <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500 font-medium">Total</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                        <p className="text-2xl font-extrabold text-red-600">{stats.alta}</p>
                        <p className="text-xs text-red-600 font-medium">Prioridade Alta</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border text-center">
                        <p className="text-2xl font-extrabold text-gray-500">{stats.naoIniciadas}</p>
                        <p className="text-xs text-gray-500 font-medium">Não Iniciadas</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                        <p className="text-2xl font-extrabold text-blue-600">{stats.emAndamento}</p>
                        <p className="text-xs text-blue-600 font-medium">Em Andamento</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-center">
                        <p className="text-2xl font-extrabold text-green-600">{stats.concluidas}</p>
                        <p className="text-xs text-green-600 font-medium">Concluídas</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                        <p className="text-2xl font-extrabold text-red-500">{stats.atrasadas}</p>
                        <p className="text-xs text-red-500 font-medium">Atrasadas</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                        <p className="text-lg font-extrabold text-emerald-700">{formatCurrency(stats.investimentoTotal, true)}</p>
                        <p className="text-xs text-emerald-600 font-medium">Investimento Total</p>
                    </div>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Categoria:</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                            className="text-sm border border-gray-200 rounded-lg p-1.5 focus:ring-brand-orange focus:border-brand-orange">
                            <option value="Todas">Todas</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{categoryConfig[c].icon} {c}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Prioridade:</label>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                            className="text-sm border border-gray-200 rounded-lg p-1.5 focus:ring-brand-orange focus:border-brand-orange">
                            <option value="Todas">Todas</option>
                            {PRIORITIES.map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Status:</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ActionPlanStatus | 'Todas')}
                            className="text-sm border border-gray-200 rounded-lg p-1.5 focus:ring-brand-orange focus:border-brand-orange">
                            <option value="Todas">Todos</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                        <button onClick={() => setViewMode('board')}
                            className={clsx("text-xs font-medium px-3 py-1.5 rounded-md transition-colors", viewMode === 'board' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>
                            Por Categoria
                        </button>
                        <button onClick={() => setViewMode('list')}
                            className={clsx("text-xs font-medium px-3 py-1.5 rounded-md transition-colors", viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500')}>
                            Por Prioridade
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            {viewMode === 'board' ? (
                // Board View - Grouped by Category
                <div className="space-y-6">
                    {Object.keys(groupedByCategory).length === 0 && (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-400 text-lg">Nenhuma ação encontrada com os filtros selecionados.</p>
                            <p className="text-gray-400 text-sm mt-1">Adicione ações ou ajuste os filtros.</p>
                        </div>
                    )}
                    {Object.entries(groupedByCategory).map(([category, catItems]) => {
                        const cat = categoryConfig[category as ActionPlanCategory];
                        const catConcluidas = catItems.filter(i => i.status === 'Concluído').length;
                        return (
                            <div key={category}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={clsx("text-sm font-bold px-3 py-1 rounded-full border", cat.bg, cat.color, cat.border)}>
                                        {cat.icon} {category}
                                    </span>
                                    <span className="text-xs text-gray-400">{catItems.length} {catItems.length === 1 ? 'ação' : 'ações'}</span>
                                    <span className="text-xs text-green-500">{catConcluidas} concluída{catConcluidas !== 1 ? 's' : ''}</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                                <div className="space-y-3">
                                    {catItems.map(item => (
                                        <ActionCard
                                            key={item.id}
                                            item={item}
                                            updateItem={updateActionPlanItem}
                                            removeItem={removeActionPlanItem}
                                            isExpanded={expandedId === item.id}
                                            toggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // List View - Grouped by Priority
                <div className="space-y-6">
                    {Object.keys(groupedByPriority).length === 0 && (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-400 text-lg">Nenhuma ação encontrada com os filtros selecionados.</p>
                        </div>
                    )}
                    {Object.entries(groupedByPriority).map(([priority, priItems]) => {
                        const pri = priorityConfig[priority as ActionPlanPriority];
                        return (
                            <div key={priority}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={clsx("text-sm font-bold px-3 py-1 rounded-full border", pri.bg, pri.color, pri.border)}>
                                        {pri.label} — Fazer {priority === 'Alta' ? 'PRIMEIRO' : priority === 'Média' ? 'em seguida' : 'quando possível'}
                                    </span>
                                    <span className="text-xs text-gray-400">{priItems.length} {priItems.length === 1 ? 'ação' : 'ações'}</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                                <div className="space-y-3">
                                    {priItems.map(item => (
                                        <ActionCard
                                            key={item.id}
                                            item={item}
                                            updateItem={updateActionPlanItem}
                                            removeItem={removeActionPlanItem}
                                            isExpanded={expandedId === item.id}
                                            toggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Action Button */}
            <div className="flex justify-center">
                <button onClick={addActionPlanItem}
                    className="bg-brand-orange text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Adicionar Nova Ação
                </button>
            </div>

            {/* Help Box */}
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">Como usar o Plano de Ação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                    <div>
                        <p className="font-bold mb-1">1. Priorize</p>
                        <p>Comece pelas ações de prioridade <strong>Alta</strong> (borda vermelha). Sao as que trazem mais resultado no menor tempo.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">2. Execute</p>
                        <p>Defina responsável, prazo e resultado esperado. Mude o status conforme avança. Use a visão "Por Prioridade" para saber o que fazer primeiro.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">3. Acompanhe</p>
                        <p>Use o painel de progresso para monitorar. Ações atrasadas aparecem em vermelho. O objetivo é chegar a 100% de conclusão.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionPlan;
