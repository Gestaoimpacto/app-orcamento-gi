
import React from 'react';

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, children }) => {
  return (
    <div className="report-section mb-10">
      <h2 className="text-3xl font-bold text-brand-blue border-b-2 border-brand-orange pb-2 mb-6">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default ReportSection;
