
import React from 'react';
import { MonthlyData, Month, MONTHS, MONTH_LABELS, CommercialData2025, PeopleData2025 } from '../../types';

interface MonthlyDataTableProps {
  title: string;
  data: CommercialData2025 | PeopleData2025;
  labels: { [key: string]: string };
  category: 'commercial' | 'people';
  onUpdate: (category: 'commercial' | 'people', metric: string, month: Month, value: string) => void;
}

const MonthlyDataTable: React.FC<MonthlyDataTableProps> = ({ title, data, labels, category, onUpdate }) => {
  const metrics = Object.keys(labels);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              {title}
            </th>
            {MONTHS.map((month) => (
              <th key={month} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {MONTH_LABELS[month]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric) => (
            <tr key={metric}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 bg-white z-10">
                {labels[metric]}
              </td>
              {MONTHS.map((month) => (
                <td key={month} className="whitespace-nowrap">
                  <input
                    type="number"
                    step="any"
                    className="w-32 p-2 text-right border-none focus:ring-2 focus:ring-brand-orange focus:ring-inset"
                    placeholder="0"
                    value={data[metric]?.[month] ?? ''}
                    onChange={(e) => onUpdate(category, metric, month, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyDataTable;