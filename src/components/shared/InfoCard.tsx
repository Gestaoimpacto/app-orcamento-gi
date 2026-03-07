
import React from 'react';

interface InfoCardProps {
    title: string;
    value: string;
    subtitle?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, subtitle }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-brand-dark">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
};

export default InfoCard;