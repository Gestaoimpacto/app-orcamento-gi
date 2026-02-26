
export const formatCurrency = (value: number | undefined | null, compact = false) => {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    
    if (compact) {
        if (Math.abs(value) >= 1_000_000) {
            return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
        }
        if (Math.abs(value) >= 1_000) {
            return `R$ ${(value / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}k`;
        }
    }
    
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatPercentage = (value: number | undefined | null, decimals = 1) => {
    if (value === undefined || value === null || isNaN(value)) return '0,0%';
    return `${value.toFixed(decimals).replace('.', ',')}%`;
};

export const formatNumber = (value: number | undefined | null, compact = false) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    
     if (compact) {
        if (Math.abs(value) >= 1_000_000) {
            return `${(value / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
        }
        if (Math.abs(value) >= 1_000) {
            return `${(value / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}k`;
        }
    }
    
    // Forces thousand separators for pt-BR
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value);
}
